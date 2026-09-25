import { useState, useEffect, useCallback } from 'react';
import { VisitService, type Visit, type Shift } from '../../api/services';
import VisitMap from './components/VisitMap';
import VisitSidebar from './components/VisitSidebar';
import VisitActionModal from './components/VisitActionModal';
import AlertPopup from '../../components/ui/AlertPopup';
import InfoPopup from '../../components/ui/InfoPopup';

export default function Visits() {
  const currentUserId = Number(localStorage.getItem('userId'));
  const todayKey = `dayEnded_${currentUserId}_${new Date().toISOString().split('T')[0]}`;

  const [shift, setShift] = useState<Shift | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [currentLoc, setCurrentLoc] = useState<{lat: number, lng: number} | null>(null);
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [isRouteActive, setIsRouteActive] = useState(false);
  const [isDayEnded, setIsDayEnded] = useState(() => localStorage.getItem(todayKey) === 'true');
  
  const [hoveredVisitId, setHoveredVisitId] = useState<number | null>(null);
  const [focusedCoords, setFocusedCoords] = useState<[number, number] | null>(null); 
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [activeVisit, setActiveVisit] = useState<Visit | null>(null);
  
  const [alertInfo, setAlertInfo] = useState({ isOpen: false, message: "" });
  const [infoPopup, setInfoPopup] = useState({ isOpen: false, title: "", message: "" });

  const fetchLocation = useCallback(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setCurrentLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setAlertInfo({ isOpen: true, message: "GPS konumu alınamadı." }),
      { enableHighAccuracy: true }
    );
  }, []);

  const loadTodayData = useCallback(async () => {
    if (!currentUserId) return;
    try {
      const res = await VisitService.getToday(currentUserId);
      setShift(res.data.shift);
      setVisits(res.data.visits);
      
      if (res.data.shift) {
        setIsRouteActive(true);
        fetchLocation();
      }
    } catch (err) {
      console.error("Veriler yüklenemedi", err);
    }
  }, [currentUserId, fetchLocation]);

  useEffect(() => { loadTodayData(); }, [loadTodayData]);

  useEffect(() => {
    if (isRouteActive && currentLoc && visits.length > 0) {
      const pendingVisits = visits.filter(v => v.status === 'Pending');
      if (pendingVisits.length === 0) {
        setRouteCoords([]);
        return;
      }
      
      let coordsString = `${currentLoc.lng},${currentLoc.lat}`;
      pendingVisits.forEach(v => coordsString += `;${v.customer.longitude},${v.customer.latitude}`);

      fetch(`https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`)
        .then(res => res.json())
        .then(data => {
          if (data.routes?.length > 0) {
            setRouteCoords(data.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]]));
          }
        })
        .catch(err => console.error("OSRM Hatası", err));
    }
  }, [isRouteActive, currentLoc, visits]);

  const handleGenerateRoute = () => {
    if (isDayEnded) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCurrentLoc({ lat, lng });
        VisitService.startDay({ personnelId: currentUserId, startLat: lat, startLng: lng })
          .then((res) => {
            setIsRouteActive(true);
            setVisits(res.data.visits);
            setInfoPopup({ isOpen: true, title: "Başarılı", message: "Güncel konumunuza göre rota optimize edildi." });
          })
          .catch(() => setAlertInfo({ isOpen: true, message: "Rota oluşturulurken hata oluştu." }));
      },
      () => setAlertInfo({ isOpen: true, message: "Lütfen GPS konum izni veriniz." }),
      { enableHighAccuracy: true }
    );
  };

  const handleStartDayProcess = () => {
    if (isDayEnded || shift) {
      setAlertInfo({ isOpen: true, message: "Bugün için mesainiz sonlandırılmış veya zaten aktiftir." });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCurrentLoc({ lat, lng });
        VisitService.startDay({ personnelId: currentUserId, startLat: lat, startLng: lng })
          .then((res) => {
            setIsRouteActive(true);
            setShift(res.data.shift);
            setVisits(res.data.visits);
            setInfoPopup({ isOpen: true, title: "Mesai Başladı", message: "Saha mesaisi başarıyla başlatıldı!" });
          })
          .catch(() => setAlertInfo({ isOpen: true, message: "Güne başlanırken hata oluştu." }));
      },
      () => setAlertInfo({ isOpen: true, message: "Lütfen GPS konum izni veriniz." }),
      { enableHighAccuracy: true }
    );
  };

  const handleModalSubmit = async (status: string, note: string) => {
    if (!activeVisit) return;
    try {
      await VisitService.completeVisit(activeVisit.id, { status, evaluationNote: note });
      if (currentLoc) {
        await VisitService.recalculateRoute({ personnelId: currentUserId, currentLat: currentLoc.lat, currentLng: currentLoc.lng });
      }
      setActionModalOpen(false);
      setActiveVisit(null);
      loadTodayData();
    } catch {
      setAlertInfo({ isOpen: true, message: "İşlem sırasında hata oluştu." });
    }
  };

  const handleEndDay = async () => {
    if (!shift || !currentLoc) {
      setAlertInfo({ isOpen: true, message: "Geçerli bir mesai veya konum bulunamadı." });
      return;
    }
    
    try {
      await VisitService.endDay({ shiftId: shift.id, endLat: currentLoc.lat, endLng: currentLoc.lng });
      setShift(null);
      setIsRouteActive(false);
      setRouteCoords([]);
      
      localStorage.setItem(todayKey, 'true');
      setIsDayEnded(true);

      setInfoPopup({ isOpen: true, title: "Mesai Bitti", message: "Mesai başarıyla sonlandırıldı. İyi dinlenmeler!" });
      
      loadTodayData();
    } catch {
      setAlertInfo({ isOpen: true, message: "Gün bitirilirken hata oluştu." });
    }
  };

  return (
    <div className="flex h-full gap-6">
      <VisitSidebar 
        shift={shift}
        visits={visits}
        hoveredVisitId={hoveredVisitId}
        isDayEnded={isDayEnded}
        onMouseEnterVisit={(id) => setHoveredVisitId(id)}
        onMouseLeaveVisit={() => setHoveredVisitId(null)}
        onSelectVisitForAction={(visit) => { setActiveVisit(visit); setActionModalOpen(true); }}
        onClickVisit={(visit) => setFocusedCoords([visit.customer.latitude, visit.customer.longitude])} 
        onGenerateRoute={handleGenerateRoute}
        onStartDayProcess={handleStartDayProcess}
        onEndDay={handleEndDay}
      />

      <div className="w-2/3 relative z-0">
        <VisitMap 
          currentLoc={currentLoc} 
          visits={visits} 
          routeCoords={routeCoords} 
          isRouteActive={isRouteActive} 
          hoveredVisitId={hoveredVisitId} 
          focusedCoords={focusedCoords} 
          onMarkerClick={(visit) => {
            if (visit.status === 'Pending' && !isDayEnded) {
              setActiveVisit(visit);
              setActionModalOpen(true);
            }
          }}
        />
      </div>

      <VisitActionModal 
        isOpen={actionModalOpen} 
        onClose={() => setActionModalOpen(false)} 
        onSubmit={handleModalSubmit}
        visitName={activeVisit?.customer.dealerName || ''}
      />

      <AlertPopup 
        isOpen={alertInfo.isOpen} 
        onClose={() => setAlertInfo({ isOpen: false, message: "" })} 
        message={alertInfo.message} 
      />

      <InfoPopup 
        isOpen={infoPopup.isOpen} 
        onClose={() => setInfoPopup({ ...infoPopup, isOpen: false })} 
        title={infoPopup.title} 
        message={infoPopup.message} 
      />
    </div>
  );
}