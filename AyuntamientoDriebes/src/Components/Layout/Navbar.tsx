import { useState } from "react";
import { Link } from "react-router-dom";
import { FiChevronDown, FiMenu, FiX } from "react-icons/fi";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const links = [
    { href: "/turismo", label: "Turismo" },
    { href: "/eventos", label: "Eventos" },
    { href: "/noticias", label: "Noticias" },
    { href: "/empresas", label: "Empresas" },
    { href: "/servicios", label: "Servicios" },
    { href: "/contacto", label: "Contacto" },
  ];

  const historyLinks = [
    { href: "/historia", label: "Historia de Driebes" },
    { href: "/historia/caraca", label: "Historia de Caraca" },
  ];

  return (
    <nav className="border-b-7 border-yellow-500 bg-black px-4 py-5 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-yellow-500">
          <img src="/public/img/Logo.png" className=" h-10 sm:h-12  " />
          <div className="text-left">
            <h3 className="text-base font-bold sm:text-lg">Driebes</h3>
            <h4 className="text-sm sm:text-base">Guadalajara</h4>
          </div>
        </div>

        <button
          type="button"
          className="rounded-md p-2 text-white transition hover:bg-white/10 lg:hidden"
          aria-label={isOpen ? "Cerrar menu" : "Abrir menu"}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          {isOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
        </button>

        <ul className="hidden items-center gap-3 text-sm text-white lg:grid lg:grid-cols-4 xl:grid-cols-8">
          <li className="text-center">
            <Link
              to="/"
              className="inline-block border-b-2 border-transparent pb-1 transition hover:border-yellow-500 hover:text-yellow-500"
            >
              Inicio
            </Link>
          </li>

          <li className="relative text-center">
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 border-b-2 border-transparent pb-1 text-center transition hover:border-yellow-500 hover:text-yellow-500"
              onClick={() => setIsHistoryOpen((prev) => !prev)}
              aria-expanded={isHistoryOpen}
            >
              Historia
              <FiChevronDown
                className={`transition ${isHistoryOpen ? "rotate-180" : ""}`}
              />
            </button>

            <div
              className={`absolute left-1/2 top-full z-20 mt-3 w-60 -translate-x-1/2 rounded-2xl border border-white/10 bg-stone-950/95 p-2 text-left shadow-[0_20px_50px_rgba(0,0,0,0.35)] transition ${
                isHistoryOpen ? "visible opacity-100" : "invisible opacity-0"
              }`}
            >
              {historyLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="block rounded-xl px-4 py-3 transition hover:bg-white/10 hover:text-yellow-500"
                  onClick={() => setIsHistoryOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </li>

          {links.map((link) => (
            <li key={link.href} className="text-center">
              <Link
                to={link.href}
                className="inline-block border-b-2 border-transparent pb-1 transition hover:border-yellow-500 hover:text-yellow-500"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {isOpen && (
        <ul className="mx-auto mt-4 grid max-w-7xl gap-2 border-t border-white/15 pt-4 text-white lg:hidden">
          <li>
            <Link
              to="/"
              className="block rounded-md px-3 py-2 transition hover:bg-white/10 hover:text-yellow-500"
              onClick={() => setIsOpen(false)}
            >
              Inicio
            </Link>
          </li>

          <li>
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left transition hover:bg-white/10 hover:text-yellow-500"
              onClick={() => setIsHistoryOpen((prev) => !prev)}
              aria-expanded={isHistoryOpen}
            >
              Historia
              <FiChevronDown
                className={`transition ${isHistoryOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isHistoryOpen && (
              <div className="mt-2 grid gap-2 pl-3">
                {historyLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="block rounded-md px-3 py-2 text-sm text-stone-200 transition hover:bg-white/10 hover:text-yellow-500"
                    onClick={() => {
                      setIsHistoryOpen(false);
                      setIsOpen(false);
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </li>

          {links.map((link) => (
            <li key={link.href}>
              <Link
                to={link.href}
                className="block rounded-md px-3 py-2 transition hover:bg-white/10 hover:text-yellow-500"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
