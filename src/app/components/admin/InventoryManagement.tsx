import { useRef, useState } from 'react';
import { Package, Edit, Save, X, Plus, Trash2, ImagePlus, Loader2 } from 'lucide-react';
import { useApp, Product } from '../../context/AppContext';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';

// All supported sizes
const PRODUCT_SIZES: Array<Product['size']> = ['small', 'medium', 'large', 'extra-large'];

const EMPTY_NEW_PRODUCT: Omit<Product, 'id'> = {
  name: '',
  description: '',
  category: 'eggs',
  size: 'medium',
  quantity: 30,
  price: 0,
  stock: 0,
  image: ''
};

/** Small reusable image-upload button */
function ImageUploadButton({
  currentUrl,
  onUploaded,
  label = 'Upload Image'
}: {
  currentUrl?: string;
  onUploaded: (url: string) => void;
  label?: string;
}) {
  const { uploadProductImage } = useApp();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadProductImage(file);
      onUploaded(url);
      toast.success('Image uploaded successfully');
    } catch (err: any) {
      toast.error(err?.message || 'Image upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {currentUrl && (
        <img
          src={currentUrl}
          alt="Product"
          className="h-20 w-20 object-cover rounded border border-[#D2B48C]"
        />
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="border-[#8B4513] text-[#8B4513] hover:bg-[#8B4513] hover:text-white"
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
        ) : (
          <ImagePlus className="h-4 w-4 mr-1" />
        )}
        {uploading ? 'Uploading…' : label}
      </Button>
    </div>
  );
}

export function InventoryManagement() {
  const { products, updateProduct, addProduct, deleteProduct, language } = useApp();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Product>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>(EMPTY_NEW_PRODUCT);
  const [isAdding, setIsAdding] = useState(false);

  // Derive existing categories from current products
  const existingCategories = Array.from(new Set(products.map(p => p.category)));

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setEditData(product);
    setShowAddForm(false);
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

  const handleDelete = async (productId: string, productName: string) => {
    if (!confirm(`Delete "${productName}"? This cannot be undone.`)) return;
    try {
      await deleteProduct(productId);
      toast.success('Product deleted successfully');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete product');
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (newProduct.price <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }
    setIsAdding(true);
    try {
      await addProduct(newProduct);
      setNewProduct(EMPTY_NEW_PRODUCT);
      setShowAddForm(false);
      toast.success('Product added successfully');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add product');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-[#6B5344]">
        Editing product translations for: <span className="font-semibold uppercase">{language}</span>
      </p>
      <div className="flex items-center justify-between">
        <h2 className="text-3xl text-[#3D2817]">Inventory Management</h2>
        <Button
          onClick={() => { setShowAddForm(true); setEditingId(null); setEditData({}); }}
          className="bg-[#228B22] hover:bg-[#1a6b1a] text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Add New Product Form */}
      {showAddForm && (
        <Card className="p-6 bg-[#FFFDF7] border-2 border-[#228B22]">
          <h3 className="text-lg font-semibold text-[#3D2817] mb-4">New Product</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#6B5344] font-semibold">Product Name *</label>
              <Input
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                placeholder="e.g. Small Eggs Tray"
                className="border-[#D2B48C]"
              />
            </div>
            <div>
              <label className="text-xs text-[#6B5344] font-semibold">Description</label>
              <Input
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                placeholder="e.g. Fresh farm eggs - Small size"
                className="border-[#D2B48C]"
              />
            </div>
            <div>
              <label className="text-xs text-[#6B5344] font-semibold">Category</label>
              <select
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value as Product['category'] })}
                className="w-full border border-[#D2B48C] rounded-md px-3 py-2 text-sm text-[#3D2817] bg-white focus:outline-none focus:border-[#8B4513]"
              >
                {existingCategories.length > 0
                  ? existingCategories.map(cat => (
                      <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                    ))
                  : <option value="eggs">Eggs</option>
                }
              </select>
            </div>
            <div>
              <label className="text-xs text-[#6B5344] font-semibold">Size</label>
              <select
                value={newProduct.size}
                onChange={(e) => setNewProduct({ ...newProduct, size: e.target.value as Product['size'] })}
                className="w-full border border-[#D2B48C] rounded-md px-3 py-2 text-sm text-[#3D2817] bg-white focus:outline-none focus:border-[#8B4513]"
              >
                {PRODUCT_SIZES.map(size => (
                  <option key={size} value={size}>{size.charAt(0).toUpperCase() + size.slice(1).replace('-', ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-[#6B5344] font-semibold">Price (FRW) *</label>
              <Input
                type="number"
                value={newProduct.price || ''}
                onChange={(e) => setNewProduct({ ...newProduct, price: parseInt(e.target.value) || 0 })}
                placeholder="e.g. 4500"
                className="border-[#D2B48C]"
              />
            </div>
            <div>
              <label className="text-xs text-[#6B5344] font-semibold">Eggs per Tray</label>
              <Input
                type="number"
                value={newProduct.quantity || ''}
                onChange={(e) => setNewProduct({ ...newProduct, quantity: parseInt(e.target.value) || 30 })}
                placeholder="30"
                className="border-[#D2B48C]"
              />
            </div>
            <div>
              <label className="text-xs text-[#6B5344] font-semibold">Stock Available</label>
              <Input
                type="number"
                value={newProduct.stock || ''}
                onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) || 0 })}
                placeholder="0"
                className="border-[#D2B48C]"
              />
            </div>
            <div>
              <label className="text-xs text-[#6B5344] font-semibold block mb-1">Product Image</label>
              <ImageUploadButton
                currentUrl={newProduct.image || undefined}
                onUploaded={(url) => setNewProduct({ ...newProduct, image: url })}
                label="Attach Image"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button
              onClick={handleAddProduct}
              disabled={isAdding}
              className="bg-[#228B22] hover:bg-[#1a6b1a] text-white"
            >
              <Save className="h-4 w-4 mr-1" />
              {isAdding ? 'Adding...' : 'Save Product'}
            </Button>
            <Button
              variant="outline"
              onClick={() => { setShowAddForm(false); setNewProduct(EMPTY_NEW_PRODUCT); }}
              className="border-[#C41E3A] text-[#C41E3A] hover:bg-[#C41E3A] hover:text-white"
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <div className="grid gap-4">
        {products.map(product => {
          const isEditing = editingId === product.id;
          const displayProduct = isEditing ? editData : product;

          return (
            <Card key={product.id} className="p-6 bg-white border-2 border-[#D2B48C]">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-6 items-start">
                {/* Product Image */}
                <div className="md:col-span-1 flex flex-col items-center gap-2">
                  {displayProduct.image && (
                    <img
                      src={displayProduct.image}
                      alt={displayProduct.name || 'Product'}
                      className="h-20 w-20 object-cover rounded border border-[#D2B48C]"
                    />
                  )}
                  {isEditing && (
                    <ImageUploadButton
                      currentUrl={editData.image || undefined}
                      onUploaded={(url) => setEditData({ ...editData, image: url })}
                      label="Change Image"
                    />
                  )}
                </div>

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
                      <div>
                        <label className="text-xs text-[#6B5344]">Category</label>
                        <select
                          value={displayProduct.category || 'eggs'}
                          onChange={(e) => setEditData({ ...editData, category: e.target.value as Product['category'] })}
                          className="w-full border border-[#D2B48C] rounded-md px-3 py-2 text-sm text-[#3D2817] bg-white focus:outline-none focus:border-[#8B4513]"
                        >
                          {existingCategories.length > 0
                            ? existingCategories.map(cat => (
                                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                              ))
                            : <option value="eggs">Eggs</option>
                          }
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-[#6B5344]">Size</label>
                        <select
                          value={displayProduct.size || 'medium'}
                          onChange={(e) => setEditData({ ...editData, size: e.target.value as Product['size'] })}
                          className="w-full border border-[#D2B48C] rounded-md px-3 py-2 text-sm text-[#3D2817] bg-white focus:outline-none focus:border-[#8B4513]"
                        >
                          {PRODUCT_SIZES.map(size => (
                            <option key={size} value={size}>{size.charAt(0).toUpperCase() + size.slice(1).replace('-', ' ')}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-xl text-[#3D2817] mb-2">{product.name}</h3>
                      <p className="text-sm text-[#6B5344] mb-3">{product.description}</p>
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="outline" className="border-[#8B4513] text-[#8B4513] capitalize">
                          {product.category}
                        </Badge>
                        <Badge variant="outline" className="border-[#8B4513] text-[#8B4513] capitalize">
                          {product.size}
                        </Badge>
                      </div>
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
                  {isEditing ? (
                    <div className="mt-2">
                      <label className="text-xs text-[#6B5344]">Eggs per Tray</label>
                      <Input
                        type="number"
                        value={displayProduct.quantity || 30}
                        onChange={(e) => setEditData({ ...editData, quantity: parseInt(e.target.value) })}
                        className="border-[#D2B48C] mt-1"
                      />
                    </div>
                  ) : (
                    <p className="text-xs text-[#6B5344] mt-1">{product.quantity} eggs/tray</p>
                  )}
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
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(product)}
                        className="border-[#8B4513] text-[#8B4513] hover:bg-[#8B4513] hover:text-white"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(product.id, product.name)}
                        className="border-[#C41E3A] text-[#C41E3A] hover:bg-[#C41E3A] hover:text-white"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </>
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
