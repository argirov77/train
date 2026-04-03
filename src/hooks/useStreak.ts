import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getUserId } from '@/lib/userId';
import type { ActivityLog, StreakInfo } from '@/types';

interface UserItemProgressRow {
  id: string;
  user_id: string;
  status: string;
  completed_at: string | null;
  last_seen_at: string | null;
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
    const userId = await getUserId();

    const { data: progressData, error: progressError } = await supabase
      .from('user_item_progress')
      .select('id, user_id, status, completed_at, last_seen_at')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false });

    if (progressError) {
      throw progressError;
    }

    const rows = ((progressData ?? []) as UserItemProgressRow[])
      .filter((row) => row.completed_at || row.last_seen_at)
      .map((row) => ({
        id: row.id,
        user_id: row.user_id,
        date: (row.completed_at ?? row.last_seen_at ?? '').split('T')[0],
        items_done: 1,
      })) as ActivityLog[];

    setLogs(rows);
    setStreak(calcStreak(rows));
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { logs, streak, refetch };
}
