import { Loader2, Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { formatPhoneNumber } from '@/lib/utils'
import { useUpdateReport } from '@/hooks/use-reports'
import type { Report } from '@/types/report'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'

interface EditReportDialogProps {
  report: Report
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditReportDialog({
  report,
  open,
  onOpenChange,
  onSuccess,
}: EditReportDialogProps) {
  const [formData, setFormData] = useState<Report>(report)
  const [phoneInput, setPhoneInput] = useState(report.phone?.join(', ') || '')
  const updateReport = useUpdateReport()

  // Update form data when report prop changes
  useEffect(() => {
    setFormData(report)
    setPhoneInput(report.phone?.join(', ') || '')
  }, [report])

  const handleSave = async () => {
    try {
      // Parse and format phone numbers
      const phones = phoneInput
        .split(',')
        .map((p) => p.trim())
        .filter((p) => p.length > 0)
        .map((p) => formatPhoneNumber(p))

      const dataToUpdate = {
        name:
          formData.name && formData.name !== '-'
            ? formData.name
            : 'ไม่ระบุชื่อ',
        lastname: formData.lastname,
        reporter_name: formData.reporter_name,
        address: formData.address,
        phone: phones,
        location_lat: formData.location_lat
          ? parseFloat(String(formData.location_lat))
          : null,
        location_long: formData.location_long
          ? parseFloat(String(formData.location_long))
          : null,
        map_link: formData.map_link || null,
        number_of_adults: formData.number_of_adults || 0,
        number_of_children: formData.number_of_children || 0,
        number_of_infants: formData.number_of_infants || 0,
        number_of_seniors: formData.number_of_seniors || 0,
        number_of_patients: formData.number_of_patients || 0,
        health_condition: formData.health_condition,
        help_needed: formData.help_needed,
        help_categories: formData.help_categories || [],
        additional_info: formData.additional_info,
        urgency_level: formData.urgency_level,
        status: formData.status,
      }

      await updateReport.mutateAsync({
        id: report.id,
        data: dataToUpdate,
      })

      toast.success('แก้ไขข้อมูลสำเร็จ', {
        description: 'ข้อมูลได้รับการอัปเดตแล้ว',
      })

      onSuccess()
      onOpenChange(false)
    } catch (err) {
      console.error('Update error:', err)
      toast.error('ไม่สามารถแก้ไขข้อมูลได้', {
        description:
          err instanceof Error ? err.message : 'กรุณาลองใหม่อีกครั้ง',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>แก้ไขข้อมูลผู้ประสบภัย</DialogTitle>
          <DialogDescription>
            แก้ไขข้อมูลของ {report.name} {report.lastname}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-reporter">ผู้รายงาน/แจ้งเรื่อง</Label>
              <Input
                id="edit-reporter"
                value={formData.reporter_name || ''}
                onChange={(e) =>
                  setFormData({ ...formData, reporter_name: e.target.value })
                }
                placeholder="-"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">สถานะ</Label>
              <Select
                value={formData.status || 'pending'}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกสถานะ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">รอความช่วยเหลือ</SelectItem>
                  <SelectItem value="processed">กำลังช่วยเหลือ</SelectItem>
                  <SelectItem value="completed">ช่วยเหลือเสร็จสิ้น</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">ชื่อ</Label>
              <Input
                id="edit-name"
                value={formData.name || ''}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="-"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-lastname">นามสกุล</Label>
              <Input
                id="edit-lastname"
                value={formData.lastname || ''}
                onChange={(e) =>
                  setFormData({ ...formData, lastname: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-address">ที่อยู่</Label>
            <Textarea
              id="edit-address"
              value={formData.address || ''}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              rows={3}
              placeholder="-"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-phone">เบอร์โทรศัพท์ (คั่นด้วยจุลภาค)</Label>
            <Input
              id="edit-phone"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="-"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-location_lat">ละติจูด</Label>
              <Input
                id="edit-location_lat"
                value={formData.location_lat || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location_lat: e.target.value
                      ? parseFloat(e.target.value)
                      : null,
                  })
                }
                placeholder="-"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-location_long">ลองติจูด</Label>
              <Input
                id="edit-location_long"
                value={formData.location_long || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location_long: e.target.value
                      ? parseFloat(e.target.value)
                      : null,
                  })
                }
                placeholder="-"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-map_link">ลิงก์ Google Maps</Label>
            <Input
              id="edit-map_link"
              value={formData.map_link || ''}
              onChange={(e) =>
                setFormData({ ...formData, map_link: e.target.value })
              }
              placeholder="https://maps.google.com/..."
            />
          </div>

          <div className="space-y-4">
            <Label>จำนวนผู้ประสบภัย</Label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="edit-adults"
                  className="text-sm text-muted-foreground"
                >
                  ผู้ใหญ่
                </Label>
                <Input
                  id="edit-adults"
                  type="number"
                  min="0"
                  value={formData.number_of_adults}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      number_of_adults: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="edit-children"
                  className="text-sm text-muted-foreground"
                >
                  เด็ก
                </Label>
                <Input
                  id="edit-children"
                  type="number"
                  min="0"
                  value={formData.number_of_children}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      number_of_children: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="edit-infants"
                  className="text-sm text-muted-foreground"
                >
                  ทารก
                </Label>
                <Input
                  id="edit-infants"
                  type="number"
                  min="0"
                  value={formData.number_of_infants || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      number_of_infants: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="edit-seniors"
                  className="text-sm text-muted-foreground"
                >
                  ผู้สูงอายุ
                </Label>
                <Input
                  id="edit-seniors"
                  type="number"
                  min="0"
                  value={formData.number_of_seniors}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      number_of_seniors: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="edit-patients"
                  className="text-sm text-muted-foreground"
                >
                  ผู้ป่วย
                </Label>
                <Input
                  id="edit-patients"
                  type="number"
                  min="0"
                  value={formData.number_of_patients || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      number_of_patients: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-health">ภาวะสุขภาพ</Label>
            <Textarea
              id="edit-health"
              value={formData.health_condition || ''}
              onChange={(e) =>
                setFormData({ ...formData, health_condition: e.target.value })
              }
              rows={2}
              placeholder="-"
            />
          </div>

          <div className="space-y-2">
            <Label>ประเภทความช่วยเหลือที่ต้องการ</Label>
            <div className="grid grid-cols-2 gap-3 p-4 bg-muted/30 rounded-lg">
              {[
                { id: 'drowning', label: 'จมน้ำ' },
                { id: 'trapped', label: 'ติดขัง' },
                { id: 'unreachable', label: 'ติดต่อไม่ได้' },
                { id: 'water', label: 'ขาดน้ำดื่ม' },
                { id: 'food', label: 'ขาดอาหาร' },
                { id: 'electricity', label: 'ขาดไฟฟ้า' },
                { id: 'shelter', label: 'ต้องการที่พักพิง' },
                { id: 'medical', label: 'คนเจ็บ/ต้องการรักษา' },
                { id: 'medicine', label: 'ขาดยา' },
                { id: 'evacuation', label: 'ต้องการอพยพ' },
                { id: 'missing', label: 'คนหาย' },
                { id: 'clothes', label: 'เสื้อผ้า' },
                { id: 'other', label: 'อื่นๆ' },
              ].map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`edit-${category.id}`}
                    checked={
                      formData.help_categories?.includes(category.id) || false
                    }
                    onCheckedChange={(checked) => {
                      const current = formData.help_categories || []
                      const updated = checked
                        ? [...current, category.id]
                        : current.filter((c) => c !== category.id)
                      setFormData({ ...formData, help_categories: updated })
                    }}
                  />
                  <label
                    htmlFor={`edit-${category.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {category.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-help">รายละเอียดความช่วยเหลือเพิ่มเติม</Label>
            <Textarea
              id="edit-help"
              value={formData.help_needed || ''}
              onChange={(e) =>
                setFormData({ ...formData, help_needed: e.target.value })
              }
              rows={2}
              placeholder="-"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-additional">ข้อมูลเพิ่มเติม</Label>
            <Textarea
              id="edit-additional"
              value={formData.additional_info || ''}
              onChange={(e) =>
                setFormData({ ...formData, additional_info: e.target.value })
              }
              rows={3}
              placeholder="-"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-urgency">ระดับความเร่งด่วน</Label>
            <select
              id="edit-urgency"
              value={formData.urgency_level}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  urgency_level: parseInt(e.target.value),
                })
              }
              className="w-full p-2 border rounded-md bg-background"
            >
              <option value="1">1 - ยังไม่โดนน้ำ / แจ้งเตือน</option>
              <option value="2">
                2 - ผู้ใหญ่ทั้งหมด น้ำท่วมชั้นล่าง
                (ไม่มีเด็ก/ผู้สูงอายุ/ทารก/ผู้ป่วย)
              </option>
              <option value="3">
                3 - มีเด็ก หรือผู้สูงอายุ หรือน้ำถึงชั้นสอง
              </option>
              <option value="4">
                4 - เด็กเล็กมาก หรือทารก หรือมีคนไข้/ป่วยติดเตียง
                หรือคนช่วยตัวเองไม่ได้
              </option>
              <option value="5">
                5 - วิกฤต: น้ำถึงหลังคา/ติดบนหลังคา ทารกในอันตราย คนไข้อาการหนัก
                มีคนตาย
              </option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-raw-message">ข้อความต้นฉบับ (Raw Data)</Label>
            <Textarea
              id="edit-raw-message"
              value={formData.raw_message || ''}
              readOnly
              disabled
              rows={4}
              placeholder="-"
              className="font-mono text-sm bg-muted"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>วันที่บันทึก</Label>
              <Input
                value={new Date(formData.created_at).toLocaleString('th-TH')}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label>แก้ไขล่าสุด</Label>
              <Input
                value={new Date(formData.updated_at).toLocaleString('th-TH')}
                disabled
                className="bg-muted"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updateReport.isPending}
          >
            ยกเลิก
          </Button>
          <Button onClick={handleSave} disabled={updateReport.isPending}>
            {updateReport.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                กำลังบันทึก...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                บันทึกการแก้ไข
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
