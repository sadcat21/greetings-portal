import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { 
  Coffee, 
  Target, 
  Calendar,
  Clock,
  TrendingUp,
  Award,
  CheckCircle2,
  Timer,
  BarChart3,
  ArrowLeft
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';
import AromaOrderTabsNew from './AromaOrderTabsNew';
import SalesTracker from './SalesTracker';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  dailyOrders: number;
  dailyTarget: number;
  weeklyOrders: number;
  weeklyTarget: number;
  monthlyOrders: number;
  monthlyTarget: number;
  totalAmount: number;
  efficiency: number;
}

const RealWorkerDashboard: React.FC = () => {
  const [selectedView, setSelectedView] = useState<'dashboard' | 'orders' | 'sales'>('dashboard');
  const [stats, setStats] = useState<DashboardStats>({
    dailyOrders: 0,
    dailyTarget: 20,
    weeklyOrders: 0,
    weeklyTarget: 140,
    monthlyOrders: 0,
    monthlyTarget: 400,
    totalAmount: 0,
    efficiency: 0
  });
  const [loading, setLoading] = useState(true);
  const [dailyProgress, setDailyProgress] = useState<any[]>([]);
  const [weeklyPerformance, setWeeklyPerformance] = useState<any[]>([]);
  
  const { profile, isAdmin, user } = useAuth();
  const { toast } = useToast();

  const fetchStats = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      const today = new Date();
      const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      // Get employee ID if user is worker
      let employeeId = null;
      if (!isAdmin) {
        const { data: employee } = await supabase
          .from('aroma_employees')
          .select('id')
          .eq('email', user.email)
          .single();
        
        employeeId = employee?.id;
      }

      // Build orders query
      let ordersQuery = supabase
        .from('aroma_orders')
        .select('*');

      // Filter by employee if not admin
      if (!isAdmin && employeeId) {
        ordersQuery = ordersQuery.eq('employee_id', employeeId);
      }

      // Get daily stats
      const { data: dailyOrders } = await ordersQuery
        .gte('order_date', startOfToday.toISOString().split('T')[0])
        .eq('status', 'delivered');

      // Get weekly stats
      const { data: weeklyOrders } = await ordersQuery
        .gte('order_date', startOfWeek.toISOString().split('T')[0])
        .eq('status', 'delivered');

      // Get monthly stats
      const { data: monthlyOrders } = await ordersQuery
        .gte('order_date', startOfMonth.toISOString().split('T')[0])
        .eq('status', 'delivered');

      // Get daily sales data for progress chart
      const { data: dailySales } = await supabase
        .from('daily_sales')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', startOfToday.toISOString().split('T')[0])
        .single();

      // Calculate stats
      const dailyCount = dailyOrders?.length || 0;
      const weeklyCount = weeklyOrders?.length || 0;
      const monthlyCount = monthlyOrders?.length || 0;
      const totalAmount = dailySales?.total_amount || 0;
      const targetAmount = dailySales?.target_amount || 0;
      const efficiency = targetAmount > 0 ? (totalAmount / targetAmount) * 100 : 0;

      setStats({
        dailyOrders: dailyCount,
        dailyTarget: 20,
        weeklyOrders: weeklyCount,
        weeklyTarget: 140,
        monthlyOrders: monthlyCount,
        monthlyTarget: 400,
        totalAmount,
        efficiency: Math.round(efficiency * 100) / 100
      });

      // Generate hourly progress data (mock for now)
      const hours = [];
      for (let i = 8; i <= 17; i++) {
        const hour = i <= 12 ? `${i}:00` : `${i}:00`;
        const orders = Math.floor(Math.random() * (dailyCount / 10));
        hours.push({ hour, orders });
      }
      setDailyProgress(hours);

      // Generate weekly performance data
      const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
      const weekData = days.map(day => ({
        day,
        orders: Math.floor(Math.random() * 25) + 5,
        target: 20
      }));
      setWeeklyPerformance(weekData);

    } catch (error: any) {
      console.error('Error fetching stats:', error);
      toast({
        title: "خطأ في تحميل الإحصائيات",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user?.id, isAdmin]);

  const achievements = [
    { title: 'أفضل عامل الأسبوع', icon: Award, achieved: stats.efficiency > 90, date: '2024-01-15' },
    { title: 'هدف شهري 100%', icon: Target, achieved: stats.efficiency >= 100, date: '2024-01-01' },
    { title: 'سرعة في الإنجاز', icon: Timer, achieved: false, progress: Math.min(stats.efficiency, 100) },
    { title: '20 طلب يومي', icon: Coffee, achieved: stats.dailyOrders >= 20, progress: (stats.dailyOrders / 20) * 100 },
  ];

  if (selectedView === 'orders') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/5">
        <div className="bg-card/95 backdrop-blur-sm border-b border-border/50 p-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <Button 
              variant="outline" 
              onClick={() => setSelectedView('dashboard')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              العودة للوحة التحكم
            </Button>
            <h1 className="text-xl font-bold">إدارة الطلبات</h1>
          </div>
        </div>
        <div className="p-2 sm:p-4">
      <AromaOrderTabsNew />
        </div>
      </div>
    );
  }

  if (selectedView === 'sales') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/5">
        <div className="bg-card/95 backdrop-blur-sm border-b border-border/50 p-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <Button 
              variant="outline" 
              onClick={() => setSelectedView('dashboard')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              العودة للوحة التحكم
            </Button>
            <h1 className="text-xl font-bold">تتبع المبيعات</h1>
          </div>
        </div>
        <div className="p-2 sm:p-4">
          <SalesTracker />
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
              <Coffee className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              مرحباً {profile?.full_name || 'عامل أروما'}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {stats.efficiency > 90 ? 'أداؤك اليوم ممتاز!' : 'استمر في العمل الجيد'}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={() => setSelectedView('orders')}
              className="bg-primary hover:bg-primary/90 gap-2"
            >
              <Coffee className="w-4 h-4" />
              إدارة الطلبات
            </Button>
            <Button 
              onClick={() => setSelectedView('sales')}
              variant="outline"
              className="gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              تتبع المبيعات
            </Button>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-lg">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  اليوم
                </Badge>
              </div>
              <p className="text-2xl font-bold text-emerald-600 mb-1">
                {stats.dailyOrders}
              </p>
              <p className="text-xs text-muted-foreground">
                من {stats.dailyTarget} (الهدف)
              </p>
              <Progress 
                value={(stats.dailyOrders / stats.dailyTarget) * 100} 
                className="mt-2 h-2"
              />
            </CardContent>
          </Card>

          <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-lg">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  الأسبوع
                </Badge>
              </div>
              <p className="text-2xl font-bold text-blue-600 mb-1">
                {stats.weeklyOrders}
              </p>
              <p className="text-xs text-muted-foreground">
                من {stats.weeklyTarget} (الهدف)
              </p>
              <Progress 
                value={(stats.weeklyOrders / stats.weeklyTarget) * 100} 
                className="mt-2 h-2"
              />
            </CardContent>
          </Card>

          <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-lg">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Target className="w-5 h-5 text-purple-600" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  الشهر
                </Badge>
              </div>
              <p className="text-2xl font-bold text-purple-600 mb-1">
                {stats.monthlyOrders}
              </p>
              <p className="text-xs text-muted-foreground">
                من {stats.monthlyTarget} (الهدف)
              </p>
              <Progress 
                value={(stats.monthlyOrders / stats.monthlyTarget) * 100} 
                className="mt-2 h-2"
              />
            </CardContent>
          </Card>

          <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-lg">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
                <Badge variant="default" className="text-xs">
                  الكفاءة
                </Badge>
              </div>
              <p className="text-2xl font-bold text-orange-600 mb-1">
                {stats.efficiency}%
              </p>
              <p className="text-xs text-muted-foreground">
                {stats.totalAmount.toLocaleString()} د.ج
              </p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-3 h-3 text-emerald-600" />
                <span className="text-xs text-emerald-600">
                  {stats.efficiency > 100 ? '+' : ''}{(stats.efficiency - 100).toFixed(1)}%
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <Clock className="w-4 h-4" />
                التقدم اليومي
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={dailyProgress}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="hour" 
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
                    dataKey="orders" 
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary))"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                الأداء الأسبوعي
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weeklyPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="day" 
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
                  <Bar dataKey="orders" fill="hsl(var(--primary))" name="الطلبات المكتملة" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Achievements Section */}
        <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <Award className="w-4 h-4" />
              الإنجازات والشارات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {achievements.map((achievement, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    achievement.achieved 
                      ? 'border-emerald-500/50 bg-emerald-500/5' 
                      : 'border-muted bg-muted/20'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${
                      achievement.achieved 
                        ? 'bg-emerald-500/10 text-emerald-600' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      <achievement.icon className="w-4 h-4" />
                    </div>
                    {achievement.achieved && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                  </div>
                  
                  <h4 className="font-medium text-sm mb-1">{achievement.title}</h4>
                  
                  {achievement.achieved ? (
                    <p className="text-xs text-emerald-600">
                      تم الإنجاز في {achievement.date}
                    </p>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        {Math.round(achievement.progress || 0)}% مكتمل
                      </p>
                      <Progress value={achievement.progress || 0} className="h-1" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Button 
            variant="outline" 
            className="h-20 flex-col gap-2"
            onClick={() => setSelectedView('orders')}
          >
            <Coffee className="w-6 h-6" />
            <span className="text-xs">طلب جديد</span>
          </Button>
          
          <Button variant="outline" className="h-20 flex-col gap-2">
            <Target className="w-6 h-6" />
            <span className="text-xs">عرض الأهداف</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-20 flex-col gap-2"
            onClick={() => setSelectedView('sales')}
          >
            <TrendingUp className="w-6 h-6" />
            <span className="text-xs">تقرير الأداء</span>
          </Button>
          
          <Button variant="outline" className="h-20 flex-col gap-2">
            <Award className="w-6 h-6" />
            <span className="text-xs">الإنجازات</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RealWorkerDashboard;