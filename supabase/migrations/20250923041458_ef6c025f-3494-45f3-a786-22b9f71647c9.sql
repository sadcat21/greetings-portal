-- إنشاء جدول العملاء الخاص بأروما
CREATE TABLE public.aroma_customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_email TEXT,
  business_name TEXT,
  business_type TEXT DEFAULT 'retail', -- retail, wholesale, super_wholesale
  default_price_type TEXT DEFAULT 'retail', -- retail, wholesale, super_wholesale
  address JSONB DEFAULT '{}',
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  total_orders INTEGER DEFAULT 0,
  total_spent NUMERIC DEFAULT 0,
  last_order_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES aroma_employees(id)
);

-- إضافة عمود customer_id في جدول aroma_orders
ALTER TABLE public.aroma_orders ADD COLUMN customer_id UUID REFERENCES public.aroma_customers(id);

-- إنشاء فهرس للبحث السريع
CREATE INDEX idx_aroma_customers_name ON public.aroma_customers(customer_name);
CREATE INDEX idx_aroma_customers_phone ON public.aroma_customers(customer_phone);
CREATE INDEX idx_aroma_orders_customer_id ON public.aroma_orders(customer_id);

-- تمكين RLS على جدول العملاء
ALTER TABLE public.aroma_customers ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان لجدول العملاء
CREATE POLICY "Admins and employees can manage aroma customers" 
ON public.aroma_customers 
FOR ALL 
USING (true);

-- إنشاء trigger لتحديث updated_at
CREATE TRIGGER update_aroma_customers_updated_at
BEFORE UPDATE ON public.aroma_customers
FOR EACH ROW
EXECUTE FUNCTION public.update_aroma_updated_at();

-- دالة لإحصائيات العميل
CREATE OR REPLACE FUNCTION public.update_customer_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- تحديث إحصائيات العميل عند تسليم الطلب
  IF OLD.status != 'delivered' AND NEW.status = 'delivered' AND NEW.customer_id IS NOT NULL THEN
    UPDATE public.aroma_customers 
    SET 
      total_orders = total_orders + 1,
      total_spent = total_spent + NEW.total_amount,
      last_order_date = NEW.delivery_date,
      updated_at = now()
    WHERE id = NEW.customer_id;
  END IF;
  
  -- تقليل الإحصائيات عند إلغاء الطلب المسلم
  IF OLD.status = 'delivered' AND NEW.status IN ('cancelled') AND NEW.customer_id IS NOT NULL THEN
    UPDATE public.aroma_customers 
    SET 
      total_orders = GREATEST(0, total_orders - 1),
      total_spent = GREATEST(0, total_spent - NEW.total_amount),
      updated_at = now()
    WHERE id = NEW.customer_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- إنشاء trigger لتحديث إحصائيات العميل
CREATE TRIGGER update_customer_stats_trigger
AFTER UPDATE ON public.aroma_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_customer_stats();