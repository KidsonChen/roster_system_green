import { useMemo } from 'react'
import { WEEKDAYS } from '../data/shiftData'

function StreetSummary({ 
  currentDate, 
  rosters, 
  employees,
  onCellClick 
}) {
  // 只顯示外派街站的班表
  const streetRosters = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const days = new Date(year, month + 1, 0).getDate()
    
    const result = []
    for (let day = 1; day <= days; day++) {
      const date = new Date(year, month, day)
      const dateStr = date.toISOString().split('T')[0]
      const dayOfWeek = date.getDay()
      
      const dayStreetRosters = rosters
        .filter(r => r.date === dateStr && r.street_tags)
        .map(r => ({
          ...r,
          date,
          dayOfWeek,
          employee: employees.find(e => e.id === r.employee_id)
        }))
      
      result.push(...dayStreetRosters)
    }
    return result
  }, [currentDate, rosters, employees])
  
  return (
    <div className="street-summary">
      <h3>外派街站匯總</h3>
      {streetRosters.length === 0 ? (
        <p className="no-data">本月尚無街站紀錄</p>
      ) : (
        <table className="street-table">
          <thead>
            <tr>
              <th>日期</th>
              <th>星期</th>
              <th>員工</th>
              <th>班型</th>
              <th>街站時段</th>
            </tr>
          </thead>
          <tbody>
            {streetRosters.map(r => (
              <tr key={r.id} onClick={() => onCellClick(r.date, r.shift_code, r)}>
                <td>{r.date.getMonth() + 1}/{r.date.getDate()}</td>
                <td>{WEEKDAYS[r.dayOfWeek]}</td>
                <td>{r.employee?.name || '未知'}</td>
                <td>{r.shift_code}</td>
                <td>{r.street_tags}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default StreetSummary