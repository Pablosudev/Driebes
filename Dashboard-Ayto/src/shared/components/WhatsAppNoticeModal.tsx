import { useEffect } from "react";
import { IoClose, IoPhonePortraitOutline } from "react-icons/io5";

interface WhatsAppNoticeModalProps {
  onConfirm: () => void;
  onClose: () => void;
}

/**
 * Aviso previo a compartir desde un equipo que no puede adjuntar la foto.
 *
 * Solo se muestra cuando la publicacion tiene imagen: sin ella, compartir
 * desde el ordenador da el mismo resultado que desde el movil.
 */
export default function WhatsAppNoticeModal({
  onConfirm,
  onClose,
}: WhatsAppNoticeModalProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral/50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-full w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-headline text-headline">Atención</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-md p-1 text-secondary-400 transition-colors hover:bg-tertiary-100 hover:text-secondary-600"
          >
            <IoClose className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 flex gap-3 rounded-xl bg-tertiary-100 p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-whatsapp text-white">
            <IoPhonePortraitOutline className="h-5 w-5" />
          </span>
          <p className="font-body text-body">
            Para un correcto envío, la publicación deberá hacerse a través del
            móvil.
          </p>
        </div>

        <p className="mt-3 font-body text-xs text-secondary-500">
          Desde este equipo la imagen se enviará como enlace en lugar de como
          foto adjunta.
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-tertiary-300 px-4 py-2 font-label text-label text-secondary-600 transition-colors hover:bg-tertiary-100"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-whatsapp px-4 py-2 font-label text-label text-white transition-colors hover:bg-whatsapp-600"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}
