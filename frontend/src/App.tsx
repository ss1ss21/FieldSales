import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PersonnelLogin from './pages/personnel/PersonnelLogin';
import AdminLogin from './pages/admin/AdminLogin';

// Layouts
import AdminLayout from './pages/admin/AdminLayout';
import PersonnelLayout from './pages/personnel/PersonnelLayout';

// Pages
import Customers from './pages/admin/Customers';
import Visits from './pages/personnel/Visits';
import PersonnelPage from "./pages/admin/Personnel";
import AdminVisits from './pages/admin/AdminVisits';
import AdminShiftReports from './pages/admin/AdminShiftReports.tsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/personnel-login" replace />} />

        <Route path="/personnel-login" element={<PersonnelLogin />} />
        <Route path="/admin-login" element={<AdminLogin />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route path="customers" element={<Customers />} />
          <Route path="personnel" element={<PersonnelPage />} />
          <Route path="visits" element={<AdminVisits />} />
          <Route path="shift-reports" element={<AdminShiftReports/>} />
        </Route>

        {/* Personel Rotaları (PersonnelLayout içinde açılır) */}
        <Route path="/personnel" element={<PersonnelLayout />}>
          <Route path="visits" element={<Visits />} />
          {/* İleride sipariş, tahsilat buraya eklenecek */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;