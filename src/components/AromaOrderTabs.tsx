import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Plus, 
  Coffee, 
  FileText, 
  Loader2, 
  Edit, 
  Trash2, 
  Eye,
  Package,
  Calendar,
  User
} from 'lucide-react';

interface AromaProduct {
  id: string;
  name: string;
  name_ar: string;
  retail_price: number;
  wholesale_price: number;
  super_wholesale_price: number;
  stock: number;
}

interface AromaEmployee {
  id: string;
  first_name: string;
  last_name: string;
  employee_code: string;
}

interface AromaOrder {
  id: string;
  order_reference: string;
  customer_name: string;
  customer_phone?: string;
  delivery_address?: string;
  order_date: string;
  delivery_date?: string;
  status: string;
  payment_method: string;
  payment_status: string;
  subtotal: number;
  discount_amount: number;
  total_amount: number;
  notes?: string;
  employee_id?: string;
  aroma_employees?: {
    first_name: string;
    last_name: string;
  };
  aroma_order_items?: OrderItem[];
}

interface OrderItem {
  id?: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  price_type: string;
  total_price: number;
  discount_amount: number;
  aroma_products?: {
    name: string;
    name_ar: string;
  };
}

interface OrderFormData {
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  order_date: string;
  delivery_date: string;
  payment_method: string;
  notes: string;
  discount_amount: number;
  employee_id: string;
}

const AromaOrderTabs: React.FC = () => {
  const [orders, setOrders] = useState<AromaOrder[]>([]);
  const [products, setProducts] = useState<AromaProduct[]>([]);
  const [employees, setEmployees] = useState<AromaEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<AromaOrder | null>(null);
  const [orderItems, setOrderItems] = useState<Partial<OrderItem>[]>([]);
  
  const { toast } = useToast();
  const { profile, isAdmin } = useAuth();

  // Form state
  const [formData, setFormData] = useState<OrderFormData>({
    customer_name: '',
    customer_phone: '',
    delivery_address: '',
    order_date: new Date().toISOString().split('T')[0],
    delivery_date: '',
    payment_method: 'cash',
    notes: '',
    discount_amount: 0,
    employee_id: profile?.id || ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('aroma_products')
        .select('*')
        .eq('is_active', true)
        .order('name_ar');
      
      if (productsError) throw productsError;
      setProducts(productsData || []);

      // Fetch employees
      const { data: employeesData, error: employeesError } = await supabase
        .from('aroma_employees')
        .select('id, first_name, last_name, employee_code')
        .eq('status', 'active')
        .order('first_name');
      
      if (employeesError) throw employeesError;
      setEmployees(employeesData || []);

      // Fetch orders - filter by employee if not admin
      let ordersQuery = supabase
        .from('aroma_orders')
        .select(`
          *,
          aroma_employees(first_name, last_name),
          aroma_order_items(
            *,
            aroma_products(name, name_ar)
          )
        `)
        .order('created_at', { ascending: false });

      if (!isAdmin && profile?.id) {
        ordersQuery = ordersQuery.eq('employee_id', profile.id);
      }

      const { data: ordersData, error: ordersError } = await ordersQuery;
      
      if (ordersError) throw ordersError;
      setOrders(ordersData || []);

    } catch (error: any) {
      toast({
        title: "خطأ في تحميل البيانات",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAdmin, profile?.id]);

  const addOrderItem = () => {
    setOrderItems([...orderItems, {
      product_id: '',
      quantity: 1,
      price_type: 'retail',
      unit_price: 0,
      total_price: 0,
      discount_amount: 0
    }]);
  };

  const updateOrderItem = (index: number, field: string, value: any) => {
    const newItems = [...orderItems];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Calculate prices when product or quantity changes
    if (field === 'product_id' || field === 'quantity' || field === 'price_type') {
      const item = newItems[index];
      const product = products.find(p => p.id === item.product_id);
      
      if (product && item.quantity) {
        let unitPrice = product.retail_price;
        if (item.price_type === 'wholesale') unitPrice = product.wholesale_price;
        if (item.price_type === 'super_wholesale') unitPrice = product.super_wholesale_price;
        
        item.unit_price = unitPrice;
        item.total_price = (unitPrice * item.quantity) - (item.discount_amount || 0);
      }
    }
    
    setOrderItems(newItems);
  };

  const removeOrderItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.total_price || 0), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customer_name.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم العميل",
        variant: "destructive",
      });
      return;
    }

    if (orderItems.length === 0) {
      toast({
        title: "خطأ",
        description: "يرجى إضافة منتج واحد على الأقل",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      const subtotal = calculateSubtotal();
      const totalAmount = subtotal - formData.discount_amount;
      
      const orderData = {
        ...formData,
        employee_id: formData.employee_id || profile?.id,
        subtotal,
        total_amount: totalAmount
      };

      if (editingOrder) {
        // Update existing order
        const { error: orderError } = await supabase
          .from('aroma_orders')
          .update(orderData)
          .eq('id', editingOrder.id);

        if (orderError) throw orderError;

        // Delete existing items
        await supabase
          .from('aroma_order_items')
          .delete()
          .eq('order_id', editingOrder.id);

        // Insert new items
        const items = orderItems
          .filter(item => item.product_id && item.quantity && item.unit_price && item.total_price)
          .map(item => ({
            order_id: editingOrder.id,
            product_id: item.product_id!,
            quantity: item.quantity!,
            unit_price: item.unit_price!,
            price_type: item.price_type || 'retail',
            total_price: item.total_price!,
            discount_amount: item.discount_amount || 0
          }));

        const { error: itemsError } = await supabase
          .from('aroma_order_items')
          .insert(items);

        if (itemsError) throw itemsError;

        toast({
          title: "تم التعديل بنجاح",
          description: "تم تعديل الطلب بنجاح",
        });
      } else {
        // Create new order - order_reference will be auto-generated by trigger
        const { data: orderResult, error: orderError } = await supabase
          .from('aroma_orders')
          .insert({
            customer_name: orderData.customer_name,
            customer_phone: orderData.customer_phone,
            delivery_address: orderData.delivery_address,
            order_date: orderData.order_date,
            delivery_date: orderData.delivery_date,
            payment_method: orderData.payment_method,
            notes: orderData.notes,
            discount_amount: orderData.discount_amount,
            employee_id: orderData.employee_id,
            subtotal: orderData.subtotal,
            total_amount: orderData.total_amount,
            status: 'pending',
            payment_status: 'pending',
            order_reference: '' // Will be auto-generated by trigger
          } as any)
          .select()
          .single();

        if (orderError) throw orderError;

        // Insert order items
        const items = orderItems
          .filter(item => item.product_id && item.quantity && item.unit_price && item.total_price)
          .map(item => ({
            order_id: orderResult.id,
            product_id: item.product_id!,
            quantity: item.quantity!,
            unit_price: item.unit_price!,
            price_type: item.price_type || 'retail',
            total_price: item.total_price!,
            discount_amount: item.discount_amount || 0
          }));

        const { error: itemsError } = await supabase
          .from('aroma_order_items')
          .insert(items);

        if (itemsError) throw itemsError;

        toast({
          title: "تم الحفظ بنجاح",
          description: "تم إنشاء الطلب بنجاح",
        });
      }

      resetForm();
      fetchData();
      
    } catch (error: any) {
      toast({
        title: "خطأ في حفظ الطلب",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
        description: "تم تحديث حالة الطلب بنجاح",
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      customer_name: '',
      customer_phone: '',
      delivery_address: '',
      order_date: new Date().toISOString().split('T')[0],
      delivery_date: '',
      payment_method: 'cash',
      notes: '',
      discount_amount: 0,
      employee_id: profile?.id || ''
    });
    setOrderItems([]);
    setEditingOrder(null);
    setDialogOpen(false);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'قيد الانتظار', variant: 'secondary' as const },
      confirmed: { label: 'مؤكد', variant: 'default' as const },
      preparing: { label: 'قيد التحضير', variant: 'outline' as const },
      ready: { label: 'جاهز', variant: 'outline' as const },
      delivered: { label: 'تم التسليم', variant: 'default' as const },
      cancelled: { label: 'ملغي', variant: 'destructive' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-2">
          <Coffee className="w-8 h-8 text-primary" />
          إدارة طلبات أروما
        </h1>
        <p className="text-muted-foreground">
          تسجيل ومتابعة الطلبات مع الأسعار والمنتجات من قاعدة البيانات
        </p>
      </div>

      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="orders" className="gap-2">
            <FileText className="w-4 h-4" />
            قائمة الطلبات ({orders.length})
          </TabsTrigger>
          <TabsTrigger value="new-order" className="gap-2">
            <Plus className="w-4 h-4" />
            طلب جديد
          </TabsTrigger>
        </TabsList>

        {/* Orders List Tab */}
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  الطلبات المسجلة
                </span>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingOrder(null)}>
                      <Plus className="w-4 h-4 mr-2" />
                      طلب جديد
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">رقم الطلب</TableHead>
                      <TableHead className="text-right">العميل</TableHead>
                      <TableHead className="text-right">التاريخ</TableHead>
                      <TableHead className="text-right">المبلغ</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      {isAdmin && <TableHead className="text-right">الموظف</TableHead>}
                      <TableHead className="text-center">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          {order.order_reference}
                        </TableCell>
                        <TableCell>{order.customer_name}</TableCell>
                        <TableCell>
                          {new Date(order.order_date).toLocaleDateString('ar-DZ')}
                        </TableCell>
                        <TableCell>
                          {order.total_amount.toLocaleString()} د.ج
                        </TableCell>
                        <TableCell>
                          <Select
                            value={order.status}
                            onValueChange={(value) => handleStatusChange(order.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">قيد الانتظار</SelectItem>
                              <SelectItem value="confirmed">مؤكد</SelectItem>
                              <SelectItem value="preparing">قيد التحضير</SelectItem>
                              <SelectItem value="ready">جاهز</SelectItem>
                              <SelectItem value="delivered">تم التسليم</SelectItem>
                              <SelectItem value="cancelled">ملغي</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        {isAdmin && (
                          <TableCell>
                            {order.aroma_employees ? 
                              `${order.aroma_employees.first_name} ${order.aroma_employees.last_name}` : 
                              'غير محدد'
                            }
                          </TableCell>
                        )}
                        <TableCell className="text-center">
                          <div className="flex gap-2 justify-center">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingOrder(order);
                                setDialogOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* New Order Tab */}
        <TabsContent value="new-order" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                إنشاء طلب جديد
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Customer Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer_name">اسم العميل *</Label>
                    <Input
                      id="customer_name"
                      value={formData.customer_name}
                      onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                      placeholder="اسم العميل"
                      required
                      className="text-right"
                      dir="rtl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customer_phone">رقم الهاتف</Label>
                    <Input
                      id="customer_phone"
                      value={formData.customer_phone}
                      onChange={(e) => setFormData({...formData, customer_phone: e.target.value})}
                      placeholder="رقم الهاتف"
                    />
                  </div>
                </div>

                {/* Order Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="order_date">تاريخ الطلب</Label>
                    <Input
                      id="order_date"
                      type="date"
                      value={formData.order_date}
                      onChange={(e) => setFormData({...formData, order_date: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="delivery_date">تاريخ التسليم</Label>
                    <Input
                      id="delivery_date"
                      type="date"
                      value={formData.delivery_date}
                      onChange={(e) => setFormData({...formData, delivery_date: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="delivery_address">عنوان التسليم</Label>
                  <Input
                    id="delivery_address"
                    value={formData.delivery_address}
                    onChange={(e) => setFormData({...formData, delivery_address: e.target.value})}
                    placeholder="عنوان التسليم"
                    className="text-right"
                    dir="rtl"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="payment_method">طريقة الدفع</Label>
                    <Select value={formData.payment_method} onValueChange={(value) => setFormData({...formData, payment_method: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">نقدي</SelectItem>
                        <SelectItem value="credit">آجل</SelectItem>
                        <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {isAdmin && (
                    <div className="space-y-2">
                      <Label htmlFor="employee_id">الموظف المسؤول</Label>
                      <Select value={formData.employee_id} onValueChange={(value) => setFormData({...formData, employee_id: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الموظف" />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map((employee) => (
                            <SelectItem key={employee.id} value={employee.id}>
                              {employee.first_name} {employee.last_name} ({employee.employee_code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Order Items */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-semibold">منتجات الطلب</Label>
                    <Button type="button" onClick={addOrderItem} variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      إضافة منتج
                    </Button>
                  </div>

                  {orderItems.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border rounded-lg">
                      <div className="md:col-span-2">
                        <Label>المنتج</Label>
                        <Select 
                          value={item.product_id} 
                          onValueChange={(value) => updateOrderItem(index, 'product_id', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="اختر المنتج" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name_ar} - {product.retail_price} د.ج
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>الكمية</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity || 1}
                          onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value))}
                        />
                      </div>

                      <div>
                        <Label>نوع السعر</Label>
                        <Select 
                          value={item.price_type} 
                          onValueChange={(value) => updateOrderItem(index, 'price_type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="retail">تجزئة</SelectItem>
                            <SelectItem value="wholesale">جملة</SelectItem>
                            <SelectItem value="super_wholesale">جملة خاصة</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>السعر</Label>
                        <Input
                          type="number"
                          value={item.unit_price || 0}
                          readOnly
                          className="bg-muted"
                        />
                      </div>

                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeOrderItem(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                {orderItems.length > 0 && (
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">المجموع الفرعي:</span>
                      <span className="text-lg font-bold">{calculateSubtotal().toLocaleString()} د.ج</span>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="notes">ملاحظات</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="ملاحظات إضافية"
                    className="text-right"
                    dir="rtl"
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={loading || orderItems.length === 0}>
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Package className="w-4 h-4 mr-2" />
                    )}
                    {editingOrder ? 'تحديث الطلب' : 'حفظ الطلب'}
                  </Button>
                  
                  <Button type="button" variant="outline" onClick={resetForm}>
                    إلغاء
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AromaOrderTabs;