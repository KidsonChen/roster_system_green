// 人事成本計算工具

/**
 * 計算當月預估人事成本
 * @param {Array} employees - 員工列表
 * @param {Array} rosters - 班表記錄
 * @returns {Object} - { totalCost, monthlyFixed, hourlyCalculated }
 */
export function calculateMonthlyLaborCost(employees, rosters) {
  // 分離月薪和時薪員工
  const monthlyEmployees = employees.filter(e => e.salary_type === 'monthly')
  const hourlyEmployees = employees.filter(e => e.salary_type === 'hourly')
  
  // 月薪員工成本（固定）
  const monthlyFixed = monthlyEmployees.reduce((sum, emp) => sum + Number(emp.salary_rate || 0), 0)
  
  // 時薪員工成本（根據實際工時計算）
  let hourlyCalculated = 0
  
  hourlyEmployees.forEach(emp => {
    const empRosters = rosters.filter(r => r.employee_id === emp.id)
    const totalHours = empRosters.reduce((sum, r) => sum + Number(r.actual_hours || 0), 0)
    hourlyCalculated += totalHours * Number(emp.salary_rate || 0)
  })
  
  return {
    totalCost: monthlyFixed + hourlyCalculated,
    monthlyFixed,
    hourlyCalculated
  }
}

/**
 * 格式化成本顯示
 * @param {number} cost - 成本金額
 * @returns {string} - 格式化後的字串
 */
export function formatCost(cost) {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(cost)
}