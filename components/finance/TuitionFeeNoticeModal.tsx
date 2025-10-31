import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { TuitionFeeNotice } from './TuitionFeeNotice';
import { Invoice } from '../../types';
import { ICONS } from '../../constants';

interface TuitionFeeNoticeModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoice: Invoice | null;
}

export const TuitionFeeNoticeModal: React.FC<TuitionFeeNoticeModalProps> = ({ isOpen, onClose, invoice }) => {

    if (!invoice) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Chi tiết Hóa đơn #${invoice.id}`}>
            <TuitionFeeNotice invoice={invoice} />
        </Modal>
    );
};
