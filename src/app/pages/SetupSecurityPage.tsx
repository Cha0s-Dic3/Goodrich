import { useEffect, useMemo, useState } from 'react';
import { Shield, Lock, Unlock, UserPlus, Trash2, KeyRound } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';

interface AdminRow {
  id: string;
  name: string;
  email: string;
  username: string;
  role: 'super_admin' | 'admin';
  active: boolean;
  createdAt?: string;
  lastLoginAt?: string;
}

interface SecurityState {
  lockdown: boolean;
  lockdownReason?: string;
  updatedAt?: string;
  updatedBy?: string;
}

interface AuditLogEntry {
  id: string;
  actorId?: string;
  actorRole?: string;
  action: string;
  target?: string;
  createdAt: string;
}

interface LoginAttemptEntry {
  id: string;
  actorType: string;
  usernameOrEmail: string;
  ip: string;
  device?: string;
  os?: string;
  browser?: string;
  status: string;
  createdAt: string;
}

interface SessionEntry {
  id: string;
  type: string;
  actorId: string;
  role: string;
  ip: string;
  device?: string;
  os?: string;
  browser?: string;
  createdAt: string;
  lastSeenAt?: string;
  active?: boolean;
}

interface BlockedIpEntry {
  id: string;
  ip: string;
  reason?: string;
}

interface BlockedDeviceEntry {
  id: string;
  userAgent: string;
  reason?: string;
}

export function SetupSecurityPage() {
  const { isAdmin, isSuperAdmin, adminLogin, adminLoginError, adminToken } = useApp();
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [security, setSecurity] = useState<SecurityState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', username: '', password: '', role: 'admin' });
  const [lockReason, setLockReason] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showNewAdminPassword, setShowNewAdminPassword] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loginAttempts, setLoginAttempts] = useState<LoginAttemptEntry[]>([]);
  const [sessions, setSessions] = useState<SessionEntry[]>([]);
  const [blockedIps, setBlockedIps] = useState<BlockedIpEntry[]>([]);
  const [blockedDevices, setBlockedDevices] = useState<BlockedDeviceEntry[]>([]);
  const [ipToBlock, setIpToBlock] = useState('');
  const [deviceToBlock, setDeviceToBlock] = useState('');

  const authHeaders = useMemo(
    () => (adminToken ? { Authorization: `Bearer ${adminToken}` } : undefined),
    [adminToken]
  );

  const loadAdmins = async () => {
    try {
      const res = await fetch('/api/super-admin/admins', { headers: authHeaders });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load admins');
      setAdmins(data.admins || []);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load admins');
    }
  };

  const loadSecurity = async () => {
    try {
      const res = await fetch('/api/super-admin/security', { headers: authHeaders });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load security state');
      setSecurity(data.security || null);
      setLockReason(data.security?.lockdownReason || '');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load security state');
    }
  };

  const loadLogs = async () => {
    try {
      const [logsRes, attemptsRes, sessionsRes] = await Promise.all([
        fetch('/api/super-admin/security/logs?limit=200', { headers: authHeaders }),
        fetch('/api/super-admin/security/login-attempts?limit=200', { headers: authHeaders }),
        fetch('/api/super-admin/security/sessions', { headers: authHeaders })
      ]);
      const logsData = await logsRes.json();
      const attemptsData = await attemptsRes.json();
      const sessionsData = await sessionsRes.json();
      if (logsRes.ok) setAuditLogs(logsData.logs || []);
      if (attemptsRes.ok) setLoginAttempts(attemptsData.attempts || []);
      if (sessionsRes.ok) setSessions(sessionsData.sessions || []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (!isAdmin || !isSuperAdmin) return;
    loadAdmins();
    loadSecurity();
    loadLogs();
  }, [isAdmin, isSuperAdmin, adminToken]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await adminLogin(loginData.username, loginData.password);
    if (!ok) {
      toast.error(adminLoginError || 'Invalid admin credentials');
    }
  };

  const handleCreateAdmin = async () => {
    if (!newAdmin.name || !newAdmin.email || !newAdmin.username || !newAdmin.password) {
      toast.error('Name, email, username, and password are required.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/super-admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(authHeaders || {}) },
        body: JSON.stringify(newAdmin)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create admin');
      setAdmins((prev) => [data.admin, ...prev]);
      setNewAdmin({ name: '', email: '', username: '', password: '', role: 'admin' });
      toast.success('Admin created.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create admin');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAdminActive = async (admin: AdminRow) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/super-admin/admins/${admin.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(authHeaders || {}) },
        body: JSON.stringify({ active: !admin.active })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update admin');
      setAdmins((prev) => prev.map((entry) => (entry.id === admin.id ? data.admin : entry)));
      toast.success(admin.active ? 'Admin disabled.' : 'Admin enabled.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update admin');
    } finally {
      setIsLoading(false);
    }
  };

  const resetAdminPassword = async (admin: AdminRow) => {
    const password = prompt(`Set a new password for ${admin.username}`);
    if (!password) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/super-admin/admins/${admin.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(authHeaders || {}) },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');
      setAdmins((prev) => prev.map((entry) => (entry.id === admin.id ? data.admin : entry)));
      toast.success('Password updated.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAdmin = async (admin: AdminRow) => {
    if (!confirm(`Delete admin ${admin.username}?`)) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/super-admin/admins/${admin.id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to delete admin');
      setAdmins((prev) => prev.filter((entry) => entry.id !== admin.id));
      toast.success('Admin deleted.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete admin');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLockdown = async () => {
    if (!security) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/super-admin/security/lockdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(authHeaders || {}) },
        body: JSON.stringify({ enabled: !security.lockdown, reason: lockReason })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update lockdown');
      setSecurity(data.security);
      toast.success(data.security.lockdown ? 'Lockdown enabled.' : 'Lockdown disabled.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update lockdown');
    } finally {
      setIsLoading(false);
    }
  };

  const terminateSession = async (id: string) => {
    try {
      const res = await fetch(`/api/super-admin/security/sessions/${id}/terminate`, {
        method: 'POST',
        headers: authHeaders
      });
      if (!res.ok) throw new Error('Failed to terminate session');
      setSessions((prev) => prev.filter((session) => session.id !== id));
      toast.success('Session terminated.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to terminate session');
    }
  };

  const blockIp = async () => {
    const ip = ipToBlock.trim();
    if (!ip) return;
    try {
      const res = await fetch('/api/super-admin/security/block-ip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(authHeaders || {}) },
        body: JSON.stringify({ ip })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to block IP');
      setBlockedIps(data.blockedIps || []);
      setIpToBlock('');
      toast.success('IP blocked.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to block IP');
    }
  };

  const unblockIp = async (ip: string) => {
    try {
      const res = await fetch('/api/super-admin/security/unblock-ip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(authHeaders || {}) },
        body: JSON.stringify({ ip })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to unblock IP');
      setBlockedIps(data.blockedIps || []);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to unblock IP');
    }
  };

  const blockDevice = async () => {
    const userAgent = deviceToBlock.trim();
    if (!userAgent) return;
    try {
      const res = await fetch('/api/super-admin/security/block-device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(authHeaders || {}) },
        body: JSON.stringify({ userAgent })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to block device');
      setBlockedDevices(data.blockedDevices || []);
      setDeviceToBlock('');
      toast.success('Device blocked.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to block device');
    }
  };

  const unblockDevice = async (userAgent: string) => {
    try {
      const res = await fetch('/api/super-admin/security/unblock-device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(authHeaders || {}) },
        body: JSON.stringify({ userAgent })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to unblock device');
      setBlockedDevices(data.blockedDevices || []);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to unblock device');
    }
  };

  if (!isAdmin || !isSuperAdmin) {
    return (
      <div className="min-h-screen bg-[#FFFDD0] flex items-center justify-center py-20">
        <Card className="p-10 max-w-md w-full bg-white border-2 border-[#D2B48C]">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-[#8B4513] rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-10 w-10 text-[#FFFDD0]" />
            </div>
            <h2 className="text-2xl mb-1 text-[#3D2817]">Super Admin Login</h2>
            <p className="text-[#6B5344]">Access system-level security controls</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block mb-2 text-[#3D2817]">Username</label>
              <Input
                type="text"
                required
                value={loginData.username}
                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
              />
            </div>
            <div>
              <label className="block mb-2 text-[#3D2817]">Password</label>
              <Input
                type={showLoginPassword ? 'text' : 'password'}
                required
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              />
              <label className="mt-2 flex items-center gap-2 text-xs text-[#6B5344]">
                <input
                  type="checkbox"
                  checked={showLoginPassword}
                  onChange={(e) => setShowLoginPassword(e.target.checked)}
                />
                Show password
              </label>
            </div>
            <Button type="submit" className="w-full bg-[#C41E3A] hover:bg-[#FF6B6B] text-white" size="lg">
              Login
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDD0]">
      <div className="bg-[#1F3A3A] text-[#FFFDD0] py-6 border-b-4 border-[#FFD700]">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl">Super Admin Security</h1>
          <p className="text-[#FAF3E0]">System control, lockdown, and admin governance</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        <Card className="p-6 bg-white border-2 border-[#D2B48C]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {security?.lockdown ? <Lock className="h-6 w-6 text-[#C41E3A]" /> : <Unlock className="h-6 w-6 text-[#228B22]" />}
              <h2 className="text-2xl text-[#3D2817]">System Lockdown</h2>
            </div>
            <Badge className={security?.lockdown ? 'bg-[#C41E3A] text-white' : 'bg-[#228B22] text-white'}>
              {security?.lockdown ? 'Active' : 'Normal'}
            </Badge>
          </div>
          <p className="text-sm text-[#6B5344] mb-4">
            Lockdown blocks user logins and registrations. Super Admin access remains available.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block mb-2 text-[#3D2817]">Reason / Notes</label>
              <Input
                value={lockReason}
                onChange={(e) => setLockReason(e.target.value)}
                placeholder="Reason for lockdown"
              />
            </div>
            <Button
              onClick={toggleLockdown}
              disabled={isLoading}
              className={security?.lockdown ? 'bg-[#8B4513] hover:bg-[#6B5344] text-white' : 'bg-[#C41E3A] hover:bg-[#FF6B6B] text-white'}
            >
              {security?.lockdown ? 'Disable Lockdown' : 'Enable Lockdown'}
            </Button>
          </div>
        </Card>

        <Card className="p-6 bg-white border-2 border-[#D2B48C]">
          <div className="flex items-center gap-3 mb-6">
            <UserPlus className="h-6 w-6 text-[#8B4513]" />
            <h2 className="text-2xl text-[#3D2817]">Admin Management</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div>
              <label className="block mb-2 text-[#3D2817]">Name</label>
              <Input value={newAdmin.name} onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })} />
            </div>
            <div>
              <label className="block mb-2 text-[#3D2817]">Email</label>
              <Input value={newAdmin.email} onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })} />
            </div>
            <div>
              <label className="block mb-2 text-[#3D2817]">Username</label>
              <Input value={newAdmin.username} onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })} />
            </div>
            <div>
              <label className="block mb-2 text-[#3D2817]">Password</label>
              <Input
                type={showNewAdminPassword ? 'text' : 'password'}
                value={newAdmin.password}
                onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
              />
              <label className="mt-2 flex items-center gap-2 text-xs text-[#6B5344]">
                <input
                  type="checkbox"
                  checked={showNewAdminPassword}
                  onChange={(e) => setShowNewAdminPassword(e.target.checked)}
                />
                Show password
              </label>
            </div>
            <div>
              <label className="block mb-2 text-[#3D2817]">Role</label>
              <select
                className="w-full border border-[#D2B48C] rounded-md p-2"
                value={newAdmin.role}
                onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
              >
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
          </div>
          <Button onClick={handleCreateAdmin} disabled={isLoading} className="bg-[#C41E3A] hover:bg-[#FF6B6B] text-white">
            Create Admin
          </Button>

          <div className="mt-8 divide-y divide-[#F0EAD6]">
            {admins.length === 0 && <p className="text-[#6B5344]">No admins found.</p>}
            {admins.map((admin) => (
              <div key={admin.id} className="flex flex-col md:flex-row md:items-center md:justify-between py-4 gap-3">
                <div>
                  <div className="text-[#3D2817] font-semibold">{admin.name}</div>
                  <div className="text-sm text-[#6B5344]">{admin.email} • {admin.username} • {admin.role}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleAdminActive(admin)}
                    className="border-2 border-[#8B4513] text-[#8B4513]"
                  >
                    {admin.active ? 'Disable' : 'Enable'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => resetAdminPassword(admin)}
                    className="border-2 border-[#1E90FF] text-[#1E90FF]"
                  >
                    <KeyRound className="h-4 w-4 mr-1" /> Reset Password
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteAdmin(admin)}
                    className="border-2 border-[#C41E3A] text-[#C41E3A]"
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 bg-white border-2 border-[#D2B48C]">
          <h2 className="text-2xl text-[#3D2817] mb-4">Active Sessions</h2>
          {sessions.length === 0 ? (
            <p className="text-[#6B5344]">No active sessions.</p>
          ) : (
            <div className="divide-y divide-[#F0EAD6]">
              {sessions.map((session) => (
                <div key={session.id} className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-2">
                  <div className="text-sm text-[#6B5344]">
                    {session.type} • {session.actorId} • {session.ip} • {session.browser} • {session.os}
                  </div>
                  <Button size="sm" variant="outline" onClick={() => terminateSession(session.id)}>
                    Terminate
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6 bg-white border-2 border-[#D2B48C]">
          <h2 className="text-2xl text-[#3D2817] mb-4">Blocklist</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-[#3D2817]">Block IP</label>
              <div className="flex gap-2">
                <Input value={ipToBlock} onChange={(e) => setIpToBlock(e.target.value)} placeholder="IP address" />
                <Button onClick={blockIp}>Block</Button>
              </div>
              <div className="mt-3 space-y-2">
                {blockedIps.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between text-sm">
                    <span>{entry.ip}</span>
                    <Button size="sm" variant="outline" onClick={() => unblockIp(entry.ip)}>Unblock</Button>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="block mb-2 text-[#3D2817]">Block Device (User Agent)</label>
              <div className="flex gap-2">
                <Input value={deviceToBlock} onChange={(e) => setDeviceToBlock(e.target.value)} placeholder="User agent string" />
                <Button onClick={blockDevice}>Block</Button>
              </div>
              <div className="mt-3 space-y-2">
                {blockedDevices.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between text-sm">
                    <span className="truncate">{entry.userAgent}</span>
                    <Button size="sm" variant="outline" onClick={() => unblockDevice(entry.userAgent)}>Unblock</Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white border-2 border-[#D2B48C]">
          <h2 className="text-2xl text-[#3D2817] mb-4">Audit Logs</h2>
          <div className="space-y-2 max-h-80 overflow-auto text-sm text-[#6B5344]">
            {auditLogs.map((log) => (
              <div key={log.id}>
                {log.createdAt} • {log.action} • {log.target || ''} • {log.actorRole || ''}
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 bg-white border-2 border-[#D2B48C]">
          <h2 className="text-2xl text-[#3D2817] mb-4">Login Attempts</h2>
          <div className="space-y-2 max-h-80 overflow-auto text-sm text-[#6B5344]">
            {loginAttempts.map((attempt) => (
              <div key={attempt.id}>
                {attempt.createdAt} • {attempt.actorType} • {attempt.usernameOrEmail} • {attempt.status} • {attempt.ip}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
