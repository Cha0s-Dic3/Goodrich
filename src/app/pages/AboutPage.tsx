import { Target, Eye, Heart, Users, MapPin, TrendingUp } from 'lucide-react';
import { Card } from '../components/ui/card';
import { useI18n } from '../hooks/useI18n';

export function AboutPage() {
  const { t, list } = useI18n();

  return (
    <div className="min-h-screen">
      <section className="py-20 bg-gradient-to-br from-[#8B4513] to-[#A0522D]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl mb-6 text-[#FFFDD0]">{t('about.title')}</h1>
            <p className="text-xl text-[#FAF3E0] leading-relaxed">
              {t('about.subtitle')}
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#FFFDD0]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl mb-8 text-[#3D2817] text-center">{t('about.storyTitle')}</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-[#3D2817] leading-relaxed mb-6">{t('about.storyPara1')}</p>
              <p className="text-lg text-[#3D2817] leading-relaxed mb-6">{t('about.storyPara2')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#F0EAD6]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <Users className="h-12 w-12 text-[#C41E3A]" />
              <h2 className="text-4xl text-[#3D2817]">{t('about.whoTitle')}</h2>
            </div>
            <p className="text-lg text-[#3D2817] leading-relaxed mb-6">{t('about.whoPara1')}</p>
            <p className="text-lg text-[#3D2817] leading-relaxed">{t('about.whoPara2')}</p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#FFFDD0]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="p-8 bg-white border-2 border-[#C41E3A]">
              <div className="w-16 h-16 bg-[#C41E3A] rounded-full flex items-center justify-center mb-6">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl mb-4 text-[#3D2817]">{t('about.missionTitle')}</h3>
              <p className="text-[#3D2817] leading-relaxed">{t('about.missionDesc')}</p>
            </Card>

            <Card className="p-8 bg-white border-2 border-[#FFD700]">
              <div className="w-16 h-16 bg-[#FFD700] rounded-full flex items-center justify-center mb-6">
                <Eye className="h-8 w-8 text-[#3D2817]" />
              </div>
              <h3 className="text-2xl mb-4 text-[#3D2817]">{t('about.visionTitle')}</h3>
              <p className="text-[#3D2817] leading-relaxed">{t('about.visionDesc')}</p>
            </Card>

            <Card className="p-8 bg-white border-2 border-[#228B22]">
              <div className="w-16 h-16 bg-[#228B22] rounded-full flex items-center justify-center mb-6">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl mb-4 text-[#3D2817]">{t('about.valuesTitle')}</h3>
              <ul className="space-y-2 text-[#3D2817] list-disc pl-5">
                {list('about.valuesList').map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#F0EAD6]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <MapPin className="h-12 w-12 text-[#C41E3A]" />
              <h2 className="text-4xl text-[#3D2817]">{t('about.farmTitle')}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <Card className="p-6 bg-white border-2 border-[#D2B48C]">
                <h3 className="text-xl mb-4 text-[#3D2817]">{t('about.locationTitle')}</h3>
                <p className="text-[#3D2817]">
                  {t('about.locationLine1')}<br />
                  {t('about.locationLine2')}
                </p>
              </Card>

              <Card className="p-6 bg-white border-2 border-[#D2B48C]">
                <h3 className="text-xl mb-4 text-[#3D2817]">{t('about.capacityTitle')}</h3>
                <p className="text-[#3D2817]">{t('about.capacityDesc')}</p>
              </Card>
            </div>

            <p className="text-lg text-[#3D2817] leading-relaxed">{t('about.farmDesc')}</p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#FFFDD0]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <TrendingUp className="h-12 w-12 text-[#228B22]" />
              <h2 className="text-4xl text-[#3D2817]">{t('about.communityTitle')}</h2>
            </div>

            <p className="text-lg text-[#3D2817] leading-relaxed mb-6">{t('about.communityIntro')}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 bg-white border-2 border-[#228B22]">
                <h4 className="text-lg mb-2 text-[#3D2817]">{t('about.community.reliableTitle')}</h4>
                <p className="text-[#6B5344]">{t('about.community.reliableDesc')}</p>
              </Card>

              <Card className="p-6 bg-white border-2 border-[#228B22]">
                <h4 className="text-lg mb-2 text-[#3D2817]">{t('about.community.jobsTitle')}</h4>
                <p className="text-[#6B5344]">{t('about.community.jobsDesc')}</p>
              </Card>

              <Card className="p-6 bg-white border-2 border-[#228B22]">
                <h4 className="text-lg mb-2 text-[#3D2817]">{t('about.community.supportTitle')}</h4>
                <p className="text-[#6B5344]">{t('about.community.supportDesc')}</p>
              </Card>

              <Card className="p-6 bg-white border-2 border-[#228B22]">
                <h4 className="text-lg mb-2 text-[#3D2817]">{t('about.community.knowledgeTitle')}</h4>
                <p className="text-[#6B5344]">{t('about.community.knowledgeDesc')}</p>
              </Card>
            </div>

            <p className="text-lg text-[#3D2817] mt-8 text-center italic">{t('about.communityClosing')}</p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-[#8B4513] to-[#C41E3A]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl mb-6 text-[#FFFDD0]">{t('about.commitmentTitle')}</h2>
            <p className="text-2xl text-[#FAF3E0] italic">{t('about.commitmentDesc')}</p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#F0EAD6]">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white p-8 rounded-lg border-4 border-[#FFD700]">
              <h2 className="text-3xl mb-4 text-[#3D2817]">{t('about.founderTitle')}</h2>
              <div className="w-24 h-24 bg-[#8B4513] rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="h-12 w-12 text-[#FFFDD0]" />
              </div>
              <h3 className="text-2xl mb-2 text-[#C41E3A]">{t('about.founderName')}</h3>
              <p className="text-lg text-[#6B5344]">{t('about.founderRole')}</p>
              <p className="text-[#3D2817] mt-4">{t('about.founderDesc')}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

