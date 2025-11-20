import React, { useState, useEffect, useMemo } from 'react';
import { MedicalSupply } from '../../types';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { MedicalSupplyForm } from './MedicalSupplyForm';

interface MedicalInventoryProps {
    onBack: () => void;
}

type SupplyStatus = 'En Stock' | 'Bajo Stock' | 'Próximo a Caducar' | 'Caducado';

const getSupplyStatus = (supply: MedicalSupply): { status: SupplyStatus, color: string } => {
    const now = new Date();
    const expirationDate = new Date(supply.expirationDate);
    expirationDate.setUTCHours(0, 0, 0, 0); // Normalize to start of day UTC
    now.setUTCHours(0,0,0,0);
    const thirtyDaysFromNow = new Date(now);
    thirtyDaysFromNow.setDate(now.getDate() + 30);
    
    if (expirationDate < now) {
        return { status: 'Caducado', color: 'bg-red-500/20 text-red-400' };
    }
    if (supply.stock <= supply.reorderLevel) {
        return { status: 'Bajo Stock', color: 'bg-yellow-500/20 text-yellow-400' };
    }
     if (expirationDate <= thirtyDaysFromNow) {
        return { status: 'Próximo a Caducar', color: 'bg-orange-500/20 text-orange-400' };
    }
    return { status: 'En Stock', color: 'bg-green-500/20 text-green-400' };
};

export const MedicalInventory: React.FC<MedicalInventoryProps> = ({ onBack }) => {
    const [supplies, setSupplies] = useState<MedicalSupply[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedSupply, setSelectedSupply] = useState<MedicalSupply | null>(null);

    const fetchSupplies = async () => {
        setLoading(true);
        const data = await api.getMedicalSupplies();
        setSupplies(data);
        setLoading(false);
        setTimeout(() => window.lucide?.createIcons(), 0);
    };

    useEffect(() => {
        fetchSupplies();
    }, []);

    const handleNew = () => {
        setSelectedSupply(null);
        setIsFormModalOpen(true);
    };
    
    const handleEdit = (supply: MedicalSupply) => {
        setSelectedSupply(supply);
        setIsFormModalOpen(true);
    };

    const handleOpenDelete = (supply: MedicalSupply) => {
        setSelectedSupply(supply);
        setIsDeleteModalOpen(true);
    };

    const handleSave = async (supply: MedicalSupply) => {
        await api.saveMedicalSupply(supply);
        fetchSupplies();
        setIsFormModalOpen(false);
        setSelectedSupply(null);
    };

    const handleDelete = async () => {
        if (selectedSupply) {
            await api.deleteMedicalSupply(selectedSupply.id);
            fetchSupplies();
            setIsDeleteModalOpen(false);
            setSelectedSupply(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="text-gray-400 hover:text-white"><i data-lucide="arrow-left"></i></button>
                    <h2 className="text-3xl font-bold">Inventario Médico</h2>
                </div>
                <Button onClick={handleNew} icon={<i data-lucide="plus-circle"></i>}>
                    Añadir Artículo
                </Button>
            </div>

            {loading ? <Spinner /> : (
                <div className="bg-surface rounded-lg shadow overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="p-4">Nombre</th>
                                <th className="p-4">Categoría</th>
                                <th className="p-4">Stock</th>
                                <th className="p-4">Nivel Pedido</th>
                                <th className="p-4">Caducidad</th>
                                <th className="p-4">Estado</th>
                                <th className="p-4">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {supplies.map(supply => {
                                const { status, color } = getSupplyStatus(supply);
                                return (
                                    <tr key={supply.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                        <td className="p-4">{supply.name}</td>
                                        <td className="p-4">{supply.category}</td>
                                        <td className="p-4">{supply.stock}</td>
                                        <td className="p-4">{supply.reorderLevel}</td>
                                        <td className="p-4">{new Date(supply.expirationDate).toLocaleDateString()}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${color}`}>
                                                {status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-4">
                                                <button onClick={() => handleEdit(supply)} className="text-primary hover:underline">Editar</button>
                                                <button onClick={() => handleOpenDelete(supply)} className="text-danger hover:underline">Eliminar</button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
            
            <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={selectedSupply ? 'Editar Artículo' : 'Nuevo Artículo de Inventario'}>
                <MedicalSupplyForm 
                    supply={selectedSupply}
                    onSave={handleSave}
                    onCancel={() => setIsFormModalOpen(false)}
                />
            </Modal>
            
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Eliminar Artículo"
                message={`¿Estás seguro de que quieres eliminar "${selectedSupply?.name}" del inventario? Esta acción no se puede deshacer.`}
            />
        </div>
    );
};