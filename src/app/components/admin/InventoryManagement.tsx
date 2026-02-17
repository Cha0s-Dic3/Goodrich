import { useState } from 'react';
import { Package, Edit, Save, X } from 'lucide-react';
import { useApp, Product } from '../../context/AppContext';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';

export function InventoryManagement() {
  const { products, updateProduct, language } = useApp();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Product>>({});
  
  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setEditData(product);
  };
  
  const handleSave = async (productId: string) => {
    try {
      await updateProduct(productId, editData);
      setEditingId(null);
      setEditData({});
      toast.success('Product updated successfully');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update product');
    }
  };
  
  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };
  
  return (
    <div className="space-y-6">
      <p className="text-sm text-[#6B5344]">
        Editing product translations for: <span className="font-semibold uppercase">{language}</span>
      </p>
      <div className="flex items-center justify-between">
        <h2 className="text-3xl text-[#3D2817]">Inventory Management</h2>
      </div>
      
      <div className="grid gap-4">
        {products.map(product => {
          const isEditing = editingId === product.id;
          const displayProduct = isEditing ? editData : product;
          
          return (
            <Card key={product.id} className="p-6 bg-white border-2 border-[#D2B48C]">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
                {/* Product Info */}
                <div className="md:col-span-2">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-[#6B5344]">Product Name</label>
                        <Input
                          value={displayProduct.name || ''}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          className="border-[#D2B48C]"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[#6B5344]">Description</label>
                        <Input
                          value={displayProduct.description || ''}
                          onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                          className="border-[#D2B48C]"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-xl text-[#3D2817] mb-2">{product.name}</h3>
                      <p className="text-sm text-[#6B5344] mb-3">{product.description}</p>
                      <Badge variant="outline" className="border-[#8B4513] text-[#8B4513] capitalize">
                        {product.size}
                      </Badge>
                    </>
                  )}
                </div>
                
                {/* Pricing */}
                <div>
                  <label className="text-xs text-[#6B5344]">Price (FRW)</label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={displayProduct.price || 0}
                      onChange={(e) => setEditData({ ...editData, price: parseInt(e.target.value) })}
                      className="border-[#D2B48C]"
                    />
                  ) : (
                    <div className="text-2xl text-[#C41E3A]">{product.price.toLocaleString()}</div>
                  )}
                  <p className="text-xs text-[#6B5344] mt-1">{product.quantity} eggs/tray</p>
                </div>
                
                {/* Stock */}
                <div>
                  <label className="text-xs text-[#6B5344]">Stock Available</label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={displayProduct.stock || 0}
                      onChange={(e) => setEditData({ ...editData, stock: parseInt(e.target.value) })}
                      className="border-[#D2B48C]"
                    />
                  ) : (
                    <>
                      <div className="text-2xl text-[#3D2817]">{product.stock}</div>
                      {product.stock <= 20 && (
                        <Badge className="bg-[#FF0000] text-white mt-2 animate-pulse">⚠️ RESTOCK NEEDED</Badge>
                      )}
                      {product.stock > 20 && product.stock < 50 && (
                        <Badge className="bg-[#FFD700] text-[#3D2817] mt-2">Medium Stock</Badge>
                      )}
                      {product.stock >= 50 && (
                        <Badge className="bg-[#228B22] text-white mt-2">Good Stock</Badge>
                      )}
                    </>
                  )}
                </div>
                
                {/* Actions */}
                <div className="flex flex-col gap-2">
                  {isEditing ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleSave(product.id)}
                        className="bg-[#228B22] hover:bg-[#1a6b1a] text-white"
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancel}
                        className="border-[#C41E3A] text-[#C41E3A] hover:bg-[#C41E3A] hover:text-white"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(product)}
                      className="border-[#8B4513] text-[#8B4513] hover:bg-[#8B4513] hover:text-white"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card className="p-6 bg-white border-2 border-[#228B22]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B5344]">Total Products</p>
              <div className="text-3xl text-[#3D2817]">{products.length}</div>
            </div>
            <Package className="h-12 w-12 text-[#228B22]" />
          </div>
        </Card>
        
        <Card className="p-6 bg-white border-2 border-[#FFD700]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B5344]">Total Stock</p>
              <div className="text-3xl text-[#3D2817]">
                {products.reduce((sum, p) => sum + p.stock, 0)}
              </div>
            </div>
            <Package className="h-12 w-12 text-[#FFD700]" />
          </div>
        </Card>
        
        <Card className="p-6 bg-white border-2 border-[#C41E3A]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B5344]">Items Needing Restock (≤20)</p>
              <div className="text-3xl text-[#3D2817]">
                {products.filter(p => p.stock <= 20).length}
              </div>
            </div>
            <Package className="h-12 w-12 text-[#C41E3A]" />
          </div>
        </Card>
      </div>
    </div>
  );
}
