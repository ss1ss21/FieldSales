import type { Personnel } from "../../../api/services";

// Tip tanımına password opsiyonel olarak eklendi
interface PersonnelFormProps extends Personnel {
    password?: string;
}

interface Props {
    formData: PersonnelFormProps;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    showValidationErrors: boolean;
    isEditing: boolean;
}

export default function PersonnelForm({ formData, onChange, showValidationErrors, isEditing }: Props) {
    
    const getInputClass = (isValid: boolean) => {
        let baseClass = "w-full p-2.5 border rounded-lg text-sm transition outline-none shadow-sm ";
        if (showValidationErrors && !isValid) {
            return baseClass + "border-rose-500 focus:ring-2 focus:ring-rose-200 bg-rose-50 text-rose-900";
        }
        return baseClass + "border-gray-300 focus:ring-2 focus:ring-blue-500 bg-white text-gray-800";
    };

    return (
        <div className="space-y-5">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ad Soyad</label>
                <input 
                    type="text" 
                    name="fullName" 
                    value={formData.fullName || ""} 
                    onChange={onChange} 
                    className={getInputClass((formData.fullName || "").trim() !== "")} 
                    placeholder="Örn: Mehmet Yıldırım" 
                />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">E-posta Adresi</label>
                <input 
                    type="email" 
                    name="email" 
                    value={formData.email || ""} 
                    onChange={onChange} 
                    className={getInputClass((formData.email || "").trim() !== "")} 
                    placeholder="Örn: mehmet@sirket.com" 
                />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Giriş Şifresi {isEditing && <span className="text-gray-400 font-normal text-xs">(Değiştirmek istemiyorsanız boş bırakın)</span>}
                </label>
                <input 
                    type="password" 
                    name="password" 
                    value={formData.password || ""} 
                    onChange={onChange} 
                    className={getInputClass(isEditing ? true : (formData.password || "").trim() !== "")} 
                    placeholder="Kullanıcı için geçici bir şifre belirleyin" 
                />
            </div>
        </div>
    );
}