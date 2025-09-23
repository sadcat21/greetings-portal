-- إنشاء جدول المنتجات
CREATE TABLE IF NOT EXISTS public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  category TEXT,
  description TEXT,
  image_url TEXT,
  sku TEXT UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- إنشاء جدول العمال مع أهدافهم
CREATE TABLE IF NOT EXISTS public.workers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  daily_target INTEGER NOT NULL DEFAULT 20,
  weekly_target INTEGER NOT NULL DEFAULT 140,
  monthly_target INTEGER NOT NULL DEFAULT 400,
  current_daily INTEGER NOT NULL DEFAULT 0,
  current_weekly INTEGER NOT NULL DEFAULT 0,
  current_monthly INTEGER NOT NULL DEFAULT 0,
  efficiency NUMERIC(5,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- إنشاء جدول إحصائيات المبيعات اليومية
CREATE TABLE IF NOT EXISTS public.daily_sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_orders INTEGER NOT NULL DEFAULT 0,
  total_revenue NUMERIC(12,2) NOT NULL DEFAULT 0,
  worker_id UUID REFERENCES public.workers(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(date, worker_id)
);

-- إنشاء جدول أهداف العمال التاريخية
CREATE TABLE IF NOT EXISTS public.worker_targets_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_id UUID REFERENCES public.workers(id) ON DELETE CASCADE,
  daily_target INTEGER NOT NULL,
  weekly_target INTEGER NOT NULL,
  monthly_target INTEGER NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_targets_history ENABLE ROW LEVEL SECURITY;

-- سياسات الوصول للمنتجات
CREATE POLICY "Everyone can view products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins can manage products" ON public.products FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
  )
);

-- سياسات الوصول للعمال
CREATE POLICY "Everyone can view active workers" ON public.workers FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage workers" ON public.workers FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
  )
);
CREATE POLICY "Workers can view their own data" ON public.workers FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Workers can update their own performance" ON public.workers FOR UPDATE USING (user_id = auth.uid());

-- سياسات المبيعات اليومية
CREATE POLICY "Everyone can view sales data" ON public.daily_sales FOR SELECT USING (true);
CREATE POLICY "Admins can manage sales data" ON public.daily_sales FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
  )
);

-- سياسات تاريخ الأهداف
CREATE POLICY "Admins can view targets history" ON public.worker_targets_history FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
  )
);
CREATE POLICY "Admins can insert targets history" ON public.worker_targets_history FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
  )
);

-- إدراج بيانات تجريبية للمنتجات
INSERT INTO public.products (name, name_ar, price, stock_quantity, category, sku) VALUES
  ('AROMA 250g', 'أروما 250 جرام', 450.00, 245, 'coffee', 'AROMA250'),
  ('OSCAR 250g', 'أوسكار 250 جرام', 420.00, 128, 'coffee', 'OSCAR250'),
  ('AROMA Espresso 250g', 'أروما إسبريسو 250 جرام', 480.00, 0, 'coffee', 'AROMAESP250'),
  ('AROMA 5KG', 'أروما 5 كيلو', 8500.00, 12, 'coffee', 'AROMA5KG'),
  ('OSCAR 5KG', 'أوسكار 5 كيلو', 8200.00, 8, 'coffee', 'OSCAR5KG'),
  ('AROMA 125g', 'أروما 125 جرام', 250.00, 89, 'coffee', 'AROMA125'),
  ('OSCAR 125g', 'أوسكار 125 جرام', 230.00, 67, 'coffee', 'OSCAR125'),
  ('AROMA Pot 700g', 'أروما بوت 700 جرام', 980.00, 34, 'coffee', 'AROMAPOT700'),
  ('OSCAR Pot 400g', 'أوسكار بوت 400 جرام', 650.00, 22, 'coffee', 'OSCARPOT400'),
  ('Capsules', 'كبسولات', 320.00, 156, 'coffee', 'CAPSULES'),
  ('Café D\'Or 400g', 'كافيه دور 400 جرام', 720.00, 45, 'coffee', 'CAFEDOR400'),
  ('AROMA GOLD 250g', 'أروما ذهبي 250 جرام', 550.00, 78, 'coffee', 'AROMAGOLD250')
ON CONFLICT (sku) DO NOTHING;

-- دالة لتحديث إحصائيات العامل
CREATE OR REPLACE FUNCTION update_worker_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- تحديث إحصائيات العامل بناءً على الطلبات
  UPDATE public.workers SET
    current_daily = (
      SELECT COUNT(*) FROM public.orders 
      WHERE DATE(created_at) = CURRENT_DATE
      AND modified_by_username = workers.full_name
    ),
    current_weekly = (
      SELECT COUNT(*) FROM public.orders 
      WHERE created_at >= DATE_TRUNC('week', CURRENT_DATE)
      AND modified_by_username = workers.full_name
    ),
    current_monthly = (
      SELECT COUNT(*) FROM public.orders 
      WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
      AND modified_by_username = workers.full_name
    ),
    efficiency = (
      CASE 
        WHEN monthly_target > 0 THEN 
          LEAST(100, (current_monthly::NUMERIC / monthly_target * 100))
        ELSE 0
      END
    ),
    updated_at = now()
  WHERE full_name = COALESCE(NEW.modified_by_username, OLD.modified_by_username);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- trigger لتحديث إحصائيات العمال عند إضافة/تعديل طلب
CREATE TRIGGER update_worker_stats_trigger
  AFTER INSERT OR UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION update_worker_stats();

-- دالة لحساب المبيعات اليومية
CREATE OR REPLACE FUNCTION calculate_daily_sales()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.daily_sales (date, total_orders, total_revenue)
  VALUES (
    CURRENT_DATE,
    (SELECT COUNT(*) FROM public.orders WHERE DATE(created_at) = CURRENT_DATE),
    (SELECT COALESCE(SUM(total_amount), 0) FROM public.orders WHERE DATE(created_at) = CURRENT_DATE)
  )
  ON CONFLICT (date, worker_id) DO UPDATE SET
    total_orders = EXCLUDED.total_orders,
    total_revenue = EXCLUDED.total_revenue;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- trigger لحساب المبيعات اليومية
CREATE TRIGGER calculate_daily_sales_trigger
  AFTER INSERT OR UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION calculate_daily_sales();