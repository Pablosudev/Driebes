import News from "../../data/news.json";
import { CiCalendar } from "react-icons/ci";
import { useState } from "react";
import { FaCaretRight } from "react-icons/fa6";

export default function CardNews() {
  const [openMoreId, setOpenMoreId] = useState<string | number | null>(null);

  return (
    <div className="grid grid-cols-3 gap-10">
      {News.map((news) => {
        const isOpen = openMoreId === news.id;
        const spacerHeight = openMoreId ? "h-40" : "h-0";

        return (
          <div
            key={news.id}
            className="shadow-xl rounded-xl flex h-full flex-col gap-4 p-6 max-w-200"
          >
            <div className="grid min-h-[4.5rem] grid-cols-2 items-start gap-3">
              <div className="bg-yellow-100 py-2 p-4 mx-auto rounded-xl text-yellow-700 font-bold">
                {news.categoría}
              </div>
              <div className="flex items-center gap-2">
                <CiCalendar />
                {news.fecha}
              </div>
            </div>
            <div className="min-h-[3.5rem]">
              <h2 className="text-xl text-black font-bold">{news.title}</h2>
            </div>
            <div className="min-h-[4rem]">
              <p className="text-gray-700 text-sm">{news.description}</p>
            </div>

            <div className="flex items-center gap-1 text-yellow-600 font-bold cursor-pointer"
              onClick={() => setOpenMoreId(isOpen ? null : news.id)}
            >
              <FaCaretRight />
              Leer más
            </div>
            <div className={`overflow-hidden transition-all duration-300 ${spacerHeight}`}>
              {isOpen ? (
                <div className="h-40">
                  <p className="text-gray-700 mb-2">{news.info}</p>
                </div>
              ) : (
                <div className="h-40"></div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
