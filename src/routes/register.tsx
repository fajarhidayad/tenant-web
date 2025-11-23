import { type CreateTenantRequest } from '@/api/tenant.api';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useTenant } from '@/hooks/useTenant';
import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

// schema untuk validasi form tambah tenant
const createTenantSchema = z
  .object({
    tenant_name: z.string().min(1, 'Nama tenant wajib diisi'),
    tenant_type: z.enum(['food_truck', 'booth', 'space_only'], {
      message: 'Tipe tenant wajib dipilih',
    }),
    tenant_phone: z.string().optional(),
    tenant_address: z.string().optional(),
    booth_num: z.string().optional(),
    area_sm: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.tenant_type === 'booth') {
        return data.booth_num && data.booth_num.trim().length > 0;
      }
      return true;
    },
    {
      message: 'Nomor booth wajib diisi untuk tipe booth',
      path: ['booth_num'],
    }
  )
  .refine(
    (data) => {
      if (data.tenant_type === 'space_only') {
        return data.area_sm && data.area_sm.trim().length > 0;
      }
      return true;
    },
    {
      message: 'Luas area wajib diisi untuk tipe space only',
      path: ['area_sm'],
    }
  )
  .refine(
    (data) => {
      if (data.tenant_type === 'space_only' && data.area_sm) {
        const num = Number(data.area_sm);
        return !isNaN(num) && num > 0;
      }
      return true;
    },
    {
      message: 'Luas area harus berupa angka yang valid dan lebih dari 0',
      path: ['area_sm'],
    }
  );

type TenantFormValues = z.infer<typeof createTenantSchema>;

export const Route = createFileRoute('/register')({
  component: RegisterTenant,
});

function RegisterTenant() {
  const navigate = useNavigate();
  const { createMutation } = useTenant();

  const form = useForm<TenantFormValues>({
    resolver: zodResolver(createTenantSchema),
    defaultValues: {
      tenant_name: '',
      tenant_phone: '',
      tenant_address: '',
      booth_num: '',
      area_sm: '',
    },
  });

  const tenantType = form.watch('tenant_type');

  const onSubmit = (values: TenantFormValues) => {
    const submitData: CreateTenantRequest = {
      tenant_name: values.tenant_name,
      tenant_type: values.tenant_type,
      tenant_phone: values.tenant_phone || undefined,
      tenant_address: values.tenant_address || undefined,
    };

    if (values.tenant_type === 'booth' && values.booth_num) {
      submitData.booth_num = values.booth_num;
    }

    if (values.tenant_type === 'space_only' && values.area_sm) {
      submitData.area_sm = values.area_sm;
    }

    createMutation.mutate(submitData, {
      onSuccess: () => {
        navigate({ to: '/' });
      },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate({ to: '/' })}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
          <h1 className="text-4xl font-bold tracking-tight">
            Tambah Tenant Baru
          </h1>
          <p className="text-muted-foreground mt-2">
            Isi formulir di bawah untuk menambahkan tenant baru ke sistem
          </p>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Tenant</CardTitle>
            <CardDescription>
              Lengkapi semua informasi yang diperlukan untuk tenant baru
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Tenant Name */}
                <FormField
                  control={form.control}
                  name="tenant_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Tenant *</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan nama tenant" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Tenant Type */}
                <FormField
                  control={form.control}
                  name="tenant_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipe Tenant *</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Clear conditional fields when type changes
                          if (value !== 'booth') {
                            form.setValue('booth_num', '');
                          }
                          if (value !== 'space_only') {
                            form.setValue('area_sm', '');
                          }
                        }}
                        value={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pilih tipe tenant" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="food_truck">Food Truck</SelectItem>
                          <SelectItem value="booth">Booth</SelectItem>
                          <SelectItem value="space_only">Space Only</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Booth Number - Only for booth type */}
                {tenantType === 'booth' && (
                  <FormField
                    control={form.control}
                    name="booth_num"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nomor Booth *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Masukkan nomor booth"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Nomor booth wajib diisi untuk tipe booth
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Area - Only for space_only type */}
                {tenantType === 'space_only' && (
                  <FormField
                    control={form.control}
                    name="area_sm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Luas Area (m²) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Masukkan luas area dalam meter persegi"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Luas area dalam meter persegi wajib diisi untuk tipe
                          space only
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Phone */}
                <FormField
                  control={form.control}
                  name="tenant_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor Telepon</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Masukkan nomor telepon (opsional)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Address */}
                <FormField
                  control={form.control}
                  name="tenant_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alamat</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Masukkan alamat (opsional)"
                          className="min-h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate({ to: '/' })}
                    className="flex-1"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="flex-1"
                  >
                    {createMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {createMutation.isPending
                      ? 'Menyimpan...'
                      : 'Simpan Tenant'}
                  </Button>
                </div>

                {/* Error Message */}
                {createMutation.isError && (
                  <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
                    {createMutation.error instanceof Error
                      ? createMutation.error.message
                      : 'Terjadi kesalahan saat menyimpan tenant. Silakan coba lagi.'}
                  </div>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
