import { useEffect, useMemo, useState } from 'react';
import { CreditCard, RefreshCcw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { toast } from 'sonner';

export function PaymentsManagement() {
  const { payments, loadPayments } = useApp();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isRetrying, setIsRetrying] = useState<string | null>(null);

  useEffect(() => {
    loadPayments('admin');
  }, []);

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return payments;
    return payments.filter((payment) => payment.status === statusFilter);
  }, [payments, statusFilter]);

  const statusColors: Record<string, string> = {
    pending: 'bg-[#FF8C00] text-white',
    successful: 'bg-[#228B22] text-white',
    failed: 'bg-[#C41E3A] text-white',
    retried: 'bg-[#6B5344] text-white'
  };

  const statusOptions = [
    { value: 'all', label: 'All Payments' },
    { value: 'pending', label: 'Pending' },
    { value: 'successful', label: 'Successful' },
    { value: 'failed', label: 'Failed' },
    { value: 'retried', label: 'Retried' }
  ];

  const handleAdminRetry = async (ref: string) => {
    if (isRetrying) return;
    setIsRetrying(ref);
    try {
      const res = await fetch(`/api/admin/payments/retry/${ref}`, { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Failed to retry payment');
      }
      toast.success(`Retry started. New ref: ${data.ref}`);
      await loadPayments('admin');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to retry payment');
    } finally {
      setIsRetrying(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl text-[#3D2817]">Payments</h2>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((option) => (
            <Button
              key={option.value}
              size="sm"
              variant={statusFilter === option.value ? 'default' : 'outline'}
              className={
                statusFilter === option.value
                  ? 'bg-[#C41E3A] hover:bg-[#FF6B6B] text-white'
                  : 'border-2 border-[#8B4513] text-[#8B4513] hover:bg-[#8B4513] hover:text-white'
              }
              onClick={() => setStatusFilter(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {filtered.length === 0 ? (
          <Card className="p-12 text-center bg-white border-2 border-[#D2B48C]">
            <CreditCard className="h-16 w-16 text-[#D2B48C] mx-auto mb-4" />
            <p className="text-xl text-[#6B5344]">No payments found</p>
          </Card>
        ) : (
          filtered.map((payment) => (
            <Card
              key={`${payment.id}-${payment.ref}`}
              className="p-6 bg-white border-2 border-[#D2B48C] hover:border-[#C41E3A] transition-colors"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-[#6B5344] mb-1">Reference</p>
                  <p className="font-semibold text-[#3D2817]">{payment.ref}</p>
                  {payment.orderId && (
                    <p className="text-xs text-[#6B5344]">Order: {payment.orderId}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-[#6B5344] mb-1">Amount</p>
                  <p className="font-semibold text-[#3D2817]">
                    {payment.amount?.toLocaleString?.() || payment.amount} FRW
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#6B5344] mb-1">Created</p>
                  <p className="text-[#3D2817]">
                    {payment.createdAt ? new Date(payment.createdAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <Badge className={statusColors[payment.status] || 'bg-gray-200 text-[#3D2817]'}>
                    {payment.status}
                  </Badge>
                  <div className="flex items-center gap-2">
                    {payment.retriedFrom && (
                      <span className="text-xs text-[#6B5344] flex items-center gap-1">
                        <RefreshCcw className="h-3 w-3" />
                        Retried
                      </span>
                    )}
                    {payment.status === 'failed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-[#C41E3A] text-[#C41E3A] hover:bg-[#C41E3A] hover:text-white"
                        onClick={() => handleAdminRetry(payment.ref)}
                        disabled={isRetrying === payment.ref}
                      >
                        Retry
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              {payment.failureReason && (
                <div className="mt-3 text-sm text-[#C41E3A]">
                  Failure: {payment.failureReason}
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
