import React, { useState, useEffect, useMemo } from 'react';
import { ERPFile, ERPFileCategory } from '../../types';
import { api } from '../../services/api';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';
import { Button } from '../../components/ui/Button';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { Input } from '../../components/ui/Input';

interface ErpFileManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: ERPFileCategory;
}

export const ErpFileManagementModal: React.FC<ErpFileManagementModalProps> = ({ isOpen, onClose, category }) => {
    const [files, setFiles] = useState<ERPFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [fileToDelete, setFileToDelete] = useState<ERPFile | null>(null);
    const [newFile, setNewFile] = useState<File | null>(null);
    const [invoiceNumber, setInvoiceNumber] = useState('');

    const isInvoice = category === 'Facturas Emitidas' || category === 'Facturas Recibidas';

    const fetchFiles = async () => {
        if (!category) return;
        setLoading(true);
        const data = await api.getErpFiles(category);
        setFiles(data);
        setLoading(false);
        setTimeout(() => window.lucide?.createIcons(), 0);
    };

    useEffect(() => {
        if (isOpen) {
            fetchFiles();
        } else {
            // Reset state on close
            setSearchTerm('');
            setNewFile(null);
            setInvoiceNumber('');
        }
    }, [isOpen, category]);

    const handleUpload = async () => {
        if (!newFile) return;
        const fileData: Omit<ERPFile, 'id'> = {
            name: newFile.name,
            category,
            file: newFile,
            uploadDate: new Date().toISOString().split('T')[0],
            ...(isInvoice && { invoiceNumber }),
        };
        await api.saveErpFile(fileData);
        setNewFile(null);
        setInvoiceNumber('');
        fetchFiles();
    };

    const handleDelete = async () => {
        if (fileToDelete) {
            await api.deleteErpFile(fileToDelete.id);
            setFileToDelete(null);
            fetchFiles();
        }
    };
    
    const filteredFiles = useMemo(() => {
        if (!searchTerm) return files;
        return files.filter(f => 
            f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (f.invoiceNumber && f.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [files, searchTerm]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Gestionar: ${category}`}>
            <div className="space-y-6">
                {/* Uploader section */}
                <div className="bg-gray-800 p-4 rounded-lg space-y-4">
                    <h4 className="font-semibold">Añadir Nuevo Documento</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input 
                           label="Seleccionar Archivo"
                           type="file" 
                           onChange={(e) => setNewFile(e.target.files ? e.target.files[0] : null)}
                        />
                        {isInvoice && (
                            <Input 
                                label="Nº de Factura (opcional)" 
                                value={invoiceNumber}
                                onChange={(e) => setInvoiceNumber(e.target.value)}
                            />
                        )}
                    </div>
                    <Button onClick={handleUpload} disabled={!newFile}>
                        Subir Archivo
                    </Button>
                </div>

                {/* File list section */}
                <div className="space-y-4">
                     <div className="relative">
                        <input 
                            type="text"
                            placeholder="Buscar por nombre o nº de factura..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md pl-10 pr-4 py-2 text-white"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i data-lucide="search" className="text-gray-400"></i>
                        </div>
                    </div>

                    {loading ? <Spinner /> : (
                        <div className="max-h-80 overflow-y-auto pr-2">
                             <ul className="space-y-2">
                                {filteredFiles.map(file => (
                                    <li key={file.id} className="flex justify-between items-center p-3 bg-gray-800 rounded-md">
                                        <div className="flex items-center gap-3">
                                            <i data-lucide="file-text" className="h-5 w-5 text-primary"></i>
                                            <div>
                                                <p className="font-medium text-sm">{file.name}</p>
                                                <p className="text-xs text-gray-400">
                                                    {file.uploadDate}
                                                    {file.invoiceNumber && ` - Nº: ${file.invoiceNumber}`}
                                                </p>
                                            </div>
                                        </div>
                                        <button onClick={() => setFileToDelete(file)} className="text-danger hover:text-red-400">
                                            <i data-lucide="trash-2" className="h-5 w-5"></i>
                                        </button>
                                    </li>
                                ))}
                                {filteredFiles.length === 0 && <p className="text-center text-gray-400 py-4">No hay documentos en esta categoría.</p>}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
            
            <ConfirmationModal
                isOpen={!!fileToDelete}
                onClose={() => setFileToDelete(null)}
                onConfirm={handleDelete}
                title="Eliminar Documento"
                message={`¿Estás seguro de que quieres eliminar el archivo "${fileToDelete?.name}"? Esta acción es irreversible.`}
            />
        </Modal>
    );
};