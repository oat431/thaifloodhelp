import { useMemo } from 'react'
import {
  Cell,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HELP_CATEGORIES, URGENCY_COLORS } from '@/constants/helpCategories'

interface Report {
  id: string
  urgency_level: number
  help_categories: string[]
  number_of_adults: number
  number_of_children: number
  number_of_infants: number
  number_of_seniors: number
  number_of_patients: number
}

interface ReportHeatmapProps {
  reports: Report[]
}

const ReportHeatmap = ({ reports }: ReportHeatmapProps) => {
  const heatmapData = useMemo(() => {
    const data: Array<{
      x: number
      y: number
      z: number
      urgency: number
      category: string
      categoryLabel: string
      count: number
      totalPeople: number
    }> = []

    HELP_CATEGORIES.forEach((category, categoryIndex) => {
      for (let urgency = 1; urgency <= 5; urgency++) {
        const matchingReports = reports.filter(
          (r) =>
            r.urgency_level === urgency &&
            r.help_categories?.includes(category.id),
        )

        const count = matchingReports.length
        const totalPeople = matchingReports.reduce(
          (sum, r) =>
            sum +
            r.number_of_adults +
            r.number_of_children +
            r.number_of_infants +
            r.number_of_seniors +
            r.number_of_patients,
          0,
        )

        if (count > 0) {
          data.push({
            x: categoryIndex,
            y: urgency - 1,
            z: count * 100, // Scale for bubble size
            urgency,
            category: category.id,
            categoryLabel: `${category.icon} ${category.label}`,
            count,
            totalPeople,
          })
        }
      }
    })

    return data
  }, [reports])

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold mb-1">{data.categoryLabel}</p>
          <p className="text-sm">
            <span className="font-medium">ระดับความเร่งด่วน:</span>{' '}
            {data.urgency}
          </p>
          <p className="text-sm">
            <span className="font-medium">จำนวนรายงาน:</span> {data.count}
          </p>
          <p className="text-sm">
            <span className="font-medium">ผู้ประสบภัยทั้งหมด:</span>{' '}
            {data.totalPeople} คน
          </p>
        </div>
      )
    }
    return null
  }

  const maxCount = Math.max(...heatmapData.map((d) => d.count), 1)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📊 Heatmap: การกระจายตัวของรายงานตามประเภทและความเร่งด่วน
        </CardTitle>
      </CardHeader>
      <CardContent>
        {heatmapData.length === 0 ? (
          <div className="text-center p-12 text-muted-foreground">
            ไม่มีข้อมูลสำหรับแสดง
          </div>
        ) : (
          <div className="w-full">
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart
                margin={{ top: 20, right: 20, bottom: 80, left: 60 }}
              >
                <XAxis
                  type="number"
                  dataKey="x"
                  name="ประเภทความช่วยเหลือ"
                  domain={[-0.5, HELP_CATEGORIES.length - 0.5]}
                  ticks={HELP_CATEGORIES.map((_, i) => i)}
                  tickFormatter={(value) => {
                    const cat = HELP_CATEGORIES[value]
                    return cat ? cat.icon : ''
                  }}
                  tick={{ fontSize: 20 }}
                  label={{
                    value: 'ประเภทความช่วยเหลือ',
                    position: 'insideBottom',
                    offset: -60,
                  }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="ความเร่งด่วน"
                  domain={[-0.5, 4.5]}
                  ticks={[0, 1, 2, 3, 4]}
                  tickFormatter={(value) => `${value + 1}`}
                  label={{
                    value: 'ระดับความเร่งด่วน',
                    angle: -90,
                    position: 'insideLeft',
                    offset: -40,
                  }}
                />
                <ZAxis
                  type="number"
                  dataKey="z"
                  range={[100, 2000]}
                  name="จำนวน"
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ strokeDasharray: '3 3' }}
                />
                <Scatter data={heatmapData} shape="circle">
                  {heatmapData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        URGENCY_COLORS[
                          entry.urgency as keyof typeof URGENCY_COLORS
                        ]
                      }
                      opacity={0.6 + (entry.count / maxCount) * 0.4}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>

            {/* Category Labels */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 mt-4 text-xs">
              {HELP_CATEGORIES.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center gap-1 text-muted-foreground"
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-6 flex-wrap">
              <span className="text-sm font-medium">ระดับความเร่งด่วน:</span>
              {[1, 2, 3, 4, 5].map((level) => (
                <div key={level} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{
                      backgroundColor:
                        URGENCY_COLORS[level as keyof typeof URGENCY_COLORS],
                    }}
                  />
                  <span className="text-sm">ระดับ {level}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground text-center mt-4">
              * ขนาดของจุดแสดงจำนวนรายงาน
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ReportHeatmap
