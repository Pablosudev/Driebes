import CardsCasaRural from "./Cards/CardsCasaRural";

export default function CasaRural() {
  return (
    <div className="tourism-panel rounded-[2.5rem] px-6 py-10 sm:px-8 lg:px-10 lg:py-14">
      <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="relative mx-auto w-full max-w-xl">
          <div className="absolute -left-4 top-6 h-[82%] w-full rotate-[-4deg] rounded-[2rem] bg-amber-300/80" />
          <img
            src="/img/CasaRural/casaRural1.jpg"
            alt="Casa Rural Caraca"
            className="relative z-10 h-full w-full rounded-[2rem] object-cover shadow-[0_28px_80px_rgba(120,53,15,0.22)]"
          />
        </div>

        <div className="text-left">
          <p className="tourism-kicker text-sm uppercase tracking-[0.3em] text-amber-700">
            Alojamiento destacado
          </p>
          <h2 className="tourism-display mt-4 text-4xl leading-tight text-stone-900 sm:text-5xl">
            Ven a nuestra Casa Rural Caraca
          </h2>
          <p className="mt-6 text-lg leading-8 text-stone-700">
            Casa Rural Caraca es un alojamiento acogedor y perfectamente
            equipado, ideal para disfrutar de unos días en un entorno tranquilo.
            La casa dispone de 5 habitaciones: 4 dobles y 1 habitación triple.
            Dos de los dormitorios se encuentran en la planta baja. Todos ellos
            están equipados con ropa de cama. Es perfecta para familias o grupos
            de amigos.
          </p>
        </div>
      </div>

      <div className="mt-12">
        <div className="mx-auto max-w-5xl">
          <p className="text-center text-base leading-8 text-stone-700 sm:text-lg">
            Cuenta con 2 baños completos (equipados con secador, gel y champú y
            toallas), una amplia cocina-comedor totalmente equipada (tostadora,
            cafetera, lavavajillas, exprimidor eléctrico, batidora) y con salida
            al patio que dispone de barbacoa (tenemos parrillas, paellera y
            fuegos con bombona); dos salones (uno de ellos es ideal para niños).
            Además, la casa dispone de una amplia terraza en la primera planta y
            un cuarto de lavadora ideal para estancias largas. El alojamiento
            combina funcionalidad y calidez, ofreciendo espacios luminosos y
            bien distribuidos. El acceso a la casa es totalmente accesible para
            personas con movilidad reducida.
          </p>
        </div>
        <CardsCasaRural />
      </div>
    </div>
  );
}
