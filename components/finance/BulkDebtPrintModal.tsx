import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { DebtNotice } from './DebtNotice';
import { Student, Transaction } from '../../types';
import { useData } from '../../hooks/useDataContext';
import { ICONS } from '../../constants';

interface BulkDebtPrintModalProps {
    isOpen: boolean;
    onClose: () => void;
    students: Student[];
}

declare global {
    interface Window {
        html2canvas: any;
    }
}

export const BulkDebtPrintModal: React.FC<BulkDebtPrintModalProps> = ({ isOpen, onClose, students }) => {
    const { state } = useData();
    const { transactions, settings } = state;
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
    
    // For individual image export
    const [isExporting, setIsExporting] = useState(false);
    const [exportQueue, setExportQueue] = useState<Student[]>([]);
    const exportRef = useRef<HTMLDivElement>(null);

    const selectedStudents = useMemo(() => {
        const studentMap = new Map(students.map(s => [s.id, s]));
        return selectedStudentIds.map(id => studentMap.get(id)).filter(Boolean) as Student[];
    }, [selectedStudentIds, students]);

    const studentToPreview = useMemo(() => {
        return selectedStudents.length > 0 ? selectedStudents[0] : null;
    }, [selectedStudents]);

    const handleToggleStudent = (id: string) => {
        setSelectedStudentIds(prev =>
            prev.includes(id) ? prev.filter(studentId => studentId !== id) : [...prev, id]
        );
    };

    const handleToggleAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedStudentIds(students.map(s => s.id));
        } else {
            setSelectedStudentIds([]);
        }
    };

    // --- Individual Image Export Logic ---
    const handleStartExport = () => {
        if (selectedStudents.length > 0) {
            setIsExporting(true);
            setExportQueue(selectedStudents);
        }
    };

    useEffect(() => {
        if (isExporting && exportQueue.length > 0) {
            const studentToExport = exportQueue[0];
            // Rendered in hidden div, wait for DOM update
            setTimeout(async () => {
                const element = exportRef.current;
                if (element && window.html2canvas) {
                    try {
                        const canvas = await window.html2canvas(element, { scale: 2.5, useCORS: true });
                        const link = document.createElement('a');
                        link.download = `ThongBaoHocPhi_${studentToExport.id}_${studentToExport.name}.png`;
                        link.href = canvas.toDataURL('image/png');
                        link.click();
                    } catch(err) {
                        console.error("Failed to export image for ", studentToExport.name, err);
                    } finally {
                         // Move to the next student
                        setExportQueue(q => q.slice(1));
                    }
                }
            }, 150); // Delay to ensure render is complete
        } else if (isExporting && exportQueue.length === 0) {
            setIsExporting(false); // Finished
        }
    }, [exportQueue, isExporting]);
    
    const getStudentTransactions = (studentId: string): Transaction[] => {
        return transactions
            .filter(t => t.studentId === studentId)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }


    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Xuất Thông Báo Học Phí">
            {/* Hidden area for exporting individual images */}
             <div ref={exportRef} style={{ position: 'absolute', left: '-9999px', width: '10.5cm' }}>
                {isExporting && exportQueue.length > 0 && (
                    <DebtNotice
                        student={exportQueue[0]}
                        transactions={getStudentTransactions(exportQueue[0].id)}
                        settings={settings}
                    />
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Controls */}
                <div className="md:col-span-1 space-y-4">
                    <div>
                        <h3 className="font-semibold mb-2">Chọn học viên ({selectedStudentIds.length}/{students.length})</h3>
                        <div className="border rounded-md dark:border-gray-600 max-h-80 overflow-y-auto">
                            <label className="flex items-center p-2 border-b dark:border-gray-600 bg-gray-50 dark:bg-gray-700 sticky top-0">
                                <input
                                    type="checkbox"
                                    checked={selectedStudentIds.length === students.length && students.length > 0}
                                    onChange={handleToggleAll}
                                    className="h-4 w-4"
                                />
                                <span className="ml-3 text-sm font-semibold">Chọn tất cả</span>
                            </label>
                            {students.map(student => (
                                <label key={student.id} className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedStudentIds.includes(student.id)}
                                        onChange={() => handleToggleStudent(student.id)}
                                        className="h-4 w-4"
                                    />
                                    <span className="ml-3 text-sm">{student.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2 pt-4 border-t dark:border-gray-700">
                         <Button onClick={handleStartExport} isLoading={isExporting} disabled={selectedStudents.length === 0} className="w-full">
                             {isExporting ? `Đang xuất ${selectedStudents.length - exportQueue.length + 1}/${selectedStudents.length}...` : <>{ICONS.download} Xuất ảnh ({selectedStudents.length} tệp)</>}
                         </Button>
                    </div>
                </div>

                {/* Preview */}
                <div className="md:col-span-2 bg-gray-200 dark:bg-gray-900 p-4">
                    <h3 className="text-center font-semibold mb-2">Xem trước Phiếu báo</h3>
                    <div className="bg-white shadow-lg mx-auto" style={{ width: '148mm' }}>
                         {studentToPreview ? (
                            <DebtNotice
                                student={studentToPreview}
                                transactions={getStudentTransactions(studentToPreview.id)}
                                settings={settings}
                            />
                        ) : (
                            <div className="h-64 flex items-center justify-center text-gray-500">
                                Chọn một học viên để xem trước.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
};