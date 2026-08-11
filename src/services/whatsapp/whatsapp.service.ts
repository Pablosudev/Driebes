// Compartir contenido por WhatsApp.
//
// No conoce eventos, noticias ni ofertas: recibe un mensaje ya compuesto y,
// opcionalmente, un fichero. Quien elige el grupo es la persona que comparte,
// porque la Groups API oficial limita los grupos a 8 participantes y el del
// Ayuntamiento pasa de 100.

const WHATSAPP_SHARE_URL = "https://wa.me/";

/** La URL de compartir con el mensaje codificado. Expuesta para poder testearla. */
export const buildWhatsAppUrl = (message: string): string =>
  `${WHATSAPP_SHARE_URL}?text=${encodeURIComponent(message)}`;

/**
 * Si este dispositivo puede adjuntar la foto de verdad.
 *
 * Solo se da por bueno en pantallas tactiles. En escritorio la Web Share API
 * miente: `canShare` devuelve true y luego el panel del sistema no ofrece
 * WhatsApp (verificado en macOS), o la app ni siquiera esta instalada. Como no
 * hay forma de distinguirlo, en escritorio se usa siempre el enlace, que
 * funciona hasta con WhatsApp Web.
 */
export const canAttachFiles = (): boolean => {
  if (typeof matchMedia !== "function") return false;
  if (!matchMedia("(pointer: coarse)").matches) return false;
  if (typeof navigator.canShare !== "function") return false;

  const probe = new File([""], "probe.png", { type: "image/png" });
  return navigator.canShare({ files: [probe] });
};

// Por el nombre y no con instanceof: lo que llega es un DOMException, que no
// siempre hereda de Error segun el entorno.
const isAbort = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  (error as { name?: string }).name === "AbortError";

/**
 * Comparte el mensaje por WhatsApp, con la foto adjunta si se puede.
 *
 * Donde no se pueda adjuntar, abre WhatsApp con el texto: nunca deja al
 * usuario sin forma de enviar.
 */
export const shareOnWhatsApp = async (
  message: string,
  file?: File | null,
): Promise<void> => {
  // Sin mensaje no merece la pena sacar al usuario del dashboard.
  if (!message?.trim()) return;

  if (file && canAttachFiles()) {
    try {
      await navigator.share({ files: [file], text: message });
      return;
    } catch (error) {
      // Ha cancelado el panel: abrirle WhatsApp ahora seria ignorarle.
      if (isAbort(error)) return;
    }
  }

  window.open(buildWhatsAppUrl(message), "_blank");
};
