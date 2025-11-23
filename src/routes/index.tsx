import SearchBar from '@/components/search-bar';
import TenantCard from '@/components/tenant-card';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';
import { useDebounce } from '@/hooks/use-debounce';
import { useTenant } from '@/hooks/useTenant';
import {
  createFileRoute,
  Link,
  useNavigate,
  useSearch,
} from '@tanstack/react-router';
import {
  AlertCircle,
  Building2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { z } from 'zod';

// schema untuk validasi search params
const searchSchema = z.object({
  page: z.string().optional().default('1'),
  search: z.string().optional().default(''),
});

export const Route = createFileRoute('/')({
  validateSearch: searchSchema,
  component: TenantList,
});

function TenantList() {
  const navigate = useNavigate({ from: '/' });
  const searchParams = useSearch({ from: '/' });

  const urlSearch = searchParams.search || '';
  const urlPage = searchParams.page
    ? (() => {
        const num = parseInt(searchParams.page, 10);
        return isNaN(num) || num < 1 ? 1 : num;
      })()
    : 1;

  const [search, setSearch] = useState(urlSearch);
  const debouncedSearch = useDebounce(search, 500);

  // sinkronisasi state search dengan URL search params
  useEffect(() => {
    if (urlSearch !== search) {
      setSearch(urlSearch);
    }
  }, [urlSearch]);

  // Update URL ketika debounced search berubah
  useEffect(() => {
    if (debouncedSearch !== urlSearch) {
      navigate({
        search: {
          search: debouncedSearch || undefined,
          page: '1', // Reset ke halaman 1 ketika search berubah (sebagai string)
        },
        replace: true, // Ganti history daripada menambahkan
      });
    }
  }, [debouncedSearch, navigate, urlSearch]);

  const {
    query: { data: tenantsResponse, isLoading, isError, error },
  } = useTenant({
    page: urlPage,
    search: debouncedSearch,
    per_page: 9,
  });

  const tenants = tenantsResponse?.data;
  const meta = tenantsResponse?.pagination;

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const handlePreviousPage = () => {
    if (urlPage > 1) {
      navigate({
        search: {
          search: urlSearch || undefined,
          page: String(urlPage - 1),
        },
      });
    }
  };

  const handleNextPage = () => {
    if (meta && urlPage < meta.last_page) {
      navigate({
        search: {
          search: urlSearch || undefined,
          page: String(urlPage + 1),
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Tenants</h1>
              <p className="text-muted-foreground mt-2">
                Daftar tenant yang tersedia di sistem
              </p>
            </div>
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Tambah Tenant Baru
              </Button>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="w-full max-w-md">
            <SearchBar
              value={search}
              onChange={handleSearchChange}
              isLoading={isLoading && debouncedSearch.length > 0}
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && <LoadingState />}

        {/* Error State */}
        {isError && <ErrorState error={error} />}

        {/* Tenants Grid */}
        {!isLoading && !isError && tenants && tenants.length > 0 && (
          <>
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {tenants.map((tenant) => (
                <TenantCard key={tenant.id} tenant={tenant} />
              ))}
            </section>

            {/* Pagination Controls */}
            {meta && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-4">
                {/* Info Text - Hidden on mobile, shown on tablet+ */}
                <p className="hidden sm:block text-sm text-muted-foreground">
                  Menampilkan {meta.per_page * (meta.current_page - 1) + 1}-
                  {Math.min(meta.per_page * meta.current_page, meta.total)} dari{' '}
                  {meta.total} tenant
                </p>

                {/* Mobile: Compact info */}
                <p className="sm:hidden text-xs text-muted-foreground text-center">
                  {meta.per_page * (meta.current_page - 1) + 1}-
                  {Math.min(meta.per_page * meta.current_page, meta.total)} dari{' '}
                  {meta.total}
                </p>

                {/* Pagination Controls */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={urlPage === 1}
                    className="flex-1 sm:flex-initial"
                  >
                    <ChevronLeft className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Sebelumnya</span>
                  </Button>

                  {/* Page Info - Hidden on mobile, shown on tablet+ */}
                  <div className="hidden md:flex items-center gap-1 text-sm font-medium px-2">
                    <span>Halaman</span>
                    <span className="text-primary">{meta.current_page}</span>
                    <span>dari</span>
                    <span>{meta.last_page}</span>
                  </div>

                  {/* Mobile: Compact page info */}
                  <div className="md:hidden text-xs font-medium px-2">
                    {meta.current_page}/{meta.last_page}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={urlPage === meta.last_page}
                    className="flex-1 sm:flex-initial"
                  >
                    <span className="hidden sm:inline">Selanjutnya</span>
                    <ChevronRight className="h-4 w-4 sm:ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!isLoading && !isError && tenants && tenants.length === 0 && (
          <EmptyState hasSearch={search.length > 0} />
        )}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <Card className="py-16">
      <CardContent className="flex flex-col items-center justify-center text-center">
        <Loader2 className="h-12 w-12 text-muted-foreground mb-4 animate-spin" />
        <CardTitle className="mb-2">Loading tenants...</CardTitle>
        <CardDescription>
          Please wait while we fetch the tenant data.
        </CardDescription>
      </CardContent>
    </Card>
  );
}

function EmptyState({ hasSearch }: { hasSearch?: boolean }) {
  return (
    <Card className="py-16">
      <CardContent className="flex flex-col items-center justify-center text-center">
        <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
        <CardTitle className="mb-2">
          {hasSearch ? 'Tidak ada tenant ditemukan' : 'Belum ada tenant'}
        </CardTitle>
        <CardDescription className="mb-6 max-w-md">
          {hasSearch
            ? 'Coba ubah kata kunci pencarian anda.'
            : 'Mulai dengan menambahkan akun tenant pertama anda ke sistem.'}
        </CardDescription>
        {!hasSearch && (
          <Link to="/register">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Tenant Baru
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

function ErrorState({ error }: { error: Error }) {
  return (
    <Card className="py-16 border-destructive/50">
      <CardContent className="flex flex-col items-center justify-center text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <CardTitle className="mb-2">Error loading tenants</CardTitle>
        <CardDescription className="mb-6 max-w-md">
          {error instanceof Error
            ? error.message
            : 'An unexpected error occurred while loading tenants.'}
        </CardDescription>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </CardContent>
    </Card>
  );
}
