import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

let isRefreshing = false;
let refreshQueue = [];

const processRefreshQueue = (newToken) => {
  refreshQueue.forEach((callback) => callback(newToken));
  refreshQueue = [];
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config || {};
    const isAuthRoute = originalRequest.url?.includes("/auth/");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthRoute
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push((newToken) => {
            if (!newToken) {
              reject(error);
              return;
            }
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;

      return authAPI
        .refresh()
        .then((response) => {
          const { token } = response.data;
          localStorage.setItem("token", token);
          processRefreshQueue(token);
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((refreshError) => {
          processRefreshQueue(null);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
          return Promise.reject(refreshError);
        })
        .finally(() => {
          isRefreshing = false;
        });
    }

    if (error.response?.status === 401 && isAuthRoute) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

export const authAPI = {
  login: (email, password) => {
    const credentials = btoa(`${email}:${password}`);
    return api.post(
      "/auth/login",
      {},
      {
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      },
    );
  },
  signup: (data) => api.post("/auth/signup", data),
  logout: () => api.post("/auth/logout"),
  refresh: () => api.post("/auth/refresh"),
};

export const defectsAPI = {
  getAll: () => api.get("/defects"),
  getById: (id) => api.get(`/defects/${id}`),
  create: (data) => api.post("/defects", data),
  update: (id, data) => api.put(`/defects/${id}`, data),
  delete: (id) => api.delete(`/defects/${id}`),
  review: (id, data) => api.patch(`/defects/${id}/review`, data),
  assign: (id, data) => api.patch(`/defects/${id}/assign`, data),
  markOngoing: (id, data) => api.patch(`/defects/${id}/ongoing`, data),
  markDone: (id, data) => api.patch(`/defects/${id}/done`, data),
  markComplete: (id, data) => api.patch(`/defects/${id}/complete`, data),
  reopen: (id) => api.patch(`/defects/${id}/reopen`),
  getComments: (id) => api.get(`/defects/${id}/comments`),
  updateComments: (id, data) => api.patch(`/defects/${id}/comments`, data),
};

export const buildingsAPI = {
  getAll: () => api.get("/buildings"),
  getById: (id) => api.get(`/buildings/${id}`),
  create: (data) => api.post("/buildings", data),
  update: (id, data) => api.put(`/buildings/${id}`, data),
  delete: (id) => api.delete(`/buildings/${id}`),
};

export const usersAPI = {
  getAll: () => api.get("/users"),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post("/users", data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getTechnicians: () => api.get("/users/technicians"),
};

export const analyticsAPI = {
  getDefectsPerBuilding: () => api.get("/analytics/defects-per-building"),
  getDefectsStatus: () => api.get("/analytics/defects-status"),
};

export default api;
