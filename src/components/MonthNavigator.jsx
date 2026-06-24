function MonthNavigator({ currentDate, onMonthChange }) {
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1
  
  const handlePrevMonth = () => {
    onMonthChange(new Date(year, month - 2, 1))
  }
  
  const handleNextMonth = () => {
    onMonthChange(new Date(year, month, 1))
  }
  
  return (
    <div className="month-navigator">
      <button className="nav-btn" onClick={handlePrevMonth}>&lt;</button>
      <span className="current-month">{year} 年 {month} 月</span>
      <button className="nav-btn" onClick={handleNextMonth}>&gt;</button>
    </div>
  )
}

export default MonthNavigator