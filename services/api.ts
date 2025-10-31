

import {
    Student, Teacher, Staff, Class, AttendanceRecord, Invoice, PersonStatus, FeeType, AttendanceStatus, ProgressReport, Income, Expense, CenterSettings, Payroll, SalaryType, Announcement, UserRole, Transaction, TransactionType
} from '../types';
import { MOCK_STUDENTS, MOCK_TEACHERS, MOCK_STAFF, MOCK_CLASSES, MOCK_ATTENDANCE, MOCK_INVOICES, MOCK_PROGRESS_REPORTS, MOCK_TRANSACTIONS, MOCK_INCOME, MOCK_EXPENSES, MOCK_PAYROLLS, MOCK_ANNOUNCEMENTS, MOCK_SETTINGS } from './mockData';

const APP_DATA_KEY = 'educenter_pro_data';

interface AppState {
  students: Student[];
  teachers: Teacher[];
  staff: Staff[];
  classes: Class[];
  attendance: AttendanceRecord[];
  invoices: Invoice[];
  progressReports: ProgressReport[];
  transactions: Transaction[];
  income: Income[];
  expenses: Expense[];
  settings: CenterSettings;
  payrolls: Payroll[];
  announcements: Announcement[];
}

// --- Data Store Management ---

function getLocalData(): AppState {
    const data = localStorage.getItem(APP_DATA_KEY);
    if (data) {
        return JSON.parse(data);
    }
    // Return initial state with MOCK data if nothing in localStorage
    const initialState: AppState = {
        students: MOCK_STUDENTS,
        teachers: MOCK_TEACHERS,
        staff: MOCK_STAFF,
        classes: MOCK_CLASSES,
        attendance: MOCK_ATTENDANCE,
        invoices: MOCK_INVOICES,
        progressReports: MOCK_PROGRESS_REPORTS,
        transactions: MOCK_TRANSACTIONS,
        income: MOCK_INCOME,
        expenses: MOCK_EXPENSES,
        payrolls: MOCK_PAYROLLS,
        announcements: MOCK_ANNOUNCEMENTS,
        settings: MOCK_SETTINGS,
    };
    // Save the initial state so it exists for the next load
    localStorage.setItem(APP_DATA_KEY, JSON.stringify(initialState));
    return initialState;
}


function setLocalData(data: Omit<AppState, 'loading'> | AppState) {
    localStorage.setItem(APP_DATA_KEY, JSON.stringify(data));
}

// --- API Functions ---

export async function loadInitialData(): Promise<AppState> {
    return Promise.resolve(getLocalData());
}

const generateUniqueId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

async function addDoc<T extends { id: string }>(collectionName: keyof AppState, newItem: T): Promise<T> {
    const appData = getLocalData();
    // FIX: Using 'unknown' as an intermediate cast to handle the union type of appData[collectionName],
    // which could include non-array types or arrays of different types. This is safe
    // in this context as this function is internally controlled to only operate on array collections.
    const collection = appData[collectionName] as unknown as T[];
    
    if (collection.some(item => item.id === newItem.id)) {
        throw new Error(`An item with ID ${newItem.id} already exists in ${collectionName}.`);
    }

    collection.push(newItem);
    setLocalData(appData);
    return newItem;
}


async function updateDoc<T extends { id: string }>(collectionName: keyof AppState, docId: string, data: T): Promise<void> {
    const appData = getLocalData();
    const collection = appData[collectionName] as any[];
    
    if (!collection.some((item: any) => item.id === docId)) {
        throw new Error(`Document with id ${docId} not found in collection ${collectionName}.`);
    }

    appData[collectionName] = collection.map((item: any) => item.id === docId ? data : item) as any;
    setLocalData(appData);
}

async function deleteDoc(collectionName: keyof AppState, docId: string): Promise<void> {
    const appData = getLocalData();
    const collection = appData[collectionName] as any[];
    appData[collectionName] = collection.filter((item: any) => item.id !== docId) as any;
    setLocalData(appData);
}


// --- Students ---
export async function addStudent({ student, classIds }: { student: Student, classIds: string[] }): Promise<void> {
    const appData = getLocalData();
    if (appData.students.some(s => s.id === student.id)) {
        throw new Error(`Học viên với mã '${student.id}' đã tồn tại.`);
    }
    const newStudent = { ...student, createdAt: new Date().toISOString().split('T')[0], balance: 0 };
    appData.students.push(newStudent);
    appData.classes = appData.classes.map(c => {
        if (classIds.includes(c.id)) {
            return { ...c, studentIds: [...c.studentIds, newStudent.id] };
        }
        return c;
    });
    setLocalData(appData);
}

export async function updateStudent({ originalId, updatedStudent, classIds }: { originalId: string, updatedStudent: Student, classIds: string[] }): Promise<void> {
    const appData = getLocalData();
    const newId = updatedStudent.id;

    if (originalId !== newId) {
        if (appData.students.some(s => s.id === newId)) {
             throw new Error(`Học viên với mã '${newId}' đã tồn tại.`);
        }
        // Update all related records with the new ID
        appData.students = appData.students.map(s => s.id === originalId ? updatedStudent : s);
        appData.attendance = appData.attendance.map(a => a.studentId === originalId ? { ...a, studentId: newId } : a);
        appData.invoices = appData.invoices.map(i => i.studentId === originalId ? { ...i, studentId: newId, studentName: updatedStudent.name } : i);
        appData.progressReports = appData.progressReports.map(p => p.studentId === originalId ? { ...p, studentId: newId } : p);
        appData.transactions = appData.transactions.map(t => t.studentId === originalId ? { ...t, studentId: newId } : t);
    } else {
        appData.students = appData.students.map(s => s.id === originalId ? updatedStudent : s);
    }
    
    // Update class enrollments for both ID change and no ID change scenarios
    const finalStudentId = newId;
    const newClassIds = new Set(classIds);
    appData.classes = appData.classes.map(c => {
        const studentIds = new Set(c.studentIds);
        const wasInClass = studentIds.has(originalId);
        const shouldBeInClass = newClassIds.has(c.id);

        if(wasInClass) studentIds.delete(originalId);

        if(shouldBeInClass) studentIds.add(finalStudentId);
        
        return { ...c, studentIds: Array.from(studentIds) };
    });

    setLocalData(appData);
}

export async function deleteStudent(studentId: string): Promise<void> {
    const appData = getLocalData();
    appData.students = appData.students.filter(s => s.id !== studentId);
    appData.classes = appData.classes.map(c => ({ ...c, studentIds: c.studentIds.filter(id => id !== studentId) }));
    appData.attendance = appData.attendance.filter(a => a.studentId !== studentId);
    appData.invoices = appData.invoices.filter(i => i.studentId !== studentId);
    appData.progressReports = appData.progressReports.filter(p => p.studentId !== studentId);
    appData.transactions = appData.transactions.filter(t => t.studentId !== studentId);
    setLocalData(appData);
}

// --- Teachers, Staff, Classes ---
export async function addTeacher(data: Teacher): Promise<Teacher> {
    const newItem = { ...data, createdAt: new Date().toISOString().split('T')[0] };
    return addDoc('teachers', newItem);
}
export async function addStaff(data: Staff): Promise<Staff> {
    const newItem = { ...data, createdAt: new Date().toISOString().split('T')[0] };
    return addDoc('staff', newItem);
}
export const addClass = (data: Class) => addDoc('classes', data);
export const addProgressReport = (data: Omit<ProgressReport, 'id'>) => addDoc('progressReports', { ...data, id: generateUniqueId('PR') } as ProgressReport);
export const addIncome = (data: Omit<Income, 'id'>) => addDoc('income', { ...data, id: generateUniqueId('INC') } as Income);
export const addExpense = (data: Omit<Expense, 'id'>) => addDoc('expenses', { ...data, id: generateUniqueId('EXP') } as Expense);
export async function addAnnouncement(data: Omit<Announcement, 'id'>): Promise<Announcement> {
    const newItem = { ...data, id: generateUniqueId('ANN'), createdAt: new Date().toISOString().split('T')[0] };
    return addDoc('announcements', newItem);
}

export async function updateTeacher({ originalId, updatedTeacher }: { originalId: string, updatedTeacher: Teacher }): Promise<void> {
    const appData = getLocalData();
    if (originalId !== updatedTeacher.id) {
        if(appData.teachers.some(t => t.id === updatedTeacher.id)) throw new Error("Mã giáo viên đã tồn tại.");
        appData.classes = appData.classes.map(c => ({...c, teacherIds: c.teacherIds.map(tid => tid === originalId ? updatedTeacher.id : tid)}));
    }
    appData.teachers = appData.teachers.map(t => t.id === originalId ? updatedTeacher : t);
    setLocalData(appData);
}

export async function deleteTeacher(teacherId: string): Promise<void> {
    const appData = getLocalData();
    appData.teachers = appData.teachers.filter(t => t.id !== teacherId);
    appData.classes = appData.classes.map(c => ({...c, teacherIds: c.teacherIds.filter(id => id !== teacherId)}));
    setLocalData(appData);
}

export async function updateStaff({ originalId, updatedStaff }: { originalId: string, updatedStaff: Staff }): Promise<void> {
    const appData = getLocalData();
     if (originalId !== updatedStaff.id && appData.staff.some(s => s.id === updatedStaff.id)) {
        throw new Error("Mã nhân viên đã tồn tại.");
    }
    appData.staff = appData.staff.map(t => t.id === originalId ? updatedStaff : t);
    setLocalData(appData);
}

export const deleteStaff = (staffId: string) => deleteDoc('staff', staffId);

export async function updateClass({ originalId, updatedClass }: { originalId: string, updatedClass: Class }): Promise<void> {
    const appData = getLocalData();
     if (originalId !== updatedClass.id && appData.classes.some(c => c.id === updatedClass.id)) {
        throw new Error("Mã lớp đã tồn tại.");
    }
    appData.classes = appData.classes.map(c => c.id === originalId ? updatedClass : c);
    setLocalData(appData);
}

export async function deleteClass(classId: string): Promise<void> {
    const appData = getLocalData();
    appData.classes = appData.classes.filter(c => c.id !== classId);
    // Also remove attendance and reports for this class to prevent orphaned data
    appData.attendance = appData.attendance.filter(a => a.classId !== classId);
    appData.progressReports = appData.progressReports.filter(pr => pr.classId !== classId);
    setLocalData(appData);
}

export const updateIncome = (item: Income) => updateDoc('income', item.id, item);
export const deleteIncome = (itemId: string) => deleteDoc('income', itemId);
export const updateExpense = (item: Expense) => updateDoc('expenses', item.id, item);
export const deleteExpense = (itemId: string) => deleteDoc('expenses', itemId);
export const deleteAnnouncement = (id: string) => deleteDoc('announcements', id);

// --- Settings ---
export async function updateSettings(settings: CenterSettings): Promise<void> {
    const appData = getLocalData();
    appData.settings = settings;
    setLocalData(appData);
}

export async function completeOnboardingStep(step: string): Promise<void> {
    const appData = getLocalData();
    if (!appData.settings.onboardingStepsCompleted.includes(step)) {
        appData.settings.onboardingStepsCompleted.push(step);
    }
    setLocalData(appData);
}

// --- Complex Operations ---
export async function updateAttendance(records: AttendanceRecord[]): Promise<void> {
    const appData = getLocalData();
    const recordsMap = new Map(records.map(r => [`${r.classId}-${r.date}-${r.studentId}`, r]));
    
    // Filter out old records for the specific class/date combos being updated
    const updatedAttendance = appData.attendance.filter(existing => {
        const key = `${existing.classId}-${existing.date}-${existing.studentId}`;
        return !recordsMap.has(key);
    });

    // Add the new/updated records
    records.forEach(record => {
        // Ensure an ID exists
        const recordWithId = { ...record, id: record.id || generateUniqueId('ATT') };
        updatedAttendance.push(recordWithId);
    });

    appData.attendance = updatedAttendance;
    setLocalData(appData);
}

export async function generateInvoices({ month, year }: { month: number, year: number }): Promise<void> {
    const appData = getLocalData();
    const monthStr = `${year}-${String(month).padStart(2, '0')}`;
    const activeStudents = appData.students.filter(s => s.status === PersonStatus.ACTIVE);

    for (const student of activeStudents) {
        let totalAmount = 0;
        let details = '';
        let totalSessions = 0;
        const studentClasses = appData.classes.filter(c => c.studentIds.includes(student.id));

        for (const cls of studentClasses) {
            let classFee = 0;
            const attendedSessions = appData.attendance.filter(a =>
                a.studentId === student.id && a.classId === cls.id && a.date.startsWith(monthStr) &&
                (a.status === AttendanceStatus.PRESENT || a.status === AttendanceStatus.LATE)
            ).length;

            totalSessions += attendedSessions;

            if (attendedSessions > 0) { // Only charge if they attended
                if (cls.fee.type === FeeType.MONTHLY || cls.fee.type === FeeType.PER_COURSE) {
                    classFee = cls.fee.amount;
                    const feeTypeStr = cls.fee.type === FeeType.MONTHLY ? 'tháng' : 'khóa';
                    details += `- Lớp ${cls.name}: ${classFee.toLocaleString('vi-VN')} ₫ (${feeTypeStr})\n`;
                } else if (cls.fee.type === FeeType.PER_SESSION) {
                    classFee = attendedSessions * cls.fee.amount;
                    details += `- Lớp ${cls.name}: ${attendedSessions} buổi x ${cls.fee.amount.toLocaleString('vi-VN')} ₫ = ${classFee.toLocaleString('vi-VN')} ₫\n`;
                }
            }
            totalAmount += classFee;
        }

        const transactionDescription = `Hóa đơn học phí tháng ${month}/${year}`;
        const existingInvoiceIndex = appData.invoices.findIndex(inv => inv.studentId === student.id && inv.month === monthStr);

        if (existingInvoiceIndex !== -1) { // Update existing invoice
            const existingInvoice = appData.invoices[existingInvoiceIndex];
            if (existingInvoice.status === 'UNPAID' && (totalAmount !== existingInvoice.amount)) {
                const amountDifference = totalAmount - existingInvoice.amount;
                appData.invoices[existingInvoiceIndex].amount = totalAmount;
                appData.invoices[existingInvoiceIndex].details = details.trim();

                const studentIndex = appData.students.findIndex(s => s.id === student.id);
                if (studentIndex !== -1) appData.students[studentIndex].balance -= amountDifference;
                
                const relatedTransactionIndex = appData.transactions.findIndex(t => t.relatedInvoiceId === existingInvoice.id);
                if(relatedTransactionIndex !== -1) {
                    appData.transactions[relatedTransactionIndex].amount = -totalAmount;
                }
            }
        } else if (totalAmount > 0) { // Create new invoice
            const invoiceId = generateUniqueId('INV');
            const newInvoice: Invoice = {
                id: invoiceId, studentId: student.id, studentName: student.name, month: monthStr,
                amount: totalAmount, details: details.trim(), status: 'UNPAID',
                generatedDate: new Date().toISOString().split('T')[0], paidDate: null,
            };
            appData.invoices.push(newInvoice);

            const newTransaction: Transaction = {
                id: generateUniqueId('TRX'), studentId: student.id, date: new Date().toISOString().split('T')[0],
                type: TransactionType.INVOICE, description: transactionDescription,
                amount: -totalAmount, relatedInvoiceId: invoiceId,
            };
            appData.transactions.push(newTransaction);
            
            const studentIndex = appData.students.findIndex(s => s.id === student.id);
            if (studentIndex !== -1) appData.students[studentIndex].balance -= totalAmount;
        }
    }
    setLocalData(appData);
}

export async function cancelInvoice(invoiceId: string): Promise<void> {
    const appData = getLocalData();
    const invoice = appData.invoices.find(inv => inv.id === invoiceId);
    if (!invoice || invoice.status === 'CANCELLED') return;
    if (invoice.status === 'PAID') throw new Error("Không thể hủy hóa đơn đã thanh toán.");

    invoice.status = 'CANCELLED';

    const transaction: Transaction = {
        id: generateUniqueId('TRX'), studentId: invoice.studentId, date: new Date().toISOString().split('T')[0],
        type: TransactionType.ADJUSTMENT_CREDIT, description: `Hủy hóa đơn #${invoiceId}`,
        amount: invoice.amount, relatedInvoiceId: invoiceId,
    };
    appData.transactions.push(transaction);

    const student = appData.students.find(s => s.id === invoice.studentId);
    if (student) student.balance += invoice.amount;

    setLocalData(appData);
}

export async function addAdjustment(payload: { studentId: string; amount: number; date: string; description: string; type: 'CREDIT' | 'DEBIT' }): Promise<void> {
    const appData = getLocalData();
    const finalAmount = payload.type === 'CREDIT' ? payload.amount : -payload.amount;

    const transaction: Transaction = {
        id: generateUniqueId('TRX'), studentId: payload.studentId, date: payload.date,
        type: payload.type === 'CREDIT' ? TransactionType.PAYMENT : TransactionType.ADJUSTMENT_DEBIT,
        description: payload.description, amount: finalAmount,
    };
    appData.transactions.push(transaction);

    const student = appData.students.find(s => s.id === payload.studentId);
    if (student) student.balance += finalAmount;
    
    setLocalData(appData);
}

export async function updateTransaction(transaction: Transaction): Promise<void> {
    const appData = getLocalData();
    const oldTransaction = appData.transactions.find(t => t.id === transaction.id);
    if (!oldTransaction) throw new Error("Giao dịch không tồn tại.");

    const amountDifference = transaction.amount - oldTransaction.amount;
    
    appData.transactions = appData.transactions.map(t => t.id === transaction.id ? transaction : t);
    
    const student = appData.students.find(s => s.id === transaction.studentId);
    if (student) student.balance += amountDifference;

    setLocalData(appData);
}

export async function deleteTransaction(transactionId: string): Promise<void> {
    const appData = getLocalData();
    const transaction = appData.transactions.find(t => t.id === transactionId);
    if (!transaction) throw new Error("Giao dịch không tồn tại.");

    appData.transactions = appData.transactions.filter(t => t.id !== transactionId);
    
    const student = appData.students.find(s => s.id === transaction.studentId);
    if (student) student.balance -= transaction.amount;

    setLocalData(appData);
}

export const updateInvoiceStatus = async ({ invoiceId, status }: { invoiceId: string, status: 'PAID' | 'UNPAID' | 'CANCELLED' }) => {
    const appData = getLocalData();
    const invoice = appData.invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
        invoice.status = status;
        if (status === 'PAID') invoice.paidDate = new Date().toISOString().split('T')[0];
        setLocalData(appData);
    }
}

export async function generatePayrolls({ month, year }: { month: number, year: number }): Promise<void> {
    const appData = getLocalData();
    const monthStr = `${year}-${String(month).padStart(2, '0')}`;

    for(const teacher of appData.teachers.filter(t => t.status === PersonStatus.ACTIVE)) {
        let totalSalary = 0;
        let sessionsTaught = 0;
        
        if (teacher.salaryType === SalaryType.MONTHLY) {
            totalSalary = teacher.rate;
        } else {
            const teacherClasses = appData.classes.filter(c => c.teacherIds.includes(teacher.id));
            const distinctSessions = new Set<string>();
            appData.attendance.forEach(a => {
                if (a.date.startsWith(monthStr) && teacherClasses.some(c => c.id === a.classId)) {
                    distinctSessions.add(`${a.classId}-${a.date}`);
                }
            });
            sessionsTaught = distinctSessions.size;
            totalSalary = sessionsTaught * teacher.rate;
        }

        const payrollId = `PAY-${teacher.id}-${monthStr}`;
        const newPayroll: Payroll = {
            id: payrollId, teacherId: teacher.id, teacherName: teacher.name, month: monthStr,
            sessionsTaught, rate: teacher.rate, baseSalary: teacher.salaryType === SalaryType.MONTHLY ? teacher.rate : 0,
            totalSalary, calculationDate: new Date().toISOString().split('T')[0],
        };

        const existingIndex = appData.payrolls.findIndex(p => p.id === payrollId);
        if (existingIndex !== -1) {
            appData.payrolls[existingIndex] = newPayroll;
        } else {
            appData.payrolls.push(newPayroll);
        }
    }
    setLocalData(appData);
}

// --- Data Management ---
export const backupData = async (): Promise<Omit<AppState, 'loading'>> => Promise.resolve(getLocalData());

export async function restoreData(data: AppState): Promise<void> {
    setLocalData(data);
}

export async function resetToMockData(): Promise<void> {
    localStorage.removeItem(APP_DATA_KEY);
    // getLocalData will create and save a fresh state with mock data
    getLocalData();
}

export const deleteAttendanceForDate = async ({ classId, date }: { classId: string, date: string }) => {
    const appData = getLocalData();
    appData.attendance = appData.attendance.filter(a => !(a.classId === classId && a.date === date));
    setLocalData(appData);
}

export const updateUserPassword = async ({ userId, role, newPassword }: { userId: string, role: UserRole, newPassword: string }) => {
    const appData = getLocalData();
    let user: Student | Teacher | Staff | undefined;
    switch (role) {
        case UserRole.PARENT: user = appData.students.find(u => u.id === userId); break;
        case UserRole.TEACHER: user = appData.teachers.find(u => u.id === userId); break;
        case UserRole.MANAGER:
        case UserRole.ACCOUNTANT: user = appData.staff.find(u => u.id === userId); break;
        default: throw new Error('Invalid role for password update.');
    }
    if (user) {
        user.password = newPassword;
        setLocalData(appData);
    } else {
        throw new Error('User not found.');
    }
}

export const clearCollections = async (collectionKeys: ('students' | 'teachers' | 'staff' | 'classes')[]) => {
    const appData = getLocalData();
    for (const key of collectionKeys) {
        (appData[key] as any) = [];
        if (key === 'students') {
            appData.attendance = [];
            appData.invoices = [];
            appData.progressReports = [];
            appData.transactions = [];
            appData.classes = appData.classes.map(c => ({...c, studentIds: []}));
        }
        if (key === 'teachers') {
            appData.payrolls = [];
            appData.classes = appData.classes.map(c => ({...c, teacherIds: []}));
        }
        if (key === 'classes') {
            appData.attendance = [];
            appData.progressReports = [];
        }
    }
    setLocalData(appData);
}

export const deleteAttendanceByMonth = async ({ month, year }: { month: number, year: number }) => {
    const appData = getLocalData();
    const monthStr = `${year}-${String(month).padStart(2, '0')}`;
    appData.attendance = appData.attendance.filter(a => !a.date.startsWith(monthStr));
    setLocalData(appData);
}