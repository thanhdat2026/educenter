export enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  MANAGER = 'MANAGER',
  ACCOUNTANT = 'ACCOUNTANT',
  PARENT = 'PARENT',
  VIEWER = 'VIEWER',
}

export enum PersonStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  UNMARKED = 'UNMARKED',
}

export enum FeeType {
  PER_SESSION = 'PER_SESSION',
  MONTHLY = 'MONTHLY',
  PER_COURSE = 'PER_COURSE',
}

export enum SalaryType {
  PER_SESSION = 'PER_SESSION',
  MONTHLY = 'MONTHLY',
}

export interface BasePerson {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address: string;
  status: PersonStatus;
  createdAt: string;
  password?: string;
  gender?: 'Nam' | 'Nữ' | 'Khác';
}

export interface Student extends BasePerson {
  dob: string;
  parentName: string;
  email: string;
  balance: number; // Student's account balance. Positive = credit, Negative = debt.
}

export interface Teacher extends BasePerson {
  dob: string;
  qualification: string;
  subject: string;
  role: UserRole.TEACHER;
  salaryType: SalaryType;
  rate: number; // Amount per hour or fixed monthly salary
}

export interface Staff extends BasePerson {
  dob: string;
  position: string;
  role: UserRole.MANAGER | UserRole.ACCOUNTANT;
}

export interface ClassFee {
  type: FeeType;
  amount: number;
}

export interface ClassSchedule {
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
}

export interface Class {
  id: string;
  name: string;
  teacherIds: string[];
  subject: string;
  schedule: ClassSchedule[];
  studentIds: string[];
  fee: ClassFee;
}

export interface AttendanceRecord {
  id: string;
  classId: string;
  studentId: string;
  date: string; // "YYYY-MM-DD"
  status: AttendanceStatus;
}

export interface Invoice {
  id: string;
  studentId: string;
  studentName: string;
  month: string; // e.g., "2024-07"
  amount: number;
  details: string;
  status: 'PAID' | 'UNPAID' | 'CANCELLED';
  generatedDate: string; // "YYYY-MM-DD"
  paidDate: string | null; // "YYYY-MM-DD"
}

export enum TransactionType {
    INVOICE = 'INVOICE', // A generated bill (debit)
    PAYMENT = 'PAYMENT', // A payment received (credit)
    ADJUSTMENT_CREDIT = 'ADJUSTMENT_CREDIT', // Manual credit (e.g., refund, bonus)
    ADJUSTMENT_DEBIT = 'ADJUSTMENT_DEBIT', // Manual debit (e.g., fee, penalty)
}

export interface Transaction {
    id: string;
    studentId: string;
    date: string; // "YYYY-MM-DD"
    type: TransactionType;
    description: string;
    amount: number; // Positive for credits/payments, negative for debits/invoices
    relatedInvoiceId?: string;
}


export interface ProgressReport {
  id: string;
  classId: string;
  studentId: string;
  date: string; // "YYYY-MM-DD"
  score: number; // e.g., out of 10
  comments: string;
  createdBy: string; // Teacher's ID
}

export enum IncomeCategory {
  SALE = 'SALE', // Bán tài liệu, đồng phục
  EVENT = 'EVENT', // Phí sự kiện, dã ngoại
  OTHER = 'OTHER', // Thu khác
}

export interface Income {
  id: string;
  description: string;
  amount: number;
  category: IncomeCategory;
  date: string; // "YYYY-MM-DD"
}

export enum ExpenseCategory {
  SALARY = 'SALARY', // Lương
  RENT = 'RENT', // Thuê mặt bằng
  UTILITIES = 'UTILITIES', // Điện, nước, internet
  MARKETING = 'MARKETING', // Tiếp thị
  SUPPLIES = 'SUPPLIES', // Văn phòng phẩm, thiết bị
  OTHER = 'OTHER', // Chi khác
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string; // "YYYY-MM-DD"
}

export interface CenterSettings {
  name: string;
  address?: string;
  phone?: string;
  logoUrl: string;
  themeColor: string;
  sidebarColor?: string;
  theme: 'light' | 'dark';
  onboardingStepsCompleted: string[];
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountHolder?: string;
  bankBin?: string;
  qrCodeUrl?: string;
  adminPassword?: string;
  viewerAccountActive?: boolean;
  loginHeaderContent?: string;
}

export interface Payroll {
  id: string;
  teacherId: string;
  teacherName: string;
  month: string; // "YYYY-MM"
  sessionsTaught: number;
  rate: number;
  baseSalary: number;
  totalSalary: number;
  calculationDate: string; // "YYYY-MM-DD"
}

export interface Announcement {
    id: string;
    title: string;
    content: string;
    createdAt: string; // "YYYY-MM-DD"
    createdBy: string; // User's name
    classId?: string;
}

export interface SearchResult {
  id: string;
  name: string;
  type: 'student' | 'teacher' | 'class';
  path: string;
  context?: string; // e.g., "Vật lý" or "Phụ huynh: Trần Văn Bốn"
}