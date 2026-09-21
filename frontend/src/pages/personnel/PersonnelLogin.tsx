import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function PersonnelLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // KORUMA (GUARD): Zaten Personel olarak giriş yapmışsa doğrudan içeri at
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (token && role === 'Personnel') {
      navigate('/personnel/visits', { replace: true });
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

      // Backend'den dönen verilerin içine id ve email de eklendi
      // Not: Çakışmayı önlemek için backend'den gelen email'i 'responseEmail' olarak alıyoruz.
      const { token, role, fullname, id, email: responseEmail } = response.data;

      if (role !== 'Personnel') {
        setError('Bu panele sadece saha personelleri giriş yapabilir.');
        return;
      }

      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('fullname', fullname);
      
      // EKSİK OLAN VERİLER EKLENDİ (UI ve API rotası için hayati önem taşıyor)
      localStorage.setItem('userId', id.toString());
      localStorage.setItem('email', responseEmail || email); // Backend email dönmezse state'deki maili kullan

      // BAŞARILI GİRİŞ: replace: true ile Login sayfasını geçmişten sil
      navigate('/personnel/visits', { replace: true });
      
    } catch (err: any) {
      if (err.response && err.response.data) {
        setError(err.response.data.message);
      } else {
        setError('Sunucuya bağlanılamadı.');
      }
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-xl border-t-4 border-blue-500">
        <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">Saha Personeli Girişi</h2>
        <p className="text-sm text-gray-500 mb-6 text-center">Günlük rota ve ziyaretleriniz için giriş yapın</p>
        
        {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm text-center">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
            <input 
              type="email" required
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              value={email} onChange={e => setEmail(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
            <input 
              type="password" required
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              value={password} onChange={e => setPassword(e.target.value)} 
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700 transition">
            Giriş Yap
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/admin-login" className="text-sm text-gray-400 hover:text-gray-600 transition">Yönetici girişine git</Link>
        </div>
      </div>
    </div>
  );
}