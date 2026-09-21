import { useState, useEffect } from "react";
import Modal from "../../components/ui/Modal";
import AlertPopup from "../../components/ui/AlertPopup";
import MapPickerModal from "../../components/ui/MapPickerModal"; 
import { CustomerService, UserService, type Customer, type Personnel } from "../../api/services";
import CustomerTable from "./components/CustomerTable";
import CustomerForm from "./components/CustomerForm";

const emptyCustomer: Customer = { 
  dealerName: "", 
  contactName: "", 
  address: "", 
  latitude: 36.8000,  // Mersin Enlem olarak güncellendi
  longitude: 34.6333, // Mersin Boylam olarak güncellendi
  personnelId: 0 
};

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [personnelList, setPersonnelList] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState<Customer>(emptyCustomer);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [isMapOpen, setIsMapOpen] = useState(false); 

  const loadData = async () => {
    setLoading(true);
    const [custRes, persRes] = await Promise.all([CustomerService.getAll(), UserService.getPersonnel()]);
    setCustomers(custRes.data);
    setPersonnelList(persRes.data);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = async () => {
    setShowValidation(true);

    if (
      !formData.dealerName.trim() || 
      !formData.contactName.trim() || 
      !formData.address.trim() || 
      !formData.personnelId || 
      formData.personnelId === 0
    ) {
      setAlertMessage("Lütfen kırmızı ile belirtilen eksik alanları doldurunuz.");
      return; 
    }

    try {
      if (isEditing && formData.id) {
        await CustomerService.update(formData.id, formData);
      } else {
        await CustomerService.create(formData);
      }
      setIsFormOpen(false);
      setShowValidation(false);
      loadData();
    } catch (err) {
      setAlertMessage("Sunucuya kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  const handleDelete = async () => {
    if (customerToDelete?.id) {
      await CustomerService.delete(customerToDelete.id);
    }
    setCustomerToDelete(null);
    loadData();
  };

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      address: address && address.includes("çekilemedi") ? prev.address : address 
    }));
  };

  const openForm = (customer: Customer = emptyCustomer, editing: boolean = false) => {
    setFormData(customer);
    setIsEditing(editing);
    setShowValidation(false);
    setIsFormOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Müşterilerim</h1>
        <button 
          onClick={() => openForm(emptyCustomer, false)} 
          className="bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-2 text-sm rounded-lg font-medium shadow-sm"
        >
          + Yeni Müşteri Ekle
        </button>
      </div>

      <CustomerTable 
        customers={customers} 
        loading={loading} 
        onEdit={(c) => openForm(c, true)} 
        onDelete={setCustomerToDelete} 
      />

      <Modal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onConfirm={handleSave} 
        title={isEditing ? "Müşteri Düzenle" : "Yeni Müşteri Ekle"}
      >
        <CustomerForm 
          formData={formData} 
          personnelList={personnelList} 
          onChange={(e) => setFormData(p => ({ ...p, [e.target.name]: e.target.name === "personnelId" ? Number(e.target.value) : e.target.value }))} 
          onOpenMap={() => setIsMapOpen(true)} 
          showValidationErrors={showValidation}
        />
      </Modal>

      <Modal 
        isOpen={!!customerToDelete} 
        onClose={() => setCustomerToDelete(null)} 
        onConfirm={handleDelete} 
        title="Silme Onayı" 
        confirmText="Evet, Sil"
      >
        <p className="text-gray-600">
          <strong className="text-gray-900">{customerToDelete?.dealerName}</strong> silinecek. Emin misiniz? Bu işlem geri alınamaz.
        </p>
      </Modal>

      <AlertPopup 
        isOpen={alertMessage !== ""} 
        onClose={() => setAlertMessage("")} 
        message={alertMessage} 
      />

      <MapPickerModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onConfirm={handleLocationSelect}
        initialLat={formData.latitude || 36.8000} 
        initialLng={formData.longitude || 34.6333}
      />
    </div>
  );
}