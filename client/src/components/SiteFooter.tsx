// ─── SiteFooter — shared footer for all pages ────────────────────────────────

export function SiteFooter() {
  return (
    <footer
      style={{
        width: "100%",
        padding: "22px 24px",
        textAlign: "center",
        fontSize: "0.95rem",
        background: "#ffffff",
        borderTop: "1px solid rgba(240, 240, 240, 0.9)",
      }}
    >
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: "20px",
          marginBottom: "40px",
        }}
        className="cards-grid"
      >
        <article
          style={{
            padding: "26px",
            borderRadius: "24px",
            background: "white",
            border: "1px solid #e2e8f0",
            boxShadow: "0 12px 30px rgba(15, 23, 42, 0.04)",
          }}
        >
          <h3
            style={{
              marginTop: 0,
              marginBottom: "14px",
              fontSize: "1.15rem",
              color: "#2D2D2D",
            }}
          >
            Мобильная версия
          </h3>
          <p style={{ margin: 0, color: "#555", lineHeight: 1.6 }}>
            Интерфейс адаптируется для смартфонов, планшетов и экранов с любой
            шириной.
          </p>
        </article>

        <article
          style={{
            padding: "26px",
            borderRadius: "24px",
            background: "white",
            border: "1px solid #e2e8f0",
            boxShadow: "0 12px 30px rgba(15, 23, 42, 0.04)",
          }}
        >
          <h3
            style={{
              marginTop: 0,
              marginBottom: "14px",
              fontSize: "1.15rem",
              color: "#2D2D2D",
            }}
          >
            Компьютерная версия
          </h3>
          <p style={{ margin: 0, color: "#555", lineHeight: 1.6 }}>
            Широкие блоки контента, удобная навигация и понятный дизайн на
            больших экранах.
          </p>
        </article>

        <article
          style={{
            padding: "26px",
            borderRadius: "24px",
            background: "white",
            border: "1px solid #e2e8f0",
            boxShadow: "0 12px 30px rgba(15, 23, 42, 0.04)",
          }}
        >
          <h3
            style={{
              marginTop: 0,
              marginBottom: "14px",
              fontSize: "1.15rem",
              color: "#2D2D2D",
            }}
          >
            Языковое меню
          </h3>
          <p style={{ margin: 0, color: "#555", lineHeight: 1.6 }}>
            Список языков в алфавитном порядке с особым первым местом для
            санскрита.
          </p>
        </article>
      </section>

      {/* Добавим медиа-запросы через style тег */}
      <style>{`
        @media (max-width: 860px) {
          .cards-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}
