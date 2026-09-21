import { useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';

export default function PersonnelLayout() {
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const fullname = localStorage.getItem('fullname'); 
  const email = localStorage.getItem('email');       

  // TARTIŞMASIZ GÜVENLİK KALKANI: Token yoksa ekranı saniyesinde kilitle
  useEffect(() => {
    if (!token || role !== 'Personnel') {
      navigate('/personnel-login', { replace: true });
    }
  }, [token, role, navigate]);

  // Yönlendirme bitene kadar eski sayfa görünmesin diye "null" döndürüyoruz
  if (!token || role !== 'Personnel') {
    return null; 
  }

  const handleLogout = () => {
    localStorage.clear(); 
    navigate('/personnel-login', { replace: true });
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <div className="w-64 bg-sky-900 text-sky-50 flex flex-col shadow-lg z-10">
        
        <div className="p-6 border-b border-sky-800">
          <div className="text-xl font-bold tracking-wide mb-3">
            Saha Operasyon
          </div>
          <div className="bg-sky-950/50 p-3 rounded-lg border border-sky-800/50">
            <div className="text-sm font-semibold text-sky-100 truncate">{fullname}</div>
            <div className="text-xs text-sky-400 truncate mt-0.5">{email}</div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/personnel/visits" className="block py-2.5 px-4 bg-sky-800/80 rounded-lg font-medium shadow-sm transition hover:bg-sky-700">
            Ziyaret (Rota)
          </Link>
          
          <div className="block py-2.5 px-4 text-sky-300/60 cursor-not-allowed">Sipariş</div>
          <div className="block py-2.5 px-4 text-sky-300/60 cursor-not-allowed">Tahsilat</div>
          <div className="block py-2.5 px-4 text-sky-300/60 cursor-not-allowed">Sevkiyat</div>
          <div className="block py-2.5 px-4 text-sky-300/60 cursor-not-allowed">Masraf</div>
        </nav>
        
        <div className="p-5 border-t border-sky-800">
          <button 
            onClick={handleLogout} 
            className="w-full bg-rose-500 py-2.5 rounded-lg text-sm font-semibold shadow-sm hover:bg-rose-600 transition"
          >
            Çıkış Yap
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-8 bg-slate-50">
        <Outlet />
      </div>
    </div>
  );
}