export const HELP_CATEGORIES = [
  { id: 'drowning', label: 'จมน้ำ', icon: '🌊' },
  { id: 'trapped', label: 'ติดขัง', icon: '🚪' },
  { id: 'unreachable', label: 'ติดต่อไม่ได้', icon: '📵' },
  { id: 'water', label: 'ขาดน้ำดื่ม', icon: '💧' },
  { id: 'food', label: 'ขาดอาหาร', icon: '🍚' },
  { id: 'electricity', label: 'ขาดไฟฟ้า', icon: '⚡' },
  { id: 'shelter', label: 'ที่พักพิง', icon: '🏠' },
  { id: 'medical', label: 'ต้องการรักษา', icon: '🏥' },
  { id: 'medicine', label: 'ขาดยา', icon: '💊' },
  { id: 'evacuation', label: 'อพยพ', icon: '🚁' },
  { id: 'missing', label: 'คนหาย', icon: '🔍' },
  { id: 'clothes', label: 'เสื้อผ้า', icon: '👕' },
] as const

export const STATUS_OPTIONS = [
  { value: 'pending', label: 'รอความช่วยเหลือ', color: 'yellow' },
  { value: 'processed', label: 'กำลังช่วยเหลือ', color: 'blue' },
  { value: 'completed', label: 'ช่วยเหลือเสร็จสิ้น', color: 'green' },
] as const

export const URGENCY_LEVELS = [1, 2, 3, 4, 5] as const

export const URGENCY_COLORS = {
  1: '#94a3b8',
  2: '#60a5fa',
  3: '#fbbf24',
  4: '#fb923c',
  5: '#ef4444',
} as const
