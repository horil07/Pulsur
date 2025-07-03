'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { GalleryFilters, AVAILABLE_FILTERS } from '@/hooks/useGalleryFilters'

interface AdvancedSearchProps {
  filters: GalleryFilters
  onFiltersChange: (updates: Partial<GalleryFilters>) => void
  onClearSearch: () => void
  onResetFilters: () => void
  hasActiveFilters: boolean
  filterSummary: string
  isLoading?: boolean
}

/**
 * R37.1, R37.2, R37.3: Advanced search and filtering component
 * Provides comprehensive search, content type filtering, media type filtering, and sorting
 */
export function AdvancedSearch({
  filters,
  onFiltersChange,
  onClearSearch,
  onResetFilters,
  hasActiveFilters,
  filterSummary,
  isLoading = false
}: AdvancedSearchProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Auto-expand advanced filters if any non-default filters are applied
  useEffect(() => {
    if (hasActiveFilters && !showAdvanced) {
      setShowAdvanced(true)
    }
  }, [hasActiveFilters, showAdvanced])

  // Debounced search handler
  const handleSearchChange = useCallback((value: string) => {
    onFiltersChange({ search: value })
  }, [onFiltersChange])

  // Quick filter shortcuts
  const quickFilters = [
    { label: 'All', filter: 'all', mediaType: 'all' },
    { label: 'AI Art', filter: 'ai_artwork', mediaType: 'image' },
    { label: 'AI Songs', filter: 'ai_song', mediaType: 'audio' },
    { label: 'Videos', filter: 'upload_reel', mediaType: 'video' },
    { label: 'Uploads', filter: 'upload_artwork', mediaType: 'image' }
  ]

  const handleQuickFilter = (filter: string, mediaType: string) => {
    onFiltersChange({ filter, mediaType })
  }

  return (
    <Card className="glass-panel" style={{ borderColor: 'rgba(239, 68, 68, 0.3)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(239, 68, 68, 0.1)' }}>
      <CardContent className="p-6 space-y-4">
        {/* Main Search Bar */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className={`relative transition-all duration-200 ${searchFocused ? 'transform scale-[1.02]' : ''}`}>
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors ${
                searchFocused ? 'text-red-500' : 'text-white/60'
              }`} />
              <Input
                ref={searchInputRef}
                placeholder="Search by title, description, creator, or prompt..."
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className={`pl-10 pr-10 bg-black/50 border-white/20 text-white placeholder:text-white/60 transition-all duration-200 ${
                  searchFocused ? 'border-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 'focus:border-red-500/50'
                }`}
                disabled={isLoading}
              />
              {filters.search && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-white/10"
                  disabled={isLoading}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <div className="flex gap-2">
            <Button
              variant={showAdvanced ? "default" : "outline"}
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`flex items-center gap-2 transition-all duration-300 ${
                showAdvanced 
                  ? 'bg-gradient-to-r from-red-500 to-blue-500 hover:from-red-600 hover:to-blue-600 text-white border-red-500'
                  : 'bg-black/50 hover:bg-red-500/20 border-white/20 hover:border-red-500/50 text-white'
              }`}
              disabled={isLoading}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1 text-xs bg-red-500 text-white border-red-500">
                  Active
                </Badge>
              )}
            </Button>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={onResetFilters}
                className="text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                disabled={isLoading}
              >
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Quick Filter Chips */}
        <div className="flex flex-wrap gap-2">
          {quickFilters.map((quickFilter) => (
            <Badge
              key={quickFilter.label}
              variant={
                filters.filter === quickFilter.filter && filters.mediaType === quickFilter.mediaType
                  ? "default"
                  : "outline"
              }
              className={`cursor-pointer transition-all hover:scale-105 ${
                filters.filter === quickFilter.filter && filters.mediaType === quickFilter.mediaType
                  ? 'bg-gradient-to-r from-red-500 to-blue-500 text-white border-red-500 shadow-lg'
                  : 'bg-black/30 text-white/80 border-white/20 hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-300'
              }`}
              onClick={() => handleQuickFilter(quickFilter.filter, quickFilter.mediaType)}
            >
              {quickFilter.label}
            </Badge>
          ))}
        </div>

        {/* Advanced Filters Panel */}
        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-white/10">
            {/* Content Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Content Type</label>
              <Select 
                value={filters.filter} 
                onValueChange={(value) => onFiltersChange({ filter: value })}
                disabled={isLoading}
              >
                <SelectTrigger className="bg-black/50 border-white/20 text-white hover:border-red-500/50 focus:border-red-500 transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/20">
                  {AVAILABLE_FILTERS.contentTypes.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-white hover:bg-red-500/20 focus:bg-red-500/20">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Media Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Media Type</label>
              <Select 
                value={filters.mediaType} 
                onValueChange={(value) => onFiltersChange({ mediaType: value })}
                disabled={isLoading}
              >
                <SelectTrigger className="bg-black/50 border-white/20 text-white hover:border-red-500/50 focus:border-red-500 transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/20">
                  {AVAILABLE_FILTERS.mediaTypes.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-white hover:bg-red-500/20 focus:bg-red-500/20">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort Options */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Sort By</label>
              <Select 
                value={filters.sort} 
                onValueChange={(value) => onFiltersChange({ sort: value })}
                disabled={isLoading}
              >
                <SelectTrigger className="bg-black/50 border-white/20 text-white hover:border-red-500/50 focus:border-red-500 transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/20">
                  {AVAILABLE_FILTERS.sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-white hover:bg-red-500/20 focus:bg-red-500/20">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* View Mode */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">View Mode</label>
              <div className="flex border border-white/20 rounded-md bg-black/50">
                <Button
                  variant={filters.viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onFiltersChange({ viewMode: 'grid' })}
                  className={`flex-1 border-0 text-xs transition-all ${
                    filters.viewMode === 'grid' 
                      ? 'bg-gradient-to-r from-red-500 to-blue-500 text-white' 
                      : 'text-white/80 hover:text-white hover:bg-red-500/20'
                  }`}
                  disabled={isLoading}
                >
                  Grid
                </Button>
                <Button
                  variant={filters.viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onFiltersChange({ viewMode: 'list' })}
                  className={`flex-1 border-0 text-xs transition-all ${
                    filters.viewMode === 'list' 
                      ? 'bg-gradient-to-r from-red-500 to-blue-500 text-white' 
                      : 'text-white/80 hover:text-white hover:bg-red-500/20'
                  }`}
                  disabled={isLoading}
                >
                  List
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="text-sm text-white/60">
                <span className="text-red-400">Active filters:</span> {filterSummary}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
