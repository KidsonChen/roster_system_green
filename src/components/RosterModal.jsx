import { useState, useMemo } from 'react'
import { STREET_TAGS } from '../data/shiftData'
import { getShiftHours } from '../data/shiftData'

function RosterModal({ 
  isOpen, 
  onClose, 
  onSave, 
  date, 
  shiftCode, 
  existingAssignment,
  availableEmployees,
  allEmployees,
  shiftTypes = []
}) {
  const [selectedEmployee, setSelectedEmployee] = useState(existingAssignment?.employee_id || '')
  const [selectedShift, setSelectedShift] = useState(shiftCode || '')
  const [selectedStreetTags, setSelectedStreetTags] = useState(
    existingAssignment?.street_tags ? existingAssignment.street_tags.split('') : []
  )
  const [existingRosterEntry, setExistingRosterEntry] = useState(existingAssignment)
  
  // 星期幾 (用於計算工時)
  const dayOfWeek = date ? date.getDay() : 0
  
  // 過濾當天可用的員工
  const eligibleEmployees = useMemo(() => {
    return allEmployees.filter(emp => {
      if (existingRosterEntry && emp.id === existingRosterEntry.employee_id) {
        return true
      }
      return availableEmployees.includes(emp.id)
    })
  }, [allEmployees, availableEmployees, existingRosterEntry])
  
  // 取得當前班型的資訊
  const currentShiftInfo = shiftTypes.find(s => s.id === selectedShift || s.code === selectedShift)
  
  // 取得當前班型的工時
  const currentHours = useMemo(() => {
    const shift = shiftTypes.find(s => s.id === selectedShift || s.code === selectedShift)
    return getShiftHours(shift, dayOfWeek)
  }, [shiftTypes, selectedShift, dayOfWeek])
  
  // 計算街站時段標籤字串
  const streetTagsString = selectedStreetTags.join('')
  
  const handleStreetTagToggle = (tagCode) => {
    setSelectedStreetTags(prev => 
      prev.includes(tagCode) 
        ? prev.filter(t => t !== tagCode)
        : [...prev, tagCode]
    )
  }
  
  const handleSave = () => {
    if (!selectedEmployee) {
      alert('請選擇員工')
      return
    }
    
    onSave({
      employee_id: selectedEmployee,
      shift_code: selectedShift,
      actual_hours: currentHours,
      street_tags: streetTagsString || null
    })
    onClose()
  }
  
  const handleDelete = () => {
    if (existingRosterEntry && onSave) {
      onSave(null)
      onClose()
    }
  }
  
  // 同步外部 shiftCode 變化
  if (shiftCode && shiftCode !== selectedShift && !existingAssignment) {
    setSelectedShift(shiftCode)
  }
  
  if (!isOpen) return null
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{date ? `${date.getMonth() + 1}/${date.getDate()}` : ''} 班表編輯</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body">
          {/* 選擇班型 */}
          <div className="form-group">
            <label>班型：</label>
            <div className="shift-buttons">
              {shiftTypes.map(shift => (
                <button
                  key={shift.id}
                  className={`shift-btn ${selectedShift === shift.id || selectedShift === shift.code ? 'active' : ''}`}
                  onClick={() => setSelectedShift(shift.id)}
                  style={{ 
                    borderColor: selectedShift === shift.id || selectedShift === shift.code ? shift.color : undefined 
                  }}
                >
                  <span 
                    className="shift-btn-badge" 
                    style={{ backgroundColor: shift.color }}
                  >
                    {shift.code}
                  </span>
                  {shift.name}
                </button>
              ))}
            </div>
            {currentShiftInfo && (
              <div className="shift-info">
                <span>{currentShiftInfo.startTime} - {currentShiftInfo.endTime}</span>
                <span>工時：{currentHours} 小時</span>
              </div>
            )}
          </div>
          
          {/* 選擇員工 */}
          <div className="form-group">
            <label>選擇員工：</label>
            <select 
              value={selectedEmployee} 
              onChange={e => setSelectedEmployee(e.target.value)}
            >
              <option value="">請選擇員工...</option>
              {eligibleEmployees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.role === 'supervisor' ? 'Supervisor' : emp.role === 'full_time' ? '正職' : '兼職'})
                </option>
              ))}
            </select>
          </div>
          
          {/* 街站時段 */}
          <div className="form-group">
            <label>街站時段（選填）：</label>
            <div className="street-tag-buttons">
              {STREET_TAGS.map(tag => (
                <button
                  key={tag.code}
                  className={`street-tag-btn ${selectedStreetTags.includes(tag.code) ? 'active' : ''}`}
                  onClick={() => handleStreetTagToggle(tag.code)}
                >
                  {tag.label} ({tag.code})
                </button>
              ))}
            </div>
            {selectedStreetTags.length > 0 && (
              <div className="street-preview">
                呈現：{selectedEmployee ? `[員工姓名]` : '員工姓名'} | {currentShiftInfo?.name || selectedShift} ({streetTagsString})
              </div>
            )}
          </div>
        </div>
        
        <div className="modal-footer">
          {existingRosterEntry && (
            <button className="btn btn-danger" onClick={handleDelete}>
              刪除此班
            </button>
          )}
          <button className="btn btn-secondary" onClick={onClose}>取消</button>
          <button className="btn btn-primary" onClick={handleSave}>
            {existingRosterEntry ? '更新' : '儲存'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default RosterModal