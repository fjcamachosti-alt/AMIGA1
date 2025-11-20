import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ERPFileCategory } from '../../types';
import { ClientManagement } from './ClientManagement';
import { SupplierManagement } from './SupplierManagement';
import { ErpFileManagementModal } from './ErpFileManagementModal';

type ErpView = 'dashboard' | 'clients' | 'suppliers';

interface ErpItem {
    title: string;
    description?: string;
    icon: string;
    action: () => void;
}

const ErpItemCard: React.FC<ErpItem> = ({ title, description, icon, action }) => (
    <Card>
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
                <i data-lucide={icon} className="h-8 w-8 text-primary"></i>
                <div>
                    <h4 className="font-bold text-lg">{title}</h4>
                    {description && <p className="text-sm text-gray-400">{description}</p>}
                </div>
            </div>
            <Button variant="secondary" onClick={action}>
                Gestionar
            </Button>
        </div>
    </Card>
);

export const ErpPage: React.FC = () => {
    const [view, setView] = useState<ErpView>('dashboard');
    const [activeTab, setActiveTab] = useState('empresa');
    const [isFileModalOpen, setIsFileModalOpen] = useState(false);
    const [currentFileCategory, setCurrentFileCategory] = useState<ERPFileCategory | null>(null);

    useEffect(() => {
        window.lucide?.createIcons();
    }, [activeTab, view]);
    
    const handleManageFiles = (category: ERPFileCategory) => {
        setCurrentFileCategory(category);
        setIsFileModalOpen(true);
    };

    const empresaItems: ErpItem[] = [
        { title: 'Escrituras', description: 'Documentación de constitución', icon: 'file-text', action: () => handleManageFiles('Escrituras') },
        { title: 'Certificados', description: 'Calidad, solvencia, liquidez', icon: 'award', action: () => handleManageFiles('Certificados') },
        { title: 'Contratos', description: 'Trabajadores, clientes, proveedores, servicios', icon: 'handshake', action: () => handleManageFiles('Contratos') },
        { title: 'Documentos Bancarios', description: 'Créditos, préstamos, hipotecas', icon: 'landmark', action: () => handleManageFiles('Documentos Bancarios') },
        { title: 'AEAT', description: 'Declaraciones e impuestos', icon: 'receipt', action: () => handleManageFiles('AEAT') },
        { title: 'Seguridad Social', description: 'Cuotas y pagos', icon: 'shield', action: () => handleManageFiles('Seguridad Social') },
    ];

    const gestionItems: ErpItem[] = [
        { title: 'Clientes', description: 'Gestión de la cartera de clientes', icon: 'contact', action: () => setView('clients') },
        { title: 'Proveedores', description: 'Gestión de proveedores y servicios', icon: 'truck', action: () => setView('suppliers') },
        { title: 'Facturas Emitidas', description: 'Control de facturación a clientes', icon: 'arrow-up-right-from-circle', action: () => handleManageFiles('Facturas Emitidas') },
        { title: 'Facturas Recibidas', description: 'Control de gastos y facturas de proveedores', icon: 'arrow-down-left-from-circle', action: () => handleManageFiles('Facturas Recibidas') },
    ];
    
    const renderDashboard = () => (
         <div className="space-y-6">
            <h2 className="text-3xl font-bold">ERP Empresarial</h2>
            <div className="border-b border-gray-700">
                <nav className="-mb-px flex space-x-6">
                    <button
                        onClick={() => setActiveTab('empresa')}
                        className={`whitespace-nowrap py-3 px-4 border-b-2 font-medium text-lg ${
                            activeTab === 'empresa'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                        }`}
                    >
                        EMPRESA
                    </button>
                    <button
                        onClick={() => setActiveTab('gestion')}
                        className={`whitespace-nowrap py-3 px-4 border-b-2 font-medium text-lg ${
                            activeTab === 'gestion'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                        }`}
                    >
                        GESTIÓN
                    </button>
                </nav>
            </div>
            <div>
                {activeTab === 'empresa' && (
                    <div className="space-y-4">
                        {empresaItems.map(item => <ErpItemCard key={item.title} {...item} />)}
                    </div>
                )}
                {activeTab === 'gestion' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         {gestionItems.map(item => <ErpItemCard key={item.title} {...item} />)}
                    </div>
                )}
            </div>
        </div>
    );
    
    if (view === 'clients') return <ClientManagement onBack={() => setView('dashboard')} />;
    if (view === 'suppliers') return <SupplierManagement onBack={() => setView('dashboard')} />;

    return (
        <>
            {renderDashboard()}
            {currentFileCategory && (
                <ErpFileManagementModal 
                    isOpen={isFileModalOpen}
                    onClose={() => setIsFileModalOpen(false)}
                    category={currentFileCategory}
                />
            )}
        </>
    );
};