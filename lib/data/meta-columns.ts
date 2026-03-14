/**
 * Meta Ads Column Configuration
 * Mirrors Meta Ads Manager column customization system
 * All metrics align with Meta Marketing API response fields
 */

export type MetricCategory = 'performance' | 'engagement' | 'conversion' | 'cost' | 'delivery' | 'video';

export interface ColumnDefinition {
  id: string;
  key: string;
  label: string;
  labelEn: string;
  category: MetricCategory;
  description: string;
  descriptionEn: string;
  format: 'currency' | 'number' | 'percent' | 'decimal' | 'text' | 'status';
  defaultVisible: boolean;
  sortable: boolean;
  width?: number;
  apiField?: string; // Meta API field mapping
}

export const METRIC_COLUMNS: ColumnDefinition[] = [
  // Performance Metrics
  {
    id: 'impressions',
    key: 'impressions',
    label: 'Gösterim',
    labelEn: 'Impressions',
    category: 'performance',
    description: 'Reklamlarınızın ekranda görüntülenme sayısı',
    descriptionEn: 'Number of times your ads were on screen',
    format: 'number',
    defaultVisible: true,
    sortable: true,
    apiField: 'impressions',
  },
  {
    id: 'reach',
    key: 'reach',
    label: 'Erişim',
    labelEn: 'Reach',
    category: 'performance',
    description: 'Reklamlarınızı en az bir kez gören benzersiz kullanıcı sayısı',
    descriptionEn: 'Number of unique users who saw your ads at least once',
    format: 'number',
    defaultVisible: false,
    sortable: true,
    apiField: 'reach',
  },
  {
    id: 'frequency',
    key: 'frequency',
    label: 'Sıklık',
    labelEn: 'Frequency',
    category: 'performance',
    description: 'Her kişinin reklamınızı ortalama görme sayısı',
    descriptionEn: 'Average number of times each person saw your ad',
    format: 'decimal',
    defaultVisible: false,
    sortable: true,
    apiField: 'frequency',
  },

  // Engagement Metrics
  {
    id: 'clicks',
    key: 'clicks',
    label: 'Tıklama',
    labelEn: 'Clicks',
    category: 'engagement',
    description: 'Reklamlarınıza yapılan toplam tıklama sayısı',
    descriptionEn: 'Total number of clicks on your ads',
    format: 'number',
    defaultVisible: true,
    sortable: true,
    apiField: 'clicks',
  },
  {
    id: 'ctr',
    key: 'ctr',
    label: 'CTR',
    labelEn: 'CTR',
    category: 'engagement',
    description: 'Tıklama oranı (Tıklama / Gösterim × 100)',
    descriptionEn: 'Click-through rate (Clicks / Impressions × 100)',
    format: 'percent',
    defaultVisible: true,
    sortable: true,
    apiField: 'ctr',
  },
  {
    id: 'link_clicks',
    key: 'linkClicks',
    label: 'Bağlantı Tıklamaları',
    labelEn: 'Link Clicks',
    category: 'engagement',
    description: 'Hedef URL\'ye yapılan tıklama sayısı',
    descriptionEn: 'Number of clicks to the destination URL',
    format: 'number',
    defaultVisible: false,
    sortable: true,
    apiField: 'actions.link_click',
  },
  {
    id: 'post_engagement',
    key: 'postEngagement',
    label: 'Gönderi Etkileşimi',
    labelEn: 'Post Engagement',
    category: 'engagement',
    description: 'Beğeni, yorum, paylaşım dahil toplam etkileşim',
    descriptionEn: 'Total engagement including likes, comments, shares',
    format: 'number',
    defaultVisible: false,
    sortable: true,
    apiField: 'actions.post_engagement',
  },

  // Cost Metrics
  {
    id: 'spend',
    key: 'spend',
    label: 'Harcama',
    labelEn: 'Spend',
    category: 'cost',
    description: 'Toplam harcanan bütçe',
    descriptionEn: 'Total amount spent',
    format: 'currency',
    defaultVisible: true,
    sortable: true,
    apiField: 'spend',
  },
  {
    id: 'cpc',
    key: 'cpc',
    label: 'CPC',
    labelEn: 'CPC',
    category: 'cost',
    description: 'Tıklama başına maliyet',
    descriptionEn: 'Cost per click',
    format: 'currency',
    defaultVisible: true,
    sortable: true,
    apiField: 'cpc',
  },
  {
    id: 'cpm',
    key: 'cpm',
    label: 'CPM',
    labelEn: 'CPM',
    category: 'cost',
    description: '1.000 gösterim başına maliyet',
    descriptionEn: 'Cost per 1,000 impressions',
    format: 'currency',
    defaultVisible: false,
    sortable: true,
    apiField: 'cpm',
  },
  {
    id: 'cost_per_result',
    key: 'costPerResult',
    label: 'Sonuç Başına Maliyet',
    labelEn: 'Cost per Result',
    category: 'cost',
    description: 'Optimizasyon hedefine göre sonuç başına maliyet',
    descriptionEn: 'Cost per result based on optimization goal',
    format: 'currency',
    defaultVisible: false,
    sortable: true,
    apiField: 'cost_per_action_type',
  },

  // Conversion Metrics
  {
    id: 'conversions',
    key: 'conversions',
    label: 'Dönüşüm',
    labelEn: 'Conversions',
    category: 'conversion',
    description: 'Toplam dönüşüm sayısı',
    descriptionEn: 'Total number of conversions',
    format: 'number',
    defaultVisible: true,
    sortable: true,
    apiField: 'actions.purchase',
  },
  {
    id: 'conversion_value',
    key: 'conversionValue',
    label: 'Dönüşüm Değeri',
    labelEn: 'Conversion Value',
    category: 'conversion',
    description: 'Dönüşümlerden elde edilen toplam değer',
    descriptionEn: 'Total value from conversions',
    format: 'currency',
    defaultVisible: false,
    sortable: true,
    apiField: 'action_values.purchase',
  },
  {
    id: 'roas',
    key: 'roas',
    label: 'ROAS',
    labelEn: 'ROAS',
    category: 'conversion',
    description: 'Reklam harcaması getirisi (Dönüşüm Değeri / Harcama)',
    descriptionEn: 'Return on ad spend (Conversion Value / Spend)',
    format: 'decimal',
    defaultVisible: true,
    sortable: true,
    apiField: 'purchase_roas',
  },
  {
    id: 'add_to_cart',
    key: 'addToCart',
    label: 'Sepete Ekle',
    labelEn: 'Add to Cart',
    category: 'conversion',
    description: 'Sepete ekleme sayısı',
    descriptionEn: 'Number of add to cart actions',
    format: 'number',
    defaultVisible: false,
    sortable: true,
    apiField: 'actions.add_to_cart',
  },
  {
    id: 'initiate_checkout',
    key: 'initiateCheckout',
    label: 'Ödemeye Başla',
    labelEn: 'Initiate Checkout',
    category: 'conversion',
    description: 'Ödeme sayfasına geçiş sayısı',
    descriptionEn: 'Number of checkout initiations',
    format: 'number',
    defaultVisible: false,
    sortable: true,
    apiField: 'actions.initiate_checkout',
  },

  // Delivery Metrics
  {
    id: 'delivery_status',
    key: 'deliveryStatus',
    label: 'Dağıtım Durumu',
    labelEn: 'Delivery Status',
    category: 'delivery',
    description: 'Reklam dağıtım durumu',
    descriptionEn: 'Ad delivery status',
    format: 'text',
    defaultVisible: false,
    sortable: false,
    apiField: 'effective_status',
  },
  {
    id: 'quality_ranking',
    key: 'qualityRanking',
    label: 'Kalite Sıralaması',
    labelEn: 'Quality Ranking',
    category: 'delivery',
    description: 'Rakiplere göre algılanan kalite sıralaması',
    descriptionEn: 'Perceived quality ranking compared to competitors',
    format: 'text',
    defaultVisible: false,
    sortable: false,
    apiField: 'quality_ranking',
  },
  {
    id: 'engagement_ranking',
    key: 'engagementRanking',
    label: 'Etkileşim Sıralaması',
    labelEn: 'Engagement Ranking',
    category: 'delivery',
    description: 'Beklenen etkileşim oranı sıralaması',
    descriptionEn: 'Expected engagement rate ranking',
    format: 'text',
    defaultVisible: false,
    sortable: false,
    apiField: 'engagement_rate_ranking',
  },
  {
    id: 'conversion_ranking',
    key: 'conversionRanking',
    label: 'Dönüşüm Sıralaması',
    labelEn: 'Conversion Ranking',
    category: 'delivery',
    description: 'Beklenen dönüşüm oranı sıralaması',
    descriptionEn: 'Expected conversion rate ranking',
    format: 'text',
    defaultVisible: false,
    sortable: false,
    apiField: 'conversion_rate_ranking',
  },

  // Video Metrics
  {
    id: 'video_views',
    key: 'videoViews',
    label: 'Video Görüntüleme',
    labelEn: 'Video Views',
    category: 'video',
    description: '3 saniye veya daha fazla izlenen video sayısı',
    descriptionEn: 'Number of videos watched for 3 seconds or more',
    format: 'number',
    defaultVisible: false,
    sortable: true,
    apiField: 'video_p25_watched_actions',
  },
  {
    id: 'video_thruplay',
    key: 'videoThruplay',
    label: 'ThruPlay',
    labelEn: 'ThruPlay',
    category: 'video',
    description: '15 saniye veya tamamı izlenen video sayısı',
    descriptionEn: 'Videos watched for 15 seconds or to completion',
    format: 'number',
    defaultVisible: false,
    sortable: true,
    apiField: 'video_thruplay_watched_actions',
  },
  {
    id: 'video_avg_play_time',
    key: 'videoAvgPlayTime',
    label: 'Ort. İzleme Süresi',
    labelEn: 'Avg. Watch Time',
    category: 'video',
    description: 'Ortalama video izleme süresi (saniye)',
    descriptionEn: 'Average video watch time in seconds',
    format: 'decimal',
    defaultVisible: false,
    sortable: true,
    apiField: 'video_avg_time_watched_actions',
  },
];

// Fixed columns that are always visible
export const FIXED_COLUMNS: ColumnDefinition[] = [
  {
    id: 'name',
    key: 'name',
    label: 'Reklam Adı',
    labelEn: 'Ad Name',
    category: 'performance',
    description: 'Reklam adı ve hiyerarşi bilgisi',
    descriptionEn: 'Ad name and hierarchy information',
    format: 'text',
    defaultVisible: true,
    sortable: true,
    width: 280,
  },
  {
    id: 'status',
    key: 'status',
    label: 'Durum',
    labelEn: 'Status',
    category: 'delivery',
    description: 'Reklamın aktif/pasif durumu',
    descriptionEn: 'Active/paused status of the ad',
    format: 'status',
    defaultVisible: true,
    sortable: false,
    width: 100,
  },
];

// Column presets (like Meta Ads Manager)
export interface ColumnPreset {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  columns: string[];
}

export const COLUMN_PRESETS: ColumnPreset[] = [
  {
    id: 'performance',
    name: 'Performans',
    nameEn: 'Performance',
    description: 'Temel performans metrikleri',
    descriptionEn: 'Basic performance metrics',
    columns: ['impressions', 'reach', 'clicks', 'ctr', 'spend', 'cpc'],
  },
  {
    id: 'engagement',
    name: 'Etkileşim',
    nameEn: 'Engagement',
    description: 'Kullanıcı etkileşim metrikleri',
    descriptionEn: 'User engagement metrics',
    columns: ['impressions', 'clicks', 'ctr', 'link_clicks', 'post_engagement', 'spend'],
  },
  {
    id: 'conversions',
    name: 'Dönüşüm',
    nameEn: 'Conversions',
    description: 'Dönüşüm odaklı metrikler',
    descriptionEn: 'Conversion focused metrics',
    columns: ['spend', 'conversions', 'conversion_value', 'roas', 'add_to_cart', 'initiate_checkout'],
  },
  {
    id: 'video',
    name: 'Video',
    nameEn: 'Video',
    description: 'Video performans metrikleri',
    descriptionEn: 'Video performance metrics',
    columns: ['impressions', 'video_views', 'video_thruplay', 'video_avg_play_time', 'spend', 'cpm'],
  },
  {
    id: 'delivery',
    name: 'Dağıtım',
    nameEn: 'Delivery',
    description: 'Dağıtım ve kalite metrikleri',
    descriptionEn: 'Delivery and quality metrics',
    columns: ['impressions', 'reach', 'frequency', 'quality_ranking', 'engagement_ranking', 'conversion_ranking'],
  },
];

// Default visible columns
export const DEFAULT_VISIBLE_COLUMNS = METRIC_COLUMNS
  .filter(col => col.defaultVisible)
  .map(col => col.id);

// Get columns by category
export const getColumnsByCategory = (category: MetricCategory): ColumnDefinition[] => {
  return METRIC_COLUMNS.filter(col => col.category === category);
};

// Get column by id
export const getColumnById = (id: string): ColumnDefinition | undefined => {
  return [...FIXED_COLUMNS, ...METRIC_COLUMNS].find(col => col.id === id);
};

// Format value based on column format
export const formatColumnValue = (
  value: number | string | null | undefined,
  format: ColumnDefinition['format'],
  locale: 'tr' | 'en' = 'tr'
): string => {
  if (value === null || value === undefined) return '-';
  
  switch (format) {
    case 'currency':
      return locale === 'tr' 
        ? `₺${Number(value).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case 'number':
      return Number(value).toLocaleString(locale === 'tr' ? 'tr-TR' : 'en-US');
    case 'percent':
      return `%${Number(value).toFixed(2)}`;
    case 'decimal':
      return Number(value).toFixed(2);
    case 'status':
    case 'text':
    default:
      return String(value);
  }
};

// Category labels
export const CATEGORY_LABELS: Record<MetricCategory, { tr: string; en: string }> = {
  performance: { tr: 'Performans', en: 'Performance' },
  engagement: { tr: 'Etkileşim', en: 'Engagement' },
  conversion: { tr: 'Dönüşüm', en: 'Conversion' },
  cost: { tr: 'Maliyet', en: 'Cost' },
  delivery: { tr: 'Dağıtım', en: 'Delivery' },
  video: { tr: 'Video', en: 'Video' },
};
