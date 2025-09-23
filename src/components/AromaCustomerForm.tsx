import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User, Building2, Phone, Mail, MapPin, CreditCard, Save, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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

interface AromaCustomerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingCustomer?: AromaCustomer | null;
}

const AromaCustomerForm: React.FC<AromaCustomerFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editingCustomer
}) => {
  const [loading, setLoading] = useState(false);
  const { profile } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    business_name: '',
    business_type: 'retail',
    default_price_type: 'retail',
    address: {
      street: '',
      city: '',
      state: '',
      postal_code: ''
    },
    notes: ''
  });

  useEffect(() => {
    if (editingCustomer) {
      setFormData({
        customer_name: editingCustomer.customer_name || '',
        customer_phone: editingCustomer.customer_phone || '',
        customer_email: editingCustomer.customer_email || '',
        business_name: editingCustomer.business_name || '',
        business_type: editingCustomer.business_type || 'retail',
        default_price_type: editingCustomer.default_price_type || 'retail',
        address: editingCustomer.address || {
          street: '',
          city: '',
          state: '',
          postal_code: ''
        },
        notes: editingCustomer.notes || ''
      });
    } else {
      resetForm();
    }
  }, [editingCustomer, isOpen]);

  const resetForm = () => {
    setFormData({
      customer_name: '',
      customer_phone: '',
      customer_email: '',
      business_name: '',
      business_type: 'retail',
      default_price_type: 'retail',
      address: {
        street: '',
        city: '',
        state: '',
        postal_code: ''
      },
      notes: ''
    });
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

    setLoading(true);
    
    try {
      const customerData = {
        ...formData,
        created_by: profile?.id
      };

      if (editingCustomer) {
        const { error } = await supabase
          .from('aroma_customers')
          .update(customerData)
          .eq('id', editingCustomer.id);

        if (error) throw error;

        toast({
          title: "تم التحديث",
          description: "تم تحديث بيانات العميل بنجاح",
        });
      } else {
        const { error } = await supabase
          .from('aroma_customers')
          .insert(customerData);

        if (error) throw error;

        toast({
          title: "تم الحفظ",
          description: "تم إضافة العميل بنجاح",
        });
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {editingCustomer ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* معلومات العميل الأساسية */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-4 h-4" />
                المعلومات الشخصية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>اسم العميل *</Label>
                  <Input
                    value={formData.customer_name}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      customer_name: e.target.value 
                    }))}
                    required
                    placeholder="اسم العميل الكامل"
                  />
                </div>
                
                <div>
                  <Label>رقم الهاتف</Label>
                  <Input
                    value={formData.customer_phone}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      customer_phone: e.target.value 
                    }))}
                    placeholder="0123456789"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <Label>البريد الإلكتروني</Label>
                <Input
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    customer_email: e.target.value 
                  }))}
                  placeholder="customer@example.com"
                  dir="ltr"
                />
              </div>
            </CardContent>
          </Card>

          {/* معلومات العمل */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                معلومات العمل والأسعار
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>اسم المتجر/الشركة</Label>
                <Input
                  value={formData.business_name}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    business_name: e.target.value 
                  }))}
                  placeholder="اسم المتجر أو الشركة"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>نوع العمل</Label>
                  <Select 
                    value={formData.business_type} 
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      business_type: value,
                      default_price_type: value // تعديل نوع السعر تلقائياً
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="retail">بيع بالتجزئة</SelectItem>
                      <SelectItem value="wholesale">بيع بالجملة</SelectItem>
                      <SelectItem value="super_wholesale">بيع بالجملة الكبيرة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>نوع السعر الافتراضي</Label>
                  <Select 
                    value={formData.default_price_type} 
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      default_price_type: value 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="retail">سعر التجزئة</SelectItem>
                      <SelectItem value="wholesale">سعر الجملة</SelectItem>
                      <SelectItem value="super_wholesale">سعر الجملة الكبيرة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* العنوان */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                العنوان
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>الشارع</Label>
                <Input
                  value={formData.address.street}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    address: { ...prev.address, street: e.target.value }
                  }))}
                  placeholder="رقم ، اسم الشارع"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>المدينة</Label>
                  <Input
                    value={formData.address.city}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      address: { ...prev.address, city: e.target.value }
                    }))}
                    placeholder="المدينة"
                  />
                </div>

                <div>
                  <Label>الولاية</Label>
                  <Input
                    value={formData.address.state}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      address: { ...prev.address, state: e.target.value }
                    }))}
                    placeholder="الولاية"
                  />
                </div>

                <div>
                  <Label>الرمز البريدي</Label>
                  <Input
                    value={formData.address.postal_code}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      address: { ...prev.address, postal_code: e.target.value }
                    }))}
                    placeholder="00000"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ملاحظات */}
          <div>
            <Label>ملاحظات إضافية</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                notes: e.target.value 
              }))}
              rows={3}
              placeholder="أي ملاحظات أو تفاصيل إضافية عن العميل..."
            />
          </div>

          {/* أزرار الحفظ */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              <X className="w-4 h-4 mr-2" />
              إلغاء
            </Button>
            
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {editingCustomer ? 'تحديث' : 'حفظ'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AromaCustomerForm;