export interface Employee {
  id: number;
  full_name: string;
  dob?: string;
  address?: string;
  phone?: string;
  email: string;
  password?: string;
  cccd_number?: string;
  cccd_issue_date?: string;
  id_issue_place?: string;
  avatar?: string;
  cccd_front_image?: string;
  cccd_back_image?: string;
  contract_number?: string;
  contract_sign_date?: string;
  contract_start_date?: string;
  contract_end_date?: string;
  contract_type?: 'probation' | 'fixed-term' | 'indefinite-term';
  role: 'admin' | 'staff';
  department: string;
  job_title: string;
  manager_id?: number;
  status: 'active' | 'probation' | 'inactive';
  join_date: string;
  net_salary: number;
  salary_effective_date?: string;
  salary_notes?: string;
  annual_leave_balance: number;
  notes?: string;
}

export interface Payslip {
  id: number;
  employee_id: number;
  employee_name?: string;
  month: string;
  year: number;
  basic_salary: number;
  bonuses: number;
  deductions: number;
  net_salary: number;
  generated_at: string;
}

export interface PerformanceReport {
  id: number;
  employee_id: number;
  employee_name?: string;
  year: number;
  score: number;
  notes: string;
}

export interface Leave {
  id: number;
  employee_id: number;
  employee_name?: string;
  start_date: string;
  end_date: string;
  type: string;
  status: string;
  reason: string;
}

export interface DashboardStats {
  totalEmployees: number;
  totalSalary: number;
  deptDistribution: { department: string; count: number }[];
}
