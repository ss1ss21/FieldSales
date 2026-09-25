import axios from 'axios';

// 1. Temel Ayarlar: Bütün istekler bu adrese gidecek
const axiosInstance = axios.create({
  baseURL: 'http://localhost:5185/api',
});

axiosInstance.interceptors.request.use(
  (config) => {
    // LocalStorage'dan VIP bilekliği (Token) al
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      const role = localStorage.getItem('role');
      
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('fullname');
      
      if (role === 'Personnel') {
        window.location.href = '/personnel-login'; 
      } else {
        window.location.href = '/admin-login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;