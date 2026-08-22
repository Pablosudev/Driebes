import CardsTurismo from "../Components/Cards/CardsTurismo";
import CardsHiking from "../Components/Cards/CardsHiking";
import CasaRural from "../Components/CasaRural";
import { IoIosRestaurant } from "react-icons/io";
import { LuBedDouble, LuCompass, LuTrees } from "react-icons/lu";

export default function Turismo() {
  return (
    <div className="tourism-page overflow-hidden bg-[#f6efe5] text-slate-900">
      <section
        className="relative min-h-[68vh] overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: 'url("/img/hermita.jpg")',
          backgroundPosition: "center 90%",
        }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(17,24,39,0.82),rgba(17,24,39,0.44),rgba(180,83,9,0.28))]" />
        <div className="absolute -left-16 top-16 h-44 w-44 rounded-full bg-amber-300/20 blur-3xl" />
        <div className="absolute bottom-8 right-0 h-56 w-56 rounded-full bg-orange-900/20 blur-3xl" />

        <div className="relative mx-auto flex min-h-[68vh] max-w-6xl items-center px-6 py-12 sm:px-8 lg:px-10">
          <div className="tourism-glass max-w-3xl rounded-[1.75rem] p-6 text-left text-white shadow-[0_24px_65px_rgba(15,23,42,0.32)] sm:p-8 lg:p-10">
            <p className="tourism-kicker mb-3 text-xs uppercase tracking-[0.3em] text-amber-200">
              Turismo en Driebes
            </p>
            <h1 className="tourism-display text-4xl leading-none sm:text-5xl lg:text-6xl">
              Un viaje entre piedra, silencio y paisaje.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-stone-100 sm:text-base">
              Patrimonio, naturaleza y tradición se encuentran en una escapada
              pensada para caminar despacio, mirar mejor y disfrutar de la
              esencia de la Alcarria.
            </p>
            <div className="mt-6 grid gap-2 sm:grid-cols-3">
              <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-3 backdrop-blur-sm">
                <p className="text-lg font-semibold text-white">Historia viva</p>
                <p className="mt-1 text-xs text-stone-200">Iglesia, plaza y legado rural</p>
              </div>
              <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-3 backdrop-blur-sm">
                <p className="text-lg font-semibold text-white">Rutas tranquilas</p>
                <p className="mt-1 text-xs text-stone-200">Senderos para todos los ritmos</p>
              </div>
              <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-3 backdrop-blur-sm">
                <p className="text-lg font-semibold text-white">Escapada local</p>
                <p className="mt-1 text-xs text-stone-200">Gastronomí­a y descanso rural</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto grid max-w-7xl gap-8 px-6 py-14 sm:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-10 lg:py-20">
        <div>
          <p className="tourism-kicker text-sm uppercase tracking-[0.3em] text-amber-700">
            Bienvenido
          </p>
          <h2 className="tourism-display mt-4 text-4xl leading-tight text-stone-900 sm:text-5xl">
            Un pueblo pequeño con una presencia enorme.
          </h2>
          <p className="mt-6 max-w-3xl text-base leading-8 text-stone-700 sm:text-lg">
            Driebes te invita a descubrir su patrimonio histórico, disfrutar
            de sus paisajes naturales y vivir la autenticidad de un entorno que
            conserva sus tradiciones. Es un destino perfecto para quienes
            buscan calma, identidad y una conexión real con el territorio.
          </p>
        </div>

        <div className="tourism-panel rounded-[2rem] p-6 sm:p-8">
          <div className="grid gap-4">
            <div className="flex items-start gap-4 rounded-2xl bg-white/80 p-4">
              <div className="rounded-2xl bg-amber-100 p-3 text-2xl text-amber-700">
                <LuCompass />
              </div>
              <div className="text-left">
                <p className="text-sm uppercase tracking-[0.25em] text-stone-500">
                  Esencia
                </p>
                <p className="mt-1 text-lg font-semibold text-stone-900">
                  Turismo sereno y con identidad
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-2xl bg-white/80 p-4">
              <div className="rounded-2xl bg-emerald-100 p-3 text-2xl text-emerald-700">
                <LuTrees />
              </div>
              <div className="text-left">
                <p className="text-sm uppercase tracking-[0.25em] text-stone-500">
                  Entorno
                </p>
                <p className="mt-1 text-lg font-semibold text-stone-900">
                  Naturaleza, senderos y horizonte abierto
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-6 sm:px-8 lg:px-10">
        <div className="mb-10 text-left">
          <p className="tourism-kicker text-sm uppercase tracking-[0.3em] text-amber-700">
            Lugares con carácter
          </p>
          <h2 className="tourism-display mt-3 text-4xl text-stone-900 sm:text-5xl">
            Rincones que definen la visita
          </h2>
        </div>
        <CardsTurismo />
      </section>

      <section className="relative mt-10 bg-[linear-gradient(180deg,#fffaf3_0%,#f0e1cf_100%)] py-16">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
          <div className="max-w-3xl text-left">
            <p className="tourism-kicker text-sm uppercase tracking-[0.3em] text-amber-700">
              Senderismo
            </p>
            <h2 className="tourism-display mt-3 text-4xl text-stone-900 sm:text-5xl">
              Caminos para descubrir Driebes a otro ritmo
            </h2>
            <p className="mt-5 text-base leading-8 text-stone-700 sm:text-lg">
              Explora los alrededores del pueblo a través de rutas señalizadas
              que atraviesan campos, olivares y puntos de interés histórico.
              Cada recorrido ofrece una forma distinta de leer el paisaje.
            </p>
          </div>
        </div>

        <CardsHiking />

        <section className="mx-auto mt-6 w-[calc(100%-3rem)] max-w-5xl rounded-[2rem] border border-amber-200 bg-white/80 px-6 py-8 shadow-[0_24px_70px_rgba(120,53,15,0.12)] backdrop-blur-sm sm:px-8">
          <h3 className="tourism-display text-left text-3xl text-stone-900">
            Recomendación para senderistas
          </h3>
          <ul className="mt-4 space-y-3 text-left text-stone-700">
            <li>Lleva calzado cómodo y apropiado para caminar</li>
            <li>No olvides agua y protección solar</li>
            <li>Respeta la naturaleza y no dejes residuos</li>
            <li>Consulta el tiempo antes de salir</li>
            <li>Informa a alguien de tu ruta prevista</li>
          </ul>
        </section>

        <section className="mx-auto mt-18 max-w-7xl px-6 sm:px-8 lg:px-10">
          <div className="max-w-3xl text-left">
            <p className="tourism-kicker text-sm uppercase tracking-[0.3em] text-amber-700">
              Información práctica
            </p>
            <h2 className="tourism-display mt-3 text-4xl text-stone-900 sm:text-5xl">
              Todo listo para planificar la escapada
            </h2>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="tourism-panel rounded-[2rem] p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
              <div className="mb-6 flex items-center gap-4">
                <div className="rounded-2xl bg-amber-100 p-3 text-4xl text-amber-700">
                  <IoIosRestaurant />
                </div>
                <h3 className="tourism-display text-3xl text-stone-900">Gastronomía</h3>
              </div>
              <p className="text-left leading-8 text-stone-700">
                Disfruta de nuestra gastronomía local. <br /> Productos locales
                de calidad y recetas tradicionales que deleitarán tu paladar.
              </p>
              <h4 className="mt-6 text-left text-sm font-semibold uppercase tracking-[0.25em] text-stone-500">
                Opciones locales
              </h4>
              <ul className="mt-4 space-y-3 text-left text-stone-800">
                <li>Bar restaurante Higuera</li>
                <li>Taberna La Plaza</li>
                <li>Casa Nadia</li>
              </ul>
            </div>

            <div className="tourism-panel rounded-[2rem] p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
              <div className="mb-6 flex items-center gap-4">
                <div className="rounded-2xl bg-emerald-100 p-3 text-4xl text-emerald-700">
                  <LuBedDouble />
                </div>
                <h3 className="tourism-display text-3xl text-stone-900">Alojamiento</h3>
              </div>
              <p className="text-left leading-8 text-stone-700">
                Encuentra opciones acogedoras para convertir la visita en una
                escapada completa, con el encanto de los alojamientos rurales y
                la cercanía de otros municipios de la zona.
              </p>
              <h4 className="mt-6 text-left text-sm font-semibold uppercase tracking-[0.25em] text-stone-500">
                Opciones cercanas
              </h4>
              <ul className="mt-4 space-y-3 text-left text-stone-800">
                <li>Casa Rural Caraca</li>
                <li>Hoteles en pueblos cercanos</li>
                <li>Apartamentos turísticos</li>
                <li>Hostales y pensiones</li>
              </ul>
            </div>
          </div>
        </section>

        <div className="mx-auto mt-18 max-w-7xl px-6 sm:px-8 lg:px-10">
          <CasaRural />
          <div className="mt-10 flex justify-center">
            <button className="rounded-full border border-stone-900 bg-stone-900 px-8 py-4 text-sm font-semibold uppercase tracking-[0.25em] text-white transition hover:-translate-y-0.5 hover:border-amber-700 hover:bg-amber-700">
              Contacto Casa Rural Caraca
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
