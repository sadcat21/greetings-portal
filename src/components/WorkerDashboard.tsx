import React, { useState } from 'react';
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
  BarChart3
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';
import OrderManager from './OrderManager';
import SalesTracker from './SalesTracker';

const WorkerDashboard: React.FC = () => {
  const [selectedView, setSelectedView] = useState<'dashboard' | 'orders' | 'sales'>('dashboard');
  
  // Mock data for worker performance
  const workerStats = {
    dailyOrders: 18,
    dailyTarget: 20,
    weeklyOrders: 95,
    weeklyTarget: 140,
    monthlyOrders: 378,
    monthlyTarget: 400,
    efficiency: 94.5,
    rank: 2,
    totalWorkers: 12
  };

  const dailyProgress = [
    { hour: '8:00', orders: 2 },
    { hour: '9:00', orders: 5 },
    { hour: '10:00', orders: 8 },
    { hour: '11:00', orders: 12 },
    { hour: '12:00', orders: 15 },
    { hour: '13:00', orders: 16 },
    { hour: '14:00', orders: 18 },
  ];

  const weeklyPerformance = [
    { day: 'السبت', orders: 22, target: 20 },
    { day: 'الأحد', orders: 18, target: 20 },
    { day: 'الاثنين', orders: 16, target: 20 },
    { day: 'الثلاثاء', orders: 14, target: 20 },
    { day: 'الأربعاء', orders: 12, target: 20 },
    { day: 'الخميس', orders: 8, target: 20 },
    { day: 'الجمعة', orders: 5, target: 20 },
  ];

  const achievements = [
    { title: 'أفضل عامل الأسبوع', icon: Award, achieved: true, date: '2024-01-15' },
    { title: 'هدف شهري 100%', icon: Target, achieved: true, date: '2024-01-01' },
    { title: 'سرعة في الإنجاز', icon: Timer, achieved: false, progress: 75 },
    { title: '500 طلب مكتمل', icon: Coffee, achieved: false, progress: 89 },
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
              ← العودة للوحة التحكم
            </Button>
            <h1 className="text-xl font-bold">إدارة الطلبات</h1>
          </div>
        </div>
        <div className="p-2 sm:p-4">
          <OrderManager />
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
              ← العودة للوحة التحكم
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
              مرحباً فاطمة علي
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              أداؤك اليوم ممتاز! استمري في العمل الرائع
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
                {workerStats.dailyOrders}
              </p>
              <p className="text-xs text-muted-foreground">
                من {workerStats.dailyTarget} (الهدف)
              </p>
              <Progress 
                value={(workerStats.dailyOrders / workerStats.dailyTarget) * 100} 
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
                {workerStats.weeklyOrders}
              </p>
              <p className="text-xs text-muted-foreground">
                من {workerStats.weeklyTarget} (الهدف)
              </p>
              <Progress 
                value={(workerStats.weeklyOrders / workerStats.weeklyTarget) * 100} 
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
                {workerStats.monthlyOrders}
              </p>
              <p className="text-xs text-muted-foreground">
                من {workerStats.monthlyTarget} (الهدف)
              </p>
              <Progress 
                value={(workerStats.monthlyOrders / workerStats.monthlyTarget) * 100} 
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
                  المرتبة {workerStats.rank}
                </Badge>
              </div>
              <p className="text-2xl font-bold text-orange-600 mb-1">
                {workerStats.efficiency}%
              </p>
              <p className="text-xs text-muted-foreground">
                الكفاءة العامة
              </p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-3 h-3 text-emerald-600" />
                <span className="text-xs text-emerald-600">+5.2% من الأسبوع الماضي</span>
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
                        {achievement.progress}% مكتمل
                      </p>
                      <Progress value={achievement.progress} className="h-1" />
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

export default WorkerDashboard;