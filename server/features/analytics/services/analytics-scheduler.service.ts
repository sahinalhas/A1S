import { refreshAnalyticsSnapshot } from '../repository/analytics-snapshot.repository.js';
import { cleanupExpiredCache } from '../repository/cache.repository.js';

let schedulerInterval: NodeJS.Timeout | null = null;

export function startAnalyticsScheduler(): void {
  if (schedulerInterval) {
    console.log('⏱️  Analytics scheduler already running');
    return;
  }
  
  console.log('🚀 Starting analytics background scheduler...');
  
  const refreshInterval = 10 * 60 * 1000;
  
  schedulerInterval = setInterval(() => {
    try {
      console.log('📊 Background refresh: Updating analytics snapshot...');
      const count = refreshAnalyticsSnapshot();
      console.log(`✅ Analytics snapshot updated for ${count} students`);
      
      const cleanedCount = cleanupExpiredCache();
      if (cleanedCount > 0) {
        console.log(`🧹 Cleaned up ${cleanedCount} expired cache entries`);
      }
    } catch (error) {
      console.error('❌ Error in analytics scheduler:', error);
    }
  }, refreshInterval);
  
  refreshAnalyticsSnapshot();
  console.log('✅ Analytics scheduler started (refresh every 10 minutes)');
}

export function stopAnalyticsScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('⏹️  Analytics scheduler stopped');
  }
}

export function getSchedulerStatus(): { running: boolean; interval: number } {
  return {
    running: schedulerInterval !== null,
    interval: 10
  };
}
