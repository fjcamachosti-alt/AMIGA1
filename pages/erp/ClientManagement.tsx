import React, { useState, useEffect, useMemo } from 'react';
import { Client } from '../../types';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { ClientForm } from './ClientForm';

interface ClientManagementProps {
    onBack: () => void;
}

export const ClientManagement: React.FC<ClientManagementProps> = ({ onBack }) => {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

    const fetchClients = async () => {
        setLoading(true);
        const data = await api.getClients();
        setClients(data);
        setLoading(false);
        setTimeout(() => window.lucide?.createIcons(), 0);
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const handleNew = () => {
        setSelectedClient(null);
        setIsFormModalOpen(true);
    };

    const handleEdit = (client: Client) => {
        setSelectedClient(client);
        setIsFormModalOpen(true);
    };

    const handleOpenDelete = (client: Client) => {
        setSelectedClient(client);
        setIsDeleteModalOpen(true);
    };

    const handleSave = async (client: Client) => {
        await api.saveClient(client);
        fetchClients();
        setIsFormModalOpen(false);
        setSelectedClient(null);
    };

    const handleDelete = async () => {
        if (selectedClient) {
            await api.deleteClient(selectedClient.id);
            fetchClients();
            setIsDeleteModalOpen(false);
            setSelectedClient(null);
        }
    };

    const filteredClients = useMemo(() => {
        if (!searchTerm) return clients;
        return clients.filter(c =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.cif.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [clients, searchTerm]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                 <div className="flex items-center gap-4">
                     <button onClick={onBack} className="text-gray-400 hover:text-white"><i data-lucide="arrow-left"></i></button>
                    <h2 className="text-3xl font-bold">Gestión de Clientes</h2>
                </div>
                <Button onClick={handleNew} icon={<i data-lucide="plus-circle"></i>}>
                    Nuevo Cliente
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
                            {filteredClients.map(client => (
                                <tr key={client.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                    <td className="p-4 whitespace-nowrap">{client.name}</td>
                                    <td className="p-4 font-mono">{client.cif}</td>
                                    <td className="p-4">{client.email}</td>
                                    <td className="p-4">{client.phone}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-4">
                                            <button onClick={() => handleEdit(client)} className="text-primary hover:underline">Editar</button>
                                            <button onClick={() => handleOpenDelete(client)} className="text-danger hover:underline">Eliminar</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={selectedClient ? 'Editar Cliente' : 'Nuevo Cliente'}>
                <ClientForm
                    client={selectedClient}
                    onSave={handleSave}
                    onCancel={() => setIsFormModalOpen(false)}
                />
            </Modal>
            
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Eliminar Cliente"
                message={`¿Estás seguro de que quieres eliminar a ${selectedClient?.name}? Esta acción no se puede deshacer.`}
            />
        </div>
    );
};