import { useState, useMemo } from 'react'
import { LOCATIONS, getShiftHours, WEEKDAYS } from '../data/shiftData'

function AutoScheduleModal({
  isOpen,
  onClose,
  onConfirm,
  currentDate,
  employees,
  shiftTypes,
  availability,
  existingRosters
}) {
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  
  // 員工店鋪偏好設定
  const [employeePrefs, setEmployeePrefs] = useState({})
  
  // 各店鋪人數需求設定
  const [storeRequirements, setStoreRequirements] = useState({
    1: {}, // 店鋪 A
    2: {}, // 店鋪 B
    3: {}  // 店鋪 C
  })
  
  // 排班選項
  const [options, setOptions] = useState({
    distributeEvenly: true, // 平均分配
    prioritizePreference: true, // 優先員工偏好
    fillEmptySlots: true, // 填滿空位
    avoidConsecutiveDays: false // 避免連續上班
  })
  
  // 初始化店鋪需求（預設每個班型需要 1 人）
  const initializeRequirements = useMemo(() => {
    const reqs = {
      1: {}, 2: {}, 3: {}
    }
    shiftTypes.forEach(shift => {
      reqs[1][shift.id] = 1
      reqs[2][shift.id] = 1
      reqs[3][shift.id] = 1
    })
    return reqs
  }, [shiftTypes])
  
  // 取得某天的星期幾
  const getDayOfWeek = (day) => {
    return new Date(year, month, day).getDay()
  }
  
  // 取得某員工在某天是否可用
  const isEmployeeAvailable = (empId, day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const key = `${empId}-${dateStr}`
    return availability[key] !== false
  }
  
  // 取得員工已被排班的班型
  const getEmployeeScheduledShifts = (empId, day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return existingRosters
      .filter(r => r.date === dateStr && r.employee_id === empId)
      .map(r => r.shift_code)
  }
  
  // 取得某店鋪某班型已排人數
  const getStoreShiftCount = (storeId, shiftId, day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return existingRosters.filter(
      r => r.date === dateStr && r.location_id === storeId && r.shift_code === shiftId
    ).length
  }
  
  // 自動排班核心算法
  const autoGenerateSchedule = () => {
    const newRosters = []
    const usedAssignments = new Set() // 追蹤已使用的 (empId, date, shiftCode)
    
    // 為每天每個班型進行排班
    for (let day = 1; day <= daysInMonth; day++) {
      const dayOfWeek = getDayOfWeek(day)
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      
      for (const storeId of [1, 2, 3]) {
        for (const shift of shiftTypes) {
          const required = storeRequirements[storeId]?.[shift.id] || 0
          const currentCount = getStoreShiftCount(storeId, shift.id, day)
          const needed = required - currentCount
          
          if (needed <= 0) continue
          
          // 取得候選員工
          let candidates = employees.filter(emp => {
            // 檢查是否可用
            if (!isEmployeeAvailable(emp.id, day)) return false
            
            // 檢查是否已被排其他班
            const scheduled = getEmployeeScheduledShifts(emp.id, day)
            if (scheduled.length > 0) return false
            
            // 檢查是否已被排此班型
            const assignmentKey = `${emp.id}-${dateStr}-${shift.id}`
            if (usedAssignments.has(assignmentKey)) return false
            
            // 檢查是否已排此店
            const storeAssignment = existingRosters.find(
              r => r.date === dateStr && r.employee_id === emp.id && r.location_id === storeId
            )
            if (storeAssignment) return false
            
            return true
          })
          
          // 根據偏好排序
          if (options.prioritizePreference) {
            candidates.sort((a, b) => {
              const prefA = employeePrefs[a.id] || 0
              const prefB = employeePrefs[b.id] || 0
              return prefB - prefA // 偏好高的排前面
            })
          }
          
          // 平均分配：已排班少的優先
          if (options.distributeEvenly) {
            candidates.sort((a, b) => {
              const countA = existingRosters.filter(r => r.employee_id === a.id).length
              const countB = existingRosters.filter(r => r.employee_id === b.id).length
              return countA - countB
            })
          }
          
          // 選擇候選人
          const selected = candidates.slice(0, needed)
          
          selected.forEach(emp => {
            const hours = getShiftHours(shift, dayOfWeek)
            newRosters.push({
              id: Date.now() + Math.random(),
              date: dateStr,
              employee_id: emp.id,
              location_id: storeId,
              shift_code: shift.id,
              actual_hours: hours,
              street_tags: null
            })
            usedAssignments.add(`${emp.id}-${dateStr}-${shift.id}`)
          })
        }
      }
    }
    
    return newRosters
  }
  
  const handleConfirm = () => {
    const newRosters = autoGenerateSchedule()
    onConfirm(newRosters)
    onClose()
  }
  
  // 預覽排班結果
  const previewResult = useMemo(() => {
    return autoGenerateSchedule()
  }, [storeRequirements, employeePrefs, options])
  
  if (!isOpen) return null
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content auto-schedule-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>一鍵自動排班</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body">
          {/* 步驟 1：設定店鋪需求 */}
          <div className="config-section">
            <h4>步驟 1：設定各店鋪人數需求</h4>
            <div className="store-requirements">
              {LOCATIONS.filter(l => l.id <= 3).map(store => (
                <div key={store.id} className="store-req-item">
                  <div className="store-header" style={{ borderLeftColor: store.color }}>
                    {store.name}
                  </div>
                  <div className="shift-requirements">
                    {shiftTypes.map(shift => (
                      <div key={shift.id} className="shift-req">
                        <span>{shift.code}</span>
                        <input 
                          type="number" 
                          min="0"
                          max="10"
                          value={storeRequirements[store.id]?.[shift.id] ?? 1}
                          onChange={e => {
                            setStoreRequirements(prev => ({
                              ...prev,
                              [store.id]: {
                                ...prev[store.id],
                                [shift.id]: parseInt(e.target.value) || 0
                              }
                            }))
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* 步驟 2：員工偏好設定 */}
          <div className="config-section">
            <h4>步驟 2：員工店鋪偏好（數字越大越優先）</h4>
            <div className="employee-prefs">
              {employees.map(emp => (
                <div key={emp.id} className="emp-pref-item">
                  <span className="emp-name">{emp.name}</span>
                  <select 
                    value={employeePrefs[emp.id] || 0}
                    onChange={e => setEmployeePrefs(prev => ({
                      ...prev,
                      [emp.id]: parseInt(e.target.value)
                    }))}
                  >
                    <option value={0}>無偏好</option>
                    <option value={1}>偏好店鋪 A</option>
                    <option value={2}>偏好店鋪 B</option>
                    <option value={3}>偏好店鋪 C</option>
                  </select>
                  <span className="emp-role">
                    ({emp.role === 'supervisor' ? 'Supervisor' : emp.role === 'full_time' ? '正職' : '兼職'})
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* 步驟 3：排班選項 */}
          <div className="config-section">
            <h4>步驟 3：排班選項</h4>
            <div className="schedule-options">
              <label className="option-item">
                <input 
                  type="checkbox" 
                  checked={options.distributeEvenly}
                  onChange={e => setOptions(prev => ({ ...prev, distributeEvenly: e.target.checked }))}
                />
                平均分配工作量（已排班少的優先）
              </label>
              <label className="option-item">
                <input 
                  type="checkbox" 
                  checked={options.prioritizePreference}
                  onChange={e => setOptions(prev => ({ ...prev, prioritizePreference: e.target.checked }))}
                />
                優先考慮員工店鋪偏好
              </label>
              <label className="option-item">
                <input 
                  type="checkbox" 
                  checked={options.fillEmptySlots}
                  onChange={e => setOptions(prev => ({ ...prev, fillEmptySlots: e.target.checked }))}
                />
                填滿所有空位
              </label>
            </div>
          </div>
          
          {/* 預覽結果 */}
          <div className="config-section">
            <h4>預覽結果</h4>
            <div className="preview-summary">
              <p>將新增 <strong>{previewResult.length}</strong> 筆班表記錄</p>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  // 重置為預設值
                  setEmployeePrefs({})
                  setStoreRequirements(initializeRequirements)
                }}
              >
                重設為預設值
              </button>
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>取消</button>
          <button 
            className="btn btn-primary" 
            onClick={handleConfirm}
            disabled={previewResult.length === 0}
          >
            確認執行排班
          </button>
        </div>
      </div>
    </div>
  )
}

export default AutoScheduleModal