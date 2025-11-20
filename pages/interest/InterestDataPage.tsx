
import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { InterestData } from '../../types';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';
import { Input } from '../../components/ui/Input';

export const InterestDataPage: React.FC = () => {
    const [data, setData] = useState<InterestData[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<{title: string, content: string}>({ title: '', content: '' });
    const [isAdding, setIsAdding] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        const result = await api.getInterestData();
        setData(result);
        setLoading(false);
        setTimeout(() => window.lucide?.createIcons(), 0);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleEdit = (item: InterestData) => {
        setEditingId(item.id);
        setEditForm({ title: item.title, content: item.content });
        setIsAdding(false);
    };

    const handleCancel = () => {
        setEditingId(null);
        setIsAdding(false);
        setEditForm({ title: '', content: '' });
    };

    const handleSave = async () => {
        const payload = {
            id: editingId || undefined,
            title: editForm.title,
            content: editForm.content,
            updatedAt: new Date().toISOString().split('T')[0]
        };
        await api.saveInterestData(payload as InterestData); // Type assertion for simplified mock logic
        handleCancel();
        fetchData();
    };

    if (loading) return <Spinner />;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold">Datos de Interés Corporativo</h2>
                {!isAdding && !editingId && (
                    <Button onClick={() => setIsAdding(true)} icon={<i data-lucide="plus"></i>}>Añadir Nota</Button>
                )}
            </div>

            <div className="grid grid-cols-1 gap-6">
                {(isAdding || editingId) && (
                    <Card title={isAdding ? "Nueva Nota" : "Editar Nota"}>
                        <div className="space-y-4">
                             <Input 
                                label="Título" 
                                value={editForm.title} 
                                onChange={(e) => setEditForm({...editForm, title: e.target.value})} 
                             />
                             <Textarea 
                                label="Contenido (Máx 1000 caracteres)" 
                                value={editForm.content}
                                maxLength={1000}
                                rows={6}
                                onChange={(e) => setEditForm({...editForm, content: e.target.value})}
                             />
                             <p className="text-right text-xs text-gray-400">{editForm.content.length}/1000</p>
                             <div className="flex justify-end gap-3">
                                 <Button variant="secondary" onClick={handleCancel}>Cancelar</Button>
                                 <Button onClick={handleSave}>Guardar</Button>
                             </div>
                        </div>
                    </Card>
                )}

                {data.map(item => (
                    <Card key={item.id}>
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-primary">{item.title}</h3>
                            <button onClick={() => handleEdit(item)} className="text-gray-400 hover:text-white">
                                <i data-lucide="edit-2" className="h-5 w-5"></i>
                            </button>
                        </div>
                        <p className="text-gray-300 whitespace-pre-wrap">{item.content}</p>
                        <p className="text-xs text-gray-500 mt-4 border-t border-gray-700 pt-2">Última actualización: {item.updatedAt}</p>
                    </Card>
                ))}
                
                {data.length === 0 && !isAdding && (
                    <p className="text-center text-gray-500">No hay datos de interés registrados.</p>
                )}
            </div>
        </div>
    );
};
