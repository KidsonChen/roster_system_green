# 環保回收站排班與成本管理系統

根據需求規格文檔實現的完整排班管理系統。

## 功能特點

- **智慧排班月曆**：以店鋪為核心的月曆視圖
- **動態班型管理**：可自訂班型、新增、編輯、刪除及調整順序
- **一鍵自動排班**：根據店鋪需求和員工偏好自動編排班表
- **人事成本即時計算**：當月預估總成本，月薪固定型與時薪型分開計算
- **員工可用性管理**：Excel 風格的矩陣介面，快速標記可上班/不可上班
- **街站時段追蹤**：支援 AM、PM、N 時段組合標註
- **友善列印**：優化 A4 橫向列印格式，隱藏控制按鈕

## 技術棧

- React 18 + Vite
- Supabase（後端資料庫）
- date-fns（日期處理）

## 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 啟動開發伺服器

```bash
npm run dev
```

訪問 http://localhost:3000

### 3. 生產構建

```bash
npm run build
```

## 新功能說明

### 動態班型管理

點擊「管理班型」按鈕，可以：

- **新增班型**：自訂班代號、名稱、時間、工時
- **編輯班型**：修改現有班型的所有屬性
- **刪除班型**：僅限自訂班型（預設班型不可刪除）
- **調整順序**：改變班型在月曆中的顯示順序
- **自訂顏色**：為每個班型設定專屬顏色

班型屬性說明：
- `hoursMonFri`：週一、週五的工時
- `hoursOther`：其他日期的工時
- 顏色：用於區分不同班型

### 一鍵自動排班

點擊「一鍵自動排班」按鈕，開啟自動排班精靈：

#### 步驟 1：設定各店鋪人數需求

為每家店鋪的每個班型設定需要多少人。例如：
- 店鋪 A：A班 2人、B班 2人、C班 1人
- 店鋪 B：A班 1人、B班 2人
- 店鋪 C：A班 1人、B班 1人、C班 2人

#### 步驟 2：員工店鋪偏好

為每位員工設定偏好店鋪（數字越大越優先）：
- `0`：無偏好
- `1`：偏好店鋪 A
- `2`：偏好店鋪 B
- `3`：偏好店鋪 C

#### 步驟 3：排班選項

- **平均分配工作量**：已排班少的員工優先
- **優先考慮員工店鋪偏好**：優先將員工安排到偏好店鋪
- **填滿所有空位**：盡可能填滿所有需求名額

#### 排班規則

系統會自動檢查：
1. 員工當天是否可用（可用性管理中標記為可上班）
2. 員工當天是否已被排班（避免重複排班）
3. 員工是否符合店鋪偏好設定
4. 工作量是否平均分配

## Supabase 資料庫設置

### 手動創建資料表

在 Supabase SQL Editor 中執行 `supabase_schema.sql`：

```bash
# 或直接在 Supabase 後台執行
psql -h your-host -d your-db -f supabase_schema.sql
```

### 資料表結構

```sql
-- 員工表（新增 preferredStore 欄位）
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('supervisor', 'full_time', 'part_time')),
    salary_type VARCHAR(10) CHECK (salary_type IN ('monthly', 'hourly')),
    salary_rate NUMERIC(10, 2) NOT NULL,
    preferred_store INT DEFAULT 0,  -- 0=無偏好, 1=A店, 2=B店, 3=C店
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 班型表（動態管理）
CREATE TABLE shift_types (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    hours_mon_fri NUMERIC(4,2) NOT NULL,
    hours_other NUMERIC(4,2) NOT NULL,
    color VARCHAR(7) DEFAULT '#666666',
    display_order INT DEFAULT 0,
    is_custom BOOLEAN DEFAULT FALSE
);

-- 可用性表
CREATE TABLE availability (
    id BIGSERIAL PRIMARY KEY,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    is_available BOOLEAN NOT NULL,
    UNIQUE(employee_id, date)
);

-- 班表
CREATE TABLE rosters (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    location_id INT REFERENCES locations(id),
    shift_code VARCHAR(10) REFERENCES shift_types(id),
    actual_hours NUMERIC(4, 2) NOT NULL,
    street_tags VARCHAR(10) DEFAULT NULL,
    UNIQUE(date, employee_id, location_id, shift_code)
);
```

## 環境變量

在 `.env` 文件中設置：

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 班型預設值

| 班代號 | 名稱 | 時間 | 週一/五工時 | 其他工時 |
|--------|------|------|------------|----------|
| A | A班 | 07:45-16:45 | 9.0 | 9.0 |
| B | B班 | 10:00-19:00 | 9.0 | 9.0 |
| C | C班 | 12:30-21:30 | 9.0 | 9.0 |
| D | D班 | 09:00-18:00 | 9.0 | 9.0 |
| M | Shift M | 08:00-21:30 | 13.5 | 13.5 |
| R1 | R1 | 09:30-13:30 | 4.0 | 4.0 |
| R2 | R2 | 14:00-18:00 | 4.0 | 4.0 |
| R3 | R3 | 17:00-21:30 | 4.5 | 4.0 |
| R4 | R4 | 14:00-21:30 | 7.5 | 7.5 |
| R5 | R5 | 18:00-21:30 | 3.5 | 3.0 |
| R6 | R6 | 14:30-21:30 | 7.0 | 7.0 |

## 文件結構

```
roster_system/
├── src/
│   ├── components/
│   │   ├── AutoScheduleModal.jsx   # 自動排班彈窗
│   │   ├── AvailabilityMatrix.jsx  # 可用性矩陣
│   │   ├── CostDashboard.jsx       # 成本看板
│   │   ├── LocationTabs.jsx        # 店鋪切換
│   │   ├── MonthNavigator.jsx      # 月份導航
│   │   ├── RosterCalendar.jsx      # 排班月曆
│   │   ├── RosterModal.jsx         # 班表編輯
│   │   ├── ShiftTypeManager.jsx    # 班型管理
│   │   └── StreetSummary.jsx       # 街站匯總
│   ├── data/
│   │   └── shiftData.js            # 班型資料定義
│   ├── lib/
│   │   └── supabase.js             # Supabase 客戶端
│   ├── utils/
│   │   └── laborCost.js            # 成本計算
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── supabase_schema.sql
├── package.json
└── vite.config.js
```

## 使用說明

### 管理員操作

1. **管理班型**：點擊「管理班型」自訂排班使用的班型
2. **排班**：點擊月曆中的格子選擇員工
3. **街站標註**：如有街站任務，勾選 AM/PM/N 時段
4. **自動排班**：設定店鋪需求和員工偏好，一鍵生成班表
5. **成本看板**：即時查看當月人事成本

### 唯讀模式

員工使用密碼 `1234` 登入唯讀網頁

### 列印

點擊「列印本頁」自動格式化為 A4 橫向

## 更新日誌

### v2.0.0

- 新增動態班型管理功能
- 新增一鍵自動排班功能
- 新增員工店鋪偏好設定
- 優化 UI/UX
- 新增班型顏色區分