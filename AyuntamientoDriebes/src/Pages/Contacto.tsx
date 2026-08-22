import { LuMail } from "react-icons/lu";
import { FiMapPin } from "react-icons/fi";
import { LuSend } from "react-icons/lu";

export default function Contacto() {
  return (
    <section className="">
      <div className="flex flex-col items-center gap-3 bg-purple-600 px-6 py-12 text-white sm:px-8 sm:py-14 lg:px-10">
        <LuMail className="text-4xl sm:text-5xl" />
        <h1 className="text-4xl font-bold leading-none sm:text-5xl lg:text-6xl">
          Contacto
        </h1>
        <p className="text-sm leading-6 sm:text-base">
          Estamos a tu disposición
        </p>
      </div>
      <div className="grid grid-cols-2 gap-10 my-10 mx-12">
        <div className="flex flex-col items-start shadow-xl rounded-lg p-10 gap-5">
          <div>
            <h1 className="text-2xl text-black font-bold">
              Información de Contacto
            </h1>
            <p className="text-start py-5 text-black">
              Puedes contactar con el Ayuntamiento de Driebes a través de los
              siguientes medios.Estaremos encantados de atenderte y resolver tus
              dudas.
            </p>
          </div>

          <div className="flex items-start gap-5">
            <div className="bg-purple-500/10 rounded-lg p-2 ">
              <FiMapPin className="text-2xl" />
            </div>
            <div className="text-start ">
              <h2 className="text-black font-bold">Dirección</h2>
              <p className="text-black">
                Plaza Mayor <br /> 19116 Driebes, Guadalajara
              </p>
            </div>
          </div>
          <div className="flex items-start gap-5">
            <div className="bg-purple-500/10 rounded-lg p-2 ">
              <FiMapPin className="text-2xl" />
            </div>
            <div className="text-start ">
              <h2 className="text-black font-bold">Teléfono</h2>
              <p className="text-black">949 29 80 01</p>
            </div>
          </div>
          <div className="flex items-start gap-5">
            <div className="bg-purple-500/10 rounded-lg p-2 ">
              <FiMapPin className="text-2xl" />
            </div>
            <div className="text-start ">
              <h2 className="text-black font-bold">Email</h2>
              <p className="text-black">ayuntamiento@driebes.es</p>
            </div>
          </div>
          <div className="flex items-start gap-5">
            <div className="bg-purple-500/10 rounded-lg p-2">
              <FiMapPin className="text-2xl" />
            </div>
            <div className="text-start ">
              <h2 className="text-black font-bold">Horario de Atención</h2>
              <p className="text-black">
                Lunes a Viernes: 9:00 - 14:00 <br /> Sábados: 9:00 - 13:00
              </p>
            </div>
          </div>
        </div>
        <form
          action=""
          className="flex flex-col items-start gap-2 shadow-xl p-10 rounded-lg"
        >
          <h1 className="text-3xl text-black font-bold my-4">
            Envíanos un Mensaje
          </h1>
          <label htmlFor="nombre" className="font-bold text-black text-lg">
            Nombre completo *
          </label>
          <input
            type="text"
            id="nombre"
            required
            className="border rounded-lg w-120 text-lg py-1"
          />
          <label htmlFor="email" className="font-bold text-black text-lg">
            Email *
          </label>
          <input
            type="email"
            id="email"
            required
            className="border rounded-lg w-120 text-lg py-1"
          />
          <label htmlFor="telefono" className="font-bold text-black text-lg">
            Teléfono
          </label>
          <input
            type="tel"
            id="telefono"
            className="border rounded-lg w-120 text-lg py-1"
          />
          <label htmlFor="asunto" className="font-bold text-black text-lg">
            Asunto
          </label>
          <input
            type="text"
            id="asunto"
            className="border rounded-lg w-120 text-lg py-1"
          />
          <label htmlFor="mensaje" className="font-bold text-black text-lg">
            Mensaje *
          </label>
          <textarea
            id="mensaje"
            required
            className="border rounded-lg w-120 text-lg py-1"
          ></textarea>
          <button
            className="flex gap-2 items-center bg-purple-500 text-white rounded-lg py-1 mt-4 px-6 text-xl mx-auto"
            type="submit"
          >
            <LuSend />
            Enviar Mensaje
          </button>
        </form>
      </div>
    </section>
  );
}
