import { useState, useEffect } from "react";
import Modal from "../../components/ui/Modal";
import AlertPopup from "../../components/ui/AlertPopup";
import { UserService, CustomerService, type Personnel, type Customer } from "../../api/services";
import PersonnelTable from "./components/PersonnelTable";
import PersonnelForm from "./components/PersonnelForm";

// Fabrika ayarları şablonu (Yeni personel için)
const emptyPersonnel: Personnel = { 
  fullName: "", 
  email: "", 
  password: "",
  role: "Personnel" 
};

export default function PersonnelPage() {
  const [personnelList, setPersonnelList] = useState<Personnel[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State'leri
  const [formData, setFormData] = useState<Personnel>(emptyPersonnel);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  
  // Silme ve Hata Uyarı State'leri
  const [personnelToDelete, setPersonnelToDelete] = useState<Personnel | null>(null);
  const [alertMessage, setAlertMessage] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
        // Tabloda dükkanları gösterebilmek için müşterileri de çekiyoruz
        const [persRes, custRes] = await Promise.all([UserService.getPersonnel(), CustomerService.getAll()]);
        setPersonnelList(persRes.data);
        setCustomers(custRes.data);
    } catch (err) {
        console.error("Veri yükleme hatası", err);
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = async () => {
    setShowValidation(true); // Hata görünümünü aktif et

    // Doğrulama: Ad ve Email zorunlu. Yeni ekleniyorsa Şifre de zorunlu.
    const isNameValid = (formData.fullName || "").trim() !== "";
    const isEmailValid = (formData.email || "").trim() !== "";
    const isPasswordValid = isEditing ? true : (formData.password || "").trim() !== "";

    if (!isNameValid || !isEmailValid || !isPasswordValid) {
      setAlertMessage("Lütfen kırmızı ile belirtilen eksik alanları doldurunuz.");
      return; 
    }

    try {
      if (isEditing && formData.id) {
        // Backend'in update servisi varsa burayı kullanır
        await UserService.update(formData.id, formData);
      } else {
        await UserService.create(formData);
      }
      setIsFormOpen(false);
      setShowValidation(false);
      loadData();
    } catch (err) {
      setAlertMessage("Sunucuya kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  const handleDelete = async () => {
    if (personnelToDelete?.id) {
      try {
        await UserService.delete(personnelToDelete.id);
        setPersonnelToDelete(null);
        loadData();
      } catch (err) {
        setAlertMessage("Bu personelin üzerinde kayıtlı müşteriler olduğu için silinemiyor olabilir.");
        setPersonnelToDelete(null);
      }
    }
  };

  const openForm = (personnel: Personnel = emptyPersonnel, editing: boolean = false) => {
    setFormData({ ...personnel, password: "" }); // Düzenlerken şifreyi temiz getir
    setIsEditing(editing);
    setShowValidation(false); 
    setIsFormOpen(true);
  };

  return (
    <div>
      {/* BAŞLIK VE EKLEME BUTONU */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Personeller</h1>
        <button 
          onClick={() => openForm(emptyPersonnel, false)} 
          className="bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-2 text-sm rounded-lg font-medium shadow-sm"
        >
          + Yeni Personel Ekle
        </button>
      </div>

      <PersonnelTable 
        personnelList={personnelList} 
        customers={customers}
        loading={loading} 
        onEdit={(p) => openForm(p, true)} 
        onDelete={setPersonnelToDelete} 
      />

      {/* FORM MODALI */}
      <Modal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onConfirm={handleSave} 
        title={isEditing ? "Personel Bilgilerini Düzenle" : "Yeni Personel Ekle"}
      >
        <PersonnelForm 
          formData={formData} 
          onChange={(e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }))} 
          showValidationErrors={showValidation} 
          isEditing={isEditing}
        />
      </Modal>

      {/* SİLME ONAY MODALI */}
      <Modal 
        isOpen={!!personnelToDelete} 
        onClose={() => setPersonnelToDelete(null)} 
        onConfirm={handleDelete} 
        title="Silme Onayı" 
        confirmText="Evet, Sil"
      >
        <p className="text-gray-600">
          <strong className="text-gray-900">{personnelToDelete?.fullName}</strong> adlı personeli silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
        </p>
      </Modal>

      {/* UYARI POPUP'I */}
      <AlertPopup 
        isOpen={alertMessage !== ""} 
        onClose={() => setAlertMessage("")} 
        message={alertMessage} 
      />
    </div>
  );
}