import apiClient from './api-client';

export const adminService = {
  register: async (adminData: {
    firstName: string;
    lastName: string;
    email: string;
    birthDate: string;
    gender: string;
    password: string;
  }) => {
    const response = await apiClient.post('/admin/register', adminData);
    return response.data;
  },

  login: async (credentials: { email: string; password: string }) => {
    const response = await apiClient.post('/admin/login', credentials);
    if (response.data.data.access_token) {
      localStorage.setItem('access_token', response.data.data.access_token);
      localStorage.setItem('admin', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('admin');
  },

  getAll: async () => {
    const response = await apiClient.get('/admin');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get(`/admin/${id}`);
    return response.data;
  },
  update: async (id: number, updateData: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    birthDate: string;
    gender: string;
    password: string;
  }>) => {
    const response = await apiClient.patch(`/admin/${id}`, updateData);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await apiClient.delete(`/admin/${id}`);
    return response.data;
  },

  getCurrentAdmin: () => {
    const admin = localStorage.getItem('admin');
    return admin ? JSON.parse(admin) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  }
};

export const employeeService = {
  create: async (employeeData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    gender: string;
  }) => {
    const response = await apiClient.post('/employee', employeeData);
    return response.data;
  },

  getAll: async () => {
    const response = await apiClient.get('/employee');
    return response.data;
  },

  getAllWithLeaves: async () => {
    const response = await apiClient.get('/employee/with-leaves');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get(`/employee/${id}`);
    return response.data;
  },
  getByIdWithLeaves: async (id: number) => {
    const response = await apiClient.get(`/employee/${id}/leaves`);
    return response.data;
  },
  update: async (id: number, updateData: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    gender: string;
  }>) => {
    const response = await apiClient.patch(`/employee/${id}`, updateData);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await apiClient.delete(`/employee/${id}`);
    return response.data;
  }
};

export const leaveService = {
  create: async (leaveData: {
    reason: string;
    startDate: string;
    endDate: string;
    employeeId: number;
    status: string;
  }) => {
    const response = await apiClient.post('/leave', leaveData);
    return response.data;
  },
  getAll: async () => {
    const response = await apiClient.get('/leave');
    return response.data;
  },
  getByEmployee: async (employeeId: number) => {
    const response = await apiClient.get(`/leave?employeeId=${employeeId}`);
    return response.data;
  },
  getById: async (id: number) => {
    const response = await apiClient.get(`/leave/${id}`);
    return response.data;
  },
  update: async (id: number, updateData: Partial<{
    reason: string;
    startDate: string;
    endDate: string;
    employeeId: number;
  }>) => {
    const response = await apiClient.patch(`/leave/${id}`, updateData);
    return response.data;
  },
  updateStatus: async (id: number, status: 'PENDING' | 'APPROVED' | 'REJECTED') => {
    const response = await apiClient.patch(`/leave/${id}`, { status });
    return response.data;
  },
  delete: async (id: number) => {
    const response = await apiClient.delete(`/leave/${id}`);
    return response.data;
  }
};

export type Admin = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  gender: string;
  createdAt: string;
  updatedAt: string;
};

export type Employee = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  gender: string;
  createdAt: string;
  updatedAt: string;
  leaves?: Leave[];
};

export type Leave = {
  id: number;
  reason: string;
  startDate: string;
  endDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  employeeId: number;
  createdAt: string;
  updatedAt: string;
  employee?: Employee;
};
