-- إنشاء جدول منتجات Aroma الجديد
CREATE TABLE public.aroma_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  category TEXT NOT NULL,
  weight TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  old_price NUMERIC(10,2),
  stock INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER DEFAULT 10,
  image_url TEXT,
  description TEXT,
  description_ar TEXT,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.aroma_products ENABLE ROW LEVEL SECURITY;

-- Policies for public read
CREATE POLICY "Public can view active products" 
ON public.aroma_products 
FOR SELECT 
USING (is_active = true);

-- Policies for admin management
CREATE POLICY "Admins can manage products" 
ON public.aroma_products 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('aroma-products', 'aroma-products', true);

-- Storage policies for product images
CREATE POLICY "Public can view product images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'aroma-products');

CREATE POLICY "Admins can upload product images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'aroma-products' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can update product images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'aroma-products' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can delete product images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'aroma-products' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- إدراج المنتجات من الصورة
INSERT INTO public.aroma_products (sku, name, name_ar, category, weight, price, stock) VALUES
('AROMA-250', 'Aroma 250g', 'أروما 250 جم', 'coffee', '250g', 450, 100),
('OSCAR-250', 'Oscar 250g', 'أوسكار 250 جم', 'coffee', '250g', 420, 100),
('AROMA-ESPRESSO-250', 'Aroma Espresso 250g', 'أروما إسبريسو 250 جم', 'coffee', '250g', 480, 100),
('AROMA-FAMILIALE', 'Aroma Familiale', 'أروما عائلي', 'coffee', '1kg', 850, 50),
('AROMA-125', 'Aroma 125g', 'أروما 125 جم', 'coffee', '125g', 250, 100),
('OSCAR-125', 'Oscar 125g', 'أوسكار 125 جم', 'coffee', '125g', 230, 100),
('AROMA-5KG', 'Aroma 5KG', 'أروما 5 كيلو', 'coffee', '5kg', 8500, 20),
('OSCAR-5KG', 'Oscar 5KG', 'أوسكار 5 كيلو', 'coffee', '5kg', 8200, 20),
('AROMA-POT-700', 'Aroma POT 700g', 'أروما بوت 700 جم', 'coffee', '700g', 680, 50),
('AROMA-POT-400', 'Aroma POT 400g', 'أروما بوت 400 جم', 'coffee', '400g', 520, 50),
('OSCAR-POT-700', 'Oscar POT 700g', 'أوسكار بوت 700 جم', 'coffee', '700g', 650, 50),
('OSCAR-POT-400', 'Oscar POT 400g', 'أوسكار بوت 400 جم', 'coffee', '400g', 490, 50),
('AROMA-CAPSULE', 'Aroma Capsule', 'أروما كبسولة', 'capsules', NULL, 350, 100),
('OSCAR-CAPSULE', 'Oscar Capsule', 'أوسكار كبسولة', 'capsules', NULL, 330, 100),
('CAFE-DOR-250', 'Café D''Or 250g', 'كافيه دور 250 جم', 'coffee', '250g', 550, 80),
('CAFE-DOR-700', 'Café D''Or 700g', 'كافيه دور 700 جم', 'coffee', '700g', 1200, 40),
('CAFE-DOR-400', 'Café D''Or 400g', 'كافيه دور 400 جم', 'coffee', '400g', 750, 60),
('AROMA-GOLD-250', 'Aroma GOLD 250g', 'أروما جولد 250 جم', 'premium', '250g', 650, 50);

-- Create index for faster queries
CREATE INDEX idx_aroma_products_category ON public.aroma_products(category);
CREATE INDEX idx_aroma_products_sku ON public.aroma_products(sku);
CREATE INDEX idx_aroma_products_active ON public.aroma_products(is_active);

-- Trigger for updating updated_at
CREATE TRIGGER update_aroma_products_updated_at
BEFORE UPDATE ON public.aroma_products
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();