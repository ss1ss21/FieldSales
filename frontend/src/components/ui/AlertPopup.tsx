import Modal from "./Modal";

interface AlertPopupProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

export default function AlertPopup({ isOpen, onClose, message }: AlertPopupProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Eksik Bilgi"
      closeText="Anladım"
    >
      <div className="flex items-center gap-4 py-2">
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-gray-700 font-medium leading-relaxed">{message}</p>
      </div>
    </Modal>
  );
}