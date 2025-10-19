import React, { useState } from 'react';
import { X, User, AtSign, Lock } from 'lucide-react';

interface SignUpModalProps {
  onClose: () => void;
  onSignUp: () => void;
  onSwitchToLogin: () => void;
}

const SocialButton: React.FC<{ provider: string; icon: React.ReactNode }> = ({ provider, icon }) => (
    <button className="flex-1 flex items-center justify-center gap-2 bg-gray-700/50 hover:bg-gray-700 p-3 rounded-lg transition-colors">
        {icon}
        <span className="hidden sm:inline">{provider}</span>
    </button>
);

const SignUpModal: React.FC<SignUpModalProps> = ({ onClose, onSignUp, onSwitchToLogin }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setError('');
    // In a real app, you would handle the registration logic here
    onSignUp();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 sm:p-8 w-full max-w-md relative text-white shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={24} />
        </button>
        <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-center">Únete a la Fiesta</h2>
        <p className="text-center text-gray-400 mb-6">Crea tu cuenta para empezar a compartir.</p>
        
        <div className="flex gap-2 sm:gap-4 mb-6">
            <SocialButton provider="Google" icon={<svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.904,36.213,44,30.836,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>} />
            <SocialButton provider="Facebook" icon={<svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"></path></svg>} />
            <SocialButton provider="Apple" icon={<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M15.226 1.343a4.237 4.237 0 0 0-3.136 1.638c-.985-1.125-2.58-1.5-3.938-1.432-2.92.146-5.074 2.43-6.212 5.013C.11 11.232.74 16.32 2.9 19.33c1.13 1.578 2.474 3.193 4.242 3.294 1.702.1 2.292-.95 4.312-.95s2.59.95 4.312.95c1.82 0 3.037-1.616 4.242-3.294 1.44-1.921 1.95-3.877 1.986-3.957-.036-.024-4.32-2.52-4.32-6.533 0-3.328 2.976-5.047 3.2-5.262a4.423 4.423 0 0 0-3.41-1.782zM12.23 6.645c.123-2.152 1.83-3.612 3.638-3.612.18 0 .358.012.536.036-1.92.36-3.464 1.872-4.174 3.576zM11.987 2.9a4.12 4.12 0 0 0-2.9 1.293c-.934 1.01-1.6 2.4-1.93 3.842.216-.036.432-.048.66-.048 1.81 0 3.492 1.39 3.626 3.483.024.36-.024.708-.12 1.045.696.157 1.38.3 2.052.373a9.92 9.92 0 0 1-1.488-7.053c.012-.012.012-.025.012-.036z"></path></svg>} />
        </div>
        
        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-600" />
          <span className="mx-4 text-gray-400 text-sm">O</span>
          <hr className="flex-grow border-gray-600" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input type="text" placeholder="Nombre de usuario" value={username} onChange={e => setUsername(e.target.value)} required className="w-full bg-gray-700 rounded-lg p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-festive-orange"/>
          </div>
          <div className="relative">
            <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-gray-700 rounded-lg p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-festive-orange"/>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-gray-700 rounded-lg p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-festive-orange"/>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input type="password" placeholder="Confirmar contraseña" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full bg-gray-700 rounded-lg p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-festive-orange"/>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          
          <button type="submit" className="w-full bg-festive-orange font-bold py-3 rounded-lg hover:bg-orange-600 transition-colors">
            Crear Cuenta
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          ¿Ya tienes una cuenta?{' '}
          <button onClick={onSwitchToLogin} className="font-semibold text-festive-orange hover:underline">
            Inicia Sesión
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUpModal;