import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { ShoppingCart, Plus, Minus, Sparkles, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AromaProduct {
  id: string;
  name_ar: string;
  retail_price: number;
  wholesale_price: number;
  super_wholesale_price: number;
  stock: number;
  image_url?: string | null;
}

interface QuantityModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: AromaProduct | null;
  priceType: 'retail' | 'wholesale' | 'super_wholesale';
  onConfirm: (quantity: number) => void;
}

const QuantityModal: React.FC<QuantityModalProps> = ({
  isOpen,
  onClose,
  product,
  priceType,
  onConfirm
}) => {
  const [quantity, setQuantity] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const confirmAudioRef = useRef<HTMLAudioElement | null>(null);

  // إنشاء الأصوات برمجياً
  useEffect(() => {
    // صوت فتح النافذة - نغمة جذابة
    const createOpenSound = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    };

    // صوت تأكيد - نغمة نجاح
    const createConfirmSound = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
      oscillator.frequency.setValueAtTime(554.37, audioContext.currentTime + 0.1); // C#5
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.2); // E5

      gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
    };

    if (isOpen && product) {
      setIsAnimating(true);
      try {
        createOpenSound();
      } catch (error) {
        console.log('Audio context not available');
      }
      
      // إزالة الأنيميشن بعد انتهائه
      const timer = setTimeout(() => setIsAnimating(false), 600);
      return () => clearTimeout(timer);
    }

    return () => {};
  }, [isOpen, product]);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 0)) {
      setQuantity(newQuantity);
    }
  };

  const handleConfirm = () => {
    // تشغيل صوت التأكيد
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(554.37, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.2);

      gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
    } catch (error) {
      console.log('Audio context not available');
    }

    onConfirm(quantity);
    handleClose();
  };

  const handleClose = () => {
    setQuantity(1);
    onClose();
  };

  if (!product) return null;

  const priceLabels = {
    retail: 'تجزئة',
    wholesale: 'جملة',
    super_wholesale: 'سوبر جملة'
  };

  const currentPrice = product[`${priceType}_price`];
  const totalPrice = currentPrice * quantity;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className={cn(
          "max-w-md mx-auto",
          "bg-gradient-to-br from-white via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950",
          "border-2 border-primary/20 shadow-2xl",
          "animate-fade-in transform-gpu",
          isAnimating && "animate-scale-in"
        )}
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(59, 130, 246, 0.1)',
        }}
      >
        {/* تأثير الخلفية المتحركة */}
        <div className="absolute inset-0 overflow-hidden rounded-lg">
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/10 rounded-full animate-pulse" />
          <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-accent/10 rounded-full animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-secondary/10 rounded-full animate-ping" />
        </div>

        <div className="relative z-10 p-6 space-y-6">
          {/* رأس النافذة */}
          <div className="text-center space-y-3">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
              إضافة إلى الطلب
              <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
            </h2>
          </div>

          {/* معلومات المنتج */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 space-y-3 border border-primary/10">
            <div className="text-center space-y-3">
              {/* صورة المنتج */}
              {product.image_url && (
                <div className="mx-auto w-20 h-20 rounded-xl overflow-hidden shadow-lg">
                  <img
                    src={product.image_url}
                    alt={product.name_ar}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {product.name_ar}
                </h3>
                <Badge variant="secondary" className="mt-1">
                  {priceLabels[priceType]}
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
              <span>المخزون المتاح:</span>
              <Badge variant={product.stock > 10 ? "default" : "destructive"}>
                {product.stock} قطعة
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">السعر:</span>
              <div className="flex items-center gap-1 text-lg font-bold text-primary">
                <DollarSign className="w-4 h-4" />
                {currentPrice.toFixed(2)}
              </div>
            </div>
          </div>

          {/* إدخال الكمية */}
          <div className="space-y-3">
            <Label className="text-center block text-gray-700 dark:text-gray-300 font-medium">
              الكمية المطلوبة
            </Label>
            
            <div className="flex items-center justify-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
                className="rounded-full w-12 h-12 border-2 hover:scale-110 transition-transform"
              >
                <Minus className="w-4 h-4" />
              </Button>

              <Input
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                className="w-20 text-center text-xl font-bold border-2 border-primary/20 rounded-xl"
              />

              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= product.stock}
                className="rounded-full w-12 h-12 border-2 hover:scale-110 transition-transform"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* الإجمالي */}
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-4 text-center">
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">الإجمالي</div>
            <div className="text-3xl font-bold text-primary flex items-center justify-center gap-2">
              <DollarSign className="w-6 h-6" />
              {totalPrice.toFixed(2)}
            </div>
          </div>

          {/* أزرار التأكيد */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="py-3 hover:scale-105 transition-transform"
            >
              إلغاء
            </Button>
            
            <Button
              type="button"
              onClick={handleConfirm}
              className="py-3 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              تأكيد الإضافة
            </Button>
          </div>
        </div>

        {/* تأثيرات الجسيمات */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "absolute w-2 h-2 bg-yellow-400 rounded-full opacity-70",
                "animate-ping"
              )}
              style={{
                left: `${20 + (i * 15)}%`,
                top: `${15 + (i * 10)}%`,
                animationDelay: `${i * 200}ms`,
                animationDuration: '2s'
              }}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuantityModal;