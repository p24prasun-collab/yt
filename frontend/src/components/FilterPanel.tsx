import { useState, useRef, useEffect } from 'react'
import { mockData, platforms, categories, contentTypes, countries, languages, ethnicities } from '../data/mockData'

interface FilterState {
  platform: string[]
  category: string[]
  contentType: string[]
  followers: { min: number; max: number }
  country: string[]
  region: { country: string; region: string }
  city: string
  price: { min: number; max: number }
  gender: 'female' | 'male' | 'other' | ''
  age: { min: number; max: number }
  ethnicity: string[]
  language: string[]
}

interface FilterPanelProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onClearAll: () => void
  isMobile: boolean
  isOpen: boolean
  onClose: () => void
}

const FilterPanel = ({ filters, onFiltersChange, onClearAll, isMobile, isOpen, onClose }: FilterPanelProps) => {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set())
  const [pendingFilters, setPendingFilters] = useState<FilterState>(filters)
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setPendingFilters(filters)
  }, [filters])

  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = 'hidden'
      drawerRef.current?.focus()
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobile, isOpen])

  const toggleSection = (section: string) => {
    const newOpen = new Set(openSections)
    if (newOpen.has(section)) {
      newOpen.delete(section)
    } else {
      newOpen.add(section)
    }
    setOpenSections(newOpen)
  }

  const updatePendingFilter = (key: keyof FilterState, value: any) => {
    setPendingFilters((prev) => ({ ...prev, [key]: value }))
  }

  const saveSection = (key: keyof FilterState) => {
    onFiltersChange(pendingFilters)
    if (isMobile) {
      toggleSection(key as string)
    }
  }

  const clearSection = (key: keyof FilterState, defaultValue: any) => {
    const updated = { ...pendingFilters, [key]: defaultValue }
    setPendingFilters(updated)
    onFiltersChange(updated)
  }

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all filters?')) {
      const defaultFilters: FilterState = {
        platform: [],
        category: [],
        contentType: [],
        followers: { min: 0, max: 1000000 },
        country: [],
        region: { country: '', region: '' },
        city: '',
        price: { min: 50, max: 3000 },
        gender: 'male',
        age: { min: 0, max: 100 },
        ethnicity: [],
        language: [],
      }
      setPendingFilters(defaultFilters)
      onClearAll()
    }
  }

  const FilterSection = ({
    id,
    title,
    children,
    clearValue,
  }: {
    id: string
    title: string
    children: React.ReactNode
    clearValue: any
  }) => {
    const isOpen = openSections.has(id)
    const hasChanges = JSON.stringify(filters[id as keyof FilterState]) !== JSON.stringify(pendingFilters[id as keyof FilterState])

    return (
      <div className="border-b border-border last:border-b-0">
        <button
          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 focus-ring"
          onClick={() => toggleSection(id)}
          aria-expanded={isOpen}
          aria-controls={`section-${id}`}
        >
          <span className="font-semibold text-sm">{title}</span>
          <svg
            className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isOpen && (
          <div id={`section-${id}`} className="p-4 space-y-4">
            {children}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <button
                onClick={() => clearSection(id as keyof FilterState, clearValue)}
                className="px-3 py-1.5 text-sm text-muted hover:text-text transition-colors focus-ring rounded-md"
              >
                Clear
              </button>
              {hasChanges && (
                <button
                  onClick={() => saveSection(id as keyof FilterState)}
                  className="px-4 py-1.5 text-sm font-medium text-white bg-accent rounded-md hover:bg-accent/90 transition-colors focus-ring"
                >
                  Save
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  const ChipGroup = ({
    options,
    selected,
    onChange,
    multiSelect = true,
  }: {
    options: string[]
    selected: string[]
    onChange: (value: string[]) => void
    multiSelect?: boolean
  }) => {
    const toggleOption = (option: string) => {
      if (multiSelect) {
        onChange(
          selected.includes(option)
            ? selected.filter((o) => o !== option)
            : [...selected, option]
        )
      } else {
        onChange([option])
      }
    }

    return (
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selected.includes(option)
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggleOption(option)}
              aria-pressed={isSelected}
              className={`px-3 py-1.5 text-sm rounded-full border transition-all focus-ring ${
                isSelected
                  ? 'bg-accent text-white border-accent'
                  : 'bg-white text-text border-border hover:border-accent'
              }`}
            >
              {option}
            </button>
          )
        })}
      </div>
    )
  }

  const RangeSlider = ({
    min,
    max,
    value,
    onChange,
    label,
    format = (v: number) => v.toString(),
  }: {
    min: number
    max: number
    value: { min: number; max: number }
    onChange: (value: { min: number; max: number }) => void
    label: string
    format?: (v: number) => string
  }) => {
    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newMin = Math.min(Number(e.target.value), value.max)
      onChange({ ...value, min: newMin })
    }

    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newMax = Math.max(Number(e.target.value), value.min)
      onChange({ ...value, max: newMax })
    }

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">{label}</span>
          <span className="font-medium">
            {format(value.min)} - {format(value.max)}
          </span>
        </div>
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="number"
              min={min}
              max={max}
              value={value.min}
              onChange={handleMinChange}
              className="w-24 px-2 py-1.5 text-sm border border-border rounded-md focus-ring"
              aria-label={`Min ${label}`}
            />
            <input
              type="number"
              min={min}
              max={max}
              value={value.max}
              onChange={handleMaxChange}
              className="w-24 px-2 py-1.5 text-sm border border-border rounded-md focus-ring"
              aria-label={`Max ${label}`}
            />
          </div>
          <div className="relative h-2 bg-gray-200 rounded-full">
            <input
              type="range"
              min={min}
              max={max}
              value={value.min}
              onChange={handleMinChange}
              className="absolute w-full h-2 opacity-0 cursor-pointer z-10"
              aria-label={`Min ${label} slider`}
            />
            <input
              type="range"
              min={min}
              max={max}
              value={value.max}
              onChange={handleMaxChange}
              className="absolute w-full h-2 opacity-0 cursor-pointer z-10"
              aria-label={`Max ${label} slider`}
            />
            <div
              className="absolute h-2 bg-accent rounded-full"
              style={{
                left: `${((value.min - min) / (max - min)) * 100}%`,
                width: `${((value.max - value.min) / (max - min)) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  const content = (
    <div className={`bg-white ${isMobile ? 'h-full overflow-y-auto' : 'sticky top-16'}`}>
      <div className={`p-4 border-b border-border ${isMobile ? 'sticky top-0 bg-white z-10' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Filters</h2>
          {isMobile && (
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-gray-100 focus-ring"
              aria-label="Close filters"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <button
          onClick={handleClearAll}
          className="text-sm text-muted hover:text-text transition-colors focus-ring"
        >
          Clear All
        </button>
      </div>

      <div className="divide-y divide-border">
        <FilterSection
          id="platform"
          title="Platform"
          clearValue={[]}
        >
          <ChipGroup
            options={platforms}
            selected={pendingFilters.platform}
            onChange={(value) => updatePendingFilter('platform', value)}
          />
        </FilterSection>

        <FilterSection
          id="category"
          title="Category"
          clearValue={[]}
        >
          <ChipGroup
            options={categories}
            selected={pendingFilters.category}
            onChange={(value) => updatePendingFilter('category', value)}
          />
        </FilterSection>

        <FilterSection
          id="contentType"
          title="Content Type"
          clearValue={[]}
        >
          <div className="grid grid-cols-2 gap-2">
            {contentTypes.map((type) => (
              <label key={type} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pendingFilters.contentType.includes(type)}
                  onChange={(e) => {
                    const newValue = e.target.checked
                      ? [...pendingFilters.contentType, type]
                      : pendingFilters.contentType.filter((t) => t !== type)
                    updatePendingFilter('contentType', newValue)
                  }}
                  className="w-4 h-4 text-accent border-border rounded focus-ring"
                />
                <span className="text-sm">{type}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        <FilterSection
          id="followers"
          title="Followers"
          clearValue={{ min: 0, max: 1000000 }}
        >
          <RangeSlider
            min={0}
            max={10000000}
            value={pendingFilters.followers}
            onChange={(value) => updatePendingFilter('followers', value)}
            label="Followers"
            format={(v) => {
              if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M+`
              if (v >= 1000) return `${(v / 1000).toFixed(1)}k`
              return v.toString()
            }}
          />
        </FilterSection>

        <FilterSection
          id="location"
          title="Location"
          clearValue={{ country: [], region: { country: '', region: '' }, city: '' }}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Country</label>
              <select
                multiple
                value={pendingFilters.country}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, (option) => option.value)
                  updatePendingFilter('country', selected)
                }}
                className="w-full px-3 py-2 text-sm border border-border rounded-md focus-ring"
                size={5}
              >
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">City</label>
              <input
                type="text"
                value={pendingFilters.city}
                onChange={(e) => updatePendingFilter('city', e.target.value)}
                placeholder="Enter city name"
                className="w-full px-3 py-2 text-sm border border-border rounded-md focus-ring"
              />
            </div>
          </div>
        </FilterSection>

        <FilterSection
          id="price"
          title="Price"
          clearValue={{ min: 50, max: 3000 }}
        >
          <RangeSlider
            min={0}
            max={5000}
            value={pendingFilters.price}
            onChange={(value) => updatePendingFilter('price', value)}
            label="Price (USD)"
            format={(v) => `$${v}`}
          />
        </FilterSection>

        <FilterSection
          id="gender"
          title="Gender"
          clearValue="male"
        >
          <div className="space-y-2">
            {(['female', 'male', 'other'] as const).map((gender) => (
              <label key={gender} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value={gender}
                  checked={pendingFilters.gender === gender}
                  onChange={(e) => updatePendingFilter('gender', e.target.value)}
                  className="w-4 h-4 text-accent border-border focus-ring"
                />
                <span className="text-sm capitalize">{gender}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        <FilterSection
          id="age"
          title="Age"
          clearValue={{ min: 0, max: 100 }}
        >
          <RangeSlider
            min={0}
            max={100}
            value={pendingFilters.age}
            onChange={(value) => updatePendingFilter('age', value)}
            label="Age"
          />
        </FilterSection>

        <FilterSection
          id="ethnicity"
          title="Ethnicity (Premium)"
          clearValue={[]}
        >
          <div className="mb-2">
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Premium</span>
          </div>
          <div className="space-y-2">
            {ethnicities.map((ethnicity) => (
              <label key={ethnicity} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pendingFilters.ethnicity.includes(ethnicity)}
                  onChange={(e) => {
                    const newValue = e.target.checked
                      ? [...pendingFilters.ethnicity, ethnicity]
                      : pendingFilters.ethnicity.filter((e) => e !== ethnicity)
                    updatePendingFilter('ethnicity', newValue)
                  }}
                  className="w-4 h-4 text-accent border-border rounded focus-ring"
                />
                <span className="text-sm">{ethnicity}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        <FilterSection
          id="language"
          title="Language (Premium)"
          clearValue={[]}
        >
          <div className="mb-2">
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Premium</span>
          </div>
          <select
            multiple
            value={pendingFilters.language}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, (option) => option.value)
              updatePendingFilter('language', selected)
            }}
            className="w-full px-3 py-2 text-sm border border-border rounded-md focus-ring"
            size={5}
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </FilterSection>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <>
        <div
          className={`fixed inset-0 bg-black/50 z-40 transition-opacity ${
            isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={onClose}
          aria-hidden="true"
        />
        <div
          ref={drawerRef}
          className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 transform transition-transform duration-300 ease-out shadow-xl ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Filters"
        >
          {content}
        </div>
      </>
    )
  }

  return (
    <div className="w-80 border-r border-border bg-white">
      {content}
    </div>
  )
}

export default FilterPanel

