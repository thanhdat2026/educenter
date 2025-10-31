import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useDataContext';
import { ROUTES, ICONS } from '../../constants';
import { Student } from '../../types';
import { ChangePasswordModal } from '../auth/ChangePasswordModal';

export const ParentHeader: React.FC = () => {
    const { user, logout } = useAuth();
    const { state } = useData();
    const student = user as Student;
    const [isChangePasswordModalOpen, setChangePasswordModalOpen] = useState(false);

    const navLinks = [
        { to: ROUTES.PARENT_DASHBOARD, label: 'Tổng quan' },
        { to: ROUTES.PARENT_REPORTS, label: 'Báo cáo Học tập' },
        { to: ROUTES.PARENT_FINANCE, label: 'Học phí' },
    ];

    const getLinkClass = ({ isActive }: { isActive: boolean }) => {
        const base = "px-3 py-2 rounded-md text-sm font-medium transition-colors";
        const active = "bg-gray-100 dark:bg-gray-700 text-primary";
        const inactive = "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700";
        return isActive ? `${base} ${active}` : `${base} ${inactive}`;
    };

    return (
        <>
            <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
                <div className="container mx-auto px-4">
                    <div className="h-16 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                             <div className="h-10 flex items-center justify-center text-lg font-bold">
                                {state.settings.logoUrl 
                                    ? <img src={state.settings.logoUrl} alt="Logo" className="h-10 w-auto" /> 
                                    : <span className="text-gray-800 dark:text-white">{state.settings.name}</span>
                                }
                            </div>
                            <nav className="hidden md:flex items-center space-x-2">
                                 {navLinks.map(link => (
                                    <NavLink key={link.to} to={link.to} className={getLinkClass} end>
                                        {link.label}
                                    </NavLink>
                                ))}
                            </nav>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="font-semibold text-gray-800 dark:text-white">{student?.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Phụ huynh</p>
                            </div>
                            <button
                                onClick={() => setChangePasswordModalOpen(true)}
                                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                                title="Đổi mật khẩu"
                            >
                                {ICONS.key}
                            </button>
                            <button onClick={logout} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700" title="Đăng xuất">
                                {ICONS.logout}
                            </button>
                        </div>
                    </div>
                    {/* Mobile Navigation */}
                    <nav className="md:hidden flex items-center justify-around border-t dark:border-gray-700 py-2">
                        {navLinks.map(link => (
                            <NavLink key={link.to} to={link.to} className={getLinkClass} end>
                                {link.label}
                            </NavLink>
                        ))}
                    </nav>
                </div>
            </header>
            <ChangePasswordModal isOpen={isChangePasswordModalOpen} onClose={() => setChangePasswordModalOpen(false)} />
        </>
    );
};