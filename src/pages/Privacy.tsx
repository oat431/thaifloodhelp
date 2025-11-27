import { Shield, Database, Eye, Lock, UserCheck, Bell, Mail } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">นโยบายความเป็นส่วนตัว</h1>
          <p className="text-muted-foreground">
            Privacy Policy - Thai Flood Help Platform
          </p>
          <p className="text-sm text-muted-foreground">
            วันที่มีผลบังคับใช้: 27 พฤศจิกายน 2567
          </p>
        </div>

        {/* Introduction */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              บทนำ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              Thai Flood Help ("แพลตฟอร์ม", "เรา") ให้ความสำคัญกับความเป็นส่วนตัวของผู้ใช้งาน
              นโยบายความเป็นส่วนตัวนี้อธิบายถึงวิธีการเก็บรวบรวม ใช้งาน เปิดเผย
              และปกป้องข้อมูลส่วนบุคคลของท่านเมื่อใช้งานแพลตฟอร์มของเรา
            </p>
            <p>
              แพลตฟอร์มนี้เป็นเครื่องมือรวบรวมข้อมูลเพื่อช่วยเหลือผู้ประสบภัยน้ำท่วม
              โดยมีวัตถุประสงค์เพื่อประโยชน์สาธารณะและการช่วยเหลือด้านมนุษยธรรม
            </p>
          </CardContent>
        </Card>

        {/* Data Collection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              ข้อมูลที่เราเก็บรวบรวม
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="font-semibold mb-2">1. ข้อมูลผู้ประสบภัย</p>
              <p className="mb-2">
                ข้อมูลที่ผู้ใช้งานส่งเข้ามาเพื่อขอความช่วยเหลือหรือรายงานผู้ประสบภัย:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>ชื่อ-นามสกุล ของผู้ประสบภัย</li>
                <li>ที่อยู่และตำแหน่งที่ตั้ง (รวมถึงพิกัด GPS)</li>
                <li>หมายเลขโทรศัพท์ติดต่อ</li>
                <li>จำนวนผู้ประสบภัยและรายละเอียดกลุ่มเปราะบาง (ผู้สูงอายุ เด็ก ผู้ป่วย ฯลฯ)</li>
                <li>ความต้องการความช่วยเหลือและระดับความเร่งด่วน</li>
                <li>อาการหรือสภาพที่ต้องการความช่วยเหลือเร่งด่วน</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold mb-2">2. ข้อมูลการใช้งาน</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>ข้อมูลอุปกรณ์และเบราว์เซอร์</li>
                <li>ที่อยู่ IP</li>
                <li>หน้าที่เข้าชมและการดำเนินการบนแพลตฟอร์ม</li>
                <li>ข้อมูล Line User Id ของผู้แจ้งรายงาน</li>
                <li>วันที่และเวลาในการเข้าใช้งาน</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold mb-2">3. ข้อมูลจากบุคคลที่สาม</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>ข้อมูลจากโพสต์โซเชียลมีเดียที่ผู้ใช้คัดลอกมาส่ง</li>
                <li>ข้อมูลตำแหน่งจาก Google Maps</li>
                <li>ข้อมูลจากรูปภาพที่อัปโหลด (ผ่านการประมวลผล OCR)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Purpose of Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              วัตถุประสงค์ในการใช้ข้อมูล
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>เราใช้ข้อมูลที่เก็บรวบรวมเพื่อวัตถุประสงค์ดังต่อไปนี้:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>
                <strong>การประสานงานช่วยเหลือ:</strong>{' '}
                รวบรวมและแสดงข้อมูลผู้ประสบภัยเพื่อให้หน่วยกู้ภัยและอาสาสมัครสามารถเข้าช่วยเหลือได้อย่างมีประสิทธิภาพ
              </li>
              <li>
                <strong>การติดตามสถานะ:</strong>{' '}
                ติดตามความคืบหน้าในการช่วยเหลือและป้องกันการช่วยเหลือซ้ำซ้อน
              </li>
              <li>
                <strong>การวิเคราะห์สถานการณ์:</strong>{' '}
                สร้างภาพรวมของสถานการณ์น้ำท่วมและพื้นที่ที่ต้องการความช่วยเหลือเร่งด่วน
              </li>
              <li>
                <strong>การปรับปรุงบริการ:</strong>{' '}
                พัฒนาและปรับปรุงแพลตฟอร์มให้มีประสิทธิภาพมากขึ้น
              </li>
              <li>
                <strong>การรายงานสถิติ:</strong>{' '}
                จัดทำสถิติและรายงานสำหรับหน่วยงานที่เกี่ยวข้อง (โดยไม่ระบุตัวตน)
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Data Sharing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              การเปิดเผยและแบ่งปันข้อมูล
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-500/50 rounded-md p-3 mb-4">
              <p className="font-semibold text-amber-700 dark:text-amber-500 mb-2">
                สำคัญ: แพลตฟอร์มนี้เป็นแพลตฟอร์มแบบเปิด
              </p>
              <p className="text-amber-700 dark:text-amber-400">
                ข้อมูลผู้ประสบภัยที่ส่งเข้ามาจะแสดงบน Dashboard สาธารณะ
                เพื่อให้ทุกคนสามารถเข้าถึงและช่วยเหลือได้
                กรุณาพิจารณาก่อนส่งข้อมูลส่วนบุคคลที่ละเอียดอ่อน
              </p>
            </div>

            <p>เราอาจเปิดเผยข้อมูลแก่:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>
                <strong>ผู้ใช้งานทั่วไป:</strong>{' '}
                ข้อมูลผู้ประสบภัยแสดงบน Dashboard สาธารณะเพื่อการประสานงานช่วยเหลือ
              </li>
              <li>
                <strong>หน่วยกู้ภัยและอาสาสมัคร:</strong>{' '}
                เพื่อการเข้าช่วยเหลือผู้ประสบภัย
              </li>
              <li>
                <strong>หน่วยงานราชการ:</strong>{' '}
                เมื่อได้รับการร้องขอตามกฎหมาย หรือเพื่อประโยชน์ในการบรรเทาสาธารณภัย
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Data Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              การรักษาความปลอดภัยของข้อมูล
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              เราใช้มาตรการรักษาความปลอดภัยที่เหมาะสมเพื่อปกป้องข้อมูลของท่าน:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>การเข้ารหัสข้อมูลระหว่างการส่ง (HTTPS/TLS)</li>
              <li>การจำกัดสิทธิ์การเข้าถึงระบบฐานข้อมูล</li>
              <li>การสำรองข้อมูลเป็นประจำ</li>
              <li>การตรวจสอบและบันทึกการเข้าถึงระบบ</li>
            </ul>
            <p className="mt-3">
              อย่างไรก็ตาม ไม่มีระบบใดที่ปลอดภัย 100%
              เราจึงไม่สามารถรับประกันความปลอดภัยของข้อมูลได้อย่างสมบูรณ์
            </p>
          </CardContent>
        </Card>

        {/* User Rights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              สิทธิ์ของเจ้าของข้อมูล
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA) ท่านมีสิทธิ์ดังนี้:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>
                <strong>สิทธิ์ในการเข้าถึง:</strong>{' '}
                ขอสำเนาข้อมูลส่วนบุคคลของท่านที่เราเก็บรักษา
              </li>
              <li>
                <strong>สิทธิ์ในการแก้ไข:</strong>{' '}
                ขอแก้ไขข้อมูลที่ไม่ถูกต้องหรือไม่สมบูรณ์
              </li>
              <li>
                <strong>สิทธิ์ในการลบ:</strong>{' '}
                ขอให้ลบข้อมูลส่วนบุคคลของท่าน (ภายใต้เงื่อนไขที่กฎหมายกำหนด)
              </li>
              <li>
                <strong>สิทธิ์ในการคัดค้าน:</strong>{' '}
                คัดค้านการประมวลผลข้อมูลในบางกรณี
              </li>
              <li>
                <strong>สิทธิ์ในการโอนย้าย:</strong>{' '}
                ขอรับข้อมูลในรูปแบบที่สามารถอ่านได้ด้วยเครื่อง
              </li>
              <li>
                <strong>สิทธิ์ในการถอนความยินยอม:</strong>{' '}
                ถอนความยินยอมที่เคยให้ไว้ได้ทุกเมื่อ
              </li>
            </ul>
            <p className="mt-3">
              <strong>หมายเหตุ:</strong> เนื่องจากข้อมูลผู้ประสบภัยอาจถูกส่งโดยบุคคลอื่น
              หากท่านพบข้อมูลของท่านบนแพลตฟอร์มและต้องการแก้ไขหรือลบ
              กรุณาติดต่อเราผ่านช่องทางด้านล่าง
            </p>
          </CardContent>
        </Card>

        {/* Data Retention */}
        <Card>
          <CardHeader>
            <CardTitle>ระยะเวลาในการเก็บรักษาข้อมูล</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>
                <strong>ข้อมูลผู้ประสบภัย:</strong>{' '}
                จะถูกเก็บรักษาตลอดช่วงเหตุการณ์น้ำท่วมและอาจถูกเก็บรักษาต่อไป
                เพื่อวัตถุประสงค์ทางสถิติและการวิจัย
              </li>
              <li>
                <strong>ข้อมูลการใช้งาน:</strong>{' '}
                จะถูกเก็บรักษาเป็นระยะเวลา 1 ปี นับจากวันที่เก็บรวบรวม
              </li>
              <li>
                <strong>หลังสิ้นสุดเหตุการณ์:</strong>{' '}
                ข้อมูลที่ระบุตัวตนได้อาจถูกลบหรือทำให้เป็นข้อมูลนิรนาม
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Cookies */}
        <Card>
          <CardHeader>
            <CardTitle>คุกกี้และเทคโนโลยีติดตาม</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>แพลตฟอร์มอาจใช้คุกกี้และเทคโนโลยีที่คล้ายกันเพื่อ:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>จดจำการตั้งค่าและการเข้าสู่ระบบของท่าน</li>
              <li>วิเคราะห์การใช้งานแพลตฟอร์ม</li>
              <li>ปรับปรุงประสบการณ์การใช้งาน</li>
            </ul>
            <p className="mt-3">
              ท่านสามารถตั้งค่าเบราว์เซอร์ให้ปฏิเสธคุกกี้ได้
              แต่อาจทำให้บางฟีเจอร์ของแพลตฟอร์มไม่ทำงานอย่างถูกต้อง
            </p>
          </CardContent>
        </Card>

        {/* Changes to Policy */}
        <Card>
          <CardHeader>
            <CardTitle>การเปลี่ยนแปลงนโยบาย</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              เราอาจปรับปรุงนโยบายความเป็นส่วนตัวนี้เป็นครั้งคราว
              การเปลี่ยนแปลงที่สำคัญจะถูกประกาศบนแพลตฟอร์ม
              เราแนะนำให้ท่านตรวจสอบนโยบายนี้เป็นระยะ
            </p>
            <p>
              การใช้งานแพลตฟอร์มต่อไปหลังจากมีการเปลี่ยนแปลง
              ถือว่าท่านยอมรับนโยบายที่ปรับปรุงแล้ว
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              ติดต่อเรา
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              หากท่านมีคำถามเกี่ยวกับนโยบายความเป็นส่วนตัวนี้ หรือต้องการใช้สิทธิ์เกี่ยวกับข้อมูลส่วนบุคคล
              กรุณาติดต่อเราผ่านช่องทาง:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>
                <strong>GitHub:</strong>{' '}
                <a
                  href="https://github.com/winn/thaifloodhelp/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  github.com/winn/thaifloodhelp/issues
                </a>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <div className="text-center text-sm text-muted-foreground pb-8">
          <p>
            นโยบายความเป็นส่วนตัวนี้ใช้กับแพลตฟอร์ม Thai Flood Help เท่านั้น
          </p>
          <p className="mt-2">
            ปรับปรุงล่าสุด: 27 พฤศจิกายน 2567
          </p>
        </div>
      </div>
    </div>
  )
}

export default Privacy
