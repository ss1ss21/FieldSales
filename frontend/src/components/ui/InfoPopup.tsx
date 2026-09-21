import Modal from "./Modal";

interface InfoPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
}

export default function InfoPopup({ isOpen, onClose, title = "Bilgi", message }: InfoPopupProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      closeText="Anladım"
    >
      <div className="flex items-center gap-4 py-2">
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center text-sky-600">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
        </div>
        <p className="text-gray-700 font-medium leading-relaxed">{message}</p>
      </div>
    </Modal>
  );
}