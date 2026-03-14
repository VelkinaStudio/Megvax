import { KpiMetric } from '@/types/dashboard';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from '@/components/ui';

interface KpiCardProps {
  metric: KpiMetric;
}

export function KpiCard({ metric }: KpiCardProps) {
  const isUp = metric.status === 'up';
  const isDown = metric.status === 'down';

  return (
    <Card 
      variant="default" 
      padding="lg" 
      className="group relative flex flex-col justify-between min-h-[140px] overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-blue-200"
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-blue-50/0 group-hover:from-blue-50/50 group-hover:to-blue-100/30 transition-all duration-300 pointer-events-none" />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider group-hover:text-blue-600 transition-colors">
            {metric.label}
          </p>
          <div className={`w-2 h-2 rounded-full ${
            isUp ? 'bg-emerald-500' : isDown ? 'bg-red-500' : 'bg-gray-400'
          } group-hover:scale-125 transition-transform`} />
        </div>
        <h3 className="text-4xl font-bold text-gray-900 tabular-nums group-hover:text-blue-600 transition-colors">
          {metric.value}
        </h3>
      </div>
      
      <div className="relative flex items-center justify-between mt-4 pt-4 border-t border-gray-200 group-hover:border-blue-200 transition-colors">
        <span className="text-xs font-medium text-gray-600 truncate max-w-[60%] group-hover:text-gray-700">
          {metric.description}
        </span>
        
        <div className={`
          flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all duration-200
          ${isUp ? 'bg-emerald-100 text-emerald-700 group-hover:bg-emerald-200 group-hover:shadow-lg group-hover:shadow-emerald-200/50' : ''}
          ${isDown ? 'bg-red-100 text-red-700 group-hover:bg-red-200 group-hover:shadow-lg group-hover:shadow-red-200/50' : ''}
          ${metric.status === 'neutral' ? 'bg-gray-100 text-gray-600 group-hover:bg-gray-200' : ''}
        `}>
          {isUp && <TrendingUp className="w-3.5 h-3.5 animate-pulse" />}
          {isDown && <TrendingDown className="w-3.5 h-3.5 animate-pulse" />}
          {metric.status === 'neutral' && <Minus className="w-3.5 h-3.5" />}
          <span className="tabular-nums">{metric.trend}</span>
        </div>
      </div>
    </Card>
  );
}
