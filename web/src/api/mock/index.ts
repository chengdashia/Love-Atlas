import { mockUsers, mockCouple } from './users'
import { mockCities } from './cities'
import { mockTrips } from './trips'
import { mockMemories } from './memories'
import { mockAnniversaries } from './anniversaries'
import { mockTags } from './tags'
import { mockVisitStats } from './stats'
import { mockShares } from './shares'

export { mockUsers, mockCouple, mockCities, mockTrips, mockMemories, mockAnniversaries, mockTags, mockVisitStats as mockStats, mockShares }

export function getCities() { return mockCities }
export function getCityById(id: string) { return mockCities.find(c => c.id === id) || null }
export function getPublishedCities() { return mockCities.filter(c => c.status === 'published' && !c.deletedAt) }

export function getTrips() { return mockTrips }
export function getTripById(id: string) { return mockTrips.find(t => t.id === id) || null }
export function getPublishedTrips() { return mockTrips.filter(t => t.status === 'published' && !t.deletedAt) }
export function getTripsByCityId(cityId: string) { return mockTrips.filter(t => t.cities.some(c => c.cityId === cityId)) }

export function getMemories() { return mockMemories }
export function getMemoryById(id: string) { return mockMemories.find(m => m.id === id) || null }
export function getMemoriesByCityId(cityId: string) { return mockMemories.filter(m => m.cityId === cityId && !m.deletedAt) }
export function getMemoriesByTripId(tripId: string) { return mockMemories.filter(m => m.tripId === tripId && !m.deletedAt) }
export function getPublishedMemories() { return mockMemories.filter(m => m.status === 'published' && !m.deletedAt) }

export function getAnniversaries() { return mockAnniversaries }
export function getAnniversaryById(id: string) { return mockAnniversaries.find(a => a.id === id) || null }
export function getPublishedAnniversaries() { return mockAnniversaries.filter(a => a.status === 'published' && !a.deletedAt) }

export function getTags() { return mockTags }
export function getTagById(id: string) { return mockTags.find(t => t.id === id) || null }

export function getVisitStats() { return mockVisitStats }

export function getShares() { return mockShares }
export function getShareByToken(token: string) { return mockShares.find(s => s.token === token && s.isActive) || null }

export function searchAll(query: string) {
  const q = query.toLowerCase()
  return {
    cities: mockCities.filter(c => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q)),
    trips: mockTrips.filter(t => t.title.toLowerCase().includes(q)),
    memories: mockMemories.filter(m => m.title.toLowerCase().includes(q)),
    anniversaries: mockAnniversaries.filter(a => a.title.toLowerCase().includes(q)),
  }
}
