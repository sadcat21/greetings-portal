import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { OrderItem, COFFEE_PRODUCTS } from '@/types/order';
import { FileText, Printer, Download, Trash2, Edit } from 'lucide-react';

interface OrdersTableProps {
  orders: OrderItem[];
  onEdit: (order: OrderItem) => void;
  onDelete: (index: number) => void;
  onPrint: () => void;
  onDownloadCsv: () => void;
  onClearAll: () => void;
}

const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  onEdit,
  onDelete,
  onPrint,
  onDownloadCsv,
  onClearAll
}) => {
  return (
    <Card className="shadow-lg border-border/50">
      <CardHeader className="pb-3 sm:pb-6">
        <div className="flex flex-col gap-3">
          <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            جدول الطلبات ({orders.length} صف)
          </CardTitle>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={onPrint}
              variant="outline"
              size="sm"
              className="gap-2 flex-1 sm:flex-none"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">طباعة / حفظ PDF</span>
              <span className="sm:hidden">طباعة</span>
            </Button>
            
            <Button
              onClick={onDownloadCsv}
              variant="outline"
              size="sm"
              className="gap-2 flex-1 sm:flex-none"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">تنزيل CSV</span>
              <span className="sm:hidden">CSV</span>
            </Button>

            {orders.length > 0 && (
              <Button
                onClick={onClearAll}
                variant="destructive"
                size="sm"
                className="gap-2 flex-1 sm:flex-none"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">مسح الكل</span>
                <span className="sm:hidden">مسح</span>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 sm:p-6">
        <div className="overflow-x-auto border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-right font-bold min-w-[120px] text-xs sm:text-sm">الزبون</TableHead>
                <TableHead className="text-right font-bold min-w-[100px] text-xs sm:text-sm hidden sm:table-cell">ملاحظة</TableHead>
                {COFFEE_PRODUCTS.map((product) => (
                  <TableHead key={product.key} className="text-center font-bold min-w-[60px] sm:min-w-[80px] whitespace-nowrap text-xs sm:text-sm">
                    <span className="hidden sm:inline">{product.name}</span>
                    <span className="sm:hidden">{product.shortName || product.name}</span>
                  </TableHead>
                ))}
                <TableHead className="text-center font-bold min-w-[80px] print:hidden text-xs sm:text-sm">إجراءات</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell 
                    colSpan={COFFEE_PRODUCTS.length + 3} 
                    className="text-center py-6 sm:py-8 text-muted-foreground text-sm"
                  >
                    لا توجد طلبات بعد. قم بإضافة أول طلب باستخدام النموذج أعلاه.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order, index) => (
                  <TableRow key={index} className="hover:bg-muted/50">
                    <TableCell className="text-right font-medium text-xs sm:text-sm p-2 sm:p-4">{order.clientName}</TableCell>
                    <TableCell className="text-right text-muted-foreground text-xs sm:text-sm p-2 sm:p-4 hidden sm:table-cell">{order.note || '-'}</TableCell>
                    {COFFEE_PRODUCTS.map((product) => (
                      <TableCell key={product.key} className="text-center text-xs sm:text-sm p-1 sm:p-4">
                        {order.products[product.key] || 0}
                      </TableCell>
                    ))}
                    <TableCell className="text-center print:hidden p-1 sm:p-4">
                      <div className="flex gap-1 justify-center">
                        <Button
                          onClick={() => onEdit(order)}
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 sm:h-8 sm:w-8 p-0"
                        >
                          <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                        <Button
                          onClick={() => onDelete(index)}
                          size="sm"
                          variant="ghost" 
                          className="h-6 w-6 sm:h-8 sm:w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrdersTable;