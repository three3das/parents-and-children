import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { DictionaryWord, LetterRow } from './types';

// Буквы алфавита выбранного языка.
export function useAlphabetLetters(language: string) {
  const [letters, setLetters] = useState<LetterRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const { data: systems, error: sysError } = await supabase
          .from('text_languages_systems')
          .select('id')
          .eq('code', language);
        if (sysError) throw sysError;

        if (!systems || systems.length === 0) {
          if (!cancelled) setLetters([]);
          return;
        }

        const { data: items, error: itemsError } = await supabase
          .from('text_letter_languages')
          .select('*')
          .eq('language_id', systems[0].id)
          .order('sort_order', { ascending: true });
        if (itemsError) throw itemsError;

        if (!cancelled) setLetters(items || []);
      } catch (err) {
        console.error('Ошибка загрузки алфавита из базы данных:', err);
        if (!cancelled) setLetters([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [language]);

  return { letters, loading };
}

// Значение буквы в выбранной системе письма. Столбец таблицы
// text_letter_writing_systems совпадает с кодом script.
export function useScriptText(letterId: string | null, script: string) {
  const [scriptText, setScriptText] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!letterId) {
        setScriptText(null);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('text_letter_writing_systems')
          .select('*')
          .eq('letter_id', letterId)
          .maybeSingle();
        if (error) throw error;

        if (!cancelled) {
          const value = data ? (data as any)[script] : null;
          setScriptText(typeof value === 'string' && value.length > 0 ? value : null);
        }
      } catch (err) {
        console.error('Ошибка загрузки text_letter_writing_systems:', err);
        if (!cancelled) setScriptText(null);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [letterId, script]);

  return scriptText;
}

// Значения буквы сразу в нескольких системах письма: один запрос к
// text_letter_writing_systems, затем берём нужные столбцы.
export function useScriptTexts(letterId: string | null, scripts: string[]) {
  const [texts, setTexts] = useState<Record<string, string | null>>({});
  const key = scripts.join(',');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!letterId) {
        setTexts({});
        return;
      }
      try {
        const { data, error } = await supabase
          .from('text_letter_writing_systems')
          .select('*')
          .eq('letter_id', letterId)
          .maybeSingle();
        if (error) throw error;

        if (!cancelled) {
          const result: Record<string, string | null> = {};
          for (const code of scripts) {
            const value = data ? (data as any)[code] : null;
            result[code] = typeof value === 'string' && value.length > 0 ? value : null;
          }
          setTexts(result);
        }
      } catch (err) {
        console.error('Ошибка загрузки text_letter_writing_systems:', err);
        if (!cancelled) setTexts({});
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [letterId, key]);

  return texts;
}

// Все слова из /api/words (для санскрита слов в базе нет).
export function useDictionaryWords(language: string) {
  const [words, setWords] = useState<DictionaryWord[]>([]);
  const [loading, setLoading] = useState(language !== 'sa');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (language === 'sa') return;
    let cancelled = false;

    async function load() {
      try {
        const url =
          language === 'ru'
            ? '/api/words?all=true'
            : `/api/words?all=true&lang=${encodeURIComponent(language)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          setWords(Array.isArray(data) ? (data as DictionaryWord[]) : []);
          setLoading(false);
        }
      } catch (err) {
        console.error('Ошибка загрузки слов для словаря:', err);
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [language]);

  return { words, loading, error };
}