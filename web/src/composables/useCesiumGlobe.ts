import { shallowRef, ref, onMounted, onUnmounted, type Ref } from 'vue'

export interface GlobeOptions {
  lowPerformance?: boolean
  showLabels?: boolean
}

export function useCesiumGlobe(containerRef: Ref<HTMLElement | null>, options?: GlobeOptions) {
  const viewer = shallowRef<any>(null)
  const isReady = ref(false)
  const CesiumRef = shallowRef<any>(null)

  async function init() {
    if (!containerRef.value) return

    const Cesium = await import('cesium')
    CesiumRef.value = Cesium

    // Set base URL for Cesium assets
    ;(window as any).CESIUM_BASE_URL = '/cesium/'

    // Use Natural Earth II for a beautiful globe look at global scale
    const creditContainer = document.createElement('div')
    creditContainer.style.display = 'none'
    const v = new Cesium.Viewer(containerRef.value, {
      baseLayer: new Cesium.ImageryLayer(new Cesium.UrlTemplateImageryProvider({
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        maximumLevel: 18,
        credit: new Cesium.Credit('© Esri, Maxar, Earthstar Geographics'),
      })),
      terrain: undefined,
      animation: false,
      timeline: false,
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      fullscreenButton: false,
      selectionIndicator: false,
      infoBox: false,
      shadows: false,
      shouldAnimate: true,
      creditContainer,
    })

    // Add borders and labels layer on top of imagery
    v.imageryLayers.addImageryProvider(new Cesium.UrlTemplateImageryProvider({
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      maximumLevel: 18,
      credit: new Cesium.Credit(''),
    }))

    // Configure globe appearance
    v.scene.globe.enableLighting = !options?.lowPerformance
    v.scene.fog.enabled = !options?.lowPerformance
    v.scene.skyAtmosphere.show = !options?.lowPerformance
    v.scene.skyBox.show = !options?.lowPerformance

    // Set initial camera position - show full globe centered on Asia
    v.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(105, 20, 20000000),
      orientation: {
        heading: 0,
        pitch: -Math.PI / 2,
        roll: 0,
      },
    })

    viewer.value = v
    isReady.value = true
  }

  function flyToCity(lat: number, lng: number, onComplete?: () => void) {
    if (!viewer.value || !CesiumRef.value) return
    const Cesium = CesiumRef.value

    viewer.value.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(lng, lat, 50000),
      orientation: {
        heading: 0,
        pitch: -Math.PI / 4,
        roll: 0,
      },
      duration: 2,
      complete: () => {
        onComplete?.()
      },
    })
  }

  function fitCities(cities: Array<{ latitude: number; longitude: number }>) {
    if (!viewer.value || !CesiumRef.value || cities.length === 0) return
    const Cesium = CesiumRef.value

    const positions = cities.map(c => Cesium.Cartesian3.fromDegrees(c.longitude, c.latitude))
    const boundingSphere = Cesium.BoundingSphere.fromPoints(positions)

    viewer.value.camera.flyToBoundingSphere(boundingSphere, {
      duration: 1.5,
      offset: new Cesium.HeadingPitchRange(0, -Math.PI / 4, boundingSphere.radius * 2),
    })
  }

  function destroy() {
    if (viewer.value) {
      viewer.value.destroy()
      viewer.value = null
    }
  }

  onMounted(() => init())
  onUnmounted(() => destroy())

  return { viewer, isReady, Cesium: CesiumRef, flyToCity, fitCities }
}
