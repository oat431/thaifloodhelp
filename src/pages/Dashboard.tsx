import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Columns,
  Download,
  Filter,
  Loader2,
  MapPin,
  Pencil,
  Phone,
  RefreshCw,
} from 'lucide-react'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { EditReportDialog } from '@/components/EditReportDialog'
import QueryBot from '@/components/QueryBot'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { HELP_CATEGORIES } from '@/constants/helpCategories'
import { usePaginatedReports, reportKeys } from '@/hooks/use-reports'
import { formatCaseId, getUrgencyBadgeClass } from '@/lib/reportUtils'
import { supabase } from '@/integrations/supabase/client'
import type { Report } from '@/types/report'

const Dashboard = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const queryClient = useQueryClient()

  // Read from URL query params with defaults
  const itemsPerPage = useMemo(() => {
    const perPage = searchParams.get('perPage')
    const validValues = [10, 25, 50, 100, 200]
    const parsed = perPage ? parseInt(perPage, 10) : 50
    return validValues.includes(parsed) ? parsed : 50
  }, [searchParams])

  const currentPage = useMemo(() => {
    const page = searchParams.get('page')
    const parsed = page ? parseInt(page, 10) : 1
    return parsed > 0 ? parsed : 1
  }, [searchParams])

  const [searchTerm, setSearchTerm] = useState('')
  const [manualSearchTerm, setManualSearchTerm] = useState('')
  const [urgencyFilter, setUrgencyFilter] = useState<number | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [forceDeepSearch, setForceDeepSearch] = useState(false)
  const [useManualSearch, setUseManualSearch] = useState(false)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [sortColumn, setSortColumn] = useState<string | null>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [editingReport, setEditingReport] = useState<Report | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isConvertingMapLinks, setIsConvertingMapLinks] = useState(false)

  const columnDefinitions = [
    { id: 'expand', label: 'Expand', defaultVisible: true, required: true },
    { id: 'caseId', label: 'Case ID', defaultVisible: true, required: true },
    { id: 'createdAt', label: 'วันที่บันทึก', defaultVisible: true },
    { id: 'urgency', label: 'ความเร่งด่วน', defaultVisible: true },
    { id: 'status', label: 'สถานะ', defaultVisible: true },
    { id: 'name', label: 'ชื่อ-นามสกุล', defaultVisible: true },
    { id: 'map', label: 'แผนที่', defaultVisible: true },
    { id: 'address', label: 'ที่อยู่', defaultVisible: true },
    { id: 'phone', label: 'เบอร์โทร', defaultVisible: true },
    { id: 'adults', label: 'ผู้ใหญ่', defaultVisible: true },
    { id: 'children', label: 'เด็ก', defaultVisible: true },
    { id: 'infants', label: 'ทารก', defaultVisible: true },
    { id: 'seniors', label: 'ผู้สูงอายุ', defaultVisible: true },
    { id: 'patients', label: 'ผู้ป่วย', defaultVisible: true },
    { id: 'helpNeeded', label: 'ความช่วยเหลือ', defaultVisible: true },
    { id: 'recordedBy', label: 'บันทึกโดย', defaultVisible: true },
  ]

  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() => {
    const defaultVisible = new Set(
      columnDefinitions.filter((col) => col.defaultVisible).map((col) => col.id),
    )
    return defaultVisible
  })

  const toggleColumnVisibility = (columnId: string) => {
    const column = columnDefinitions.find((col) => col.id === columnId)
    if (column?.required) return

    setVisibleColumns((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(columnId)) {
        newSet.delete(columnId)
      } else {
        newSet.add(columnId)
      }
      return newSet
    })
  }

  const { data: paginatedData, isLoading, isRefetching, refetch } =
    usePaginatedReports(currentPage, itemsPerPage, {
      urgencyFilter,
      statusFilter,
      selectedCategories,
      sortColumn,
      sortDirection,
    })
  const reports = paginatedData?.data || []
  const totalCount = paginatedData?.count || 0

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('desc')
    }
  }

  // Map data to ensure line_user_id and line_display_name fields exist
  // Only map if fields are missing to avoid unnecessary work
  const mappedReports = useMemo(() => {
    if (reports.length === 0) return []
    const needsMapping = reports.some(
      (r: any) =>
        r.line_user_id === undefined || r.line_display_name === undefined,
    )
    if (!needsMapping) return reports as Report[]

    return reports.map((report: any) => ({
      ...report,
      line_user_id: report.line_user_id ?? null,
      line_display_name: report.line_display_name ?? null,
    })) as Report[]
  }, [reports])

  // Client-side filtering for manual search only
  // Note: Urgency, status, and category filtering are now done server-side for better performance
  // Category filtering uses PostgreSQL array overlap operator (&&) via RPC function
  // Manual search is client-side as it searches across multiple text fields
  const filteredReports = useMemo(() => {
    if (mappedReports.length === 0) return []

    let filtered = mappedReports

    // Apply client-side filters (only manual search now - categories are server-side)
    const hasClientFilters = useManualSearch && manualSearchTerm.trim()

    if (hasClientFilters) {
      const manualQuery = manualSearchTerm.toLowerCase()

      filtered = mappedReports.filter((r) => {
        // Manual search filter (client-side for multi-field text search)
        const matchesSearch =
          r.name?.toLowerCase().includes(manualQuery) ||
          r.lastname?.toLowerCase().includes(manualQuery) ||
          r.reporter_name?.toLowerCase().includes(manualQuery) ||
          r.address?.toLowerCase().includes(manualQuery) ||
          r.phone?.some((p) => p.includes(manualQuery)) ||
          r.health_condition?.toLowerCase().includes(manualQuery) ||
          r.help_needed?.toLowerCase().includes(manualQuery) ||
          r.additional_info?.toLowerCase().includes(manualQuery)

        return matchesSearch
      })
    }

    // Note: AI search results would need separate handling
    // For now, AI search is handled via the search-reports function
    // but results are not integrated into filteredReports yet

    return filtered
  }, [mappedReports, manualSearchTerm, useManualSearch])

  // Memoize reports with locations to avoid recalculating
  const reportsWithLocations = useMemo(() => {
    return filteredReports.filter((r) => r.location_lat && r.location_long)
  }, [filteredReports])

  // Sorting is now done server-side for better performance
  // Only apply client-side sorting if needed for categories/manual search results
  // Since server-side sorting is applied first, we just use filteredReports directly
  const sortedReports = useMemo(() => {
    // Server-side sorting is already applied via the query
    // Only need to maintain order for client-side filtered results
    return filteredReports
  }, [filteredReports])

  // Pagination (server-side)
  const totalPages = Math.ceil(totalCount / itemsPerPage)

  const handlePageChange = (newPage: number) => {
    const newSearchParams = new URLSearchParams(searchParams)
    newSearchParams.set('page', newPage.toString())
    setSearchParams(newSearchParams, { replace: true })
  }

  const handleItemsPerPageChange = (newPerPage: number) => {
    const newSearchParams = new URLSearchParams(searchParams)
    newSearchParams.set('perPage', newPerPage.toString())
    newSearchParams.set('page', '1')
    setSearchParams(newSearchParams, { replace: true })
  }

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({
      queryKey: reportKeys.list({ page: currentPage, itemsPerPage }),
    })
    await refetch()
    toast.success('รีเฟรชข้อมูลสำเร็จ')
  }

  const prevFiltersRef = useRef({
    searchTerm,
    manualSearchTerm,
    urgencyFilter,
    statusFilter,
    selectedCategories: selectedCategories.join(','),
  })

  useEffect(() => {
    const currentFilters = {
      searchTerm,
      manualSearchTerm,
      urgencyFilter,
      statusFilter,
      selectedCategories: selectedCategories.join(','),
    }

    const filtersChanged =
      prevFiltersRef.current.searchTerm !== currentFilters.searchTerm ||
      prevFiltersRef.current.manualSearchTerm !==
        currentFilters.manualSearchTerm ||
      prevFiltersRef.current.urgencyFilter !== currentFilters.urgencyFilter ||
      prevFiltersRef.current.statusFilter !== currentFilters.statusFilter ||
      prevFiltersRef.current.selectedCategories !==
        currentFilters.selectedCategories

    if (filtersChanged && currentPage !== 1) {
      const newSearchParams = new URLSearchParams(searchParams)
      newSearchParams.set('page', '1')
      setSearchParams(newSearchParams, { replace: true })
    }

    prevFiltersRef.current = currentFilters
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchTerm,
    manualSearchTerm,
    urgencyFilter,
    statusFilter,
    selectedCategories,
    currentPage,
  ])

  const exportToCSV = () => {
    if (filteredReports.length === 0) {
      toast.error('ไม่มีข้อมูลให้ส่งออก')
      return
    }

    try {
      // Define CSV headers
      const headers = [
        'ID',
        'ชื่อ',
        'นามสกุล',
        'ผู้รายงาน',
        'ที่อยู่',
        'เบอร์โทรศัพท์',
        'จำนวนผู้ใหญ่',
        'จำนวนเด็ก',
        'จำนวนทารก',
        'จำนวนผู้สูงอายุ',
        'จำนวนผู้ป่วย',
        'อาการ/สภาพสุขภาพ',
        'ความช่วยเหลือที่ต้องการ',
        'ประเภทความช่วยเหลือ',
        'ข้อมูลเพิ่มเติม',
        'ระดับความเร่งด่วน',
        'สถานะ',
        'ตำแหน่ง (Latitude)',
        'ตำแหน่ง (Longitude)',
        'Google Maps Link',
        'วันที่บันทึก',
        'แก้ไขล่าสุด',
        'บันทึกโดย',
      ]

      // Convert data to CSV rows
      const csvRows = filteredReports.map((report) => {
        return [
          report.id,
          report.name || '',
          report.lastname || '',
          report.reporter_name || '',
          `"${(report.address || '').replace(/"/g, '""')}"`, // Escape quotes
          `"${report.phone?.join(', ') || ''}"`,
          report.number_of_adults || 0,
          report.number_of_children || 0,
          report.number_of_infants || 0,
          report.number_of_seniors || 0,
          report.number_of_patients || 0,
          `"${(report.health_condition || '').replace(/"/g, '""')}"`,
          `"${(report.help_needed || '').replace(/"/g, '""')}"`,
          `"${report.help_categories?.join(', ') || ''}"`,
          `"${(report.additional_info || '').replace(/"/g, '""')}"`,
          report.urgency_level,
          report.status || '',
          report.location_lat || '',
          report.location_long || '',
          report.map_link || '',
          new Date(report.created_at).toLocaleString('th-TH'),
          new Date(report.updated_at).toLocaleString('th-TH'),
          report.line_display_name || '',
        ].join(',')
      })

      // Combine headers and rows
      const csvContent = [headers.join(','), ...csvRows].join('\n')

      // Add BOM for proper UTF-8 encoding in Excel
      const BOM = '\uFEFF'
      const blob = new Blob([BOM + csvContent], {
        type: 'text/csv;charset=utf-8;',
      })

      // Create download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      const timestamp = new Date().toISOString().slice(0, 10)
      link.setAttribute('download', `flood_reports_${timestamp}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success('ส่งออกข้อมูลสำเร็จ', {
        description: `ส่งออก ${filteredReports.length} รายการ`,
      })
    } catch (error) {
      console.error('CSV export error:', error)
      toast.error('ไม่สามารถส่งออกข้อมูลได้', {
        description: 'กรุณาลองใหม่อีกครั้ง',
      })
    }
  }

  useEffect(() => {
    if (!useManualSearch && searchTerm.trim()) {
      const searchReports = async () => {
        setIsSearching(true)
        try {
          const { data, error } = await supabase.functions.invoke(
            'search-reports',
            {
              body: {
                query: searchTerm,
                urgencyFilter: urgencyFilter,
                limit: 100,
                forceSemanticSearch: forceDeepSearch,
              },
            },
          )

          if (error) throw error

          // Note: AI search results would need to be handled separately
          // For now, we'll use client-side filtering
          // TODO: Integrate AI search results with filteredReports
        } catch (err) {
          console.error('Search error:', err)
          toast.error('ไม่สามารถค้นหาได้', {
            description: 'กรุณาลองใหม่อีกครั้ง',
          })
        } finally {
          setIsSearching(false)
        }
      }

      const timeoutId = setTimeout(() => {
        searchReports()
      }, 500)

      return () => clearTimeout(timeoutId)
    }
  }, [searchTerm, forceDeepSearch, useManualSearch, urgencyFilter])

  const toggleRowExpansion = (reportId: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(reportId)) {
        newSet.delete(reportId)
      } else {
        newSet.add(reportId)
      }
      return newSet
    })
  }

  const handleEditReport = (report: Report) => {
    setEditingReport(report)
    setIsEditDialogOpen(true)
  }

  const handleEditSuccess = () => {
    // Query will automatically refetch due to invalidation in mutation
    queryClient.invalidateQueries({ queryKey: reportKeys.all })
  }

  const handleConvertMapLinks = async () => {
    setIsConvertingMapLinks(true)
    try {
      // Find all reports with map_link but no coordinates
      const reportsToConvert = mappedReports.filter(
        (r) =>
          r.map_link &&
          r.map_link.trim() &&
          (!r.location_lat || !r.location_long),
      )

      if (reportsToConvert.length === 0) {
        toast.info('ไม่พบข้อมูลที่ต้องแปลง', {
          description: 'ทุกรายการที่มี Google Maps link มีพิกัดแล้ว',
        })
        setIsConvertingMapLinks(false)
        return
      }

      toast.info(`กำลังแปลง ${reportsToConvert.length} รายการ...`)

      let successCount = 0
      let failCount = 0

      for (const report of reportsToConvert) {
        try {
          const { data, error } = await supabase.functions.invoke(
            'parse-map-link',
            {
              body: { mapLink: report.map_link },
            },
          )

          if (error) throw error

          if (data.success && data.lat && data.lng) {
            // Update the report with coordinates
            const { error: updateError } = await supabase
              .from('reports')
              .update({
                location_lat: data.lat,
                location_long: data.lng,
              })
              .eq('id', report.id)

            if (updateError) throw updateError
            successCount++
          } else {
            failCount++
          }
        } catch (err) {
          console.error(
            `Error converting map link for report ${report.id}:`,
            err,
          )
          failCount++
        }
      }

      toast.success(`แปลงพิกัดเสร็จสิ้น`, {
        description: `สำเร็จ ${successCount} รายการ, ล้มเหลว ${failCount} รายการ`,
      })

      // Refresh the reports
      await queryClient.invalidateQueries({ queryKey: reportKeys.all })
      await refetch()
    } catch (error) {
      console.error('Error converting map links:', error)
      toast.error('เกิดข้อผิดพลาด', {
        description: 'ไม่สามารถแปลง Google Maps links ได้',
      })
    } finally {
      setIsConvertingMapLinks(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-start">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              กลับไปหน้าแรก
            </Button>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-start sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/map')}
            >
              🗺️ แผนที่
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/help')}
            >
              📖 คู่มือการใช้งาน
            </Button>
          </div>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">ข้อมูลผู้ประสบภัยทั้งหมด</p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="space-y-4">
              {/* Search Mode Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={!useManualSearch ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setUseManualSearch(false)
                    setManualSearchTerm('')
                  }}
                >
                  🤖 AI Search
                </Button>
                <Button
                  variant={useManualSearch ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setUseManualSearch(true)
                    setSearchTerm('')
                  }}
                >
                  🔤 Manual Search
                </Button>
              </div>

              {/* Search Input */}
              <div className="flex flex-col md:flex-row gap-4">
                {useManualSearch ? (
                  <div className="flex-1 relative">
                    <Input
                      placeholder="ค้นหา: ชื่อ, ที่อยู่, เบอร์โทร, อาการ, ความช่วยเหลือ..."
                      value={manualSearchTerm}
                      onChange={(e) => setManualSearchTerm(e.target.value)}
                    />
                  </div>
                ) : (
                  <>
                    <div className="flex-1 relative">
                      <Input
                        placeholder="ค้นหาอัจฉริยะ: ชื่อ, ที่อยู่, เบอร์โทร, อาการ, ความช่วยเหลือ... (ใช้ AI)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      {isSearching && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        </div>
                      )}
                    </div>
                    <Button
                      variant={forceDeepSearch ? 'default' : 'outline'}
                      onClick={() => setForceDeepSearch(!forceDeepSearch)}
                      className="whitespace-nowrap"
                    >
                      🔍 Deep Search
                    </Button>
                  </>
                )}
              </div>

              {/* Status and Urgency Filters Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status Filter */}
                <div className="space-y-2">
                  <div className="text-sm font-medium">สถานะ</div>
                  <Select
                    value={statusFilter || 'all'}
                    onValueChange={(value) =>
                      setStatusFilter(value === 'all' ? null : value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกสถานะ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ทั้งหมด</SelectItem>
                      <SelectItem value="pending">รอความช่วยเหลือ</SelectItem>
                      <SelectItem value="processed">กำลังช่วยเหลือ</SelectItem>
                      <SelectItem value="completed">
                        ช่วยเหลือเสร็จสิ้น
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Urgency Filter */}
                <div className="space-y-2">
                  <div className="text-sm font-medium">ระดับความเร่งด่วน</div>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant={urgencyFilter === null ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setUrgencyFilter(null)}
                    >
                      <Filter className="mr-2 h-4 w-4" />
                      ทั้งหมด
                    </Button>
                    {[1, 2, 3, 4, 5].map((level) => (
                      <Button
                        key={level}
                        variant={
                          urgencyFilter === level ? 'default' : 'outline'
                        }
                        size="sm"
                        onClick={() => setUrgencyFilter(level)}
                        className={
                          urgencyFilter === level
                            ? getUrgencyBadgeClass(level)
                            : ''
                        }
                      >
                        ระดับ {level}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Help Category Filter */}
              <div className="space-y-2">
                <div className="text-sm font-medium">ประเภทความช่วยเหลือ</div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {HELP_CATEGORIES.map((category) => (
                    <div
                      key={category.id}
                      className={`flex items-center space-x-2 p-2 rounded-md border cursor-pointer transition-colors ${
                        selectedCategories.includes(category.id)
                          ? 'bg-primary/10 border-primary'
                          : 'bg-muted/30 border-border hover:bg-muted/50'
                      }`}
                      onClick={() => {
                        setSelectedCategories((prev) =>
                          prev.includes(category.id)
                            ? prev.filter((c) => c !== category.id)
                            : [...prev, category.id],
                        )
                      }}
                    >
                      <Checkbox
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() => {}}
                      />
                      <span className="text-sm flex items-center gap-1">
                        <span>{category.icon}</span>
                        <span>{category.label}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Map section currently disabled due to react-leaflet context error */}
        {/* <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>แผนที่ความช่วยเหลือ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
             {filteredReports && <Map reports={reportsWithLocations} />}
            </div>
          </CardContent>
        </Card> */}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="text-sm text-muted-foreground">
            ทั้งหมด {totalCount} รายการ
            {totalPages > 1 && ` • หน้า ${currentPage}/${totalPages}`}
          </div>
          <div className="flex gap-2 flex-wrap w-full sm:w-auto">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:flex-none"
                >
                  <Columns className="mr-2 h-4 w-4" />
                  คอลัมน์
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56" align="end">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">แสดงคอลัมน์</h4>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {columnDefinitions.map((column) => (
                      <div
                        key={column.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={column.id}
                          checked={visibleColumns.has(column.id)}
                          onCheckedChange={() => toggleColumnVisibility(column.id)}
                          disabled={column.required}
                        />
                        <label
                          htmlFor={column.id}
                          className={`text-sm cursor-pointer flex-1 ${
                            column.required ? 'text-muted-foreground' : ''
                          }`}
                        >
                          {column.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={isRefetching}
              className="flex-1 sm:flex-none"
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`}
              />
              {isRefetching ? 'กำลังรีเฟรช...' : 'รีเฟรช'}
            </Button>
            <Button
              onClick={handleConvertMapLinks}
              variant="outline"
              size="sm"
              disabled={isConvertingMapLinks}
              className="flex-1 sm:flex-none"
            >
              {isConvertingMapLinks ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังแปลง...
                </>
              ) : (
                <>
                  <MapPin className="mr-2 h-4 w-4" />
                  แปลง Google Maps
                </>
              )}
            </Button>
            <Button
              onClick={exportToCSV}
              variant="outline"
              size="sm"
              disabled={filteredReports.length === 0}
              className="flex-1 sm:flex-none"
            >
              <Download className="mr-2 h-4 w-4" />
              ส่งออก CSV
            </Button>
          </div>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="text-center p-12 text-muted-foreground">
                ไม่พบข้อมูล
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {visibleColumns.has('expand') && (
                        <TableHead className="w-12"></TableHead>
                      )}
                      {visibleColumns.has('caseId') && (
                        <TableHead className="w-32">Case ID</TableHead>
                      )}
                      {visibleColumns.has('createdAt') && (
                        <TableHead
                          className="cursor-pointer hover:bg-muted/50 select-none"
                          onClick={() => handleSort('created_at')}
                        >
                          <div className="flex items-center gap-1">
                            วันที่บันทึก
                            {sortColumn === 'created_at' ? (
                              sortDirection === 'asc' ? (
                                <ArrowUp className="h-4 w-4" />
                              ) : (
                                <ArrowDown className="h-4 w-4" />
                              )
                            ) : (
                              <ArrowUpDown className="h-4 w-4 opacity-30" />
                            )}
                          </div>
                        </TableHead>
                      )}
                      {visibleColumns.has('urgency') && (
                        <TableHead
                          className="cursor-pointer hover:bg-muted/50 select-none"
                          onClick={() => handleSort('urgency_level')}
                        >
                          <div className="flex items-center gap-1">
                            ความเร่งด่วน
                            {sortColumn === 'urgency_level' ? (
                              sortDirection === 'asc' ? (
                                <ArrowUp className="h-4 w-4" />
                              ) : (
                                <ArrowDown className="h-4 w-4" />
                              )
                            ) : (
                              <ArrowUpDown className="h-4 w-4 opacity-30" />
                            )}
                          </div>
                        </TableHead>
                      )}
                      {visibleColumns.has('status') && (
                        <TableHead
                          className="cursor-pointer hover:bg-muted/50 select-none"
                          onClick={() => handleSort('status')}
                        >
                          <div className="flex items-center gap-1">
                            สถานะ
                            {sortColumn === 'status' ? (
                              sortDirection === 'asc' ? (
                                <ArrowUp className="h-4 w-4" />
                              ) : (
                                <ArrowDown className="h-4 w-4" />
                              )
                            ) : (
                              <ArrowUpDown className="h-4 w-4 opacity-30" />
                            )}
                          </div>
                        </TableHead>
                      )}
                      {visibleColumns.has('name') && (
                        <TableHead>ชื่อ-นามสกุล</TableHead>
                      )}
                      {visibleColumns.has('map') && (
                        <TableHead className="text-center">แผนที่</TableHead>
                      )}
                      {visibleColumns.has('address') && (
                        <TableHead>ที่อยู่</TableHead>
                      )}
                      {visibleColumns.has('phone') && (
                        <TableHead>เบอร์โทร</TableHead>
                      )}
                      {visibleColumns.has('adults') && (
                        <TableHead
                          className="text-center cursor-pointer hover:bg-muted/50 select-none"
                          onClick={() => handleSort('number_of_adults')}
                        >
                          <div className="flex items-center justify-center gap-1">
                            ผู้ใหญ่
                            {sortColumn === 'number_of_adults' ? (
                              sortDirection === 'asc' ? (
                                <ArrowUp className="h-4 w-4" />
                              ) : (
                                <ArrowDown className="h-4 w-4" />
                              )
                            ) : (
                              <ArrowUpDown className="h-4 w-4 opacity-30" />
                            )}
                          </div>
                        </TableHead>
                      )}
                      {visibleColumns.has('children') && (
                        <TableHead
                          className="text-center cursor-pointer hover:bg-muted/50 select-none"
                          onClick={() => handleSort('number_of_children')}
                        >
                          <div className="flex items-center justify-center gap-1">
                            เด็ก
                            {sortColumn === 'number_of_children' ? (
                              sortDirection === 'asc' ? (
                                <ArrowUp className="h-4 w-4" />
                              ) : (
                                <ArrowDown className="h-4 w-4" />
                              )
                            ) : (
                              <ArrowUpDown className="h-4 w-4 opacity-30" />
                            )}
                          </div>
                        </TableHead>
                      )}
                      {visibleColumns.has('infants') && (
                        <TableHead
                          className="text-center cursor-pointer hover:bg-muted/50 select-none"
                          onClick={() => handleSort('number_of_infants')}
                        >
                          <div className="flex items-center justify-center gap-1">
                            ทารก
                            {sortColumn === 'number_of_infants' ? (
                              sortDirection === 'asc' ? (
                                <ArrowUp className="h-4 w-4" />
                              ) : (
                                <ArrowDown className="h-4 w-4" />
                              )
                            ) : (
                              <ArrowUpDown className="h-4 w-4 opacity-30" />
                            )}
                          </div>
                        </TableHead>
                      )}
                      {visibleColumns.has('seniors') && (
                        <TableHead
                          className="text-center cursor-pointer hover:bg-muted/50 select-none"
                          onClick={() => handleSort('number_of_seniors')}
                        >
                          <div className="flex items-center justify-center gap-1">
                            ผู้สูงอายุ
                            {sortColumn === 'number_of_seniors' ? (
                              sortDirection === 'asc' ? (
                                <ArrowUp className="h-4 w-4" />
                              ) : (
                                <ArrowDown className="h-4 w-4" />
                              )
                            ) : (
                              <ArrowUpDown className="h-4 w-4 opacity-30" />
                            )}
                          </div>
                        </TableHead>
                      )}
                      {visibleColumns.has('patients') && (
                        <TableHead
                          className="text-center cursor-pointer hover:bg-muted/50 select-none"
                          onClick={() => handleSort('number_of_patients')}
                        >
                          <div className="flex items-center justify-center gap-1">
                            ผู้ป่วย
                            {sortColumn === 'number_of_patients' ? (
                              sortDirection === 'asc' ? (
                                <ArrowUp className="h-4 w-4" />
                              ) : (
                                <ArrowDown className="h-4 w-4" />
                              )
                            ) : (
                              <ArrowUpDown className="h-4 w-4 opacity-30" />
                            )}
                          </div>
                        </TableHead>
                      )}
                      {visibleColumns.has('helpNeeded') && (
                        <TableHead>ความช่วยเหลือ</TableHead>
                      )}
                      {visibleColumns.has('recordedBy') && (
                        <TableHead>บันทึกโดย</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedReports.map((report) => {
                      const isExpanded = expandedRows.has(report.id)
                      return (
                        <React.Fragment key={report.id}>
                          <TableRow
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => toggleRowExpansion(report.id)}
                          >
                            {visibleColumns.has('expand') && (
                              <TableCell>
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </TableCell>
                            )}
                            {visibleColumns.has('caseId') && (
                              <TableCell className="font-mono text-xs">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    navigate(`/report/${report.id}`)
                                  }}
                                  className="text-primary hover:underline"
                                >
                                  {formatCaseId(report.id)}
                                </button>
                              </TableCell>
                            )}
                            {visibleColumns.has('createdAt') && (
                              <TableCell>
                                {new Date(
                                  report.created_at,
                                ).toLocaleString('th-TH', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </TableCell>
                            )}
                            {visibleColumns.has('urgency') && (
                              <TableCell>
                                <Badge
                                  className={getUrgencyBadgeClass(
                                    report.urgency_level,
                                  )}
                                >
                                  {report.urgency_level}
                                </Badge>
                              </TableCell>
                            )}
                            {visibleColumns.has('status') && (
                              <TableCell>
                                <Badge variant="outline">
                                  {report.status || '-'}
                                </Badge>
                              </TableCell>
                            )}
                            {visibleColumns.has('name') && (
                              <TableCell className="font-medium">
                                {report.name} {report.lastname}
                              </TableCell>
                            )}
                            {visibleColumns.has('map') && (
                              <TableCell className="text-center">
                                {report.map_link ? (
                                  <a
                                    href={report.map_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center text-primary hover:text-primary/80 transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                    title="เปิด Google Maps"
                                  >
                                    <MapPin className="h-5 w-5" />
                                  </a>
                                ) : (
                                  <span className="text-muted-foreground text-sm">
                                    -
                                  </span>
                                )}
                              </TableCell>
                            )}
                            {visibleColumns.has('address') && (
                              <TableCell className="max-w-xs truncate">
                                {report.address}
                              </TableCell>
                            )}
                            {visibleColumns.has('phone') && (
                              <TableCell>
                                {Array.isArray(report.phone) &&
                                report.phone.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {report.phone.map((phoneNumber, idx) => (
                                      <Button
                                        key={idx}
                                        variant="outline"
                                        size="sm"
                                        className="gap-1 h-7"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          window.location.href = `tel:${phoneNumber}`
                                        }}
                                      >
                                        <Phone className="h-3 w-3" />
                                        โทร{' '}
                                        {report.phone.length > 1
                                          ? `(${idx + 1})`
                                          : ''}
                                      </Button>
                                    ))}
                                  </div>
                                ) : (
                                  '-'
                                )}
                              </TableCell>
                            )}
                            {visibleColumns.has('adults') && (
                              <TableCell className="text-center">
                                {report.number_of_adults}
                              </TableCell>
                            )}
                            {visibleColumns.has('children') && (
                              <TableCell className="text-center">
                                {report.number_of_children}
                              </TableCell>
                            )}
                            {visibleColumns.has('infants') && (
                              <TableCell className="text-center">
                                {report.number_of_infants || 0}
                              </TableCell>
                            )}
                            {visibleColumns.has('seniors') && (
                              <TableCell className="text-center">
                                {report.number_of_seniors}
                              </TableCell>
                            )}
                            {visibleColumns.has('patients') && (
                              <TableCell className="text-center">
                                {report.number_of_patients || 0}
                              </TableCell>
                            )}
                            {visibleColumns.has('helpNeeded') && (
                              <TableCell className="max-w-xs truncate">
                                {report.help_needed || '-'}
                              </TableCell>
                            )}
                            {visibleColumns.has('recordedBy') && (
                              <TableCell className="max-w-xs truncate">
                                {report.line_display_name ? (
                                  <span className="text-green-600 dark:text-green-400">
                                    {report.line_display_name}
                                  </span>
                                ) : (
                                  '-'
                                )}
                              </TableCell>
                            )}
                          </TableRow>
                          {isExpanded && (
                            <TableRow>
                              <TableCell
                                colSpan={visibleColumns.size}
                                className="bg-muted/30 p-6 min-w-0"
                              >
                                <div className="space-y-4 min-w-0">
                                  <div className="flex justify-start">
                                    <Button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleEditReport(report)
                                      }}
                                      variant="outline"
                                      size="sm"
                                    >
                                      <Pencil className="mr-2 h-4 w-4" />
                                      แก้ไขข้อมูล
                                    </Button>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-semibold mb-2">
                                        ข้อมูลทั่วไป
                                      </h4>
                                      <div className="space-y-1 text-sm">
                                        <p className="break-words">
                                          <span className="font-medium">
                                            ชื่อ:
                                          </span>{' '}
                                          {report.name} {report.lastname}
                                        </p>
                                        <p className="break-words">
                                          <span className="font-medium">
                                            ผู้รายงาน:
                                          </span>{' '}
                                          {report.reporter_name || '-'}
                                        </p>
                                        <p className="break-words">
                                          <span className="font-medium">
                                            ที่อยู่:
                                          </span>{' '}
                                          {report.address || '-'}
                                        </p>
                                        <div className="break-words">
                                          <span className="font-medium">
                                            เบอร์โทร:
                                          </span>{' '}
                                          {report.phone?.length > 0 ? (
                                            <div className="inline-flex flex-wrap gap-2 mt-1">
                                              {report.phone.map(
                                                (phoneNumber, idx) => (
                                                  <Button
                                                    key={idx}
                                                    variant="outline"
                                                    size="sm"
                                                    className="gap-1 h-7 text-xs"
                                                    onClick={(e) => {
                                                      e.stopPropagation()
                                                      window.location.href = `tel:${phoneNumber}`
                                                    }}
                                                  >
                                                    <Phone className="h-3 w-3" />
                                                    {phoneNumber}
                                                  </Button>
                                                ),
                                              )}
                                            </div>
                                          ) : (
                                            '-'
                                          )}
                                        </div>
                                        <p className="break-words">
                                          <span className="font-medium">
                                            ตำแหน่ง:
                                          </span>{' '}
                                          {report.location_lat &&
                                          report.location_long
                                            ? `${report.location_lat}, ${report.location_long}`
                                            : '-'}
                                        </p>
                                        {report.map_link && (
                                          <p className="break-words">
                                            <span className="font-medium">
                                              Google Maps:
                                            </span>{' '}
                                            <a
                                              href={report.map_link}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-primary hover:underline"
                                            >
                                              เปิดแผนที่ 🗺️
                                            </a>
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold mb-2">
                                        จำนวนผู้ประสบภัย
                                      </h4>
                                      <div className="space-y-1 text-sm">
                                        <p>
                                          <span className="font-medium">
                                            ผู้ใหญ่:
                                          </span>{' '}
                                          {report.number_of_adults || 0}
                                        </p>
                                        <p>
                                          <span className="font-medium">
                                            เด็ก:
                                          </span>{' '}
                                          {report.number_of_children || 0}
                                        </p>
                                        <p>
                                          <span className="font-medium">
                                            ทารก:
                                          </span>{' '}
                                          {report.number_of_infants || 0}
                                        </p>
                                        <p>
                                          <span className="font-medium">
                                            ผู้สูงอายุ:
                                          </span>{' '}
                                          {report.number_of_seniors || 0}
                                        </p>
                                        <p>
                                          <span className="font-medium">
                                            ผู้ป่วย:
                                          </span>{' '}
                                          {report.number_of_patients || 0}
                                        </p>
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold mb-2">
                                        สุขภาพและความช่วยเหลือ
                                      </h4>
                                      <div className="space-y-1 text-sm">
                                        <p className="break-words">
                                          <span className="font-medium">
                                            อาการ:
                                          </span>{' '}
                                          {report.health_condition || '-'}
                                        </p>
                                        <p className="break-words">
                                          <span className="font-medium">
                                            ความช่วยเหลือ:
                                          </span>{' '}
                                          {report.help_needed || '-'}
                                        </p>
                                        <p className="break-words">
                                          <span className="font-medium">
                                            ประเภทความช่วยเหลือ:
                                          </span>{' '}
                                          {report.help_categories?.length > 0
                                            ? report.help_categories.join(', ')
                                            : '-'}
                                        </p>
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold mb-2">
                                        Metadata
                                      </h4>
                                      <div className="space-y-1 text-sm">
                                        <p>
                                          <span className="font-medium">
                                            สถานะ:
                                          </span>{' '}
                                          {report.status || '-'}
                                        </p>
                                        <p>
                                          <span className="font-medium">
                                            ความเร่งด่วน:
                                          </span>{' '}
                                          {report.urgency_level}
                                        </p>
                                        <p className="break-words">
                                          <span className="font-medium">
                                            วันที่บันทึก:
                                          </span>{' '}
                                          {new Date(
                                            report.created_at,
                                          ).toLocaleString('th-TH')}
                                        </p>
                                        <p className="break-words">
                                          <span className="font-medium">
                                            แก้ไขล่าสุด:
                                          </span>{' '}
                                          {new Date(
                                            report.updated_at,
                                          ).toLocaleString('th-TH')}
                                        </p>
                                        <p className="break-words">
                                          <span className="font-medium">
                                            บันทึกโดย:
                                          </span>{' '}
                                          {report.line_display_name ? (
                                            <span className="text-green-600 dark:text-green-400">
                                              {report.line_display_name}
                                            </span>
                                          ) : (
                                            '-'
                                          )}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  {report.additional_info && (
                                    <div>
                                      <h4 className="font-semibold mb-2">
                                        ข้อมูลเพิ่มเติม
                                      </h4>
                                      <p className="text-sm whitespace-pre-wrap break-words">
                                        {report.additional_info}
                                      </p>
                                    </div>
                                  )}
                                  <div className="min-w-0 w-full max-w-[1230px]">
                                    <h4 className="font-semibold mb-2">
                                      ข้อความต้นฉบับ (Raw Data)
                                    </h4>
                                    <div className="bg-background rounded-md p-4 border w-full min-w-0 overflow-hidden">
                                      <pre className="text-sm whitespace-pre-wrap break-all font-mono w-full min-w-0">
                                        {report.raw_message}
                                      </pre>
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      )
                    })}
                  </TableBody>
                </Table>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t">
                    <div className="text-sm text-muted-foreground text-center sm:text-left">
                      แสดง {(currentPage - 1) * itemsPerPage + 1} -{' '}
                      {Math.min(currentPage * itemsPerPage, totalCount)} จาก{' '}
                      {totalCount} รายการ
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-center">
                      {/* Items per page selector in pagination area */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground whitespace-nowrap">แสดง:</span>
                        <Select
                          value={itemsPerPage.toString()}
                          onValueChange={(value) =>
                            handleItemsPerPageChange(parseInt(value, 10))
                          }
                        >
                          <SelectTrigger className="w-[100px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                            <SelectItem value="200">200</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1 || isLoading}
                        className="hidden sm:inline-flex"
                      >
                        หน้าแรก
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handlePageChange(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage === 1 || isLoading}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm px-2 min-w-[80px] text-center">
                        {currentPage} / {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handlePageChange(
                            Math.min(totalPages, currentPage + 1),
                          )
                        }
                        disabled={currentPage === totalPages || isLoading}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages || isLoading}
                        className="hidden sm:inline-flex"
                      >
                        หน้าสุดท้าย
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <QueryBot />

      {editingReport && (
        <EditReportDialog
          report={editingReport}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  )
}

export default Dashboard
