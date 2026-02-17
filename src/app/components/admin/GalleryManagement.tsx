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
  const { gallery, loadGallery, addGalleryItem, updateGalleryItem, deleteGalleryItem, uploadGalleryImage, language } = useApp();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'facilities' as GalleryItem['category']
  });
  const [editData, setEditData] = useState<Partial<GalleryItem>>({});
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState('');
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadGallery();
  }, []);

  const resetForm = () => {
    setFormData({ title: '', description: '', category: 'facilities' });
    setNewImageFile(null);
    setNewImagePreview('');
  };

  const pickImage = (file: File | null, onFile: (f: File | null) => void, onPreview: (url: string) => void) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      return;
    }
    onFile(file);
    onPreview(URL.createObjectURL(file));
  };

  const handleAdd = async () => {
    if (!formData.title.trim() || !newImageFile) {
      toast.error('Please provide a title and image file');
      return;
    }

    setIsUploading(true);
    try {
      const imageUrl = await uploadGalleryImage(newImageFile);
      await addGalleryItem({ ...formData, imageUrl });
      resetForm();
      setShowNewForm(false);
      toast.success('Gallery item added');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add gallery item');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (item: GalleryItem) => {
    setEditingId(item.id);
    setEditData(item);
    setEditImageFile(null);
    setEditImagePreview(item.imageUrl);
  };

  const handleSave = async (id: string) => {
    if (!editData.title?.trim()) {
      toast.error('Title is required');
      return;
    }

    setIsUploading(true);
    try {
      let imageUrl = editData.imageUrl;
      if (editImageFile) {
        imageUrl = await uploadGalleryImage(editImageFile);
      }
      await updateGalleryItem(id, { ...editData, imageUrl });
      setEditingId(null);
      setEditData({});
      setEditImageFile(null);
      setEditImagePreview('');
      toast.success('Gallery item updated');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update gallery item');
    } finally {
      setIsUploading(false);
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
      <p className="text-sm text-[#6B5344]">
        Editing gallery translations for: <span className="font-semibold uppercase">{language}</span>
      </p>
      <div className="flex items-center justify-between">
        <h2 className="text-3xl text-[#3D2817]">Gallery Management</h2>
        <Button onClick={() => setShowNewForm(true)} className="bg-[#C41E3A] hover:bg-[#FF6B6B] text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Photo
        </Button>
      </div>

      {showNewForm && (
        <Card className="p-6 bg-white border-2 border-[#D2B48C]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#6B5344]">Title *</label>
              <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="border-[#D2B48C]" />
            </div>
            <div>
              <label className="text-xs text-[#6B5344]">Category *</label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value as GalleryItem['category'] })}>
                <SelectTrigger className="border-[#D2B48C]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((category) => <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-[#6B5344]">Image File *</label>
              <Input type="file" accept="image/*" onChange={(e) => pickImage(e.target.files?.[0] || null, setNewImageFile, setNewImagePreview)} className="border-[#D2B48C] bg-white" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-[#6B5344]">Description</label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="border-[#D2B48C]" />
            </div>
          </div>
          {newImagePreview && <img src={newImagePreview} alt="Preview" className="mt-4 h-24 w-24 rounded-md object-cover border border-[#D2B48C]" />}
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="outline" onClick={() => { setShowNewForm(false); resetForm(); }} className="border-[#C41E3A] text-[#C41E3A]">
              <X className="h-4 w-4 mr-1" />Cancel
            </Button>
            <Button onClick={handleAdd} disabled={isUploading} className="bg-[#228B22] hover:bg-[#1a6b1a] text-white">
              <Save className="h-4 w-4 mr-1" />{isUploading ? 'Uploading...' : 'Save'}
            </Button>
          </div>
        </Card>
      )}

      {gallery.length === 0 ? (
        <Card className="p-10 bg-white border-2 border-[#D2B48C] text-center text-[#6B5344]">No gallery items yet.</Card>
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
                      <Input value={editData.title || ''} onChange={(e) => setEditData({ ...editData, title: e.target.value })} className="border-[#D2B48C]" />
                    </div>
                    <div>
                      <label className="text-xs text-[#6B5344]">Category *</label>
                      <Select value={editData.category || item.category} onValueChange={(value) => setEditData({ ...editData, category: value as GalleryItem['category'] })}>
                        <SelectTrigger className="border-[#D2B48C]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs text-[#6B5344]">Replace Image (optional)</label>
                      <Input type="file" accept="image/*" onChange={(e) => pickImage(e.target.files?.[0] || null, setEditImageFile, setEditImagePreview)} className="border-[#D2B48C] bg-white" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs text-[#6B5344]">Description</label>
                      <Textarea value={editData.description || ''} onChange={(e) => setEditData({ ...editData, description: e.target.value })} rows={3} className="border-[#D2B48C]" />
                    </div>
                    {editImagePreview && <img src={editImagePreview} alt="Preview" className="h-24 w-24 rounded-md object-cover border border-[#D2B48C]" />}
                    <div className="md:col-span-2 flex gap-2 justify-end">
                      <Button size="sm" variant="outline" onClick={() => { setEditingId(null); setEditData({}); setEditImageFile(null); setEditImagePreview(''); }} className="border-[#C41E3A] text-[#C41E3A]">
                        <X className="h-4 w-4 mr-1" />Cancel
                      </Button>
                      <Button size="sm" onClick={() => handleSave(item.id)} disabled={isUploading} className="bg-[#228B22] hover:bg-[#1a6b1a] text-white">
                        <Save className="h-4 w-4 mr-1" />{isUploading ? 'Uploading...' : 'Save'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-48 h-36 bg-[#F0EAD6] overflow-hidden rounded-lg">
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl text-[#3D2817] mb-2">{item.title}</h3>
                      <p className="text-sm text-[#6B5344] mb-2">{item.description || 'No description'}</p>
                      <p className="text-xs text-[#6B5344]">Category: {item.category}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(item)} className="border-[#8B4513] text-[#8B4513] hover:bg-[#8B4513] hover:text-white">
                        <Edit className="h-4 w-4 mr-1" />Edit
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(item.id)} className="border-[#C41E3A] text-[#C41E3A] hover:bg-[#C41E3A] hover:text-white">
                        <Trash2 className="h-4 w-4 mr-1" />Delete
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
