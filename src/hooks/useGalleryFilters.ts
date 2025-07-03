'use client'

import { useState, useEffect, useCallback } from 'react'

// R37.4: Gallery filter persistence interface
export interface GalleryFilters {
  filter: string
  sort: string
  search: string
  mediaType: string
  viewMode: 'grid' | 'list'
}

const DEFAULT_FILTERS: GalleryFilters = {
  filter: 'all',
  sort: 'recent',
  search: '',
  mediaType: 'all',
  viewMode: 'grid'
}

const STORAGE_KEY = 'pulsar-gallery-filters'

/**
 * R37.4: Custom hook for persistent gallery filters
 * Manages filter state with localStorage persistence across sessions
 */
export function useGalleryFilters() {
  const [filters, setFilters] = useState<GalleryFilters>(DEFAULT_FILTERS)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load filters from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsedFilters = JSON.parse(stored)
        // Validate and merge with defaults to handle new filter options
        const validatedFilters = {
          ...DEFAULT_FILTERS,
          ...parsedFilters,
          // Reset search on load to avoid confusion
          search: ''
        }
        setFilters(validatedFilters)
      }
    } catch (error) {
      console.warn('Failed to load gallery filters from localStorage:', error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Save filters to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filters))
      } catch (error) {
        console.warn('Failed to save gallery filters to localStorage:', error)
      }
    }
  }, [filters, isLoaded])

  // Update individual filter values
  const updateFilter = useCallback((key: keyof GalleryFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }, [])

  // Update multiple filters at once
  const updateFilters = useCallback((updates: Partial<GalleryFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...updates
    }))
  }, [])

  // Reset filters to defaults
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
  }, [])

  // Reset only search while keeping other filters
  const clearSearch = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      search: ''
    }))
  }, [])

  // Get URL search params for API calls
  const getApiParams = useCallback(() => {
    const params = new URLSearchParams()
    
    if (filters.filter !== 'all') {
      params.set('filter', filters.filter)
    }
    if (filters.sort !== 'recent') {
      params.set('sort', filters.sort)
    }
    if (filters.search.trim()) {
      params.set('search', filters.search.trim())
    }
    if (filters.mediaType !== 'all') {
      params.set('mediaType', filters.mediaType)
    }
    
    return params
  }, [filters])

  // Check if any non-default filters are applied
  const hasActiveFilters = useCallback(() => {
    return (
      filters.filter !== DEFAULT_FILTERS.filter ||
      filters.sort !== DEFAULT_FILTERS.sort ||
      filters.search.trim() !== '' ||
      filters.mediaType !== DEFAULT_FILTERS.mediaType
    )
  }, [filters])

  // Get filter summary for display
  const getFilterSummary = useCallback(() => {
    const active = []
    
    if (filters.filter !== 'all') {
      active.push(`Type: ${filters.filter}`)
    }
    if (filters.mediaType !== 'all') {
      active.push(`Media: ${filters.mediaType}`)
    }
    if (filters.sort !== 'recent') {
      active.push(`Sort: ${filters.sort}`)
    }
    if (filters.search.trim()) {
      active.push(`Search: "${filters.search.trim()}"`)
    }
    
    return active.length > 0 ? active.join(', ') : 'No filters applied'
  }, [filters])

  return {
    filters,
    isLoaded,
    updateFilter,
    updateFilters,
    resetFilters,
    clearSearch,
    getApiParams,
    hasActiveFilters: hasActiveFilters(),
    filterSummary: getFilterSummary()
  }
}

// R37: Filter validation utilities
export const AVAILABLE_FILTERS = {
  contentTypes: [
    { value: 'all', label: 'All Types' },
    { value: 'ai_artwork', label: 'AI Artwork' },
    { value: 'ai_song', label: 'AI Songs' },
    { value: 'upload_artwork', label: 'Uploaded Art' },
    { value: 'upload_reel', label: 'Uploaded Reels' }
  ],
  mediaTypes: [
    { value: 'all', label: 'All Media' },
    { value: 'audio', label: 'Audio Only' },
    { value: 'video', label: 'Video Only' },
    { value: 'image', label: 'Images Only' }
  ],
  sortOptions: [
    { value: 'recent', label: 'Most Recent' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'trending', label: 'Trending' },
    { value: 'random', label: 'Random' }
  ]
}
