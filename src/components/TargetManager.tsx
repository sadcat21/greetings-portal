import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Target, 
  Calendar, 
  Clock,
  TrendingUp,
  Plus,
  Edit,
  Save,
  X
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface WorkerTarget {
  id: string;
  workerName: string;
  dailyTarget: number;
  weeklyTarget: number;
  monthlyTarget: number;
  currentDaily: number;
  currentWeekly: number;
  currentMonthly: number;
  efficiency: number;
  lastUpdated: string;
}

const TargetManager: React.FC = () => {
  const [editingWorker, setEditingWorker] = useState<string | null>(null);
  const [newTargets, setNewTargets] = useState({ daily: 0, weekly: 0, monthly: 0 });
  
  // Mock data - سيتم استبدالها ببيانات حقيقية من قاعدة البيانات
  const [workers, setWorkers] = useState<WorkerTarget[]>([
    {
      id: '1',
      workerName: 'أحمد محمد',
      dailyTarget: 20,
      weeklyTarget: 140,
      monthlyTarget: 400,
      currentDaily: 15,
      currentWeekly: 89,
      currentMonthly: 356,
      efficiency: 89,
      lastUpdated: '2024-01-15'
    },
    {
      id: '2',
      workerName: 'فاطمة علي',
      dailyTarget: 20,
      weeklyTarget: 140,
      monthlyTarget: 400,
      currentDaily: 18,
      currentWeekly: 95,
      currentMonthly: 378,
      efficiency: 94.5,
      lastUpdated: '2024-01-15'
    },
    {
      id: '3',
      workerName: 'محمد حسن',
      dailyTarget: 18,
      weeklyTarget: 126,
      monthlyTarget: 350,
      currentDaily: 12,
      currentWeekly: 78,
      currentMonthly: 312,
      efficiency: 89.1,
      lastUpdated: '2024-01-14'
    }
  ]);

  const handleUpdateTargets = (workerId: string) => {
    setWorkers(prev => prev.map(worker => 
      worker.id === workerId 
        ? {
            ...worker,
            dailyTarget: newTargets.daily,
            weeklyTarget: newTargets.weekly,
            monthlyTarget: newTargets.monthly,
            lastUpdated: new Date().toISOString().split('T')[0]
          }
        : worker
    ));
    
    setEditingWorker(null);
    setNewTargets({ daily: 0, weekly: 0, monthly: 0 });
    
    toast({
      title: 'تم تحديث الأهداف',
      description: 'تم تحديث أهداف العامل بنجاح',
    });
  };

  const getProgressColor = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 90) return 'text-emerald-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getProgressBg = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 90) return 'bg-emerald-500';
    if (percentage >= 70) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" />
            إدارة الأهداف
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            تحديد وتتبع أهداف العمال اليومية والأسبوعية والشهرية
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {workers.map((worker) => (
          <Card key={worker.id} className="bg-card/95 backdrop-blur-sm border-border/50 shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                {/* Worker Info */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{worker.workerName}</h3>
                    <p className="text-sm text-muted-foreground">
                      كفاءة: {worker.efficiency}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      آخر تحديث: {worker.lastUpdated}
                    </p>
                  </div>
                </div>

                {/* Targets Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 max-w-2xl">
                  {/* Daily Target */}
                  <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-medium">هدف يومي</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>الهدف: {worker.dailyTarget}</span>
                        <span className={getProgressColor(worker.currentDaily, worker.dailyTarget)}>
                          الحالي: {worker.currentDaily}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${getProgressBg(worker.currentDaily, worker.dailyTarget)}`}
                          style={{ width: `${Math.min((worker.currentDaily / worker.dailyTarget) * 100, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {Math.round((worker.currentDaily / worker.dailyTarget) * 100)}% مكتمل
                      </p>
                    </div>
                  </div>

                  {/* Weekly Target */}
                  <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">هدف أسبوعي</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>الهدف: {worker.weeklyTarget}</span>
                        <span className={getProgressColor(worker.currentWeekly, worker.weeklyTarget)}>
                          الحالي: {worker.currentWeekly}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${getProgressBg(worker.currentWeekly, worker.weeklyTarget)}`}
                          style={{ width: `${Math.min((worker.currentWeekly / worker.weeklyTarget) * 100, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {Math.round((worker.currentWeekly / worker.weeklyTarget) * 100)}% مكتمل
                      </p>
                    </div>
                  </div>

                  {/* Monthly Target */}
                  <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium">هدف شهري</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>الهدف: {worker.monthlyTarget}</span>
                        <span className={getProgressColor(worker.currentMonthly, worker.monthlyTarget)}>
                          الحالي: {worker.currentMonthly}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${getProgressBg(worker.currentMonthly, worker.monthlyTarget)}`}
                          style={{ width: `${Math.min((worker.currentMonthly / worker.monthlyTarget) * 100, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {Math.round((worker.currentMonthly / worker.monthlyTarget) * 100)}% مكتمل
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setEditingWorker(worker.id);
                          setNewTargets({
                            daily: worker.dailyTarget,
                            weekly: worker.weeklyTarget,
                            monthly: worker.monthlyTarget
                          });
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>تحديث أهداف {worker.workerName}</DialogTitle>
                        <DialogDescription>
                          قم بتحديد الأهداف الجديدة للعامل
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="dailyTarget">الهدف اليومي</Label>
                          <Input
                            id="dailyTarget"
                            type="number"
                            value={newTargets.daily}
                            onChange={(e) => setNewTargets(prev => ({
                              ...prev, 
                              daily: parseInt(e.target.value) || 0
                            }))}
                            placeholder="20"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="weeklyTarget">الهدف الأسبوعي</Label>
                          <Input
                            id="weeklyTarget"
                            type="number"
                            value={newTargets.weekly}
                            onChange={(e) => setNewTargets(prev => ({
                              ...prev, 
                              weekly: parseInt(e.target.value) || 0
                            }))}
                            placeholder="140"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="monthlyTarget">الهدف الشهري</Label>
                          <Input
                            id="monthlyTarget"
                            type="number"
                            value={newTargets.monthly}
                            onChange={(e) => setNewTargets(prev => ({
                              ...prev, 
                              monthly: parseInt(e.target.value) || 0
                            }))}
                            placeholder="400"
                          />
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleUpdateTargets(worker.id)}
                            className="flex-1"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            حفظ الأهداف
                          </Button>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="flex-1">
                              إلغاء
                            </Button>
                          </DialogTrigger>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-lg">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">
                {workers.filter(w => (w.currentMonthly / w.monthlyTarget) >= 0.9).length}
              </p>
              <p className="text-sm text-muted-foreground">عمال يحققون أهدافهم</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-lg">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {Math.round(workers.reduce((acc, w) => acc + w.efficiency, 0) / workers.length)}%
              </p>
              <p className="text-sm text-muted-foreground">متوسط الكفاءة العام</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-lg">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {workers.reduce((acc, w) => acc + w.currentMonthly, 0)}
              </p>
              <p className="text-sm text-muted-foreground">إجمالي الطلبات الشهرية</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TargetManager;