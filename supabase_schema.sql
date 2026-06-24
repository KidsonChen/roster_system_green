-- ============================================
-- 環保回收站排班系統 - Supabase 資料庫 Schema
-- ============================================

-- 1. 員工與薪資表
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('supervisor', 'full_time', 'part_time')),
    salary_type VARCHAR(10) CHECK (salary_type IN ('monthly', 'hourly')),
    salary_rate NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 地點表 (店鋪A, B, C, 外派街站)
CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- 初始化地點資料
INSERT INTO locations (id, name) VALUES 
(1, '店鋪 A'), (2, '店鋪 B'), (3, '店鋪 C'), (4, '外派街站')
ON CONFLICT (id) DO NOTHING;

-- 3. 班型主檔表
CREATE TABLE IF NOT EXISTS shift_types (
    code VARCHAR(10) PRIMARY KEY
);

-- 初始化班型資料
INSERT INTO shift_types (code) VALUES 
('A'), ('B'), ('C'), ('D'), ('M'), ('R1'), ('R2'), ('R3'), ('R4'), ('R5'), ('R6')
ON CONFLICT (code) DO NOTHING;

-- 4. 員工可用性表 (意願登記)
CREATE TABLE IF NOT EXISTS availability (
    id BIGSERIAL PRIMARY KEY,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    is_available BOOLEAN NOT NULL,
    UNIQUE(employee_id, date)
);

CREATE INDEX IF NOT EXISTS idx_availability_employee_date 
ON availability(employee_id, date);

-- 5. 最終班表 (核心：記錄當班實際工時)
CREATE TABLE IF NOT EXISTS rosters (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    location_id INT REFERENCES locations(id),
    shift_code VARCHAR(10) REFERENCES shift_types(code),
    actual_hours NUMERIC(4, 2) NOT NULL,
    street_tags VARCHAR(10) DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(date, employee_id, location_id, shift_code)
);

CREATE INDEX IF NOT EXISTS idx_rosters_date 
ON rosters(date);

CREATE INDEX IF NOT EXISTS idx_rosters_employee 
ON rosters(employee_id);

CREATE INDEX IF NOT EXISTS idx_rosters_location 
ON rosters(location_id);

-- ============================================
-- RLS (Row Level Security) 策略
-- ============================================

-- 啟用 RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE rosters ENABLE ROW LEVEL SECURITY;

-- 公開讀取地點和班型資料
CREATE POLICY "Public can read locations" ON locations FOR SELECT USING (true);
CREATE POLICY "Public can read shift_types" ON shift_types FOR SELECT USING (true);

-- 管理員可完整操作員工表
CREATE POLICY "Admin can manage employees" ON employees
FOR ALL USING (true); -- 生產環境應改為認證檢查

-- 管理員可完整操作可用性表
CREATE POLICY "Admin can manage availability" ON availability
FOR ALL USING (true);

-- 管理員可完整操作班表
CREATE POLICY "Admin can manage rosters" ON rosters
FOR ALL USING (true);

-- ============================================
-- 視圖：用於成本計算
-- ============================================

-- 當月成本統計視圖
CREATE OR REPLACE VIEW monthly_cost_summary AS
SELECT 
    DATE_TRUNC('month', r.date)::DATE as month_start,
    COUNT(DISTINCT r.id) as total_shifts,
    COUNT(DISTINCT r.employee_id) as total_employees,
    SUM(CASE WHEN e.salary_type = 'monthly' THEN e.salary_rate ELSE 0 END) as monthly_total,
    SUM(CASE WHEN e.salary_type = 'hourly' THEN r.actual_hours * e.salary_rate ELSE 0 END) as hourly_total,
    SUM(CASE WHEN e.salary_type = 'monthly' THEN e.salary_rate ELSE 0 END) + 
    SUM(CASE WHEN e.salary_type = 'hourly' THEN r.actual_hours * e.salary_rate ELSE 0 END) as grand_total
FROM rosters r
JOIN employees e ON r.employee_id = e.id
GROUP BY DATE_TRUNC('month', r.date)::DATE
ORDER BY month_start DESC;

-- ============================================
-- 函數：自動更新 updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_employees_updated_at
    BEFORE UPDATE ON employees
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rosters_updated_at
    BEFORE UPDATE ON rosters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 範例資料 (測試用)
-- ============================================

-- 插入範例員工
INSERT INTO employees (id, name, role, salary_type, salary_rate) VALUES
('11111111-1111-1111-1111-111111111111', '張三', 'supervisor', 'monthly', 35000),
('22222222-2222-2222-2222-222222222222', '李四', 'full_time', 'monthly', 28000),
('33333333-3333-3333-3333-333333333333', '王五', 'full_time', 'hourly', 180),
('44444444-4444-4444-4444-444444444444', '陳六', 'part_time', 'hourly', 150),
('55555555-5555-5555-5555-555555555555', '林七', 'full_time', 'monthly', 30000),
('66666666-6666-6666-6666-666666666666', '吳八', 'part_time', 'hourly', 140)
ON CONFLICT (id) DO NOTHING;

-- 插入範例班表
INSERT INTO rosters (date, employee_id, location_id, shift_code, actual_hours, street_tags) VALUES
('2026-06-02', '22222222-2222-2222-2222-222222222222', 1, 'A', 9.0, NULL),
('2026-06-02', '33333333-3333-3333-3333-333333333333', 1, 'B', 9.0, 'AM'),
('2026-06-03', '44444444-4444-4444-4444-444444444444', 1, 'C', 9.0, 'PMN'),
('2026-06-02', '11111111-1111-1111-1111-111111111111', 2, 'A', 9.0, NULL),
('2026-06-02', '55555555-5555-5555-5555-555555555555', 2, 'B', 9.0, NULL)
ON CONFLICT DO NOTHING;

-- 插入範例可用性
INSERT INTO availability (employee_id, date, is_available) VALUES
('11111111-1111-1111-1111-111111111111', '2026-06-01', true),
('11111111-1111-1111-1111-111111111111', '2026-06-02', true),
('22222222-2222-2222-2222-222222222222', '2026-06-01', true),
('33333333-3333-3333-3333-333333333333', '2026-06-01', false),
('33333333-3333-3333-3333-333333333333', '2026-06-02', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- Supabase API Key 設置說明
-- ============================================
-- 
-- 1. 登入 Supabase (https://supabase.com)
-- 2. 創建新專案
-- 3. 前往 Settings > API
-- 4. 複製 Project URL 和 anon public key
-- 5. 在專案根目錄創建 .env 文件：
--
-- VITE_SUPABASE_URL=https://your-project.supabase.co
-- VITE_SUPABASE_ANON_KEY=your-anon-key
--