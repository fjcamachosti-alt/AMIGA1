
import React, { useState, useEffect, useMemo } from 'react';
import { User, UserRole } from '../../types';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { Modal } from '../../components/ui/Modal';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { UserForm } from '../users/UserForm';

interface AccountManagementProps {
    onBack: () => void;
}

export const AccountManagement: React.FC<AccountManagementProps> = ({ onBack }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        const data = await api.getUsers();
        setUsers(data);
        setLoading(false);
        setTimeout(() => window.lucide?.createIcons(), 0);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleNewUser = () => {
        setSelectedUser(null);
        setIsFormModalOpen(true);
    };
    
    const handleEditUser = (user: User) => {
        setSelectedUser(user);
        setIsFormModalOpen(true);
    };

    const handleOpenDeleteModal = (user: User) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
    };

    const handleSaveUser = async (user: User) => {
        await api.saveUser(user);
        fetchUsers();
        setIsFormModalOpen(false);
        setSelectedUser(null);
    };

    const handleDeleteUser = async () => {
        if (selectedUser) {
            await api.deleteUser(selectedUser.id);
            fetchUsers();
            setIsDeleteModalOpen(false);
            setSelectedUser(null);
        }
    };
    
    const filteredUsers = useMemo(() => {
        if (!searchTerm) return users;
        const term = searchTerm.toLowerCase();
        return users.filter(u => u.email.toLowerCase().includes(term) || u.nombre.toLowerCase().includes(term));
    }, [users, searchTerm]);

    const roleColors: Record<UserRole, string> = {
        [UserRole.Administrador]: 'bg-red-500/20 text-red-400',
        [UserRole.Gestor]: 'bg-yellow-500/20 text-yellow-400',
        [UserRole.Oficina]: 'bg-blue-500/20 text-blue-400',
        [UserRole.Tecnico]: 'bg-green-500/20 text-green-400',
        [UserRole.Medico]: 'bg-purple-500/20 text-purple-400',
    };


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                 <div className="flex items-center gap-4">
                     <button onClick={onBack} className="text-gray-400 hover:text-white"><i data-lucide="arrow-left"></i></button>
                    <h2 className="text-3xl font-bold">Gestión de Cuentas de Acceso</h2>
                </div>
                <Button onClick={handleNewUser} icon={<i data-lucide="user-plus"></i>}>
                    Nueva Cuenta
                </Button>
            </div>
            
            <div className="bg-surface p-4 rounded-lg shadow">
                 <div className="relative">
                    <input 
                        type="text"
                        placeholder="Buscar por Nombre o Email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md pl-10 pr-4 py-2 text-white"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i data-lucide="search" className="text-gray-400"></i>
                    </div>
                </div>
            </div>

            {loading ? <Spinner /> : (
                <div className="bg-surface rounded-lg shadow overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="p-4">Nombre</th>
                                <th className="p-4">Email (Usuario)</th>
                                <th className="p-4">Rol</th>
                                <th className="p-4">Estado</th>
                                <th className="p-4">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                    <td className="p-4 whitespace-nowrap">{user.nombre} {user.primerApellido}</td>
                                    <td className="p-4">{user.email}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${roleColors[user.rol]}`}>
                                            {user.rol}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.activo ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                            {user.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-4">
                                            <button onClick={() => handleEditUser(user)} className="text-primary hover:underline">Editar</button>
                                            <button onClick={() => handleOpenDeleteModal(user)} className="text-danger hover:underline">Eliminar</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={selectedUser ? 'Editar Cuenta' : 'Nueva Cuenta de Acceso'}>
                <UserForm 
                    user={selectedUser}
                    onSave={handleSaveUser}
                    onCancel={() => setIsFormModalOpen(false)}
                    isAccountManagement={true}
                />
            </Modal>
            
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteUser}
                title="Eliminar Cuenta"
                message={`¿Estás seguro de que quieres eliminar la cuenta de ${selectedUser?.nombre} ${selectedUser?.primerApellido}? Perderá el acceso a la aplicación.`}
            />
        </div>
    );
};