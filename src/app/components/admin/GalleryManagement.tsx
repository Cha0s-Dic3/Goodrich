import { useEffect, useState } from 'react';
import { Edit, Plus, Save, Trash2, X } from 'lucide-react';
import { useApp, GalleryItem } from '../../context/AppContext';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';

const categories = [
  { value: 'facilities', label: 'Farm Facilities' },
  { value: 'chickens', label: 'Our Chickens' },
  { value: 'team', label: 'Our Team' },
  { value: 'eggs', label: 'Fresh Eggs' }
];

export function GalleryManagement() {
  const { gallery, loadGallery, addGalleryItem, updateGalleryItem, deleteGalleryItem } = useApp();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const maxImageBytes = 500* 1024 * 1024;
  const minDimension = 250;
  const maxDimension = 2048;
  const aspectTolerance = 0.05;
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'facilities' as GalleryItem['category'],
    imageUrl: ''
  });
  const [editData, setEditData] = useState<Partial<GalleryItem>>({});

  useEffect(() => {
    loadGallery();
  }, [loadGallery]);

  const resetForm = () => {
    setFormData({ title: '', description: '', category: 'facilities', imageUrl: '' });
  };

  const validateImageDataUrl = (dataUrl: string) => {
    return new Promise<boolean>((resolve) => {
      const image = new Image();
      image.onload = () => {
        const width = image.naturalWidth;
        const height = image.naturalHeight;
        const ratio = width / height;
        if (width < minDimension || height < minDimension) {
          toast.error(`Image must be at least ${minDimension} x ${minDimension}px`);
          resolve(false);
          return;
        }
        if (width > maxDimension || height > maxDimension) {
          toast.error(`Image must be ${maxDimension} x ${maxDimension}px or smaller`);
          resolve(false);
          return;
        }
        if (Math.abs(ratio - 1) > aspectTolerance) {
          toast.error('Image must be square (1:1 aspect ratio)');
          resolve(false);
          return;
        }
        resolve(true);
      };
      image.onerror = () => {
        toast.error('Unable to read image dimensions');
        resolve(false);
      };
      image.src = dataUrl;
    });
  };

  const readImageFile = async (file: File, onLoad: (dataUrl: string) => void) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > maxImageBytes) {
      toast.error('Image must be under 1.5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result === 'string') {
        const isValid = await validateImageDataUrl(reader.result);
        if (isValid) {
          onLoad(reader.result);
        }
      }
    };
    reader.onerror = () => toast.error('Failed to read image');
    reader.readAsDataURL(file);
  };

  const handleNewImageFile = (file: File | null) => {
    if (!file) return;
    readImageFile(file, (dataUrl) => setFormData({ ...formData, imageUrl: dataUrl }));
  };

  const handleEditImageFile = (file: File | null) => {
    if (!file) return;
    readImageFile(file, (dataUrl) => setEditData({ ...editData, imageUrl: dataUrl }));
  };

  const handleAdd = async () => {
    if (!formData.title.trim() || !formData.imageUrl.trim()) {
      toast.error('Please provide a title and image');
      return;
    }
    try {
      await addGalleryItem(formData);
      resetForm();
      setShowNewForm(false);
      toast.success('Gallery item added');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add gallery item');
    }
  };

  const handleEdit = (item: GalleryItem) => {
    setEditingId(item.id);
    setEditData(item);
  };

  const handleSave = async (id: string) => {
    if (!editData.title?.trim() || !editData.imageUrl?.trim()) {
      toast.error('Title and image URL are required');
      return;
    }
    try {
      await updateGalleryItem(id, editData);
      setEditingId(null);
      setEditData({});
      toast.success('Gallery item updated');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update gallery item');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this gallery item?')) return;
    try {
      await deleteGalleryItem(id);
      toast.success('Gallery item deleted');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete gallery item');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl text-[#3D2817]">Gallery Management</h2>
        <Button
          onClick={() => setShowNewForm(true)}
          className="bg-[#C41E3A] hover:bg-[#FF6B6B] text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Photo
        </Button>
      </div>

      {showNewForm && (
        <Card className="p-6 bg-white border-2 border-[#D2B48C]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#6B5344]">Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="border-[#D2B48C]"
              />
            </div>
            <div>
              <label className="text-xs text-[#6B5344]">Category *</label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as GalleryItem['category'] })}
              >
                <SelectTrigger className="border-[#D2B48C]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-[#6B5344]">Image Upload *</label>
              <Input
                type="file"
                accept="image/png,image/jpeg"
                onChange={(e) => handleNewImageFile(e.target.files?.[0] || null)}
                className="border-[#D2B48C] bg-white"
              />
              <p className="mt-2 text-[11px] text-[#6B5344]">Square 1:1, 250-2048px. PNG or JPG. Max 1.5MB.</p>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-[#6B5344]">Image Preview</label>
              <div className="mt-2 flex items-center gap-4">
                <div className="h-20 w-20 overflow-hidden rounded-md border border-[#D2B48C] bg-[#F0EAD6]">
                  {formData.imageUrl ? (
                    <img src={formData.imageUrl} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[11px] text-[#6B5344]">
                      No image
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-[#6B5344]">Upload a square image to see preview.</p>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-[#6B5344]">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="border-[#D2B48C]"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowNewForm(false);
                resetForm();
              }}
              className="border-[#C41E3A] text-[#C41E3A]"
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              className="bg-[#228B22] hover:bg-[#1a6b1a] text-white"
            >
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
          </div>
        </Card>
      )}

      {gallery.length === 0 ? (
        <Card className="p-10 bg-white border-2 border-[#D2B48C] text-center text-[#6B5344]">
          No gallery items yet.
        </Card>
      ) : (
        <div className="grid gap-4">
          {gallery.map((item) => {
            const isEditing = editingId === item.id;
            return (
              <Card key={item.id} className="p-6 bg-white border-2 border-[#D2B48C]">
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-[#6B5344]">Title *</label>
                      <Input
                        value={editData.title || ''}
                        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                        className="border-[#D2B48C]"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#6B5344]">Category *</label>
                      <Select
                        value={editData.category || item.category}
                        onValueChange={(value) => setEditData({ ...editData, category: value as GalleryItem['category'] })}
                      >
                        <SelectTrigger className="border-[#D2B48C]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs text-[#6B5344]">Image Upload *</label>
                      <Input
                        type="file"
                        accept="image/png,image/jpeg"
                        onChange={(e) => handleEditImageFile(e.target.files?.[0] || null)}
                        className="border-[#D2B48C] bg-white"
                      />
                      <p className="mt-2 text-[11px] text-[#6B5344]">Square 1:1, 250-2048px. PNG or JPG. Max 1.5MB.</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs text-[#6B5344]">Image Preview</label>
                      <div className="mt-2 flex items-center gap-4">
                        <div className="h-20 w-20 overflow-hidden rounded-md border border-[#D2B48C] bg-[#F0EAD6]">
                          {(editData.imageUrl || item.imageUrl) ? (
                            <img
                              src={editData.imageUrl || item.imageUrl}
                              alt="Preview"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[11px] text-[#6B5344]">
                              No image
                            </div>
                          )}
                        </div>
                        <p className="text-[11px] text-[#6B5344]">Upload a square image to replace.</p>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs text-[#6B5344]">Description</label>
                      <Textarea
                        value={editData.description || ''}
                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                        rows={3}
                        className="border-[#D2B48C]"
                      />
                    </div>
                    <div className="md:col-span-2 flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingId(null);
                          setEditData({});
                        }}
                        className="border-[#C41E3A] text-[#C41E3A]"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSave(item.id)}
                        className="bg-[#228B22] hover:bg-[#1a6b1a] text-white"
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-48 h-36 bg-[#F0EAD6] overflow-hidden rounded-lg">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl text-[#3D2817] mb-2">{item.title}</h3>
                      <p className="text-sm text-[#6B5344] mb-2">{item.description || 'No description'}</p>
                      <p className="text-xs text-[#6B5344]">Category: {item.category}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(item)}
                        className="border-[#8B4513] text-[#8B4513] hover:bg-[#8B4513] hover:text-white"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(item.id)}
                        className="border-[#C41E3A] text-[#C41E3A] hover:bg-[#C41E3A] hover:text-white"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
