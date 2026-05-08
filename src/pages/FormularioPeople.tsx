import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './FormularioPeople.css';

/* ── Tipos ── */
type Categoria = 'dias_remunerados' | 'adicionales' | 'people';

interface Beneficio {
  id: string;
  label: string;
  detalle?: string;
  dias?: string;
  categoria: Categoria;
}

/* ── Catálogo de beneficios ── */
const beneficios: Beneficio[] = [
  /* Días remunerados */
  { id: 'cumpleanos',    label: 'Día libre por cumpleaños',           dias: '1 día',  categoria: 'dias_remunerados' },
  { id: 'grado',         label: 'Día libre por grado',                dias: '1 día',  categoria: 'dias_remunerados' },
  { id: 'matrimonio',    label: 'Días libres por matrimonio',          dias: '2 días', categoria: 'dias_remunerados' },
  { id: 'luto_mascota',  label: 'Días por calamidad / luto mascota',  dias: '2 días', categoria: 'dias_remunerados' },
  { id: 'familia',       label: 'Día de la familia',                  dias: '1 día',  categoria: 'dias_remunerados' },
  /* Beneficios adicionales */
  { id: 'poliza',             label: 'Póliza de vida',                           detalle: 'A partir del 3er mes de antigüedad',      categoria: 'adicionales' },
  { id: 'auxilio_educativo',  label: 'Auxilio educativo Formación y Desarrollo', detalle: 'Alineación con el negocio',               categoria: 'adicionales' },
  { id: 'quinquenios',        label: 'Quinquenios',                                                                                  categoria: 'adicionales' },
  /* PEOPLE */
  { id: 'people_lab',      label: 'People Lab',      detalle: 'Participa en propuestas para el diseño de las iniciativas de bienestar',          categoria: 'people' },
  { id: 'people_conexion', label: 'People Conexión', detalle: 'Espacios de conexión entre equipos',                                              categoria: 'people' },
  { id: 'people_impacto',  label: 'People Impacto',  detalle: 'Jornadas Sociales',                                                               categoria: 'people' },
  { id: 'people_star',     label: 'People Star',     detalle: 'Reconocimiento personal / Reconocimiento equipos',                                categoria: 'people' },
  { id: 'people_valores',  label: 'People Valores',  detalle: 'Actividades experiencias compartidas / Torneo valores',                           categoria: 'people' },
  { id: 'people_cuidado',  label: 'People Cuidado',  detalle: 'Sesión acompañamiento Duelo / Sesión acompañamiento procesos individuales',       categoria: 'people' },
];

const categorias: { key: Categoria; titulo: string; descripcion?: string }[] = [
  {
    key: 'dias_remunerados',
    titulo: 'Días Remunerados',
    descripcion: 'Con previa autorización del jefe directo. Selecciona el beneficio a redimir.',
  },
  {
    key: 'adicionales',
    titulo: 'Beneficios Adicionales',
  },
  {
    key: 'people',
    titulo: 'Programa PEOPLE',
  },
];

/* ── Componente ── */
const FormularioPeople = () => {
  const [seleccion, setSeleccion] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [userName] = useState(
    () => localStorage.getItem('gh_usuario') || 'Usuario Corporativo'
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const beneficioSeleccionado = beneficios.find((b) => b.id === seleccion);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seleccion) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const label = beneficioSeleccionado
        ? beneficioSeleccionado.dias
          ? `${beneficioSeleccionado.label} (${beneficioSeleccionado.dias})`
          : beneficioSeleccionado.detalle
            ? `${beneficioSeleccionado.label}: ${beneficioSeleccionado.detalle}`
            : beneficioSeleccionado.label
        : seleccion;

      const url = import.meta.env.VITE_PA_PEOPLE_URL as string;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombreUsuario: userName,
          beneficioSeleccionado: label,
        }),
      });
      if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error al enviar la solicitud. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Pantalla de éxito ── */
  if (submitted) {
    return (
      <div className="people-page">
        <div className="people-success">
          <div className="people-success-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h2>¡Solicitud enviada!</h2>
          <p>
            Tu solicitud del beneficio <strong>{beneficioSeleccionado?.label}</strong> ha sido
            registrada correctamente. El equipo de Gestión Humana la procesará pronto.
          </p>
          <div className="people-success-actions">
            <button
              className="people-btn-outline"
              onClick={() => { setSeleccion(''); setSubmitted(false); setSubmitError(null); }}
            >
              Nueva solicitud
            </button>
            <Link to="/" className="people-btn-primary">Volver al inicio</Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── Formulario ── */
  return (
    <div className="people-page">

      {/* Header */}
      <header className="people-header">
        <div className="people-header-inner">
          <div className="people-header-brand">
            <img src="/Logo syp.png" alt="Solutions & Payroll" className="people-logo" />
            <div className="people-brand-text">
              <span className="people-brand-name">Solutions & Payroll</span>
              <span className="people-brand-sub">Gestión Humana</span>
            </div>
          </div>
          <div className="people-header-right">
            <div className="people-user">
              <div className="people-avatar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <span className="people-username">{userName}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="people-hero">
        <div className="people-hero-inner">
          <Link to="/" className="people-back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Volver al inicio
          </Link>
          <div>
            <span className="people-badge">Beneficios</span>
          </div>
          <h1>Programa PEOPLE</h1>
          <p>Conecta contigo y con S&amp;P. Selecciona el beneficio que deseas solicitar.</p>
        </div>
      </div>

      {/* Formulario */}
      <main className="people-main">
        <form className="people-form" onSubmit={handleSubmit}>

          {categorias.map((cat) => {
            const items = beneficios.filter((b) => b.categoria === cat.key);
            return (
              <section key={cat.key} className="people-section">
                <div className="people-section-header">
                  <h2 className="people-section-title">{cat.titulo}</h2>
                  {cat.descripcion && (
                    <p className="people-section-desc">{cat.descripcion}</p>
                  )}
                </div>
                <div className="people-beneficios-list">
                  {items.map((b) => (
                    <label
                      key={b.id}
                      className={`people-beneficio-card${seleccion === b.id ? ' selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="beneficio"
                        value={b.id}
                        checked={seleccion === b.id}
                        onChange={() => setSeleccion(b.id)}
                        className="people-radio-input"
                      />
                      <div className="people-beneficio-radio">
                        <div className="people-radio-dot" />
                      </div>
                      <div className="people-beneficio-content">
                        <span className="people-beneficio-label">{b.label}</span>
                        {b.dias && (
                          <span className="people-beneficio-badge people-beneficio-badge--dias">{b.dias}</span>
                        )}
                        {b.detalle && (
                          <span className="people-beneficio-detalle">{b.detalle}</span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </section>
            );
          })}

          {/* Acciones */}
          {submitError && (
            <div className="people-error-banner">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
              {submitError}
            </div>
          )}
          <div className="people-actions">
            <Link to="/" className="people-btn-cancel">Cancelar</Link>
            <button
              type="submit"
              className="people-btn-submit"
              disabled={!seleccion || isSubmitting}
            >
              {isSubmitting
                ? (<><span className="people-spinner" />Enviando...</>)
                : 'Solicitar beneficio'}
            </button>
          </div>

        </form>
      </main>
    </div>
  );
};

export default FormularioPeople;
