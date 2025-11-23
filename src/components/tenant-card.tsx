import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import type { Tenant } from '@/api/tenant.api';
import { Avatar } from './ui/avatar';
import { AvatarFallback } from './ui/avatar';
import {
  CalendarIcon,
  HashIcon,
  MapPinIcon,
  PhoneIcon,
  SquareIcon,
  StoreIcon,
  TrashIcon,
  Loader2,
} from 'lucide-react';
import { Button } from './ui/button';
import { CardFooter } from './ui/card';
import { useTenant } from '@/hooks/useTenant';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';

const formatTenantType = (type: string) => {
  return type.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};

const getTenantTypeIcon = (type: string) => {
  return type === 'food_truck'
    ? StoreIcon
    : type === 'booth'
      ? HashIcon
      : SquareIcon;
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};
export default function TenantCard({ tenant }: { tenant: Tenant }) {
  const { deleteMutation } = useTenant();
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = () => {
    deleteMutation.mutate(tenant.id, {
      onSuccess: () => {
        setIsOpen(false);
      },
    });
  };

  return (
    <Card key={tenant.id} className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar className="h-12 w-12 shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {tenant.tenant_name
                  .split(' ')
                  .map((word) => word[0])
                  .join('')
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">
                {tenant.tenant_name}
              </CardTitle>
              <CardDescription className="flex items-center gap-1 mt-1">
                {(() => {
                  const IconComponent = getTenantTypeIcon(tenant.tenant_type);
                  return <IconComponent className="h-3 w-3" />;
                })()}
                <span className="truncate">
                  {formatTenantType(tenant.tenant_type)}
                </span>
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <PhoneIcon className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground truncate">
              {tenant.tenant_phone || '-'}
            </span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <MapPinIcon className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <span className="text-muted-foreground line-clamp-2">
              {tenant.tenant_address || '-'}
            </span>
          </div>
          {/* Show booth_num only for booth type */}
          {tenant.tenant_type === 'booth' && tenant.booth_num && (
            <div className="flex items-center gap-2 text-sm">
              <HashIcon className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">
                Nomor Booth: {tenant.booth_num}
              </span>
            </div>
          )}

          {/* Show area_sm only for space_only type */}
          {tenant.tenant_type === 'space_only' && tenant.area_sm && (
            <div className="flex items-center gap-2 text-sm">
              <SquareIcon className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">
                Luas Area: {tenant.area_sm} m²
              </span>
            </div>
          )}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarIcon className="h-4 w-4" />
              <span>{formatDate(tenant.created_at)}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <TrashIcon className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Apakah anda yakin?</AlertDialogTitle>
              <AlertDialogDescription>
                Tindakan ini tidak dapat dibatalkan. Ini akan menghapus tenant{' '}
                <span className="font-medium text-foreground">
                  {tenant.tenant_name}
                </span>{' '}
                secara permanen dari server.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteMutation.isPending}>
                Batal
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  handleDelete();
                }}
                disabled={deleteMutation.isPending}
                className="bg-destructive hover:bg-destructive/90 text-white"
              >
                {deleteMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {deleteMutation.isPending ? 'Menghapus...' : 'Hapus'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
