// 預設班型（可被自定義覆蓋）
export const DEFAULT_SHIFT_TYPES = {
  A: { 
    id: 'A', code: 'A', name: 'A班', 
    startTime: '07:45', endTime: '16:45', 
    hoursMonFri: 9.0, hoursOther: 9.0,
    color: '#4caf50'
  },
  B: { 
    id: 'B', code: 'B', name: 'B班', 
    startTime: '10:00', endTime: '19:00', 
    hoursMonFri: 9.0, hoursOther: 9.0,
    color: '#2196f3'
  },
  C: { 
    id: 'C', code: 'C', name: 'C班', 
    startTime: '12:30', endTime: '21:30', 
    hoursMonFri: 9.0, hoursOther: 9.0,
    color: '#ff9800'
  },
  D: { 
    id: 'D', code: 'D', name: 'D班', 
    startTime: '09:00', endTime: '18:00', 
    hoursMonFri: 9.0, hoursOther: 9.0,
    color: '#9c27b0'
  },
  M: { 
    id: 'M', code: 'M', name: 'Shift M', 
    startTime: '08:00', endTime: '21:30', 
    hoursMonFri: 13.5, hoursOther: 13.5,
    color: '#f44336'
  },
  R1: { 
    id: 'R1', code: 'R1', name: 'R1', 
    startTime: '09:30', endTime: '13:30', 
    hoursMonFri: 4.0, hoursOther: 4.0,
    color: '#00bcd4'
  },
  R2: { 
    id: 'R2', code: 'R2', name: 'R2', 
    startTime: '14:00', endTime: '18:00', 
    hoursMonFri: 4.0, hoursOther: 4.0,
    color: '#e91e63'
  },
  R3: { 
    id: 'R3', code: 'R3', name: 'R3', 
    startTime: '17:00', endTime: '21:30', 
    hoursMonFri: 4.5, hoursOther: 4.0,
    color: '#795548'
  },
  R4: { 
    id: 'R4', code: 'R4', name: 'R4', 
    startTime: '14:00', endTime: '21:30', 
    hoursMonFri: 7.5, hoursOther: 7.5,
    color: '#607d8b'
  },
  R5: { 
    id: 'R5', code: 'R5', name: 'R5', 
    startTime: '18:00', endTime: '21:30', 
    hoursMonFri: 3.5, hoursOther: 3.0,
    color: '#ff5722'
  },
  R6: { 
    id: 'R6', code: 'R6', name: 'R6', 
    startTime: '14:30', endTime: '21:30', 
    hoursMonFri: 7.0, hoursOther: 7.0,
    color: '#3f51b5'
  },
}

// 根據星期幾取得工時
export function getShiftHours(shift, dayOfWeek) {
  // dayOfWeek: 0=週日, 1=週一, ..., 6=週六
  if (!shift) return 0
  
  if ([1, 5].includes(dayOfWeek)) {
    // 週一、週五
    return Number(shift.hoursMonFri || 0)
  }
  return Number(shift.hoursOther || shift.hoursMonFri || 0)
}

// 地點定義
export const LOCATIONS = [
  { id: 1, name: '店鋪 A', color: '#4caf50' },
  { id: 2, name: '店鋪 B', color: '#2196f3' },
  { id: 3, name: '店鋪 C', color: '#ff9800' },
  { id: 4, name: '外派街站', color: '#9c27b0' },
]

export const LOCATION_IDS = {
  A: 1,
  B: 2,
  C: 3,
  STREET: 4,
}

// 星期幾名稱
export const WEEKDAYS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

// 街站時段標籤
export const STREET_TAGS = [
  { code: 'AM', label: '上午' },
  { code: 'PM', label: '下午' },
  { code: 'N', label: '晚上' },
]