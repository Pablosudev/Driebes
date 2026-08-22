export default function CardsCasaRural() {
  const images = [
    "/img/CasaRural/casaRural2.jpg",
    "/img/CasaRural/casaRural3.jpg",
    "/img/CasaRural/casaRural4.jpg",
    "/img/CasaRural/casaRural5.jpg",
    "/img/CasaRural/casaRural6.jpg",
    "/img/CasaRural/casaRural7.jpg",
    "/img/CasaRural/casaRural8.jpg",
    "/img/CasaRural/casaRural9.jpg",
    "/img/CasaRural/casaRural10.jpg",
    "/img/CasaRural/casaRural11.jpg",
    "/img/CasaRural/casaRural12.jpg",
    "/img/CasaRural/casaRural13.jpg",
    "/img/CasaRural/casaRural14.jpg",
    "/img/CasaRural/casaRural15.jpg",
  ];

  return (
    <div className="mt-10 w-full px-20">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {images.map((img, idx) => (
          <div
            key={idx}
            className="group overflow-hidden rounded-[1.5rem] border border-white/70 bg-white/70 shadow-[0_18px_45px_rgba(15,23,42,0.10)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(120,53,15,0.14)]"
          >
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src={img}
                alt="Casa Rural Caraca"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
