import { useState } from 'react';
import { Megaphone, Plus, Edit, Save, X, Trash2, Calendar, User } from 'lucide-react';
import { useApp, Announcement } from '../../context/AppContext';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { toast } from 'sonner';

export function AnnouncementManagement() {
  const { announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement } = useApp();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: 'Admin'
  });
  const [editData, setEditData] = useState<Partial<Announcement>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddAnnouncement = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await addAnnouncement({
        title: formData.title,
        content: formData.content,
        author: formData.author
      });
      setFormData({ title: '', content: '', author: 'Admin' });
      setShowNewForm(false);
      toast.success('Announcement published successfully!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to publish announcement');
    }
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    setEditingId(announcement.id);
    setEditData({
      title: announcement.title,
      content: announcement.content
    });
  };

  const handleSaveEdit = async (id: string) => {
    if (!editData.title?.trim() || !editData.content?.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await updateAnnouncement(id, editData);
      setEditingId(null);
      setEditData({});
      toast.success('Announcement updated successfully!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update announcement');
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (confirm('Are you sure you want to delete this announcement?')) {
      try {
        await deleteAnnouncement(id);
        toast.success('Announcement deleted successfully!');
      } catch (err: any) {
        toast.error(err?.message || 'Failed to delete announcement');
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl text-[#3D2817] flex items-center gap-2">
          <Megaphone className="h-8 w-8 text-[#C41E3A]" />
          Announcement Management
        </h2>
        <Dialog open={showNewForm} onOpenChange={setShowNewForm}>
          <DialogTrigger asChild>
            <Button className="bg-[#C41E3A] hover:bg-[#FF6B6B] text-white">
              <Plus className="h-4 w-4 mr-2" />
              Publish New Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl text-[#3D2817]">Publish New Announcement</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#3D2817] mb-2">
                  Title *
                </label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter announcement title"
                  className="border-[#D2B48C] focus:border-[#FFD700]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#3D2817] mb-2">
                  Content *
                </label>
                <Textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Enter announcement content"
                  rows={6}
                  className="border-[#D2B48C] focus:border-[#FFD700]"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button
                  onClick={() => setShowNewForm(false)}
                  variant="outline"
                  className="border-[#D2B48C] text-[#3D2817]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddAnnouncement}
                  className="bg-[#C41E3A] hover:bg-[#FF6B6B] text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Publish
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <Card className="p-8 bg-white border-2 border-[#D2B48C] text-center">
            <Megaphone className="h-16 w-16 text-[#D2B48C] mx-auto mb-4" />
            <p className="text-[#6B5344]">No announcements yet. Create one now!</p>
          </Card>
        ) : (
          announcements.map(announcement => {
            const isEditing = editingId === announcement.id;
            const { date, time } = formatDate(announcement.createdAt);

            return (
              <Card key={announcement.id} className="p-6 bg-white border-2 border-[#D2B48C]">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-[#6B5344] font-semibold">Title</label>
                      <Input
                        name="title"
                        value={editData.title || ''}
                        onChange={handleEditInputChange}
                        className="border-[#D2B48C] mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#6B5344] font-semibold">Content</label>
                      <Textarea
                        name="content"
                        value={editData.content || ''}
                        onChange={handleEditInputChange}
                        rows={4}
                        className="border-[#D2B48C] mt-1"
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
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
                        onClick={() => handleSaveEdit(announcement.id)}
                        className="bg-[#C41E3A] hover:bg-[#FF6B6B] text-white"
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-[#3D2817] mb-2">{announcement.title}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-[#6B5344]">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4 text-[#C41E3A]" />
                          <span>{announcement.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-[#C41E3A]" />
                          <span>{date} at {time}</span>
                        </div>
                        {announcement.updatedAt && (
                          <span className="text-xs text-[#8B5A3C] italic">
                            Updated: {formatDate(announcement.updatedAt).date}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="bg-[#F0EAD6] p-4 rounded-lg mb-4 text-[#6B5344] whitespace-pre-wrap text-sm">
                      {announcement.content}
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditAnnouncement(announcement)}
                        className="border-[#8B4513] text-[#8B4513] hover:bg-[#8B4513] hover:text-white"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDeleteAnnouncement(announcement.id)}
                        className="bg-[#C41E3A] hover:bg-[#FF6B6B] text-white"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
