import type { Customer, Personnel } from "../../../api/services";

interface Props {
    formData: Customer;
    personnelList: Personnel[];
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    onOpenMap: () => void;
    showValidationErrors: boolean; // Doğrulama hatalarını göstermek için yeni prop
}

export default function CustomerForm({ formData, personnelList, onChange, onOpenMap, showValidationErrors }: Props) {
    // Personel listesini Türkçe karakterlere uygun alfabetik sırala
    const sortedPersonnel = [...personnelList].sort((a, b) => a.fullName.localeCompare(b.fullName, 'tr-TR'));

    // Kutuların hata durumuna göre stilini belirleyen yardımcı fonksiyon
    const getInputClass = (isValid: boolean, isReadOnly: boolean = false) => {
        let baseClass = "w-full p-2.5 border rounded-lg text-sm transition outline-none shadow-sm ";
        
        if (showValidationErrors && !isValid) {
            // Hata durumu (Kırmızı yanacak)
            return baseClass + "border-rose-500 focus:ring-2 focus:ring-rose-200 bg-rose-50 text-rose-900";
        }
        
        if (isReadOnly) {
            // Sadece okunabilir (Harita adresi)
            return baseClass + "border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed";
        }

        // Normal durum
        return baseClass + "border-gray-300 focus:ring-2 focus:ring-blue-500 bg-white text-gray-800";
    };

    return (
        <div className="space-y-5">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Bayi Adı</label>
                <input 
                    type="text" 
                    name="dealerName" 
                    value={formData.dealerName} 
                    onChange={onChange} 
                    className={getInputClass(formData.dealerName.trim() !== "")} 
                    placeholder="Örn: Akdeniz Dağıtım A.Ş." 
                />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Yetkili Adı</label>
                <input 
                    type="text" 
                    name="contactName" 
                    value={formData.contactName} 
                    onChange={onChange} 
                    className={getInputClass(formData.contactName.trim() !== "")} 
                    placeholder="Örn: Ahmet Yılmaz" 
                />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Açık Adres ve Koordinat</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={onChange}
                        readOnly 
                        // Adres boşsa hata sınıfını, doluysa readonly sınıfını al
                        className={showValidationErrors && formData.address.trim() === "" ? getInputClass(false) : getInputClass(true, true)}
                        placeholder="Haritadan konum seçmek zorunludur"
                    />
                    <button
                        type="button"
                        onClick={onOpenMap}
                        className="px-4 py-2.5 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition flex items-center gap-2 whitespace-nowrap shadow-sm"
                    >
                        Haritadan Seç
                    </button>
                </div>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Sorumlu Personel</label>
                {/* Modern ve Özel Ok İkonlu Select Yapısı */}
                <div className="relative">
                    <select 
                        name="personnelId" 
                        value={formData.personnelId} 
                        onChange={onChange} 
                        className={`appearance-none cursor-pointer pr-10 ${getInputClass(formData.personnelId !== 0)}`}
                    >
                        <option value={0} disabled>-- Personel Seçiniz --</option>
                        {sortedPersonnel.map((p) => (
                            <option key={p.id} value={p.id}>{p.fullName}</option>
                        ))}
                    </select>
                    {/* Özel SVG Aşağı Ok İkonu */}
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
}