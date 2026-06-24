import { formatCost } from '../utils/laborCost'

function CostDashboard({ costData }) {
  return (
    <div className="cost-dashboard">
      <div className="cost-summary">
        <span className="cost-label">當月預估人事成本總計：</span>
        <span className="cost-value total">{formatCost(costData.totalCost)}</span>
        <span className="cost-breakdown">
          （月薪固定型：{formatCost(costData.monthlyFixed)} | 
           時薪型總計：{formatCost(costData.hourlyCalculated)}）
        </span>
      </div>
    </div>
  )
}

export default CostDashboard