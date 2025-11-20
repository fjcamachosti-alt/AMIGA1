
import React, { useState, useEffect } from 'react';
import { Shift, User } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { api } from '../../services/api';

interface ShiftFormProps {
  shift: Shift | null;
  onSave: (shift: Omit<Shift, 'id'> | Shift) => Promise<{success: boolean, message?: string}>;
  onCancel: () => void;
  users: User[];
}

export const ShiftForm: React.FC<ShiftFormProps> = ({ shift, onSave, onCancel, users }) => {
  const [formData, setFormData] = useState<Partial<Shift>>(shift || { userId: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    // Convert dates to 'YYYY-MM-DDTHH:mm' format for datetime-local input
    const formatDateTimeLocal = (isoString?: string) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        // Adjust for timezone offset
        const timezoneOffset = date.getTimezoneOffset() * 60000;
        const localDate = new Date(date.getTime() - timezoneOffset);
        return localDate.toISOString().slice(0, 16);
    };

    setFormData({
        ...shift,
        start: formatDateTimeLocal(shift?.start),
        end: formatDateTimeLocal(shift?.end),
    } || { userId: '' });
  }, [shift]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isValidDate = (d: Date) => d instanceof Date && !isNaN(d.getTime());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.start || !formData.end) {
        setError('Las fechas de inicio y fin son obligatorias.');
        return;
    }

    const startDate = new Date(formData.start);
    const endDate = new Date(formData.end);

    if (!isValidDate(startDate) || !isValidDate(endDate)) {
        setError('Las fechas introducidas no son válidas.');
        return;
    }

    if (startDate >= endDate) {
        setError('La fecha de inicio debe ser anterior a la fecha de fin.');
        return;
    }

    const shiftToSave = {
        ...formData,
        start: startDate.toISOString(),
        end: endDate.toISOString()
    } as Shift | Omit<Shift, 'id'>;

    const result = await onSave(shiftToSave);
    if (!result.success) {
        setError(result.message || 'Error desconocido');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Empleado</label>
            <select name="userId" value={formData.userId || ''} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white" required>
                <option value="">Seleccionar empleado</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.nombre} {u.primerApellido}</option>)}
            </select>
        </div>
        <div></div>
        <Input label="Inicio del Turno" name="start" type="datetime-local" value={formData.start || ''} onChange={handleChange} required />
        <Input label="Fin del Turno" name="end" type="datetime-local" value={formData.end || ''} onChange={handleChange} required />
      </div>
       {error && <p className="text-danger text-sm bg-red-900/20 border border-red-800 p-2 rounded">{error}</p>}
      <div className="flex justify-end gap-4 pt-4 border-t border-gray-700">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar Turno</Button>
      </div>
    </form>
  );
};
