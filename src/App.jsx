import { useState, useMemo, useCallback } from 'react'
import CostDashboard from './components/CostDashboard'
import LocationTabs from './components/LocationTabs'
import MonthNavigator from './components/MonthNavigator'
import RosterCalendar from './components/RosterCalendar'
import RosterModal from './components/RosterModal'
import AvailabilityMatrix from './components/AvailabilityMatrix'
import StreetSummary from './components/StreetSummary'
import ShiftTypeManager from './components/ShiftTypeManager'
import AutoScheduleModal from './components/AutoScheduleModal'
import { calculateMonthlyLaborCost } from './utils/laborCost'
import { LOCATIONS, DEFAULT_SHIFT_TYPES } from './data/shiftData'

// 模擬員工資料（包含店鋪偏好）
const mockEmployees = [
  { id: '1', name: '張三', role: 'supervisor', salary_type: 'monthly', salary_rate: 35000, preferredStore: 1 },
  { id: '2', name: '李四', role: 'full_time', salary_type: 'monthly', salary_rate: 28000, preferredStore: 2 },
  { id: '3', name: '王五', role: 'full_time', salary_type: 'hourly', salary_rate: 180, preferredStore: 1 },
  { id: '4', name: '陳六', role: 'part_time', salary_type: 'hourly', salary_rate: 150, preferredStore: 3 },
  { id: '5', name: '林七', role: 'full_time', salary_type: 'monthly', salary_rate: 30000, preferredStore: 2 },
  { id: '6', name: '吳八', role: 'part_time', salary_type: 'hourly', salary_rate: 140, preferredStore: 0 },
]

const mockRosters = [
  { id: 1, date: '2026-06-02', employee_id: '2', location_id: 1, shift_code: 'A', actual_hours: 9.0, street_tags: null },
  { id: 2, date: '2026-06-02', employee_id: '3', location_id: 1, shift_code: 'B', actual_hours: 9.0, street_tags: 'AM' },
  { id: 3, date: '2026-06-03', employee_id: '4', location_id: 1, shift_code: 'C', actual_hours: 9.0, street_tags: 'PMN' },
  { id: 4, date: '2026-06-02', employee_id: '1', location_id: 2, shift_code: 'A', actual_hours: 9.0, street_tags: null },
  { id: 5, date: '2026-06-02', employee_id: '5', location_id: 2, shift_code: 'B', actual_hours: 9.0, street_tags: null },
]

const mockAvailability = {
  '1-2026-06-01': true,
  '1-2026-06-02': true,
  '2-2026-06-01': true,
  '2-2026-02-02': true,
  '3-2026-06-01': false,
  '3-2026-06-02': true,
}

function App() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 1))
  const [currentLocation, setCurrentLocation] = useState(1)
  const [rosters, setRosters] = useState(mockRosters)
  const [availability, setAvailability] = useState(mockAvailability)
  const [shiftTypes, setShiftTypes] = useState(Object.values(DEFAULT_SHIFT_TYPES))
  const [modalState, setModalState] = useState({
    isOpen: false,
    date: null,
    shiftCode: null,
    existingAssignment: null
  })
  const [showShiftManager, setShowShiftManager] = useState(false)
  const [showAutoSchedule, setShowAutoSchedule] = useState(false)
  const [activeTab, setActiveTab] = useState('roster')
  
  // 計算人事成本
  const costData = useMemo(() => {
    return calculateMonthlyLaborCost(mockEmployees, rosters)
  }, [rosters])
  
  // 開啟班表編輯 Modal
  const handleCellClick = useCallback((date, shiftCode, existingAssignment) => {
    setModalState({
      isOpen: true,
      date,
      shiftCode,
      existingAssignment
    })
  }, [])
  
  // 關閉 Modal
  const handleCloseModal = useCallback(() => {
    setModalState(prev => ({ ...prev, isOpen: false }))
  }, [])
  
  // 儲存班表（新增/更新/刪除）
  const handleSaveRoster = useCallback((data) => {
    if (data === null) {
      setRosters(prev => prev.filter(r => r.id !== modalState.existingAssignment.id))
    } else {
      const dateStr = modalState.date.toISOString().split('T')[0]
      
      if (modalState.existingAssignment) {
        setRosters(prev => prev.map(r => {
          if (r.id === modalState.existingAssignment.id) {
            return { ...r, ...data, location_id: currentLocation, date: dateStr }
          }
          return r
        }))
      } else {
        const newRoster = {
          id: Date.now(),
          date: dateStr,
          location_id: currentLocation,
          ...data
        }
        setRosters(prev => [...prev, newRoster])
      }
    }
  }, [modalState, currentLocation])
  
  // 更新可用性
  const handleAvailabilityChange = useCallback((employeeId, dateStr, isAvailable) => {
    setAvailability(prev => ({
      ...prev,
      [`${employeeId}-${dateStr}`]: isAvailable
    }))
  }, [])
  
  // 儲存班型設定
  const handleSaveShiftTypes = useCallback((newShiftTypes) => {
    setShiftTypes(newShiftTypes)
    setShowShiftManager(false)
  }, [])
  
  // 執行自動排班
  const handleAutoSchedule = useCallback((newRosters) => {
    setRosters(prev => [...prev, ...newRosters])
  }, [])
  
  // 列印
  const handlePrint = useCallback(() => {
    window.print()
  }, [])
  
  return (
    <div className="app">
      <header className="app-header">
        <h1>環保回收站排班與成本管理系統</h1>
        <div className="header-actions">
          <span className="user-badge">管理者</span>
          <button className="btn btn-print" onClick={handlePrint}>列印本頁</button>
        </div>
      </header>
      
      <CostDashboard costData={costData} />
      
      <div className="toolbar">
        <div className="toolbar-left">
          <MonthNavigator currentDate={currentDate} onMonthChange={setCurrentDate} />
          
          <div className="toolbar-actions">
            <button className="btn btn-action" onClick={() => setShowShiftManager(true)}>
              管理班型
            </button>
            <button className="btn btn-primary" onClick={() => setShowAutoSchedule(true)}>
              一鍵自動排班
            </button>
          </div>
        </div>
        
        <div className="tab-buttons">
          <button className={`tab-btn ${activeTab === 'roster' ? 'active' : ''}`} onClick={() => setActiveTab('roster')}>
            排班月曆
          </button>
          <button className={`tab-btn ${activeTab === 'availability' ? 'active' : ''}`} onClick={() => setActiveTab('availability')}>
            可用性管理
          </button>
          <button className={`tab-btn ${activeTab === 'street' ? 'active' : ''}`} onClick={() => setActiveTab('street')}>
            外派街站匯總
          </button>
        </div>
      </div>
      
      {activeTab === 'roster' && (
        <>
          <LocationTabs currentLocation={currentLocation} onLocationChange={setCurrentLocation} />
          
          <RosterCalendar
            currentDate={currentDate}
            rosters={rosters}
            employees={mockEmployees}
            locationId={currentLocation}
            shiftTypes={shiftTypes}
            onCellClick={handleCellClick}
          />
        </>
      )}
      
      {activeTab === 'availability' && (
        <AvailabilityMatrix
          currentDate={currentDate}
          employees={mockEmployees}
          availability={availability}
          onAvailabilityChange={handleAvailabilityChange}
        />
      )}
      
      {activeTab === 'street' && (
        <StreetSummary
          currentDate={currentDate}
          rosters={rosters}
          employees={mockEmployees}
          onCellClick={handleCellClick}
        />
      )}
      
      <RosterModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        onSave={handleSaveRoster}
        date={modalState.date}
        shiftCode={modalState.shiftCode}
        existingAssignment={modalState.existingAssignment}
        availableEmployees={[]}
        allEmployees={mockEmployees}
        shiftTypes={shiftTypes}
      />
      
      {showShiftManager && (
        <div className="modal-overlay" onClick={() => setShowShiftManager(false)}>
          <div className="modal-content large" onClick={e => e.stopPropagation()}>
            <ShiftTypeManager
              shiftTypes={shiftTypes}
              onSave={handleSaveShiftTypes}
              onCancel={() => setShowShiftManager(false)}
            />
          </div>
        </div>
      )}
      
      {showAutoSchedule && (
        <AutoScheduleModal
          isOpen={showAutoSchedule}
          onClose={() => setShowAutoSchedule(false)}
          onConfirm={handleAutoSchedule}
          currentDate={currentDate}
          employees={mockEmployees}
          shiftTypes={shiftTypes}
          availability={availability}
          existingRosters={rosters}
        />
      )}
      
      <footer className="app-footer">
        <p>唯讀密碼登入：1234</p>
      </footer>
    </div>
  )
}

export default App