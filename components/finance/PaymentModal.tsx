import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { CurrencyInput } from '../common/CurrencyInput';
import { Student } from '../../types';
import { useData } from '../../hooks/useDataContext';
import { useToast } from '../../hooks/useToast';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: Student | null;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, student }) => {
    const { addAdjustment } = useData();
    const { toast } = useToast();
    const [amount, setAmount] = useState(0);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && student) {
            if (student.balance < 0) {
                setAmount(Math.abs(student.balance));
            } else {
                setAmount(0);
            }
            setDate(new Date().toISOString().split('T')[0]); // Reset date on open
        }
    }, [student, isOpen]);

    if (!student) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (amount <= 0) {
            toast.error("Số tiền thanh toán phải lớn hơn 0.");
            return;
        }
        setIsLoading(true);
        try {
            await addAdjustment({
                studentId: student.id,
                amount: amount,
                date: date,
                description: `Thanh toán học phí trực tiếp`,
                type: 'CREDIT',
            });
            toast.success(`Ghi nhận thanh toán ${amount.toLocaleString('vi-VN')} ₫ cho ${student.name}.`);
            onClose();
        } catch (error) {
            toast.error("Lỗi khi ghi nhận thanh toán.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Ghi nhận thanh toán cho ${student.name}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium">Số tiền thanh toán (VND)</label>
                    <CurrencyInput value={amount} onChange={setAmount} className="form-input mt-1" />
                </div>
                <div>
                    <label className="block text-sm font-medium">Ngày thanh toán</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="form-input mt-1" required />
                </div>
                <div className="flex justify-end gap-4 pt-4 border-t dark:border-gray-700">
                    <Button type="button" variant="secondary" onClick={onClose}>Hủy</Button>
                    <Button type="submit" isLoading={isLoading}>Ghi nhận</Button>
                </div>
            </form>
        </Modal>
    );
};
