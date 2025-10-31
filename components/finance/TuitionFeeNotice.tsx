import React, { useMemo, forwardRef } from 'react';
import { useData } from '../../hooks/useDataContext';
import { Invoice, Transaction, TransactionType } from '../../types';

interface TuitionFeeNoticeProps {
    invoice: Invoice;
}

const formatCurrency = (amount: number) => `${Math.round(amount).toLocaleString('vi-VN')} ₫`;

// For the 'addInfo' QR parameter, which should be compact
const normalizeInfoName = (name: string) => {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/\s+/g, '');
};

// For the 'accountName' QR parameter, which should be uppercase without accents
const normalizeAccountName = (name: string) => {
    return name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toUpperCase();
};

export const TuitionFeeNotice = forwardRef<HTMLDivElement, TuitionFeeNoticeProps>(({ invoice }, ref) => {
    const { state } = useData();
    const { students, transactions, settings } = state;

    const student = useMemo(() => students.find(s => s.id === invoice.studentId), [students, invoice]);

    const financialData = useMemo(() => {
        if (!student) {
            return { outstandingDebt: 0, openingCredit: 0, totalDue: 0 };
        }

        // The student's balance is the most up-to-date, real-time balance.
        const currentRealTimeBalance = student.balance;

        // This invoice's amount was already debited from the student's balance.
        // To find the balance *just before* this invoice ("Dư nợ kỳ trước"), we must reverse this single transaction.
        // The transaction amount for an invoice is negative.
        const relatedTransaction = transactions.find(t => t.relatedInvoiceId === invoice.id && t.type === TransactionType.INVOICE);
        
        // If we find the related transaction, we use its exact amount. If not, we fall back to the invoice amount.
        // This is safer as the transaction is the source of truth for balance changes.
        const thisInvoiceDebitAmount = relatedTransaction ? relatedTransaction.amount : -invoice.amount;
        
        // Balance before = current balance - this transaction's effect.
        // e.g., current = -500, transaction = -300. Before = -500 - (-300) = -200.
        const balanceBeforeThisInvoice = currentRealTimeBalance - thisInvoiceDebitAmount;

        const outstandingDebt = balanceBeforeThisInvoice < 0 ? -balanceBeforeThisInvoice : 0;
        const openingCredit = balanceBeforeThisInvoice > 0 ? balanceBeforeThisInvoice : 0;
        
        // The total amount due for this specific notice is the old debt + new fee - old credit.
        const totalDue = outstandingDebt + invoice.amount - openingCredit;

        return {
            outstandingDebt,
            openingCredit,
            totalDue: Math.max(0, totalDue), // Total due cannot be negative
        };
    }, [student, transactions, invoice]);

    const qrCodeUrl = useMemo(() => {
        const { bankAccountNumber, bankBin, bankAccountHolder } = settings;
        if (!bankAccountNumber || !bankBin || !student || financialData.totalDue <= 0) {
            return null;
        }

        const [year, month] = invoice.month.split('-');
        const description = `${normalizeInfoName(student.name)}HP${month}${year.slice(-2)}`;
        
        const params: Record<string, string> = {
            amount: Math.round(financialData.totalDue).toString(),
            addInfo: description,
        };
        
        if (bankAccountHolder) {
            params.accountName = normalizeAccountName(bankAccountHolder);
        }
        
        return `https://img.vietqr.io/image/${bankBin}-${bankAccountNumber}-compact2.png?${new URLSearchParams(params).toString()}`;

    }, [settings, student, invoice, financialData.totalDue]);


    if (!student) return <div ref={ref}>Học viên không tồn tại.</div>;

    const { outstandingDebt, openingCredit, totalDue } = financialData;

    return (
        <div ref={ref} className="bg-white p-4 text-gray-900" style={{ fontFamily: "Arial, sans-serif", width: '148mm', margin: '0 auto', border: '1px solid #eee' }}>
            {/* Header */}
            <header className="text-center pb-2 border-b border-gray-300">
                {settings.logoUrl ? (
                    <img src={settings.logoUrl} alt="Logo" className="h-16 w-auto mx-auto mb-2" />
                ) : (
                    <h1 className="text-2xl font-bold" style={{ color: settings.themeColor }}>{settings.name}</h1>
                )}
                <div className="text-xs text-gray-600 mt-1">
                    <p>{settings.address}</p>
                    <p>ĐT: {settings.phone}</p>
                </div>
            </header>

            {/* Title */}
            <div className="text-center my-3">
                <h2 className="text-xl font-bold uppercase tracking-wider">Phiếu Báo Học Phí</h2>
                <p className="text-gray-600 font-semibold text-sm">Kỳ: Tháng {invoice.month.split('-')[1]}/{invoice.month.split('-')[0]}</p>
            </div>

            {/* Student Info */}
            <section className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-3 text-xs">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <p><span className="font-bold">Họ và tên HS:</span> {student.name}</p>
                    <p><span className="font-bold">Mã số HS:</span> {student.id}</p>
                    <p><span className="font-bold">Phụ huynh:</span> {student.parentName || student.name}</p>
                    <p><span className="font-bold">Ngày lập phiếu:</span> {new Date(invoice.generatedDate).toLocaleDateString('vi-VN')}</p>
                </div>
            </section>

            {/* Financial Details Table */}
            <table className="w-full text-left text-xs mb-2">
                <thead className="bg-gray-100 border-b-2 border-gray-300">
                    <tr className="font-bold">
                        <th className="py-2 px-3 uppercase w-2/3 tracking-wider">Diễn giải</th>
                        <th className="py-2 px-3 uppercase text-right tracking-wider">Số tiền</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="border-b border-gray-200">
                        <td className="py-2 px-3">Dư nợ kỳ trước</td>
                        <td className="py-2 px-3 text-right">{formatCurrency(outstandingDebt)}</td>
                    </tr>
                     <tr className="border-b border-gray-200">
                        <td className="py-2 px-3">Số dư/Đã trả kỳ trước</td>
                        <td className="py-2 px-3 text-right text-green-600">-{formatCurrency(openingCredit)}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                        <td className="py-2 px-3 align-top">
                            <p className="font-semibold">Học phí phát sinh tháng {invoice.month.split('-')[1]}/{invoice.month.split('-')[0]}</p>
                            <pre className="text-xs text-gray-500 whitespace-pre-wrap font-[inherit] mt-1 pl-2">{invoice.details}</pre>
                        </td>
                        <td className="py-2 px-3 text-right align-top font-semibold">{formatCurrency(invoice.amount)}</td>
                    </tr>
                </tbody>
            </table>
            
            <div className="w-full border-t-2 border-b-2 p-3 flex justify-between items-center my-2" style={{ borderColor: settings.themeColor, backgroundColor: `${settings.themeColor}10` }}>
                <span className="text-base font-bold uppercase" style={{ color: settings.themeColor }}>Tổng thanh toán</span>
                <span className="text-2xl font-bold" style={{ color: settings.themeColor }}>{formatCurrency(totalDue)}</span>
            </div>

            {/* Payment Info */}
            <section className="pt-2 mt-2 border-t border-dashed border-gray-400 text-xs">
                 <h3 className="font-bold mb-2 uppercase text-center">Thông tin thanh toán</h3>
                 <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                        <p><span className="font-semibold">Ngân hàng:</span> {settings.bankName}</p>
                        <p><span className="font-semibold">Số tài khoản:</span> {settings.bankAccountNumber}</p>
                        <p><span className="font-semibold">Chủ tài khoản:</span> {settings.bankAccountHolder}</p>
                        <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded">
                            <span className="font-bold">Nội dung CK (quan trọng): </span>
                            <span className="text-red-600 font-mono">{`${normalizeInfoName(student.name)}HP${invoice.month.split('-')[1]}${invoice.month.split('-')[0].slice(-2)}`}</span>
                        </div>
                    </div>
                    {qrCodeUrl && (
                        <div className="text-center">
                            <img src={qrCodeUrl} alt="QR Code Thanh toán" className="w-28 h-28" />
                            <p className="mt-1 font-semibold">Quét mã để thanh toán</p>
                        </div>
                    )}
                 </div>
            </section>

            {/* Footer */}
            <footer className="text-center text-xs text-gray-500 mt-3 pt-2 border-t border-gray-300">
                <p>Cảm ơn quý phụ huynh đã tin tưởng!</p>
                <p>Vui lòng thanh toán học phí khi nhận được phiếu!</p>
            </footer>
        </div>
    );
});