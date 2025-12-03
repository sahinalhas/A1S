import { useQuery } from '@tanstack/react-query';
import type { AppSettings } from '@shared/types';
import { loadSettings } from '@/lib/app-settings';

export function useSettings() {
  return useQuery<AppSettings>({
    queryKey: ['settings'],
    queryFn: loadSettings,
    staleTime: 1000 * 60 * 5,
  });
}
