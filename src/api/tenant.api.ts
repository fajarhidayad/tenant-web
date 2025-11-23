import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL || 'http://localhost:8000/api',
});

export interface Tenant {
  id: string;
  tenant_name: string;
  tenant_type: string;
  tenant_phone?: string;
  tenant_address?: string;
  booth_num?: string;
  area_sm?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTenantRequest {
  tenant_name: string;
  tenant_type: 'food_truck' | 'booth' | 'space_only';
  tenant_phone?: string;
  tenant_address?: string;
  booth_num?: string;
  area_sm?: string;
}

export interface CreateTenantResponse {
  data: Tenant;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface TenantResponse {
  data: Tenant[];
  pagination?: PaginationMeta;
}

export interface GetTenantsParams {
  page?: number;
  per_page?: number;
  search?: string;
}

export interface GetTenantsResponse {
  data: Tenant[];
  pagination?: PaginationMeta;
}

export const getTenants = async (
  params?: GetTenantsParams
): Promise<GetTenantsResponse> => {
  const response = await api.get<TenantResponse>('/tenants', { params });
  return {
    data: response.data.data,
    pagination: response.data.pagination,
  };
};

export const createTenant = async (
  data: CreateTenantRequest
): Promise<Tenant> => {
  const response = await api.post<CreateTenantResponse>('/tenants', data);
  return response.data.data;
};

export const deleteTenant = async (id: string): Promise<void> => {
  await api.delete(`/tenants/${id}`);
};
