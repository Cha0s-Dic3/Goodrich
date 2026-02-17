import { useEffect, useMemo, useState } from 'react';
import { KeyRound, RefreshCw, ClipboardCopy, Send, Trash2 } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';

interface ResetEntry {
  id: string;
  userId?: string | null;
  email?: string;
  name?: string;
  token?: string | null;
  hasAccount?: boolean;
  createdAt: string;
  expiresAt: number;
  used: boolean;
  usedAt?: string;
  sentAt?: string;
}

export function PasswordResetsManagement() {
  const [resets, setResets] = useState<ResetEntry[]>([]);
  const [filter, setFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadResets = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/password-resets?limit=1000');
      const data = await res.json();
      setResets(data.resets || []);
    } catch (err) {
      setResets([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadResets();
  }, []);

  const now = Date.now();

  const filtered = useMemo(() => {
    const query = filter.trim().toLowerCase();
    if (!query) return resets;
    return resets.filter((entry) => {
      const email = (entry.email || '').toLowerCase();
      const name = (entry.name || '').toLowerCase();
      const token = entry.token ? String(entry.token) : '';
      return email.includes(query) || name.includes(query) || token.includes(query);
    });
  }, [filter, resets]);

  const summary = useMemo(() => {
    const total = resets.length;
    const used = resets.filter((entry) => entry.used).length;
    const expired = resets.filter((entry) => !entry.used && Number(entry.expiresAt) < now).length;
    const pending = total - used - expired;
    return { total, used, expired, pending };
  }, [resets, now]);

  const handleCopy = async (token: string) => {
    try {
      await navigator.clipboard.writeText(token);
      toast.success('Reset code copied.');
    } catch (err) {
      toast.error('Failed to copy reset code.');
    }
  };

  const markSent = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/password-resets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sentAt: true })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update');
      }
      setResets((prev) => prev.map((entry) => (entry.id === id ? data.reset : entry)));
      toast.success('Marked as sent.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to mark as sent');
    }
  };

  const deleteUsed = async (id: string) => {
    if (!confirm('Delete this used reset request?')) return;
    try {
      const res = await fetch(`/api/admin/password-resets/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete reset request');
      }
      setResets((prev) => prev.filter((entry) => entry.id !== id));
      toast.success('Reset request deleted.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete reset request');
    }
  };

  const renderStatus = (entry: ResetEntry) => {
    if (entry.used) {
      return <Badge className="bg-[#228B22] text-white">Used</Badge>;
    }
    if (entry.hasAccount === false || !entry.token) {
      return <Badge className="bg-[#6B5344] text-white">No Account</Badge>;
    }
    if (Number(entry.expiresAt) < now) {
      return <Badge className="bg-[#6B5344] text-white">Expired</Badge>;
    }
    if (entry.sentAt) {
      return <Badge className="bg-[#1E90FF] text-white">Sent</Badge>;
    }
    return <Badge className="bg-[#C41E3A] text-white">Pending</Badge>;
  };

  const formatDate = (value?: string | number) => {
    if (!value) return '—';
    const date = typeof value === 'number' ? new Date(value) : new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl text-[#3D2817]">Password Reset Requests</h2>
          <p className="text-sm text-[#6B5344]">Admin sends reset codes to users.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={loadResets}
            className="border-2 border-[#8B4513] text-[#8B4513] hover:bg-[#8B4513] hover:text-white"
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-white border-2 border-[#C41E3A]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B5344]">Pending</p>
              <div className="text-3xl text-[#3D2817]">{summary.pending}</div>
            </div>
            <KeyRound className="h-10 w-10 text-[#C41E3A]" />
          </div>
        </Card>

        <Card className="p-6 bg-white border-2 border-[#1E90FF]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B5344]">Total Requests</p>
              <div className="text-3xl text-[#3D2817]">{summary.total}</div>
            </div>
            <KeyRound className="h-10 w-10 text-[#1E90FF]" />
          </div>
        </Card>

        <Card className="p-6 bg-white border-2 border-[#228B22]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B5344]">Used</p>
              <div className="text-3xl text-[#3D2817]">{summary.used}</div>
            </div>
            <KeyRound className="h-10 w-10 text-[#228B22]" />
          </div>
        </Card>

        <Card className="p-6 bg-white border-2 border-[#6B5344]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B5344]">Expired</p>
              <div className="text-3xl text-[#3D2817]">{summary.expired}</div>
            </div>
            <KeyRound className="h-10 w-10 text-[#6B5344]" />
          </div>
        </Card>
      </div>

      <Card className="p-6 bg-white border-2 border-[#D2B48C]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
          <div className="text-sm text-[#6B5344]">{filtered.length} requests</div>
          <div className="w-full md:w-80">
            <Input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search by email, name, or code"
              className="border-[#D2B48C] focus:border-[#C41E3A]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 text-xs font-semibold text-[#6B5344] uppercase tracking-wide border-b border-[#D2B48C] pb-3">
          <div>Email</div>
          <div>Name</div>
          <div>Reset Code</div>
          <div>Status</div>
          <div>Requested</div>
          <div>Expires</div>
          <div>Actions</div>
        </div>

        <div className="divide-y divide-[#F0EAD6]">
          {filtered.map((entry) => (
            <div key={entry.id} className="grid grid-cols-1 md:grid-cols-7 gap-4 py-4 text-sm">
              <div className="text-[#3D2817] break-all">{entry.email || '—'}</div>
              <div className="text-[#6B5344]">{entry.name || '—'}</div>
              <div className="text-[#3D2817] font-semibold tracking-wide">{entry.token || '—'}</div>
              <div>{renderStatus(entry)}</div>
              <div className="text-[#6B5344]">{formatDate(entry.createdAt)}</div>
              <div className="text-[#6B5344]">{formatDate(entry.expiresAt)}</div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="border-[#8B4513] text-[#8B4513] hover:bg-[#8B4513] hover:text-white"
                  onClick={() => entry.token && handleCopy(entry.token)}
                  disabled={!entry.token}
                >
                  <ClipboardCopy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="border-[#1E90FF] text-[#1E90FF] hover:bg-[#1E90FF] hover:text-white"
                  onClick={() => markSent(entry.id)}
                  disabled={entry.used || Number(entry.expiresAt) < now || !entry.token}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Mark Sent
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="border-[#C41E3A] text-[#C41E3A] hover:bg-[#C41E3A] hover:text-white"
                  onClick={() => deleteUsed(entry.id)}
                  disabled={!entry.used}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="py-10 text-center text-[#6B5344]">
              No reset requests found.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
