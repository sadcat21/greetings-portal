import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Shield, 
  Briefcase,
  Truck,
  Package,
  Calculator,
  UserCheck,
  Settings
} from 'lucide-react';

interface EmployeeRole {
  id: string;
  name: string;
  name_ar: string;
  description: string;
  permissions: any;
  is_active: boolean;
  created_at: string;
}

interface Employee {
  id: string;
  full_name: string;
  role: string;
  employee_role_id: string;
  department: string;
  hire_date: string;
  is_active: boolean;
}

const roleIcons = {
  admin: Shield,
  warehouse_manager: Package,
  driver: Truck,
  order_collector: Briefcase,
  sales_rep: Users,
  accountant: Calculator
};

const EmployeeRoleManager: React.FC = () => {
  const [roles, setRoles] = useState<EmployeeRole[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<EmployeeRole | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    description: '',
    permissions: [] as string[]
  });

  const availablePermissions = [
    'all', 'inventory', 'products', 'orders', 'orders_view', 
    'delivery', 'customers', 'sales', 'finance', 'reports'
  ];

  const permissionLabels = {
    all: 'جميع الصلاحيات',
    inventory: 'إدارة المخزون',
    products: 'إدارة المنتجات',
    orders: 'إدارة الطلبات',
    orders_view: 'عرض الطلبات',
    delivery: 'التوصيل',
    customers: 'إدارة العملاء',
    sales: 'المبيعات',
    finance: 'المالية',
    reports: 'التقارير'
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // جلب الأدوار
      const { data: rolesData, error: rolesError } = await supabase
        .from('employee_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (rolesError) throw rolesError;

      // جلب الموظفين
      const { data: employeesData, error: employeesError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          role,
          employee_role_id,
          department,
          hire_date,
          is_active
        `);

      if (employeesError) throw employeesError;

      // تحويل البيانات مع معالجة permissions
      const processedRoles = rolesData?.map(role => ({
        ...role,
        permissions: Array.isArray(role.permissions) ? role.permissions : []
      })) || [];
      
      setRoles(processedRoles);
      setEmployees(employeesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في جلب البيانات",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingRole) {
        // تحديث دور موجود
        const { error } = await supabase
          .from('employee_roles')
          .update({
            name: formData.name,
            name_ar: formData.name_ar,
            description: formData.description,
            permissions: formData.permissions
          })
          .eq('id', editingRole.id);

        if (error) throw error;

        toast({
          title: "تم التحديث",
          description: "تم تحديث الدور بنجاح"
        });
      } else {
        // إضافة دور جديد
        const { error } = await supabase
          .from('employee_roles')
          .insert({
            name: formData.name,
            name_ar: formData.name_ar,
            description: formData.description,
            permissions: formData.permissions
          });

        if (error) throw error;

        toast({
          title: "تم الإضافة",
          description: "تم إضافة الدور بنجاح"
        });
      }

      setDialogOpen(false);
      setEditingRole(null);
      setFormData({ name: '', name_ar: '', description: '', permissions: [] });
      fetchData();
    } catch (error) {
      console.error('Error saving role:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في حفظ الدور",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (roleId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الدور؟')) return;

    try {
      const { error } = await supabase
        .from('employee_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;

      toast({
        title: "تم الحذف",
        description: "تم حذف الدور بنجاح"
      });

      fetchData();
    } catch (error) {
      console.error('Error deleting role:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في حذف الدور",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (role: EmployeeRole) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      name_ar: role.name_ar,
      description: role.description,
      permissions: role.permissions
    });
    setDialogOpen(true);
  };

  const handleAssignRole = async () => {
    if (!selectedEmployee || !selectedRole) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ employee_role_id: selectedRole })
        .eq('id', selectedEmployee);

      if (error) throw error;

      toast({
        title: "تم التعيين",
        description: "تم تعيين الدور للموظف بنجاح"
      });

      setAssignDialogOpen(false);
      setSelectedEmployee('');
      setSelectedRole('');
      fetchData();
    } catch (error) {
      console.error('Error assigning role:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في تعيين الدور",
        variant: "destructive"
      });
    }
  };

  const togglePermission = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const getRoleIcon = (roleName: string) => {
    const IconComponent = roleIcons[roleName as keyof typeof roleIcons] || UserCheck;
    return <IconComponent className="w-4 h-4" />;
  };

  const getEmployeesByRole = (roleId: string) => {
    return employees.filter(emp => emp.employee_role_id === roleId).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Settings className="w-6 h-6" />
            إدارة أدوار الموظفين
          </h2>
          <p className="text-muted-foreground">
            إدارة الأدوار والصلاحيات للموظفين في شركة التوزيع
          </p>
        </div>

        <div className="flex gap-2">
          <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <UserCheck className="w-4 h-4" />
                تعيين دور
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>تعيين دور للموظف</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>الموظف</Label>
                  <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الموظف" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>الدور</Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الدور" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.filter(role => role.is_active).map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          <div className="flex items-center gap-2">
                            {getRoleIcon(role.name)}
                            {role.name_ar}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleAssignRole}
                  disabled={!selectedEmployee || !selectedRole}
                  className="w-full"
                >
                  تعيين الدور
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                إضافة دور جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingRole ? 'تعديل الدور' : 'إضافة دور جديد'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">اسم الدور (English)</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="driver"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="name_ar">اسم الدور (العربية)</Label>
                    <Input
                      id="name_ar"
                      value={formData.name_ar}
                      onChange={(e) => setFormData(prev => ({ ...prev, name_ar: e.target.value }))}
                      placeholder="سائق"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">الوصف</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="وصف مهام ومسؤوليات هذا الدور"
                  />
                </div>

                <div>
                  <Label>الصلاحيات</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {availablePermissions.map((permission) => (
                      <label
                        key={permission}
                        className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-muted/50"
                      >
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(permission)}
                          onChange={() => togglePermission(permission)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">
                          {permissionLabels[permission as keyof typeof permissionLabels]}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingRole ? 'تحديث' : 'إضافة'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setDialogOpen(false);
                      setEditingRole(null);
                      setFormData({ name: '', name_ar: '', description: '', permissions: [] });
                    }}
                  >
                    إلغاء
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* الأدوار */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => (
          <Card key={role.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getRoleIcon(role.name)}
                  <CardTitle className="text-lg">{role.name_ar}</CardTitle>
                </div>
                <Badge variant={role.is_active ? "default" : "secondary"}>
                  {role.is_active ? 'نشط' : 'غير نشط'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{role.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium mb-1">الصلاحيات:</p>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.slice(0, 3).map((permission) => (
                      <Badge key={permission} variant="outline" className="text-xs">
                        {permissionLabels[permission as keyof typeof permissionLabels] || permission}
                      </Badge>
                    ))}
                    {role.permissions.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{role.permissions.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="w-3 h-3" />
                    {getEmployeesByRole(role.id)} موظف
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(role)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    {role.name !== 'admin' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(role.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* جدول الموظفين وأدوارهم */}
      <Card>
        <CardHeader>
          <CardTitle>الموظفين وأدوارهم</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الموظف</TableHead>
                <TableHead>الدور الحالي</TableHead>
                <TableHead>القسم</TableHead>
                <TableHead>تاريخ التوظيف</TableHead>
                <TableHead>الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => {
                const role = roles.find(r => r.id === employee.employee_role_id);
                return (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.full_name}</TableCell>
                    <TableCell>
                      {role ? (
                        <div className="flex items-center gap-2">
                          {getRoleIcon(role.name)}
                          {role.name_ar}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">غير محدد</span>
                      )}
                    </TableCell>
                    <TableCell>{employee.department || 'غير محدد'}</TableCell>
                    <TableCell>
                      {employee.hire_date ? new Date(employee.hire_date).toLocaleDateString('ar-SA') : 'غير محدد'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={employee.is_active ? "default" : "secondary"}>
                        {employee.is_active ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeRoleManager;