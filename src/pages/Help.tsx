import {
  AlertTriangle,
  ArrowRight,
  FileText,
  Search,
  Users,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const Help = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">ศูนย์ช่วยเหลือ</h1>
          <p className="text-muted-foreground">คู่มือการใช้งานและข้อมูลสำคัญ</p>
        </div>

        {/* Disclaimer */}
        <Card className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-500">
              <AlertTriangle className="h-5 w-5" />
              ข้อจำกัดความรับผิดชอบ (Disclaimer)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              แพลตฟอร์มนี้เป็น{' '}
              <strong>เครื่องมือรวบรวมข้อมูลจากโซเชียลมีเดีย</strong>{' '}
              เพื่อช่วยในการจัดการข้อมูลผู้ประสบภัยน้ำท่วมให้อยู่ในที่เดียวกัน
              ทำให้ง่ายต่อการติดตาม วิเคราะห์ และประสานงานการช่วยเหลือ
            </p>
            <div className="space-y-2">
              <p className="font-semibold">โปรดทราบ:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>ข้อมูลทั้งหมดมาจากการรายงานของประชาชนผ่านช่องทางต่างๆ</li>
                <li>
                  ระบบใช้ AI ในการประมวลผลข้อมูล ซึ่งอาจมีความคลาดเคลื่อนได้
                </li>
                <li>ข้อมูลควรได้รับการตรวจสอบความถูกต้องก่อนนำไปใช้</li>
                <li>
                  <strong>ทุกคนสามารถแก้ไขข้อมูลได้</strong> -
                  นี่คือแพลตฟอร์มแบบเปิดเพื่อให้ทุกคนช่วยกันอัปเดตข้อมูล
                </li>
                <li>
                  <strong>กรุณาอัปเดตสถานะเมื่อช่วยเหลือเสร็จสิ้น</strong> -
                  ช่วยให้ทีมงานไม่ต้องช่วยเหลือซ้ำซ้อน
                </li>
                <li>
                  แพลตฟอร์มนี้ไม่ใช่หน่วยงานราชการ เป็นเพียงเครื่องมือช่วยเหลือ
                </li>
                <li>สำหรับกรณีฉุกเฉินโปรดติดต่อหน่วยงานที่เกี่ยวข้องโดยตรง</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* About the Platform */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              เกี่ยวกับแพลตฟอร์ม
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              <strong>Thai Flood Help</strong>{' '}
              เป็นแพลตฟอร์มที่พัฒนาขึ้นเพื่อช่วยรวบรวมข้อมูลผู้ประสบภัยน้ำท่วมจากหลายแหล่ง
              โดยใช้เทคโนโลยี AI และ Machine Learning
              ในการประมวลผลข้อมูลอัตโนมัติ
            </p>
            <div className="space-y-2">
              <p className="font-semibold">คุณสมบัติหลัก:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>รับข้อมูลจากข้อความ, รูปภาพ (OCR), และลิงก์ Google Maps</li>
                <li>
                  ใช้ AI ในการสกัดข้อมูลอัตโนมัติ (ชื่อ, ที่อยู่, เบอร์โทร,
                  ความต้องการ)
                </li>
                <li>แสดงข้อมูลบนแผนที่ความร้อน (Heatmap)</li>
                <li>ค้นหาด้วย AI และค้นหาแบบธรรมดา</li>
                <li>
                  กรองข้อมูลตามความเร่งด่วน, สถานะ, และประเภทความช่วยเหลือ
                </li>
                <li>ตรวจจับข้อมูลซ้ำซ้อนอัตโนมัติ</li>
                <li>ส่งออกข้อมูลเป็น CSV</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* User Flow 1: Data Submission */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              การใช้งาน 1: ส่งข้อมูลผู้ประสบภัย
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">ไปที่หน้าแรก</h3>
                  <p className="text-sm text-muted-foreground">
                    คลิก "รายงานผู้ประสบภัย" หรือไปที่เมนู "Input"
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">กรอกข้อมูล</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    เลือกวิธีการส่งข้อมูล:
                  </p>
                  <ul className="text-sm space-y-1 ml-4 list-disc list-inside text-muted-foreground">
                    <li>
                      <strong>ข้อความ:</strong> วางข้อความจากโพสต์โซเชียลมีเดีย
                    </li>
                    <li>
                      <strong>รูปภาพ:</strong> อัปโหลดรูปที่มีข้อความ (รองรับ
                      OCR)
                    </li>
                    <li>
                      <strong>Google Maps:</strong> วางลิงก์ตำแหน่ง
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">ระบบประมวลผลอัตโนมัติ</h3>
                  <p className="text-sm text-muted-foreground">
                    AI จะสกัดข้อมูล: ชื่อ, ที่อยู่, เบอร์โทร, จำนวนผู้ประสบภัย,
                    อาการ, ความต้องการ และระดับความเร่งด่วน
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">ตรวจสอบข้อมูลซ้ำ</h3>
                  <p className="text-sm text-muted-foreground">
                    ระบบจะตรวจสอบว่ามีข้อมูลคล้ายกันอยู่แล้วหรือไม่
                    และแจ้งเตือนถ้าพบ
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                  5
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">ตรวจสอบและแก้ไข</h3>
                  <p className="text-sm text-muted-foreground">
                    ตรวจสอบข้อมูลที่ AI สกัดมา แก้ไขถ้าจำเป็น แล้วกดบันทึก
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-success text-success-foreground rounded-full flex items-center justify-center font-bold">
                  ✓
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">เสร็จสิ้น</h3>
                  <p className="text-sm text-muted-foreground">
                    ข้อมูลถูกบันทึกและแสดงใน Dashboard
                    พร้อมสำหรับการติดตามและประสานงาน
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Flow 2: Viewing and Managing Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              การใช้งาน 2: ดูและจัดการข้อมูล
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">เข้าสู่ Dashboard</h3>
                  <p className="text-sm text-muted-foreground">
                    คลิก "ดูข้อมูลทั้งหมด" จากหน้าแรก หรือไปที่เมนู "Dashboard"
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">เลือกโหมดการค้นหา</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    เลือกระหว่าง:
                  </p>
                  <ul className="text-sm space-y-1 ml-4 list-disc list-inside text-muted-foreground">
                    <li>
                      <strong>AI Search:</strong> ค้นหาด้วยความหมาย
                      (เข้าใจบริบท)
                    </li>
                    <li>
                      <strong>Manual Search:</strong> ค้นหาแบบธรรมดา (คำต่อคำ)
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">ใช้ตัวกรอง (Filters)</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    กรองข้อมูลตาม:
                  </p>
                  <ul className="text-sm space-y-1 ml-4 list-disc list-inside text-muted-foreground">
                    <li>
                      <strong>สถานะ:</strong> รอความช่วยเหลือ / กำลังช่วยเหลือ /
                      ช่วยเหลือเสร็จสิ้น
                    </li>
                    <li>
                      <strong>ระดับความเร่งด่วน:</strong> 1-5
                    </li>
                    <li>
                      <strong>ประเภทความช่วยเหลือ:</strong> จมน้ำ, ติดขัง,
                      ขาดอาหาร, ฯลฯ
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">เรียงลำดับข้อมูล</h3>
                  <p className="text-sm text-muted-foreground">
                    คลิกที่หัวคอลัมน์เพื่อเรียงลำดับ: วันที่, ความเร่งด่วน,
                    สถานะ, จำนวนคน
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                  5
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">ดูรายละเอียด</h3>
                  <p className="text-sm text-muted-foreground">
                    คลิกที่แถวเพื่อขยายดูข้อมูลเต็ม, แผนที่, และข้อมูลดิบ
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                  6
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">แก้ไขข้อมูล</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    คลิก "แก้ไขข้อมูล" เพื่ออัปเดตข้อมูลหรือเปลี่ยนสถานะ
                  </p>
                  <div className="bg-muted/50 rounded-md p-3 space-y-2">
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-500">
                      ⚠️ สำคัญ: ทุกคนสามารถแก้ไขข้อมูลได้
                    </p>
                    <ul className="text-xs space-y-1 ml-4 list-disc list-inside text-muted-foreground">
                      <li>
                        ผู้ใช้ทั่วไปและผู้ดูแลระบบสามารถแก้ไขข้อมูลได้ทั้งหมด
                      </li>
                      <li>
                        เมื่อช่วยเหลือเสร็จสิ้น{' '}
                        <strong>กรุณาอัปเดตสถานะ</strong> เป็น
                        "ช่วยเหลือเสร็จสิ้น"
                      </li>
                      <li>
                        หากพบข้อมูลผิดพลาดหรือซ้ำซ้อน กรุณาแก้ไขให้ถูกต้อง
                      </li>
                      <li>
                        การอัปเดตสถานะช่วยให้ทีมงานรู้ว่าควรช่วยเหลือใครต่อไป
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                  7
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">ส่งออกข้อมูล</h3>
                  <p className="text-sm text-muted-foreground">
                    คลิก "ส่งออก CSV" เพื่อดาวน์โหลดข้อมูลทั้งหมด
                    (ตามตัวกรองที่เลือก)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                  8
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">
                    ใช้ Query Bot (ทางเลือก)
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    คลิกไอคอนแชทด้านล่างขวาเพื่อถามคำถามด้วยภาษาธรรมชาติ เช่น
                    "มีใครขาดอาหารบ้าง"
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Help */}
        <Card>
          <CardHeader>
            <CardTitle>ต้องการความช่วยเหลือเพิ่มเติม?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">
              หากพบปัญหาหรือต้องการสอบถามข้อมูลเพิ่มเติม กรุณาติดต่อ:
            </p>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  window.open(
                    'https://github.com/winn/thaifloodhelp/issues',
                    '_blank',
                  )
                }
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                รายงานปัญหาบน GitHub
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Help
