import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Coffee, 
  DollarSign,
  Target,
  Calendar,
  Plus,
  Settings,
  PieChart,
  Activity,
  Package,
  ShoppingCart,
  UserCheck
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AromaProductManager from './AromaProductManager';
import AromaOrderTabsNew from './AromaOrderTabsNew';
import EmployeeRoleManager from './EmployeeRoleManager';
import EmployeeManager from './EmployeeManager';
import SalesTracker from './SalesTracker';

const AdminDashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'year'>('today');
  const { toast } = useToast();
  
  // State for real data
  const [orders, setOrders] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    todayOrders: 0,
    activeWorkers: 0,
    totalWorkers: 0,
    averageEfficiency: 0,
    totalProducts: 0,
    totalCustomers: 0
  });

  // Fetch real data from database
  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch profiles (workers)
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'worker');

      if (profilesError) throw profilesError;

      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*');

      if (productsError) throw productsError;

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true);

      if (categoriesError) throw categoriesError;

      // Fetch customers
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*');

      if (customersError) throw customersError;

      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const todayOrders = ordersData?.filter(order => 
        order.created_at?.startsWith(today)
      ) || [];

      const totalRevenue = ordersData?.reduce((sum, order) => 
        sum + (Number(order.total_amount) || 0), 0
      ) || 0;

      setOrders(ordersData || []);
      setProfiles(profilesData || []);
      setProducts(productsData || []);
      setCategories(categoriesData || []);

      setStats({
        totalRevenue,
        todayOrders: todayOrders.length,
        activeWorkers: profilesData?.length || 0, // كل العمال نشطون
        totalWorkers: profilesData?.length || 0,
        averageEfficiency: 91.2, // يمكن حسابها من البيانات الفعلية
        totalProducts: productsData?.length || 0,
        totalCustomers: customersData?.length || 0
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في جلب البيانات",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Process data for charts
  const getSalesData = () => {
    const salesByDay: any = {};
    const days = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
    
    days.forEach(day => {
      salesByDay[day] = { name: day, orders: 0, revenue: 0 };
    });

    orders.forEach(order => {
      const date = new Date(order.created_at);
      const dayIndex = date.getDay();
      const dayName = days[dayIndex === 0 ? 6 : dayIndex - 1]; // Adjust for Sunday
      
      if (salesByDay[dayName]) {
        salesByDay[dayName].orders += 1;
        salesByDay[dayName].revenue += parseFloat(order.total_amount) || 0;
      }
    });

    return Object.values(salesByDay);
  };

  const getProductData = () => {
    const productSales: any = {};
    
    // Count products in orders
    orders.forEach(order => {
      const productTitle = order.product_title || 'غير محدد';
      if (!productSales[productTitle]) {
        productSales[productTitle] = 0;
      }
      productSales[productTitle] += order.quantity || 1;
    });

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4'];
    
    return Object.entries(productSales)
      .slice(0, 6)
      .map(([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.length]
      }));
  };

  const getRevenueData = () => {
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'];
    const currentMonth = new Date().getMonth();
    
    return months.slice(0, currentMonth + 1).map((month, index) => {
      const monthOrders = orders.filter(order => {
        const orderMonth = new Date(order.created_at).getMonth();
        return orderMonth === index;
      });
      
      const revenue = monthOrders.reduce((sum, order) => 
        sum + (parseFloat(order.total_amount) || 0), 0
      );
      
      return {
        month,
        revenue,
        target: (index + 1) * 150000 // هدف تصاعدي
      };
    });
  };

  const salesData = getSalesData();
  const productData = getProductData();
  const revenueData = getRevenueData();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/5 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              لوحة تحكم المدير
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              إدارة شاملة للمبيعات والعمال والمنتجات - بيانات حقيقية من قاعدة البيانات
            </p>
          </div>
          
          <div className="flex gap-2">
            {(['today', 'week', 'month', 'year'] as const).map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
                className="text-xs"
              >
                {period === 'today' ? 'اليوم' : 
                 period === 'week' ? 'الأسبوع' : 
                 period === 'month' ? 'الشهر' : 'السنة'}
              </Button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-lg">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">إجمالي المبيعات</p>
                  <p className="text-lg sm:text-2xl font-bold text-primary">
                    {stats.totalRevenue.toLocaleString('ar-DZ')} د.ج
                  </p>
                  <p className="text-xs text-emerald-600 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {orders.length} طلب
                  </p>
                </div>
                <div className="p-2 bg-primary/10 rounded-lg">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-lg">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">الطلبات اليوم</p>
                  <p className="text-lg sm:text-2xl font-bold text-emerald-600">{stats.todayOrders}</p>
                  <p className="text-xs text-muted-foreground">
                    من إجمالي {orders.length}
                  </p>
                </div>
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <ShoppingCart className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-lg">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">العملاء</p>
                  <p className="text-lg sm:text-2xl font-bold text-orange-600">{stats.totalCustomers}</p>
                  <p className="text-xs text-muted-foreground">عميل مسجل</p>
                </div>
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <UserCheck className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-lg">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">المنتجات النشطة</p>
                  <p className="text-lg sm:text-2xl font-bold text-purple-600">{stats.totalProducts}</p>
                  <p className="text-xs text-muted-foreground">
                    من {categories.length} فئة
                  </p>
                </div>
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Package className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="analytics" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6 bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="analytics" className="text-xs sm:text-sm">الإحصائيات</TabsTrigger>
            <TabsTrigger value="sales" className="text-xs sm:text-sm">تتبع المبيعات</TabsTrigger>
            <TabsTrigger value="roles" className="text-xs sm:text-sm">الأدوار</TabsTrigger>
            <TabsTrigger value="aroma" className="text-xs sm:text-sm">منتجات Aroma</TabsTrigger>
            <TabsTrigger value="aroma-orders" className="text-xs sm:text-sm">طلبات Aroma</TabsTrigger>
            <TabsTrigger value="workers" className="text-xs sm:text-sm">العمال</TabsTrigger>
          </TabsList>

          <TabsContent value="sales" className="space-y-4">
            <SalesTracker />
          </TabsContent>

          <TabsContent value="roles" className="space-y-4">
            <EmployeeRoleManager />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Sales Chart */}
              <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    المبيعات الأسبوعية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="name" 
                        fontSize={12}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis fontSize={12} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="hsl(var(--primary))" 
                        fill="hsl(var(--primary))"
                        fillOpacity={0.1}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Product Distribution */}
              <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                    <PieChart className="w-4 h-4" />
                    توزيع المنتجات المباعة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {productData.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={200}>
                        <RechartsPieChart>
                          <Pie
                            data={productData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {productData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {productData.map((item) => (
                          <div key={item.name} className="flex items-center gap-1">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-xs text-muted-foreground">{item.name}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      لا توجد بيانات مبيعات
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Revenue vs Target */}
            {revenueData.length > 0 && (
              <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    الإيرادات مقابل الأهداف
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="month" 
                        fontSize={12}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis fontSize={12} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="target" fill="hsl(var(--muted))" name="الهدف" />
                      <Bar dataKey="revenue" fill="hsl(var(--primary))" name="الإيراد الفعلي" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-lg font-semibold">الطلبات الأخيرة</h2>
              <Badge variant="secondary">
                إجمالي: {orders.length} طلب
              </Badge>
            </div>

            <div className="grid gap-2">
              {orders.slice(0, 10).map((order) => (
                <Card key={order.id} className="bg-card/95 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold">{order.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.product_title} - {order.quantity} قطعة
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString('ar-DZ')}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={
                          order.status === 'completed' ? 'default' :
                          order.status === 'confirmed' ? 'secondary' :
                          order.status === 'cancelled' ? 'destructive' :
                          'outline'
                        }>
                          {order.status === 'pending' ? 'قيد الانتظار' :
                           order.status === 'confirmed' ? 'مؤكد' :
                           order.status === 'completed' ? 'مكتمل' :
                           order.status === 'cancelled' ? 'ملغي' :
                           order.status}
                        </Badge>
                        <p className="font-bold text-primary">
                          {parseFloat(order.total_amount || '0').toLocaleString('ar-DZ')} د.ج
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="aroma" className="space-y-4">
            <AromaProductManager />
          </TabsContent>
          
          <TabsContent value="aroma-orders" className="space-y-4">
        <AromaOrderTabsNew />
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-lg font-semibold">المنتجات النشطة</h2>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                إضافة منتج جديد
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.slice(0, 9).map((product) => (
                <Card key={product.id} className="bg-card/95 backdrop-blur-sm border-border/50 shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-sm">{product.title}</h3>
                      <Badge variant={product.stock > 0 ? 'default' : 'destructive'}>
                        {product.stock > 0 ? 'متوفر' : 'نفذ'}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">السعر:</span>
                        <span className="font-bold">{product.price} د.ج</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">المخزون:</span>
                        <span>{product.stock || 0} قطعة</span>
                      </div>
                      {product.discount_percentage > 0 && (
                        <Badge variant="secondary" className="w-full justify-center">
                          خصم {product.discount_percentage}%
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="workers" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-lg font-semibold">إدارة العمال</h2>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                إضافة عامل جديد
              </Button>
            </div>

            <div className="grid gap-4">
              {profiles.map((worker) => (
                <Card key={worker.id} className="bg-card/95 backdrop-blur-sm border-border/50 shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{worker.full_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {worker.is_active ? 'نشط' : 'غير نشط'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Badge variant={worker.is_active ? 'default' : 'secondary'}>
                          {worker.is_active ? 'نشط' : 'غير نشط'}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {profiles.length === 0 && (
                <Card className="bg-card/95 backdrop-blur-sm">
                  <CardContent className="p-8 text-center text-muted-foreground">
                    لا يوجد عمال مسجلين
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;