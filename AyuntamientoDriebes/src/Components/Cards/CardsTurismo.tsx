import { MdOutlineCameraAlt } from "react-icons/md";
import { LiaMapSolid } from "react-icons/lia";
import { LuFootprints, LuTreePine } from "react-icons/lu";
import Turismos from "../../data/turism.json";

const IconsCard = {
  Patrimonio: <MdOutlineCameraAlt />,
  "Plaza Mayor": <LiaMapSolid />,
  "Rutas de Senderismo": <LuFootprints />,
  "Paisaje Rural": <LuTreePine />,
};

export default function CardTurismo() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {Turismos.map((turismo) => {
        const iconRender =
          IconsCard[turismo.title as keyof typeof IconsCard] ?? (
            <MdOutlineCameraAlt />
          );

        return (
          <div
            key={turismo.id}
            className="group tourism-panel flex h-full min-h-[320px] flex-col rounded-[2rem] border border-white/70 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-2 hover:shadow-[0_28px_80px_rgba(120,53,15,0.16)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="rounded-2xl bg-amber-100 p-4 text-2xl text-amber-700 shadow-sm transition duration-300 group-hover:scale-105">
                {iconRender}
              </div>
              
            </div>

            <div className="mt-6 flex flex-1 flex-col">
              <div className="min-h-[2.5rem]">
                <button className="rounded-full border border-amber-200 bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                  {turismo.category}
                </button>
              </div>
              <div className="mt-5 min-h-[6rem]">
                <h2 className="tourism-display text-3xl leading-tight text-stone-900">
                  {turismo.title}
                </h2>
              </div>
              <p className="mt-4 text-sm leading-7 text-stone-700">
                {turismo.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
