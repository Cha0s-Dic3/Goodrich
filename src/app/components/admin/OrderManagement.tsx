import { useState } from 'react';
import { Eye, CheckCircle, XCircle, Package } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';

export function OrderManagement() {
  const { orders, updateOrderStatus } = useApp();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<typeof orders[0] | null>(null);
  
  const filteredOrders = statusFilter === 'all'
    ? orders
    : orders.filter(o => o.status === statusFilter);
  
  const statusColors: Record<string, string> = {
    pending: 'bg-[#FF8C00] text-white',
    confirmed: 'bg-[#228B22] text-white',
    processing: 'bg-[#FFD700] text-[#3D2817]',
    'out-for-delivery': 'bg-[#D2691E] text-white',
    delivered: 'bg-[#228B22] text-white',
    cancelled: 'bg-[#C41E3A] text-white'
  };
  
  const statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'out-for-delivery', label: 'Out for Delivery' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];
  
  const handleStatusChange = (orderId: string, newStatus: any) => {
    updateOrderStatus(orderId, newStatus);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl text-[#3D2817]">Order Management</h2>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48 border-[#D2B48C]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid gap-4">
        {filteredOrders.length === 0 ? (
          <Card className="p-12 text-center bg-white border-2 border-[#D2B48C]">
            <Package className="h-16 w-16 text-[#D2B48C] mx-auto mb-4" />
            <p className="text-xl text-[#6B5344]">No orders found</p>
          </Card>
        ) : (
          filteredOrders.map(order => (
            <Card key={order.id} className="p-6 bg-white border-2 border-[#D2B48C] hover:border-[#C41E3A] transition-colors">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Order Info */}
                <div className="lg:col-span-2">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl text-[#3D2817] mb-1">Order #{order.id}</h3>
                      <p className="text-sm text-[#6B5344]">
                        {new Date(order.createdAt).toLocaleDateString()} at{' '}
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <Badge className={statusColors[order.status]}>
                      {order.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-[#6B5344]">Customer:</span>{' '}
                      <span className="text-[#3D2817]">{order.customerName}</span>
                    </div>
                    <div>
                      <span className="text-[#6B5344]">Phone:</span>{' '}
                      <span className="text-[#3D2817]">{order.customerPhone}</span>
                    </div>
                    <div>
                      <span className="text-[#6B5344]">Delivery:</span>{' '}
                      <span className="text-[#3D2817]">{order.deliveryAddress}</span>
                    </div>
                    <div>
                      <span className="text-[#6B5344]">Date:</span>{' '}
                      <span className="text-[#3D2817]">
                        {order.deliveryDate} ({order.deliveryTimeWindow})
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Items & Total */}
                <div>
                  <h4 className="text-sm text-[#6B5344] mb-2">Items ({order.items.length})</h4>
                  <div className="space-y-1 text-sm">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="text-[#3D2817]">
                        {item.quantity}x {item.product.name}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-[#D2B48C]">
                    <div className="text-sm text-[#6B5344]">Subtotal: {order.totalAmount.toLocaleString()} FRW</div>
                    <div className="text-sm text-[#6B5344]">Delivery: {order.deliveryFee.toLocaleString()} FRW</div>
                    <div className="text-lg text-[#C41E3A] mt-2">
                      Total: {(order.totalAmount + order.deliveryFee).toLocaleString()} FRW
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Select
                    value={order.status}
                    onValueChange={(value) => handleStatusChange(order.id, value)}
                  >
                    <SelectTrigger className="border-[#8B4513]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="out-for-delivery">Out for Delivery</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="border-[#8B4513] text-[#8B4513] hover:bg-[#8B4513] hover:text-white"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Order Details - #{order.id}</DialogTitle>
                      </DialogHeader>
                      {selectedOrder && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm text-[#6B5344] mb-1">Customer Name</h4>
                              <p className="text-[#3D2817]">{selectedOrder.customerName}</p>
                            </div>
                            <div>
                              <h4 className="text-sm text-[#6B5344] mb-1">Phone</h4>
                              <p className="text-[#3D2817]">{selectedOrder.customerPhone}</p>
                            </div>
                            <div>
                              <h4 className="text-sm text-[#6B5344] mb-1">Email</h4>
                              <p className="text-[#3D2817]">{selectedOrder.customerEmail || 'N/A'}</p>
                            </div>
                          <div>
                            <h4 className="text-sm text-[#6B5344] mb-1">Delivery Zone</h4>
                            <p className="text-[#3D2817] capitalize">{selectedOrder.deliveryZone}</p>
                          </div>
                          <div>
                            <h4 className="text-sm text-[#6B5344] mb-1">Payment</h4>
                            <p className="text-[#3D2817]">{selectedOrder.paymentStatus || 'N/A'}</p>
                          </div>
                        </div>
                          
                          <div>
                            <h4 className="text-sm text-[#6B5344] mb-1">Delivery Address</h4>
                            <p className="text-[#3D2817]">{selectedOrder.deliveryAddress}</p>
                          </div>
                          
                          <div>
                            <h4 className="text-sm text-[#6B5344] mb-1">Order Notes</h4>
                            <p className="text-[#3D2817]">{selectedOrder.notes || 'No notes'}</p>
                          </div>
                          
                          <div>
                            <h4 className="text-sm text-[#6B5344] mb-2">Items</h4>
                            <div className="space-y-2">
                              {selectedOrder.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between p-3 bg-[#F0EAD6] rounded">
                                  <span className="text-[#3D2817]">{item.product.name} x{item.quantity}</span>
                                  <span className="text-[#C41E3A]">
                                    {(item.product.price * item.quantity).toLocaleString()} FRW
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                  
                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <>
                      <Button
                        size="sm"
                        className="bg-[#228B22] hover:bg-[#1a6b1a] text-white"
                        onClick={() => handleStatusChange(order.id, 'confirmed')}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-[#C41E3A] text-[#C41E3A] hover:bg-[#C41E3A] hover:text-white"
                        onClick={() => handleStatusChange(order.id, 'cancelled')}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

