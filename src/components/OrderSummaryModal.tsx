import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { ShoppingCart, DollarSign, Package, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderItem {
  id?: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  discount_amount: number;
}

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

interface OrderSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderItems: OrderItem[];
  products: AromaProduct[];
  onConfirmOrder: () => void;
  loading: boolean;
  calculateSubtotal: () => number;
  onEditItem: (item: OrderItem) => void;
}

const OrderSummaryModal: React.FC<OrderSummaryModalProps> = ({
  isOpen,
  onClose,
  orderItems,
  products,
  onConfirmOrder,
  loading,
  calculateSubtotal,
  onEditItem
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={cn(
          "max-w-2xl mx-auto",
          "bg-gradient-to-br from-white via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950",
          "border-2 border-primary/20 shadow-2xl",
          "animate-fade-in transform-gpu rtl"
        )}
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(59, 130, 246, 0.1)',
        }}
      >
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-white flex items-center justify-center gap-2">
            <ShoppingCart className="w-6 h-6 text-primary" />
            ملخص الطلب
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* إجمالي السعر في الأعلى */}
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-4 text-center">
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">الإجمالي الكلي</div>
            <div className="text-3xl font-bold text-primary flex items-center justify-center gap-2">
              <DollarSign className="w-6 h-6" />
              {calculateSubtotal().toFixed(2)} د.ج
            </div>
          </div>

          {/* قائمة المنتجات */}
          <ScrollArea className="h-96 px-4">
            <div className="space-y-3">
              {orderItems.map((item, index) => {
                const product = products.find(p => p.id === item.product_id);
                return (
                  <Card key={index} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* صورة المنتج */}
                        {product?.image_url && (
                          <div className="w-16 h-16 rounded-lg overflow-hidden shadow-md">
                            <img
                              src={product.image_url}
                              alt={product.name_ar}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        
                        {/* تفاصيل المنتج */}
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg text-gray-800 dark:text-white">
                            {product?.name_ar}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Package className="w-3 h-3" />
                              {item.quantity} قطعة
                            </Badge>
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {item.unit_price} د.ج للقطعة
                            </span>
                          </div>
                        </div>

                        {/* السعر الإجمالي وزر التعديل */}
                        <div className="text-left space-y-2">
                          <div className="text-xl font-bold text-primary">
                            {item.total_price} د.ج
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEditItem(item)}
                            className="text-xs"
                          >
                            تعديل
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>

          {/* أزرار التحكم */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="py-3 hover:scale-105 transition-transform"
            >
              <X className="w-4 h-4 mr-2" />
              إلغاء
            </Button>
            
            <Button
              type="button"
              onClick={onConfirmOrder}
              disabled={loading}
              className="py-3 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              تأكيد الطلب
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderSummaryModal;