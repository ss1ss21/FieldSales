import { useState } from 'react';
import { type Visit, type Shift } from '../../../api/services';
import Modal from '../../../components/ui/Modal';

interface VisitSidebarProps {
    shift: Shift | null;
    visits: Visit[];
    hoveredVisitId: number | null;
    isDayEnded: boolean;
    onMouseEnterVisit: (id: number) => void;
    onMouseLeaveVisit: () => void;
    onSelectVisitForAction: (visit: Visit) => void;
    onClickVisit: (visit: Visit) => void;
    onGenerateRoute: () => void;
    onStartDayProcess: () => void;
    onEndDay: () => void;
}

export default function VisitSidebar({
    shift,
    visits,
    hoveredVisitId,
    isDayEnded,
    onMouseEnterVisit,
    onMouseLeaveVisit,
    onSelectVisitForAction,
    onClickVisit,
    onGenerateRoute,
    onStartDayProcess,
    onEndDay
}: VisitSidebarProps) {
    const [isEndDayModalOpen, setIsEndDayModalOpen] = useState(false);

    // Mesai şu an aktif mi? (Vardiya açılmış, henüz bitmemiş ve gün kapatılmamış olmalı)
    const isShiftActive = !!shift && !shift.endTime && !isDayEnded;

    const pendingVisits = visits.filter(v => v.status === 'Pending');
    const completedVisits = visits.filter(v => v.status !== 'Pending');

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Completed': return { label: 'Tamamlandı', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' };
            case 'Postponed': return { label: 'Ertelendi', color: 'bg-slate-100 text-slate-600 border-slate-200' };
            case 'Rejected': return { label: 'Reddedildi', color: 'bg-rose-50 text-rose-600 border-rose-200' };
            case 'Pending': default: return { label: 'Bekliyor', color: 'bg-amber-50 text-amber-600 border-amber-200' };
        }
    };

    const handleConfirmEndDay = () => {
        setIsEndDayModalOpen(false);
        onEndDay();
    };

    return (
        <div className="w-1/3 bg-white shadow-sm border border-slate-200 rounded-2xl p-6 flex flex-col justify-between overflow-hidden">
            <div>
                <div className="mb-4">
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Günlük Rota</h2>
                    <p className="text-slate-500 text-sm mt-0.5">Saha ziyaret ve operasyon takibi</p>
                </div>

                {isShiftActive && (
                    <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4">
                        <span className="text-xs font-semibold text-slate-600">
                            Aktif Mesai: {new Date(shift.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-xs font-bold text-emerald-600">Süreç Aktif</span>
                        </div>
                    </div>
                )}

                {!isShiftActive && !isDayEnded && (
                    <div className="p-3 bg-amber-50 text-amber-800 rounded-lg text-xs font-medium border border-amber-200 mb-4">
                        Ziyaretleri sonuçlandırmak için önce <strong>"Güne Başla"</strong> butonuna basınız.
                    </div>
                )}

                {isDayEnded && (
                    <div className="p-3 bg-rose-50 text-rose-700 rounded-lg text-xs font-bold text-center border border-rose-100 mb-4">
                        Bugünlük mesainiz sonlandırılmıştır.
                    </div>
                )}
            </div>

            <div className="space-y-6 overflow-y-auto flex-1 pr-1 my-2">
                <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                        Bekleyen Ziyaretler ({pendingVisits.length})
                    </h3>
                    <div className="space-y-3">
                        {pendingVisits.length === 0 ? (
                            <p className="text-xs text-slate-500 italic">Tüm bekleyen operasyonlar tamamlandı.</p>
                        ) : (
                            pendingVisits.map((visit) => (
                                <div
                                    key={visit.id}
                                    onClick={() => onClickVisit(visit)}
                                    onMouseEnter={() => onMouseEnterVisit(visit.id)}
                                    onMouseLeave={onMouseLeaveVisit}
                                    className={`p-3.5 border rounded-xl transition-all cursor-pointer bg-white border-slate-200 hover:border-sky-400 ${hoveredVisitId === visit.id ? 'border-sky-500 shadow-md ring-1 ring-sky-200' : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-1.5">
                                        <h3 className="font-bold text-slate-800 text-sm">{visit.routeOrder}. {visit.customer?.dealerName}</h3>
                                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${getStatusStyle(visit.status).color}`}>
                                            {getStatusStyle(visit.status).label}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 truncate mb-2">{visit.customer?.address}</p>

                                    {/* SADECE VE SADECE MESAİ AKTİFKEN BUTON GÖRÜNÜR */}
                                    {isShiftActive && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onSelectVisitForAction(visit);
                                            }}
                                            className="w-full mt-1 bg-slate-900 text-white py-2 rounded-lg text-xs font-semibold hover:bg-slate-800 transition shadow-sm"
                                        >
                                            Ziyareti Sonuçlandır
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        Sonuçlanan / Kapanan Ziyaretler ({completedVisits.length})
                    </h3>
                    <div className="space-y-3">
                        {completedVisits.length === 0 ? (
                            <p className="text-xs text-slate-500 italic">Henüz sonuçlanan ziyaret yok.</p>
                        ) : (
                            completedVisits.map((visit) => (
                                <div
                                    key={visit.id}
                                    onClick={() => onClickVisit(visit)}
                                    onMouseEnter={() => onMouseEnterVisit(visit.id)}
                                    onMouseLeave={onMouseLeaveVisit}
                                    className={`p-3.5 border rounded-xl transition-all cursor-pointer bg-slate-50 border-slate-100 hover:border-slate-300 ${hoveredVisitId === visit.id ? 'shadow-sm border-slate-300' : 'opacity-80'}`}
                                >
                                    <div className="flex justify-between items-start mb-1.5">
                                        <h3 className="font-bold text-slate-700 text-sm line-through decoration-slate-300">{visit.routeOrder}. {visit.customer?.dealerName}</h3>
                                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${getStatusStyle(visit.status).color}`}>
                                            {getStatusStyle(visit.status).label}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 truncate">{visit.customer?.address}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
                {isDayEnded ? (
                    <div className="w-full py-3 bg-slate-100 text-slate-500 rounded-xl text-center text-xs font-bold border border-slate-200">
                        Günlük Mesai Tamamlandı
                    </div>
                ) : !isShiftActive ? (
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={onGenerateRoute}
                            className="w-full py-3 rounded-xl font-bold text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 transition shadow-sm"
                        >
                            Rota Oluştur
                        </button>
                        <button
                            onClick={onStartDayProcess}
                            className="w-full py-3 rounded-xl font-bold text-xs bg-sky-600 text-white hover:bg-sky-700 transition shadow-md"
                        >
                            Güne Başla
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsEndDayModalOpen(true)}
                        className="w-full bg-red-500 text-white border border-rose-200 py-3 rounded-xl font-bold text-xs hover:bg-red-600 transition shadow-sm"
                    >
                        Günü Bitir (Mesaiyi Sonlandır)
                    </button>
                )}
            </div>

            <Modal
                isOpen={isEndDayModalOpen}
                onClose={() => setIsEndDayModalOpen(false)}
                title="Mesaiyi Sonlandır"
                confirmText="Evet, Bitir"
                closeText="Vazgeç"
                onConfirm={handleConfirmEndDay}
            >
                <div className="flex items-center gap-4 py-2">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <p className="text-gray-700 font-medium leading-relaxed">
                        {pendingVisits.length > 0 ? (
                            <>
                                <strong>DİKKAT!</strong> Tamamlanmamış <strong>{pendingVisits.length}</strong> adet ziyaretiniz var. <br />
                                Günü bitirirseniz bugün bir daha vardiya açamazsınız. Onaylıyor musunuz?
                            </>
                        ) : (
                            "Tüm operasyonlar tamamlandı. Günü kapatmak istiyor musunuz? (Bugün tekrar mesai başlatılamaz)"
                        )}
                    </p>
                </div>
            </Modal>
        </div>
    );
}