import { useEffect, useMemo, useState } from 'react';
import { CreditCard, RefreshCcw, CheckCircle, XCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';

export function PaymentsManagement() {
  const { payments, loadPayments, adminToken } = useApp();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);

  useEffect(() => {
    loadPayments('admin');
  }, [adminToken]);

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return payments;
    return payments.filter((payment) => payment.status === statusFilter);
  }, [payments, statusFilter]);

  const statusColors: Record<string, string> = {
    pending: 'bg-[#FF8C00] text-white',
    successful: 'bg-[#228B22] text-white',
    failed: 'bg-[#C41E3A] text-white',
    retried: 'bg-[#6B5344] text-white',
    'pending-approval': 'bg-[#FF8C00] text-white',
    approved: 'bg-[#228B22] text-white',
    cancelled: 'bg-[#C41E3A] text-white'
  };

  const statusOptions = [
    { value: 'all', label: 'All Payments' },
    { value: 'pending', label: 'Pending' },
    { value: 'pending-approval', label: 'Pending Approval' },
    { value: 'approved', label: 'Approved' },
    { value: 'successful', label: 'Successful' },
    { value: 'failed', label: 'Failed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'retried', label: 'Retried' }
  ];

  
  const handleApprove = async (id: string) => {
    if (isUpdating) return;
    setIsUpdating(id);
    try {
      const res = await fetch(`/api/admin/payments/approve/${id}`, {
        method: 'POST',
        headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : undefined
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Failed to approve payment');
      }
      toast.success('Payment approved and order created.');
      await loadPayments('admin');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to approve payment');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleCancel = async (id: string, reason: string) => {
    if (isUpdating) return;
    setIsUpdating(id);
    try {
      const res = await fetch(`/api/admin/payments/cancel/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}) },
        body: JSON.stringify({ reason: reason || 'Payment not received' })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Failed to cancel payment');
      }
      toast.success('Payment marked as cancelled.');
      await loadPayments('admin');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to cancel payment');
    } finally {
      setIsUpdating(null);
    }
  };

  const openCancelDialog = (id: string) => {
    setCancelTargetId(id);
    setCancelReason('');
    setCancelDialogOpen(true);
  };

  const closeCancelDialog = () => {
    setCancelDialogOpen(false);
    setCancelReason('');
    setCancelTargetId(null);
  };

  const confirmCancel = async () => {
    if (!cancelTargetId) return;
    const reason = cancelReason.trim();
    if (!reason) {
      toast.error('Please enter a cancel reason.');
      return;
    }
    await handleCancel(cancelTargetId, reason);
    closeCancelDialog();
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
                  {payment.method && (
                    <p className="text-xs text-[#6B5344]">Method: {payment.method}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-[#6B5344] mb-1">Amount</p>
                  <p className="font-semibold text-[#3D2817]">
                    {payment.amount?.toLocaleString?.() || payment.amount} FRW
                  </p>
                  {payment.receiverPhone && (
                    <p className="text-xs text-[#6B5344]">Receiver: {payment.receiverPhone}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-[#6B5344] mb-1">Created</p>
                  <p className="text-[#3D2817]">
                    {payment.createdAt ? new Date(payment.createdAt).toLocaleString() : 'N/A'}
                  </p>
                  {payment.expiresAt && (
                    <p className="text-xs text-[#6B5344]">
                      Expires: {new Date(payment.expiresAt).toLocaleTimeString()}
                    </p>
                  )}
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
                    {payment.status === 'pending-approval' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-[#228B22] text-[#228B22] hover:bg-[#228B22] hover:text-white"
                          onClick={() => handleApprove(payment.id)}
                          disabled={isUpdating === payment.id}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-[#C41E3A] text-[#C41E3A] hover:bg-[#C41E3A] hover:text-white"
                          onClick={() => openCancelDialog(payment.id)}
                          disabled={isUpdating === payment.id}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </>
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

      <Dialog open={cancelDialogOpen} onOpenChange={(open) => (open ? setCancelDialogOpen(true) : closeCancelDialog())}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-[#3D2817]">Cancel Payment Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-[#6B5344]">Add a reason that will be shown to the customer.</p>
            <Textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Payment not received within 30 minutes"
              className="border-[#D2B48C] focus:border-[#C41E3A]"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-[#D2B48C] text-[#3D2817] hover:bg-[#F0EAD6]"
              onClick={closeCancelDialog}
            >
              Back
            </Button>
            <Button
              className="bg-[#C41E3A] hover:bg-[#FF6B6B] text-white"
              onClick={confirmCancel}
              disabled={!cancelTargetId || isUpdating === cancelTargetId || !cancelReason.trim()}
            >
              Confirm Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


