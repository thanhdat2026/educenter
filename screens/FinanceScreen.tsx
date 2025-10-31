
import React, { useMemo, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useData } from '../hooks/useDataContext';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import { Table, SortConfig, Column } from '../components/common/Table';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Card } from '../components/common/Card';
import { ICONS } from '../constants';
import { Invoice, Income, Expense, IncomeCategory, ExpenseCategory, UserRole } from '../types';
import { CurrencyInput } from '../components/common/CurrencyInput';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { Pagination } from '../components/common/Pagination';
import { ListItemCard } from '../components/common/ListItemCard';
import { TuitionFeeNotice } from '../components/finance/TuitionFeeNotice';
import { UnpaidStudentsReport } from '../components/finance/UnpaidStudentsReport';
import { TeacherPayrollTab } from '../components/finance/TeacherPayrollTab';
import { PayrollTab } from '../components/finance/PayrollTab';
import { InvoicesTab } from '../components/finance/InvoicesTab';
import { IncomeTab } from '../components/finance/IncomeTab';
import { ExpenseTab } from '../components/finance/ExpenseTab';

declare global {
    interface Window {
        html2canvas: any;
    }
}

type FinanceTab = 'overview' | 'debt_report' | 'invoices' | 'payroll' | 'income' | 'expenses' | 'my_payroll';
type Period = 'this_month' | 'last_month' | 'this_year';

const getPeriodDates = (period: Period): { start: string, end: string } => {
    const now = new Date();
    let startDate, endDate;

    switch (period) {
        case 'this_month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            break;
        case 'last_month':
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            endDate = new Date(now.getFullYear(), now.getMonth(), 0);
            break;
        case 'this_year':
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = new Date(now.getFullYear(), 11, 31);
            break;
    }

    return {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
    };
};

const ITEMS_PER_PAGE = 10;

type FilterState = {
    query: string;
    classId: string;
};

const OverviewTab: React.FC<{period: Period}> = ({period}) => {
    const { state } = useData();
    const { start, end } = getPeriodDates(period);

    const financialSummary = useMemo(() => {
        // Period-specific calculations
        const accrualRevenue = state.invoices
            .filter(i => i.generatedDate >= start && i.generatedDate <= end && i.status !== 'CANCELLED')
            .reduce((sum, i) => sum + i.amount, 0);

        const cashRevenue = state.transactions
            .filter(t => t.date >= start && t.date <= end && t.amount > 0)
            .reduce((sum, t) => sum + t.amount, 0);
        
        const totalExpenses = state.expenses
            .filter(e => e.date >= start && e.date <= end)
            .reduce((sum, e) => sum + e.amount, 0);
        
        // Overall (not period-specific) calculations
        const totalReceivables = state.students
            .filter(s => s.balance < 0)
            .reduce((sum, s) => sum + s.balance, 0);

        const totalCredit = state.students
            .filter(s => s.balance > 0)
            .reduce((sum, s) => sum + s.balance, 0);

        return {
            accrualRevenue,
            cashRevenue,
            totalExpenses,
            cashFlow: cashRevenue - totalExpenses,
            totalReceivables: Math.abs(totalReceivables),
            totalCredit
        };
    }, [state.invoices, state.transactions, state.expenses, state.students, start, end]);
    
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card title={`Doanh thu ghi nhận`} value={`${financialSummary.accrualRevenue.toLocaleString('vi-VN')} ₫`} icon={ICONS.reports} color="text-blue-600" />
                <Card title={`Thực thu trong kỳ`} value={`${financialSummary.cashRevenue.toLocaleString('vi-VN')} ₫`} icon={ICONS.finance} color="text-green-600" />
                <Card title={`Dòng tiền`} value={`${financialSummary.cashFlow.toLocaleString('vi-VN')} ₫`} icon={ICONS.dashboard} color={financialSummary.cashFlow >= 0 ? "text-teal-600" : "text-red-600"} />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title={`Tổng phải thu (Công nợ)`} value={`${financialSummary.totalReceivables.toLocaleString('vi-VN')} ₫`} icon={ICONS.students} color="text-red-500" />
                <Card title={`Tổng số dư KH`} value={`${financialSummary.totalCredit.toLocaleString('vi-VN')} ₫`} icon={ICONS.checkCircle} color="text-indigo-500" />
            </div>
        </div>
    )
}

export const FinanceScreen: React.FC = () => {
    const { role } = useAuth();
    const location = useLocation();
    
    const [activeTab, setActiveTab] = useState<FinanceTab>('overview');
    const [period, setPeriod] = useState<Period>('this_month');
    
    useEffect(() => {
        if (location.state?.defaultTab) {
            setActiveTab(location.state.defaultTab);
        }
    }, [location.state]);


    const TabButton: React.FC<{ tabId: FinanceTab; children: React.ReactNode, hidden?: boolean }> = ({ tabId, children, hidden }) => {
        if (hidden) return null;
        return (
            <button
                onClick={() => setActiveTab(tabId)}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tabId ? 'bg-primary text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
            >
                {children}
            </button>
        );
    }
    
    const canManageFullFinance = role === UserRole.ADMIN || role === UserRole.ACCOUNTANT;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Quản lý Tài chính</h1>

            <div className="flex flex-wrap items-center gap-2 border-b dark:border-gray-700 pb-2">
                <TabButton tabId="overview" hidden={!canManageFullFinance}>Tổng quan</TabButton>
                <TabButton tabId="invoices" hidden={!canManageFullFinance}>Hóa đơn</TabButton>
                <TabButton tabId="debt_report" hidden={!canManageFullFinance}>Công nợ</TabButton>
                <TabButton tabId="income" hidden={!canManageFullFinance}>Thu khác</TabButton>
                <TabButton tabId="expenses" hidden={!canManageFullFinance}>Chi phí</TabButton>
                <TabButton tabId="payroll" hidden={!canManageFullFinance}>Bảng lương</TabButton>
                <TabButton tabId="my_payroll" hidden={role !== UserRole.TEACHER}>Bảng lương của tôi</TabButton>
            </div>
            
            {(activeTab === 'overview' || activeTab === 'payroll' || activeTab === 'my_payroll') && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border dark:border-slate-700">
                    <label className="font-semibold whitespace-nowrap">Xem dữ liệu cho kỳ:</label>
                    <select value={period} onChange={e => setPeriod(e.target.value as Period)} className="form-select">
                        <option value="this_month">Tháng này</option>
                        <option value="last_month">Tháng trước</option>
                        <option value="this_year">Cả năm nay</option>
                    </select>
                </div>
            )}

            <div>
                {activeTab === 'overview' && canManageFullFinance && <OverviewTab period={period} />}
                {activeTab === 'invoices' && canManageFullFinance && <InvoicesTab />}
                {activeTab === 'debt_report' && canManageFullFinance && <UnpaidStudentsReport />}
                {activeTab === 'income' && canManageFullFinance && <IncomeTab />}
                {activeTab === 'expenses' && canManageFullFinance && <ExpenseTab />}
                {activeTab === 'payroll' && canManageFullFinance && <PayrollTab period={period} />}
                {activeTab === 'my_payroll' && role === UserRole.TEACHER && <TeacherPayrollTab period={period} />}
            </div>
        </div>
    );
};
