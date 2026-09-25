import { useState, useEffect, useCallback } from 'react';
import PlanVisitModal from './components/PlanVisitModal';
import VisitDetailsModal from './components/VisitDetailsModal';
import { VisitService, UserService, CustomerService } from '../../api/services';
import InfoPopup from '../../components/ui/InfoPopup'; // <-- Yeni InfoPopup Eklendi

export default function AdminVisits() {
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<any | null>(null);

  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterPersonnel, setFilterPersonnel] = useState('');

  const [visits, setVisits] = useState<any[]>([]);
  const [personnelList, setPersonnelList] = useState<any[]>([]);
  const [customerList, setCustomerList] = useState<any[]>([]);
  
  // <-- Yeni Popup State'i
  const [infoPopup, setInfoPopup] = useState({ isOpen: false, title: "", message: "" });

  const loadVisits = useCallback(async () => {
    try {
      const res = await VisitService.getAdminVisits(filterDate, filterPersonnel);
      setVisits(res.data);
    } catch (err) {
      console.error("Ziyaretler yüklenemedi", err);
    }
  }, [filterDate, filterPersonnel]);

  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const pRes = await UserService.getPersonnel();
        setPersonnelList(pRes.data);

        const cRes = await CustomerService.getAll();
        setCustomerList(cRes.data);
      } catch (error) {
        console.error("Dropdown dataları çekilemedi", error);
      }
    };
    loadDropdownData();
  }, []);

  useEffect(() => {
    loadVisits();
  }, [loadVisits]);

  // Yeni Plan Kaydet
  const handleSavePlan = async (data: { personnelId: number, customerId: number, visitDate: string }) => {
    try {
      await VisitService.createVisit(data);
      setIsPlanModalOpen(false);
      loadVisits();
    } catch (err: any) {
      const resData = err.response?.data;
      const errorMessage =
        resData?.message ||
        (typeof resData === "string" ? resData : null) ||
        "Plan kaydedilirken bir hata oluştu.";

      setInfoPopup({
        isOpen: true,
        title: "İşlem Başarısız",
        message: errorMessage
      });
    }
  };

  const pendingVisits = visits.filter(v => v.status === 'Pending');
  const completedVisits = visits.filter(v => v.status !== 'Pending');

  return (
    <div className="p-8 bg-slate-50 min-h-screen">

      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Operasyon Yönetimi</h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">Ziyaret planlaması ve saha takibi</p>
        </div>
        <button
          onClick={() => setIsPlanModalOpen(true)}
          className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md hover:bg-slate-800 transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Yeni Plan Oluştur
        </button>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 mb-8 flex gap-6">
        <div className="flex-1">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tarih Filtresi</label>
          <input
            type="date"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Personel Filtresi</label>
          <select
            value={filterPersonnel}
            onChange={e => setFilterPersonnel(e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition appearance-none"
          >
            <option value="">Tüm Personeller</option>
            {personnelList.map(p => (
              <option key={p.id} value={p.id}>{p.fullName}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse"></span>
          Bekleyen Ziyaretler ({pendingVisits.length})
        </h2>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                <th className="p-4 font-bold">Sıra</th>
                <th className="p-4 font-bold">Müşteri</th>
                <th className="p-4 font-bold">Personel</th>
                <th className="p-4 font-bold">Durum</th>
                <th className="p-4 font-bold text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pendingVisits.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">Bu tarihte bekleyen ziyaret planı bulunamadı.</td>
                </tr>
              ) : pendingVisits.map((visit) => (
                <tr key={visit.id} className="hover:bg-slate-50 transition group">
                  <td className="p-4 text-slate-400 font-semibold">{visit.routeOrder}</td>
                  <td className="p-4 text-slate-800 font-bold">{visit.customerName}</td>
                  <td className="p-4 text-slate-600 font-medium">{visit.personnelName}</td>
                  <td className="p-4">
                    <span className="px-3 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200">
                      Bekliyor
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedVisit(visit)}
                      className="text-sm font-semibold text-sky-600 hover:text-sky-800 px-4 py-2 bg-sky-50/50 hover:bg-sky-100 rounded-lg transition opacity-0 group-hover:opacity-100"
                    >
                      Detay Gör
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
          Sonuçlanan Ziyaretler ({completedVisits.length})
        </h2>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                <th className="p-4 font-bold">Sıra</th>
                <th className="p-4 font-bold">Müşteri</th>
                <th className="p-4 font-bold">Personel</th>
                <th className="p-4 font-bold">Durum</th>
                <th className="p-4 font-bold text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {completedVisits.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">Bu tarihte sonuçlanan ziyaret bulunmamaktadır.</td>
                </tr>
              ) : completedVisits.map((visit) => (
                <tr key={visit.id} className="hover:bg-slate-50 transition group">
                  <td className="p-4 text-slate-400 font-semibold">{visit.routeOrder}</td>
                  <td className="p-4 text-slate-800 font-bold">{visit.customerName}</td>
                  <td className="p-4 text-slate-600 font-medium">{visit.personnelName}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-md text-xs font-bold border ${visit.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : visit.status === 'Postponed' ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
                      {visit.status === 'Completed' ? 'Tamamlandı' : visit.status === 'Postponed' ? 'Ertelendi' : 'Reddedildi'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedVisit(visit)}
                      className="text-sm font-semibold text-slate-600 hover:text-slate-800 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition opacity-0 group-hover:opacity-100"
                    >
                      Detay Gör
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <PlanVisitModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        personnelList={personnelList}
        customerList={customerList}
        onConfirm={handleSavePlan} 
      />
      <VisitDetailsModal
        isOpen={!!selectedVisit}
        onClose={() => setSelectedVisit(null)}
        visit={selectedVisit}
      />

      {/* Eklenen Şık Hata/Bilgi Pop-up'ı */}
      <InfoPopup 
        isOpen={infoPopup.isOpen} 
        onClose={() => setInfoPopup({ ...infoPopup, isOpen: false })} 
        title={infoPopup.title} 
        message={infoPopup.message} 
      />
    </div>
  );
}