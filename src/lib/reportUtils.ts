// Format Case ID from UUID
export const formatCaseId = (id: string): string => {
  return id.substring(0, 8).toUpperCase()
}

// Get urgency badge CSS class
export const getUrgencyBadgeClass = (level: number): string => {
  return `urgency-badge-${level}`
}

// Get urgency level description
export const getUrgencyLabel = (level: number): string => {
  const labels: Record<number, string> = {
    1: 'ยังไม่โดนน้ำ / แจ้งเตือน',
    2: 'ผู้ใหญ่ทั้งหมด น้ำท่วมชั้นล่าง',
    3: 'มีเด็ก หรือผู้สูงอายุ หรือน้ำถึงชั้นสอง',
    4: 'เด็กเล็กมาก หรือทารก หรือมีคนไข้/ป่วยติดเตียง',
    5: 'วิกฤต: น้ำถึงหลังคา/ติดบนหลังคา ทารกในอันตราย',
  }
  return labels[level] || 'ไม่ระบุ'
}

// Get status label in Thai
export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: 'รอความช่วยเหลือ',
    processed: 'กำลังช่วยเหลือ',
    completed: 'ช่วยเหลือเสร็จสิ้น',
  }
  return labels[status] || status
}

// Get help category label in Thai
export const getCategoryLabel = (categoryId: string): string => {
  const categories: Record<string, string> = {
    drowning: 'จมน้ำ',
    trapped: 'ติดขัง',
    unreachable: 'ติดต่อไม่ได้',
    water: 'ขาดน้ำดื่ม',
    food: 'ขาดอาหาร',
    electricity: 'ขาดไฟฟ้า',
    shelter: 'ต้องการที่พักพิง',
    medical: 'คนเจ็บ/ต้องการรักษา',
    medicine: 'ขาดยา',
    evacuation: 'ต้องการอพยพ',
    missing: 'คนหาย',
    clothes: 'เสื้อผ้า',
    other: 'อื่นๆ',
  }
  return categories[categoryId] || categoryId
}

// Calculate total people in a report
export const getTotalPeople = (report: {
  number_of_adults?: number
  number_of_children?: number
  number_of_infants?: number
  number_of_seniors?: number
}): number => {
  return (
    (report.number_of_adults || 0) +
    (report.number_of_children || 0) +
    (report.number_of_infants || 0) +
    (report.number_of_seniors || 0)
  )
}

// Format date to Thai locale (long format with full month name)
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
