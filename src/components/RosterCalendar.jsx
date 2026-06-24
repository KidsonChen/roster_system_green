import { useMemo } from 'react'
import { WEEKDAYS, getShiftHours } from '../data/shiftData'

function RosterCalendar({
  currentDate,
  rosters,
  employees,
  locationId,
  shiftTypes,
  onCellClick
}) {
  // 生成當月所有日期
  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const days = new Date(year, month + 1, 0).getDate()
    return Array.from({ length: days }, (_, i) => {
      const date = new Date(year, month, i + 1)
      return {
        day: i + 1,
        date,
        dayOfWeek: date.getDay()
      }
    })
  }, [currentDate])
  
  // 取得某天的班表
  const getRostersForDay = (date) => {
    return rosters.filter(r => {
      const rosterDate = new Date(r.date)
      return rosterDate.toDateString() === date.toDateString() && r.location_id === locationId
    })
  }
  
  // 取得班型資訊
  const getShiftInfo = (shiftCode) => {
    return shiftTypes.find(s => s.code === shiftCode || s.id === shiftCode)
  }
  
  return (
    <div className="roster-calendar">
      {/* 星期標題 */}
      <div className="calendar-header">
        {WEEKDAYS.map((day, idx) => (
          <div key={idx} className="weekday-header">{day}</div>
        ))}
      </div>
      
      {/* 日期網格 */}
      <div className="calendar-grid">
        {/* 填充月初空白天數 */}
        {Array.from({ length: daysInMonth[0]?.dayOfWeek || 0 }).map((_, idx) => (
          <div key={`empty-${idx}`} className="calendar-cell empty"></div>
        ))}
        
        {/* 日期格子 */}
        {daysInMonth.map(({ day, date, dayOfWeek }) => {
          const dayRosters = getRostersForDay(date)
          return (
            <div key={day} className="calendar-cell">
              <div className="cell-date">{day}</div>
              
              {/* 每個班型一行 */}
              {shiftTypes.map((shift) => {
                const roster = dayRosters.find(r => r.shift_code === shift.id || r.shift_code === shift.code)
                const shiftInfo = getShiftInfo(roster?.shift_code)
                const shiftHours = getShiftHours(shift, dayOfWeek)
                
                return (
                  <div 
                    key={shift.id} 
                    className={`shift-row ${roster ? 'has-assignment' : 'empty'}`}
                    onClick={() => onCellClick(date, shift.id, roster)}
                    style={roster ? { borderLeftColor: shift.color } : {}}
                  >
                    <span 
                      className="shift-badge" 
                      style={{ backgroundColor: shift.color }}
                    >
                      {shift.code}
                    </span>
                    {roster ? (
                      <span className="assignment">
                        {employees.find(e => e.id === roster.employee_id)?.name || '未知'}
                        {roster.street_tags && (
                          <span className="street-tag"> ({roster.street_tags})</span>
                        )}
                      </span>
                    ) : (
                      <span className="add-hint">+</span>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default RosterCalendar