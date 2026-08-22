import { Link } from "react-router-dom";
import {
  FiArrowUp,
  FiChevronRight,
  FiClock,
  FiMail,
  FiMapPin,
  FiPhone,
} from "react-icons/fi";

const quickLinks = [
  { to: "/servicios", label: "Servicios municipales" },
  { to: "/eventos", label: "Calendario de eventos" },
  { to: "/noticias", label: "Últimas noticias" },
  { to: "/contacto", label: "Contacto" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t-4 border-amber-500 bg-stone-950 text-stone-200">
      <div
        className="pointer-events-none absolute -left-24 top-8 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-orange-900/15 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-7xl px-6 pb-8 pt-12 sm:px-8 sm:pt-14 lg:px-10">
        <div className="grid items-start gap-y-8 border-b border-white/10 pb-10 sm:gap-y-10 sm:pb-12 md:grid-cols-2 md:gap-x-14 md:gap-y-12 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,1.15fr)] xl:gap-x-10">
          <section className="min-w-0 xl:pr-4">
            <Link
              to="/"
              className="inline-flex items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-400"
              aria-label="Ir al inicio del Ayuntamiento de Driebes"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-300/30 bg-amber-400/10 text-xl font-bold text-amber-300 shadow-[0_12px_30px_rgba(245,158,11,0.12)] sm:h-14 sm:w-14 sm:text-2xl">
                D
              </span>
              <span className="text-left">
                <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-amber-300 sm:text-xs">
                  Ayuntamiento de
                </span>
                <span className="tourism-display mt-1 block text-3xl leading-none text-white sm:text-4xl">
                  Driebes
                </span>
              </span>
            </Link>

            <p className="mt-5 max-w-md text-sm leading-6 text-stone-400 sm:text-base sm:leading-7">
              Información municipal, servicios y actualidad para acercar el
              Ayuntamiento a todos los vecinos.
            </p>
          </section>

          <section className="min-w-0" aria-labelledby="footer-contact-title">
            <h2
              id="footer-contact-title"
              className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-white"
            >
              Contacto
            </h2>

            <address className="grid gap-1 text-sm not-italic text-stone-300">
              <div className="-mx-3 flex min-h-11 items-start gap-3 rounded-xl px-3 py-2.5">
                <FiMapPin
                  className="mt-0.5 h-5 w-5 shrink-0 text-amber-400"
                  aria-hidden="true"
                />
                <span className="leading-6">
                  Plaza Mayor, 19112 Driebes, Guadalajara
                </span>
              </div>

              <a
                href="tel:+34949298001"
                className="-mx-3 flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
              >
                <FiPhone
                  className="h-5 w-5 shrink-0 text-amber-400"
                  aria-hidden="true"
                />
                <span>949 29 80 01</span>
              </a>

              <a
                href="mailto:ayuntamiento@driebes.es"
                className="-mx-3 flex min-h-11 min-w-0 items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
              >
                <FiMail
                  className="h-5 w-5 shrink-0 text-amber-400"
                  aria-hidden="true"
                />
                <span className="min-w-0 break-words">
                  ayuntamiento@driebes.es
                </span>
              </a>
            </address>
          </section>

          <nav className="min-w-0" aria-labelledby="footer-links-title">
            <h2
              id="footer-links-title"
              className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-white"
            >
              Enlaces rápidos
            </h2>

            <ul className="grid gap-1 text-sm text-stone-300">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="group -mx-3 flex min-h-11 items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
                  >
                    <span>{link.label}</span>
                    <FiChevronRight
                      className="h-4 w-4 shrink-0 text-amber-400 motion-safe:transition-transform motion-safe:group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <section className="min-w-0" aria-labelledby="footer-hours-title">
            <h2
              id="footer-hours-title"
              className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-white"
            >
              Horario de atención
            </h2>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_20px_45px_rgba(0,0,0,0.18)] sm:p-5">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10 text-xl text-amber-400">
                <FiClock aria-hidden="true" />
              </div>
              <dl className="grid gap-3 text-sm">
                <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 border-b border-white/10 pb-3">
                  <dt className="text-stone-400">Lunes a viernes</dt>
                  <dd className="font-semibold text-white">9:00–14:00</dd>
                </div>
                <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
                  <dt className="text-stone-400">Sábados</dt>
                  <dd className="font-semibold text-white">9:00–13:00</dd>
                </div>
              </dl>
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-5 pt-6 text-sm leading-6 text-stone-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {currentYear} Ayuntamiento de Driebes
            <span className="mx-2 hidden text-stone-600 sm:inline">•</span>
            <span className="block sm:inline">PsUdev</span>
          </p>

          <a
            href="#root"
            className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-white/10 px-4 py-2 font-semibold text-stone-300 transition hover:border-amber-400/40 hover:bg-amber-400/10 hover:text-amber-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
          >
            Volver arriba
            <FiArrowUp className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
}
