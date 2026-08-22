import { IoNewspaperOutline } from "react-icons/io5";
import { CiSearch } from "react-icons/ci";
import { FaTag } from "react-icons/fa6";
import { Link } from "react-router-dom";
import CardNews from "../Components/Cards/CardNews";
import News from "../data/news.json";


const newsAvailable = News.map((news) => news.categoría);

export default function Noticias() {
  return (
    <>
      <div className="flex flex-col items-center gap-3 bg-black px-6 py-12 text-center sm:px-8 lg:px-10">
        <IoNewspaperOutline className="text-4xl text-yellow-500 sm:text-5xl" />
        <h1 className="text-4xl leading-none text-white sm:text-5xl lg:text-6xl">
          Noticias
        </h1>
        <p className="max-w-xl text-sm leading-6 text-white sm:text-base">
          Últimas novedades del municipio
        </p>
      </div>
      <section className="px-15">
        <div className="py-5 relative">
          <CiSearch className="text-3xl absolute  top-7 left-2" />
          <input
            type="text"
            placeholder="Buscar noticias..."
            className="pl-12 py-2 text-xl rounded-lg w-180 placeholder:text-gray-500 border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="py-4 flex gap-3">
          <div className="flex items-center gap-2 text-lg">
            <FaTag />
            <h1 className="font-bold">Categorías:</h1>
          </div>
          {newsAvailable.map((category) => (
            <button
              key={category}
              className="bg-gray-100 rounded-xl text-lg py-1 px-4"
            >
              {category}
            </button>
          ))}
        </div>
      </section>
      <section className="px-15 py-5">
        <CardNews />
      </section>
      <footer className="py-6 place-items-center bg-yellow-100">
        <h1 className="text-3xl font-bold text-black">Mantente Informado</h1>
        <p className="text-black py-2 w-150 text-center">
          Para recibir las últimas noticias y actualizaciones del municipio,
          visita regularmente esta sección o consulta los tablones de anuncios
          del Ayuntamiento.También puedes contactar con osotros para más
          información.
        </p>
        <div>
          <Link to="/contacto">
            <button className="bg-black text-yellow-500 font-bold rounded-lg my-4 py-3 px-2 text-xl min-w-[180px]">Contactar con el Ayuntamiento</button>
          </Link>
        </div>
      </footer>
    </>
  );
}
