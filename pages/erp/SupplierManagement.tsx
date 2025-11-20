import React, { useState, useEffect, useMemo } from 'react';
import { Supplier } from '../../types';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { SupplierForm } from './SupplierForm';

interface SupplierManagementProps {
    onBack: () => void;
}

export const SupplierManagement: React.FC<SupplierManagementProps> = ({ onBack }) => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

    const fetchSuppliers = async () => {
        setLoading(true);
        const data = await api.getSuppliers();
        setSuppliers(data);
        setLoading(false);
        setTimeout(() => window.lucide?.createIcons(), 0);
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const handleNew = () => {
        setSelectedSupplier(null);
        setIsFormModalOpen(true);
    };

    const handleEdit = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setIsFormModalOpen(true);
    };

    const handleOpenDelete = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setIsDeleteModalOpen(true);
    };

    const handleSave = async (supplier: Supplier) => {
        await api.saveSupplier(supplier);
        fetchSuppliers();
        setIsFormModalOpen(false);
        setSelectedSupplier(null);
    };

    const handleDelete = async () => {
        if (selectedSupplier) {
            await api.deleteSupplier(selectedSupplier.id);
            fetchSuppliers();
            setIsDeleteModalOpen(false);
            setSelectedSupplier(null);
        }
    };

    const filteredSuppliers = useMemo(() => {
        if (!searchTerm) return suppliers;
        return suppliers.filter(s =>
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.cif.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [suppliers, searchTerm]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                 <div className="flex items-center gap-4">
                     <button onClick={onBack} className="text-gray-400 hover:text-white"><i data-lucide="arrow-left"></i></button>
                    <h2 className="text-3xl font-bold">Gestión de Proveedores</h2>
                </div>
                <Button onClick={handleNew} icon={<i data-lucide="plus-circle"></i>}>
                    Nuevo Proveedor
                </Button>
            </div>

            <div className="bg-surface p-4 rounded-lg shadow">
                 <div className="relative">
                    <input 
                        type="text"
                        placeholder="Buscar por Nombre, CIF..."
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
                                <th className="p-4">CIF</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Teléfono</th>
                                <th className="p-4">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSuppliers.map(supplier => (
                                <tr key={supplier.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                    <td className="p-4 whitespace-nowrap">{supplier.name}</td>
                                    <td className="p-4 font-mono">{supplier.cif}</td>
                                    <td className="p-4">{supplier.email}</td>
                                    <td className="p-4">{supplier.phone}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-4">
                                            <button onClick={() => handleEdit(supplier)} className="text-primary hover:underline">Editar</button>
                                            <button onClick={() => handleOpenDelete(supplier)} className="text-danger hover:underline">Eliminar</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={selectedSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}>
                <SupplierForm
                    supplier={selectedSupplier}
                    onSave={handleSave}
                    onCancel={() => setIsFormModalOpen(false)}
                />
            </Modal>
            
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Eliminar Proveedor"
                message={`¿Estás seguro de que quieres eliminar a ${selectedSupplier?.name}? Esta acción no se puede deshacer.`}
            />
        </div>
    );
};