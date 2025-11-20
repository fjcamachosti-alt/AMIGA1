
import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { SignableDocument, User, UserRole } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { AutoFirmaService } from '../../services/autoFirmaService';

interface SignDocumentsPageProps {
    user: User;
}

export const SignDocumentsPage: React.FC<SignDocumentsPageProps> = ({ user }) => {
    const [loading, setLoading] = useState(true);
    const [documents, setDocuments] = useState<SignableDocument[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    
    // Admin State
    const [isNewDocModalOpen, setIsNewDocModalOpen] = useState(false);
    const [newDocTitle, setNewDocTitle] = useState('');
    const [newDocDesc, setNewDocDesc] = useState('');
    const [newDocFile, setNewDocFile] = useState<File | null>(null);
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [docToDelete, setDocToDelete] = useState<SignableDocument | null>(null);

    // Signing State
    const [docToSign, setDocToSign] = useState<SignableDocument | null>(null);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false); // New Preview Modal
    const [isSigningProcessOpen, setIsSigningProcessOpen] = useState(false);
    const [signingLogs, setSigningLogs] = useState<string[]>([]);
    const [signingStatus, setSigningStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

    const isAdminOrGestor = user.rol === UserRole.Administrador || user.rol === UserRole.Gestor;

    const fetchData = async () => {
        setLoading(true);
        if (isAdminOrGestor) {
            const [docs, allUsers] = await Promise.all([api.getSignableDocuments(), api.getUsers()]);
            setDocuments(docs);
            setUsers(allUsers);
        } else {
            const docs = await api.getSignableDocuments(user.id);
            setDocuments(docs);
        }
        setLoading(false);
        setTimeout(() => window.lucide?.createIcons(), 0);
    };

    useEffect(() => {
        fetchData();
    }, [user.id, isAdminOrGestor]);

    // --- Admin Actions ---
    const handleCreateDocument = async () => {
        if (!newDocTitle || !newDocFile || selectedUserIds.length === 0) {
            alert('Por favor complete todos los campos y seleccione al menos un usuario.');
            return;
        }

        const signatures = selectedUserIds.map(uid => ({ userId: uid, signed: false }));
        
        await api.saveSignableDocument({
            title: newDocTitle,
            description: newDocDesc,
            file: newDocFile.name,
            uploadedBy: user.id,
            signatures: signatures,
            uploadedAt: new Date().toISOString() // Mocking this, handled in API usually
        } as any);

        setIsNewDocModalOpen(false);
        setNewDocTitle('');
        setNewDocDesc('');
        setNewDocFile(null);
        setSelectedUserIds([]);
        fetchData();
    };

    const handleDeleteDocument = async () => {
        if (docToDelete) {
            await api.deleteSignableDocument(docToDelete.id);
            setDocToDelete(null);
            fetchData();
        }
    };

    const toggleUserSelection = (userId: string) => {
        setSelectedUserIds(prev => 
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    // --- User Actions (AutoFirma Integration) ---
    
    // 1. Open Review Modal
    const openReviewModal = (doc: SignableDocument) => {
        setDocToSign(doc);
        setIsReviewModalOpen(true);
    };

    // 2. Initiate AutoFirma connection from Review Modal
    const initiateAutoFirmaConnection = () => {
        setIsReviewModalOpen(false);
        setIsSigningProcessOpen(true);
        setSigningStatus('idle');
        setSigningLogs([]);
    };

    const addLog = (msg: string) => {
        setSigningLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    const runAutoFirmaFlow = async () => {
        if (!docToSign) return;
        
        setSigningStatus('processing');
        setSigningLogs([]);
        addLog("Iniciando comunicación con la aplicación local AutoFirma...");

        try {
            // 1. Check Environment
            await AutoFirmaService.checkEnvironment(addLog);

            // 2. Perform Signing
            const result = await AutoFirmaService.signDocument(
                docToSign.file, 
                `${user.nombre} ${user.primerApellido}`, 
                addLog
            );

            // 3. Save to API with the NEW filename
            addLog(`Subiendo documento firmado: ${result.signedFileName}...`);
            await api.signDocument(docToSign.id, user.id, result.certificate, result.signature, result.signedFileName);
            
            addLog("Documento almacenado correctamente en el servidor.");
            setSigningStatus('success');
            
            // Refresh data in background
            await fetchData();

        } catch (error) {
            addLog("ERROR: No se pudo comunicar con AutoFirma.");
            addLog("Verifique que la aplicación está instalada y ejecutándose.");
            setSigningStatus('error');
        }
    };
    
    const handleDownload = (fileName: string) => {
        api.downloadFile(fileName);
    };

    const closeSigningModal = () => {
        setIsSigningProcessOpen(false);
        setDocToSign(null);
        setSigningStatus('idle');
    };

    if (loading) return <Spinner />;

    // --- ADMIN VIEW ---
    if (isAdminOrGestor) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold">Gestión de Firmas</h2>
                    <Button onClick={() => setIsNewDocModalOpen(true)} icon={<i data-lucide="plus"></i>}>Nuevo Documento</Button>
                </div>

                <div className="bg-surface rounded-lg shadow overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="p-4">Título</th>
                                <th className="p-4">Subido el</th>
                                <th className="p-4">Progreso Firmas</th>
                                <th className="p-4">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {documents.map(doc => {
                                const signedCount = doc.signatures.filter(s => s.signed).length;
                                const totalCount = doc.signatures.length;
                                const progress = Math.round((signedCount / totalCount) * 100) || 0;
                                
                                return (
                                    <tr key={doc.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                        <td className="p-4 font-medium">
                                            {doc.title}
                                            <p className="text-xs text-gray-400">{doc.file}</p>
                                        </td>
                                        <td className="p-4">{doc.uploadedAt}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 bg-gray-600 rounded-full h-2.5">
                                                    <div className="bg-primary h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                                                </div>
                                                <span className="text-xs">{signedCount}/{totalCount}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <button onClick={() => setDocToDelete(doc)} className="text-danger hover:text-red-400">
                                                <i data-lucide="trash-2"></i>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {documents.length === 0 && (
                                <tr><td colSpan={4} className="p-4 text-center text-gray-500">No hay documentos para firmar.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <Modal isOpen={isNewDocModalOpen} onClose={() => setIsNewDocModalOpen(false)} title="Solicitar Nueva Firma">
                    <div className="space-y-4">
                        <Input label="Título del Documento" value={newDocTitle} onChange={(e) => setNewDocTitle(e.target.value)} />
                        <Textarea label="Descripción" value={newDocDesc} onChange={(e) => setNewDocDesc(e.target.value)} />
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Archivo PDF/Imagen</label>
                            <input type="file" onChange={(e) => setNewDocFile(e.target.files ? e.target.files[0] : null)} className="w-full text-gray-300 text-sm" />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Solicitar firma a:</label>
                            <div className="max-h-40 overflow-y-auto border border-gray-600 rounded p-2 bg-gray-700">
                                {users.map(u => (
                                    <div key={u.id} className="flex items-center gap-2 py-1">
                                        <input 
                                            type="checkbox" 
                                            checked={selectedUserIds.includes(u.id)} 
                                            onChange={() => toggleUserSelection(u.id)}
                                            className="rounded border-gray-500 bg-gray-600 text-primary"
                                        />
                                        <span className="text-sm">{u.nombre} {u.primerApellido} ({u.rol})</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="secondary" onClick={() => setIsNewDocModalOpen(false)}>Cancelar</Button>
                            <Button onClick={handleCreateDocument}>Crear Solicitud</Button>
                        </div>
                    </div>
                </Modal>

                <ConfirmationModal 
                    isOpen={!!docToDelete} 
                    onClose={() => setDocToDelete(null)}
                    onConfirm={handleDeleteDocument}
                    title="Eliminar Documento"
                    message="¿Estás seguro? Se perderán todas las firmas registradas para este documento."
                />
            </div>
        );
    }

    // --- EMPLOYEE VIEW ---
    const pendingDocs = documents.filter(d => {
        const mySig = d.signatures.find(s => s.userId === user.id);
        return mySig && !mySig.signed;
    });

    const signedDocs = documents.filter(d => {
        const mySig = d.signatures.find(s => s.userId === user.id);
        return mySig && mySig.signed;
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold">Mis Documentos para Firmar</h2>
                <div className="flex items-center gap-2 text-sm bg-blue-900/30 text-blue-200 px-3 py-1 rounded border border-blue-800">
                    <i data-lucide="shield-check" className="h-4 w-4"></i>
                    <span>Firma Digital (AutoFirma) Activada</span>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pending List */}
                <Card title="Pendientes de Firma">
                    {pendingDocs.length === 0 ? <p className="text-gray-500">No tienes documentos pendientes.</p> : (
                        <ul className="space-y-3">
                            {pendingDocs.map(doc => (
                                <li key={doc.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex flex-col gap-3">
                                    <div className="flex items-start gap-3">
                                        <i data-lucide="file-text" className="h-6 w-6 text-yellow-400 mt-1"></i>
                                        <div>
                                            <h4 className="font-bold">{doc.title}</h4>
                                            <p className="text-sm text-gray-400">{doc.description}</p>
                                            <p className="text-xs text-gray-500 mt-1">Archivo: {doc.file}</p>
                                        </div>
                                    </div>
                                    <Button className="w-full" onClick={() => openReviewModal(doc)}>
                                        <i data-lucide="pen-tool"></i> Revisar y Firmar
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>

                {/* Signed History */}
                <Card title="Historial de Firmados">
                     {signedDocs.length === 0 ? <p className="text-gray-500">Aún no has firmado ningún documento.</p> : (
                        <ul className="space-y-3">
                            {signedDocs.map(doc => {
                                const mySig = doc.signatures.find(s => s.userId === user.id);
                                const hasCert = !!mySig?.certificateInfo;
                                
                                return (
                                    <li key={doc.id} className="bg-gray-800 p-4 rounded-lg border border-green-900/30 opacity-75">
                                        <div className="flex items-start gap-3">
                                            <i data-lucide={hasCert ? "shield-check" : "check-circle-2"} className="h-6 w-6 text-green-400 mt-1"></i>
                                            <div className="w-full">
                                                <h4 className="font-bold text-gray-300">{doc.title}</h4>
                                                <p className="text-xs text-gray-500">Firmado el: {mySig?.signedAt ? new Date(mySig.signedAt).toLocaleString() : 'N/A'}</p>
                                                
                                                {/* Display the Generated Signed File Name with Download */}
                                                {mySig?.signedFileName && (
                                                     <div className="flex items-center gap-4 mt-2">
                                                         <p className="text-xs text-primary flex items-center gap-1">
                                                             <i data-lucide="file-check" className="h-3 w-3"></i>
                                                             {mySig.signedFileName}
                                                         </p>
                                                         <button 
                                                            onClick={() => handleDownload(mySig.signedFileName!)}
                                                            className="text-xs bg-primary px-2 py-1 rounded text-white hover:bg-blue-600"
                                                         >
                                                             Descargar
                                                         </button>
                                                     </div>
                                                )}
                                                
                                                {/* Certificate Metadata Badge */}
                                                {mySig?.certificateInfo && (
                                                    <div className="mt-2 bg-gray-900/50 p-2 rounded text-xs border border-gray-700">
                                                        <div className="flex justify-between mb-1 border-b border-gray-700 pb-1">
                                                             <span className="font-mono text-gray-400">SERIAL: {mySig.certificateInfo.serialNumber}</span>
                                                             <span className="text-green-400 font-bold">VALID</span>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-1">
                                                            <span className="text-gray-500">Emisor:</span>
                                                            <span className="text-gray-300">{mySig.certificateInfo.issuerName}</span>
                                                            <span className="text-gray-500">Titular:</span>
                                                            <span className="text-gray-300">{mySig.certificateInfo.ownerName}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </Card>
            </div>
            
            {/* 1. Document Review Modal */}
            <Modal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                title="Vista Previa del Documento"
            >
                <div className="space-y-4">
                    <div className="flex justify-between items-center bg-gray-800 p-3 rounded">
                        <h3 className="font-bold">{docToSign?.title}</h3>
                        <button onClick={() => handleDownload(docToSign?.file || '')} className="text-primary text-sm hover:underline flex items-center gap-1">
                            <i data-lucide="download" className="h-4 w-4"></i> Descargar Original
                        </button>
                    </div>
                    
                    {/* Mock PDF Previewer */}
                    <div className="w-full h-64 bg-gray-200 text-gray-600 flex flex-col items-center justify-center rounded border-2 border-dashed border-gray-400 relative">
                         <i data-lucide="file-text" className="h-16 w-16 mb-2 opacity-50"></i>
                         <p>Vista previa de {docToSign?.file}</p>
                         
                         {/* Visual Intent Field */}
                         <div className="absolute bottom-8 right-8 border-2 border-primary bg-white p-4 shadow-lg cursor-pointer hover:bg-blue-50 transition" onClick={initiateAutoFirmaConnection}>
                             <p className="text-primary font-bold text-sm mb-1 flex items-center gap-1">
                                 <i data-lucide="pen-tool" className="h-4 w-4"></i> FIRMAR AQUÍ
                             </p>
                             <p className="text-xs text-gray-500">Certificado Digital Requerido</p>
                         </div>
                    </div>
                    
                    <p className="text-sm text-gray-400 text-center">
                        Al pulsar en "Firmar", se abrirá la aplicación AutoFirma instalada en su equipo para proceder con la firma digital legalmente vinculante.
                    </p>

                    <div className="flex justify-end gap-4">
                         <Button variant="secondary" onClick={() => setIsReviewModalOpen(false)}>Cancelar</Button>
                         <Button onClick={initiateAutoFirmaConnection}>
                            <i data-lucide="play"></i> Iniciar Proceso de Firma
                         </Button>
                    </div>
                </div>
            </Modal>

            {/* 2. AutoFirma Interaction Modal (Technical Log) */}
            <Modal 
                isOpen={isSigningProcessOpen} 
                onClose={() => signingStatus !== 'processing' && closeSigningModal()} 
                title="Comunicación con AutoFirma"
            >
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center gap-4 border-b border-gray-700 pb-4">
                        <div className={`p-3 rounded-full ${signingStatus === 'processing' ? 'bg-blue-900/50 text-blue-400 animate-pulse' : signingStatus === 'success' ? 'bg-green-900/50 text-green-400' : 'bg-gray-800 text-gray-400'}`}>
                             <i data-lucide={signingStatus === 'success' ? 'check-circle' : 'cpu'} className="h-8 w-8"></i>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">Procesando Firma Digital...</h3>
                            <p className="text-sm text-gray-400">No cierre esta ventana ni la aplicación AutoFirma</p>
                        </div>
                    </div>

                    {/* Console Log Area */}
                    <div className="bg-black rounded-md p-4 font-mono text-xs h-48 overflow-y-auto border border-gray-700 custom-scrollbar">
                        {signingLogs.length === 0 && <span className="text-gray-600">Estableciendo conexión segura...</span>}
                        {signingLogs.map((log, idx) => (
                            <div key={idx} className="mb-1 text-green-500">
                                <span className="text-gray-500 mr-2">{log.substring(0, 10)}</span>
                                {log.substring(11)}
                            </div>
                        ))}
                    </div>

                    {/* Action Footer */}
                    <div className="flex justify-end gap-4">
                        {signingStatus === 'idle' && (
                            <>
                                <Button variant="secondary" onClick={closeSigningModal}>Cancelar</Button>
                                <Button onClick={runAutoFirmaFlow}>
                                    <i data-lucide="refresh-cw"></i> Reintentar Conexión
                                </Button>
                            </>
                        )}
                        
                        {signingStatus === 'processing' && (
                            <p className="text-sm text-gray-400 self-center animate-pulse">Esperando respuesta del usuario en AutoFirma...</p>
                        )}

                        {signingStatus === 'success' && (
                             <Button variant="primary" onClick={closeSigningModal}>
                                <i data-lucide="check"></i> Finalizar
                            </Button>
                        )}
                        
                         {signingStatus === 'error' && (
                             <Button variant="danger" onClick={closeSigningModal}>
                                <i data-lucide="x"></i> Cerrar
                            </Button>
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    );
};
