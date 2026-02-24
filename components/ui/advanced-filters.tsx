"use client"

import * as React from "react"
import { Search, X, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { MultiSelect, MultiSelectOption } from "@/components/ui/multi-select"
import { Separator } from "@/components/ui/separator"

export interface FilterOption {
  id: string
  label: string
  type: "text" | "select" | "multiselect" | "date" | "number"
  options?: MultiSelectOption[]
  placeholder?: string
}

export interface FilterValue {
  [key: string]: any
}

interface AdvancedFiltersProps {
  filters: FilterOption[]
  values: FilterValue
  onChange: (values: FilterValue) => void
  onReset?: () => void
  searchPlaceholder?: string
}

export function AdvancedFilters({
  filters,
  values,
  onChange,
  onReset,
  searchPlaceholder = "Search...",
}: AdvancedFiltersProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState(values.search || "")

  const handleFilterChange = (filterId: string, value: any) => {
    onChange({
      ...values,
      [filterId]: value,
    })
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    onChange({
      ...values,
      search: value,
    })
  }

  const handleReset = () => {
    setSearchQuery("")
    if (onReset) {
      onReset()
    } else {
      onChange({})
    }
  }

  const activeFiltersCount = Object.keys(values).filter(
    (key) => key !== "search" && values[key] !== undefined && values[key] !== ""
  ).length

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 glass-card"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2 relative hover-lift">
              <Filter className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge
                  variant="destructive"
                  className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96 glass-card" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Advanced Filters</h4>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="h-8 px-2"
                  >
                    Reset all
                  </Button>
                )}
              </div>
              <Separator />

              <div className="space-y-4 max-h-[400px] overflow-auto custom-scrollbar pr-2">
                {filters.map((filter) => (
                  <div key={filter.id} className="space-y-2">
                    <Label htmlFor={filter.id}>{filter.label}</Label>

                    {filter.type === "text" && (
                      <Input
                        id={filter.id}
                        placeholder={filter.placeholder}
                        value={values[filter.id] || ""}
                        onChange={(e) =>
                          handleFilterChange(filter.id, e.target.value)
                        }
                      />
                    )}

                    {filter.type === "number" && (
                      <Input
                        id={filter.id}
                        type="number"
                        placeholder={filter.placeholder}
                        value={values[filter.id] || ""}
                        onChange={(e) =>
                          handleFilterChange(filter.id, e.target.value)
                        }
                      />
                    )}

                    {filter.type === "date" && (
                      <Input
                        id={filter.id}
                        type="date"
                        value={values[filter.id] || ""}
                        onChange={(e) =>
                          handleFilterChange(filter.id, e.target.value)
                        }
                      />
                    )}

                    {filter.type === "select" && filter.options && (
                      <Select
                        value={values[filter.id] || ""}
                        onValueChange={(value) =>
                          handleFilterChange(filter.id, value)
                        }
                      >
                        <SelectTrigger id={filter.id}>
                          <SelectValue placeholder={filter.placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                          {filter.options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {filter.type === "multiselect" && filter.options && (
                      <MultiSelect
                        options={filter.options}
                        selected={values[filter.id] || []}
                        onChange={(selected) =>
                          handleFilterChange(filter.id, selected)
                        }
                        placeholder={filter.placeholder}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {(activeFiltersCount > 0 || searchQuery) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 animate-in">
          {Object.entries(values)
            .filter(([key, value]) => key !== "search" && value !== undefined && value !== "")
            .map(([key, value]) => {
              const filter = filters.find((f) => f.id === key)
              if (!filter) return null

              let displayValue = value
              if (Array.isArray(value)) {
                displayValue = value.length > 0 ? `${value.length} selected` : null
              }

              if (!displayValue) return null

              return (
                <Badge key={key} variant="secondary" className="gap-1 hover-lift">
                  <span className="text-xs">
                    {filter.label}: {displayValue}
                  </span>
                  <button
                    onClick={() => handleFilterChange(key, undefined)}
                    className="ml-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )
            })}
        </div>
      )}
    </div>
  )
}
