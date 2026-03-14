'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from '@/lib/i18n';
import { HelpCircle, Send, Bug, Lightbulb, Link2, CreditCard, MessageSquare, Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui';
import { FormField, Input, Select, Textarea } from '@/components/ui/FormField';
import { PageHeader } from '@/components/dashboard';
import { useToast } from '@/components/ui/Toast';
import { supportTicketSchema, type SupportTicketInput } from '@/lib/validation/schemas';
import { sanitizeInput } from '@/lib/security';

type SupportCategory = 'bug' | 'feature' | 'account' | 'billing' | 'other';

type SupportTicket = {
  id: string;
  createdAt: string;
  category: SupportCategory;
  title: string;
  message: string;
  status: 'new' | 'triaged' | 'replied';
};

function categoryLabel(c: SupportCategory, t: any) {
  if (c === 'bug') return t('category_bug');
  if (c === 'feature') return t('category_feature');
  if (c === 'account') return t('category_account');
  if (c === 'billing') return t('category_billing');
  return t('category_other');
}

function categoryIcon(c: SupportCategory) {
  if (c === 'bug') return Bug;
  if (c === 'feature') return Lightbulb;
  if (c === 'account') return Link2;
  if (c === 'billing') return CreditCard;
  return MessageSquare;
}

function categoryHint(c: SupportCategory, t: any) {
  if (c === 'bug') return t('hint_bug');
  if (c === 'feature') return t('hint_feature');
  if (c === 'account') return t('hint_account');
  if (c === 'billing') return t('hint_billing');
  return t('hint_other');
}

function normalizeCategory(input: string | null): SupportCategory {
  if (input === 'bug' || input === 'feature' || input === 'account' || input === 'billing' || input === 'other') return input;
  return 'bug';
}

export default function SupportPage() {
  const t = useTranslations('support');
  const searchParams = useSearchParams();
  const prefillCategory = normalizeCategory(searchParams.get('category'));
  const toast = useToast();

  const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' || !process.env.NEXT_PUBLIC_API_URL;

  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm<SupportTicketInput>({
    resolver: zodResolver(supportTicketSchema),
    defaultValues: {
      category: prefillCategory,
      subject: '',
      message: '',
    },
  });

  const category = watch('category');
  const placeholder = useMemo(() => categoryHint(category, t), [category, t]);
  const CategoryIcon = categoryIcon(category);

  const onSubmit = async (data: SupportTicketInput) => {
    // Sanitize input to prevent XSS
    const sanitizedData = {
      category: data.category,
      subject: sanitizeInput(data.subject),
      message: sanitizeInput(data.message),
    };
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newTicket: SupportTicket = {
      id: `ticket_${Date.now()}`,
      createdAt: new Date().toISOString(),
      category: sanitizedData.category,
      title: sanitizedData.subject,
      message: sanitizedData.message,
      status: 'new',
    };
    
    setTickets(prev => [newTicket, ...prev]);
    toast.success(t('success_message'));
    
    // Reset form
    reset();
  };

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title={t('title')}
        description={t('description')}
      />

      {useMockData && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">{t('mock_notice_label')}</span> {t('mock_notice_text')}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              label={t('category')}
              error={errors.category}
              required
              hint={categoryHint(category, t)}
            >
              <Select {...register('category')} error={!!errors.category}>
                <option value="bug">{t('category_bug')}</option>
                <option value="feature">{t('category_feature')}</option>
                <option value="account">{t('category_account')}</option>
                <option value="billing">{t('category_billing')}</option>
                <option value="other">{t('category_other')}</option>
              </Select>
            </FormField>

            <FormField
              label={t('subject')}
              error={errors.subject}
              required
            >
              <Input
                {...register('subject')}
                placeholder={t('subject_placeholder')}
                error={!!errors.subject}
              />
            </FormField>

            <FormField
              label={t('message')}
              error={errors.message}
              required
            >
              <Textarea
                {...register('message')}
                placeholder={placeholder}
                rows={5}
                error={!!errors.message}
              />
            </FormField>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-brand-primary text-brand-white border-2 border-brand-black rounded-[2px] font-bold hover:translate-x-[2px] hover:translate-y-[2px] transition-transform shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('sending')}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {t('send')}
                </>
              )}
            </button>
          </form>
        </Card>

        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">{t('previous_requests')}</h3>
          {tickets.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">{t('no_tickets')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => {
                const Icon = categoryIcon(ticket.category);
                return (
                  <div key={ticket.id} className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900 truncate">{ticket.title}</h4>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            {categoryLabel(ticket.category, t)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{ticket.message}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(ticket.createdAt).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
