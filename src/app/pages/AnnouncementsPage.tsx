import { Megaphone, Calendar, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useI18n } from '../hooks/useI18n';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

export function AnnouncementsPage() {
  const { announcements, setCurrentPage, language } = useApp();
  const { t } = useI18n();

  const localeMap = {
    en: 'en-US',
    rw: 'rw-RW',
    sw: 'sw-TZ',
    fr: 'fr-FR'
  } as const;
  const locale = localeMap[language];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' }),
      time: date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: true })
    };
  };

  return (
    <div className="min-h-screen bg-[#FFFDD0]">
      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-br from-[#8B4513] to-[#A0522D]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-[#FFFDD0] mb-2 flex items-center gap-3">
              <Megaphone className="h-10 w-10" />
              {t('announcements.title')}
            </h1>
            <p className="text-lg text-[#FAF3E0]">
              {t('announcements.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {announcements.length === 0 ? (
            <Card className="p-12 bg-white border-2 border-[#D2B48C] text-center">
              <Megaphone className="h-20 w-20 text-[#D2B48C] mx-auto mb-6" />
              <h2 className="text-3xl mb-2 text-[#3D2817]">{t('announcements.emptyTitle')}</h2>
              <p className="text-[#6B5344] mb-8">
                {t('announcements.emptyDesc')}
              </p>
            </Card>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {announcements.map(announcement => {
                const { date, time } = formatDate(announcement.createdAt);
                
                return (
                  <Card 
                    key={announcement.id} 
                    className="p-6 bg-white border-2 border-[#D2B48C] hover:border-[#FFD700] transition-all hover:shadow-lg"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4 pb-4 border-b border-[#D2B48C]">
                      <div>
                        <h2 className="text-2xl font-bold text-[#3D2817] mb-3">{announcement.title}</h2>
                        <div className="flex flex-wrap items-center gap-6 text-sm text-[#6B5344]">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-[#C41E3A]" />
                            <span><strong>{t('announcements.by')}:</strong> {announcement.author}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-[#C41E3A]" />
                            <span><strong>{t('announcements.date')}:</strong> {date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span><strong>{t('announcements.time')}:</strong> {time}</span>
                          </div>
                        </div>
                        {announcement.updatedAt && (
                          <p className="text-xs text-[#8B5A3C] mt-2 italic">
                            {t('announcements.lastUpdated')}: {new Date(announcement.updatedAt).toLocaleDateString(locale)} {t('announcements.at')} {new Date(announcement.updatedAt).toLocaleTimeString(locale)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="text-[#6B5344] leading-relaxed whitespace-pre-wrap bg-[#F0EAD6] p-4 rounded-lg">
                      {announcement.content}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Back to Home */}
          <div className="mt-12 text-center">
            <Button
              onClick={() => setCurrentPage('home')}
              className="bg-[#8B4513] hover:bg-[#A0522D] text-white"
              size="lg"
            >
              {t('announcements.backHome')}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
