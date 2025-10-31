import React, { useMemo } from 'react';
import { Student, Transaction, CenterSettings, TransactionType } from '../../types';

interface DebtNoticeProps {
    student: Student;
    transactions: Transaction[];
    settings: CenterSettings;
}

const formatCurrency = (amount: number) => `${Math.round(amount).toLocaleString('vi-VN')} ₫`;

const normalizeInfoName = (name: string) => {
    return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').replace(/\s+/g, '');
};

const normalizeAccountName = (name: string) => {
    return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toUpperCase();
};

const transactionTypeMap: Record<TransactionType, string> = {
    [TransactionType.INVOICE]: 'Hóa đơn học phí',
    [TransactionType.PAYMENT]: 'Thanh toán',
    [TransactionType.ADJUSTMENT_CREDIT]: 'Điều chỉnh (ghi có)',
    [TransactionType.ADJUSTMENT_DEBIT]: 'Phí phát sinh',
};

export const DebtNotice: React.FC<DebtNoticeProps> = ({ student, transactions, settings }) => {
    const totalDue = student.balance < 0 ? Math.abs(student.balance) : 0;

    const recentTransactions = useMemo(() => {
        return [...transactions]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 8); // show last 8 transactions
    }, [transactions]);


    const qrCodeUrl = useMemo(() => {
        const { bankAccountNumber, bankBin, bankAccountHolder } = settings;
        if (!bankAccountNumber || !bankBin || totalDue <= 0) {
            return null;
        }
        const description = `${normalizeInfoName(student.name)}ThanhToanHP`;
        
        const params: Record<string, string> = {
            amount: Math.round(totalDue).toString(),
            addInfo: description,
        };
        
        if (bankAccountHolder) {
            params.accountName = normalizeAccountName(bankAccountHolder);
        }
        
        return `https://img.vietqr.io/image/${bankBin}-${bankAccountNumber}-compact2.png?${new URLSearchParams(params).toString()}`;
    }, [settings, student.name, totalDue]);

    return (
        <div className="bg-white p-2 text-gray-900 border border-gray-300 flex flex-col" style={{ fontFamily: "Arial, sans-serif" }}>
            <header className="text-center pb-1 border-b border-gray-200">
                <h1 className="text-sm font-bold" style={{ color: settings.themeColor }}>{settings.name}</h1>
                <p className="text-[8px] text-gray-500">{settings.address} - ĐT: {settings.phone}</p>
            </header>

            <div className="text-center my-1">
                <h2 className="text-base font-bold uppercase tracking-wide">Thông Báo Học Phí</h2>
                <p className="text-gray-600 text-[10px]">Ngày lập: {new Date().toLocaleDateString('vi-VN')}</p>
            </div>

            <section className="bg-gray-50 p-1.5 rounded border border-gray-200 mb-2 text-sm">
                <p><span className="font-bold">Học viên:</span> {student.name}</p>
            </section>

            <div className="flex-grow overflow-y-auto relative" style={{ maxHeight: '150px' }}>
                <table className="w-full text-left text-[9px]">
                    <thead className="bg-gray-100 sticky top-0">
                        <tr className="font-bold">
                            <th className="py-1 px-1.5 w-1/4">Ngày</th>
                            <th className="py-1 px-1.5 w-1/2">Diễn giải</th>
                            <th className="py-1 px-1.5 text-right">Số tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentTransactions.map(t => (
                            <tr key={t.id} className="border-b border-gray-100">
                                <td className="py-1 px-1.5">{t.date}</td>
                                <td className="py-1 px-1.5">{t.description}</td>
                                <td className={`py-1 px-1.5 text-right ${t.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(t.amount)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div className="w-full border-t-2 border-b-2 p-2 flex justify-between items-center mt-2" style={{ borderColor: settings.themeColor, backgroundColor: `${settings.themeColor}10` }}>
                <span className="text-xs font-bold uppercase" style={{ color: settings.themeColor }}>Tổng Cộng Cần Thanh Toán</span>
                <span className="text-base font-bold" style={{ color: settings.themeColor }}>{formatCurrency(totalDue)}</span>
            </div>

            <section className="pt-1 mt-1 text-[9px] flex justify-between items-start gap-2">
                 <div>
                    <p className="font-bold">Thông tin thanh toán:</p>
                    <p>{settings.bankName} - {settings.bankAccountNumber}</p>
                    <p>{settings.bankAccountHolder}</p>
                    <div className="mt-1 px-2 py-1 bg-yellow-100 border border-yellow-300 rounded">
                        <span className="font-bold">Nội dung CK: </span>
                        <span className="text-red-600 font-mono text-[10px]">{`${normalizeInfoName(student.name)}ThanhToanHP`}</span>
                    </div>
                </div>
                {qrCodeUrl && (
                    <div className="text-center flex-shrink-0">
                        <img src={qrCodeUrl} alt="QR Code" className="w-20 h-20" />
                        <p className="text-[8px] font-semibold">Quét mã</p>
                    </div>
                )}
            </section>
        </div>
    );
};