
import React, { useState, useEffect, useMemo } from 'react';
import { Shift, User } from '../../types';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { ShiftForm } from './ShiftForm';

interface ShiftPlanningProps {
    onBack: () => void;
}

export const ShiftPlanning: React.FC<ShiftPlanningProps> = ({ onBack }) => {
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

    const fetchShiftsAndUsers = async () => {
        setLoading(true);
        const [shiftsData, usersData] = await Promise.all([api.getShifts(), api.getUsers()]);
        setShifts(shiftsData);
        setUsers(usersData);
        setLoading(false);
        setTimeout(() => window.lucide?.createIcons(), 0);
    };

    useEffect(() => {
        fetchShiftsAndUsers();
    }, []);

    const handleNew = () => {
        setSelectedShift(null);
        setIsFormModalOpen(true);
    };
    
    const handleEdit = (shift: Shift) => {
        setSelectedShift(shift);
        setIsFormModalOpen(true);
    };

    const handleOpenDelete = (shift: Shift) => {
        setSelectedShift(shift);
        setIsDeleteModalOpen(true);
    };

    const handleSave = async (shift: Omit<Shift, 'id'> | Shift) => {
        const result = await api.saveShift(shift);
        if (result.success) {
            fetchShiftsAndUsers();
            setIsFormModalOpen(false);
            setSelectedShift(null);
        }
        return result;
    };
    
    const handleDelete = async () => {
        if (selectedShift) {
            await api.deleteShift(selectedShift.id);
            fetchShiftsAndUsers();
            setIsDeleteModalOpen(false);
            setSelectedShift(null);
        }
    };
    
    const getUserName = (userId: string) => {
        const user = users.find(u => u.id === userId);
        return user ? `${user.nombre} ${user.primerApellido}` : 'Usuario Desconocido';
    };
    
    const formatTime = (isoString: string) => new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                     <button onClick={onBack} className="text-gray-400 hover:text-white"><i data-lucide="arrow-left"></i></button>
                    <h2 className="text-3xl font-bold">Planificación de Turnos</h2>
                </div>
                <Button onClick={handleNew} icon={<i data-lucide="plus-circle"></i>}>
                    Nuevo Turno
                </Button>
            </div>
            {loading ? <Spinner/> : (
                <div className="bg-surface rounded-lg shadow p-4">
                    <h3 className="text-xl font-bold mb-4">Turnos de la Semana</h3>
                     <div className="space-y-4">
                        {shifts.sort((a,b) => new Date(a.start).getTime() - new Date(b.start).getTime()).map(shift => (
                            <div key={shift.id} className="bg-gray-800 p-3 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">{getUserName(shift.userId)}</p>
                                    <p className="text-sm text-gray-400">
                                        {new Date(shift.start).toLocaleDateString()} | {formatTime(shift.start)} - {formatTime(shift.end)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button onClick={() => handleEdit(shift)} className="text-primary hover:text-blue-400"><i data-lucide="edit"></i></button>
                                    <button onClick={() => handleOpenDelete(shift)} className="text-danger hover:text-red-400"><i data-lucide="trash-2"></i></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={selectedShift ? 'Editar Turno' : 'Nuevo Turno'}>
                <ShiftForm
                    shift={selectedShift}
                    onSave={handleSave}
                    onCancel={() => setIsFormModalOpen(false)}
                    users={users}
                />
            </Modal>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Eliminar Turno"
                message="¿Estás seguro de que quieres eliminar este turno? Esta acción no se puede deshacer."
            />
        </div>
    );
};