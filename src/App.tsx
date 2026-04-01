import React, { useState, useEffect } from 'react';
const API_URL = "https://human-resources-management-website-app.onrender.com";
import { 
  Users, 
  LayoutDashboard, 
  CreditCard, 
  BarChart3, 
  Settings, 
  LogOut, 
  Plus, 
  Search,
  ChevronRight,
  TrendingUp,
  DollarSign,
  UserPlus,
  FileText,
  Download,
  MoreVertical,
  Briefcase,
  Calendar as CalendarIcon,
  ChevronLeft,
  Info,
  Trash2,
  Filter,
  Camera,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  format, 
  addMonths, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  differenceInMonths, 
  parseISO, 
  startOfYear, 
  endOfYear, 
  eachMonthOfInterval,
  isWithinInterval,
  getDaysInMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth
} from 'date-fns';
import { cn } from './lib/utils';
import { Employee, Payslip, DashboardStats, Leave } from './types';

// --- Components ---

const DEPARTMENTS = ['Management', 'Interior Design', 'Exterior-Architecture', 'Other', 'Photo-Video Editing'];
const CURRENCY = 'VND';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200",
      active 
        ? "bg-black text-white shadow-lg shadow-black/10" 
        : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
    )}
  >
    <Icon size={20} />
    <span className="font-medium text-sm">{label}</span>
  </button>
);

const StatCard = ({ label, value, icon: Icon, trend, color }: { label: string, value: string | number, icon: any, trend?: string, color: string }) => (
  <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className={cn("p-2.5 rounded-xl", color)}>
        <Icon size={22} className="text-white" />
      </div>
      {trend && (
        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
          {trend}
        </span>
      )}
    </div>
    <p className="text-zinc-500 text-sm font-medium mb-1">{label}</p>
    <h3 className="text-2xl font-bold text-zinc-900">{value}</h3>
  </div>
);

const LoginScreen = ({ onLogin }: { onLogin: (user: Employee) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onLogin(data.user);
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-zinc-100">
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-2xl">T</span>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center mb-2">Welcome Back</h2>
        <p className="text-zinc-500 text-center mb-8">Sign in to TL Concepts HR Admin</p>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
              placeholder="tenho@tlconceptsltd.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-xl font-medium hover:bg-zinc-800 transition-colors disabled:opacity-70"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('app_is_logged_in') === 'true';
  });
  const [currentUser, setCurrentUser] = useState<Employee | null>(() => {
    const saved = localStorage.getItem('app_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (user: Employee) => {
    setIsLoggedIn(true);
    setCurrentUser(user);
    localStorage.setItem('app_is_logged_in', 'true');
    localStorage.setItem('app_current_user', JSON.stringify(user));
  };

  const closeSettingsModal = () => {
    setShowSettingsModal(false);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordError('');
    setPasswordSuccess('');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem('app_is_logged_in');
    localStorage.removeItem('app_current_user');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 1) {
      setPasswordError('Password cannot be empty');
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await fetch(`/api/employees/${currentUser?.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to change password');
      }

      setPasswordSuccess('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setPasswordError(err.message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const [activeTab, setActiveTab] = useState<'dashboard' | 'employees' | 'payroll' | 'reports' | 'leaves'>(() => {
    const saved = localStorage.getItem('app_active_tab');
    const validTabs = ['dashboard', 'employees', 'payroll', 'reports', 'leaves'];
    return (saved && validTabs.includes(saved)) ? (saved as any) : 'dashboard';
  });

  useEffect(() => {
    localStorage.setItem('app_active_tab', activeTab);
  }, [activeTab]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const userRole = currentUser?.role || 'staff';

  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showEmployeeDetailsModal, setShowEmployeeDetailsModal] = useState(false);
  const [selectedEmployeeDetails, setSelectedEmployeeDetails] = useState<Employee | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [showPayslipModal, setShowPayslipModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [language, setLanguage] = useState<'en' | 'vi'>(() => {
    const saved = localStorage.getItem('app_language');
    return (saved === 'en' || saved === 'vi') ? saved : 'en';
  });

  useEffect(() => {
    localStorage.setItem('app_language', language);
  }, [language]);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    department: '',
    joinYear: '',
    salaryRange: ''
  });
  const [newLeave, setNewLeave] = useState({ employee_id: '', start_date: '', end_date: '', reason: '' });
  const [newPayslip, setNewPayslip] = useState({
    employee_id: '',
    month: format(new Date(), 'MMMM'),
    year: new Date().getFullYear(),
    basic_salary: 0,
    bonuses: 0,
    deductions: 0
  });
  const [showIncompleteWarningModal, setShowIncompleteWarningModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({
    full_name: '', dob: '', address: '', phone: '', email: '', password: '',
    cccd_number: '', cccd_issue_date: '', id_issue_place: '',
    contract_number: '', contract_sign_date: '', contract_start_date: '', contract_end_date: '', contract_type: 'probation',
    role: 'staff', department: '', job_title: '', manager_id: undefined, status: 'probation',
    join_date: format(new Date(), 'yyyy-MM-dd'), net_salary: 0,
    salary_effective_date: '', salary_notes: '', annual_leave_balance: 12, notes: '',
    cccd_front_image: '', cccd_back_image: '', avatar: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for incomplete optional fields
    const optionalFields = [
      'address', 'id_issue_place', 'contract_number', 'contract_sign_date', 
      'contract_start_date', 'job_title', 'department', 'salary_effective_date'
    ];
    
    const isIncomplete = optionalFields.some(field => {
      const val = newEmployee[field as keyof Employee];
      return val === undefined || val === null || val === '';
    }) || !newEmployee.net_salary;

    if (isIncomplete) {
      setShowIncompleteWarningModal(true);
      return;
    }
    
    await proceedSaveEmployee();
  };

  const proceedSaveEmployee = async () => {
    try {
      const url = isEditing ? `/api/employees/${newEmployee.id}` : '/api/employees';
      const method = isEditing ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmployee)
      });
      if (res.ok) {
        setShowEmployeeModal(false);
        setShowIncompleteWarningModal(false);
        setIsEditing(false);
        resetEmployeeForm();
        fetchData();
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (error) {
      console.error("Error saving employee:", error);
    }
  };

  const resetEmployeeForm = () => {
    setNewEmployee({
      full_name: '', dob: '', address: '', phone: '', email: '', password: '',
      cccd_number: '', cccd_issue_date: '', id_issue_place: '',
      contract_number: '', contract_sign_date: '', contract_start_date: '', contract_end_date: '', contract_type: 'probation',
      role: 'staff', department: '', job_title: '', manager_id: undefined, status: 'probation',
      join_date: format(new Date(), 'yyyy-MM-dd'), net_salary: 0,
      salary_effective_date: '', salary_notes: '', annual_leave_balance: 12, notes: '',
      cccd_front_image: '', cccd_back_image: '', avatar: ''
    });
  };

  const handleEditClick = (employee: Employee) => {
    setNewEmployee(employee);
    setIsEditing(true);
    setShowEmployeeModal(true);
  };

  const handleDeleteClick = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setShowDeleteModal(true);
  };

  const confirmDeleteEmployee = async () => {
    if (!employeeToDelete) return;
    
    try {
      const res = await fetch(`/api/employees/${employeeToDelete.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setShowDeleteModal(false);
        setEmployeeToDelete(null);
        fetchData();
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (error) {
      console.error("Error deleting employee:", error);
    }
  };

  const handleGeneratePayslip = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/payslips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPayslip)
      });
      if (res.ok) {
        setShowPayslipModal(false);
        setNewPayslip({
          employee_id: '',
          month: format(new Date(), 'MMMM'),
          year: new Date().getFullYear(),
          basic_salary: 0,
          bonuses: 0,
          deductions: 0
        });
        fetchData();
      }
    } catch (error) {
      console.error("Error generating payslip:", error);
    }
  };

  const handleRequestLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/leaves`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLeave)
      });
      if (res.ok) {
        setShowLeaveModal(false);
        setNewLeave({ employee_id: '', start_date: '', end_date: '', reason: '' });
        fetchData();
      }
    } catch (error) {
      console.error("Error requesting leave:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'cccd_front_image' | 'cccd_back_image' | 'avatar') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewEmployee(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         emp.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         emp.job_title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = !filters.role || emp.role === filters.role;
    const matchesDept = !filters.department || emp.department === filters.department;
    const matchesYear = !filters.joinYear || new Date(emp.join_date).getFullYear().toString() === filters.joinYear;
    
    let matchesSalary = true;
    if (filters.salaryRange) {
      const salary = emp.net_salary;
      switch (filters.salaryRange) {
        case '<10': matchesSalary = salary < 10000000; break;
        case '10-20': matchesSalary = salary >= 10000000 && salary < 20000000; break;
        case '20-30': matchesSalary = salary >= 20000000 && salary < 30000000; break;
        case '30-40': matchesSalary = salary >= 30000000 && salary < 40000000; break;
        case '40-50': matchesSalary = salary >= 40000000 && salary < 50000000; break;
        case '>50': matchesSalary = salary >= 50000000; break;
      }
    }

    return matchesSearch && matchesRole && matchesDept && matchesYear && matchesSalary;
  });

  const departments = Array.from(new Set(employees.map(e => e.department))).filter(Boolean).sort() as string[];
  const joinYears = Array.from(new Set(
    employees
      .map(e => e.join_date ? new Date(e.join_date).getFullYear().toString() : null)
      .filter(y => y && y !== 'NaN')
  )).sort((a, b) => (b as string).localeCompare(a as string)) as string[];

  const formatFullName = (value: string) => {
    return value
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const translations = {
    en: {
      dashboard: 'Dashboard',
      employees: 'Employees',
      payroll: 'Payroll',
      leave: 'Leave',
      reports: 'Reports',
      settings: 'Settings',
      search: 'Search anything...',
      language: 'Language',
      totalEmployees: 'Total Employees',
      monthlyPayroll: 'Monthly Payroll',
      newHires: 'New Hires',
      openPositions: 'Open Positions',
      payrollOverview: 'Payroll Overview',
      deptSplit: 'Department Split',
      addEmployee: 'Add Employee',
      filter: 'Filter',
      searchPlaceholder: 'Search by name, department, or title...',
      employee: 'Employee',
      department: 'Department',
      role: 'Role',
      joinDate: 'Join Date',
      salary: 'Salary',
      action: 'Action',
      logout: 'Logout',
      cancel: 'Cancel',
      save: 'Save Changes',
      delete: 'Delete',
      confirmDelete: 'Confirm Deletion',
      deleteWarning: 'Are you sure you want to delete',
      undoneWarning: 'This action cannot be undone and will remove all associated records.',
      personalInfo: 'Personal Information',
      identificationInfo: 'Identification Information',
      contractInfo: 'Employment Contract Information',
      jobInfo: 'Job Information',
      salaryInfo: 'Salary Information',
      leaveInfo: 'Leave Information',
      additionalNotes: 'Additional Notes',
      fullName: 'Full Name',
      dob: 'Date of Birth',
      address: 'Address',
      phone: 'Phone Number',
      nationalId: 'National ID (CCCD)',
      idIssueDate: 'ID Issue Date',
      idIssuePlace: 'ID Issue Place',
      cccdFront: 'CCCD Front Image',
      cccdBack: 'CCCD Back Image',
      contractNumber: 'Contract Number (HĐLĐ)',
      signingDate: 'Signing Date',
      contractType: 'Contract Type',
      startDate: 'Start Date',
      endDate: 'End Date (Optional)',
      jobPosition: 'Job Position',
      employmentStatus: 'Employment Status',
      manager: 'Manager / Supervisor',
      netSalary: 'Net Salary',
      effectiveDate: 'Effective Date',
      salaryNotes: 'Salary Notes',
      totalAnnualLeave: 'Total Annual Leave Balance',
      leaveAutoCalc: '* Leave used and remaining will be auto-calculated.',
      notesPlaceholder: 'Any other remarks...',
      selectDept: 'Select Department',
      none: 'None',
      joinYear: 'Join Year',
      salaryRange: 'Salary Range',
      avatar: 'Avatar (Optional)',
      uploadAvatar: 'Upload Avatar',
      incompleteWarningTitle: 'Notice',
      incompleteWarningMessage: 'Information incomplete, are you sure you want to save?',
      no: 'No',
      yes: 'Yes'
    },
    vi: {
      dashboard: 'Bảng điều khiển',
      employees: 'Nhân viên',
      payroll: 'Bảng lương',
      leave: 'Nghỉ phép',
      reports: 'Báo cáo',
      settings: 'Cài đặt',
      search: 'Tìm kiếm...',
      language: 'Ngôn ngữ',
      totalEmployees: 'Tổng nhân viên',
      monthlyPayroll: 'Lương hàng tháng',
      newHires: 'Nhân viên mới',
      openPositions: 'Vị trí trống',
      payrollOverview: 'Tổng quan lương',
      deptSplit: 'Phân bổ phòng ban',
      addEmployee: 'Thêm nhân viên',
      filter: 'Lọc',
      searchPlaceholder: 'Tìm theo tên, phòng ban hoặc chức danh...',
      employee: 'Nhân viên',
      department: 'Phòng ban',
      role: 'Vai trò',
      joinDate: 'Ngày tham gia',
      salary: 'Lương',
      action: 'Thao tác',
      logout: 'Đăng xuất',
      cancel: 'Hủy',
      save: 'Lưu thay đổi',
      delete: 'Xóa',
      confirmDelete: 'Xác nhận xóa',
      deleteWarning: 'Bạn có chắc chắn muốn xóa',
      undoneWarning: 'Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan.',
      personalInfo: 'Thông tin cá nhân',
      identificationInfo: 'Thông tin định danh',
      contractInfo: 'Thông tin hợp đồng lao động',
      jobInfo: 'Thông tin công việc',
      salaryInfo: 'Thông tin lương',
      leaveInfo: 'Thông tin nghỉ phép',
      additionalNotes: 'Ghi chú thêm',
      fullName: 'Họ và tên',
      dob: 'Ngày sinh',
      address: 'Địa chỉ',
      phone: 'Số điện thoại',
      nationalId: 'Số CCCD',
      idIssueDate: 'Ngày cấp',
      idIssuePlace: 'Nơi cấp',
      cccdFront: 'Mặt trước CCCD',
      cccdBack: 'Mặt sau CCCD',
      contractNumber: 'Số hợp đồng (HĐLĐ)',
      signingDate: 'Ngày ký',
      contractType: 'Loại hợp đồng',
      startDate: 'Ngày bắt đầu',
      endDate: 'Ngày kết thúc (Tùy chọn)',
      jobPosition: 'Vị trí công việc',
      employmentStatus: 'Trạng thái nhân viên',
      manager: 'Quản lý / Giám sát',
      netSalary: 'Lương thực nhận',
      effectiveDate: 'Ngày hiệu lực',
      salaryNotes: 'Ghi chú lương',
      totalAnnualLeave: 'Tổng số ngày phép năm',
      leaveAutoCalc: '* Số ngày đã nghỉ và còn lại sẽ được tự động tính toán.',
      notesPlaceholder: 'Bất kỳ nhận xét nào khác...',
      selectDept: 'Chọn phòng ban',
      none: 'Không có',
      joinYear: 'Năm gia nhập',
      salaryRange: 'Mức lương',
      avatar: 'Ảnh đại diện (Tùy chọn)',
      uploadAvatar: 'Tải ảnh đại diện',
      incompleteWarningTitle: 'Thông báo',
      incompleteWarningMessage: 'Thông tin chưa đầy đủ, bạn có chắc muốn lưu không?',
      no: 'Không',
      yes: 'Có'
    }
  };

  const getChartData = () => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = addMonths(new Date(), -i);
      return {
        month: format(d, 'MMM'),
        monthFull: format(d, 'MMMM'),
        year: d.getFullYear()
      };
    }).reverse();

    return last6Months.map(m => {
      const monthlyTotal = payslips
        .filter(p => p.month === m.monthFull && p.year === m.year)
        .reduce((sum, p) => sum + p.net_salary, 0);
      return {
        name: m.month,
        amount: monthlyTotal
      };
    });
  };

  const newHiresCount = employees.filter(emp => {
    const joinDate = parseISO(emp.join_date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return joinDate >= thirtyDaysAgo;
  }).length;

  const t = translations[language];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empRes, statsRes, payRes, leaveRes] = await Promise.all([
        fetch(`${API_URL}/api/employees`),
        fetch(`${API_URL}/api/stats`),
        fetch(`${API_URL}/api/payslips`),
        fetch(`${API_URL}/api/leaves`)
      ]);
      
      const empData = await empRes.json();
      const statsData = await statsRes.json();
      const payData = await payRes.json();
      const leaveData = await leaveRes.json();

      setEmployees(empData);
      setStats(statsData);
      setPayslips(payData);
      setLeaves(leaveData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateLeaveBalance = (employee: Employee) => {
    const joinDate = parseISO(employee.join_date);
    const now = new Date();
    const monthsWorked = differenceInMonths(now, joinDate);
    // 1 day per month, max total_annual_leave (default 12)
    const accrued = Math.min(Math.max(0, monthsWorked), employee.annual_leave_balance || 12); 
    
    const used = leaves
      .filter(l => l.employee_id === employee.id && l.status === 'approved')
      .reduce((acc, l) => {
        const start = parseISO(l.start_date);
        const end = parseISO(l.end_date);
        const days = eachDayOfInterval({ start, end }).length;
        return acc + days;
      }, 0);

    return { accrued, used, balance: accrued - used, total: employee.annual_leave_balance || 12 };
  };

  const exportLeaveReport = (employee: Employee) => {
    const { accrued, used, balance } = calculateLeaveBalance(employee);
    const employeeLeaves = leaves.filter(l => l.employee_id === employee.id && l.status === 'approved');
    
    let report = `LEAVE USAGE REPORT - ${currentYear}\n`;
    report += `-----------------------------------\n`;
    report += `Employee: ${employee.full_name}\n`;
    report += `Department: ${employee.department}\n`;
    report += `Join Date: ${format(parseISO(employee.join_date), 'MMM dd, yyyy')}\n`;
    report += `-----------------------------------\n`;
    report += `Accrued Leave: ${accrued} Days\n`;
    report += `Used Leave: ${used} Days\n`;
    report += `Remaining Balance: ${balance} Days\n`;
    report += `-----------------------------------\n\n`;
    report += `DETAILED LEAVE HISTORY:\n`;
    report += `Period | Reason | Days\n`;
    
    employeeLeaves.forEach(l => {
      const start = parseISO(l.start_date);
      const end = parseISO(l.end_date);
      const days = eachDayOfInterval({ start, end }).length;
      report += `${format(start, 'MMM dd')} - ${format(end, 'MMM dd, yyyy')} | ${l.reason} | ${days} day(s)\n`;
    });

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Leave_Report_${employee.full_name.replace(/\s+/g, '_')}_${currentYear}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const COLORS = ['#000000', '#4F46E5', '#10B981', '#F59E0B', '#EF4444'];

  const renderCalendarMonth = (monthDate: Date) => {
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div key={monthDate.toString()} className="bg-white p-4 rounded-xl border border-zinc-100 shadow-sm">
        <h4 className="font-bold text-sm mb-3 text-center text-zinc-900">{format(monthDate, 'MMMM')}</h4>
        <div className="grid grid-cols-7 gap-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={`${d}-${i}`} className="text-[10px] font-bold text-zinc-400 text-center py-1">{d}</div>
          ))}
          {days.map(day => {
            const isCurrentMonth = isSameMonth(day, monthStart);
            const dayLeaves = leaves.filter(l => 
              isWithinInterval(day, { start: parseISO(l.start_date), end: parseISO(l.end_date) })
            );
            
            return (
              <div 
                key={day.toString()} 
                className={cn(
                  "h-6 flex items-center justify-center rounded-md text-[10px] relative group cursor-default",
                  !isCurrentMonth ? "text-zinc-200" : "text-zinc-600",
                  dayLeaves.length > 0 && isCurrentMonth ? "bg-red-50 text-red-600 font-bold" : ""
                )}
              >
                {format(day, 'd')}
                {dayLeaves.length > 0 && isCurrentMonth && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20 w-32 bg-zinc-900 text-white p-2 rounded-lg text-[9px] shadow-xl">
                    {dayLeaves.map(l => (
                      <div key={l.id} className="border-b border-white/10 last:border-0 py-1">
                        <p className="font-bold">{l.employee_name}</p>
                        <p className="opacity-70">{l.reason}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-[#F9FAFB] text-zinc-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-200 bg-white flex flex-col p-6">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">T</span>
          </div>
          <h1 className="font-bold text-xl tracking-tight">TL Concepts</h1>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarItem 
            icon={LayoutDashboard} 
            label={t.dashboard} 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <SidebarItem 
            icon={Users} 
            label={t.employees} 
            active={activeTab === 'employees'} 
            onClick={() => setActiveTab('employees')} 
          />
          <SidebarItem 
            icon={CalendarIcon} 
            label={t.leave} 
            active={activeTab === 'leaves'} 
            onClick={() => setActiveTab('leaves')} 
          />
          <SidebarItem 
            icon={CreditCard} 
            label={t.payroll} 
            active={activeTab === 'payroll'} 
            onClick={() => setActiveTab('payroll')} 
          />
          <SidebarItem 
            icon={BarChart3} 
            label={t.reports} 
            active={activeTab === 'reports'} 
            onClick={() => setActiveTab('reports')} 
          />
        </nav>

        <div className="pt-6 border-t border-zinc-100 mt-auto">
          <div className="flex items-center gap-3 px-2 mb-6">
            <div className="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center overflow-hidden">
              <img src={currentUser?.avatar || "https://picsum.photos/seed/admin/100/100"} alt="Avatar" referrerPolicy="no-referrer" />
            </div>
            <div>
              <p className="text-sm font-bold">{currentUser?.full_name || 'Admin User'}</p>
              <p className="text-xs text-zinc-500 capitalize">{userRole}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-zinc-500 hover:bg-red-50 hover:text-red-600 transition-all">
            <LogOut size={20} />
            <span className="font-medium text-sm">{t.logout}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-20 border-b border-zinc-200 bg-white/80 backdrop-blur-md sticky top-0 z-10 px-8 flex items-center justify-between">
          <h2 className="text-xl font-bold capitalize">{t[activeTab as keyof typeof t] || activeTab}</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input 
                type="text" 
                placeholder={t.search} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-zinc-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-black/5 outline-none w-64"
              />
            </div>
            <button 
              onClick={() => setShowSettingsModal(true)}
              className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-500 transition-colors"
            >
              <Settings size={20} />
            </button>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard 
                    label={t.totalEmployees} 
                    value={stats?.totalEmployees || 0} 
                    icon={Users} 
                    trend="+12%" 
                    color="bg-black" 
                  />
                  <StatCard 
                    label={t.monthlyPayroll} 
                    value={formatCurrency(stats?.totalSalary || 0)} 
                    icon={DollarSign} 
                    trend="+4.5%" 
                    color="bg-indigo-600" 
                  />
                  <StatCard 
                    label={t.newHires} 
                    value={newHiresCount} 
                    icon={UserPlus} 
                    color="bg-emerald-600" 
                  />
                  <StatCard 
                    label={t.openPositions} 
                    value="2" 
                    icon={Briefcase} 
                    color="bg-amber-500" 
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Chart */}
                  <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="font-bold text-lg">{t.payrollOverview}</h3>
                      <select className="text-sm border-none bg-zinc-100 rounded-lg px-3 py-1.5 outline-none">
                        <option>Last 6 Months</option>
                        <option>Last Year</option>
                      </select>
                    </div>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getChartData()}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10 }} tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`} />
                          <Tooltip 
                            cursor={{ fill: '#F9FAFB' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            formatter={(value: number) => [formatCurrency(value), 'Amount']}
                          />
                          <Bar dataKey="amount" fill="#000000" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Distribution */}
                  <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
                    <h3 className="font-bold text-lg mb-8">{t.deptSplit}</h3>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats?.deptDistribution || []}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="count"
                            nameKey="department"
                          >
                            {(stats?.deptDistribution || []).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-3 mt-4">
                      {(stats?.deptDistribution || []).map((dept, i) => (
                        <div key={dept.department} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                            <span className="text-zinc-500">{dept.department}</span>
                          </div>
                          <span className="font-bold">{dept.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                    <h3 className="font-bold text-lg">Recent Payslips</h3>
                    <button className="text-sm font-medium text-zinc-500 hover:text-black">View All</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-zinc-50/50 text-zinc-500 text-xs uppercase tracking-wider">
                          <th className="px-6 py-4 font-semibold">Employee</th>
                          <th className="px-6 py-4 font-semibold">Period</th>
                          <th className="px-6 py-4 font-semibold">Amount</th>
                          <th className="px-6 py-4 font-semibold">Status</th>
                          <th className="px-6 py-4 font-semibold text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {payslips.slice(0, 5).map((slip) => (
                          <tr key={slip.id} className="hover:bg-zinc-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-bold">
                                  {slip.employee_name?.charAt(0)}
                                </div>
                                <span className="font-medium text-sm">{slip.employee_name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-zinc-500">
                              {slip.month} {slip.year}
                            </td>
                            <td className="px-6 py-4 text-sm font-bold">
                              {formatCurrency(slip.net_salary)}
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase">
                                Paid
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-400">
                                <Download size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'employees' && (
              <motion.div
                key="employees"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">Employee Directory</h3>
                    <p className="text-zinc-500 text-sm">Manage your team members and their roles.</p>
                  </div>
                  {userRole === 'admin' && (
                    <button 
                      onClick={() => {
                        resetEmployeeForm();
                        setIsEditing(false);
                        setShowEmployeeModal(true);
                      }}
                      className="bg-black text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-black/10"
                    >
                      <UserPlus size={18} />
                      {t.addEmployee}
                    </button>
                  )}
                </div>

                {/* Add Employee Modal */}
                <AnimatePresence>
                  {showEmployeeModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowEmployeeModal(false)}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                      />
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-8"
                      >
                        <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                          <h3 className="text-xl font-bold">{isEditing ? (language === 'vi' ? 'Chỉnh sửa nhân viên' : 'Edit Employee') : t.addEmployee}</h3>
                          <button onClick={() => setShowEmployeeModal(false)} className="text-zinc-400 hover:text-black transition-colors">
                            <Plus size={24} className="rotate-45" />
                          </button>
                        </div>
                        
                        <form onSubmit={handleAddEmployee} className="p-8 space-y-8 max-h-[80vh] overflow-y-auto">
                          {/* 1. Personal Information */}
                          <section>
                            <h4 className="text-sm font-bold text-black uppercase tracking-wider mb-4 flex items-center gap-2">
                              <div className="w-1.5 h-4 bg-black rounded-full" />
                              1. {t.personalInfo}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="md:col-span-3 flex items-center gap-6 mb-2">
                                <div className="relative group">
                                  <div className="w-24 h-24 rounded-2xl bg-zinc-100 border-2 border-dashed border-zinc-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-black/20">
                                    {newEmployee.avatar ? (
                                      <img src={newEmployee.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                      <Camera size={32} className="text-zinc-300" />
                                    )}
                                    <input 
                                      type="file" 
                                      accept="image/*"
                                      onChange={(e) => handleFileChange(e, 'avatar')}
                                      className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                  </div>
                                  {newEmployee.avatar && (
                                    <button 
                                      type="button"
                                      onClick={() => setNewEmployee({...newEmployee, avatar: ''})}
                                      className="absolute -top-2 -right-2 p-1.5 bg-white border border-zinc-100 rounded-full text-red-600 shadow-sm hover:bg-red-50 transition-all"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  )}
                                </div>
                                <div>
                                  <h5 className="font-bold text-sm mb-1">{t.avatar}</h5>
                                  <p className="text-xs text-zinc-500">{language === 'vi' ? 'Tải lên ảnh chân dung nhân viên (không bắt buộc)' : 'Upload employee portrait (optional)'}</p>
                                </div>
                              </div>
                              <div className="md:col-span-1">
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">{t.fullName}</label>
                                <input 
                                  type="text" required
                                  value={newEmployee.full_name ?? ''}
                                  onChange={(e) => setNewEmployee({...newEmployee, full_name: formatFullName(e.target.value)})}
                                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black/5"
                                  placeholder="Nguyen Van A"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">{t.dob}</label>
                                <input 
                                  type="date" required
                                  value={newEmployee.dob ?? ''}
                                  onChange={(e) => setNewEmployee({...newEmployee, dob: e.target.value})}
                                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black/5"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Email</label>
                                <input 
                                  type="email" required
                                  value={newEmployee.email ?? ''}
                                  onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black/5"
                                  placeholder="tenho@tlconceptsltd.com"
                                />
                              </div>
                              {userRole === 'admin' && !isEditing && (
                                <div>
                                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Password</label>
                                  <input 
                                    type="password"
                                    value={newEmployee.password ?? ''}
                                    onChange={(e) => setNewEmployee({...newEmployee, password: e.target.value})}
                                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black/5"
                                    placeholder="Default is 1"
                                  />
                                </div>
                              )}
                              <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">{t.address}</label>
                                <input 
                                  type="text"
                                  value={newEmployee.address ?? ''}
                                  onChange={(e) => setNewEmployee({...newEmployee, address: e.target.value})}
                                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black/5"
                                  placeholder="123 Street, District, City"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">{t.phone}</label>
                                <input 
                                  type="text" required
                                  value={newEmployee.phone ?? ''}
                                  onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black/5"
                                  placeholder="0901234567"
                                />
                              </div>
                            </div>
                          </section>

                          {/* 2. Identification Information */}
                          <section>
                            <h4 className="text-sm font-bold text-black uppercase tracking-wider mb-4 flex items-center gap-2">
                              <div className="w-1.5 h-4 bg-black rounded-full" />
                              2. {t.identificationInfo}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">{t.nationalId}</label>
                                <input 
                                  type="text" required
                                  value={newEmployee.cccd_number ?? ''}
                                  onChange={(e) => setNewEmployee({...newEmployee, cccd_number: e.target.value})}
                                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black/5"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">{t.idIssueDate}</label>
                                <input 
                                  type="date" required
                                  value={newEmployee.cccd_issue_date ?? ''}
                                  onChange={(e) => setNewEmployee({...newEmployee, cccd_issue_date: e.target.value})}
                                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black/5"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">{t.idIssuePlace}</label>
                                <input 
                                  type="text"
                                  value={newEmployee.id_issue_place ?? ''}
                                  onChange={(e) => setNewEmployee({...newEmployee, id_issue_place: e.target.value})}
                                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black/5"
                                />
                              </div>
                              <div className="md:col-span-1">
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">{t.cccdFront}</label>
                                <div className="mt-1 flex flex-col gap-2">
                                  <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, 'cccd_front_image')}
                                    className="text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-black file:text-white hover:file:bg-zinc-800 cursor-pointer"
                                  />
                                  {newEmployee.cccd_front_image && (
                                    <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-zinc-200 bg-zinc-50">
                                      <img src={newEmployee.cccd_front_image} alt="CCCD Front" className="w-full h-full object-cover" />
                                      <button 
                                        type="button"
                                        onClick={() => setNewEmployee({...newEmployee, cccd_front_image: ''})}
                                        className="absolute top-2 right-2 p-1 bg-white/80 backdrop-blur-sm rounded-full text-red-600 hover:bg-white transition-all shadow-sm"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="md:col-span-1">
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">{t.cccdBack}</label>
                                <div className="mt-1 flex flex-col gap-2">
                                  <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, 'cccd_back_image')}
                                    className="text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-black file:text-white hover:file:bg-zinc-800 cursor-pointer"
                                  />
                                  {newEmployee.cccd_back_image && (
                                    <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-zinc-200 bg-zinc-50">
                                      <img src={newEmployee.cccd_back_image} alt="CCCD Back" className="w-full h-full object-cover" />
                                      <button 
                                        type="button"
                                        onClick={() => setNewEmployee({...newEmployee, cccd_back_image: ''})}
                                        className="absolute top-2 right-2 p-1 bg-white/80 backdrop-blur-sm rounded-full text-red-600 hover:bg-white transition-all shadow-sm"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </section>

                          {/* 3. Employment Contract Information */}
                          <section>
                            <h4 className="text-sm font-bold text-black uppercase tracking-wider mb-4 flex items-center gap-2">
                              <div className="w-1.5 h-4 bg-black rounded-full" />
                              3. {t.contractInfo}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">{t.contractNumber}</label>
                                <input 
                                  type="text"
                                  value={newEmployee.contract_number ?? ''}
                                  onChange={(e) => setNewEmployee({...newEmployee, contract_number: e.target.value})}
                                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black/5"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">{t.signingDate}</label>
                                <input 
                                  type="date"
                                  value={newEmployee.contract_sign_date ?? ''}
                                  onChange={(e) => setNewEmployee({...newEmployee, contract_sign_date: e.target.value})}
                                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black/5"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">{t.contractType}</label>
                                <select 
                                  value={newEmployee.contract_type ?? ''}
                                  onChange={(e) => setNewEmployee({...newEmployee, contract_type: e.target.value as any})}
                                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black/5"
                                >
                                  <option value="probation">{language === 'vi' ? 'Thử việc' : 'Probation'}</option>
                                  <option value="fixed-term">{language === 'vi' ? 'Có thời hạn' : 'Fixed-term'}</option>
                                  <option value="indefinite-term">{language === 'vi' ? 'Không thời hạn' : 'Indefinite-term'}</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">{t.startDate}</label>
                                <input 
                                  type="date"
                                  value={newEmployee.contract_start_date ?? ''}
                                  onChange={(e) => {
                                    setNewEmployee({...newEmployee, contract_start_date: e.target.value, join_date: e.target.value});
                                  }}
                                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black/5"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">{t.endDate}</label>
                                <input 
                                  type="date"
                                  value={newEmployee.contract_end_date ?? ''}
                                  onChange={(e) => setNewEmployee({...newEmployee, contract_end_date: e.target.value})}
                                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black/5"
                                />
                              </div>
                            </div>
                          </section>

                          {/* 4. Job Information */}
                          <section>
                            <h4 className="text-sm font-bold text-black uppercase tracking-wider mb-4 flex items-center gap-2">
                              <div className="w-1.5 h-4 bg-black rounded-full" />
                              4. {t.jobInfo}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">{t.jobPosition}</label>
                                <input 
                                  type="text"
                                  value={newEmployee.job_title ?? ''}
                                  onChange={(e) => setNewEmployee({...newEmployee, job_title: e.target.value})}
                                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black/5"
                                  placeholder="Developer, Designer, etc."
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">{t.department}</label>
                                <select 
                                  value={newEmployee.department ?? ''}
                                  onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})}
                                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black/5"
                                >
                                  <option value="">{t.selectDept}</option>
                                  {DEPARTMENTS.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">{t.employmentStatus}</label>
                                <select 
                                  value={newEmployee.status ?? ''}
                                  onChange={(e) => setNewEmployee({...newEmployee, status: e.target.value as any})}
                                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black/5"
                                >
                                  <option value="active">{language === 'vi' ? 'Đang làm việc' : 'Active'}</option>
                                  <option value="probation">{language === 'vi' ? 'Thử việc' : 'Probation'}</option>
                                  <option value="inactive">{language === 'vi' ? 'Đã nghỉ việc' : 'Inactive'}</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">{t.role}</label>
                                <select 
                                  value={newEmployee.role ?? 'staff'}
                                  onChange={(e) => setNewEmployee({...newEmployee, role: e.target.value as any})}
                                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black/5"
                                >
                                  <option value="staff">{language === 'vi' ? 'Nhân viên' : 'Staff'}</option>
                                  <option value="admin">{language === 'vi' ? 'Quản trị viên' : 'Admin'}</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">{t.manager}</label>
                                <select 
                                  value={newEmployee.manager_id ?? ''}
                                  onChange={(e) => setNewEmployee({...newEmployee, manager_id: Number(e.target.value) || undefined})}
                                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black/5"
                                >
                                  <option value="">{t.none}</option>
                                  {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </section>

                          {/* 5. Salary Information */}
                          <section>
                            <h4 className="text-sm font-bold text-black uppercase tracking-wider mb-4 flex items-center gap-2">
                              <div className="w-1.5 h-4 bg-black rounded-full" />
                              5. {t.salaryInfo}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">{t.netSalary}</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-[10px] font-bold">VND</span>
                              <input 
                                type="number"
                                value={newEmployee.net_salary ?? 0}
                                onChange={(e) => setNewEmployee({...newEmployee, net_salary: Number(e.target.value)})}
                                className="w-full pl-12 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black/5"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">{t.effectiveDate}</label>
                            <input 
                              type="date"
                              value={newEmployee.salary_effective_date ?? ''}
                              onChange={(e) => setNewEmployee({...newEmployee, salary_effective_date: e.target.value})}
                              className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black/5"
                            />
                          </div>
                          <div className="md:col-span-1">
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">{t.salaryNotes}</label>
                            <input 
                              type="text"
                              value={newEmployee.salary_notes ?? ''}
                              onChange={(e) => setNewEmployee({...newEmployee, salary_notes: e.target.value})}
                              className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black/5"
                            />
                          </div>
                        </div>
                      </section>

                      {/* 6. Leave Information */}
                      <section>
                        <h4 className="text-sm font-bold text-black uppercase tracking-wider mb-4 flex items-center gap-2">
                          <div className="w-1.5 h-4 bg-black rounded-full" />
                          6. {t.leaveInfo}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">{t.totalAnnualLeave}</label>
                            <input 
                              type="number"
                              value={newEmployee.annual_leave_balance ?? 0}
                              onChange={(e) => setNewEmployee({...newEmployee, annual_leave_balance: Number(e.target.value)})}
                              className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black/5"
                            />
                          </div>
                          <div className="flex items-end pb-2">
                            <p className="text-xs text-zinc-400 italic">{t.leaveAutoCalc}</p>
                          </div>
                        </div>
                      </section>

                      {/* 7. Additional Notes */}
                      <section>
                        <h4 className="text-sm font-bold text-black uppercase tracking-wider mb-4 flex items-center gap-2">
                          <div className="w-1.5 h-4 bg-black rounded-full" />
                          7. {t.additionalNotes}
                        </h4>
                        <textarea 
                          value={newEmployee.notes ?? ''}
                          onChange={(e) => setNewEmployee({...newEmployee, notes: e.target.value})}
                          className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black/5 min-h-[120px]"
                          placeholder={t.notesPlaceholder}
                        />
                      </section>

                      <div className="pt-6 flex gap-4 border-t border-zinc-100">
                        <button 
                          type="button"
                          onClick={() => setShowEmployeeModal(false)}
                          className="flex-1 px-6 py-3 border border-zinc-200 rounded-xl text-sm font-bold hover:bg-zinc-50 transition-all"
                        >
                          {t.cancel}
                        </button>
                        <button 
                          type="submit"
                          className="flex-1 bg-black text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-black/10"
                        >
                          {isEditing ? t.save : t.addEmployee}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

                <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-zinc-100 flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                        <input 
                          type="text" 
                          placeholder="Search by name, department, or title..." 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-black/5 outline-none"
                        />
                      </div>
                      <button 
                        onClick={() => setShowFilterPanel(!showFilterPanel)}
                        className={cn(
                          "px-4 py-2 border rounded-xl text-sm font-medium transition-all flex items-center gap-2",
                          showFilterPanel ? "bg-black text-white border-black" : "border-zinc-200 hover:bg-zinc-50"
                        )}
                      >
                        <Filter size={16} />
                        {t.filter}
                      </button>
                    </div>

                    {showFilterPanel && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2 border-t border-zinc-50"
                      >
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">{t.role}</label>
                          <select 
                            value={filters.role ?? ''}
                            onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                            className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs outline-none"
                          >
                            <option value="">{language === 'vi' ? 'Tất cả vai trò' : 'All Roles'}</option>
                            <option value="admin">{language === 'vi' ? 'Quản trị viên' : 'Admin'}</option>
                            <option value="staff">{language === 'vi' ? 'Nhân viên' : 'Staff'}</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">{t.department}</label>
                          <select 
                            value={filters.department ?? ''}
                            onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                            className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs outline-none"
                          >
                            <option value="">{language === 'vi' ? 'Tất cả phòng ban' : 'All Departments'}</option>
                            {departments.map(dept => (
                              <option key={dept} value={dept}>{dept}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">{t.joinYear}</label>
                          <select 
                            value={filters.joinYear ?? ''}
                            onChange={(e) => setFilters(prev => ({ ...prev, joinYear: e.target.value }))}
                            className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs outline-none"
                          >
                            <option value="">{language === 'vi' ? 'Tất cả các năm' : 'All Years'}</option>
                            {joinYears.map(year => (
                              <option key={year} value={year}>{year}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">{t.salaryRange}</label>
                          <select 
                            value={filters.salaryRange ?? ''}
                            onChange={(e) => setFilters(prev => ({ ...prev, salaryRange: e.target.value }))}
                            className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs outline-none"
                          >
                            <option value="">{language === 'vi' ? 'Tất cả mức lương' : 'All Salaries'}</option>
                            <option value="<10">{language === 'vi' ? 'Dưới 10tr' : 'Under 10M'}</option>
                            <option value="10-20">10M - 20M</option>
                            <option value="20-30">20M - 30M</option>
                            <option value="30-40">30M - 40M</option>
                            <option value="40-50">40M - 50M</option>
                            <option value=">50">{language === 'vi' ? 'Trên 50tr' : 'Over 50M'}</option>
                          </select>
                        </div>
                      </motion.div>
                    )}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-zinc-50/50 text-zinc-500 text-xs uppercase tracking-wider">
                          <th className="px-6 py-4 font-semibold">{t.employee}</th>
                          <th className="px-6 py-4 font-semibold">{t.department}</th>
                          <th className="px-6 py-4 font-semibold">{t.role}</th>
                          <th className="px-6 py-4 font-semibold">{t.joinDate}</th>
                          <th className="px-6 py-4 font-semibold">{t.salary}</th>
                          <th className="px-6 py-4 font-semibold text-right">{t.action}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {filteredEmployees.map((emp) => (
                          <tr 
                            key={emp.id} 
                            className="hover:bg-zinc-50/50 transition-colors group cursor-pointer"
                            onClick={() => {
                              if (userRole === 'admin' || currentUser?.id === emp.id) {
                                setSelectedEmployeeDetails(emp);
                                setShowEmployeeDetailsModal(true);
                              }
                            }}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center overflow-hidden">
                                  {emp.avatar ? (
                                    <img src={emp.avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  ) : (
                                    <img src={`https://picsum.photos/seed/${emp.id}/100/100`} alt="" referrerPolicy="no-referrer" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-bold text-sm">{emp.full_name}</p>
                                  <p className="text-xs text-zinc-500">{emp.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-medium text-zinc-600">{emp.department}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={cn(
                                "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                                emp.role === 'admin' ? "bg-black text-white" : "bg-zinc-100 text-zinc-600"
                              )}>
                                {emp.role === 'admin' 
                                  ? (language === 'vi' ? 'Quản trị' : 'Admin') 
                                  : (language === 'vi' ? 'Nhân viên' : 'Staff')}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-zinc-500">
                              {format(new Date(emp.join_date), 'MMM dd, yyyy')}
                            </td>
                            <td className="px-6 py-4 text-sm font-bold">
                              {formatCurrency(emp.net_salary)}
                            </td>
                            <td className="px-6 py-4 text-right">
                              {userRole === 'admin' && (
                                <div className="flex items-center justify-end gap-2">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteClick(emp);
                                    }}
                                    className="p-2 hover:bg-red-50 rounded-xl text-zinc-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                                    title="Delete Employee"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditClick(emp);
                                    }}
                                    className="p-2 hover:bg-zinc-100 rounded-xl text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Edit Employee"
                                  >
                                    <MoreVertical size={18} />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'leaves' && (
              <motion.div
                key="leaves"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">Leave Management</h3>
                    <p className="text-zinc-500 text-sm">Track employee absences and annual leave balances.</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center bg-white border border-zinc-200 rounded-xl overflow-hidden">
                      <button 
                        onClick={() => setCurrentYear(prev => prev - 1)}
                        className="p-2 hover:bg-zinc-50 text-zinc-400"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <span className="px-4 font-bold text-sm">{currentYear}</span>
                      <button 
                        onClick={() => setCurrentYear(prev => prev + 1)}
                        className="p-2 hover:bg-zinc-50 text-zinc-400"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                    <button 
                      onClick={() => setShowLeaveModal(true)}
                      className="bg-black text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold"
                    >
                      <Plus size={18} />
                      Request Leave
                    </button>
                  </div>
                </div>

                {/* Leave Request Modal */}
                <AnimatePresence>
                  {showLeaveModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowLeaveModal(false)}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                      />
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
                      >
                        <div className="p-6 border-b border-zinc-100">
                          <h3 className="text-xl font-bold">Request Annual Leave</h3>
                        </div>
                        <form onSubmit={handleRequestLeave} className="p-6 space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Employee</label>
                            <select 
                              required
                              value={newLeave.employee_id ?? ''}
                              onChange={(e) => setNewLeave({...newLeave, employee_id: e.target.value})}
                              className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black/5"
                            >
                              <option value="">Select Employee</option>
                              {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Start Date</label>
                              <input 
                                type="date" 
                                required
                                value={newLeave.start_date ?? ''}
                                onChange={(e) => setNewLeave({...newLeave, start_date: e.target.value})}
                                className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black/5"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">End Date</label>
                              <input 
                                type="date" 
                                required
                                value={newLeave.end_date ?? ''}
                                onChange={(e) => setNewLeave({...newLeave, end_date: e.target.value})}
                                className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black/5"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Reason</label>
                            <textarea 
                              required
                              value={newLeave.reason ?? ''}
                              onChange={(e) => setNewLeave({...newLeave, reason: e.target.value})}
                              className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black/5 min-h-[100px]"
                              placeholder="Why are you taking leave?"
                            />
                          </div>
                          <div className="pt-4 flex gap-3">
                            <button 
                              type="button"
                              onClick={() => setShowLeaveModal(false)}
                              className="flex-1 px-4 py-2.5 border border-zinc-200 rounded-xl text-sm font-bold hover:bg-zinc-50 transition-all"
                            >
                              Cancel
                            </button>
                            <button 
                              type="submit"
                              className="flex-1 bg-black text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-black/10"
                            >
                              Submit Request
                            </button>
                          </div>
                        </form>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>

                {/* Payslip Modal */}
                <AnimatePresence>
                  {showPayslipModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowPayslipModal(false)}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                      />
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
                      >
                        <div className="p-8">
                          <div className="flex justify-between items-center mb-8">
                            <div>
                              <h3 className="text-2xl font-bold">Generate Payslip</h3>
                              <p className="text-zinc-500 text-sm">Create a new payroll record.</p>
                            </div>
                            <button 
                              onClick={() => setShowPayslipModal(false)}
                              className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
                            >
                              <LogOut className="rotate-180" size={20} />
                            </button>
                          </div>

                          <form onSubmit={handleGeneratePayslip} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6">
                              <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Employee</label>
                                <select 
                                  required
                                  value={newPayslip.employee_id ?? ''}
                                  onChange={(e) => {
                                    const empId = e.target.value;
                                    const emp = employees.find(emp => emp.id === Number(empId));
                                    setNewPayslip({
                                      ...newPayslip,
                                      employee_id: empId,
                                      basic_salary: emp ? emp.net_salary : 0
                                    });
                                  }}
                                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black/5"
                                >
                                  <option value="">Select Employee</option>
                                  {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                                  ))}
                                </select>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Month</label>
                                  <select 
                                    required
                                    value={newPayslip.month ?? ''}
                                    onChange={(e) => setNewPayslip({...newPayslip, month: e.target.value})}
                                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black/5"
                                  >
                                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                                      <option key={m} value={m}>{m}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Year</label>
                                  <input 
                                    type="number" required
                                    value={newPayslip.year ?? new Date().getFullYear()}
                                    onChange={(e) => setNewPayslip({...newPayslip, year: Number(e.target.value)})}
                                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black/5"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Basic Salary</label>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-[10px] font-bold">VND</span>
                                  <input 
                                    type="number" required readOnly
                                    value={newPayslip.basic_salary ?? 0}
                                    className="w-full pl-12 pr-4 py-2.5 bg-zinc-100 border border-zinc-200 rounded-xl text-sm outline-none cursor-not-allowed"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Bonuses</label>
                                  <input 
                                    type="number" required
                                    value={newPayslip.bonuses ?? 0}
                                    onChange={(e) => setNewPayslip({...newPayslip, bonuses: Number(e.target.value)})}
                                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black/5"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Deductions</label>
                                  <input 
                                    type="number" required
                                    value={newPayslip.deductions ?? 0}
                                    onChange={(e) => setNewPayslip({...newPayslip, deductions: Number(e.target.value)})}
                                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black/5"
                                  />
                                </div>
                              </div>

                              <div className="p-4 bg-zinc-900 rounded-2xl text-white">
                                <div className="flex justify-between items-center">
                                  <span className="text-zinc-400 text-xs font-bold uppercase">Net Salary</span>
                                  <span className="text-xl font-bold">
                                    {formatCurrency(newPayslip.basic_salary + newPayslip.bonuses - newPayslip.deductions)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                              <button 
                                type="button"
                                onClick={() => setShowPayslipModal(false)}
                                className="flex-1 px-6 py-3 border border-zinc-200 rounded-xl text-sm font-bold hover:bg-zinc-50 transition-all"
                              >
                                Cancel
                              </button>
                              <button 
                                type="submit"
                                className="flex-1 px-6 py-3 bg-black text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition-all"
                              >
                                Generate
                              </button>
                            </div>
                          </form>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>

                {/* Balance Info */}
                <div className="bg-zinc-900 text-white p-6 rounded-2xl shadow-xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/10 rounded-xl">
                      <Info size={24} className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold">Leave Policy</h4>
                      <p className="text-zinc-400 text-sm">Employees earn 1 day of leave per month worked. Max 12 days/year.</p>
                    </div>
                  </div>
                  <div className="flex gap-8">
                    <div className="text-center">
                      <p className="text-zinc-400 text-xs uppercase font-bold tracking-wider mb-1">Total Credit</p>
                      <p className="text-xl font-bold">12 Days</p>
                    </div>
                    <div className="text-center">
                      <p className="text-zinc-400 text-xs uppercase font-bold tracking-wider mb-1">Accrual Rate</p>
                      <p className="text-xl font-bold">1 Day / Mo</p>
                    </div>
                  </div>
                </div>

                {/* Year Calendar Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {eachMonthOfInterval({
                    start: startOfYear(new Date(currentYear, 0, 1)),
                    end: endOfYear(new Date(currentYear, 0, 1))
                  }).map(month => renderCalendarMonth(month))}
                </div>

                {/* Leave Balances Table */}
                <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-zinc-100">
                    <h3 className="font-bold text-lg">Employee Leave Balances</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-zinc-50/50 text-zinc-500 text-xs uppercase tracking-wider">
                          <th className="px-6 py-4 font-semibold">Employee</th>
                          <th className="px-6 py-4 font-semibold">Join Date</th>
                          <th className="px-6 py-4 font-semibold">Accrued</th>
                          <th className="px-6 py-4 font-semibold">Used</th>
                          <th className="px-6 py-4 font-semibold">Remaining</th>
                          <th className="px-6 py-4 font-semibold">Status</th>
                          <th className="px-6 py-4 font-semibold text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {employees.map((emp) => {
                          const { accrued, used, balance } = calculateLeaveBalance(emp);
                          return (
                            <tr key={emp.id} className="hover:bg-zinc-50/50 transition-colors">
                              <td className="px-6 py-4">
                                <span className="font-bold text-sm">{emp.full_name}</span>
                              </td>
                              <td className="px-6 py-4 text-sm text-zinc-500">
                                {format(parseISO(emp.join_date), 'MMM dd, yyyy')}
                              </td>
                              <td className="px-6 py-4 text-sm font-medium">
                                {accrued} Days
                              </td>
                              <td className="px-6 py-4 text-sm text-red-500 font-medium">
                                {used} Days
                              </td>
                              <td className="px-6 py-4 text-sm font-bold text-emerald-600">
                                {balance} Days
                              </td>
                              <td className="px-6 py-4">
                                <div className="w-24 bg-zinc-100 h-2 rounded-full overflow-hidden">
                                  <div 
                                    className="bg-emerald-500 h-full" 
                                    style={{ width: `${(balance / (emp.total_annual_leave || 12)) * 100}%` }}
                                  />
                                </div>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button 
                                  onClick={() => exportLeaveReport(emp)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg text-xs font-bold transition-all"
                                >
                                  <Download size={14} />
                                  Export
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'payroll' && (
              <motion.div
                key="payroll"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">Payroll Management</h3>
                    <p className="text-zinc-500 text-sm">Generate and track employee payslips.</p>
                  </div>
                  <div className="flex gap-3">
                    <button className="px-4 py-2.5 border border-zinc-200 rounded-xl text-sm font-bold hover:bg-zinc-50 transition-all">
                      History
                    </button>
                    <button 
                      onClick={() => setShowPayslipModal(true)}
                      className="bg-black text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold hover:bg-zinc-800 transition-all"
                    >
                      <Plus size={18} />
                      Generate Payslip
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">Next Pay Date</p>
                    <h4 className="text-xl font-bold">March 31, 2026</h4>
                    <div className="mt-4 flex items-center gap-2 text-emerald-600 text-sm font-medium">
                      <TrendingUp size={16} />
                      <span>On Schedule</span>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">Total Bonuses</p>
                    <h4 className="text-xl font-bold">{formatCurrency(12450000)}</h4>
                    <p className="text-zinc-400 text-xs mt-4">Across 12 employees</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">Deductions</p>
                    <h4 className="text-xl font-bold">{formatCurrency(4200000)}</h4>
                    <p className="text-zinc-400 text-xs mt-4">Tax & Insurance</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-zinc-100">
                    <h3 className="font-bold text-lg">Payslip History</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-zinc-50/50 text-zinc-500 text-xs uppercase tracking-wider">
                          <th className="px-6 py-4 font-semibold">Employee</th>
                          <th className="px-6 py-4 font-semibold">Period</th>
                          <th className="px-6 py-4 font-semibold">Basic</th>
                          <th className="px-6 py-4 font-semibold">Bonuses</th>
                          <th className="px-6 py-4 font-semibold">Deductions</th>
                          <th className="px-6 py-4 font-semibold">Net Salary</th>
                          <th className="px-6 py-4 font-semibold text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {payslips.map((slip) => (
                          <tr key={slip.id} className="hover:bg-zinc-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <span className="font-bold text-sm">{slip.employee_name}</span>
                            </td>
                            <td className="px-6 py-4 text-sm text-zinc-500">
                              {slip.month} {slip.year}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {formatCurrency(slip.basic_salary)}
                            </td>
                            <td className="px-6 py-4 text-sm text-emerald-600 font-medium">
                              +{formatCurrency(slip.bonuses)}
                            </td>
                            <td className="px-6 py-4 text-sm text-red-500 font-medium">
                              -{formatCurrency(slip.deductions)}
                            </td>
                            <td className="px-6 py-4 text-sm font-bold">
                              {formatCurrency(slip.net_salary)}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button className="flex items-center gap-2 ml-auto text-xs font-bold text-zinc-500 hover:text-black bg-zinc-100 px-3 py-1.5 rounded-lg transition-all">
                                <FileText size={14} />
                                PDF
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'reports' && (
              <motion.div
                key="reports"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">Annual Reports</h3>
                    <p className="text-zinc-500 text-sm">Performance tracking and financial metrics.</p>
                  </div>
                  <button className="bg-black text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold">
                    <Download size={18} />
                    Export All Data
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-8 rounded-2xl border border-zinc-100 shadow-sm">
                    <h4 className="font-bold text-lg mb-6">Employee Growth</h4>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                          { year: '2021', count: 12 },
                          { year: '2022', count: 18 },
                          { year: '2023', count: 25 },
                          { year: '2024', count: 32 },
                          { year: '2025', count: 45 },
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                          <XAxis dataKey="year" axisLine={false} tickLine={false} />
                          <YAxis axisLine={false} tickLine={false} />
                          <Tooltip />
                          <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-2xl border border-zinc-100 shadow-sm">
                    <h4 className="font-bold text-lg mb-6">Performance Distribution</h4>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Excellent', value: 35 },
                              { name: 'Good', value: 45 },
                              { name: 'Average', value: 15 },
                              { name: 'Below Avg', value: 5 },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            <Cell fill="#10B981" />
                            <Cell fill="#4F46E5" />
                            <Cell fill="#F59E0B" />
                            <Cell fill="#EF4444" />
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Settings Modal */}
          <AnimatePresence>
            {showSettingsModal && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={closeSettingsModal}
                  className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
                >
                  <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                    <h3 className="text-xl font-bold">{t.settings}</h3>
                    <button onClick={closeSettingsModal} className="text-zinc-400 hover:text-black transition-colors">
                      <Plus size={24} className="rotate-45" />
                    </button>
                  </div>
                  
                  <div className="p-8 space-y-8">
                    <section>
                      <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">{t.language}</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <button 
                          onClick={() => setLanguage('en')}
                          className={cn(
                            "flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all",
                            language === 'en' ? "border-black bg-black text-white" : "border-zinc-100 hover:border-zinc-200"
                          )}
                        >
                          <span className="text-xl">🇺🇸</span>
                          <span className="font-bold text-sm">English</span>
                        </button>
                        <button 
                          onClick={() => setLanguage('vi')}
                          className={cn(
                            "flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all",
                            language === 'vi' ? "border-black bg-black text-white" : "border-zinc-100 hover:border-zinc-200"
                          )}
                        >
                          <span className="text-xl">🇻🇳</span>
                          <span className="font-bold text-sm">Tiếng Việt</span>
                        </button>
                      </div>
                    </section>

                    <section className="pt-6 border-t border-zinc-100">
                      <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">Change Password</h4>
                      <form onSubmit={handleChangePassword} className="space-y-4">
                        {passwordError && (
                          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl">
                            {passwordError}
                          </div>
                        )}
                        {passwordSuccess && (
                          <div className="p-3 bg-green-50 text-green-600 text-sm rounded-xl">
                            {passwordSuccess}
                          </div>
                        )}
                        <div>
                          <input 
                            type="password"
                            required
                            value={passwordForm.currentPassword}
                            onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                            placeholder="Current Password"
                            className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black/5"
                          />
                        </div>
                        <div>
                          <input 
                            type="password"
                            required
                            value={passwordForm.newPassword}
                            onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                            placeholder="New Password"
                            className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black/5"
                          />
                        </div>
                        <div>
                          <input 
                            type="password"
                            required
                            value={passwordForm.confirmPassword}
                            onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                            placeholder="Confirm New Password"
                            className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black/5"
                          />
                        </div>
                        <button 
                          type="submit"
                          disabled={isChangingPassword}
                          className="w-full bg-black text-white py-2.5 rounded-xl font-medium hover:bg-zinc-800 transition-colors disabled:opacity-70"
                        >
                          {isChangingPassword ? 'Updating...' : 'Update Password'}
                        </button>
                      </form>
                    </section>
                  </div>

                  <div className="p-6 bg-zinc-50 border-t border-zinc-100 flex justify-end">
                    <button 
                      onClick={closeSettingsModal}
                      className="px-6 py-2 bg-black text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition-all"
                    >
                      Done
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Employee Details Modal */}
          <AnimatePresence>
            {showEmployeeDetailsModal && selectedEmployeeDetails && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 overflow-y-auto">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowEmployeeDetailsModal(false)}
                  className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                />
                
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="bg-white rounded-3xl w-full max-w-3xl relative z-10 shadow-2xl overflow-hidden my-8"
                >
                  <div className="p-8 border-b border-zinc-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-20">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center overflow-hidden">
                        {selectedEmployeeDetails.avatar ? (
                          <img src={selectedEmployeeDetails.avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <img src={`https://picsum.photos/seed/${selectedEmployeeDetails.id}/100/100`} alt="" referrerPolicy="no-referrer" />
                        )}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">{selectedEmployeeDetails.full_name}</h2>
                        <p className="text-zinc-500">{selectedEmployeeDetails.job_title} • {selectedEmployeeDetails.department}</p>
                      </div>
                    </div>
                    <button onClick={() => setShowEmployeeDetailsModal(false)} className="text-zinc-400 hover:text-black transition-colors p-2 hover:bg-zinc-100 rounded-full">
                      <X size={24} />
                    </button>
                  </div>

                  <div className="p-8 space-y-8">
                    {/* Basic Info */}
                    <section>
                      <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">Basic Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-zinc-50 p-4 rounded-2xl">
                          <p className="text-xs text-zinc-500 mb-1">Email Address</p>
                          <p className="font-medium">{selectedEmployeeDetails.email}</p>
                        </div>
                        <div className="bg-zinc-50 p-4 rounded-2xl">
                          <p className="text-xs text-zinc-500 mb-1">Phone Number</p>
                          <p className="font-medium">{selectedEmployeeDetails.phone || 'N/A'}</p>
                        </div>
                        <div className="bg-zinc-50 p-4 rounded-2xl">
                          <p className="text-xs text-zinc-500 mb-1">Date of Birth</p>
                          <p className="font-medium">{selectedEmployeeDetails.dob ? format(parseISO(selectedEmployeeDetails.dob), 'MMMM dd, yyyy') : 'N/A'}</p>
                        </div>
                        <div className="bg-zinc-50 p-4 rounded-2xl">
                          <p className="text-xs text-zinc-500 mb-1">Address</p>
                          <p className="font-medium">{selectedEmployeeDetails.address || 'N/A'}</p>
                        </div>
                      </div>
                    </section>

                    {/* Identity Info */}
                    <section>
                      <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">Identity Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-zinc-50 p-4 rounded-2xl">
                          <p className="text-xs text-zinc-500 mb-1">ID/CCCD Number</p>
                          <p className="font-medium">{selectedEmployeeDetails.cccd_number || 'N/A'}</p>
                        </div>
                        <div className="bg-zinc-50 p-4 rounded-2xl">
                          <p className="text-xs text-zinc-500 mb-1">Issue Date</p>
                          <p className="font-medium">{selectedEmployeeDetails.cccd_issue_date ? format(parseISO(selectedEmployeeDetails.cccd_issue_date), 'MMMM dd, yyyy') : 'N/A'}</p>
                        </div>
                        <div className="bg-zinc-50 p-4 rounded-2xl">
                          <p className="text-xs text-zinc-500 mb-1">Issue Place</p>
                          <p className="font-medium">{selectedEmployeeDetails.id_issue_place || 'N/A'}</p>
                        </div>
                      </div>
                      
                      {(selectedEmployeeDetails.cccd_front_image || selectedEmployeeDetails.cccd_back_image) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                          {selectedEmployeeDetails.cccd_front_image && (
                            <div>
                              <p className="text-xs text-zinc-500 mb-2">ID Front Image</p>
                              <img src={selectedEmployeeDetails.cccd_front_image} alt="ID Front" className="w-full rounded-xl border border-zinc-200" />
                            </div>
                          )}
                          {selectedEmployeeDetails.cccd_back_image && (
                            <div>
                              <p className="text-xs text-zinc-500 mb-2">ID Back Image</p>
                              <img src={selectedEmployeeDetails.cccd_back_image} alt="ID Back" className="w-full rounded-xl border border-zinc-200" />
                            </div>
                          )}
                        </div>
                      )}
                    </section>

                    {/* Employment Info */}
                    <section>
                      <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">Employment Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-zinc-50 p-4 rounded-2xl">
                          <p className="text-xs text-zinc-500 mb-1">Join Date</p>
                          <p className="font-medium">{selectedEmployeeDetails.join_date ? format(parseISO(selectedEmployeeDetails.join_date), 'MMMM dd, yyyy') : 'N/A'}</p>
                        </div>
                        <div className="bg-zinc-50 p-4 rounded-2xl">
                          <p className="text-xs text-zinc-500 mb-1">Status</p>
                          <span className={cn(
                            "px-2 py-1 rounded-full text-[10px] font-bold uppercase inline-block mt-1",
                            selectedEmployeeDetails.status === 'active' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          )}>
                            {selectedEmployeeDetails.status}
                          </span>
                        </div>
                        <div className="bg-zinc-50 p-4 rounded-2xl">
                          <p className="text-xs text-zinc-500 mb-1">System Role</p>
                          <span className={cn(
                            "px-2 py-1 rounded-full text-[10px] font-bold uppercase inline-block mt-1",
                            selectedEmployeeDetails.role === 'admin' ? "bg-black text-white" : "bg-zinc-200 text-zinc-700"
                          )}>
                            {selectedEmployeeDetails.role}
                          </span>
                        </div>
                        <div className="bg-zinc-50 p-4 rounded-2xl">
                          <p className="text-xs text-zinc-500 mb-1">Contract Number</p>
                          <p className="font-medium">{selectedEmployeeDetails.contract_number || 'N/A'}</p>
                        </div>
                        <div className="bg-zinc-50 p-4 rounded-2xl">
                          <p className="text-xs text-zinc-500 mb-1">Contract Type</p>
                          <p className="font-medium">{selectedEmployeeDetails.contract_type || 'N/A'}</p>
                        </div>
                        <div className="bg-zinc-50 p-4 rounded-2xl">
                          <p className="text-xs text-zinc-500 mb-1">Contract Sign Date</p>
                          <p className="font-medium">{selectedEmployeeDetails.contract_sign_date ? format(parseISO(selectedEmployeeDetails.contract_sign_date), 'MMM dd, yyyy') : 'N/A'}</p>
                        </div>
                        <div className="bg-zinc-50 p-4 rounded-2xl">
                          <p className="text-xs text-zinc-500 mb-1">Contract Start Date</p>
                          <p className="font-medium">{selectedEmployeeDetails.contract_start_date ? format(parseISO(selectedEmployeeDetails.contract_start_date), 'MMM dd, yyyy') : 'N/A'}</p>
                        </div>
                        <div className="bg-zinc-50 p-4 rounded-2xl">
                          <p className="text-xs text-zinc-500 mb-1">Contract End Date</p>
                          <p className="font-medium">{selectedEmployeeDetails.contract_end_date ? format(parseISO(selectedEmployeeDetails.contract_end_date), 'MMM dd, yyyy') : 'N/A'}</p>
                        </div>
                      </div>
                    </section>

                    {/* Financial Info */}
                    <section>
                      <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">Financial Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-zinc-50 p-4 rounded-2xl">
                          <p className="text-xs text-zinc-500 mb-1">Net Salary</p>
                          <p className="font-bold text-lg">{formatCurrency(selectedEmployeeDetails.net_salary)}</p>
                        </div>
                        <div className="bg-zinc-50 p-4 rounded-2xl">
                          <p className="text-xs text-zinc-500 mb-1">Salary Effective Date</p>
                          <p className="font-medium">{selectedEmployeeDetails.salary_effective_date ? format(parseISO(selectedEmployeeDetails.salary_effective_date), 'MMMM dd, yyyy') : 'N/A'}</p>
                        </div>
                        {selectedEmployeeDetails.salary_notes && (
                          <div className="bg-zinc-50 p-4 rounded-2xl md:col-span-2">
                            <p className="text-xs text-zinc-500 mb-1">Salary Notes</p>
                            <p className="font-medium">{selectedEmployeeDetails.salary_notes}</p>
                          </div>
                        )}
                      </div>
                    </section>

                    {/* Other Info */}
                    {(selectedEmployeeDetails.notes || selectedEmployeeDetails.annual_leave_balance !== undefined) && (
                      <section>
                        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">Other Information</h3>
                        <div className="grid grid-cols-1 gap-6">
                          {selectedEmployeeDetails.annual_leave_balance !== undefined && (
                            <div className="bg-zinc-50 p-4 rounded-2xl">
                              <p className="text-xs text-zinc-500 mb-1">Annual Leave Balance</p>
                              <p className="font-medium">{selectedEmployeeDetails.annual_leave_balance} Days</p>
                            </div>
                          )}
                          {selectedEmployeeDetails.notes && (
                            <div className="bg-zinc-50 p-4 rounded-2xl">
                              <p className="text-xs text-zinc-500 mb-1">General Notes</p>
                              <p className="font-medium whitespace-pre-wrap">{selectedEmployeeDetails.notes}</p>
                            </div>
                          )}
                        </div>
                      </section>
                    )}
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Incomplete Warning Modal */}
          <AnimatePresence>
            {showIncompleteWarningModal && (
              <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowIncompleteWarningModal(false)}
                  className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                />
                
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="bg-white rounded-2xl w-full max-w-md relative z-10 shadow-2xl overflow-hidden"
                >
                  <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-yellow-100 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Info size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{t.incompleteWarningTitle}</h3>
                    <p className="text-zinc-500 mb-6">
                      {t.incompleteWarningMessage}
                    </p>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setShowIncompleteWarningModal(false)}
                        className="flex-1 px-4 py-3 bg-zinc-100 text-zinc-700 rounded-xl text-sm font-bold hover:bg-zinc-200 transition-all"
                      >
                        {t.no}
                      </button>
                      <button 
                        onClick={proceedSaveEmployee}
                        className="flex-1 px-4 py-3 bg-black text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-black/10"
                      >
                        {t.yes}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Delete Confirmation Modal */}
          <AnimatePresence>
            {showDeleteModal && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowDeleteModal(false)}
                  className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-8"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-600 mb-6">
                      <Trash2 size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{t.confirmDelete}</h3>
                    <p className="text-zinc-500 mb-8">
                      {t.deleteWarning} <span className="font-bold text-black">{employeeToDelete?.full_name}</span>? 
                      {t.undoneWarning}
                    </p>
                    <div className="flex gap-4 w-full">
                      <button 
                        onClick={() => setShowDeleteModal(false)}
                        className="flex-1 px-6 py-3 border border-zinc-200 rounded-xl text-sm font-bold hover:bg-zinc-50 transition-all"
                      >
                        {t.cancel}
                      </button>
                      <button 
                        onClick={confirmDeleteEmployee}
                        className="flex-1 bg-red-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/10"
                      >
                        {t.delete}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
