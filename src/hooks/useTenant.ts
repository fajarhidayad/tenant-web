import {
  createTenant,
  deleteTenant,
  getTenants,
  type CreateTenantRequest,
  type GetTenantsParams,
} from '@/api/tenant.api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const tenantKey = ['tenants'];

// hook untuk mengambil data & operasi CRUD tenant
export function useTenant(params?: GetTenantsParams) {
  const queryClient = useQueryClient();

  // normalisasi params
  const normalizedParams = params
    ? {
        page: params.page ?? 1,
        per_page: params.per_page ?? 10,
        search: params.search ?? '',
      }
    : undefined;

  const query = useQuery({
    queryKey: normalizedParams ? [...tenantKey, normalizedParams] : tenantKey,
    queryFn: () => getTenants(normalizedParams),
    staleTime: 1000 * 60 * 5, // waktu kadaluarsa 5 menit
    refetchOnWindowFocus: false,
    refetchOnMount: true, // refresh data ketika component mount
    refetchOnReconnect: false,
    refetchInterval: 1000 * 60 * 5, // refresh data setiap 5 menit
    refetchIntervalInBackground: false,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateTenantRequest) => createTenant(data),
    onSuccess: () => {
      // invalidasi semua query yang dimulai dengan ['tenants']
      // menggunakan 'all' untuk memastikan query refresh bahkan jika component belum mounted
      queryClient.invalidateQueries({
        queryKey: tenantKey,
        exact: false,
        refetchType: 'all',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTenant(id),
    onSuccess: () => {
      // invalidasi semua query yang dimulai dengan ['tenants']
      // menggunakan 'all' untuk memastikan query refresh bahkan jika component belum mounted
      queryClient.invalidateQueries({
        queryKey: tenantKey,
        exact: false,
        refetchType: 'all',
      });
    },
  });

  return {
    query,
    createMutation,
    deleteMutation,
  };
}
