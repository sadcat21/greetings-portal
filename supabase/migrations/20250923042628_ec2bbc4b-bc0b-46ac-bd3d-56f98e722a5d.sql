-- إصلاح القيد المرجعي لجدول aroma_customers
ALTER TABLE aroma_customers DROP CONSTRAINT IF EXISTS aroma_customers_created_by_fkey;

-- إنشاء دالة لحساب تاريخ التسليم التلقائي (تجنب الجمعة)
CREATE OR REPLACE FUNCTION public.calculate_delivery_date(order_date date DEFAULT CURRENT_DATE)
RETURNS date AS $$
DECLARE
  delivery_date date;
  day_of_week integer;
BEGIN
  -- تاريخ التسليم = تاريخ الطلب + يوم واحد
  delivery_date := order_date + INTERVAL '1 day';
  
  -- التحقق من يوم الأسبوع (0=الأحد، 1=الاثنين، 5=الجمعة، 6=السبت)
  day_of_week := EXTRACT(DOW FROM delivery_date);
  
  -- إذا كان اليوم جمعة (5)، اجعله سبت (6)
  IF day_of_week = 5 THEN
    delivery_date := delivery_date + INTERVAL '1 day';
  END IF;
  
  RETURN delivery_date;
END;
$$ LANGUAGE plpgsql;

-- تحديث trigger لحساب تاريخ التسليم التلقائي
CREATE OR REPLACE FUNCTION public.auto_set_delivery_date()
RETURNS trigger AS $$
BEGIN
  -- إذا لم يتم تعيين تاريخ التسليم، احسبه تلقائياً
  IF NEW.delivery_date IS NULL THEN
    NEW.delivery_date := public.calculate_delivery_date(NEW.order_date);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إضافة trigger لجدول aroma_orders
DROP TRIGGER IF EXISTS auto_delivery_date_trigger ON aroma_orders;
CREATE TRIGGER auto_delivery_date_trigger
  BEFORE INSERT OR UPDATE ON aroma_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_set_delivery_date();