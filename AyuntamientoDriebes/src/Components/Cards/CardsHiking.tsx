import Hiking from "../../data/hiking.json";

export default function CardHiking() {
  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-6 py-10 sm:px-8 lg:grid-cols-2 lg:px-10 xl:grid-cols-3">
      {Hiking.map((hiking) => {
        return (
          <div
            key={hiking.id}
            className="tourism-panel flex flex-col justify-between rounded-[2rem] border border-white/70 p-7 shadow-[0_24px_60px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-2"
          >
            <div>
              <div className="mb-5 inline-flex rounded-full bg-emerald-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-800">
                Ruta recomendada
              </div>
              <h2 className="tourism-display text-3xl leading-tight text-stone-900">
                {hiking.title}
              </h2>
            </div>

            <div className="mt-8 grid gap-4">
              <div className="flex items-center justify-between rounded-2xl border border-stone-200/80 bg-white/80 px-4 py-3">
                <p className="text-sm uppercase tracking-[0.2em] text-stone-500">
                  Distancia
                </p>
                <p className="font-semibold text-stone-900">{hiking.distancia}</p>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-stone-200/80 bg-white/80 px-4 py-3">
                <p className="text-sm uppercase tracking-[0.2em] text-stone-500">
                  Dificultad
                </p>
                <p className="font-semibold text-stone-900">{hiking.dificultad}</p>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-stone-200/80 bg-white/80 px-4 py-3">
                <p className="text-sm uppercase tracking-[0.2em] text-stone-500">
                  Duración
                </p>
                <p className="font-semibold text-stone-900">{hiking.duracion}</p>
              </div>
            </div>

            <p className="mt-7 text-sm leading-7 text-stone-700">
              {hiking.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}
