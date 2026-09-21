import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import Modal from "./Modal";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// React-Leaflet ikon hatasını çözen blok
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (lat: number, lng: number, address: string) => void;
    initialLat?: number;
    initialLng?: number;
}

// 1. HARİTAYI GÜVENLİ ŞEKİLDE KAYDIRAN BİLEŞEN
function MapUpdater({ flyTarget }: { flyTarget: [number, number] | null }) {
    const map = useMap();

    useEffect(() => {
        if (flyTarget) {
            map.flyTo(flyTarget, 15, { duration: 1.5 });
        }
    }, [flyTarget, map]);

    useEffect(() => {
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 300);
        return () => clearTimeout(timer);
    }, [map]);

    return null;
}

// 2. TIKLANAN YERE İĞNE BIRAKAN BİLEŞEN
function LocationMarker({ position, setPosition, setAddress, setErrorMsg }: any) {
    useMapEvents({
        async click(e) {
            const { lat, lng } = e.latlng;
            setPosition(e.latlng);
            setErrorMsg(""); // Yeni tıklamada eski hatayı temizle

            try {
                // OpenStreetMap'e bot olmadığımızı belirtmek için Header ekliyoruz
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
                    headers: { "Accept-Language": "tr-TR" }
                });
                
                if (!res.ok) throw new Error("API Engeli");
                
                const data = await res.json();
                setAddress(data.display_name || "Adres detayları bulunamadı, ancak koordinat kaydedildi.");
            } catch (err) {
                setAddress("Adres metni çekilemedi (Çok hızlı istek atıldı), ancak koordinat kaydedildi.");
            }
        },
    });

    return position === null ? null : <Marker position={position}></Marker>;
}

// 3. ANA HARİTA MODALI
export default function MapPickerModal({ isOpen, onClose, onConfirm, initialLat = 36.7969, initialLng = 34.6200 }: Props) {
    const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
    const [address, setAddress] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);
    
    // PROFESYONEL HATA YÖNETİMİ İÇİN YENİ STATE
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        if (isOpen) {
            setPosition({ lat: initialLat, lng: initialLng });
            setFlyTarget(null);
            setAddress("");
            setSearchQuery("");
            setErrorMsg(""); // Modal açıldığında hataları sıfırla
        }
    }, [isOpen, initialLat, initialLng]);

    // ADRES ARAMA FONKSİYONU
    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            setErrorMsg("Lütfen aramak için bir adres girin.");
            return;
        }
        
        setErrorMsg(""); // Aramaya başlarken eski hatayı temizle

        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`, {
                headers: { "Accept-Language": "tr-TR" }
            });
            
            if (!res.ok) throw new Error("Sunucu yanıt vermedi");

            const data = await res.json();
            
            if (data && data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lng = parseFloat(data[0].lon);
                setFlyTarget([lat, lng]);
                setPosition({ lat, lng });
                setAddress(data[0].display_name);
            } else {
                // Çirkin Alert yerine zarif State güncellemesi
                setErrorMsg(`'${searchQuery}' bulunamadı. Yeni bir arama yaparak tekrar deneyin.`);
            }
        } catch (err) {
            setErrorMsg("Arama sırasında bağlantı sorunu oluştu. Lütfen biraz bekleyip tekrar deneyin.");
        }
    };

    const handleConfirm = () => {
        if (position) {
            onConfirm(position.lat, position.lng, address);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} onConfirm={handleConfirm} title="Haritadan Konum Seç" confirmText="Bu Konumu Onayla" closeText="Vazgeç">
            <div className="space-y-4">
                
                {/* ARAMA ÇUBUĞU */}
                <div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="Mahalle, sokak, mekan veya şehir ara..."
                            className={`w-full p-2 border rounded focus:ring-2 outline-none text-sm ${errorMsg ? 'border-rose-400 focus:ring-rose-200' : 'border-gray-300 focus:ring-blue-500'}`}
                        />
                        <button
                            type="button"
                            onClick={handleSearch}
                            className="bg-slate-800 text-white px-5 py-2 rounded hover:bg-slate-700 transition font-medium"
                        >
                            Ara
                        </button>
                    </div>
                    {/* PROFESYONEL ZARİF HATA MESAJI */}
                    {errorMsg && (
                        <p className="text-rose-600 text-sm font-medium mt-1.5 flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
                            </svg>
                            {errorMsg}
                        </p>
                    )}
                </div>

                <div className="h-72 w-full rounded border border-gray-300 overflow-hidden relative z-0">
                    <MapContainer
                        center={[initialLat, initialLng]} 
                        zoom={14}
                        style={{ height: "100%", width: "100%" }}
                        zoomControl={true}
                    >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <MapUpdater flyTarget={flyTarget} />
                        <LocationMarker position={position} setPosition={setPosition} setAddress={setAddress} setErrorMsg={setErrorMsg} />
                    </MapContainer>
                </div>

                {/* Sonuç Önizleme */}
                <div className="p-3 bg-gray-50 rounded border text-sm">
                    <span className="font-semibold text-gray-700">Seçilen Adres: </span>
                    {address ? <span className="text-green-700 font-medium">{address}</span> : <span className="text-gray-400 italic">Haritada arama yapın veya bir noktaya tıklayın...</span>}
                </div>
            </div>
        </Modal>
    );
}