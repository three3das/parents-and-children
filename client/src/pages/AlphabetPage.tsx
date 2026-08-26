import { useLocation } from "wouter";
import { useLanguage } from "@/lib/i18n";
import { SiteHeader } from "@/components/SiteHeaderFooter";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase"; // Убедитесь, что путь к вашему клиенту supabase совпадает

interface LetterItem {
  id: string;
  grapheme: string;
  transliteration: string | null;
  letter_type: string | null;
  sort_order: number | null;
}

export default function AlphabetPage() {
  const [, navigate] = useLocation();
  const { language } = useLanguage();
  
  const [letters, setLetters] = useState<LetterItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Загрузка букв из Supabase при изменении языка
  useEffect(() => {
    async function fetchLetters() {
      setLoading(true);
      try {
        // 1. Ищем систему письменности по коду языка (например, 'sa')
        const { data: systems, error: sysError } = await supabase
          .from('letter_writing_systems')
          .select('id')
          .eq('code', language);

        if (sysError) throw sysError;

        if (systems && systems.length > 0) {
          const systemId = systems[0].id;

          // 2. Загружаем все буквы для этой системы письменности, отсортированные по sort_order
          const { data: items, error: itemsError } = await supabase
            .from('letter_items')
            .select('*')
            .eq('writing_system_id', systemId)
            .order('sort_order', { ascending: true });

          if (itemsError) throw itemsError;

          if (items) {
            setLetters(items);
          }
        } else {
          setLetters([]);
        }
      } catch (err) {
        console.error("Ошибка загрузки букв из базы данных:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchLetters();
  }, [language]);

  // Функция озвучки буквы
  function playLetter(grapheme: string) {
    try {
      const u = new SpeechSynthesisUtterance(grapheme);
      u.lang = language === 'sa' ? 'hi-IN' : 'ru-RU';
      u.rate = 0.7;
      speechSynthesis.speak(u);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div style={{ minHeight: "100vh", width: "100%", display: "flex", flexDirection: "column" }}>
      <SiteHeader onBack={() => navigate("/reading")} />

      <div
        style={{
          flex: 1,
          background: "linear-gradient(135deg, #FF5252 0%, #E00000 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          position: "relative",
          padding: "clamp(10px, 2vw, 20px)",
        }}
      >
        {loading ? (
          <div style={{ color: "white", textAlign: "center", marginTop: "2rem", fontSize: "1.2rem", fontWeight: "bold" }}>
            Загрузка алфавита из базы данных...
          </div>
        ) : letters.length === 0 ? (
          <div style={{ color: "white", textAlign: "center", marginTop: "2rem", fontSize: "1.2rem", fontWeight: "bold" }}>
            Для данного языка пока нет букв в базе данных.
          </div>
        ) : (
          <div
            style={{
              flex: 1,
              display: "grid",
              gridTemplateColumns: `repeat(7, 1fr)`,
              gap: "clamp(4px, 0.8vw, 10px)",
            }}
          >
            {letters.map((item) => (
              <button
                key={item.id}
                onClick={() => playLetter(item.grapheme)}
                title={item.transliteration ? `Транслитерация: ${item.transliteration}` : undefined}
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "2px solid rgba(255,255,255,0.35)",
                  borderRadius: "clamp(8px, 1.5vw, 16px)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "10px",
                  transition: "background 0.15s, transform 0.1s",
                }}
              >
                <span style={{
                  color: "white",
                  fontWeight: 900,
                  fontSize: "clamp(1.2rem, 3.5vw, 2.5rem)",
                  textShadow: "0 2px 6px rgba(0,0,0,0.3)",
                }}>
                  {item.grapheme}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}