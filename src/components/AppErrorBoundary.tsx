import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export default class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error?.message || "Erro inesperado ao iniciar o aplicativo.",
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[AppErrorBoundary] Falha ao renderizar o aplicativo:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main
          role="alert"
          style={{
            minHeight: "100vh",
            display: "grid",
            placeContent: "center",
            gap: "12px",
            padding: "24px",
            background: "#0b1020",
            color: "#f8fafc",
            fontFamily: "system-ui, sans-serif",
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: "1.4rem", margin: 0 }}>Não foi possível abrir o aplicativo</h1>
          <p style={{ maxWidth: "640px", margin: 0, color: "#cbd5e1" }}>
            Ocorreu um erro durante a inicialização. Recarregue a página; se continuar, compartilhe a mensagem abaixo com o suporte.
          </p>
          <pre style={{ maxWidth: "min(640px, 90vw)", overflowWrap: "anywhere", whiteSpace: "pre-wrap", padding: "12px", borderRadius: "8px", background: "#111827", color: "#fca5a5", textAlign: "left" }}>
            {this.state.message}
          </pre>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{ justifySelf: "center", padding: "10px 16px", border: 0, borderRadius: "8px", cursor: "pointer" }}
          >
            Recarregar aplicativo
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}
