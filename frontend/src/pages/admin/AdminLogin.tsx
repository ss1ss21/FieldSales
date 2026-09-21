import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // KORUMA (GUARD): Zaten Admin olarak giriş yapmışsa doğrudan içeri at
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (token && role === 'Admin') {
      navigate('/admin/customers', { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:5185/api/auth/login', {
        email: email,
        password: password
      });

      const { token, role, fullname } = response.data;

      if (role !== 'Admin') {
        setError('Bu panele sadece yöneticiler giriş yapabilir.');
        return;
      }

      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('fullname', fullname);

      navigate('/admin/customers', { replace: true });
      
    } catch (err: any) {
      if (err.response && err.response.data) {
        setError(err.response.data.message);
      } else {
        setError('Sunucuya bağlanılamadı. Backend çalışıyor mu?');
      }
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-900">
      <div className="w-full max-w-md p-8 bg-gray-800 rounded-xl shadow-2xl border-t-4 border-red-500">
        <h2 className="text-2xl font-bold mb-2 text-center text-white">Yönetici Paneli</h2>
        <p className="text-sm text-gray-400 mb-6 text-center">Sistem yönetimi için yetkili girişi</p>
        
        {error && <div className="mb-4 p-3 bg-red-500/20 border border-red-500 text-red-300 rounded text-sm text-center">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Admin E-posta</label>
            <input 
              type="email" required
              className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded focus:ring-2 focus:ring-red-500 outline-none"
              value={email} onChange={e => setEmail(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Şifre</label>
            <input 
              type="password" required
              className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded focus:ring-2 focus:ring-red-500 outline-none"
              value={password} onChange={e => setPassword(e.target.value)} 
            />
          </div>
          <button type="submit" className="w-full bg-red-600 text-white font-semibold py-2 rounded hover:bg-red-700 transition">
            Yönetici Olarak Gir
          </button>
        </form>
      </div>
    </div>
  );
}