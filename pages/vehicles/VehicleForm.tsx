
import React, { useState, useEffect } from 'react';
import { Vehicle, VehicleStatus, VehicleVisibility, VehicleDocument, User, UserRole } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { api } from '../../services/api';

interface VehicleFormProps {
  vehicle: Vehicle | null;
  onSave: (vehicle: Vehicle) => void;
  onCancel: () => void;
}

// Define document groups for a more intuitive layout
const documentGroups = [
  {
    title: 'Documentación Legal',
    items: [
      { name: 'Permiso de Circulación', category: 'documentosBasicos' as keyof Vehicle },
      { name: 'Ficha Técnica', category: 'documentosBasicos' as keyof Vehicle },
      { name: 'Póliza', category: 'documentosBasicos' as keyof Vehicle },
      { name: 'Recibo de Seguro', category: 'documentosBasicos' as keyof Vehicle },
    ],
  },
  {
    title: 'Mantenimiento',
    items: [{ name: 'ITV Favorable', category: 'documentosBasicos' as keyof Vehicle }],
  },
  {
    title: 'Documentación Específica',
    items: [
      { name: 'Memoria', category: 'documentosEspecificos' as keyof Vehicle },
      { name: 'Administrador Poder Sume', category: 'documentosEspecificos' as keyof Vehicle },
      { name: 'Certificado Carrocero', category: 'documentosEspecificos' as keyof Vehicle },
      { name: 'Contrato de Alquiler', category: 'documentosEspecificos' as keyof Vehicle },
      { name: 'Anexo Contrato de Alquiler', category: 'documentosEspecificos' as keyof Vehicle },
    ],
  },
  {
    title: 'Documentación Adicional',
    items: [
      { name: 'Varios1', category: 'documentosAdicionales' as keyof Vehicle },
      { name: 'Varios2', category: 'documentosAdicionales' as keyof Vehicle },
      { name: 'Varios3', category: 'documentosAdicionales' as keyof Vehicle },
      { name: 'Varios4', category: 'documentosAdicionales' as keyof Vehicle },
      { name: 'Varios5', category: 'documentosAdicionales' as keyof Vehicle },
    ],
  },
];

export const VehicleForm: React.FC<VehicleFormProps> = ({ vehicle, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Vehicle>>(vehicle || {});
  const [technicians, setTechnicians] = useState<User[]>([]);

  useEffect(() => {
    setFormData(vehicle || {});
    
    // Fetch users to populate technician dropdown
    const fetchTechs = async () => {
        const users = await api.getUsers();
        // Filter users who are Technicians
        const techs = users.filter(u => u.rol === UserRole.Tecnico);
        setTechnicians(techs);
    };
    fetchTechs();
    
    setTimeout(() => window.lucide?.createIcons(), 0);
  }, [vehicle]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (category: keyof Vehicle, name: string, file: File) => {
    // Preserve existing date if replacing file, or default to today
    const existingDoc = getDocument(category, name);
    const newDoc: VehicleDocument = { 
        name, 
        file: file.name, 
        uploadDate: new Date().toISOString().split('T')[0],
        expirationDate: existingDoc?.expirationDate
    };
    const docs = (formData[category] as VehicleDocument[] | undefined) || [];
    const updatedDocs = [...docs.filter(d => d.name !== name), newDoc];
    
    setFormData(prev => ({ 
        ...prev, 
        [category]: updatedDocs 
    }));
  };
  
  const handleDocDateChange = (category: keyof Vehicle, name: string, date: string) => {
      const docs = (formData[category] as VehicleDocument[] | undefined) || [];
      const doc = docs.find(d => d.name === name);
      if (doc) {
          const updatedDoc = { ...doc, expirationDate: date };
          const updatedDocs = [...docs.filter(d => d.name !== name), updatedDoc];
          setFormData(prev => ({ ...prev, [category]: updatedDocs }));
      } else {
          // Create placeholder doc if setting date before upload (optional, but usually we attach to file)
          // For now, only update if doc exists or create dummy? 
          // Better: Users typically upload file first.
      }
  };
  
  const getDocument = (category: keyof Vehicle, name: string): VehicleDocument | undefined => {
    const docs = (formData[category] as VehicleDocument[] | undefined) || [];
    return docs.find(d => d.name === name);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation for mandatory documents
    const mandatoryDocs = ['Permiso de Circulación', 'Ficha Técnica', 'Póliza', 'Recibo de Seguro'];
    const basicDocs = (formData.documentosBasicos || []).map(d => d.name);
    const missingDocs = mandatoryDocs.filter(doc => !basicDocs.includes(doc));
    
    if (missingDocs.length > 0) {
        alert(`Faltan documentos obligatorios: ${missingDocs.join(', ')}`);
        return;
    }

    onSave(formData as Vehicle);
  };
  
  const renderDocumentUploadRow = (docItem: {name: string, category: keyof Vehicle}) => {
    const doc = getDocument(docItem.category, docItem.name);
    return (
       <div key={docItem.name} className="flex items-center justify-between gap-4 border-b border-gray-700 py-2 flex-wrap">
            <div className="w-full sm:w-1/3">
                <label className="text-sm block">{docItem.name}</label>
                {doc && <span className="text-xs text-green-400 flex items-center gap-1"><i data-lucide="check-circle" className="h-3 w-3"></i> Cargado</span>}
            </div>
            
            <div className="flex items-center gap-2 flex-grow">
                 <input 
                    type="file" 
                    onChange={(e) => e.target.files && handleFileChange(docItem.category, docItem.name, e.target.files[0])}
                    className="text-sm text-gray-400 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-blue-600 w-full sm:w-auto"
                />
            </div>
            
            <div className="w-full sm:w-auto">
                 <label className="text-xs text-gray-400 block mb-1">Vencimiento (Opcional)</label>
                 <input 
                    type="date"
                    value={doc?.expirationDate || ''}
                    onChange={(e) => handleDocDateChange(docItem.category, docItem.name, e.target.value)}
                    className="bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-primary"
                    disabled={!doc}
                 />
            </div>
        </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-on-surface mb-4">Datos Básicos del Vehículo</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Matrícula" name="matricula" value={formData.matricula || ''} onChange={handleChange} required />
            <Input label="Marca" name="marca" value={formData.marca || ''} onChange={handleChange} required />
            <Input label="Modelo" name="modelo" value={formData.modelo || ''} onChange={handleChange} required />
            <Input label="Año" name="ano" type="number" value={formData.ano || ''} onChange={handleChange} required />
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Disponibilidad</label>
                <select name="estado" value={formData.estado || ''} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white">
                    <option value={VehicleStatus.Disponible}>Disponible</option>
                    <option value={VehicleStatus.NoDisponible}>No Disponible</option>
                </select>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Visibilidad</label>
                <select name="visibilidad" value={formData.visibilidad || ''} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white">
                    <option value={VehicleVisibility.Visible}>Visible</option>
                    <option value={VehicleVisibility.NoVisible}>No Visible (Admin/Gestor)</option>
                </select>
            </div>
            
             <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Técnico Asignado</label>
                <select name="assignedTo" value={formData.assignedTo || ''} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white">
                    <option value="">Sin asignar</option>
                    {technicians.map(tech => (
                        <option key={tech.id} value={tech.id}>{tech.nombre} {tech.primerApellido}</option>
                    ))}
                </select>
            </div>
        </div>
      </div>
      
      <div className="space-y-6 pt-4 border-t border-gray-700">
        <h3 className="text-lg font-semibold text-on-surface">Gestión Documental</h3>
        {documentGroups.map(group => (
            <div key={group.title}>
                <h4 className="font-medium text-gray-300 mb-2">{group.title}</h4>
                <div className="space-y-2">
                    {group.items.map(renderDocumentUploadRow)}
                </div>
            </div>
        ))}
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t border-gray-700">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar Vehículo</Button>
      </div>
    </form>
  );
};
