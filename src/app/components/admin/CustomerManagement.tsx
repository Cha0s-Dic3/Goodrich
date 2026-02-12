import { Users, Phone, Mail, ShoppingBag, DollarSign } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';

export function CustomerManagement() {
  const { customers, orders } = useApp();
  
  // Sort customers by total spent
  const sortedCustomers = [...customers].sort((a, b) => b.totalSpent - a.totalSpent);
  
  const getCustomerOrders = (customerId: string) => {
    return orders.filter(o => o.customerId === customerId);
  };
  
  const getCustomerTier = (totalOrders: number) => {
    if (totalOrders >= 25) return { tier: 'VIP', color: 'bg-[#FFD700] text-[#3D2817]' };
    if (totalOrders >= 10) return { tier: 'Gold', color: 'bg-[#D2691E] text-white' };
    if (totalOrders >= 5) return { tier: 'Silver', color: 'bg-[#8B4513] text-white' };
    return { tier: 'Standard', color: 'bg-[#A0522D] text-white' };
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl text-[#3D2817]">Customer Management</h2>
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-white border-2 border-[#228B22]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B5344]">Total Customers</p>
              <div className="text-3xl text-[#3D2817]">{customers.length}</div>
            </div>
            <Users className="h-10 w-10 text-[#228B22]" />
          </div>
        </Card>
        
        <Card className="p-6 bg-white border-2 border-[#FFD700]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B5344]">VIP Customers</p>
              <div className="text-3xl text-[#3D2817]">
                {customers.filter(c => c.totalOrders >= 25).length}
              </div>
            </div>
            <Users className="h-10 w-10 text-[#FFD700]" />
          </div>
        </Card>
        
        <Card className="p-6 bg-white border-2 border-[#C41E3A]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B5344]">Total Orders</p>
              <div className="text-3xl text-[#3D2817]">
                {customers.reduce((sum, c) => sum + c.totalOrders, 0)}
              </div>
            </div>
            <ShoppingBag className="h-10 w-10 text-[#C41E3A]" />
          </div>
        </Card>
        
        <Card className="p-6 bg-white border-2 border-[#D2691E]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-\[#6B5344\]">Total Amount Paid</p>
              <div className="text-3xl text-\[#3D2817\]">
                {customers.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString()}
              </div>
              <p className="text-xs text-\[#6B5344\]">FRW</p>
            </div>
            <DollarSign className="h-10 w-10 text-[#D2691E]" />
          </div>
        </Card>
      </div>
      
      {/* Customer List */}
      <div className="grid gap-4">
        {sortedCustomers.map(customer => {
          const customerOrders = getCustomerOrders(customer.id);
          const tier = getCustomerTier(customer.totalOrders);
          
          return (
            <Card key={customer.id} className="p-6 bg-white border-2 border-[#D2B48C] hover:border-[#C41E3A] transition-colors">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Customer Info */}
                <div className="md:col-span-2">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl text-[#3D2817] mb-1">{customer.name}</h3>
                      <p className="text-sm text-[#6B5344]">Customer ID: {customer.id}</p>
                    </div>
                    <Badge className={tier.color}>{tier.tier}</Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-[#6B5344]" />
                      <span className="text-[#3D2817]">{customer.phone}</span>
                    </div>
                    {customer.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-[#6B5344]" />
                        <span className="text-[#3D2817]">{customer.email}</span>
                      </div>
                    )}
                    <div className="mt-3">
                      <p className="text-xs text-[#6B5344] mb-1">Delivery Addresses:</p>
                      {customer.addresses.map((address, idx) => (
                        <p key={idx} className="text-sm text-[#3D2817]">• {address}</p>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Stats */}
                <div>
                  <div className="mb-4">
                    <p className="text-xs text-[#6B5344]">Total Orders</p>
                    <div className="text-2xl text-[#3D2817]">{customer.totalOrders}</div>
                  </div>
                  <div>
                    <p className="text-xs text-[#6B5344]">Member Since</p>
                    <div className="text-sm text-[#3D2817]">
                      {new Date(customer.joinedDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="mb-4">
                    <p className="text-xs text-[#6B5344]">Total Spent</p>
                    <div className="text-2xl text-[#C41E3A]">
                      {customer.totalSpent.toLocaleString()} FRW
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-[#6B5344]">Avg Order Value</p>
                    <div className="text-sm text-[#3D2817]">
                      {customer.totalOrders > 0
                        ? (customer.totalSpent / customer.totalOrders).toLocaleString()
                        : 0}{' '}
                      FRW
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Recent Orders */}
              {customerOrders.length > 0 && (
                <div className="mt-6 pt-6 border-t border-[#D2B48C]">
                  <h4 className="text-sm text-[#6B5344] mb-3">Recent Orders ({customerOrders.length})</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {customerOrders.slice(0, 3).map(order => (
                      <div key={order.id} className="p-3 bg-[#F0EAD6] rounded-lg border border-[#D2B48C]">
                        <div className="text-sm text-[#3D2817] mb-1">#{order.id}</div>
                        <div className="text-xs text-[#6B5344]">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-[#C41E3A] mt-2">
                          {(order.totalAmount + order.deliveryFee).toLocaleString()} FRW
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

