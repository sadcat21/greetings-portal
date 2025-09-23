import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  TrendingUp, 
  Target,
  DollarSign,
  Calendar,
  BarChart3,
  Award,
  Users,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';

interface DailySale {
  id: string;
  user_id: string;
  date: string;
  orders_count: number;
  total_amount: number;
  target_amount: number;
  efficiency_percentage: number;
  notes: string;
  created_at: string;
}

interface Target {
  id: string;
  user_id: string;
  role_id: string;
  target_type: string;
  target_value: number;
  target_unit: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

const SalesTracker: React.FC = () => {
  const { user, profile, isAdmin } = useAuth();
  const { toast } = useToast();
  
  const [dailySales, setDailySales] = useState<DailySale[]>([]);
  const [targets, setTargets] = useState<Target[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [targetDialogOpen, setTargetDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    orders_count: 0,
    total_amount: 0,
    notes: ''
  });

  const [targetData, setTargetData] = useState({
    target_type: 'daily',
    target_value: 0,
    target_unit: 'orders',
    start_date: new Date().toISOString().split('T')[0],
    end_date: ''
  });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // جلب المبيعات اليومية
      const salesQuery = isAdmin 
        ? supabase.from('daily_sales').select('*')
        : supabase.from('daily_sales').select('*').eq('user_id', user.id);

      const { data: salesData, error: salesError } = await salesQuery
        .order('date', { ascending: false })
        .limit(30);

      if (salesError) throw salesError;

      // جلب الأهداف
      const targetsQuery = isAdmin
        ? supabase.from('targets').select('*')
        : supabase.from('targets').select('*').eq('user_id', user.id);

      const { data: targetsData, error: targetsError } = await targetsQuery
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (targetsError) throw targetsError;

      setDailySales(salesData || []);
      setTargets(targetsData || []);
    } catch (error) {
      console.error('Error fetching sales data:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في جلب بيانات المبيعات",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      // حساب نسبة الكفاءة بناءً على الهدف
      const currentTarget = targets.find(t => 
        t.target_type === 'daily' && 
        new Date(t.start_date) <= new Date(formData.date) &&
        (!t.end_date || new Date(t.end_date) >= new Date(formData.date))
      );

      let efficiency = 0;
      if (currentTarget) {
        if (currentTarget.target_unit === 'orders') {
          efficiency = (formData.orders_count / currentTarget.target_value) * 100;
        } else if (currentTarget.target_unit === 'amount') {
          efficiency = (formData.total_amount / currentTarget.target_value) * 100;
        }
      }

      const { error } = await supabase
        .from('daily_sales')
        .upsert({
          user_id: user.id,
          date: formData.date,
          orders_count: formData.orders_count,
          total_amount: formData.total_amount,
          target_amount: currentTarget?.target_value || 0,
          efficiency_percentage: Math.round(efficiency),
          notes: formData.notes
        });

      if (error) throw error;

      toast({
        title: "تم الحفظ",
        description: "تم حفظ بيانات المبيعات بنجاح"
      });

      setDialogOpen(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        orders_count: 0,
        total_amount: 0,
        notes: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error saving sale:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في حفظ بيانات المبيعات",
        variant: "destructive"
      });
    }
  };

  const handleSubmitTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('targets')
        .insert({
          user_id: user.id,
          role_id: null, // سيتم تحديد الدور لاحقاً
          target_type: targetData.target_type,
          target_value: targetData.target_value,
          target_unit: targetData.target_unit,
          start_date: targetData.start_date,
          end_date: targetData.end_date || null
        });

      if (error) throw error;

      toast({
        title: "تم الحفظ",
        description: "تم حفظ الهدف بنجاح"
      });

      setTargetDialogOpen(false);
      setTargetData({
        target_type: 'daily',
        target_value: 0,
        target_unit: 'orders',
        start_date: new Date().toISOString().split('T')[0],
        end_date: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error saving target:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في حفظ الهدف",
        variant: "destructive"
      });
    }
  };

  // حساب الإحصائيات
  const getStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const thisWeek = dailySales.filter(sale => {
      const saleDate = new Date(sale.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return saleDate >= weekAgo;
    });

    const todaySale = dailySales.find(sale => sale.date === today);
    const weekTotal = thisWeek.reduce((sum, sale) => sum + sale.total_amount, 0);
    const weekOrders = thisWeek.reduce((sum, sale) => sum + sale.orders_count, 0);
    const avgEfficiency = dailySales.length > 0 
      ? dailySales.reduce((sum, sale) => sum + sale.efficiency_percentage, 0) / dailySales.length 
      : 0;

    return {
      todayOrders: todaySale?.orders_count || 0,
      todayAmount: todaySale?.total_amount || 0,
      weekTotal,
      weekOrders,
      avgEfficiency: Math.round(avgEfficiency)
    };
  };

  // تحضير البيانات للرسم البياني
  const getChartData = () => {
    return dailySales
      .slice(0, 7)
      .reverse()
      .map(sale => ({
        date: new Date(sale.date).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' }),
        orders: sale.orders_count,
        amount: sale.total_amount,
        efficiency: sale.efficiency_percentage,
        target: sale.target_amount
      }));
  };

  const stats = getStats();
  const chartData = getChartData();

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
            <BarChart3 className="w-6 h-6" />
            تتبع المبيعات والأداء
          </h2>
          <p className="text-muted-foreground">
            متابعة الأداء اليومي والأهداف للموظفين
          </p>
        </div>

        <div className="flex gap-2">
          <Dialog open={targetDialogOpen} onOpenChange={setTargetDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Target className="w-4 h-4" />
                إضافة هدف
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة هدف جديد</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmitTarget} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>نوع الهدف</Label>
                    <select
                      value={targetData.target_type}
                      onChange={(e) => setTargetData(prev => ({ ...prev, target_type: e.target.value }))}
                      className="w-full p-2 border rounded"
                    >
                      <option value="daily">يومي</option>
                      <option value="weekly">أسبوعي</option>
                      <option value="monthly">شهري</option>
                    </select>
                  </div>
                  <div>
                    <Label>وحدة القياس</Label>
                    <select
                      value={targetData.target_unit}
                      onChange={(e) => setTargetData(prev => ({ ...prev, target_unit: e.target.value }))}
                      className="w-full p-2 border rounded"
                    >
                      <option value="orders">عدد الطلبات</option>
                      <option value="amount">المبلغ (د.ج)</option>
                      <option value="customers">عدد العملاء</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label>قيمة الهدف</Label>
                  <Input
                    type="number"
                    value={targetData.target_value}
                    onChange={(e) => setTargetData(prev => ({ ...prev, target_value: Number(e.target.value) }))}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>تاريخ البداية</Label>
                    <Input
                      type="date"
                      value={targetData.start_date}
                      onChange={(e) => setTargetData(prev => ({ ...prev, start_date: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label>تاريخ النهاية (اختياري)</Label>
                    <Input
                      type="date"
                      value={targetData.end_date}
                      onChange={(e) => setTargetData(prev => ({ ...prev, end_date: e.target.value }))}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  حفظ الهدف
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                تسجيل مبيعات
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>تسجيل المبيعات اليومية</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmitSale} className="space-y-4">
                <div>
                  <Label>التاريخ</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>عدد الطلبات</Label>
                    <Input
                      type="number"
                      value={formData.orders_count}
                      onChange={(e) => setFormData(prev => ({ ...prev, orders_count: Number(e.target.value) }))}
                      required
                    />
                  </div>
                  <div>
                    <Label>إجمالي المبلغ (د.ج)</Label>
                    <Input
                      type="number"
                      value={formData.total_amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, total_amount: Number(e.target.value) }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label>ملاحظات</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="ملاحظات حول الأداء اليوم..."
                  />
                </div>

                <Button type="submit" className="w-full">
                  حفظ البيانات
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">طلبات اليوم</p>
                <p className="text-2xl font-bold text-primary">{stats.todayOrders}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">مبيعات اليوم</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {stats.todayAmount.toLocaleString('ar-DZ')} د.ج
                </p>
              </div>
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">مبيعات الأسبوع</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.weekTotal.toLocaleString('ar-DZ')} د.ج
                </p>
                <p className="text-xs text-muted-foreground">{stats.weekOrders} طلب</p>
              </div>
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">متوسط الكفاءة</p>
                <p className="text-2xl font-bold text-purple-600">{stats.avgEfficiency}%</p>
                <Progress value={stats.avgEfficiency} className="mt-1 h-1" />
              </div>
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              الأداء الأسبوعي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="orders" fill="hsl(var(--primary))" name="الطلبات" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              نسبة الكفاءة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="efficiency" 
                  stroke="hsl(var(--primary))" 
                  name="الكفاءة %"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* جدول المبيعات */}
      <Card>
        <CardHeader>
          <CardTitle>سجل المبيعات</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>التاريخ</TableHead>
                <TableHead>عدد الطلبات</TableHead>
                <TableHead>إجمالي المبلغ</TableHead>
                <TableHead>الهدف</TableHead>
                <TableHead>الكفاءة</TableHead>
                <TableHead>الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dailySales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>
                    {new Date(sale.date).toLocaleDateString('ar-SA')}
                  </TableCell>
                  <TableCell className="font-medium">{sale.orders_count}</TableCell>
                  <TableCell>{sale.total_amount.toLocaleString('ar-DZ')} د.ج</TableCell>
                  <TableCell>{sale.target_amount.toLocaleString('ar-DZ')}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={sale.efficiency_percentage} className="w-16 h-2" />
                      <span className="text-sm">{sale.efficiency_percentage}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {sale.efficiency_percentage >= 100 ? (
                      <Badge className="gap-1">
                        <Award className="w-3 h-3" />
                        ممتاز
                      </Badge>
                    ) : sale.efficiency_percentage >= 80 ? (
                      <Badge variant="secondary" className="gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        جيد
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="gap-1">
                        <AlertCircle className="w-3 h-3" />
                        يحتاج تحسين
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesTracker;