import { useEffect, useMemo, useState } from 'react';
import { Users, ShieldCheck, ShoppingBag, DollarSign } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { useApp } from '../../context/AppContext';

interface AccountRow {
  id: string;
  name: string;
  email: string;
  customerId: string;
  createdAt: string;
}

export function CustomerAccounts() {
  const { customers, orders, loadCustomers, loadOrders } = useApp();
  const [accounts, setAccounts] = useState<AccountRow[]>([]);

  useEffect(() => {
    fetch('/api/admin/accounts')
      .then((res) => res.json())
      .then((data) => setAccounts(data.accounts || []))
      .catch(() => setAccounts([]));
  }, []);

  useEffect(() => {
    loadCustomers();
    loadOrders('admin');
  }, [loadCustomers, loadOrders]);

  const getCustomer = (customerId: string) =>
    customers.find((customer) => customer.id === customerId);

  const isVip = (totalOrders: number) => totalOrders >= 25;

  const summary = useMemo(() => {
    const totalCustomers = customers.length;
    const vipCustomers = customers.filter((c) => c.totalOrders >= 25).length;
    const totalOrders = orders.length;
    const totalPaid = orders.reduce((sum, order) => sum + order.totalAmount + order.deliveryFee, 0);
    return { totalCustomers, vipCustomers, totalOrders, totalPaid };
  }, [customers, orders]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl text-[#3D2817]">Customer Accounts</h2>
        <div className="flex items-center gap-2 text-sm text-[#6B5344]">
          <Users className="h-4 w-4" />
          <span>{accounts.length} accounts</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-white border-2 border-[#228B22]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B5344]">Total Customers</p>
              <div className="text-3xl text-[#3D2817]">{summary.totalCustomers}</div>
            </div>
            <Users className="h-10 w-10 text-[#228B22]" />
          </div>
        </Card>

        <Card className="p-6 bg-white border-2 border-[#FFD700]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B5344]">VIP Customers</p>
              <div className="text-3xl text-[#3D2817]">{summary.vipCustomers}</div>
            </div>
            <ShieldCheck className="h-10 w-10 text-[#FFD700]" />
          </div>
        </Card>

        <Card className="p-6 bg-white border-2 border-[#C41E3A]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B5344]">Total Orders</p>
              <div className="text-3xl text-[#3D2817]">{summary.totalOrders}</div>
            </div>
            <ShoppingBag className="h-10 w-10 text-[#C41E3A]" />
          </div>
        </Card>

        <Card className="p-6 bg-white border-2 border-[#D2691E]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B5344]">Total Amount Paid</p>
              <div className="text-3xl text-[#3D2817]">{summary.totalPaid.toLocaleString()}</div>
              <p className="text-xs text-[#6B5344]">RWF</p>
            </div>
            <DollarSign className="h-10 w-10 text-[#D2691E]" />
          </div>
        </Card>
      </div>

      <Card className="p-6 bg-white border-2 border-[#D2B48C]">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-xs font-semibold text-[#6B5344] uppercase tracking-wide border-b border-[#D2B48C] pb-3">
          <div>Customer ID</div>
          <div>Name</div>
          <div>Email</div>
          <div>Total Orders</div>
          <div>Status</div>
        </div>

        <div className="divide-y divide-[#F0EAD6]">
          {accounts.map((account) => {
            const customer = getCustomer(account.customerId);
            const totalOrders = customer?.totalOrders || 0;
            const vip = isVip(totalOrders);
            return (
              <div key={account.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 py-4 text-sm">
                <div className="text-[#3D2817]">{account.customerId}</div>
                <div className="text-[#3D2817]">{account.name}</div>
                <div className="text-[#6B5344]">{account.email}</div>
                <div className="text-[#3D2817]">{totalOrders}</div>
                <div>
                  {vip ? (
                    <Badge className="bg-[#FFD700] text-[#3D2817] flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      VIP
                    </Badge>
                  ) : (
                    <Badge className="bg-[#A0522D] text-white">Standard</Badge>
                  )}
                </div>
              </div>
            );
          })}

          {accounts.length === 0 && (
            <div className="py-10 text-center text-[#6B5344]">
              No accounts yet. New signups will appear here.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
