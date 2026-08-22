import { LuClock3, LuLandmark, LuScrollText, LuUsers } from "react-icons/lu";

const milestones = [
  {
    title: "Origenes antiguos",
    text: "El entorno de Driebes guarda una relacion profunda con los asentamientos historicos de la zona, donde el territorio ya actuaba como punto de paso, trabajo y conexion con otros enclaves de la Alcarria.",
    icon: LuLandmark,
  },
  {
    title: "Tradicion rural",
    text: "Durante siglos, la vida del municipio se ha apoyado en la agricultura, en el trabajo comunitario y en una forma de habitar el paisaje marcada por la cercania, la constancia y el arraigo.",
    icon: LuScrollText,
  },
  {
    title: "Memoria compartida",
    text: "La historia local tambien se conserva en la memoria de sus vecinos, en las fiestas, en las costumbres y en una identidad que ha sabido mantenerse viva con el paso del tiempo.",
    icon: LuUsers,
  },
];

export default function Historia() {
  return (
    <div className="tourism-page overflow-hidden bg-[#f6efe5] text-slate-900">
      <section
        className="relative min-h-[68vh] overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: 'url("/img/driebesHistoria.jpg")',
          backgroundPosition: "center center",
        }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(17,24,39,0.84),rgba(17,24,39,0.48),rgba(146,64,14,0.24))]" />
        <div className="absolute -left-16 top-16 h-44 w-44 rounded-full bg-amber-300/20 blur-3xl" />
        <div className="absolute bottom-8 right-0 h-56 w-56 rounded-full bg-orange-900/20 blur-3xl" />

        <div className="relative mx-auto flex min-h-[68vh] max-w-6xl items-center px-6 py-12 sm:px-8 lg:px-10">
          <div className="tourism-glass max-w-3xl rounded-[1.75rem] p-6 text-left text-white shadow-[0_24px_65px_rgba(15,23,42,0.32)] sm:p-8 lg:p-10">
            <p className="tourism-kicker mb-3 text-xs uppercase tracking-[0.3em] text-amber-200">
              Historia de Driebes
            </p>
            <h1 className="tourism-display text-4xl leading-none sm:text-5xl lg:text-6xl">
              Siglos de memoria, paisaje y vida compartida.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-stone-100 sm:text-base">
              Recorrer la historia de Driebes es acercarse a un pueblo que ha
              sabido conservar su identidad, su herencia cultural y su vinculo
              con la tierra a traves de generaciones.
            </p>

            <div className="mt-6 grid gap-2 sm:grid-cols-3">
              <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-3 backdrop-blur-sm">
                <p className="text-lg font-semibold text-white">Patrimonio</p>
                <p className="mt-1 text-xs text-stone-200">Huellas visibles del pasado</p>
              </div>
              <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-3 backdrop-blur-sm">
                <p className="text-lg font-semibold text-white">Tradicion</p>
                <p className="mt-1 text-xs text-stone-200">Costumbres que siguen vivas</p>
              </div>
              <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-3 backdrop-blur-sm">
                <p className="text-lg font-semibold text-white">Comunidad</p>
                <p className="mt-1 text-xs text-stone-200">Una memoria construida entre todos</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto grid max-w-7xl gap-8 px-6 py-14 sm:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-10 lg:py-20">
        <div>
          <p className="tourism-kicker text-sm uppercase tracking-[0.3em] text-amber-700">
            Un viaje en el tiempo
          </p>
          <h2 className="tourism-display mt-4 text-4xl leading-tight text-stone-900 sm:text-5xl">
            La historia local como parte de la identidad del presente.
          </h2>
          <p className="mt-6 max-w-3xl text-base leading-8 text-stone-700 sm:text-lg">
            Driebes no se entiende solo a traves de sus edificios o de sus
            fechas, sino tambien a traves de la forma en que su pasado sigue
            dando sentido a la vida cotidiana. La historia aqui no es una
            reliquia aislada: es una presencia que acompana al municipio en su
            manera de habitar, celebrar y recordar.
          </p>
        </div>

        <div className="tourism-panel rounded-[2rem] p-6 sm:p-8">
          <div className="grid gap-4">
            <div className="flex items-start gap-4 rounded-2xl bg-white/80 p-4">
              <div className="rounded-2xl bg-amber-100 p-3 text-2xl text-amber-700">
                <LuClock3 />
              </div>
              <div className="text-left">
                <p className="text-sm uppercase tracking-[0.25em] text-stone-500">
                  Continuidad
                </p>
                <p className="mt-1 text-lg font-semibold text-stone-900">
                  Pasado y presente dialogan en cada rincon
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-2xl bg-white/80 p-4">
              <div className="rounded-2xl bg-emerald-100 p-3 text-2xl text-emerald-700">
                <LuUsers />
              </div>
              <div className="text-left">
                <p className="text-sm uppercase tracking-[0.25em] text-stone-500">
                  Legado
                </p>
                <p className="mt-1 text-lg font-semibold text-stone-900">
                  La memoria colectiva sostiene la identidad del pueblo
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-6 sm:px-8 lg:px-10">
        <div className="mb-10 text-left">
          <p className="tourism-kicker text-sm uppercase tracking-[0.3em] text-amber-700">
            Hitos y relatos
          </p>
          <h2 className="tourism-display mt-3 text-4xl text-stone-900 sm:text-5xl">
            Tres claves para entender la historia de Driebes
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {milestones.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="tourism-panel rounded-[2rem] border border-white/70 p-7 text-left shadow-[0_24px_60px_rgba(15,23,42,0.08)]"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-2xl text-amber-700">
                  <Icon />
                </div>
                <h3 className="tourism-display text-3xl leading-tight text-stone-900">
                  {item.title}
                </h3>
                <p className="mt-4 leading-8 text-stone-700">{item.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="relative mt-10 bg-[linear-gradient(180deg,#fffaf3_0%,#f0e1cf_100%)] py-16">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="tourism-panel overflow-hidden rounded-[2.25rem] p-3 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
              <img
                src="/img/driebesHistoria.jpg"
                alt="Patrimonio historico de Driebes"
                className="h-full min-h-[320px] w-full rounded-[1.7rem] object-cover"
              />
            </div>

            <div className="text-left">
              <p className="tourism-kicker text-sm uppercase tracking-[0.3em] text-amber-700">
                Memoria colectiva
              </p>
              <h2 className="tourism-display mt-3 text-4xl text-stone-900 sm:text-5xl">
                La historia de Driebes tambien vive en sus gentes.
              </h2>
              <div className="tourism-panel mt-8 rounded-[2rem] border border-amber-200 px-6 py-8 shadow-[0_24px_70px_rgba(120,53,15,0.12)] sm:px-8">
                <p className="text-base leading-8 text-stone-700 sm:text-lg">
                  La historia de Driebes es la historia de sus gentes, de
                  familias que han trabajado la tierra durante generaciones, de
                  vecinos que han mantenido vivas las tradiciones y de una
                  comunidad que ha sabido preservar su identidad a traves del
                  tiempo. Cada rincon del pueblo guarda recuerdos y cada
                  celebracion ayuda a mantener ese hilo que une el pasado con el
                  presente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
