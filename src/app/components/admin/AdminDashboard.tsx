import { ShoppingCart, Package, Users, DollarSign, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';

export function AdminDashboard() {
  const { orders, products, customers, getLowStockItems } = useApp();
  
  // Calculate statistics
  const totalPaid = orders.reduce((sum, order) => 
    sum + order.totalAmount + order.deliveryFee, 0
  );
  
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length;
  
  const lowStockProducts = getLowStockItems();
  
  const recentOrders = orders.slice(0, 5);
  
  const statusColors: Record<string, string> = {
    pending: 'bg-[#FF8C00] text-white',
    confirmed: 'bg-[#228B22] text-white',
    processing: 'bg-[#FFD700] text-[#3D2817]',
    'out-for-delivery': 'bg-[#D2691E] text-white',
    delivered: 'bg-[#228B22] text-white',
    cancelled: 'bg-[#C41E3A] text-white'
  };
  
  return (
    <div className="space-y-8">
      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="p-4 bg-[#FF0000]/10 border-2 border-[#FF0000] rounded-lg flex items-start gap-3">
          <AlertTriangle className="h-6 w-6 text-[#FF0000] flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-[#C41E3A] mb-1">⚠️ URGENT: Stock Restock Needed!</h3>
            <p className="text-[#6B5344] text-sm mb-2">
              {lowStockProducts.length} product(s) have stock at 20 units or below and need immediate restocking:
            </p>
            <div className="space-y-1">
              {lowStockProducts.map(product => (
                <p key={product.id} className="text-sm text-[#6B5344] font-semibold">
                  • {product.name}: {product.stock} units remaining
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-white border-2 border-[#C41E3A]">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-[#6B5344] mb-1">Total Amount Paid</p>
              <h3 className="text-3xl text-[#3D2817]">{totalPaid.toLocaleString()}</h3>
              <p className="text-xs text-[#6B5344]">FRW</p>
            </div>
            <div className="w-12 h-12 bg-[#C41E3A] rounded-full flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="flex items-center text-sm text-[#228B22]">
            <TrendingUp className="h-4 w-4 mr-1" />
            +12% from last month
          </div>
        </Card>
        
        <Card className="p-6 bg-white border-2 border-[#FFD700]">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-[#6B5344] mb-1">Total Orders</p>
              <h3 className="text-3xl text-[#3D2817]">{orders.length}</h3>
              <p className="text-xs text-[#6B5344]">Pending: {pendingOrders}</p>
            </div>
            <div className="w-12 h-12 bg-[#FFD700] rounded-full flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-[#3D2817]" />
            </div>
          </div>
          <div className="flex items-center text-sm text-[#228B22]">
            <TrendingUp className="h-4 w-4 mr-1" />
            +8% from last month
          </div>
        </Card>
        
        <Card className="p-6 bg-white border-2 border-[#228B22]">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-[#6B5344] mb-1">Total Customers</p>
              <h3 className="text-3xl text-[#3D2817]">{customers.length}</h3>
              <p className="text-xs text-[#6B5344]">Active this month</p>
            </div>
            <div className="w-12 h-12 bg-[#228B22] rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="flex items-center text-sm text-[#228B22]">
            <TrendingUp className="h-4 w-4 mr-1" />
            +15% from last month
          </div>
        </Card>
        
        <Card className={`p-6 bg-white border-2 ${lowStockProducts.length > 0 ? 'border-[#FF0000] bg-[#FFF5F5]' : 'border-[#D2691E]'}`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-[#6B5344] mb-1">Items Needing Restock</p>
              <h3 className={`text-3xl ${lowStockProducts.length > 0 ? 'text-[#FF0000]' : 'text-[#3D2817]'}`}>
                {lowStockProducts.length}
              </h3>
              <p className="text-xs text-[#6B5344]">≤20 units</p>
            </div>
            <div className={`w-12 h-12 ${lowStockProducts.length > 0 ? 'bg-[#FF0000]' : 'bg-[#D2691E]'} rounded-full flex items-center justify-center`}>
              <Package className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className={`flex items-center text-sm ${lowStockProducts.length > 0 ? 'text-[#FF0000]' : 'text-[#C41E3A]'}`}>
            <AlertTriangle className="h-4 w-4 mr-1" />
            {lowStockProducts.length > 0 ? 'Action required immediately' : 'All stocked well'}
          </div>
        </Card>
      </div>
      
      {/* Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-white border-2 border-[#D2B48C]">
          <h3 className="text-2xl mb-4 text-[#3D2817]">Recent Orders</h3>
          <div className="space-y-3">
            {recentOrders.map(order => (
              <div key={order.id} className="p-4 bg-[#F0EAD6] rounded-lg border border-[#D2B48C]">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-sm text-[#3D2817]">#{order.id}</div>
                    <div className="text-sm text-[#6B5344]">{order.customerName}</div>
                  </div>
                  <Badge className={statusColors[order.status]}>
                    {order.status}
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#6B5344]">{order.items.length} items</span>
                  <span className="text-[#C41E3A]">
                    {(order.totalAmount + order.deliveryFee).toLocaleString()} FRW
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
        
        {/* Low Stock Alert */}
        <Card className="p-6 bg-white border-2 border-[#D2B48C]">
          <h3 className="text-2xl mb-4 text-[#3D2817]">Low Stock Alert</h3>
          <div className="space-y-3">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.map(product => (
                <div key={product.id} className="p-4 bg-[#FFF3E0] rounded-lg border border-[#FF8C00]">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-sm text-[#3D2817]">{product.name}</div>
                      <div className="text-xs text-[#6B5344]">{product.size} size</div>
                    </div>
                    <Badge className="bg-[#FF8C00] text-white">
                      {product.stock} left
                    </Badge>
                  </div>
                  <div className="text-sm text-[#6B5344]">
                    Price: {product.price.toLocaleString()} FRW
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-[#6B5344]">
                All products are well stocked
              </div>
            )}
          </div>
        </Card>
      </div>
      
      {/* Quick Stats */}
      <Card className="p-6 bg-gradient-to-br from-[#8B4513] to-[#A0522D] border-2 border-[#FFD700]">
        <h3 className="text-2xl mb-6 text-[#FFFDD0]">Farm Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-4xl text-[#FFD700] mb-2">5,000</div>
            <div className="text-sm text-[#FAF3E0]">Chicken Capacity</div>
          </div>
          <div className="text-center">
            <div className="text-4xl text-[#FFD700] mb-2">{products.length}</div>
            <div className="text-sm text-[#FAF3E0]">Products Available</div>
          </div>
          <div className="text-center">
            <div className="text-4xl text-[#FFD700] mb-2">100%</div>
            <div className="text-sm text-[#FAF3E0]">Free-Range</div>
          </div>
          <div className="text-center">
            <div className="text-4xl text-[#FFD700] mb-2">24h</div>
            <div className="text-sm text-[#FAF3E0]">Fresh Daily</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
