import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OrderFormData, COFFEE_PRODUCTS } from '@/types/order';
import { useToast } from '@/hooks/use-toast';
import { Plus, RotateCcw, Loader2 } from 'lucide-react';

interface OrderFormProps {
  onSubmit: (data: OrderFormData) => void;
  initialData?: OrderFormData;
}

const OrderForm: React.FC<OrderFormProps> = ({ onSubmit, initialData }) => {
  const [formData, setFormData] = useState<OrderFormData>({
    clientName: '',
    note: '',
    products: {
      aroma250: 0,
      oscar250: 0,
      aromaEspresso250: 0,
      aromaFamiliale: 0,
      aroma125: 0,
      oscar125: 0,
      aroma5kg: 0,
      oscar5kg: 0,
      aromaPot700: 0,
      oscarPot400: 0,
      capsules: 0,
      cafeDor400: 0,
      aromaGold250: 0,
      payment: ''
    }
  });

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientName.trim()) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال اسم الزبون',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      onSubmit({
        clientName: formData.clientName.trim(),
        note: formData.note.trim(),
        products: formData.products
      });
      
      // Clear form after successful submission (only if not editing)
      if (!initialData) {
        handleClearForm();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClearForm = () => {
    setFormData({
      clientName: '',
      note: '',
      products: {
        aroma250: 0,
        oscar250: 0,
        aromaEspresso250: 0,
        aromaFamiliale: 0,
        aroma125: 0,
        oscar125: 0,
        aroma5kg: 0,
        oscar5kg: 0,
        aromaPot700: 0,
        oscarPot400: 0,
        capsules: 0,
        cafeDor400: 0,
        aromaGold250: 0,
        payment: ''
      }
    });
  };

  const handleProductChange = (key: keyof typeof formData.products, value: string) => {
    const numericValue = key === 'payment' ? value : (value === '' ? 0 : parseInt(value, 10) || 0);
    setFormData(prev => ({
      ...prev,
      products: {
        ...prev.products,
        [key]: numericValue
      }
    }));
  };

  return (
    <Card className="shadow-lg border-border/50">
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          إضافة طلب جديد
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Customer Info */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientName" className="text-sm font-medium">
                اسم الزبون *
              </Label>
              <Input
                id="clientName"
                type="text"
                value={formData.clientName}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  clientName: e.target.value
                }))}
                placeholder="مثال: محمد بن علي"
                required
                className="text-right"
                dir="rtl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="note" className="text-sm font-medium">
                ملاحظة
              </Label>
              <Input
                id="note"
                type="text"
                value={formData.note}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  note: e.target.value
                }))}
                placeholder="ملاحظة قصيرة (اختياري)"
                className="text-right"
                dir="rtl"
              />
            </div>
          </div>

          {/* Products Grid */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-muted-foreground">
              أدخل كميات المنتجات (اترك 0 أو فارغ إذا لا يوجد)
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {COFFEE_PRODUCTS.map((product) => (
                <div key={product.key} className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    {product.name}
                  </Label>
                  <Input
                    type={product.key === 'payment' ? 'text' : 'number'}
                    min={product.key === 'payment' ? undefined : '0'}
                    step={product.key === 'payment' ? undefined : '1'}
                    value={formData.products[product.key]}
                    onChange={(e) => handleProductChange(product.key, e.target.value)}
                    placeholder={product.key === 'payment' ? 'نقدي / أجل' : '0'}
                    className={product.key === 'payment' ? 'text-right' : 'text-center'}
                    dir={product.key === 'payment' ? 'rtl' : 'ltr'}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-4">
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  جاري الإضافة...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  أضف إلى الجدول
                </>
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleClearForm}
              className="w-full"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              تفريغ الحقول
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default OrderForm;