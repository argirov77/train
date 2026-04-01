import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { ActivityLog, StreakInfo } from '@/types';

interface DailyAnalyticsRow {
  user_id: string;
  date: string;
  items_done: number;
}

function shiftDate(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split('T')[0];
}

export function calcStreak(logs: ActivityLog[]): StreakInfo {
  const dates = logs.map((l) => l.date).sort().reverse();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = shiftDate(today, -1);
  const uniqueDates = [...new Set(dates)];

  const hasToday = uniqueDates[0] === today;
  let expected = hasToday ? today : yesterday;
  let current = 0;
  while (uniqueDates.includes(expected)) {
    current += 1;
    expected = shiftDate(expected, -1);
  }

  let longest = 0;
  let run = 0;
  let prev: string | null = null;
  [...uniqueDates].sort().forEach((date) => {
    if (!prev || shiftDate(prev, 1) === date) {
      run += 1;
    } else {
      run = 1;
    }
    longest = Math.max(longest, run);
    prev = date;
  });

  return { current, longest, today: hasToday };
}

export function useStreak() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [streak, setStreak] = useState<StreakInfo>({ current: 0, longest: 0, today: false });

  const refetch = useCallback(async () => {
    if (!supabase) return;
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    const userId = userData.user?.id;
    if (!userId) {
      setLogs([]);
      setStreak({ current: 0, longest: 0, today: false });
      return;
    }

    const { data: analyticsData, error: analyticsError } = await supabase
      .from('progress_analytics_by_day')
      .select('user_id, date, items_done')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    let rows: ActivityLog[] = [];
    if (analyticsError) {
      const { data } = await supabase
        .from('activity_log')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
      rows = (data ?? []) as ActivityLog[];
    } else {
      rows = ((analyticsData ?? []) as DailyAnalyticsRow[]).map((row) => ({
        id: `${row.user_id}-${row.date}`,
        user_id: row.user_id,
        date: row.date,
        items_done: row.items_done ?? 0,
      }));
    }

    setLogs(rows);
    setStreak(calcStreak(rows));
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { logs, streak, refetch };
}
