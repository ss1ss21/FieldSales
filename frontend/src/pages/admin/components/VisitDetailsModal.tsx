import Modal from '../../../components/ui/Modal';

interface VisitDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  visit: any | null;
}

export default function VisitDetailsModal({ isOpen, onClose, visit }: VisitDetailsModalProps) {
  if (!visit) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ziyaret ve Operasyon Detayı" closeText="Kapat">
      <div className="space-y-6 py-2">
        <div className="flex justify-between items-start pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-800">{visit.customerName}</h3>
            <p className="text-sm text-slate-500">Personel: {visit.personnelName}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${visit.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : visit.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
            {visit.status === 'Pending' ? 'Bekliyor' : 'Tamamlandı'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Planlanan Tarih</p>
            <p className="text-sm font-medium text-slate-700">{new Date(visit.visitDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Check-in Saati</p>
            <p className="text-sm font-medium text-slate-700">{visit.checkInTime ? new Date(visit.checkInTime).toLocaleTimeString() : 'Bekleniyor'}</p>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Görüşme Notu</p>
          <div className="w-full min-h-[80px] p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 italic">
            {visit.evaluationNote || "Henüz bir not girilmemiş."}
          </div>
        </div>
      </div>
    </Modal>
  );
}