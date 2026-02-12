import { useEffect, useState } from 'react';
import { Mail, Phone, User, Trash2, CheckCircle } from 'lucide-react';
import { useApp, Message } from '../../context/AppContext';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

export function MessagesManagement() {
  const { messages, loadMessages, updateMessageStatus, deleteMessage } = useApp();
  const [workingId, setWorkingId] = useState<string | null>(null);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const handleMarkRead = async (message: Message) => {
    if (message.status === 'read') return;
    setWorkingId(message.id);
    try {
      await updateMessageStatus(message.id, 'read');
    } finally {
      setWorkingId(null);
    }
  };

  const handleDelete = async (messageId: string) => {
    if (!confirm('Delete this message?')) return;
    setWorkingId(messageId);
    try {
      await deleteMessage(messageId);
    } finally {
      setWorkingId(null);
    }
  };

  const statusBadge = (status: Message['status']) => {
    if (status === 'new') return 'bg-[#FFD700] text-[#3D2817]';
    if (status === 'read') return 'bg-[#228B22] text-white';
    return 'bg-[#A0522D] text-white';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl text-[#3D2817]">Messages</h2>
        <div className="text-sm text-[#6B5344]">{messages.length} total</div>
      </div>

      {messages.length === 0 ? (
        <Card className="p-10 bg-white border-2 border-[#D2B48C] text-center text-[#6B5344]">
          No messages yet.
        </Card>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <Card key={message.id} className="p-6 bg-white border-2 border-[#D2B48C]">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={statusBadge(message.status)}>{message.status}</Badge>
                    <span className="text-sm text-[#6B5344]">
                      {new Date(message.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <h3 className="text-xl text-[#3D2817] mb-3">{message.message}</h3>
                  <div className="grid gap-2 text-sm text-[#6B5344]">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {message.name}
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {message.email}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {message.phone}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleMarkRead(message)}
                    disabled={workingId === message.id || message.status === 'read'}
                    className="bg-[#228B22] hover:bg-[#1a6b1a] text-white"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Read
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(message.id)}
                    disabled={workingId === message.id}
                    className="border-[#C41E3A] text-[#C41E3A] hover:bg-[#C41E3A] hover:text-white"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
