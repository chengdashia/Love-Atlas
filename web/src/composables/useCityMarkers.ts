import { watch, type Ref, shallowRef } from 'vue'
import type { City } from '@/types'

export function useCityMarkers(
  viewer: Ref<any>,
  Cesium: Ref<any>,
  cities: Ref<City[]>,
  onCityClick?: (city: City) => void
) {
  const entities = shallowRef<any[]>([])
  let clickHandler: any = null

  function addMarkers() {
    if (!viewer.value || !Cesium.value) return
    const v = viewer.value
    const C = Cesium.value

    removeMarkers()
    const newEntities: any[] = []

    cities.value.forEach(city => {
      if (city.deletedAt || city.status !== 'published') return

      const position = C.Cartesian3.fromDegrees(city.longitude, city.latitude, 0)

      // Glow point (larger, semi-transparent)
      const glowEntity = v.entities.add({
        position,
        point: {
          pixelSize: 24,
          color: C.Color.fromCssColorString('#e8507c').withAlpha(0.35),
          outlineColor: C.Color.fromCssColorString('#ff8fab').withAlpha(0.5),
          outlineWidth: 2,
        },
        city,
      })
      newEntities.push(glowEntity)

      // Main point with label
      const mainEntity = v.entities.add({
        position,
        point: {
          pixelSize: 10,
          color: C.Color.fromCssColorString('#e8507c'),
          outlineColor: C.Color.WHITE,
          outlineWidth: 2,
        },
        label: {
          text: city.name,
          font: 'bold 14px "LXGW WenKai", sans-serif',
          fillColor: C.Color.WHITE,
          outlineColor: C.Color.fromCssColorString('#e8507c'),
          outlineWidth: 3,
          style: C.LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new C.Cartesian2(0, -24),
          showBackground: true,
          backgroundColor: C.Color.fromCssColorString('#1a0a10').withAlpha(0.7),
          backgroundPadding: new C.Cartesian2(8, 4),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          scale: 1.0,
        },
        city,
      })
      newEntities.push(mainEntity)
    })

    entities.value = newEntities

    // Click handler: use coordinate-based detection for reliability
    if (onCityClick) {
      if (clickHandler) {
        clickHandler.destroy()
        clickHandler = null
      }
      clickHandler = new C.ScreenSpaceEventHandler(v.scene.canvas)
      clickHandler.setInputAction((movement: any) => {
        // Try standard pick first
        const picked = v.scene.pick(movement.position)
        if (C.defined(picked) && picked.id?.city) {
          onCityClick(picked.id.city)
          return
        }

        // Fallback: drill pick
        try {
          const pickedList = v.scene.drillPick(movement.position)
          for (let i = 0; i < pickedList.length; i++) {
            if (pickedList[i].id?.city) {
              onCityClick(pickedList[i].id.city)
              return
            }
          }
        } catch (e) { /* ignore drillPick errors */ }

        // Fallback: convert click to world coordinates and find nearest city
        try {
          const ray = v.camera.getPickRay(movement.position)
          if (!ray) return
          const globePos = v.scene.globe.pick(ray, v.scene)
          if (!globePos) return

          const clickCarto = C.Ellipsoid.WGS84.cartesianToCartographic(globePos)
          const clickLat = C.Math.toDegrees(clickCarto.latitude)
          const clickLng = C.Math.toDegrees(clickCarto.longitude)

          let nearestCity: City | null = null
          let minDist = Infinity
          const publishedCities = cities.value.filter(c => !c.deletedAt && c.status === 'published')

          for (const city of publishedCities) {
            const dLat = clickLat - city.latitude
            const dLng = clickLng - city.longitude
            const dist = Math.sqrt(dLat * dLat + dLng * dLng)
            // Dynamic threshold based on camera altitude
            const cameraHeight = C.Ellipsoid.WGS84.cartesianToCartographic(v.camera.position).height
            const threshold = Math.max(2, cameraHeight / 500000)
            if (dist < threshold && dist < minDist) {
              minDist = dist
              nearestCity = city
            }
          }

          if (nearestCity) {
            onCityClick(nearestCity)
          }
        } catch (e) { /* ignore pick errors */ }
      }, C.ScreenSpaceEventType.LEFT_CLICK)
    }
  }

  function removeMarkers() {
    if (!viewer.value) return
    entities.value.forEach(e => {
      try { viewer.value.entities.remove(e) } catch {}
    })
    entities.value = []
  }

  // Watch for cities loading
  watch(
    () => cities.value.length,
    () => { addMarkers() },
    { immediate: true }
  )

  // Watch for viewer becoming ready
  watch(viewer, (v) => {
    if (v && cities.value.length > 0) addMarkers()
  })

  return { addMarkers, removeMarkers }
}
