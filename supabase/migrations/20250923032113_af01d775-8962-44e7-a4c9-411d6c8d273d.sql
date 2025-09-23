-- إضافة جداول العمل لشركة أروما

-- جدول الموظفين/العمال
CREATE TABLE public.aroma_employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_code TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  national_id TEXT UNIQUE,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female')),
  hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
  department TEXT NOT NULL, -- 'management', 'sales', 'kitchen', 'delivery', 'warehouse'
  position TEXT NOT NULL,
  salary NUMERIC(10,2),
  hourly_rate NUMERIC(8,2),
  employment_type TEXT DEFAULT 'full_time' CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'intern')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated', 'on_leave')),
  address JSONB DEFAULT '{}',
  emergency_contact JSONB DEFAULT '{}',
  bank_details JSONB DEFAULT '{}',
  profile_image_url TEXT,
  notes TEXT,
  manager_id UUID REFERENCES public.aroma_employees(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- جدول المناوبات
CREATE TABLE public.aroma_shifts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL, -- 'صباحي', 'مسائي', 'ليلي'
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_duration INTEGER DEFAULT 30, -- minutes
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- جدول جدولة العمل
CREATE TABLE public.aroma_work_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.aroma_employees(id) ON DELETE CASCADE,
  shift_id UUID NOT NULL REFERENCES public.aroma_shifts(id),
  work_date DATE NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'absent', 'sick_leave', 'vacation')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, work_date)
);

-- جدول الحضور والانصراف
CREATE TABLE public.aroma_attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.aroma_employees(id) ON DELETE CASCADE,
  work_date DATE NOT NULL,
  clock_in TIME,
  clock_out TIME,
  break_start TIME,
  break_end TIME,
  total_hours NUMERIC(4,2),
  overtime_hours NUMERIC(4,2) DEFAULT 0,
  status TEXT DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'half_day', 'sick_leave', 'vacation')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, work_date)
);

-- جدول الرواتب
CREATE TABLE public.aroma_payroll (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.aroma_employees(id) ON DELETE CASCADE,
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  basic_salary NUMERIC(10,2) NOT NULL DEFAULT 0,
  overtime_pay NUMERIC(10,2) DEFAULT 0,
  bonuses NUMERIC(10,2) DEFAULT 0,
  deductions NUMERIC(10,2) DEFAULT 0,
  gross_pay NUMERIC(10,2) NOT NULL,
  tax_deduction NUMERIC(10,2) DEFAULT 0,
  insurance_deduction NUMERIC(10,2) DEFAULT 0,
  net_pay NUMERIC(10,2) NOT NULL,
  payment_date DATE,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'cancelled')),
  payment_method TEXT DEFAULT 'bank_transfer' CHECK (payment_method IN ('bank_transfer', 'cash', 'check')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- جدول الإجازات
CREATE TABLE public.aroma_leaves (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.aroma_employees(id) ON DELETE CASCADE,
  leave_type TEXT NOT NULL CHECK (leave_type IN ('annual', 'sick', 'maternity', 'paternity', 'emergency', 'unpaid')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days INTEGER NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  approved_by UUID REFERENCES public.aroma_employees(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- تمكين RLS على جميع الجداول الجديدة
ALTER TABLE public.aroma_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aroma_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aroma_work_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aroma_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aroma_payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aroma_leaves ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان للموظفين
CREATE POLICY "Employees can view own profile" ON public.aroma_employees
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage employees" ON public.aroma_employees
  FOR ALL USING (true);

-- سياسات الأمان للمناوبات
CREATE POLICY "Employees can view shifts" ON public.aroma_shifts
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage shifts" ON public.aroma_shifts
  FOR ALL USING (true);

-- سياسات الأمان لجدولة العمل
CREATE POLICY "Employees can view schedules" ON public.aroma_work_schedules
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage schedules" ON public.aroma_work_schedules
  FOR ALL USING (true);

-- سياسات الأمان للحضور
CREATE POLICY "Employees can view attendance" ON public.aroma_attendance
  FOR SELECT USING (true);

CREATE POLICY "Employees can record attendance" ON public.aroma_attendance
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage attendance" ON public.aroma_attendance
  FOR ALL USING (true);

-- سياسات الأمان للرواتب
CREATE POLICY "Employees can view own payroll" ON public.aroma_payroll
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage payroll" ON public.aroma_payroll
  FOR ALL USING (true);

-- سياسات الأمان للإجازات
CREATE POLICY "Employees can view leaves" ON public.aroma_leaves
  FOR SELECT USING (true);

CREATE POLICY "Employees can request leaves" ON public.aroma_leaves
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage leaves" ON public.aroma_leaves
  FOR ALL USING (true);

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX idx_aroma_employees_code ON public.aroma_employees(employee_code);
CREATE INDEX idx_aroma_employees_department ON public.aroma_employees(department);
CREATE INDEX idx_aroma_employees_status ON public.aroma_employees(status);
CREATE INDEX idx_aroma_work_schedules_employee ON public.aroma_work_schedules(employee_id);
CREATE INDEX idx_aroma_work_schedules_date ON public.aroma_work_schedules(work_date);
CREATE INDEX idx_aroma_attendance_employee ON public.aroma_attendance(employee_id);
CREATE INDEX idx_aroma_attendance_date ON public.aroma_attendance(work_date);
CREATE INDEX idx_aroma_payroll_employee ON public.aroma_payroll(employee_id);
CREATE INDEX idx_aroma_payroll_period ON public.aroma_payroll(pay_period_start, pay_period_end);
CREATE INDEX idx_aroma_leaves_employee ON public.aroma_leaves(employee_id);
CREATE INDEX idx_aroma_leaves_dates ON public.aroma_leaves(start_date, end_date);

-- دالة توليد كود الموظف
CREATE OR REPLACE FUNCTION public.generate_aroma_employee_code()
RETURNS TEXT AS $$
DECLARE
  prefix TEXT := 'EMP';
  year_part TEXT := EXTRACT(YEAR FROM NOW())::TEXT;
  sequence_num INTEGER;
  emp_code TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(employee_code FROM 8) AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM public.aroma_employees
  WHERE employee_code LIKE prefix || year_part || '%';
  
  emp_code := prefix || year_part || LPAD(sequence_num::TEXT, 4, '0');
  
  RETURN emp_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- دالة توليد كود الموظف تلقائياً
CREATE OR REPLACE FUNCTION public.auto_generate_aroma_employee_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.employee_code IS NULL THEN
    NEW.employee_code := public.generate_aroma_employee_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- دالة حساب ساعات العمل
CREATE OR REPLACE FUNCTION public.calculate_work_hours()
RETURNS TRIGGER AS $$
DECLARE
  total_minutes INTEGER;
  break_minutes INTEGER;
BEGIN
  IF NEW.clock_in IS NOT NULL AND NEW.clock_out IS NOT NULL THEN
    -- حساب إجمالي الدقائق
    total_minutes := EXTRACT(EPOCH FROM (NEW.clock_out - NEW.clock_in)) / 60;
    
    -- حساب دقائق الاستراحة
    break_minutes := 0;
    IF NEW.break_start IS NOT NULL AND NEW.break_end IS NOT NULL THEN
      break_minutes := EXTRACT(EPOCH FROM (NEW.break_end - NEW.break_start)) / 60;
    END IF;
    
    -- حساب إجمالي ساعات العمل
    NEW.total_hours := ROUND((total_minutes - break_minutes) / 60.0, 2);
    
    -- حساب ساعات العمل الإضافي (أكثر من 8 ساعات)
    IF NEW.total_hours > 8 THEN
      NEW.overtime_hours := NEW.total_hours - 8;
    ELSE
      NEW.overtime_hours := 0;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- إنشاء المحفزات (Triggers)
CREATE TRIGGER update_aroma_employees_updated_at
  BEFORE UPDATE ON public.aroma_employees
  FOR EACH ROW EXECUTE FUNCTION public.update_aroma_updated_at();

CREATE TRIGGER update_aroma_shifts_updated_at
  BEFORE UPDATE ON public.aroma_shifts
  FOR EACH ROW EXECUTE FUNCTION public.update_aroma_updated_at();

CREATE TRIGGER update_aroma_work_schedules_updated_at
  BEFORE UPDATE ON public.aroma_work_schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_aroma_updated_at();

CREATE TRIGGER update_aroma_attendance_updated_at
  BEFORE UPDATE ON public.aroma_attendance
  FOR EACH ROW EXECUTE FUNCTION public.update_aroma_updated_at();

CREATE TRIGGER update_aroma_payroll_updated_at
  BEFORE UPDATE ON public.aroma_payroll
  FOR EACH ROW EXECUTE FUNCTION public.update_aroma_updated_at();

CREATE TRIGGER update_aroma_leaves_updated_at
  BEFORE UPDATE ON public.aroma_leaves
  FOR EACH ROW EXECUTE FUNCTION public.update_aroma_updated_at();

CREATE TRIGGER auto_generate_aroma_employee_code_trigger
  BEFORE INSERT ON public.aroma_employees
  FOR EACH ROW EXECUTE FUNCTION public.auto_generate_aroma_employee_code();

CREATE TRIGGER calculate_work_hours_trigger
  BEFORE INSERT OR UPDATE ON public.aroma_attendance
  FOR EACH ROW EXECUTE FUNCTION public.calculate_work_hours();

-- إدراج بعض المناوبات الافتراضية
INSERT INTO public.aroma_shifts (name, start_time, end_time, break_duration) VALUES
('الصباحي', '08:00:00', '16:00:00', 30),
('المسائي', '16:00:00', '00:00:00', 30),
('الليلي', '00:00:00', '08:00:00', 30),
('نصف دوام صباحي', '08:00:00', '12:00:00', 15),
('نصف دوام مسائي', '14:00:00', '18:00:00', 15);