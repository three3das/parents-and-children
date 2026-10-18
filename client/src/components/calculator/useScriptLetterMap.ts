import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// Значения букв алфавита в выбранной системе письма: letterId → символ.
// Столбец таблицы text_letter_writing_systems совпадает с кодом script
// (как в useScriptText из игры «Алфавит», но одним запросом на все буквы).
// Если для буквы в этой письменности значения нет — её нет в карте, и
// калькулятор подставит обычное написание буквы.
export function useScriptLetterMap(letterIds: string[], script: string) {
  const [map, setMap] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(false);
  const idsKey = letterIds.join(',');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (letterIds.length === 0) {
        setMap(new Map());
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('text_letter_writing_systems')
          .select('*')
          .in('letter_id', letterIds);
        if (error) throw error;

        const next = new Map<string, string>();
        for (const row of (data ?? []) as Record<string, unknown>[]) {
          const value = row[script];
          if (typeof value === 'string' && value.length > 0) {
            next.set(String(row.letter_id), value);
          }
        }
        if (!cancelled) setMap(next);
      } catch (err) {
        console.error('Ошибка загрузки text_letter_writing_systems:', err);
        if (!cancelled) setMap(new Map());
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey, script]);

  return { map, loading };
}
