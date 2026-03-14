'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

export type DashboardRange = '7d' | '30d' | 'custom';

function normalizeRange(input: string | null): DashboardRange {
  if (input === '30d' || input === 'custom' || input === '7d') return input;
  return '7d';
}

export function useDashboardQuery() {
  const searchParams = useSearchParams();

  const account = searchParams.get('account') ?? 'act_1234567890';
  const range = normalizeRange(searchParams.get('range'));
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set('account', account);
    params.set('range', range);

    if (range === 'custom') {
      if (from) params.set('from', from);
      if (to) params.set('to', to);
    }

    return params.toString();
  }, [account, range, from, to]);

  const withQuery = (href: string) => {
    return queryString.length > 0 ? `${href}?${queryString}` : href;
  };

  return {
    account,
    range,
    from,
    to,
    queryString,
    withQuery,
  };
}
