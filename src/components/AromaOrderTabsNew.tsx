import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import AromaCustomerForm from './AromaCustomerForm';
import QuantityModal from './QuantityModal';
import OrderSummaryModal from './OrderSummaryModal';
import { 
  Plus, 
  Coffee, 
  FileText, 
  Loader2, 
  Edit, 
  Trash2, 
  Package,
  Calendar,
  User,
  Users,
  ShoppingCart,
  Filter,
  Search,
  Building2,
  Minus,
  DollarSign
} from 'lucide-react';

// Interfaces
interface AromaProduct {
  id: string;
  name_ar: string;
  name: string;
  image_url?: string;
  retail_price: number;
  wholesale_price: number;
  super_wholesale_price: number;
  stock: number;
  category: string;
}

interface AromaCustomer {
  id: string;
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  business_name?: string;
  business_type: string;
  default_price_type: string;
  address?: any;
  notes?: string;
  total_orders: number;
  total_spent: number;
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
  customer_id?: string;
  customer_name?: string;
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
  aroma_customers?: AromaCustomer;
}

interface OrderItem {
  id?: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  discount_amount: number;
}

const AromaOrderTabsNew: React.FC = () => {
  const [orders, setOrders] = useState<AromaOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<AromaOrder[]>([]);
  const [products, setProducts] = useState<AromaProduct[]>([]);
  const [customers, setCustomers] = useState<AromaCustomer[]>([]);
  const [employees, setEmployees] = useState<AromaEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [customerFormOpen, setCustomerFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<AromaCustomer | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [quantityModalOpen, setQuantityModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<AromaProduct | null>(null);
  const [orderSummaryOpen, setOrderSummaryOpen] = useState(false);
  
  const { toast } = useToast();
  const { profile, isAdmin } = useAuth();

  // Form state for new order
  const [selectedCustomer, setSelectedCustomer] = useState<AromaCustomer | null>(null);
  const [orderData, setOrderData] = useState({
    delivery_address: '',
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

      // Fetch customers
      const { data: customersData, error: customersError } = await supabase
        .from('aroma_customers')
        .select('*')
        .eq('is_active', true)
        .order('customer_name');
      
      if (customersError) throw customersError;
      setCustomers(customersData || []);

      // Fetch employees
      const { data: employeesData, error: employeesError } = await supabase
        .from('aroma_employees')
        .select('id, first_name, last_name, employee_code')
        .eq('status', 'active')
        .order('first_name');
      
      if (employeesError) throw employeesError;
      setEmployees(employeesData || []);

      // Fetch orders
      let ordersQuery = supabase
        .from('aroma_orders')
        .select(`
          *,
          aroma_employees(first_name, last_name),
          aroma_customers(id, customer_name, business_name, business_type, default_price_type, total_orders, total_spent)
        `)
        .order('created_at', { ascending: false });

      if (!isAdmin && profile?.id) {
        ordersQuery = ordersQuery.eq('employee_id', profile.id);
      }

      const { data: ordersData, error: ordersError } = await ordersQuery;
      
      if (ordersError) throw ordersError;
      setOrders(ordersData || []);
      setFilteredOrders(ordersData || []);

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

  // Filter orders based on search and date
  useEffect(() => {
    let filtered = orders;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.order_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.aroma_customers?.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.aroma_customers?.business_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by date
    if (dateFilter !== 'all') {
      const today = new Date();
      const filterDate = new Date(today);
      
      switch (dateFilter) {
        case 'today':
          break;
        case 'week':
          filterDate.setDate(today.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(today.getMonth() - 1);
          break;
      }
      
      if (dateFilter !== 'today') {
        filtered = filtered.filter(order => new Date(order.order_date) >= filterDate);
      } else {
        filtered = filtered.filter(order => 
          new Date(order.order_date).toDateString() === today.toDateString()
        );
      }
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, dateFilter]);

  const addProductToOrder = (product: AromaProduct, quantity: number = 1) => {
    const priceType = selectedCustomer?.default_price_type || 'retail';
    let unitPrice = product.retail_price;
    
    if (priceType === 'wholesale') unitPrice = product.wholesale_price;
    if (priceType === 'super_wholesale') unitPrice = product.super_wholesale_price;

    // Check if product already exists in order
    const existingIndex = orderItems.findIndex(item => item.product_id === product.id);
    
    if (existingIndex >= 0) {
      // Increase quantity
      const updatedItems = [...orderItems];
      updatedItems[existingIndex].quantity += quantity;
      updatedItems[existingIndex].total_price = updatedItems[existingIndex].unit_price * updatedItems[existingIndex].quantity;
      setOrderItems(updatedItems);
    } else {
      // Add new item
      const newItem: OrderItem = {
        product_id: product.id,
        quantity: quantity,
        unit_price: unitPrice,
        total_price: unitPrice * quantity,
        discount_amount: 0
      };
      setOrderItems([...orderItems, newItem]);
    }

    toast({
      title: "تمت الإضافة",
      description: `تم إضافة ${quantity} ${product.name_ar} للطلب`,
    });
  };

  const handleProductClick = (product: AromaProduct) => {
    setSelectedProduct(product);
    setQuantityModalOpen(true);
  };

  const handlePlusClick = (e: React.MouseEvent, product: AromaProduct) => {
    e.stopPropagation();
    addProductToOrder(product, 1);
  };

  const handleMinusClick = (e: React.MouseEvent, product: AromaProduct) => {
    e.stopPropagation();
    const existingIndex = orderItems.findIndex(item => item.product_id === product.id);
    if (existingIndex >= 0) {
      updateItemQuantity(existingIndex, orderItems[existingIndex].quantity - 1);
    }
  };

  const handleQuantityConfirm = (quantity: number) => {
    if (selectedProduct) {
      addProductToOrder(selectedProduct, quantity);
    }
  };

  const getProductQuantity = (productId: string) => {
    const item = orderItems.find(item => item.product_id === productId);
    return item ? item.quantity : 0;
  };

  const updateItemQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setOrderItems(orderItems.filter((_, i) => i !== index));
      return;
    }

    const updatedItems = [...orderItems];
    updatedItems[index].quantity = newQuantity;
    updatedItems[index].total_price = updatedItems[index].unit_price * newQuantity;
    setOrderItems(updatedItems);
  };

  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => sum + item.total_price, 0);
  };

  const handleSubmitOrder = async () => {
    if (!selectedCustomer) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار عميل",
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
      const totalAmount = subtotal - orderData.discount_amount;
      
      // Create order (order_reference will be auto-generated by trigger)
      const { data: orderResult, error: orderError } = await supabase
        .from('aroma_orders')
        .insert({
          customer_id: selectedCustomer.id,
          customer_name: selectedCustomer.customer_name,
          customer_phone: selectedCustomer.customer_phone,
          delivery_address: orderData.delivery_address,
          order_date: new Date().toISOString().split('T')[0],
          delivery_date: orderData.delivery_date || null,
          payment_method: orderData.payment_method,
          notes: orderData.notes,
          discount_amount: orderData.discount_amount,
          employee_id: orderData.employee_id || profile?.id,
          subtotal: subtotal,
          total_amount: totalAmount,
          status: 'pending',
          payment_status: 'pending',
          order_reference: '' // Will be auto-generated
        } as any)
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const { error: itemsError } = await supabase
        .from('aroma_order_items')
        .insert(orderItems.map(item => ({
          order_id: orderResult.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          price_type: selectedCustomer.default_price_type,
          total_price: item.total_price,
          discount_amount: item.discount_amount
        })));

      if (itemsError) throw itemsError;

      toast({
        title: "تم الحفظ بنجاح",
        description: `تم إنشاء الطلب رقم ${orderResult.order_reference}`,
      });

      // Reset form
      setSelectedCustomer(null);
      setOrderItems([]);
      setOrderData({
        delivery_address: '',
        delivery_date: '',
        payment_method: 'cash',
        notes: '',
        discount_amount: 0,
        employee_id: profile?.id || ''
      });
      setOrderSummaryOpen(false);

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
    <div className="max-w-7xl mx-auto space-y-6 rtl">
      {/* إجمالي السعر العائم */}
      {orderItems.length > 0 && (
        <div className="fixed top-4 left-4 z-40 bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-full shadow-2xl">
          <div className="flex items-center gap-2 font-bold">
            <DollarSign className="w-5 h-5" />
            <span>{calculateSubtotal().toFixed(2)} د.ج</span>
          </div>
        </div>
      )}

      {/* زر الطلبية العائم */}
      {orderItems.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setOrderSummaryOpen(true)}
            className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300"
          >
            <div className="flex flex-col items-center">
              <ShoppingCart className="w-6 h-6" />
              <Badge variant="secondary" className="absolute -top-2 -right-2 bg-white text-primary font-bold">
                {orderItems.reduce((sum, item) => sum + item.quantity, 0)}
              </Badge>
            </div>
          </Button>
        </div>
      )}

      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-2">
          <Coffee className="w-8 h-8 text-primary" />
          إدارة طلبات أروما
        </h1>
        <p className="text-muted-foreground">
          نظام متطور لإدارة الطلبات والعملاء
        </p>
      </div>

      <Tabs defaultValue="new-order" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="new-order" className="gap-2">
            <Plus className="w-4 h-4" />
            طلب جديد
          </TabsTrigger>
          <TabsTrigger value="customers" className="gap-2">
            <Users className="w-4 h-4" />
            إضافة تاجر
          </TabsTrigger>
          <TabsTrigger value="orders" className="gap-2">
            <FileText className="w-4 h-4" />
            قائمة الطلبات ({filteredOrders.length})
          </TabsTrigger>
        </TabsList>

        {/* New Order Tab */}
        <TabsContent value="new-order" className="space-y-6">
          {/* Customer Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                اختيار العميل
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedCustomer ? (
                <Select onValueChange={(value) => {
                  const customer = customers.find(c => c.id === value);
                  setSelectedCustomer(customer || null);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر العميل" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(customer => (
                      <SelectItem key={customer.id} value={customer.id}>
                        <div className="flex flex-col text-right">
                          <span className="font-medium">{customer.customer_name}</span>
                          {customer.business_name && (
                            <span className="text-sm text-muted-foreground">
                              {customer.business_name}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {customer.business_type === 'retail' && 'تجزئة'}
                            {customer.business_type === 'wholesale' && 'جملة'}
                            {customer.business_type === 'super_wholesale' && 'جملة كبيرة'}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{selectedCustomer.customer_name}</h3>
                    {selectedCustomer.business_name && (
                      <p className="text-sm text-muted-foreground">{selectedCustomer.business_name}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      نوع السعر: {selectedCustomer.default_price_type === 'retail' && 'تجزئة'}
                      {selectedCustomer.default_price_type === 'wholesale' && 'جملة'}
                      {selectedCustomer.default_price_type === 'super_wholesale' && 'جملة كبيرة'}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCustomer(null)}
                  >
                    تغيير
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Product Selection */}
          {selectedCustomer && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  اختيار المنتجات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
                    {products.map(product => {
                      const quantity = getProductQuantity(product.id);
                      return (
                        <div key={product.id} className="relative group">
                          <Button
                            variant="outline"
                            className="h-auto p-4 flex flex-col gap-3 hover:bg-muted/50 w-full relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 hover:border-primary/30"
                            onClick={() => handleProductClick(product)}
                          >
                            {product.image_url && (
                              <div className="w-16 h-16 rounded-lg overflow-hidden shadow-md">
                                <img
                                  src={product.image_url}
                                  alt={product.name_ar}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                />
                              </div>
                            )}
                            
                            {/* عرض الكمية بلون أحمر فوق العنوان */}
                            {quantity > 0 && (
                              <div className="text-red-500 font-bold text-lg">
                                {quantity}
                              </div>
                            )}
                            
                            <div className="text-center space-y-1">
                              <div className="font-medium text-sm leading-tight">{product.name_ar}</div>
                              <div className="text-xs text-muted-foreground font-semibold">
                                {selectedCustomer.default_price_type === 'retail' && `${product.retail_price} د.ج`}
                                {selectedCustomer.default_price_type === 'wholesale' && `${product.wholesale_price} د.ج`}
                                {selectedCustomer.default_price_type === 'super_wholesale' && `${product.super_wholesale_price} د.ج`}
                              </div>
                            </div>
                          </Button>
                          
                          {/* أزرار + و - */}
                          <div className="absolute -top-2 -right-2 flex gap-1 z-10">
                            {quantity > 0 && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-7 h-7 rounded-full bg-white hover:bg-gray-100 text-red-500 border-red-200 shadow-lg transition-all duration-300 hover:scale-110"
                                onClick={(e) => handleMinusClick(e, product)}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              className="w-7 h-7 rounded-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg transition-all duration-300 hover:scale-110"
                              onClick={(e) => handlePlusClick(e, product)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Order Details */}
          {selectedCustomer && (
            <Card>
              <CardHeader>
                <CardTitle>تفاصيل الطلب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>تاريخ التسليم</Label>
                    <Input
                      type="date"
                      value={orderData.delivery_date}
                      onChange={(e) => setOrderData(prev => ({ 
                        ...prev, 
                        delivery_date: e.target.value 
                      }))}
                    />
                  </div>
                  
                  <div>
                    <Label>طريقة الدفع</Label>
                    <Select 
                      value={orderData.payment_method} 
                      onValueChange={(value) => setOrderData(prev => ({ 
                        ...prev, 
                        payment_method: value 
                      }))}
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
                    value={orderData.delivery_address}
                    onChange={(e) => setOrderData(prev => ({ 
                      ...prev, 
                      delivery_address: e.target.value 
                    }))}
                    rows={2}
                  />
                </div>

                <div>
                  <Label>ملاحظات</Label>
                  <Textarea
                    value={orderData.notes}
                    onChange={(e) => setOrderData(prev => ({ 
                      ...prev, 
                      notes: e.target.value 
                    }))}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Add Customer Tab */}
        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  إدارة العملاء
                </span>
                <Button onClick={() => {
                  setEditingCustomer(null);
                  setCustomerFormOpen(true);
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  عميل جديد
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customers.map(customer => (
                  <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{customer.customer_name}</h3>
                      {customer.business_name && (
                        <p className="text-sm text-muted-foreground">{customer.business_name}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {customer.total_orders} طلب • {customer.total_spent} د.ج
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingCustomer(customer);
                        setCustomerFormOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders List Tab */}
        <TabsContent value="orders" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <Input
                    placeholder="البحث في الطلبات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الطلبات</SelectItem>
                    <SelectItem value="today">اليوم</SelectItem>
                    <SelectItem value="week">هذا الأسبوع</SelectItem>
                    <SelectItem value="month">هذا الشهر</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Orders Table */}
          <Card>
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
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          {order.order_reference}
                        </TableCell>
                        <TableCell>
                        <div>
                          <div className="font-medium">
                            {order.aroma_customers?.customer_name || order.customer_name}
                          </div>
                          {order.aroma_customers?.business_name && (
                            <div className="text-sm text-muted-foreground">
                              {order.aroma_customers?.business_name}
                            </div>
                          )}
                        </div>
                        </TableCell>
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
                            {order.aroma_employees && 
                              `${order.aroma_employees.first_name} ${order.aroma_employees.last_name}`
                            }
                          </TableCell>
                        )}
                        <TableCell className="text-center">
                          {getStatusBadge(order.status)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quantity Modal */}
      <QuantityModal
        isOpen={quantityModalOpen}
        onClose={() => setQuantityModalOpen(false)}
        product={selectedProduct}
        priceType={(selectedCustomer?.default_price_type as 'retail' | 'wholesale' | 'super_wholesale') || 'retail'}
        onConfirm={handleQuantityConfirm}
      />

      {/* Order Summary Modal */}
      <OrderSummaryModal
        isOpen={orderSummaryOpen}
        onClose={() => setOrderSummaryOpen(false)}
        orderItems={orderItems}
        products={products}
        onConfirmOrder={handleSubmitOrder}
        loading={loading}
        calculateSubtotal={calculateSubtotal}
      />

      {/* Customer Form Modal */}
      <AromaCustomerForm
        isOpen={customerFormOpen}
        onClose={() => setCustomerFormOpen(false)}
        onSuccess={() => {
          setCustomerFormOpen(false);
          fetchData();
        }}
        editingCustomer={editingCustomer}
      />
    </div>
  );
};

export default AromaOrderTabsNew;