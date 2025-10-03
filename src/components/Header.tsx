import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from './ui/button';
import { LogOut, User, Shield, Coffee } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Header: React.FC = () => {
  const { profile, signOut, isAdmin } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: 'تم تسجيل الخروج',
      description: 'تم تسجيل خروجك بنجاح',
    });
  };

  return (
    <header className="bg-primary backdrop-blur supports-[backdrop-filter]:bg-primary/95 border-b border-primary-foreground/20 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Coffee className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">
                نظام إدارة الطلبات
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                إدارة طلبات القهوة والمنتجات
              </p>
            </div>
          </div>

          {/* User Info & Actions */}
          <div className="flex items-center gap-3">
            {/* User Info */}
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                {isAdmin ? (
                  <Shield className="w-4 h-4 text-primary" />
                ) : (
                  <User className="w-4 h-4" />
                )}
                <span>{profile?.full_name}</span>
              </div>
              <div className="text-xs text-muted-foreground border-r pr-2 mr-2">
                {isAdmin ? 'مدير' : 'عامل'}
              </div>
            </div>

            {/* Mobile User Info */}
            <div className="sm:hidden flex items-center gap-1">
              {isAdmin ? (
                <Shield className="w-4 h-4 text-primary" />
              ) : (
                <User className="w-4 h-4 text-muted-foreground" />
              )}
            </div>

            {/* Logout Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">خروج</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;