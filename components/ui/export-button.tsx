"use client"

import * as React from "react"
import { Download, FileSpreadsheet, FileJson, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  exportToCSV,
  exportToJSON,
  exportToExcel,
  prepareDataForExport,
} from "@/lib/export-utils"

interface ExportButtonProps<T extends Record<string, any>> {
  data: T[]
  filename: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  disabled?: boolean
}

export function ExportButton<T extends Record<string, any>>({
  data,
  filename,
  variant = "outline",
  size = "sm",
  disabled = false,
}: ExportButtonProps<T>) {
  const handleExport = (format: "csv" | "excel" | "json") => {
    const preparedData = prepareDataForExport(data)

    switch (format) {
      case "csv":
        exportToCSV(preparedData, filename)
        break
      case "excel":
        exportToExcel(preparedData, filename)
        break
      case "json":
        exportToJSON(data, filename)
        break
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          disabled={disabled || data.length === 0}
          className="gap-2 hover-lift"
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass-card">
        <DropdownMenuLabel>Export Format</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport("csv")} className="gap-2 cursor-pointer">
          <FileText className="h-4 w-4" />
          CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("excel")} className="gap-2 cursor-pointer">
          <FileSpreadsheet className="h-4 w-4" />
          Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("json")} className="gap-2 cursor-pointer">
          <FileJson className="h-4 w-4" />
          JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}