-- إنشاء جدول طلبات أروما مع ثلاث أسعار لكل منتج
CREATE TABLE IF NOT EXISTS public.aroma_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_reference TEXT NOT NULL UNIQUE,
  employee_id UUID REFERENCES public.aroma_employees(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  delivery_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'delivered', 'cancelled')),
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(12,2) DEFAULT 0,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_method TEXT DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'transfer')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partial')),
  notes TEXT,
  delivery_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- جدول عناصر الطلب مع أنواع الأسعار المختلفة
CREATE TABLE IF NOT EXISTS public.aroma_order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.aroma_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.aroma_products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  price_type TEXT NOT NULL DEFAULT 'retail' CHECK (price_type IN ('retail', 'wholesale', 'super_wholesale')),
  unit_price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(12,2) NOT NULL,
  discount_amount NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- تحديث جدول المنتجات لإضافة الأسعار الثلاثة
ALTER TABLE public.aroma_products 
ADD COLUMN IF NOT EXISTS retail_price NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS wholesale_price NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS super_wholesale_price NUMERIC(10,2) DEFAULT 0;

-- نسخ السعر الحالي إلى سعر التجزئة
UPDATE public.aroma_products 
SET retail_price = price 
WHERE retail_price = 0 OR retail_price IS NULL;

-- دالة لتوليد رقم طلب تلقائي
CREATE OR REPLACE FUNCTION public.generate_aroma_order_reference()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  prefix TEXT := 'ARO';
  year_part TEXT := EXTRACT(YEAR FROM NOW())::TEXT;
  sequence_num INTEGER;
  order_ref TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_reference FROM 8) AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM public.aroma_orders
  WHERE order_reference LIKE prefix || year_part || '%';
  
  order_ref := prefix || year_part || LPAD(sequence_num::TEXT, 6, '0');
  
  RETURN order_ref;
END;
$$;

-- تريجر لتوليد رقم الطلب تلقائياً
CREATE OR REPLACE FUNCTION public.auto_generate_aroma_order_reference()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.order_reference IS NULL OR NEW.order_reference = '' THEN
    NEW.order_reference := public.generate_aroma_order_reference();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_auto_generate_aroma_order_reference ON public.aroma_orders;
CREATE TRIGGER trigger_auto_generate_aroma_order_reference
  BEFORE INSERT ON public.aroma_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_generate_aroma_order_reference();

-- تريجر لحساب إجمالي الطلب
CREATE OR REPLACE FUNCTION public.update_aroma_order_total()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  order_subtotal NUMERIC(12,2);
  order_total NUMERIC(12,2);
BEGIN
  SELECT COALESCE(SUM(total_price - discount_amount), 0)
  INTO order_subtotal
  FROM public.aroma_order_items
  WHERE order_id = COALESCE(NEW.order_id, OLD.order_id);
  
  order_total := order_subtotal - COALESCE((SELECT discount_amount FROM public.aroma_orders WHERE id = COALESCE(NEW.order_id, OLD.order_id)), 0);
  
  UPDATE public.aroma_orders
  SET 
    subtotal = order_subtotal,
    total_amount = order_total,
    updated_at = now()
  WHERE id = COALESCE(NEW.order_id, OLD.order_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_aroma_order_total ON public.aroma_order_items;
CREATE TRIGGER trigger_update_aroma_order_total
  AFTER INSERT OR UPDATE OR DELETE ON public.aroma_order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_aroma_order_total();

-- تريجر لتسجيل المبيعات تلقائياً عند تأكيد التوصيل
CREATE OR REPLACE FUNCTION public.auto_record_aroma_sales()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  existing_sale_id UUID;
  employee_user_id UUID;
BEGIN
  -- التحقق من تغيير الحالة إلى delivered
  IF OLD.status != 'delivered' AND NEW.status = 'delivered' AND NEW.employee_id IS NOT NULL THEN
    
    -- الحصول على user_id للموظف
    SELECT ae.id INTO employee_user_id 
    FROM public.aroma_employees ae
    WHERE ae.id = NEW.employee_id;
    
    -- التحقق من وجود سجل مبيعات لنفس اليوم والموظف
    SELECT id INTO existing_sale_id
    FROM public.daily_sales
    WHERE user_id = employee_user_id 
      AND date = NEW.delivery_date;
    
    IF existing_sale_id IS NOT NULL THEN
      -- تحديث السجل الموجود
      UPDATE public.daily_sales
      SET 
        total_amount = total_amount + NEW.total_amount,
        orders_count = orders_count + 1,
        updated_at = now()
      WHERE id = existing_sale_id;
    ELSE
      -- إنشاء سجل جديد
      INSERT INTO public.daily_sales (
        user_id,
        date,
        total_amount,
        orders_count,
        target_amount
      ) VALUES (
        employee_user_id,
        NEW.delivery_date,
        NEW.total_amount,
        1,
        COALESCE((SELECT target_amount FROM public.targets WHERE user_id = employee_user_id AND EXTRACT(MONTH FROM target_date) = EXTRACT(MONTH FROM NEW.delivery_date) LIMIT 1), 0)
      );
    END IF;
  END IF;
  
  -- إذا تم إلغاء الطلب، نقصان المبلغ من المبيعات
  IF OLD.status = 'delivered' AND NEW.status IN ('cancelled') AND NEW.employee_id IS NOT NULL THEN
    
    SELECT ae.id INTO employee_user_id 
    FROM public.aroma_employees ae
    WHERE ae.id = NEW.employee_id;
    
    UPDATE public.daily_sales
    SET 
      total_amount = GREATEST(0, total_amount - NEW.total_amount),
      orders_count = GREATEST(0, orders_count - 1),
      updated_at = now()
    WHERE user_id = employee_user_id AND date = NEW.delivery_date;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_auto_record_aroma_sales ON public.aroma_orders;
CREATE TRIGGER trigger_auto_record_aroma_sales
  AFTER UPDATE ON public.aroma_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_record_aroma_sales();

-- إنشاء سياسات RLS
ALTER TABLE public.aroma_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aroma_order_items ENABLE ROW LEVEL SECURITY;

-- سياسات للطلبات
CREATE POLICY "Employees can manage all aroma orders" ON public.aroma_orders
  FOR ALL USING (true);

CREATE POLICY "Admins can manage all aroma orders" ON public.aroma_orders
  FOR ALL USING (true);

-- سياسات لعناصر الطلب
CREATE POLICY "Employees can manage aroma order items" ON public.aroma_order_items
  FOR ALL USING (true);

CREATE POLICY "Admins can manage aroma order items" ON public.aroma_order_items
  FOR ALL USING (true);

-- تحديث تريجر updated_at
DROP TRIGGER IF EXISTS update_aroma_orders_updated_at ON public.aroma_orders;
CREATE TRIGGER update_aroma_orders_updated_at
  BEFORE UPDATE ON public.aroma_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();