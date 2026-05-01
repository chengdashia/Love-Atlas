import type { City, Trip, Memory, Anniversary, Tag, TrashItem, ContentStatus, PaginatedResponse } from '@/types'
import { mockCities } from './cities'
import { mockTrips } from './trips'
import { mockMemories } from './memories'
import { mockAnniversaries } from './anniversaries'
import { mockTags } from './tags'
import { mockUsers, mockCouple } from './users'

function delay(ms = 100) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function generateId() {
  return Math.random().toString(36).substring(2, 11)
}

const trash: TrashItem[] = []

// ====== City Service ======
export const cityService = {
  async list(params?: { status?: ContentStatus; search?: string }): Promise<PaginatedResponse<City>> {
    await delay()
    let data = mockCities.filter(c => !c.deletedAt)
    if (params?.status) data = data.filter(c => c.status === params.status)
    if (params?.search) data = data.filter(c => c.name.includes(params.search!) || c.country.includes(params.search!))
    return { data, total: data.length, page: 1, pageSize: 50 }
  },
  async getById(id: string): Promise<City | null> {
    await delay()
    return mockCities.find(c => c.id === id) || null
  },
  async create(data: Partial<City>): Promise<City> {
    await delay()
    const city: City = {
      id: `city-${generateId()}`, name: data.name || '', country: data.country || '',
      latitude: data.latitude || 0, longitude: data.longitude || 0,
      coverImage: data.coverImage, description: data.description,
      status: data.status || 'draft', visibility: data.visibility || 'private',
      isPinned: false, sortOrder: mockCities.length + 1, visitCount: 0, memoryCount: 0,
      tags: data.tags || [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    }
    mockCities.push(city)
    return city
  },
  async update(id: string, data: Partial<City>): Promise<City> {
    await delay()
    const idx = mockCities.findIndex(c => c.id === id)
    if (idx === -1) throw new Error('City not found')
    Object.assign(mockCities[idx], data, { updatedAt: new Date().toISOString() })
    return mockCities[idx]
  },
  async delete(id: string): Promise<void> {
    await delay()
    const city = mockCities.find(c => c.id === id)
    if (city) {
      city.deletedAt = new Date().toISOString()
      trash.push({ id: `trash-${generateId()}`, entityType: 'city', entityId: id, entityTitle: city.name, deletedAt: city.deletedAt })
    }
  },
  async restore(id: string): Promise<City> {
    await delay()
    const city = mockCities.find(c => c.id === id)
    if (city) { city.deletedAt = undefined }
    const trashIdx = trash.findIndex(t => t.entityId === id)
    if (trashIdx !== -1) trash.splice(trashIdx, 1)
    return city!
  },
}

// ====== Trip Service ======
export const tripService = {
  async list(params?: { status?: ContentStatus }): Promise<PaginatedResponse<Trip>> {
    await delay()
    let data = mockTrips.filter(t => !t.deletedAt)
    if (params?.status) data = data.filter(t => t.status === params.status)
    return { data, total: data.length, page: 1, pageSize: 50 }
  },
  async getById(id: string): Promise<Trip | null> {
    await delay()
    return mockTrips.find(t => t.id === id) || null
  },
  async create(data: Partial<Trip>): Promise<Trip> {
    await delay()
    const trip: Trip = {
      id: `trip-${generateId()}`, title: data.title || '', description: data.description,
      coverImage: data.coverImage, cities: data.cities || [], startDate: data.startDate || '', endDate: data.endDate || '',
      status: data.status || 'draft', visibility: data.visibility || 'private',
      isPinned: false, sortOrder: mockTrips.length + 1, visitCount: 0, memoryCount: 0,
      tags: data.tags || [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    }
    mockTrips.push(trip)
    return trip
  },
  async update(id: string, data: Partial<Trip>): Promise<Trip> {
    await delay()
    const idx = mockTrips.findIndex(t => t.id === id)
    if (idx === -1) throw new Error('Trip not found')
    Object.assign(mockTrips[idx], data, { updatedAt: new Date().toISOString() })
    return mockTrips[idx]
  },
  async delete(id: string): Promise<void> {
    await delay()
    const trip = mockTrips.find(t => t.id === id)
    if (trip) {
      trip.deletedAt = new Date().toISOString()
      trash.push({ id: `trash-${generateId()}`, entityType: 'trip', entityId: id, entityTitle: trip.title, deletedAt: trip.deletedAt })
    }
  },
  async restore(id: string): Promise<Trip> {
    await delay()
    const trip = mockTrips.find(t => t.id === id)
    if (trip) { trip.deletedAt = undefined }
    const trashIdx = trash.findIndex(t => t.entityId === id && t.entityType === 'trip')
    if (trashIdx !== -1) trash.splice(trashIdx, 1)
    return trip!
  },
}

// ====== Memory Service ======
export const memoryService = {
  async list(params?: { status?: ContentStatus; cityId?: string; tripId?: string }): Promise<PaginatedResponse<Memory>> {
    await delay()
    let data = mockMemories.filter(m => !m.deletedAt)
    if (params?.status) data = data.filter(m => m.status === params.status)
    if (params?.cityId) data = data.filter(m => m.cityId === params.cityId)
    if (params?.tripId) data = data.filter(m => m.tripId === params.tripId)
    return { data, total: data.length, page: 1, pageSize: 50 }
  },
  async getById(id: string): Promise<Memory | null> {
    await delay()
    return mockMemories.find(m => m.id === id) || null
  },
  async create(data: Partial<Memory>): Promise<Memory> {
    await delay()
    const memory: Memory = {
      id: `memory-${generateId()}`, title: data.title || '', summary: data.summary,
      coverImage: data.coverImage, cityId: data.cityId || '', cityName: data.cityName,
      tripId: data.tripId, tripTitle: data.tripTitle, theme: data.theme || 'romantic_dreamy',
      blocks: data.blocks || [], status: data.status || 'draft', visibility: data.visibility || 'private',
      isPinned: false, sortOrder: mockMemories.length + 1, visitCount: 0,
      tags: data.tags || [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    }
    mockMemories.push(memory)
    return memory
  },
  async update(id: string, data: Partial<Memory>): Promise<Memory> {
    await delay()
    const idx = mockMemories.findIndex(m => m.id === id)
    if (idx === -1) throw new Error('Memory not found')
    Object.assign(mockMemories[idx], data, { updatedAt: new Date().toISOString() })
    return mockMemories[idx]
  },
  async delete(id: string): Promise<void> {
    await delay()
    const memory = mockMemories.find(m => m.id === id)
    if (memory) {
      memory.deletedAt = new Date().toISOString()
      trash.push({ id: `trash-${generateId()}`, entityType: 'memory', entityId: id, entityTitle: memory.title, deletedAt: memory.deletedAt })
    }
  },
  async restore(id: string): Promise<Memory> {
    await delay()
    const memory = mockMemories.find(m => m.id === id)
    if (memory) { memory.deletedAt = undefined }
    const trashIdx = trash.findIndex(t => t.entityId === id && t.entityType === 'memory')
    if (trashIdx !== -1) trash.splice(trashIdx, 1)
    return memory!
  },
}

// ====== Anniversary Service ======
export const anniversaryService = {
  async list(params?: { status?: ContentStatus }): Promise<PaginatedResponse<Anniversary>> {
    await delay()
    let data = mockAnniversaries.filter(a => !a.deletedAt)
    if (params?.status) data = data.filter(a => a.status === params.status)
    return { data, total: data.length, page: 1, pageSize: 50 }
  },
  async getById(id: string): Promise<Anniversary | null> {
    await delay()
    return mockAnniversaries.find(a => a.id === id) || null
  },
  async create(data: Partial<Anniversary>): Promise<Anniversary> {
    await delay()
    const anniversary: Anniversary = {
      id: `anniversary-${generateId()}`, title: data.title || '', date: data.date || '',
      type: data.type || 'custom', description: data.description, coverImage: data.coverImage,
      linkedCityId: data.linkedCityId, linkedTripId: data.linkedTripId, linkedMemoryId: data.linkedMemoryId,
      status: data.status || 'draft', visibility: data.visibility || 'private',
      sortOrder: mockAnniversaries.length + 1, isRecurring: data.isRecurring || false,
      tags: data.tags || [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    }
    mockAnniversaries.push(anniversary)
    return anniversary
  },
  async update(id: string, data: Partial<Anniversary>): Promise<Anniversary> {
    await delay()
    const idx = mockAnniversaries.findIndex(a => a.id === id)
    if (idx === -1) throw new Error('Anniversary not found')
    Object.assign(mockAnniversaries[idx], data, { updatedAt: new Date().toISOString() })
    return mockAnniversaries[idx]
  },
  async delete(id: string): Promise<void> {
    await delay()
    const anniversary = mockAnniversaries.find(a => a.id === id)
    if (anniversary) {
      anniversary.deletedAt = new Date().toISOString()
      trash.push({ id: `trash-${generateId()}`, entityType: 'anniversary', entityId: id, entityTitle: anniversary.title, deletedAt: anniversary.deletedAt })
    }
  },
  async restore(id: string): Promise<Anniversary> {
    await delay()
    const anniversary = mockAnniversaries.find(a => a.id === id)
    if (anniversary) { anniversary.deletedAt = undefined }
    const trashIdx = trash.findIndex(t => t.entityId === id && t.entityType === 'anniversary')
    if (trashIdx !== -1) trash.splice(trashIdx, 1)
    return anniversary!
  },
}

// ====== Tag Service ======
export const tagService = {
  async list(): Promise<Tag[]> {
    await delay()
    return mockTags
  },
  async create(data: Partial<Tag>): Promise<Tag> {
    await delay()
    const tag: Tag = { id: `tag-${generateId()}`, name: data.name || '', color: data.color, usageCount: 0 }
    mockTags.push(tag)
    return tag
  },
  async delete(id: string): Promise<void> {
    await delay()
    const idx = mockTags.findIndex(t => t.id === id)
    if (idx !== -1) mockTags.splice(idx, 1)
  },
}

// ====== Trash Service ======
export const trashService = {
  async list(): Promise<TrashItem[]> {
    await delay()
    return trash
  },
  async restore(id: string): Promise<void> {
    await delay()
    const idx = trash.findIndex(t => t.id === id)
    if (idx !== -1) {
      const item = trash[idx]
      if (item.entityType === 'city') await cityService.restore(item.entityId)
      else if (item.entityType === 'trip') await tripService.restore(item.entityId)
      else if (item.entityType === 'memory') await memoryService.restore(item.entityId)
      else if (item.entityType === 'anniversary') await anniversaryService.restore(item.entityId)
      trash.splice(idx, 1)
    }
  },
  async permanentlyDelete(id: string): Promise<void> {
    await delay()
    const idx = trash.findIndex(t => t.id === id)
    if (idx !== -1) trash.splice(idx, 1)
  },
}

// ====== Auth Service ======
export const authService = {
  async login(email: string, _password: string) {
    await delay(300)
    const user = mockUsers.find(u => u.email === email) || mockUsers[0]
    return { user, couple: mockCouple, token: 'mock-jwt-token-' + Date.now() }
  },
  async register(email: string, _password: string, nickname: string) {
    await delay(300)
    return { user: { ...mockUsers[0], email, nickname }, couple: mockCouple, token: 'mock-jwt-token-' + Date.now() }
  },
}

// ====== Stats Service ======
export const statsService = {
  async getStats() {
    await delay()
    const { mockStats } = await import('./stats')
    return mockStats
  },
  async recordView(_entityType: string, _entityId: string) {
    await delay()
  },
}
