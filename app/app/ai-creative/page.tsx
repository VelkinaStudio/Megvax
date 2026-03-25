'use client';

import { useState } from 'react';
import { Wand2, Image as ImageIcon, Type, Sparkles } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { useTranslations } from '@/lib/i18n';
import { PageHeader } from '@/components/dashboard';
import { Card, Button } from '@/components/ui';

export default function AiCreativePage() {
  const [prompt, setPrompt] = useState('');
  const toast = useToast();
  const t = useTranslations('ai_creative');

  const handleGenerate = () => {
    const value = prompt.trim();
    if (!value) return;
    toast.info(t('generating'));
    setPrompt('');
  };

  const styleOptions = [
    { key: 'style_minimal', fallback: 'Minimal' },
    { key: 'style_vibrant', fallback: 'Vibrant' },
    { key: 'style_professional', fallback: 'Professional' },
  ];

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title={t('title')}
        description={t('description')}
      />

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        
        {/* Generator Panel */}
        <Card className="p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
            <button className="flex-1 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg flex items-center justify-center gap-2">
              <ImageIcon className="w-4 h-4" /> {t('tab_image')}
            </button>
            <button className="flex-1 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center justify-center gap-2">
              <Type className="w-4 h-4" /> {t('tab_text')}
            </button>
          </div>

          <div className="space-y-4 flex-1">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('brand_product')}</label>
              <select className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Megvax Demo Inc.</option>
                <option>{t('add_new_brand')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('prompt_label')}</label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={t('prompt_placeholder')}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
              />
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('style')}</label>
               <div className="grid grid-cols-3 gap-2">
                 {styleOptions.map(style => (
                   <button key={style.key} className="py-2 px-3 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all">
                     {t(style.key)}
                   </button>
                 ))}
               </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!prompt.trim()}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
            >
              <Sparkles className="w-5 h-5" />
              {t('generate')}
            </button>
          </div>
        </Card>

        {/* Preview Area */}
        <Card className="lg:col-span-2 p-6 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-20 h-20 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('no_content_title')}</h3>
            <p className="text-gray-600 max-w-md">
              {t('no_content_desc')}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
