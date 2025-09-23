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
  Phone, 
  MapPin, 
  Calendar,
  UserCheck,
  Search,
  Filter,
  Mail,
  Building
} from 'lucide-react';

interface AromaEmployee {
  id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  gender?: string;
  date_of_birth?: string;
  national_id?: string;
  position: string;
  department: string;
  salary?: number;
  hourly_rate?: number;
  employment_type: string;
  hire_date: string;
  status: string;
  address?: any;
  emergency_contact?: any;
  bank_details?: any;
  manager_id?: string;
  notes?: string;
  profile_image_url?: string;
  created_at: string;
  updated_at: string;
}

const EmployeeManager: React.FC = () => {
  const [employees, setEmployees] = useState<AromaEmployee[]>([]);
  const [managers, setManagers] = useState<AromaEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<AromaEmployee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    gender: 'male',
    date_of_birth: '',
    national_id: '',
    position: '',
    department: 'sales',
    salary: '',
    hourly_rate: '',
    employment_type: 'full_time',
    hire_date: new Date().toISOString().split('T')[0],
    status: 'active',
    address: {
      street: '',
      city: '',
      state: '',
      postal_code: ''
    },
    emergency_contact: {
      name: '',
      phone: '',
      relationship: ''
    },
    bank_details: {
      bank_name: '',
      account_number: '',
      iban: ''
    },
    manager_id: '',
    notes: ''
  });

  const departments = [
    { value: 'sales', label: 'المبيعات' },
    { value: 'warehouse', label: 'المستودع' },
    { value: 'delivery', label: 'التوصيل' },
    { value: 'management', label: 'الإدارة' },
    { value: 'finance', label: 'المالية' },
    { value: 'hr', label: 'الموارد البشرية' }
  ];

  const positions = [
    { value: 'sales_rep', label: 'مندوب مبيعات' },
    { value: 'warehouse_worker', label: 'عامل مستودع' },
    { value: 'driver', label: 'سائق' },
    { value: 'supervisor', label: 'مشرف' },
    { value: 'manager', label: 'مدير' },
    { value: 'accountant', label: 'محاسب' },
    { value: 'admin', label: 'إداري' }
  ];

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('aroma_employees')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setEmployees(data || []);
      
      // جلب المدراء للاختيار من بينهم
      const managersData = data?.filter(emp => 
        emp.position === 'manager' || emp.position === 'supervisor'
      ) || [];
      setManagers(managersData);
      
    } catch (error) {
      console.error('Error fetching employees:', error);
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
      if (editingEmployee) {
        // تحديث موظف موجود
        const { error } = await supabase
          .from('aroma_employees')
          .update({
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email || null,
            phone: formData.phone || null,
            gender: formData.gender || null,
            date_of_birth: formData.date_of_birth || null,
            national_id: formData.national_id || null,
            position: formData.position,
            department: formData.department,
            salary: formData.salary ? parseFloat(formData.salary) : null,
            hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
            employment_type: formData.employment_type,
            hire_date: formData.hire_date,
            status: formData.status,
            address: formData.address,
            emergency_contact: formData.emergency_contact,
            bank_details: formData.bank_details,
            manager_id: formData.manager_id || null,
            notes: formData.notes || null
          })
          .eq('id', editingEmployee.id);

        if (error) throw error;

        toast({
          title: "تم التحديث",
          description: "تم تحديث بيانات الموظف بنجاح"
        });
      } else {
        // إضافة موظف جديد (employee_code سيتم توليده تلقائياً)
        const insertData = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          position: formData.position,
          department: formData.department,
          hire_date: formData.hire_date,
          email: formData.email || null,
          phone: formData.phone || null,
          salary: formData.salary ? parseFloat(formData.salary) : null,
          hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
          employment_type: formData.employment_type,
          status: formData.status,
          notes: formData.notes || null
        };

        // إضافة موظف جديد (employee_code سيتم توليده تلقائياً بالتريجر)
        const { error } = await supabase
          .from('aroma_employees')
          .insert(insertData as any);

        if (error) throw error;

        toast({
          title: "تم الإضافة",
          description: "تم إضافة الموظف بنجاح"
        });
      }

      setDialogOpen(false);
      resetForm();
      fetchEmployees();
    } catch (error) {
      console.error('Error saving employee:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في حفظ بيانات الموظف",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (employee: AromaEmployee) => {
    setEditingEmployee(employee);
    setFormData({
      first_name: employee.first_name,
      last_name: employee.last_name,
      email: employee.email || '',
      phone: employee.phone || '',
      gender: employee.gender || 'male',
      date_of_birth: employee.date_of_birth || '',
      national_id: employee.national_id || '',
      position: employee.position,
      department: employee.department,
      salary: employee.salary?.toString() || '',
      hourly_rate: employee.hourly_rate?.toString() || '',
      employment_type: employee.employment_type,
      hire_date: employee.hire_date,
      status: employee.status,
      address: employee.address || {
        street: '',
        city: '',
        state: '',
        postal_code: ''
      },
      emergency_contact: employee.emergency_contact || {
        name: '',
        phone: '',
        relationship: ''
      },
      bank_details: employee.bank_details || {
        bank_name: '',
        account_number: '',
        iban: ''
      },
      manager_id: employee.manager_id || '',
      notes: employee.notes || ''
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الموظف؟')) return;

    try {
      const { error } = await supabase
        .from('aroma_employees')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "تم الحذف",
        description: "تم حذف الموظف بنجاح"
      });

      fetchEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في حذف الموظف",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      gender: 'male',
      date_of_birth: '',
      national_id: '',
      position: '',
      department: 'sales',
      salary: '',
      hourly_rate: '',
      employment_type: 'full_time',
      hire_date: new Date().toISOString().split('T')[0],
      status: 'active',
      address: {
        street: '',
        city: '',
        state: '',
        postal_code: ''
      },
      emergency_contact: {
        name: '',
        phone: '',
        relationship: ''
      },
      bank_details: {
        bank_name: '',
        account_number: '',
        iban: ''
      },
      manager_id: '',
      notes: ''
    });
    setEditingEmployee(null);
  };

  // Filter employees
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      emp.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employee_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.email && emp.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDepartment = filterDepartment === 'all' || emp.department === filterDepartment;
    
    return matchesSearch && matchesDepartment;
  });

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-6 h-6" />
            إدارة الموظفين
          </h2>
          <p className="text-muted-foreground">
            {employees.length} موظف • {employees.filter(e => e.status === 'active').length} نشط
          </p>
        </div>

        <div className="flex gap-2">
          <div className="flex gap-2">
            <Input
              placeholder="البحث..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-48"
            />
            
            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأقسام</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept.value} value={dept.value}>
                    {dept.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()} className="gap-2">
                <Plus className="w-4 h-4" />
                إضافة موظف جديد
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingEmployee ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد'}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* المعلومات الشخصية */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">المعلومات الشخصية</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>الاسم الأول *</Label>
                      <Input
                        value={formData.first_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label>اسم العائلة *</Label>
                      <Input
                        value={formData.last_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label>البريد الإلكتروني</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>رقم الهاتف</Label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>الجنس</Label>
                      <Select 
                        value={formData.gender} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">ذكر</SelectItem>
                          <SelectItem value="female">أنثى</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>تاريخ الميلاد</Label>
                      <Input
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                {/* معلومات العمل */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">معلومات العمل</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>القسم *</Label>
                      <Select 
                        value={formData.department} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map(dept => (
                            <SelectItem key={dept.value} value={dept.value}>
                              {dept.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>المنصب *</Label>
                      <Select 
                        value={formData.position} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, position: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {positions.map(pos => (
                            <SelectItem key={pos.value} value={pos.value}>
                              {pos.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>نوع التوظيف</Label>
                      <Select 
                        value={formData.employment_type} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, employment_type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full_time">دوام كامل</SelectItem>
                          <SelectItem value="part_time">دوام جزئي</SelectItem>
                          <SelectItem value="contract">تعاقد</SelectItem>
                          <SelectItem value="freelance">عمل حر</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>تاريخ التوظيف *</Label>
                      <Input
                        type="date"
                        value={formData.hire_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, hire_date: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label>الراتب الشهري</Label>
                      <Input
                        type="number"
                        value={formData.salary}
                        onChange={(e) => setFormData(prev => ({ ...prev, salary: e.target.value }))}
                        placeholder="50000"
                      />
                    </div>
                    <div>
                      <Label>أجر الساعة</Label>
                      <Input
                        type="number"
                        value={formData.hourly_rate}
                        onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: e.target.value }))}
                        placeholder="500"
                      />
                    </div>
                  </div>
                </div>

                {/* معلومات إضافية */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">معلومات إضافية</h3>
                  <div>
                    <Label>ملاحظات</Label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingEmployee ? 'تحديث البيانات' : 'إضافة الموظف'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setDialogOpen(false)}
                  >
                    إلغاء
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* جدول الموظفين */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>كود الموظف</TableHead>
                <TableHead>الاسم</TableHead>
                <TableHead>القسم</TableHead>
                <TableHead>المنصب</TableHead>
                <TableHead>الهاتف</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-mono">
                    {employee.employee_code}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {employee.first_name} {employee.last_name}
                      </p>
                      {employee.email && (
                        <p className="text-sm text-muted-foreground">{employee.email}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {departments.find(d => d.value === employee.department)?.label || employee.department}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {positions.find(p => p.value === employee.position)?.label || employee.position}
                  </TableCell>
                  <TableCell>{employee.phone || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                      {employee.status === 'active' ? 'نشط' : 'غير نشط'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(employee)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(employee.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeManager;