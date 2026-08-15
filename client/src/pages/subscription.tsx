import { useLocation } from "wouter";
import { SiteHeader } from "@/components/SiteHeaderFooter";

export default function SubscriptionPage() {
  const [, navigate] = useLocation();

  return (
    <div style={{ minHeight: "100vh", width: "100%", display: "flex", flexDirection: "column" }}>
      <SiteHeader />
      
      <div
        style={{
          flex: 1,
          background: "linear-gradient(160deg, #FFE49A 0%, #FFCA5A 60%, #FFB830 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem 1rem",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: "20px",
            padding: "2.5rem",
            maxWidth: "500px",
            width: "100%",
            boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>?</div>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 800,
              color: "#2D2D2D",
              marginBottom: "1.5rem",
            }}
          >
            Subscription Page
          </h1>
          <p
            style={{
              fontSize: "1rem",
              color: "#555",
              marginBottom: "2rem",
              lineHeight: 1.6,
            }}
          >
            This page is under construction. Subscription functionality will be available soon.
          </p>
          <button
            onClick={() => navigate("/")}
            style={{
              background: "linear-gradient(135deg, #6C63FF, #3A33CC)",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              padding: "0.875rem 2rem",
              fontSize: "1rem",
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(60,40,200,0.35)",
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
