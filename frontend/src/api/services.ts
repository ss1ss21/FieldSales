import axiosInstance from "./axiosInstance";

export interface Personnel {
  id?: number; 
  fullName: string;
  password?: string;
  email: string;
  role?: string;
}

export interface Customer {
  id?: number;
  dealerName: string;
  contactName: string;
  address: string;
  latitude: number;
  longitude: number;
  personnelId: number;
  personnel?: Personnel;
}

export interface Visit {
  id: number;
  personnelId: number;
  customerId: number;
  customer: Customer; 
  visitDate: string;
  routeOrder: number;
  status: string;
  evaluationNote?: string;
  checkInTime?: string;
}

export interface Shift {
  id: number;
  personnelId: number;
  startTime: string;
  endTime?: string;
}

export const CustomerService = {
  getAll: () => axiosInstance.get<Customer[]>("/customers"),
  create: (data: Customer) => axiosInstance.post("/customers", data),
  update: (id: number, data: Customer) => axiosInstance.put(`/customers/${id}`, data),
  delete: (id: number) => axiosInstance.delete(`/customers/${id}`),
};

export const UserService = {
  getPersonnel: () => axiosInstance.get<Personnel[]>("/users/personnel"),
  create: (data: Personnel) => axiosInstance.post("/users", data),
  update: (id: number, data: Personnel) => axiosInstance.put(`/users/${id}`, data),
  delete: (id: number) => axiosInstance.delete(`/users/${id}`),
};

export const VisitService = {
  getToday: (personnelId: number) => 
    axiosInstance.get<{ shift: Shift | null, visits: Visit[] }>(`/visits/today/${personnelId}`),
    
  startDay: (data: { personnelId: number; startLat: number; startLng: number }) => 
    axiosInstance.post("/visits/start-day", data),
    
  recalculateRoute: (data: { personnelId: number; currentLat: number; currentLng: number }) => 
    axiosInstance.post<Visit[]>("/visits/recalculate", data),
    
  completeVisit: (id: number, data: { status: string; evaluationNote?: string }) => 
    axiosInstance.put(`/visits/${id}/complete`, data),
    
  endDay: (data: { shiftId: number; endLat: number; endLng: number }) => 
    axiosInstance.post("/visits/end-day", data),

  createVisit: (data: { personnelId: number; customerId: number; visitDate: string }) => 
    axiosInstance.post("/visits", data),
    
  getAdminVisits: (date: string, personnelId?: string) => 
    axiosInstance.get("/visits/admin", { params: { date, personnelId } }),
};