import React, { useState, useEffect } from 'react';
import { MedicalSupply } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

interface MedicalSupplyFormProps {
  supply: MedicalSupply | null;
  onSave: (supply: MedicalSupply) => void;
  onCancel: () => void;
}

export const MedicalSupplyForm: React.FC<MedicalSupplyFormProps> = ({ supply, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<MedicalSupply>>(supply || { stock: 0, reorderLevel: 0 });

  useEffect(() => {
    setFormData(supply || { stock: 0, reorderLevel: 0 });
  }, [supply]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ 
        ...prev, 
        [name]: type === 'number' ? parseInt(value, 10) || 0 : value 
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category || !formData.expirationDate) {
        alert("Por favor, rellene todos los campos obligatorios.");
        return;
    }
    onSave(formData as MedicalSupply);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Nombre del Artículo" name="name" value={formData.name || ''} onChange={handleChange} required />
        <Input label="Categoría" name="category" value={formData.category || ''} onChange={handleChange} required />
        <Input label="Stock Actual" name="stock" type="number" value={formData.stock || 0} onChange={handleChange} required min="0" />
        <Input label="Nivel de Pedido" name="reorderLevel" type="number" value={formData.reorderLevel || 0} onChange={handleChange} required min="0" />
        <Input label="Fecha de Caducidad" name="expirationDate" type="date" value={formData.expirationDate || ''} onChange={handleChange} required />
      </div>
      <div className="flex justify-end gap-4 pt-4 border-t border-gray-700">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar Artículo</Button>
      </div>
    </form>
  );
};