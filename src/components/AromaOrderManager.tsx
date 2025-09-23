import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import QuantityModal from './QuantityModal';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Coffee, 
  Package,
  CheckCircle2,
  Clock,
  User,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  Search,
  Filter,
  ShoppingCart,
  Sparkles
} from 'lucide-react';

interface AromaProduct {
  id: string;
  name_ar: string;
  retail_price: number;
  wholesale_price: number;
  super_wholesale_price: number;
  stock: number;
  image_url?: string | null;
}

interface AromaEmployee {
  id: string;
  first_name: string;
  last_name: string;
}

interface AromaOrder {
  id: string;
  order_reference: string;
  employee_id?: string;
  customer_name: string;
  customer_phone?: string;
  order_date: string;
  delivery_date?: string;
  status: string;
  subtotal: number;
  discount_amount: number;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  notes?: string;
  delivery_address?: string;
}

interface OrderItem {
  product_id: string;
  quantity: number;
  price_type: 'retail' | 'wholesale' | 'super_wholesale';
  unit_price: number;
  total_price: number;
}

const AromaOrderManager: React.FC = () => {
  const [orders, setOrders] = useState<AromaOrder[]>([]);
  const [products, setProducts] = useState<AromaProduct[]>([]);
  const [employees, setEmployees] = useState<AromaEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<AromaOrder | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [quantityModalOpen, setQuantityModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<AromaProduct | null>(null);
  const [selectedPriceType, setSelectedPriceType] = useState<'retail' | 'wholesale' | 'super_wholesale'>('retail');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    employee_id: '',
    customer_name: '',
    customer_phone: '',
    order_date: new Date().toISOString().split('T')[0],
    delivery_date: '',
    status: 'pending',
    payment_method: 'cash',
    payment_status: 'pending',
    notes: '',
    delivery_address: '',
    discount_amount: 0
  });

  const statusLabels = {
    pending: 'في الانتظار',
    confirmed: 'مؤكد',
    delivered: 'تم التسليم',
    cancelled: 'ملغي'
  };

  const paymentLabels = {
    cash: 'نقداً',
    card: 'بطاقة',
    transfer: 'تحويل'
  };

  const paymentStatusLabels = {
    pending: 'في الانتظار',
    paid: 'مدفوع',
    partial: 'دفع جزئي'
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // جلب الطلبات
      const { data: ordersData, error: ordersError } = await supabase
        .from('aroma_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // جلب المنتجات
      const { data: productsData, error: productsError } = await supabase
        .from('aroma_products')
        .select('id, name_ar, retail_price, wholesale_price, super_wholesale_price, stock')
        .eq('is_active', true);

      if (productsError) throw productsError;

      // جلب الموظفين
      const { data: employeesData, error: employeesError } = await supabase
        .from('aroma_employees')
        .select('id, first_name, last_name')
        .eq('status', 'active');

      if (employeesError) throw employeesError;

      setOrders(ordersData || []);
      setProducts(productsData || []);
      setEmployees(employeesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في جلب البيانات",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (product: AromaProduct, priceType: 'retail' | 'wholesale' | 'super_wholesale') => {
    setSelectedProduct(product);
    setSelectedPriceType(priceType);
    setQuantityModalOpen(true);
  };

  const handleQuantityConfirm = (quantity: number) => {
    if (selectedProduct) {
      const priceField = `${selectedPriceType}_price` as keyof AromaProduct;
      const unitPrice = selectedProduct[priceField] as number;
      
      const newItem: OrderItem = {
        product_id: selectedProduct.id,
        quantity,
        price_type: selectedPriceType,
        unit_price: unitPrice,
        total_price: unitPrice * quantity
      };

      setOrderItems(prev => [...prev, newItem]);
      setQuantityModalOpen(false);
      setSelectedProduct(null);

      toast({
        title: "تم إضافة المنتج",
        description: `تم إضافة ${quantity} من ${selectedProduct.name_ar}`,
      });
    }
  };

  const addOrderItem = () => {
    setOrderItems([...orderItems, {
      product_id: '',
      quantity: 1,
      price_type: 'retail',
      unit_price: 0,
      total_price: 0
    }]);
  };

  const updateOrderItem = (index: number, field: string, value: any) => {
    const updated = [...orderItems];
    updated[index] = { ...updated[index], [field]: value };

    // حساب السعر والإجمالي عند تغيير المنتج أو نوع السعر
    if (field === 'product_id' || field === 'price_type') {
      const product = products.find(p => p.id === updated[index].product_id);
      if (product) {
        const priceField = `${updated[index].price_type}_price` as keyof AromaProduct;
        updated[index].unit_price = product[priceField] as number;
        updated[index].total_price = updated[index].unit_price * updated[index].quantity;
      }
    } else if (field === 'quantity') {
      updated[index].total_price = updated[index].unit_price * value;
    }

    setOrderItems(updated);
  };

  const removeOrderItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => sum + item.total_price, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (orderItems.length === 0) {
      toast({
        title: "خطأ",
        description: "يجب إضافة عنصر واحد على الأقل للطلب",
        variant: "destructive"
      });
      return;
    }

    try {
      const subtotal = calculateSubtotal();
      const totalAmount = subtotal - formData.discount_amount;

      if (editingOrder) {
        // تحديث طلب موجود
        const updateData = {
          employee_id: formData.employee_id || null,
          customer_name: formData.customer_name,
          customer_phone: formData.customer_phone || null,
          order_date: formData.order_date,
          delivery_date: formData.delivery_date || null,
          status: formData.status,
          payment_method: formData.payment_method,
          payment_status: formData.payment_status,
          notes: formData.notes || null,
          delivery_address: formData.delivery_address || null,
          discount_amount: formData.discount_amount,
          subtotal,
          total_amount: totalAmount
        };

        const { error: orderError } = await supabase
          .from('aroma_orders')
          .update(updateData)
          .eq('id', editingOrder.id);

        if (orderError) throw orderError;

        // حذف العناصر القديمة وإضافة الجديدة
        await supabase.from('aroma_order_items').delete().eq('order_id', editingOrder.id);
        
        const { error: itemsError } = await supabase
          .from('aroma_order_items')
          .insert(orderItems.map(item => ({
            order_id: editingOrder.id,
            ...item
          })));

        if (itemsError) throw itemsError;

        toast({
          title: "تم التحديث",
          description: "تم تحديث الطلب بنجاح"
        });
      } else {
        // إضافة طلب جديد (سيتم توليد order_reference تلقائياً بواسطة التريجر)
        const orderDataWithoutRef = {
          employee_id: formData.employee_id || null,
          customer_name: formData.customer_name,
          customer_phone: formData.customer_phone || null,
          order_date: formData.order_date,
          delivery_date: formData.delivery_date || null,
          status: formData.status,
          payment_method: formData.payment_method,
          payment_status: formData.payment_status,
          notes: formData.notes || null,
          delivery_address: formData.delivery_address || null,
          discount_amount: formData.discount_amount,
          subtotal,
          total_amount: totalAmount
        };

        // إضافة طلب جديد (order_reference سيتم توليده تلقائياً)
        const { data: orderData, error: orderError } = await supabase
          .from('aroma_orders')
          .insert(orderDataWithoutRef as any)
          .select()
          .single();

        if (orderError) throw orderError;

        const { error: itemsError } = await supabase
          .from('aroma_order_items')
          .insert(orderItems.map(item => ({
            order_id: orderData.id,
            ...item
          })));

        if (itemsError) throw itemsError;

        toast({
          title: "تم الإضافة",
          description: `تم إضافة الطلب برقم ${orderData.order_reference}`
        });
      }

      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving order:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في حفظ الطلب",
        variant: "destructive"
      });
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('aroma_orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "تم التحديث",
        description: "تم تحديث حالة الطلب بنجاح"
      });

      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في تحديث الحالة",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      employee_id: '',
      customer_name: '',
      customer_phone: '',
      order_date: new Date().toISOString().split('T')[0],
      delivery_date: '',
      status: 'pending',
      payment_method: 'cash',
      payment_status: 'pending',
      notes: '',
      delivery_address: '',
      discount_amount: 0
    });
    setOrderItems([]);
    setEditingOrder(null);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      confirmed: 'default',
      delivered: 'outline',
      cancelled: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {statusLabels[status as keyof typeof statusLabels] || status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Coffee className="w-6 h-6" />
            إدارة طلبات Aroma
          </h2>
          <p className="text-muted-foreground">
            {orders.length} طلب • {orders.filter(o => o.status === 'pending').length} في الانتظار
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} className="gap-2">
              <Plus className="w-4 h-4" />
              طلب جديد
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingOrder ? 'تعديل الطلب' : 'طلب جديد'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* معلومات العميل والطلب */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>العامل المسؤول</Label>
                  <Select 
                    value={formData.employee_id} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, employee_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر العامل" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map(emp => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.first_name} {emp.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>اسم العميل *</Label>
                  <Input
                    value={formData.customer_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label>رقم الهاتف</Label>
                  <Input
                    value={formData.customer_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, customer_phone: e.target.value }))}
                  />
                </div>

                <div>
                  <Label>تاريخ الطلب</Label>
                  <Input
                    type="date"
                    value={formData.order_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, order_date: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label>تاريخ التسليم</Label>
                  <Input
                    type="date"
                    value={formData.delivery_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, delivery_date: e.target.value }))}
                  />
                </div>

                <div>
                  <Label>طريقة الدفع</Label>
                  <Select 
                    value={formData.payment_method} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, payment_method: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">نقداً</SelectItem>
                      <SelectItem value="card">بطاقة</SelectItem>
                      <SelectItem value="transfer">تحويل</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>عنوان التسليم</Label>
                <Textarea
                  value={formData.delivery_address}
                  onChange={(e) => setFormData(prev => ({ ...prev, delivery_address: e.target.value }))}
                  rows={2}
                />
              </div>

              {/* قسم اختيار المنتجات السريع */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">اختيار المنتجات</h3>
                  <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  {products.map((product) => (
                    <div key={product.id} className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm border hover:shadow-md transition-shadow">
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm text-gray-800 dark:text-white truncate">
                          {product.name_ar}
                        </h4>
                        
                        <div className="text-xs text-gray-500">
                          مخزون: {product.stock}
                        </div>
                        
                        <div className="grid grid-cols-3 gap-1">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="text-xs py-1 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                            onClick={() => handleProductSelect(product, 'retail')}
                            disabled={product.stock === 0}
                          >
                            <div className="text-center">
                              <div>تجزئة</div>
                              <div className="font-bold">{product.retail_price}</div>
                            </div>
                          </Button>
                          
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="text-xs py-1 hover:bg-green-50 hover:border-green-300 transition-colors"
                            onClick={() => handleProductSelect(product, 'wholesale')}
                            disabled={product.stock === 0}
                          >
                            <div className="text-center">
                              <div>جملة</div>
                              <div className="font-bold">{product.wholesale_price}</div>
                            </div>
                          </Button>
                          
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="text-xs py-1 hover:bg-purple-50 hover:border-purple-300 transition-colors"
                            onClick={() => handleProductSelect(product, 'super_wholesale')}
                            disabled={product.stock === 0}
                          >
                            <div className="text-center">
                              <div>سوبر</div>
                              <div className="font-bold">{product.super_wholesale_price}</div>
                            </div>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* عناصر الطلب */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">عناصر الطلب المضافة</h3>
                  <Badge variant="secondary">
                    {orderItems.length} عنصر
                  </Badge>
                </div>

                {orderItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-6 gap-2 p-3 border rounded-lg">
                    <div>
                      <Label className="text-xs">المنتج</Label>
                      <Select
                        value={item.product_id}
                        onValueChange={(value) => updateOrderItem(index, 'product_id', value)}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="اختر منتج" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map(product => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name_ar}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs">نوع السعر</Label>
                      <Select
                        value={item.price_type}
                        onValueChange={(value) => updateOrderItem(index, 'price_type', value)}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="retail">تجزئة</SelectItem>
                          <SelectItem value="wholesale">جملة</SelectItem>
                          <SelectItem value="super_wholesale">سوبر جملة</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs">الكمية</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateOrderItem(index, 'quantity', Number(e.target.value))}
                        min="1"
                        className="h-8"
                      />
                    </div>

                    <div>
                      <Label className="text-xs">سعر الوحدة</Label>
                      <Input
                        value={item.unit_price}
                        readOnly
                        className="h-8 bg-muted"
                      />
                    </div>

                    <div>
                      <Label className="text-xs">الإجمالي</Label>
                      <Input
                        value={item.total_price}
                        readOnly
                        className="h-8 bg-muted"
                      />
                    </div>

                    <div className="flex items-end">
                      <Button
                        type="button"
                        onClick={() => removeOrderItem(index)}
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* الإجمالي والخصم */}
              <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>المجموع الفرعي:</span>
                  <span className="font-semibold">{calculateSubtotal().toLocaleString('ar-DZ')} د.ج</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Label>مبلغ الخصم:</Label>
                  <Input
                    type="number"
                    value={formData.discount_amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, discount_amount: Number(e.target.value) }))}
                    className="w-32"
                    min="0"
                  />
                </div>

                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>المجموع النهائي:</span>
                  <span className="text-primary">
                    {(calculateSubtotal() - formData.discount_amount).toLocaleString('ar-DZ')} د.ج
                  </span>
                </div>
              </div>

              <div>
                <Label>ملاحظات</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingOrder ? 'تحديث الطلب' : 'حفظ الطلب'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setDialogOpen(false)}
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* جدول الطلبات */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الطلب</TableHead>
                <TableHead>العميل</TableHead>
                <TableHead>العامل</TableHead>
                <TableHead>تاريخ الطلب</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono">
                    {order.order_reference}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.customer_name}</p>
                      {order.customer_phone && (
                        <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {employees.find(emp => emp.id === order.employee_id)
                      ? `${employees.find(emp => emp.id === order.employee_id)?.first_name} ${employees.find(emp => emp.id === order.employee_id)?.last_name}`
                      : 'غير محدد'
                    }
                  </TableCell>
                  <TableCell>
                    {new Date(order.order_date).toLocaleDateString('ar-SA')}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {order.total_amount.toLocaleString('ar-DZ')} د.ج
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(order.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Select
                        value={order.status}
                        onValueChange={(value) => handleStatusChange(order.id, value)}
                      >
                        <SelectTrigger className="w-32 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">في الانتظار</SelectItem>
                          <SelectItem value="confirmed">مؤكد</SelectItem>
                          <SelectItem value="delivered">تم التسليم</SelectItem>
                          <SelectItem value="cancelled">ملغي</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* النافذة المنبثقة لإدخال الكمية */}
      <QuantityModal
        isOpen={quantityModalOpen}
        onClose={() => setQuantityModalOpen(false)}
        product={selectedProduct}
        priceType={selectedPriceType}
        onConfirm={handleQuantityConfirm}
      />
    </div>
  );
};

export default AromaOrderManager;