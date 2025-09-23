-- إنشاء جداول شركة أروما للمنتجات الغذائية والقهوة

-- جدول الفئات
CREATE TABLE public.aroma_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description TEXT,
  description_ar TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- جدول المنتجات
CREATE TABLE public.aroma_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description TEXT,
  description_ar TEXT,
  category_id UUID REFERENCES public.aroma_categories(id),
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  old_price NUMERIC(10,2),
  cost_price NUMERIC(10,2),
  stock INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER DEFAULT 10,
  weight TEXT,
  dimensions TEXT,
  image_url TEXT,
  gallery_urls TEXT[],
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  tags TEXT[],
  nutritional_info JSONB DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- جدول العملاء
CREATE TABLE public.aroma_customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female')),
  address JSONB DEFAULT '{}',
  loyalty_points INTEGER DEFAULT 0,
  total_spent NUMERIC(12,2) DEFAULT 0,
  last_purchase_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- جدول الطلبات
CREATE TABLE public.aroma_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE,
  customer_id UUID REFERENCES public.aroma_customers(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  shipping_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(12,2) DEFAULT 0,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_method TEXT DEFAULT 'cash_on_delivery',
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  order_status TEXT DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled')),
  notes TEXT,
  delivery_date TIMESTAMP WITH TIME ZONE,
  tracking_number TEXT,
  courier_company TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- جدول عناصر الطلبات
CREATE TABLE public.aroma_order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.aroma_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.aroma_products(id),
  product_name TEXT NOT NULL,
  product_sku TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  discount_amount NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- جدول التقييمات
CREATE TABLE public.aroma_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.aroma_products(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.aroma_customers(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- جدول الكوبونات
CREATE TABLE public.aroma_coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(10,2) NOT NULL,
  minimum_amount NUMERIC(10,2) DEFAULT 0,
  maximum_discount NUMERIC(10,2),
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  applicable_products UUID[],
  applicable_categories UUID[],
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- تمكين RLS على جميع الجداول
ALTER TABLE public.aroma_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aroma_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aroma_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aroma_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aroma_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aroma_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aroma_coupons ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان للفئات
CREATE POLICY "Anyone can view active categories" ON public.aroma_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage categories" ON public.aroma_categories
  FOR ALL USING (true);

-- سياسات الأمان للمنتجات
CREATE POLICY "Anyone can view active products" ON public.aroma_products
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage products" ON public.aroma_products
  FOR ALL USING (true);

-- سياسات الأمان للعملاء
CREATE POLICY "Customers can view own profile" ON public.aroma_customers
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create customer" ON public.aroma_customers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Customers can update own profile" ON public.aroma_customers
  FOR UPDATE USING (true);

-- سياسات الأمان للطلبات
CREATE POLICY "Anyone can view orders" ON public.aroma_orders
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create orders" ON public.aroma_orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update orders" ON public.aroma_orders
  FOR UPDATE USING (true);

-- سياسات الأمان لعناصر الطلبات
CREATE POLICY "Anyone can view order items" ON public.aroma_order_items
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create order items" ON public.aroma_order_items
  FOR INSERT WITH CHECK (true);

-- سياسات الأمان للتقييمات
CREATE POLICY "Anyone can view approved reviews" ON public.aroma_reviews
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Anyone can create reviews" ON public.aroma_reviews
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage reviews" ON public.aroma_reviews
  FOR ALL USING (true);

-- سياسات الأمان للكوبونات
CREATE POLICY "Anyone can view active coupons" ON public.aroma_coupons
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage coupons" ON public.aroma_coupons
  FOR ALL USING (true);

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX idx_aroma_products_category ON public.aroma_products(category_id);
CREATE INDEX idx_aroma_products_sku ON public.aroma_products(sku);
CREATE INDEX idx_aroma_orders_customer ON public.aroma_orders(customer_id);
CREATE INDEX idx_aroma_orders_status ON public.aroma_orders(order_status);
CREATE INDEX idx_aroma_order_items_order ON public.aroma_order_items(order_id);
CREATE INDEX idx_aroma_order_items_product ON public.aroma_order_items(product_id);
CREATE INDEX idx_aroma_reviews_product ON public.aroma_reviews(product_id);
CREATE INDEX idx_aroma_coupons_code ON public.aroma_coupons(code);

-- دالة توليد رقم الطلب
CREATE OR REPLACE FUNCTION public.generate_aroma_order_number()
RETURNS TEXT AS $$
DECLARE
  prefix TEXT := 'ARO';
  year_part TEXT := EXTRACT(YEAR FROM NOW())::TEXT;
  sequence_num INTEGER;
  order_num TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 8) AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM public.aroma_orders
  WHERE order_number LIKE prefix || year_part || '%';
  
  order_num := prefix || year_part || LPAD(sequence_num::TEXT, 6, '0');
  
  RETURN order_num;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- دالة تحديث updated_at
CREATE OR REPLACE FUNCTION public.update_aroma_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- دالة توليد رقم الطلب تلقائياً
CREATE OR REPLACE FUNCTION public.auto_generate_aroma_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := public.generate_aroma_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- دالة حساب إجمالي الطلب
CREATE OR REPLACE FUNCTION public.update_aroma_order_total()
RETURNS TRIGGER AS $$
DECLARE
  order_subtotal NUMERIC(12,2);
  order_tax NUMERIC(12,2);
  order_total NUMERIC(12,2);
BEGIN
  SELECT COALESCE(SUM(total_price - discount_amount), 0)
  INTO order_subtotal
  FROM public.aroma_order_items
  WHERE order_id = COALESCE(NEW.order_id, OLD.order_id);
  
  order_tax := order_subtotal * 0.19; -- 19% ضريبة
  order_total := order_subtotal + order_tax;
  
  UPDATE public.aroma_orders
  SET 
    subtotal = order_subtotal,
    tax_amount = order_tax,
    total_amount = order_total + shipping_fee,
    updated_at = now()
  WHERE id = COALESCE(NEW.order_id, OLD.order_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- إنشاء المحفزات (Triggers)
CREATE TRIGGER update_aroma_categories_updated_at
  BEFORE UPDATE ON public.aroma_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_aroma_updated_at();

CREATE TRIGGER update_aroma_products_updated_at
  BEFORE UPDATE ON public.aroma_products
  FOR EACH ROW EXECUTE FUNCTION public.update_aroma_updated_at();

CREATE TRIGGER update_aroma_customers_updated_at
  BEFORE UPDATE ON public.aroma_customers
  FOR EACH ROW EXECUTE FUNCTION public.update_aroma_updated_at();

CREATE TRIGGER update_aroma_orders_updated_at
  BEFORE UPDATE ON public.aroma_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_aroma_updated_at();

CREATE TRIGGER update_aroma_reviews_updated_at
  BEFORE UPDATE ON public.aroma_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_aroma_updated_at();

CREATE TRIGGER update_aroma_coupons_updated_at
  BEFORE UPDATE ON public.aroma_coupons
  FOR EACH ROW EXECUTE FUNCTION public.update_aroma_updated_at();

CREATE TRIGGER auto_generate_aroma_order_number_trigger
  BEFORE INSERT ON public.aroma_orders
  FOR EACH ROW EXECUTE FUNCTION public.auto_generate_aroma_order_number();

CREATE TRIGGER update_aroma_order_total_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.aroma_order_items
  FOR EACH ROW EXECUTE FUNCTION public.update_aroma_order_total();