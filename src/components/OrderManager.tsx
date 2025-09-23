import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import OrderForm from './OrderForm';
import OrdersTable from './OrdersTable';
import { OrderItem, OrderFormData } from '@/types/order';
import { useToast } from '@/hooks/use-toast';
import { FileText, Coffee, Printer, Download, Trash2 } from 'lucide-react';

const OrderManager: React.FC = () => {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [editingOrder, setEditingOrder] = useState<OrderItem | null>(null);
  const { toast } = useToast();

  const generateId = () => Date.now().toString();

  const handleSubmit = (data: OrderFormData) => {
    if (editingOrder) {
      // Update existing order
      setOrders(prev => prev.map(order => 
        order.id === editingOrder.id 
          ? { ...order, ...data }
          : order
      ));
      setEditingOrder(null);
      toast({ 
        title: "تم تعديل الطلب", 
        description: "تم تعديل الطلب بنجاح" 
      });
    } else {
      // Add new order
      const newOrder: OrderItem = {
        id: generateId(),
        ...data
      };
      setOrders(prev => [...prev, newOrder]);
      toast({ 
        title: "تم إضافة الطلب", 
        description: "تم إضافة الطلب بنجاح" 
      });
    }
  };

  const handleEdit = (order: OrderItem) => {
    setEditingOrder(order);
  };

  const handleDelete = (index: number) => {
    if (confirm('هل تريد حذف هذا الطلب؟')) {
      setOrders(prev => prev.filter((_, i) => i !== index));
      toast({ 
        title: "تم الحذف", 
        description: "تم حذف الطلب بنجاح" 
      });
    }
  };

  const handleClearAll = () => {
    if (confirm('هل تريد مسح جميع الصفوف في الجدول؟')) {
      setOrders([]);
      toast({ 
        title: "تم المسح", 
        description: "تم مسح جميع الطلبات" 
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCsv = () => {
    if (orders.length === 0) {
      toast({ 
        title: "تنبيه", 
        description: "لا توجد بيانات للتصدير",
        variant: "destructive" 
      });
      return;
    }

    const headers = [
      'الزبون', 'ملاحظة', 'AROMA 250g', 'OSCAR 250g', 'AROMA Espresso 250g',
      'AROMA Familiale', 'AROMA 125g', 'Oscar 125g', 'Aroma 5KG', 'Oscar 5KG',
      'Aroma Pot 700g', 'Oscar Pot 400g', 'Capsule', 'Cafe D\'Or 400g',
      'Aroma GOLD 250g', 'Payment'
    ];

    const csvContent = [
      headers.join(','),
      ...orders.map(order => [
        `"${order.clientName.replace(/"/g, '""')}"`,
        `"${order.note.replace(/"/g, '""')}"`,
        order.products.aroma250,
        order.products.oscar250,
        order.products.aromaEspresso250,
        order.products.aromaFamiliale,
        order.products.aroma125,
        order.products.oscar125,
        order.products.aroma5kg,
        order.products.oscar5kg,
        order.products.aromaPot700,
        order.products.oscarPot400,
        order.products.capsules,
        order.products.cafeDor400,
        order.products.aromaGold250,
        `"${order.products.payment.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'orders.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({ 
      title: "تم التنزيل", 
      description: "تم تحميل ملف CSV بنجاح" 
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-8">
      {/* Header */}
      <div className="text-center space-y-2 sm:space-y-4">
        <h1 className="text-2xl sm:text-4xl font-bold text-foreground">
          نموذج إدخال الطلبات
        </h1>
        <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
          املأ حقول الزبون والكميات ثم اضغط "أضف إلى الجدول". عند الانتهاء يمكن طباعة الجدول أو تنزيله كملف CSV
        </p>
      </div>

      {/* Order Form */}
      <div className="print:hidden">
        <OrderForm 
          onSubmit={handleSubmit} 
          initialData={editingOrder || undefined}
        />
      </div>

      {/* Orders Table */}
      <OrdersTable 
        orders={orders}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPrint={handlePrint}
        onDownloadCsv={handleDownloadCsv}
        onClearAll={handleClearAll}
      />
    </div>
  );
};

export default OrderManager;