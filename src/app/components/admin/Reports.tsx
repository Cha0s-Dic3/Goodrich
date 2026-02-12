import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useApp } from '../../context/AppContext';
import { Card } from '../ui/card';
import { TrendingUp, DollarSign, Package } from 'lucide-react';

export function Reports() {
  const { orders, products, customers } = useApp();
  
  // Sales by status
  const ordersByStatus = [
    { name: 'Pending', count: orders.filter(o => o.status === 'pending').length, color: '#FF8C00' },
    { name: 'Confirmed', count: orders.filter(o => o.status === 'confirmed').length, color: '#228B22' },
    { name: 'Processing', count: orders.filter(o => o.status === 'processing').length, color: '#FFD700' },
    { name: 'Delivered', count: orders.filter(o => o.status === 'delivered').length, color: '#228B22' },
    { name: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length, color: '#C41E3A' }
  ];
  
  // Revenue by delivery zone
  const revenueByZone = [
    {
      name: 'Local',
      revenue: orders.filter(o => o.deliveryZone === 'local')
        .reduce((sum, o) => sum + o.totalAmount + o.deliveryFee, 0)
    },
    {
      name: 'Regional',
      revenue: orders.filter(o => o.deliveryZone === 'regional')
        .reduce((sum, o) => sum + o.totalAmount + o.deliveryFee, 0)
    },
    {
      name: 'National',
      revenue: orders.filter(o => o.deliveryZone === 'national')
        .reduce((sum, o) => sum + o.totalAmount + o.deliveryFee, 0)
    }
  ];
  
  // Product performance
  const productPerformance = products.map(product => {
    const productOrders = orders.flatMap(o => o.items.filter(i => i.product.id === product.id));
    const totalSold = productOrders.reduce((sum, item) => sum + item.quantity, 0);
    const revenue = productOrders.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    
    return {
      name: product.name.replace(' Eggs Tray', ''),
      sold: totalSold,
      revenue: revenue / 1000 // In thousands for better display
    };
  });
  
  // Key metrics
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount + o.deliveryFee, 0);
  const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  const totalItemsSold = orders.flatMap(o => o.items).reduce((sum, item) => sum + item.quantity, 0);
  
  const COLORS = ['#FF8C00', '#228B22', '#FFD700', '#228B22', '#C41E3A'];
  
  return (
    <div className="space-y-8">
      <h2 className="text-3xl text-[#3D2817]">Reports & Analytics</h2>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-white border-2 border-[#C41E3A]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B5344] mb-1">Total Amount Paid</p>
              <div className="text-2xl text-[#3D2817]">{totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-[#6B5344]">RWF</p>
            </div>
            <DollarSign className="h-10 w-10 text-[#C41E3A]" />
          </div>
        </Card>
        
        <Card className="p-6 bg-white border-2 border-[#FFD700]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B5344] mb-1">Avg Order Value</p>
              <div className="text-2xl text-[#3D2817]">{averageOrderValue.toFixed(0)}</div>
              <p className="text-xs text-[#6B5344]">FRW</p>
            </div>
            <TrendingUp className="h-10 w-10 text-[#FFD700]" />
          </div>
        </Card>
        
        <Card className="p-6 bg-white border-2 border-[#228B22]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B5344] mb-1">Total Orders</p>
              <div className="text-2xl text-[#3D2817]">{orders.length}</div>
              <p className="text-xs text-[#6B5344]">All time</p>
            </div>
            <Package className="h-10 w-10 text-[#228B22]" />
          </div>
        </Card>
        
        <Card className="p-6 bg-white border-2 border-[#D2691E]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B5344] mb-1">Items Sold</p>
              <div className="text-2xl text-[#3D2817]">{totalItemsSold}</div>
              <p className="text-xs text-[#6B5344]">Trays</p>
            </div>
            <Package className="h-10 w-10 text-[#D2691E]" />
          </div>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Distribution */}
        <Card className="p-6 bg-white border-2 border-[#D2B48C]">
          <h3 className="text-xl mb-6 text-[#3D2817]">Orders by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={ordersByStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, count }) => `${name}: ${count}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {ordersByStatus.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
        
        {/* Revenue by Zone */}
        <Card className="p-6 bg-white border-2 border-[#D2B48C]">
          <h3 className="text-xl mb-6 text-[#3D2817]">Revenue by Delivery Zone</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueByZone}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: number) => `${value.toLocaleString()} FRW`} />
              <Bar dataKey="revenue" fill="#C41E3A" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
      
      {/* Product Performance */}
      <Card className="p-6 bg-white border-2 border-[#D2B48C]">
        <h3 className="text-xl mb-6 text-[#3D2817]">Product Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={productPerformance}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" orientation="left" stroke="#8B4513" />
            <YAxis yAxisId="right" orientation="right" stroke="#C41E3A" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="sold" fill="#8B4513" name="Units Sold" />
            <Bar yAxisId="right" dataKey="revenue" fill="#C41E3A" name="Revenue (k FRW)" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
      
      {/* Top Customers */}
      <Card className="p-6 bg-white border-2 border-[#D2B48C]">
        <h3 className="text-xl mb-6 text-[#3D2817]">Top Customers</h3>
        <div className="space-y-3">
          {[...customers]
            .sort((a, b) => b.totalSpent - a.totalSpent)
            .slice(0, 5)
            .map((customer, index) => (
              <div
                key={customer.id}
                className="flex items-center justify-between p-4 bg-[#F0EAD6] rounded-lg border border-[#D2B48C]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#8B4513] rounded-full flex items-center justify-center text-white">
                    #{index + 1}
                  </div>
                  <div>
                    <div className="text-[#3D2817]">{customer.name}</div>
                    <div className="text-sm text-[#6B5344]">{customer.totalOrders} orders</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg text-[#C41E3A]">
                    {customer.totalSpent.toLocaleString()} FRW
                  </div>
                  <div className="text-xs text-[#6B5344]">Total spent</div>
                </div>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
}
