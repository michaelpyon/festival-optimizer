"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          gap: 24,
          padding: "48px",
          background: "#131313",
          color: "#e5e2e1",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 12,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#cec5b9",
          }}
        >
          Festival Optimizer
        </p>
        <h1 style={{ margin: 0, fontSize: 44, fontWeight: 600 }}>
          Something went wrong
        </h1>
        <p
          style={{
            margin: 0,
            maxWidth: 440,
            lineHeight: 1.6,
            color: "#cec5b9",
          }}
        >
          The app ran into an unexpected error. Reloading usually fixes it.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            minHeight: 44,
            border: "none",
            borderRadius: 999,
            padding: "12px 32px",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 3,
            textTransform: "uppercase",
            background: "#d5c5a9",
            color: "#392f1b",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
