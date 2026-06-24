import { useState } from 'react'
import { DEFAULT_SHIFT_TYPES } from '../data/shiftData'

function ShiftTypeManager({ shiftTypes, onSave, onCancel }) {
  const [shifts, setShifts] = useState(shiftTypes.length > 0 ? shiftTypes : Object.values(DEFAULT_SHIFT_TYPES))
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState(null)
  
  const handleAdd = () => {
    const newId = `custom_${Date.now()}`
    const newShift = {
      id: newId,
      code: '',
      name: '',
      startTime: '09:00',
      endTime: '18:00',
      hoursMonFri: 8.0,
      hoursOther: 8.0,
      color: '#666666',
      isCustom: true
    }
    setShifts(prev => [...prev, newShift])
    setEditingId(newId)
    setEditForm(newShift)
  }
  
  const handleEdit = (shift) => {
    setEditingId(shift.id)
    setEditForm({ ...shift })
  }
  
  const handleDelete = (id) => {
    if (window.confirm('確定要刪除此班型嗎？')) {
      setShifts(prev => prev.filter(s => s.id !== id))
    }
  }
  
  const handleSaveEdit = () => {
    if (!editForm.code || !editForm.name) {
      alert('班代號和名稱為必填')
      return
    }
    
    // 檢查班代號是否重複
    const duplicate = shifts.find(s => s.code === editForm.code && s.id !== editForm.id)
    if (duplicate) {
      alert('班代號已存在')
      return
    }
    
    setShifts(prev => prev.map(s => s.id === editForm.id ? editForm : s))
    setEditingId(null)
    setEditForm(null)
  }
  
  const handleCancelEdit = () => {
    // 如果是新創建的，則刪除
    if (editForm?.isCustom && !shifts.find(s => s.id === editForm.id)) {
      setShifts(prev => prev.filter(s => s.id !== editForm.id))
    }
    setEditingId(null)
    setEditForm(null)
  }
  
  const handleMoveUp = (index) => {
    if (index === 0) return
    const newShifts = [...shifts]
    ;[newShifts[index - 1], newShifts[index]] = [newShifts[index], newShifts[index - 1]]
    setShifts(newShifts)
  }
  
  const handleMoveDown = (index) => {
    if (index === shifts.length - 1) return
    const newShifts = [...shifts]
    ;[newShifts[index], newShifts[index + 1]] = [newShifts[index + 1], newShifts[index]]
    setShifts(newShifts)
  }
  
  return (
    <div className="shift-type-manager">
      <div className="manager-header">
        <h3>班型管理</h3>
        <p className="hint">管理排班使用的班型資料，可新增、編輯、刪除及調整順序</p>
      </div>
      
      <div className="shifts-list">
        {shifts.map((shift, index) => (
          <div key={shift.id} className={`shift-item ${editingId === shift.id ? 'editing' : ''}`}>
            {editingId === shift.id ? (
              <div className="edit-form">
                <div className="form-row">
                  <label>班代號：</label>
                  <input 
                    type="text" 
                    value={editForm.code} 
                    onChange={e => setEditForm({...editForm, code: e.target.value.toUpperCase().slice(0, 5)})}
                    maxLength={5}
                    style={{ width: '80px' }}
                  />
                </div>
                <div className="form-row">
                  <label>班型名稱：</label>
                  <input 
                    type="text" 
                    value={editForm.name} 
                    onChange={e => setEditForm({...editForm, name: e.target.value})}
                    style={{ width: '150px' }}
                  />
                </div>
                <div className="form-row">
                  <label>開始時間：</label>
                  <input 
                    type="time" 
                    value={editForm.startTime} 
                    onChange={e => setEditForm({...editForm, startTime: e.target.value})}
                  />
                  <label style={{ marginLeft: '15px' }}>結束時間：</label>
                  <input 
                    type="time" 
                    value={editForm.endTime} 
                    onChange={e => setEditForm({...editForm, endTime: e.target.value})}
                  />
                </div>
                <div className="form-row">
                  <label>週一/五工時：</label>
                  <input 
                    type="number" 
                    step="0.5" 
                    value={editForm.hoursMonFri} 
                    onChange={e => setEditForm({...editForm, hoursMonFri: parseFloat(e.target.value) || 0})}
                    style={{ width: '80px' }}
                  />
                  <span>小時</span>
                  <label style={{ marginLeft: '15px' }}>其他日期工時：</label>
                  <input 
                    type="number" 
                    step="0.5" 
                    value={editForm.hoursOther} 
                    onChange={e => setEditForm({...editForm, hoursOther: parseFloat(e.target.value) || 0})}
                    style={{ width: '80px' }}
                  />
                  <span>小時</span>
                </div>
                <div className="form-row">
                  <label>顏色：</label>
                  <input 
                    type="color" 
                    value={editForm.color || '#666666'} 
                    onChange={e => setEditForm({...editForm, color: e.target.value})}
                  />
                </div>
                <div className="edit-actions">
                  <button className="btn btn-primary btn-sm" onClick={handleSaveEdit}>儲存</button>
                  <button className="btn btn-secondary btn-sm" onClick={handleCancelEdit}>取消</button>
                </div>
              </div>
            ) : (
              <>
                <div className="shift-info">
                  <span 
                    className="shift-badge" 
                    style={{ backgroundColor: shift.color }}
                  >
                    {shift.code}
                  </span>
                  <span className="shift-name">{shift.name}</span>
                  <span className="shift-time">{shift.startTime} - {shift.endTime}</span>
                  <span className="shift-hours">
                    ({shift.hoursMonFri}h / {shift.hoursOther}h)
                  </span>
                  {shift.isCustom && <span className="custom-badge">自訂</span>}
                </div>
                <div className="shift-actions">
                  <button 
                    className="btn-icon" 
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    title="上移"
                  >
                    ↑
                  </button>
                  <button 
                    className="btn-icon" 
                    onClick={() => handleMoveDown(index)}
                    disabled={index === shifts.length - 1}
                    title="下移"
                  >
                    ↓
                  </button>
                  <button 
                    className="btn-icon" 
                    onClick={() => handleEdit(shift)}
                    title="編輯"
                  >
                    ✎
                  </button>
                  <button 
                    className="btn-icon btn-danger" 
                    onClick={() => handleDelete(shift.id)}
                    disabled={!shift.isCustom}
                    title={shift.isCustom ? '刪除' : '預設班型不可刪除'}
                  >
                    ×
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      
      <div className="manager-footer">
        <button className="btn btn-secondary" onClick={onCancel}>取消</button>
        <button className="btn btn-primary" onClick={() => onSave(shifts)}>儲存變更</button>
        <button className="btn btn-add" onClick={handleAdd}>+ 新增班型</button>
      </div>
    </div>
  )
}

export default ShiftTypeManager