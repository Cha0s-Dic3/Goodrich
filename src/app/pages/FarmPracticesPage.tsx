import { Sun, Wind, Leaf, Droplets, Heart, ShieldCheck } from 'lucide-react';
import { Card } from '../components/ui/card';
import { useI18n } from '../hooks/useI18n';

export function FarmPracticesPage() {
  const { t, list } = useI18n();

  return (
    <div className="min-h-screen">
      <section className="py-20 bg-gradient-to-br from-[#228B22] to-[#8B4513]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl mb-6 text-[#FFFDD0]">{t('farmPractices.heroTitle')}</h1>
            <p className="text-xl text-[#FAF3E0] leading-relaxed">{t('farmPractices.heroDescription')}</p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#FFFDD0]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <Heart className="h-12 w-12 text-[#C41E3A]" />
              <h2 className="text-4xl text-[#3D2817]">{t('farmPractices.animalWelfareTitle')}</h2>
            </div>

            <p className="text-lg text-[#3D2817] leading-relaxed mb-8">{t('farmPractices.animalWelfareIntro')}</p>

            <div className="space-y-8">
              <Card className="p-8 bg-white border-2 border-[#228B22]">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#228B22] rounded-full flex items-center justify-center flex-shrink-0">
                    <Sun className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl mb-3 text-[#3D2817]">{t('farmPractices.freeRangeTitle')}</h3>
                    <p className="text-[#3D2817] leading-relaxed">{t('farmPractices.freeRangeDescription')}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-8 bg-white border-2 border-[#228B22]">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#228B22] rounded-full flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl mb-3 text-[#3D2817]">{t('farmPractices.coopTitle')}</h3>
                    <ul className="space-y-2 text-[#3D2817] list-disc pl-5">
                      {list('farmPractices.coopList').map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>

              <Card className="p-8 bg-white border-2 border-[#228B22]">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#228B22] rounded-full flex items-center justify-center flex-shrink-0">
                    <Wind className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl mb-3 text-[#3D2817]">{t('farmPractices.ventilationTitle')}</h3>
                    <p className="text-[#3D2817] mb-3">{t('farmPractices.ventilationLead')}</p>
                    <ul className="space-y-2 text-[#3D2817] list-disc pl-5">
                      {list('farmPractices.ventilationList').map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#F0EAD6]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <Leaf className="h-12 w-12 text-[#228B22]" />
              <h2 className="text-4xl text-[#3D2817]">{t('farmPractices.nutritionTitle')}</h2>
            </div>

            <p className="text-lg text-[#3D2817] leading-relaxed mb-8">{t('farmPractices.nutritionIntro')}</p>

            <div className="space-y-8">
              <Card className="p-8 bg-white border-2 border-[#D2691E]">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#D2691E] rounded-full flex items-center justify-center flex-shrink-0">
                    <Leaf className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl mb-3 text-[#3D2817]">{t('farmPractices.nonGmoTitle')}</h3>
                    <p className="text-[#3D2817] leading-relaxed">{t('farmPractices.nonGmoDescription')}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-8 bg-white border-2 border-[#D2691E]">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#D2691E] rounded-full flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl mb-3 text-[#3D2817]">{t('farmPractices.noAntibioticsTitle')}</h3>
                    <ul className="space-y-2 text-[#3D2817] list-disc pl-5">
                      {list('farmPractices.noAntibioticsList').map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>

              <Card className="p-8 bg-white border-2 border-[#D2691E]">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#D2691E] rounded-full flex items-center justify-center flex-shrink-0">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl mb-3 text-[#3D2817]">{t('farmPractices.supplementsTitle')}</h3>
                    <p className="text-[#3D2817] mb-3">{t('farmPractices.supplementsLead')}</p>
                    <ul className="space-y-2 text-[#3D2817] list-disc pl-5">
                      {list('farmPractices.supplementsList').map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#FFFDD0]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <Leaf className="h-12 w-12 text-[#228B22]" />
              <h2 className="text-4xl text-[#3D2817]">{t('farmPractices.sustainabilityTitle')}</h2>
            </div>

            <p className="text-lg text-[#3D2817] leading-relaxed mb-8">{t('farmPractices.sustainabilityIntro')}</p>

            <div className="space-y-8">
              <Card className="p-8 bg-white border-2 border-[#228B22]">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#228B22] rounded-full flex items-center justify-center flex-shrink-0">
                    <Leaf className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl mb-3 text-[#3D2817]">{t('farmPractices.wasteTitle')}</h3>
                    <ul className="space-y-2 text-[#3D2817] list-disc pl-5">
                      {list('farmPractices.wasteList').map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>

              <Card className="p-8 bg-white border-2 border-[#228B22]">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#228B22] rounded-full flex items-center justify-center flex-shrink-0">
                    <Droplets className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl mb-3 text-[#3D2817]">{t('farmPractices.waterTitle')}</h3>
                    <ul className="space-y-2 text-[#3D2817] list-disc pl-5">
                      {list('farmPractices.waterList').map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-[#228B22] to-[#8B4513]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl mb-6 text-[#FFFDD0]">{t('farmPractices.ctaTitle')}</h2>
            <p className="text-xl text-[#FAF3E0] mb-8">{t('farmPractices.ctaDescription')}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 bg-white/10 backdrop-blur-sm border-2 border-[#FFFDD0]">
                <div className="text-3xl mb-2 text-[#FFD700]">5,000</div>
                <div className="text-[#FFFDD0]">{t('farmPractices.stats.chickens')}</div>
              </Card>
              <Card className="p-6 bg-white/10 backdrop-blur-sm border-2 border-[#FFFDD0]">
                <div className="text-3xl mb-2 text-[#FFD700]">100%</div>
                <div className="text-[#FFFDD0]">{t('farmPractices.stats.freeRange')}</div>
              </Card>
              <Card className="p-6 bg-white/10 backdrop-blur-sm border-2 border-[#FFFDD0]">
                <div className="text-3xl mb-2 text-[#FFD700]">0</div>
                <div className="text-[#FFFDD0]">{t('farmPractices.stats.antibiotics')}</div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

