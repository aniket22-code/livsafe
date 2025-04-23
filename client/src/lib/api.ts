import { apiRequest } from './queryClient';

export const authAPI = {
  login: async (email: string, password: string) => {
    return await apiRequest('POST', '/api/auth/login', { email, password });
  },
  
  logout: async () => {
    return await apiRequest('POST', '/api/auth/logout', {});
  },
  
  signupDoctor: async (data: any) => {
    return await apiRequest('POST', '/api/signup/doctor', data);
  },
  
  signupOrganization: async (data: any) => {
    return await apiRequest('POST', '/api/signup/organization', data);
  },
};

export const doctorAPI = {
  getDashboard: async () => {
    return await apiRequest('GET', '/api/doctor/dashboard', undefined);
  },
  
  getRecords: async () => {
    return await apiRequest('GET', '/api/records', undefined);
  },
  
  getRecord: async (id: string) => {
    return await apiRequest('GET', `/api/records/${id}`, undefined);
  },
  
  createRecord: async (formData: FormData) => {
    // For FormData, we use fetch directly instead of apiRequest
    const res = await fetch('/api/grade', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    
    if (!res.ok) {
      const text = (await res.text()) || res.statusText;
      throw new Error(`${res.status}: ${text}`);
    }
    
    return res;
  },
};

export const organizationAPI = {
  getDashboard: async () => {
    return await apiRequest('GET', '/api/organization/dashboard', undefined);
  },
  
  getDoctors: async () => {
    return await apiRequest('GET', '/api/organization/doctors', undefined);
  },
  
  addDoctor: async (doctorData: any) => {
    return await apiRequest('POST', '/api/organization/doctors', doctorData);
  },
  
  removeDoctor: async (doctorId: string) => {
    return await apiRequest('DELETE', `/api/organization/doctors/${doctorId}`, {});
  },
};
