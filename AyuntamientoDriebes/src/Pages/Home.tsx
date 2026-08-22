import { FaChevronRight } from "react-icons/fa";
import { CiCalendar } from "react-icons/ci";
import { HiOutlineNewspaper } from "react-icons/hi2";
import { FiUsers } from "react-icons/fi";
import { IoIosHeartEmpty } from "react-icons/io";
import { LuCompass, LuLandmark, LuSparkles, LuTentTree } from "react-icons/lu";

const accessCards = [
  {
    title: "Eventos",
    description: "Consulta el calendario de actividades del municipio.",
    href: "/eventos",
    icon: CiCalendar,
    accent: "amber",
  },
  {
    title: "Noticias",
    description: "Ultimas novedades y comunicados del ayuntamiento.",
    href: "/noticias",
    icon: HiOutlineNewspaper,
    accent: "stone",
  },
  {
    title: "Turismo",
    description: "Explora rincones, rutas y planes para visitar Driebes.",
    href: "/turismo",
    icon: LuCompass,
    accent: "emerald",
  },
  {
    title: "Servicios",
    description: "Accede a los servicios municipales y tramites utiles.",
    href: "/servicios",
    icon: LuLandmark,
    accent: "amber",
  },
];

const highlights = [
  {
    title: "Fiestas Patronales",
    label: "15-18 agosto",
    image: "/img/fiestas.jpg",
  },
  {
    title: "Rutas de senderismo",
    label: "Todo el ano",
    image: "/img/hermita.jpg",
  },
  {
    title: "Patrimonio e historia",
    label: "Visitas con identidad",
    image: "/img/driebesHistoria.jpg",
  },
];

function getAccentStyles(accent: string) {
  switch (accent) {
    case "emerald":
      return {
        iconWrap: "bg-emerald-100 text-emerald-700",
        link: "text-emerald-700",
      };
    case "stone":
      return {
        iconWrap: "bg-stone-200 text-stone-700",
        link: "text-stone-900",
      };
    default:
      return {
        iconWrap: "bg-amber-100 text-amber-700",
        link: "text-amber-700",
      };
  }
}

export default function Home() {
  return (
    <div className="tourism-page overflow-hidden bg-[#f6efe5] text-slate-900">
      <section
        className="relative min-h-[68vh] overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: 'url("/img/driebes.jpg")' }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(17,24,39,0.84),rgba(17,24,39,0.5),rgba(180,83,9,0.24))]" />
        <div className="absolute -left-16 top-16 h-44 w-44 rounded-full bg-amber-300/20 blur-3xl" />
        <div className="absolute bottom-8 right-0 h-56 w-56 rounded-full bg-orange-900/20 blur-3xl" />

        <div className="relative mx-auto flex min-h-[68vh] max-w-6xl items-center px-6 py-12 sm:px-8 lg:px-10">
          <div className="tourism-glass max-w-3xl rounded-[1.75rem] p-6 text-left text-white shadow-[0_24px_65px_rgba(15,23,42,0.32)] sm:p-8 lg:p-10">
            <p className="tourism-kicker mb-3 text-xs uppercase tracking-[0.3em] text-amber-200">
              Ayuntamiento de Driebes
            </p>
            <h1 className="tourism-display text-4xl leading-none sm:text-5xl lg:text-6xl">
              Bienvenido a un pueblo con historia, paisaje y vida local.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-stone-100 sm:text-base">
              Driebes abre sus puertas con el mismo espiritu que define su
              entorno: cercano, sereno y lleno de rincones que merecen una
              mirada atenta.
            </p>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <a
                href="/turismo"
                className="inline-flex items-center justify-center rounded-full border border-amber-400 bg-amber-500 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-stone-950 transition hover:-translate-y-0.5 hover:bg-amber-400"
              >
                Descubrir Driebes
              </a>
              <a
                href="/eventos"
                className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/15"
              >
                Ver eventos
              </a>
            </div>

            <div className="mt-6 grid gap-2 sm:grid-cols-3">
              <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-3 backdrop-blur-sm">
                <p className="text-lg font-semibold text-white">Patrimonio</p>
                <p className="mt-1 text-xs text-stone-200">Historia que sigue presente</p>
              </div>
              <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-3 backdrop-blur-sm">
                <p className="text-lg font-semibold text-white">Naturaleza</p>
                <p className="mt-1 text-xs text-stone-200">Rutas, horizonte y calma rural</p>
              </div>
              <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-3 backdrop-blur-sm">
                <p className="text-lg font-semibold text-white">Cercania</p>
                <p className="mt-1 text-xs text-stone-200">Servicios y vida de pueblo</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto grid max-w-7xl gap-8 px-6 py-14 sm:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-10 lg:py-20">
        <div>
          <p className="tourism-kicker text-sm uppercase tracking-[0.3em] text-amber-700">
            Inicio
          </p>
          <h2 className="tourism-display mt-4 text-4xl leading-tight text-stone-900 sm:text-5xl">
            Una portada con la misma identidad visual que Turismo.
          </h2>
          <p className="mt-6 max-w-3xl text-base leading-8 text-stone-700 sm:text-lg">
            Hemos convertido la pagina de inicio en una entrada mas calida,
            fotografica y editorial, para que el usuario perciba Driebes desde
            el primer vistazo con el mismo lenguaje visual que ya funciona en
            la seccion turistica.
          </p>
        </div>

        <div className="tourism-panel rounded-[2rem] p-6 sm:p-8">
          <div className="grid gap-4">
            <div className="flex items-start gap-4 rounded-2xl bg-white/80 p-4">
              <div className="rounded-2xl bg-amber-100 p-3 text-2xl text-amber-700">
                <LuSparkles />
              </div>
              <div className="text-left">
                <p className="text-sm uppercase tracking-[0.25em] text-stone-500">
                  Estilo
                </p>
                <p className="mt-1 text-lg font-semibold text-stone-900">
                  Hero inmersivo y paneles con profundidad
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-2xl bg-white/80 p-4">
              <div className="rounded-2xl bg-emerald-100 p-3 text-2xl text-emerald-700">
                <LuTentTree />
              </div>
              <div className="text-left">
                <p className="text-sm uppercase tracking-[0.25em] text-stone-500">
                  Objetivo
                </p>
                <p className="mt-1 text-lg font-semibold text-stone-900">
                  Guiar al visitante hacia turismo, eventos y servicios
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-6 sm:px-8 lg:px-10">
        <div className="mb-10 text-left">
          <p className="tourism-kicker text-sm uppercase tracking-[0.3em] text-amber-700">
            Accesos principales
          </p>
          <h2 className="tourism-display mt-3 text-4xl text-stone-900 sm:text-5xl">
            Las secciones mas importantes, con una presentacion comun
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {accessCards.map((card) => {
            const Icon = card.icon;
            const accent = getAccentStyles(card.accent);

            return (
              <a
                key={card.title}
                href={card.href}
                className="group tourism-panel flex h-full flex-col rounded-[2rem] border border-white/70 p-7 text-left shadow-[0_24px_60px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-2 hover:shadow-[0_28px_80px_rgba(120,53,15,0.16)]"
              >
                <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${accent.iconWrap}`}>
                  <Icon />
                </div>
                <h3 className="tourism-display text-3xl leading-tight text-stone-900">
                  {card.title}
                </h3>
                <p className="mt-4 flex-1 leading-8 text-stone-700">
                  {card.description}
                </p>
                <span
                  className={`mt-6 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.25em] transition group-hover:translate-x-1 ${accent.link}`}
                >
                  Acceder <FaChevronRight />
                </span>
              </a>
            );
          })}
        </div>
      </section>

      <section className="relative mt-10 bg-[linear-gradient(180deg,#fffaf3_0%,#f0e1cf_100%)] py-16">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
          <div className="max-w-3xl text-left">
            <p className="tourism-kicker text-sm uppercase tracking-[0.3em] text-amber-700">
              Destacados
            </p>
            <h2 className="tourism-display mt-3 text-4xl text-stone-900 sm:text-5xl">
              Motivos para volver una y otra vez
            </h2>
            <p className="mt-5 text-base leading-8 text-stone-700 sm:text-lg">
              La portada tambien puede contar historias. Estos bloques recogen
              algunos de los planes, fechas y experiencias que mejor representan
              la vida local de Driebes.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {highlights.map((item) => (
              <article
                key={item.title}
                className="tourism-panel overflow-hidden rounded-[2rem] border border-white/70 shadow-[0_24px_60px_rgba(15,23,42,0.08)]"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-60 w-full object-cover"
                />
                <div className="p-6 text-left">
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">
                    {item.label}
                  </p>
                  <h3 className="tourism-display mt-3 text-3xl text-stone-900">
                    {item.title}
                  </h3>
                </div>
              </article>
            ))}
          </div>
        </div>

        <section className="mx-auto mt-18 max-w-7xl px-6 sm:px-8 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.05fr] lg:items-center">
            <div className="text-left">
              <p className="tourism-kicker text-sm uppercase tracking-[0.3em] text-amber-700">
                Sobre Driebes
              </p>
              <h2 className="tourism-display mt-3 text-4xl text-stone-900 sm:text-5xl">
                Un municipio pequeno con una identidad muy marcada
              </h2>
              <p className="mt-5 text-base leading-8 text-stone-700 sm:text-lg">
                Driebes es un municipio de Guadalajara que combina historia,
                paisaje y vida cotidiana en un entorno cercano. Su patrimonio,
                su caracter rural y la hospitalidad de sus vecinos forman parte
                de una experiencia que se siente autentica desde el primer
                momento.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.75rem] border border-white/70 bg-white/70 p-6 text-center shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
                  <FiUsers className="mx-auto text-3xl text-amber-700" />
                  <p className="mt-3 text-3xl font-semibold text-stone-900">~500</p>
                  <p className="mt-1 text-sm uppercase tracking-[0.2em] text-stone-500">
                    Habitantes
                  </p>
                </div>
                <div className="rounded-[1.75rem] border border-white/70 bg-white/70 p-6 text-center shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
                  <IoIosHeartEmpty className="mx-auto text-3xl text-amber-700" />
                  <p className="mt-3 text-3xl font-semibold text-stone-900">100%</p>
                  <p className="mt-1 text-sm uppercase tracking-[0.2em] text-stone-500">
                    Hospitalidad
                  </p>
                </div>
              </div>
            </div>

            <div className="tourism-panel overflow-hidden rounded-[2.25rem] p-3 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
              <img
                src="/img/driebes.jpg"
                alt="Vista de Driebes"
                className="h-full min-h-[320px] w-full rounded-[1.7rem] object-cover"
              />
            </div>
          </div>
        </section>
      </section>
    </div>
  );
}
