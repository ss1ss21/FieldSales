import { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import InfoPopup from '../../../components/ui/InfoPopup'; 

interface VisitActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (status: string, note: string) => void;
  visitName: string;
}

export default function VisitActionModal({ isOpen, onClose, onSubmit, visitName }: VisitActionModalProps) {
  const [note, setNote] = useState('');
  const [status, setStatus] = useState('Completed'); 
  const [infoPopup, setInfoPopup] = useState({ isOpen: false, title: "", message: "" }); 

  const handleClose = () => {
    setNote('');
    setStatus('Completed');
    onClose();
  };

  const handleSubmit = () => {
    if (!note.trim()) {
      setInfoPopup({ isOpen: true, title: "Eksik Bilgi", message: "Lütfen bir görüşme notu giriniz." });
      return;
    }
    onSubmit(status, note);
    handleClose();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Ziyareti Sonuçlandır"
        closeText="İptal Et"
        confirmText="Sisteme Kaydet"
        onConfirm={handleSubmit}
      >
        <div className="space-y-4 py-2">
          <div className="p-3 bg-blue-50 text-blue-800 rounded-lg text-sm font-medium border border-blue-100">
            📍 {visitName}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Görüşme Durumu</label>
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Completed">Onaylandı (Sipariş/Tahsilat Alındı)</option>
              <option value="Postponed">Ertelendi</option>
              <option value="Rejected">Reddedildi</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Görüşme Notu</label>
            <textarea 
              rows={3} 
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              placeholder="Müşterinin talepleri veya bir sonraki ziyaret için notlar..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>
      </Modal>

      <InfoPopup 
        isOpen={infoPopup.isOpen} 
        onClose={() => setInfoPopup({ ...infoPopup, isOpen: false })} 
        title={infoPopup.title}
        message={infoPopup.message} 
      />
    </>
  );
}