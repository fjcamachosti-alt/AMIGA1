import React, { useState, useEffect } from 'react';
import { Client } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';

interface ClientFormProps {
  client: Client | null;
  onSave: (client: Client) => void;
  onCancel: () => void;
}

export const ClientForm: React.FC<ClientFormProps> = ({ client, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Client>>(client || {});

  useEffect(() => {
    setFormData(client || {});
  }, [client]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Client);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Nombre" name="name" value={formData.name || ''} onChange={handleChange} required />
        <Input label="CIF/DIF" name="cif" value={formData.cif || ''} onChange={handleChange} required />
        <Input label="Email" name="email" type="email" value={formData.email || ''} onChange={handleChange} required />
        <Input label="Teléfono" name="phone" value={formData.phone || ''} onChange={handleChange} required />
      </div>
      <Textarea label="Dirección" name="address" value={formData.address || ''} onChange={handleChange} required />
      <div className="flex justify-end gap-4 pt-4 border-t border-gray-700">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar Cliente</Button>
      </div>
    </form>
  );
};