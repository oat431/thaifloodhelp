import { Code } from "lucide-react";

const Api = () => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold flex items-center justify-center gap-2">
            <Code className="h-8 w-8" />
            API Documentation
          </h1>
          <p className="text-muted-foreground">
            หน้าเอกสารและทดลองเรียกใช้งาน API ของระบบช่วยเหลือผู้ประสบภัย
          </p>
        </header>
        <section className="space-y-4 text-sm md:text-base text-muted-foreground">
          <p>
            เส้นทาง API หลักถูกให้บริการผ่านฟังก์ชันของ backend โดยรองรับ JSON รูปแบบเดียวกับหน้ารีวิวที่ thaifloodhelp.com
            คุณสามารถใช้หน้านี้เพื่อแสดงรายละเอียดและตัวอย่างการใช้งาน API ได้ในภายหลัง
          </p>
          <p>
            ตอนนี้หน้า API ถูกสร้างเรียบร้อยแล้ว จึงไม่ควรเจอ 404 อีกต่อไป หากต้องการเพิ่มตัวอย่างโค้ดหรือแบบฟอร์มทดลองยิง API บอกผมได้เลย
          </p>
        </section>
      </div>
    </main>
  );
};

export default Api;
