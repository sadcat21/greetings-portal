import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { LogIn, UserPlus, Coffee, Shield, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('worker');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: 'خطأ في تسجيل الدخول',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'تم تسجيل الدخول بنجاح',
            description: 'مرحباً بك في نظام إدارة الطلبات',
          });
          navigate('/');
        }
      } else {
        const { error } = await signUp(email, password, fullName, role);
        if (error) {
          toast({
            title: 'خطأ في إنشاء الحساب',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'تم إنشاء الحساب بنجاح',
            description: 'تحقق من بريدك الإلكتروني لتفعيل الحساب',
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setEmail('');
    setPassword('');
    setFullName('');
    setRole('worker');
  };

  const createTestAccounts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-test-accounts', {
        body: {}
      });
      
      if (error) {
        toast({
          title: 'خطأ في إنشاء الحسابات',
          description: error.message || 'حدث خطأ غير متوقع',
          variant: 'destructive',
        });
      } else if (data?.success) {
        toast({
          title: 'تم إنشاء حسابات الاختبار',
          description: 'تم إنشاء حسابات المدير والعامل بنجاح',
        });
      } else {
        toast({
          title: 'خطأ في إنشاء الحسابات',
          description: data?.error || 'حدث خطأ غير متوقع',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'خطأ في الاتصال',
        description: 'تعذر الاتصال بالخادم',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (userType: 'admin' | 'worker') => {
    setLoading(true);
    
    // بيانات اختبار للمطور
    const credentials = {
      admin: { email: 'admin@test.com', password: 'admin123' },
      worker: { email: 'worker@test.com', password: 'worker123' }
    };

    try {
      const { error } = await signIn(credentials[userType].email, credentials[userType].password);
      if (error) {
        // إذا كانت المشكلة في بيانات الدخول، نقترح إنشاء الحسابات
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: 'حسابات الاختبار غير موجودة',
            description: 'استخدم زر "إنشاء حسابات اختبار" أولاً',
            variant: 'destructive',
          });
        } else {
          toast({
            title: `خطأ في دخول ${userType === 'admin' ? 'المدير' : 'العامل'}`,
            description: error.message,
            variant: 'destructive',
          });
        }
      } else {
        toast({
          title: `تم دخول ${userType === 'admin' ? 'المدير' : 'العامل'} بنجاح`,
          description: 'مرحباً بك في نظام إدارة الطلبات',
        });
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/50 to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Coffee className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            نظام إدارة طلبات القهوة
          </h1>
          <p className="text-muted-foreground text-sm">
            {isLogin ? 'قم بتسجيل الدخول للمتابعة' : 'أنشئ حساباً جديداً'}
          </p>
        </div>

        {/* Auth Form */}
        <Card className="shadow-lg border-border/50">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl text-center">
              {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium">
                    الاسم الكامل
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="أدخل اسمك الكامل"
                    required
                    className="text-right"
                    dir="rtl"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  البريد الإلكتروني
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  required
                  className="text-left"
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  كلمة المرور
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="text-left"
                  dir="ltr"
                />
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm font-medium">
                    الصلاحية
                  </Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger className="text-right" dir="rtl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="worker">عامل إدخال بيانات</SelectItem>
                      <SelectItem value="admin">مدير</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <>
                    {isLogin ? (
                      <>
                        <LogIn className="w-4 h-4 ml-2" />
                        تسجيل الدخول
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 ml-2" />
                        إنشاء حساب
                      </>
                    )}
                  </>
                )}
              </Button>
            </form>

            {/* أزرار الدخول السريع للمطور */}
            {isLogin && (
              <div className="mt-4 pt-4 border-t border-border/50">
                <p className="text-xs text-muted-foreground text-center mb-3">
                  🔧 أدوات المطور
                </p>
                
                {/* زر إنشاء حسابات اختبار */}
                <div className="mb-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={createTestAccounts}
                    disabled={loading}
                    className="w-full text-xs bg-yellow-500/10 hover:bg-yellow-500/20 border-yellow-500/30 text-yellow-700 dark:text-yellow-300"
                  >
                    <Coffee className="w-3 h-3 ml-1" />
                    إنشاء حسابات اختبار
                  </Button>
                </div>

                {/* أزرار الدخول السريع */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => quickLogin('admin')}
                    disabled={loading}
                    className="text-xs bg-primary/5 hover:bg-primary/10 border-primary/20"
                  >
                    <Shield className="w-3 h-3 ml-1" />
                    دخول مدير
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => quickLogin('worker')}
                    disabled={loading}
                    className="text-xs bg-secondary/5 hover:bg-secondary/10 border-secondary/20"
                  >
                    <User className="w-3 h-3 ml-1" />
                    دخول عامل
                  </Button>
                </div>
              </div>
            )}

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={toggleMode}
                className="text-sm text-primary hover:underline"
              >
                {isLogin
                  ? 'ليس لديك حساب؟ أنشئ حساباً جديداً'
                  : 'لديك حساب بالفعل؟ سجل دخولك'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;