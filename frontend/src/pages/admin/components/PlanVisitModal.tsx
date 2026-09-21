import { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import AlertPopup from '../../../components/ui/AlertPopup'; // AlertPopup yolu (kendi yoluna göre teyit edebilirsin)
import { type Personnel, type Customer } from '../../../api/services';

interface PlanVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  personnelList: Personnel[];
  customerList: Customer[];
  onConfirm: (data: { personnelId: number; customerId: number; visitDate: string }) => void;
}

export default function PlanVisitModal({ isOpen, onClose, personnelList, customerList, onConfirm }: PlanVisitModalProps) {
  const todayString = new Date().toISOString().split('T')[0];

  const [personnelId, setPersonnelId] = useState<string>('');
  const [customerId, setCustomerId] = useState<string>('');
  const [visitDate, setVisitDate] = useState<string>(todayString);
  
  // AlertPopup state yönetimi
  const [alertInfo, setAlertInfo] = useState({ isOpen: false, message: "" });

  // Akıllı Eşleşme: Personel seçilirse sadece onun bayilerini listele
  const filteredCustomers = personnelId 
    ? customerList.filter(c => c.personnelId === Number(personnelId))
    : customerList;

  // Bayi seçilirse sorumlu personeli otomatik ata
  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCustId = e.target.value;
    setCustomerId(selectedCustId);

    if (selectedCustId) {
      const foundCustomer = customerList.find(c => c.id === Number(selectedCustId));
      if (foundCustomer?.personnelId) {
        setPersonnelId(foundCustomer.personnelId.toString());
      }
    }
  };

  const handleSubmit = () => {
    if (!personnelId || !customerId) {
      setAlertInfo({ isOpen: true, message: "Lütfen operasyon için saha personeli ve hedef bayi seçimini eksiksiz yapınız." });
      return;
    }

    // Geçmiş tarih kontrolü
    if (visitDate < todayString) {
      setAlertInfo({ isOpen: true, message: "Geçmiş bir tarihe saha ziyareti planlayamazsınız." });
      return;
    }

    onConfirm({
      personnelId: Number(personnelId),
      customerId: Number(customerId),
      visitDate: visitDate
    });

    setPersonnelId('');
    setCustomerId('');
  };

  return (
    <>
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        title="Saha Ziyareti Planlama" 
        closeText="İptal"
        confirmText="Onayla"
        onConfirm={handleSubmit}
      >
        <div className="space-y-5 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Saha Personeli</label>
              <select 
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 outline-none focus:ring-2 focus:ring-slate-800 transition"
                value={personnelId} 
                onChange={e => setPersonnelId(e.target.value)}
              >
                <option value="">Personel Seçin</option>
                {personnelList.map(p => (
                  <option key={p.id} value={p.id}>{p.fullName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Ziyaret Tarihi</label>
              <input 
                type="date" 
                min={todayString} 
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 outline-none focus:ring-2 focus:ring-slate-800 transition"
                value={visitDate} 
                onChange={e => setVisitDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Hedef Bayi / Müşteri</label>
            <select 
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 outline-none focus:ring-2 focus:ring-slate-800 transition"
              value={customerId} 
              onChange={handleCustomerChange}
            >
              <option value="">Bayi Seçin</option>
              {filteredCustomers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.dealerName} {c.personnel ? `[${c.personnel.fullName}]` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Modal>

      {/* Standart tarayıcı alerti yerine şık AlertPopup bileşeni */}
      <AlertPopup 
        isOpen={alertInfo.isOpen} 
        onClose={() => setAlertInfo({ isOpen: false, message: "" })} 
        message={alertInfo.message} 
      />
    </>
  );
}