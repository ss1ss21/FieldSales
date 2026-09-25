import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';

export default function AdminLayout() {
  const navigate = useNavigate();
  
  // GÜVENLİK DUVARI
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token || role !== 'Admin') {
    return <Navigate to="/admin-login" replace />;
  }

  // GÜVENLİ ÇIKIŞ
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('fullname');
    navigate('/admin-login', { replace: true });
  };

  // KRİTİK NOKTA: Bu tanım return'ün hemen üstünde ve fonksiyonun içinde olmalı
  const navLinkClass = ({ isActive }: { isActive: boolean }) => 
    `block py-2.5 px-4 rounded-lg font-medium transition ${
      isActive 
        ? "bg-slate-700/80 text-white shadow-sm" 
        : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
    }`;

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="w-64 bg-slate-800 text-slate-50 flex flex-col shadow-lg z-10">
        <div className="p-6 text-xl font-bold border-b border-slate-700 tracking-wide">
          Yönetici Paneli
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <NavLink to="/admin/customers" className={navLinkClass}>
            Müşteriler
          </NavLink>
          
          <NavLink to="/admin/personnel" className={navLinkClass}>
            Personeller
          </NavLink>
          
           <NavLink to="/admin/visits" className={navLinkClass}>
            Randevular
          </NavLink>

          <NavLink to="/admin/shift-reports" className={navLinkClass}>
            Vardiya Raporları
          </NavLink>
          

          <div className="block py-2.5 px-4 text-slate-500 cursor-not-allowed">Stoklar</div>
        </nav>
        
        <div className="p-5 border-t border-slate-700">
          <button 
            onClick={handleLogout}
            className="w-full bg-rose-500 py-2.5 rounded-lg text-sm font-semibold shadow-sm hover:bg-rose-600 transition"
          >
            Çıkış Yap
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto bg-slate-50">
        <Outlet /> 
      </main>
    </div>
  );
}