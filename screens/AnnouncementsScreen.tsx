import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../hooks/useDataContext';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { ICONS } from '../constants';
import { Announcement, UserRole } from '../types';
import { ConfirmationModal } from '../components/common/ConfirmationModal';

const AnnouncementForm: React.FC<{
    onSubmit: (data: { title: string; content: string }) => void;
    onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const titleInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        titleInputRef.current?.focus();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ title, content });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium">Tiêu đề</label>
                <input
                    ref={titleInputRef}
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="form-input mt-1"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium">Nội dung</label>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={6}
                    className="form-textarea mt-1"
                    required
                />
            </div>
            <div className="flex justify-end space-x-4 pt-4 border-t dark:border-gray-700">
                <Button type="button" variant="secondary" onClick={onCancel}>Hủy</Button>
                <Button type="submit">Đăng Thông báo</Button>
            </div>
        </form>
    );
};

export const AnnouncementsScreen: React.FC = () => {
    const { state, addAnnouncement, deleteAnnouncement } = useData();
    const { user, role } = useAuth();
    const { toast } = useToast();
    const [isModalOpen, setModalOpen] = useState(false);
    const [confirmModal, setConfirmModal] = useState<{ open: boolean; item?: Announcement }>({ open: false });

    const canManage = role === UserRole.ADMIN || role === UserRole.MANAGER;

    const handleAddAnnouncement = async (data: { title: string; content: string }) => {
        try {
            await addAnnouncement({
                ...data,
                createdAt: new Date().toISOString().split('T')[0],
                createdBy: user?.name || 'Admin',
            });
            toast.success('Đã đăng thông báo mới.');
            setModalOpen(false);
        } catch (error) {
            toast.error("Lỗi khi đăng thông báo.");
        }
    };

    const handleDelete = async () => {
        if (confirmModal.item) {
            try {
                await deleteAnnouncement(confirmModal.item.id);
                toast.success('Đã xóa thông báo.');
            } catch (error) {
                toast.error("Lỗi khi xóa.");
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-2xl font-bold">Quản lý Thông báo</h1>
                {canManage && (
                    <Button onClick={() => setModalOpen(true)}>
                        {ICONS.plus} Tạo Thông báo mới
                    </Button>
                )}
            </div>
            
            {state.announcements.length === 0 ? (
                <div className="card-base text-center text-gray-500 dark:text-gray-400">
                    <h3 className="text-lg font-semibold">Chưa có thông báo nào</h3>
                    <p className="mt-1">Hãy tạo thông báo đầu tiên để gửi đến nhân viên và phụ huynh.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {state.announcements.map(ann => (
                        <div key={ann.id} className="card-base">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-4">
                                        <h2 className="text-xl font-bold text-primary">{ann.title}</h2>
                                        {ann.classId && (
                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
                                                Lớp: {state.classes.find(c => c.id === ann.classId)?.name || 'N/A'}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Đăng ngày {ann.createdAt} bởi {ann.createdBy}
                                    </p>
                                </div>
                                {canManage && (
                                    <button
                                        onClick={() => setConfirmModal({open: true, item: ann})}
                                        className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50"
                                        title="Xóa thông báo"
                                    >
                                        {ICONS.delete}
                                    </button>
                                )}
                            </div>
                            <p className="mt-4 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{ann.content}</p>
                        </div>
                    ))}
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="Tạo Thông báo mới">
                <AnnouncementForm
                    onSubmit={handleAddAnnouncement}
                    onCancel={() => setModalOpen(false)}
                />
            </Modal>
            <ConfirmationModal
                isOpen={confirmModal.open}
                onClose={() => setConfirmModal({open: false})}
                onConfirm={handleDelete}
                title="Xác nhận Xóa Thông báo"
                message={<p>Bạn có chắc chắn muốn xóa thông báo "<strong>{confirmModal.item?.title}</strong>"?</p>}
            />
        </div>
    );
};