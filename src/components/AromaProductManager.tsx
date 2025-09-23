import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Upload, 
  Edit, 
  Trash2, 
  Package, 
  Image as ImageIcon,
  Coffee,
  Star,
  TrendingUp,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw,
  Search,
  Filter,
  Download,
  Grid3X3,
  List,
  Sparkles
} from 'lucide-react';

interface AromaProduct {
  id: string;
  sku: string;
  name: string;
  name_ar: string;
  category: string;
  weight: string | null;
  price: number;
  retail_price: number;
  wholesale_price: number;
  super_wholesale_price: number;
  old_price: number | null;
  stock: number;
  min_stock: number;
  image_url: string | null;
  description: string | null;
  description_ar: string | null;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

const AromaProductManager: React.FC = () => {
  const [products, setProducts] = useState<AromaProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editingProduct, setEditingProduct] = useState<AromaProduct | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    name_ar: '',
    category: 'coffee',
    weight: '',
    retail_price: '',
    wholesale_price: '',
    super_wholesale_price: '',
    old_price: '',
    stock: '',
    min_stock: '10',
    description: '',
    description_ar: '',
    is_active: true,
    is_featured: false,
    image_url: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('aroma_products')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في جلب المنتجات",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      setUploadingImage(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('aroma-products')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('aroma-products')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      
      toast({
        title: "تم الرفع",
        description: "تم رفع الصورة بنجاح"
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في رفع الصورة",
        variant: "destructive"
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const productData = {
        ...formData,
        retail_price: parseFloat(formData.retail_price) || 0,
        wholesale_price: parseFloat(formData.wholesale_price) || 0,
        super_wholesale_price: parseFloat(formData.super_wholesale_price) || 0,
        old_price: formData.old_price ? parseFloat(formData.old_price) : null,
        stock: parseInt(formData.stock) || 0,
        min_stock: parseInt(formData.min_stock) || 10,
        weight: formData.weight || null
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('aroma_products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        toast({
          title: "تم التحديث",
          description: "تم تحديث المنتج بنجاح"
        });
      } else {
        const { error } = await supabase
          .from('aroma_products')
          .insert([productData]);

        if (error) throw error;
        toast({
          title: "تم الإضافة",
          description: "تم إضافة المنتج بنجاح"
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في حفظ المنتج",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (product: AromaProduct) => {
    setEditingProduct(product);
    setFormData({
      sku: product.sku,
      name: product.name,
      name_ar: product.name_ar,
      category: product.category,
      weight: product.weight || '',
      retail_price: product.retail_price?.toString() || '0',
      wholesale_price: product.wholesale_price?.toString() || '0',
      super_wholesale_price: product.super_wholesale_price?.toString() || '0',
      old_price: product.old_price?.toString() || '',
      stock: product.stock.toString(),
      min_stock: product.min_stock.toString(),
      description: product.description || '',
      description_ar: product.description_ar || '',
      is_active: product.is_active,
      is_featured: product.is_featured,
      image_url: product.image_url || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;

    try {
      const { error } = await supabase
        .from('aroma_products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "تم الحذف",
        description: "تم حذف المنتج بنجاح"
      });
      
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في حذف المنتج",
        variant: "destructive"
      });
    }
  };

  const toggleProductStatus = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('aroma_products')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: isActive ? "تم الإلغاء" : "تم التفعيل",
        description: isActive ? "تم إلغاء تفعيل المنتج" : "تم تفعيل المنتج"
      });
      
      fetchProducts();
    } catch (error) {
      console.error('Error toggling product:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في تغيير حالة المنتج",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      sku: '',
      name: '',
      name_ar: '',
      category: 'coffee',
      weight: '',
      retail_price: '',
      wholesale_price: '',
      super_wholesale_price: '',
      old_price: '',
      stock: '',
      min_stock: '10',
      description: '',
      description_ar: '',
      is_active: true,
      is_featured: false,
      image_url: ''
    });
    setEditingProduct(null);
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.name_ar.includes(searchTerm) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', 'coffee', 'capsules', 'premium'];

  return (
    <div className="space-y-6">
      {/* Header with modern gradient */}
      <div className="bg-gradient-to-r from-primary via-primary/80 to-accent p-6 rounded-2xl shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="text-white">
            <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
              <Coffee className="w-8 h-8 animate-pulse" />
              إدارة منتجات Aroma
            </h2>
            <p className="text-white/90 mt-1">
              {products.length} منتج • {products.filter(p => p.is_active).length} نشط
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => resetForm()}
                className="bg-white text-primary hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Plus className="w-5 h-5 mr-2" />
                إضافة منتج جديد
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">
                  {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
                </DialogTitle>
              </DialogHeader>
              
              <Tabs defaultValue="basic" className="mt-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">المعلومات الأساسية</TabsTrigger>
                  <TabsTrigger value="details">التفاصيل</TabsTrigger>
                  <TabsTrigger value="image">الصورة</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>SKU</Label>
                      <Input
                        value={formData.sku}
                        onChange={(e) => setFormData({...formData, sku: e.target.value})}
                        placeholder="AROMA-250"
                      />
                    </div>
                    <div>
                      <Label>الفئة</Label>
                      <select
                        className="w-full rounded-md border border-input bg-background px-3 py-2"
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                      >
                        <option value="coffee">قهوة</option>
                        <option value="capsules">كبسولات</option>
                        <option value="premium">بريميوم</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>الاسم (English)</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Aroma 250g"
                      />
                    </div>
                    <div>
                      <Label>الاسم (عربي)</Label>
                      <Input
                        value={formData.name_ar}
                        onChange={(e) => setFormData({...formData, name_ar: e.target.value})}
                        placeholder="أروما 250 جم"
                        dir="rtl"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>الوزن</Label>
                    <Input
                      value={formData.weight}
                      onChange={(e) => setFormData({...formData, weight: e.target.value})}
                      placeholder="250g"
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>سعر التجزئة *</Label>
                      <Input
                        type="number"
                        value={formData.retail_price}
                        onChange={(e) => setFormData({...formData, retail_price: e.target.value})}
                        placeholder="450"
                        required
                      />
                    </div>
                    <div>
                      <Label>سعر الجملة *</Label>
                      <Input
                        type="number"
                        value={formData.wholesale_price}
                        onChange={(e) => setFormData({...formData, wholesale_price: e.target.value})}
                        placeholder="400"
                        required
                      />
                    </div>
                    <div>
                      <Label>سعر السوبر جملة *</Label>
                      <Input
                        type="number"
                        value={formData.super_wholesale_price}
                        onChange={(e) => setFormData({...formData, super_wholesale_price: e.target.value})}
                        placeholder="350"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>السعر القديم (للعروض)</Label>
                    <Input
                      type="number"
                      value={formData.old_price}
                      onChange={(e) => setFormData({...formData, old_price: e.target.value})}
                      placeholder="500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>المخزون</Label>
                      <Input
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({...formData, stock: e.target.value})}
                        placeholder="100"
                      />
                    </div>
                    <div>
                      <Label>الحد الأدنى للمخزون</Label>
                      <Input
                        type="number"
                        value={formData.min_stock}
                        onChange={(e) => setFormData({...formData, min_stock: e.target.value})}
                        placeholder="10"
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="details" className="space-y-4">
                  <div>
                    <Label>الوصف (English)</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Product description..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>الوصف (عربي)</Label>
                    <Textarea
                      value={formData.description_ar}
                      onChange={(e) => setFormData({...formData, description_ar: e.target.value})}
                      placeholder="وصف المنتج..."
                      rows={3}
                      dir="rtl"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between py-2 px-3 bg-muted rounded-lg">
                    <Label htmlFor="active" className="cursor-pointer">المنتج نشط</Label>
                    <Switch
                      id="active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between py-2 px-3 bg-muted rounded-lg">
                    <Label htmlFor="featured" className="cursor-pointer">منتج مميز</Label>
                    <Switch
                      id="featured"
                      checked={formData.is_featured}
                      onCheckedChange={(checked) => setFormData({...formData, is_featured: checked})}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="image" className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    {formData.image_url ? (
                      <div className="space-y-4">
                        <img
                          src={formData.image_url}
                          alt="Product"
                          className="w-48 h-48 object-cover mx-auto rounded-lg shadow-lg"
                        />
                        <Button
                          variant="outline"
                          onClick={() => setFormData({...formData, image_url: ''})}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          إزالة الصورة
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <ImageIcon className="w-16 h-16 mx-auto text-muted-foreground" />
                        <div>
                          <Label htmlFor="image-upload" className="cursor-pointer">
                            <div className="flex items-center justify-center gap-2">
                              {uploadingImage ? (
                                <>
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                  جاري الرفع...
                                </>
                              ) : (
                                <>
                                  <Upload className="w-5 h-5" />
                                  اختر صورة للمنتج
                                </>
                              )}
                            </div>
                          </Label>
                          <Input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(file);
                            }}
                            disabled={uploadingImage}
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          PNG, JPG, WEBP (Max. 5MB)
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleSubmit} className="min-w-[100px]">
                  {editingProduct ? 'تحديث' : 'إضافة'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-card/80">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="البحث عن منتج..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background/50 backdrop-blur"
              />
            </div>
            
            <div className="flex gap-2">
              {categories.map(cat => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  className="capitalize"
                >
                  {cat === 'all' ? 'الكل' : 
                   cat === 'coffee' ? 'قهوة' :
                   cat === 'capsules' ? 'كبسولات' : 'بريميوم'}
                </Button>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={fetchProducts}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Display */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <Card 
              key={product.id} 
              className="group hover:shadow-2xl transition-all duration-300 border-0 overflow-hidden bg-gradient-to-br from-card to-card/90 hover:scale-[1.02]"
            >
              <div className="relative h-48 bg-gradient-to-br from-muted to-muted/50">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-20 h-20 text-muted-foreground/30" />
                  </div>
                )}
                
                <div className="absolute top-2 right-2 flex gap-2">
                  {product.is_featured && (
                    <Badge className="bg-yellow-500 text-white">
                      <Star className="w-3 h-3 mr-1" />
                      مميز
                    </Badge>
                  )}
                  <Badge variant={product.is_active ? 'default' : 'secondary'}>
                    {product.is_active ? 'نشط' : 'معطل'}
                  </Badge>
                </div>
                
                {product.stock <= product.min_stock && (
                  <Badge className="absolute bottom-2 left-2 bg-red-500 text-white">
                    مخزون منخفض
                  </Badge>
                )}
              </div>
              
              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="font-bold text-lg">{product.name_ar}</h3>
                  <p className="text-sm text-muted-foreground">{product.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">SKU: {product.sku}</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-primary">
                        {product.price} د.ج
                      </span>
                      {product.old_price && (
                        <span className="text-sm line-through text-muted-foreground">
                          {product.old_price} د.ج
                        </span>
                      )}
                    </div>
                    {product.weight && (
                      <span className="text-xs text-muted-foreground">{product.weight}</span>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm font-medium">المخزون: {product.stock}</p>
                    <Badge variant="outline" className="text-xs">
                      {product.category === 'coffee' ? 'قهوة' :
                       product.category === 'capsules' ? 'كبسولات' : 'بريميوم'}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(product)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    تعديل
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleProductStatus(product.id, product.is_active)}
                    className="flex-1"
                  >
                    {product.is_active ? (
                      <>
                        <EyeOff className="w-4 h-4 mr-1" />
                        إيقاف
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-1" />
                        تفعيل
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(product.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="overflow-hidden border-0 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-primary/10 to-accent/10">
                <tr>
                  <th className="text-right p-4 font-semibold">الصورة</th>
                  <th className="text-right p-4 font-semibold">المنتج</th>
                  <th className="text-right p-4 font-semibold">SKU</th>
                  <th className="text-right p-4 font-semibold">الفئة</th>
                  <th className="text-right p-4 font-semibold">السعر</th>
                  <th className="text-right p-4 font-semibold">المخزون</th>
                  <th className="text-right p-4 font-semibold">الحالة</th>
                  <th className="text-right p-4 font-semibold">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product, index) => (
                  <tr key={product.id} className={`border-b hover:bg-muted/50 transition-colors ${index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}>
                    <td className="p-4">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                          <Package className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-semibold">{product.name_ar}</p>
                        <p className="text-sm text-muted-foreground">{product.name}</p>
                      </div>
                    </td>
                    <td className="p-4 text-sm">{product.sku}</td>
                    <td className="p-4">
                      <Badge variant="outline">
                        {product.category === 'coffee' ? 'قهوة' :
                         product.category === 'capsules' ? 'كبسولات' : 'بريميوم'}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-semibold">{product.price} د.ج</p>
                        {product.old_price && (
                          <p className="text-sm line-through text-muted-foreground">
                            {product.old_price} د.ج
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={product.stock <= product.min_stock ? 'text-red-500 font-semibold' : ''}>
                          {product.stock}
                        </span>
                        {product.stock <= product.min_stock && (
                          <Badge variant="destructive" className="text-xs">منخفض</Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Badge variant={product.is_active ? 'default' : 'secondary'}>
                          {product.is_active ? 'نشط' : 'معطل'}
                        </Badge>
                        {product.is_featured && (
                          <Badge className="bg-yellow-500 text-white">
                            <Star className="w-3 h-3" />
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleProductStatus(product.id, product.is_active)}
                        >
                          {product.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(product.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      
      {filteredProducts.length === 0 && !loading && (
        <Card className="p-12 text-center border-0 bg-gradient-to-br from-muted/50 to-muted/30">
          <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground">
            لا توجد منتجات
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {searchTerm ? 'جرب البحث بكلمات أخرى' : 'ابدأ بإضافة منتج جديد'}
          </p>
        </Card>
      )}
    </div>
  );
};

export default AromaProductManager;