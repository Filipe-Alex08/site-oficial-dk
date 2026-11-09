import { CloudOff } from "lucide-react";

/** Mostrado quando a área depende de um serviço que não respondeu. */
export default function Unavailable() {
  return (
    <section className="section">
      <div className="container">
        <div className="empty-state" role="status">
          <CloudOff />
          <h2>Área indisponível no momento</h2>
          <p>Tente novamente em alguns minutos.</p>
        </div>
      </div>
    </section>
  );
}
