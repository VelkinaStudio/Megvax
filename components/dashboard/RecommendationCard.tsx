'use client';

import { Sparkles, ArrowRight, TrendingUp } from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui';

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  impact: {
    metric: string;
    value: string;
  };
  priority: 'high' | 'medium' | 'low';
  affectedEntities?: number;
  category?: string;
}

interface RecommendationCardProps {
  recommendation: Recommendation;
  onApply?: (recommendation: Recommendation) => void;
  onView?: (recommendation: Recommendation) => void;
  onDismiss?: (recommendation: Recommendation) => void;
}

export function RecommendationCard({
  recommendation,
  onApply,
  onView,
  onDismiss: _onDismiss,
}: RecommendationCardProps) {
  const getPriorityVariant = () => {
    switch (recommendation.priority) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      default:
        return 'info';
    }
  };

  const getPriorityLabel = () => {
    switch (recommendation.priority) {
      case 'high':
        return 'High';
      case 'medium':
        return 'Medium';
      default:
        return 'Low';
    }
  };

  return (
    <Card variant="default" padding="lg" className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="p-2 bg-accent-highlight/10 rounded-lg flex-shrink-0">
            <Sparkles className="w-5 h-5 text-accent-highlight" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              {recommendation.title}
            </h3>
            {recommendation.category && (
              <p className="text-xs text-gray-500">{recommendation.category}</p>
            )}
          </div>
        </div>
        <Badge variant={getPriorityVariant()} size="sm">
          {getPriorityLabel()}
        </Badge>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-700 mb-4 line-clamp-3">
        {recommendation.description}
      </p>

      {/* Impact */}
      <div className="bg-accent-success/5 border border-accent-success/20 rounded-lg p-3 mb-4">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-4 h-4 text-accent-success" />
          <span className="text-xs font-medium text-gray-600">
            Tahmini Etki
          </span>
        </div>
        <p className="text-sm font-semibold text-gray-900">
          {recommendation.impact.metric}: {recommendation.impact.value}
        </p>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-gray-200">
        {recommendation.affectedEntities && (
          <p className="text-xs text-gray-600 mb-3">
            {recommendation.affectedEntities} entities will be affected
          </p>
        )}
        <div className="flex items-center gap-2">
          {onView && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(recommendation)}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
              className="flex-1"
            >
              Detay
            </Button>
          )}
          {onApply && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onApply(recommendation)}
              className="flex-1"
            >
              Uygula
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

interface RecommendationFeedProps {
  recommendations: Recommendation[];
  onApply?: (recommendation: Recommendation) => void;
  onView?: (recommendation: Recommendation) => void;
  onDismiss?: (recommendation: Recommendation) => void;
  loading?: boolean;
  limit?: number;
}

export function RecommendationFeed({
  recommendations,
  onApply,
  onView,
  onDismiss,
  loading = false,
  limit,
}: RecommendationFeedProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, idx) => (
          <Card key={idx} padding="lg">
            <div className="animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-4 bg-gray-200 rounded w-full mb-2" />
              <div className="h-4 bg-gray-200 rounded w-5/6 mb-4" />
              <div className="h-16 bg-gray-200 rounded mb-4" />
              <div className="h-8 bg-gray-200 rounded" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const displayedRecommendations = limit
    ? recommendations.slice(0, limit)
    : recommendations;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {displayedRecommendations.map((recommendation) => (
        <RecommendationCard
          key={recommendation.id}
          recommendation={recommendation}
          onApply={onApply}
          onView={onView}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
}
