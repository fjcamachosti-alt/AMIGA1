
import React, { useState, useEffect } from 'react';
import { Incident, Vehicle, IncidentStatus } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { api } from '../../services/api';

interface IncidentFormProps {
  incident: Incident | null;
  onSave: (incident: Incident) => void;
  onCancel: () => void;
}

export const IncidentForm: React.FC<IncidentFormProps> = ({ incident, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Incident>>(incident || { status: IncidentStatus.Abierta, date: new Date().toISOString().split('T')[0] });
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    setFormData(incident || { status: IncidentStatus.Abierta, date: new Date().toISOString().split('T')[0] });
    api.getVehicles().then(setVehicles);
  }, [incident]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Incident);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Fecha" name="date" type="date" value={formData.date || ''} onChange={handleChange} required />
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Vehículo</label>
            <select name="vehicleId" value={formData.vehicleId || ''} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white" required>
                <option value="">Seleccionar vehículo</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.matricula} - {v.marca}</option>)}
            </select>
        </div>
        <Input label="Reportado por" name="reportedBy" value={formData.reportedBy || ''} onChange={handleChange} required />
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Estado</label>
            <select name="status" value={formData.status || ''} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white">
                {Object.values(IncidentStatus).map(status => <option key={status} value={status}>{status}</option>)}
            </select>
        </div>
      </div>
      <Textarea label="Descripción" name="description" value={formData.description || ''} onChange={handleChange} required />
      <div className="flex justify-end gap-4 pt-4 border-t border-gray-700">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar Incidencia</Button>
      </div>
    </form>
  );
};
