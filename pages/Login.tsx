
import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { api } from '../services/api';
import { tokenService } from '../services/tokenService';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.login(email, password);
      tokenService.setTokens(response.accessToken, response.refreshToken);
      onLogin(response.user);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
            <img 
              src="https://sume24h.com/wp-content/uploads/2019/10/LOGO-SUME.png" 
              alt="Logo SUME" 
              className="mx-auto w-[268px] h-[62px] object-contain mb-6" 
            />
            <h1 className="text-4xl font-bold mt-4">AMIGA</h1>
            <p className="text-sm text-gray-400 mt-2">Aplicación Modular Inteligente de Gestion Avanzada</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label="Email"
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ej: usuario@empresa.com"
            required
          />
          <Input
            label="Contraseña"
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-danger text-sm bg-red-900/20 p-2 rounded border border-red-800">{error}</p>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Accediendo...' : 'Acceder'}
          </Button>
        </form>
      </Card>
    </div>
  );
};
