import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; // 假設你已建立好 Supabase 連線
import { Printer, Users, Calendar, AlertTriangle, DollarSign, Plus, X } from 'lucide-react';

export default function App() {
  // 權限與登入狀態
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [inputPassword, setInputPassword] = useState('');
  
  // 介面控制狀態
  const [currentTab, setCurrentTab] = useState('店鋪 A'); // 店鋪 A, 店鋪 B, 店鋪 C, 外派街站
  const [currentMonth, setCurrentMonth] = useState('2026-07');
  const [costSummary, setCostSummary] = useState({ total: 0, monthly: 0, hourly: 0 });

  // 彈出視窗（Modal）狀態
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedShift, setSelectedShift] = useState('A');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [streetTags, setStreetTags] = useState({ AM: false, PM: false, N: false });

  // 模擬資料（實際開發時會從 Supabase 撈取）
  const locations = ['店鋪 A', '店鋪 B', '店鋪 C', '外派街站匯總'];
  const employees = [
    { id: '1', name: '張三', role: 'supervisor', salary_type: 'monthly' },
    { id: '2', name: '李四', role: 'part_time', salary_type: 'hourly' },
    { id: '3', name: '王五', role: 'full_time', salary_type: 'monthly' },
    { id: '4', name: '陳六', role: 'part_time', salary_type: 'hourly' },
  ];

  // 簡易密碼登入驗證
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (inputPassword === 'greenteam2026') {
      setIsAuthenticated(true);
    } else {
      alert('密碼錯誤！');
    }
  };

  // 觸發列印
  const handlePrint = () => {
    window.print();
  };

  // 當排班變動時，從 Supabase 呼叫 RPC 更新當月人事成本
  useEffect(() => {
    if (isAuthenticated) {
      // fetchCostSummary(); 
      // 這裡先放模擬數據，實作時呼叫： supabase.rpc('get_monthly_cost_summary', { target_month: currentMonth })
      setCostSummary({ total: 148250, monthly: 85000, hourly: 63250 });
    }
  }, [currentMonth, isAuthenticated]);

  // 如果尚未輸入簡易密碼，顯示鎖定畫面
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">環保回收站 聯合排班系統</h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">請輸入全店查看密碼：</label>
              <input 
                type="password" 
                value={inputPassword}
                onChange={(e) => setInputPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="密碼..."
              />
            </div>
            <button type="submit" className="w-full bg-emerald-600 text-white py-2 rounded-md hover:bg-emerald-700 font-medium">
              進入系統
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-6 font-sans">
      
      {/* 頂部導覽列 - 列印時隱藏 */}
      <header className="no-print flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="text-emerald-600" /> 環保回收站聯合班表
          </h1>
          <p className="text-sm text-slate-500">當前身分：{isAdmin ? '管理者 (可編輯)' : '員工 (唯讀)'}</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsAdmin(!isAdmin)} 
            className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${isAdmin ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-700'}`}
          >
            {isAdmin ? '切換為員工檢視' : '切換為管理者登入'}
          </button>
          <button onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2">
            <Printer size={16} /> 列印本頁班表
          </button>
        </div>
      </header>

      {/* 人事成本看板 - 僅限管理者看，列印時隱藏 */}
      {isAdmin && (
        <section className="no-print bg-white p-4 rounded-xl shadow-sm border mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg"><DollarSign /></div>
            <div>
              <p className="text-xs text-slate-400 font-medium">當月預估總成本</p>
              <p className="text-xl font-bold text-slate-900">${costSummary.total.toLocaleString()} 元</p>
            </div>
          </div>
          <div className="border-t sm:border-t-0 sm:border-l pt-3 sm:pt-0 sm:pl-4">
            <p className="text-xs text-slate-400 font-medium">月薪固定型小計</p>
            <p className="text-lg font-semibold text-slate-700">${costSummary.monthly.toLocaleString()} 元</p>
          </div>
          <div className="border-t sm:border-t-0 sm:border-l pt-3 sm:pt-0 sm:pl-4">
            <p className="text-xs text-slate-400 font-medium">時薪累計型小計</p>
            <p className="text-lg font-semibold text-slate-700">${costSummary.hourly.toLocaleString()} 元</p>
          </div>
        </section>
      )}

      {/* 店鋪切換與月份選擇 - 列印時隱藏 */}
      <div className="no-print flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex bg-slate-200 p-1 rounded-lg w-full sm:w-auto overflow-x-auto">
          {locations.map((loc) => (
            <button
              key={loc}
              onClick={() => setCurrentTab(loc)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-all ${currentTab === loc ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              {loc}
            </button>
          ))}
        </div>
        <input 
          type="month" 
          value={currentMonth} 
          onChange={(e) => setCurrentMonth(e.target.value)}
          className="border px-3 py-1.5 rounded-md text-sm font-medium outline-none bg-white shadow-sm"
        />
      </div>

      {/* 月曆視圖主體 - 列印核心區塊 */}
      <div className="print-area bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="bg-slate-800 text-white p-3 text-center font-bold text-lg hidden print:block">
          環保回收站 月班表 — 【{currentTab}】 ({currentMonth})
        </div>
        
        {/* 星期標頭 */}
        <div className="grid grid-cols-7 border-b bg-slate-50 text-center font-semibold text-sm text-slate-600 py-2">
          <div>星期日</div><div>星期一</div><div>星期二</div><div>星期三</div><div>星期四</div><div>星期五</div><div>星期六</div>
        </div>

        {/* 模擬 7 月份格子 (僅畫出前 7 天做為網頁範例) */}
        <div className="grid grid-cols-7 grid-rows-5 divide-x divide-y border-t calendar-grid">
          
          {/* 日期儲存格範例 1 */}
          <div className="p-2 min-h-[120px] bg-white flex flex-col justify-between">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-sm text-slate-400">7/1 (三)</span>
              {isAdmin && <span className="text-[10px] bg-red-50 text-red-600 px-1 rounded flex items-center gap-0.5"><AlertTriangle size={10}/>缺人</span>}
            </div>
            <div className="space-y-1 flex-1 text-xs">
              <div className="bg-blue-50 text-blue-700 p-1 rounded font-medium">A: 張三</div>
              <div className="bg-amber-50 text-amber-700 p-1 rounded font-medium">B: 李四 <span className="text-[10px] bg-amber-200 px-1 rounded">AM</span></div>
            </div>
            {isAdmin && (
              <button onClick={() => { setSelectedDate('2026-07-01'); setIsModalOpen(true); }} className="no-print mt-1 text-[11px] text-emerald-600 hover:text-emerald-700 font-medium flex items-center justify-center gap-0.5 border border-dashed border-emerald-300 py-0.5 rounded">
                <Plus size={12}/> 排班
              </button>
            )}
          </div>

          {/* 日期儲存格範例 2 */}
          <div className="p-2 min-h-[120px] bg-white flex flex-col justify-between">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-sm text-slate-900">7/2 (四)</span>
            </div>
            <div className="space-y-1 flex-1 text-xs">
              <div className="bg-purple-50 text-purple-700 p-1 rounded font-medium">R3: 王五</div>
              <div className="bg-emerald-50 text-emerald-700 p-1 rounded font-medium">M: 陳六 <span className="text-[10px] bg-emerald-200 px-1 rounded">APM</span></div>
            </div>
            {isAdmin && (
              <button onClick={() => { setSelectedDate('2026-07-02'); setIsModalOpen(true); }} className="no-print mt-1 text-[11px] text-emerald-600 hover:text-emerald-700 font-medium flex items-center justify-center gap-0.5 border border-dashed border-emerald-300 py-0.5 rounded">
                <Plus size={12}/> 排班
              </button>
            )}
          </div>

          {/* 補滿剩餘的格子格（此處省略 3~31 號以保持程式碼精簡） */}
          {[3, 4, 5, 6, 7].map(d => (
            <div key={d} className="p-2 min-h-[120px] bg-slate-50/50 text-slate-400 text-xs font-bold">7/{d}</div>
          ))}
        </div>
      </div>

      {/* 排班彈出視窗 (Modal) - 列印時隱藏 */}
      {isModalOpen && (
        <div className="no-print fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-1.5"><Users size={18}/> 新增排班 ({selectedDate})</h3>
            
            <div className="space-y-4 text-sm">
              <div>
                <label className="block font-medium text-slate-600 mb-1">選擇班別</label>
                <select value={selectedShift} onChange={(e) => setSelectedShift(e.target.value)} className="w-full border p-2 rounded-md bg-white">
                  {['A', 'B', 'C', 'D', 'Shift M', 'R1', 'R2', 'R3', 'R4', 'R5', 'R6'].map(code => (
                    <option key={code} value={code}>{code} 班</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">選擇員工 (系統已過濾當日可用人員)</label>
                <select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)} className="w-full border p-2 rounded-md bg-white">
                  <option value="">-- 請選擇人員 --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.role === 'supervisor' ? '主管' : '正/兼職'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">外派街站時段註記 (選填)</label>
                <div className="flex gap-4 mt-1">
                  {['AM', 'PM', 'N'].map(tag => (
                    <label key={tag} className="flex items-center gap-1.5 font-medium cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={streetTags[tag]} 
                        onChange={(e) => setStreetTags({...streetTags, [tag]: e.target.checked})}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      />
                      {tag}
                    </label>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => { alert('已成功儲存至 Supabase！'); setIsModalOpen(false); }}
                className="w-full bg-emerald-600 text-white py-2 rounded-md font-semibold hover:bg-emerald-700 mt-2"
              >
                確認排班並儲存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}