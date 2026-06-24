import { useMemo } from 'react'

function AvailabilityMatrix({
  currentDate,
  employees,
  availability,
  onAvailabilityChange
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
        dateStr: date.toISOString().split('T')[0]
      }
    })
  }, [currentDate])
  
  const handleToggle = (employeeId, dateStr) => {
    const key = `${employeeId}-${dateStr}`
    const currentValue = availability[key]
    onAvailabilityChange(employeeId, dateStr, currentValue === true ? false : true)
  }
  
  return (
    <div className="availability-matrix">
      <h3>員工可用性管理</h3>
      <table className="availability-table">
        <thead>
          <tr>
            <th>員工</th>
            {daysInMonth.map(({ day, date }) => (
              <th key={day} className={date.getDay() === 0 || date.getDay() === 6 ? 'weekend' : ''}>
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {employees.map(emp => (
            <tr key={emp.id}>
              <td className="employee-name">
                {emp.name}
                <br/>
                <small>{emp.role === 'supervisor' ? 'Supervisor' : emp.role === 'full_time' ? '正職' : '兼職'}</small>
              </td>
              {daysInMonth.map(({ dateStr }) => {
                const key = `${emp.id}-${dateStr}`
                const isAvailable = availability[key]
                return (
                  <td 
                    key={dateStr}
                    className={`availability-cell ${isAvailable === true ? 'available' : isAvailable === false ? 'unavailable' : ''}`}
                    onClick={() => handleToggle(emp.id, dateStr)}
                  >
                    {isAvailable === true && '可'}
                    {isAvailable === false && '不可'}
                    {isAvailable === undefined && '-'}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AvailabilityMatrix