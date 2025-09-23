-- إنشاء جدول للأدوار
CREATE TABLE IF NOT EXISTS public.employee_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  name_ar TEXT NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- إدراج الأدوار الافتراضية
INSERT INTO public.employee_roles (name, name_ar, description, permissions) VALUES
('admin', 'مدير', 'صلاحيات كاملة للنظام', '["all"]'::jsonb),
('warehouse_manager', 'مدير مخزن', 'إدارة المخزون والمنتجات', '["inventory", "products", "orders_view"]'::jsonb),
('driver', 'سائق', 'توصيل الطلبات', '["delivery", "orders_view"]'::jsonb),
('order_collector', 'جمع الطلبات', 'جمع ومعالجة الطلبات', '["orders", "customers"]'::jsonb),
('sales_rep', 'مندوب مبيعات', 'المبيعات والعملاء', '["sales", "customers", "orders"]'::jsonb),
('accountant', 'محاسب', 'المحاسبة والمالية', '["finance", "reports"]'::jsonb);

-- تحديث جدول profiles لإضافة employee_role_id
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS employee_role_id UUID REFERENCES public.employee_roles(id),
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS hire_date DATE,
ADD COLUMN IF NOT EXISTS salary NUMERIC,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS address JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- تحديث البيانات الموجودة
UPDATE public.profiles 
SET employee_role_id = (
  SELECT id FROM public.employee_roles 
  WHERE name = CASE 
    WHEN profiles.role = 'admin' THEN 'admin'
    ELSE 'order_collector'
  END
  LIMIT 1
)
WHERE employee_role_id IS NULL;

-- إنشاء جدول المبيعات اليومية لتتبع الأداء
CREATE TABLE IF NOT EXISTS public.daily_sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  orders_count INTEGER DEFAULT 0,
  total_amount NUMERIC DEFAULT 0,
  target_amount NUMERIC DEFAULT 0,
  efficiency_percentage NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- إنشاء جدول الأهداف
CREATE TABLE IF NOT EXISTS public.targets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES public.employee_roles(id),
  target_type TEXT NOT NULL DEFAULT 'daily', -- daily, weekly, monthly
  target_value NUMERIC NOT NULL,
  target_unit TEXT DEFAULT 'orders', -- orders, amount, customers
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- إنشاء تريجر للتحديث التلقائي
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إضافة تريجرات للجداول الجديدة
CREATE TRIGGER update_employee_roles_updated_at 
  BEFORE UPDATE ON public.employee_roles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_sales_updated_at 
  BEFORE UPDATE ON public.daily_sales 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_targets_updated_at 
  BEFORE UPDATE ON public.targets 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- تفعيل RLS للجداول الجديدة
ALTER TABLE public.employee_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.targets ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان للأدوار
CREATE POLICY "Everyone can view active roles" ON public.employee_roles
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage roles" ON public.employee_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- سياسات الأمان للمبيعات اليومية
CREATE POLICY "Users can view their own sales" ON public.daily_sales
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sales" ON public.daily_sales
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sales" ON public.daily_sales
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all sales" ON public.daily_sales
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- سياسات الأمان للأهداف
CREATE POLICY "Users can view their own targets" ON public.targets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all targets" ON public.targets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );