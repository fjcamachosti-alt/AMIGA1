
import React from 'react';
import { NAV_ITEMS } from '../../constants';
import { Page, UserRole, User } from '../../types';

interface SidebarProps {
    currentPage: Page;
    onNavigate: (page: Page) => void;
    isOpen: boolean;
    user: User | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, isOpen, user }) => {
    const baseClasses = "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200";
    const activeClasses = "bg-primary text-white";
    const inactiveClasses = "hover:bg-gray-700";

    const getVisibleItems = () => {
        if (!user) return [];

        const role = user.rol;
        const perms = user.permissions || { vehicles: false, employees: false, erp: false, operations: false };

        return NAV_ITEMS.filter(item => {
            switch (item.name) {
                case 'Dashboard':
                    return role === UserRole.Administrador;
                case 'Mi Perfil':
                    return role !== UserRole.Administrador; // Everyone except Admin needs this easy access, though admins have profile too, usually dashboard is home
                case 'Vehículos':
                    if (role === UserRole.Administrador || role === UserRole.Gestor) return true;
                    if (role === UserRole.Oficina) return perms.vehicles;
                    if (role === UserRole.Tecnico) return true; // View assigned vehicles
                    return false;
                case 'Empleados':
                    if (role === UserRole.Administrador || role === UserRole.Gestor) return true;
                    if (role === UserRole.Oficina) return perms.employees;
                    return false;
                case 'ERP':
                    if (role === UserRole.Administrador || role === UserRole.Gestor) return true;
                    if (role === UserRole.Oficina) return perms.erp;
                    return false;
                case 'Operaciones':
                    if (role === UserRole.Administrador || role === UserRole.Gestor) return true;
                    if (role === UserRole.Oficina) return perms.operations;
                    if (role === UserRole.Medico || role === UserRole.Tecnico) return true; // Specific sub-sections handled in page
                    return false;
                case 'Datos de Interés':
                    return role === UserRole.Administrador || role === UserRole.Gestor || role === UserRole.Oficina;
                case 'Calendario':
                    return role === UserRole.Administrador || role === UserRole.Oficina;
                default:
                    return true;
            }
        });
    };

    const visibleItems = getVisibleItems();

    return (
        <aside className={`bg-surface text-on-surface w-64 min-h-screen flex-shrink-0 fixed md:relative z-40 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out`}>
            <div className="p-6 border-b border-gray-700 flex items-center gap-3">
                <i data-lucide="ambulance" className="text-primary h-10 w-10"></i>
                <div>
                    <h2 className="text-2xl font-bold">AMIGA</h2>
                </div>
            </div>
            <nav className="p-4">
                <ul>
                    {visibleItems.map(item => (
                        <li key={item.name} className="mb-2">
                            <a
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    onNavigate(item.name);
                                }}
                                className={`${baseClasses} ${currentPage === item.name ? activeClasses : inactiveClasses}`}
                            >
                                {item.icon}
                                <span>{item.name}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};
