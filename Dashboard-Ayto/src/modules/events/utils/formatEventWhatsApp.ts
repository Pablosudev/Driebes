import { longDateLabel } from "../../../shared/dates";
import { mediaUrl } from "../../../shared/apiFetch";
import {
  clean,
  joinBlocks,
  publicLink,
} from "../../../services/whatsapp/message";
import type { EventInterface } from "../Interfaces/EventsInterface";

/** Cuando y de que va, en un solo bloque para no airear el mensaje. */
const whenBlock = (event: EventInterface): string => {
  const category = clean(event.category);

  return [
    longDateLabel(clean(event.eventDate)),
    // "Otro" no aparece: una categoria generica no le dice nada al vecino.
    category !== "Otro" && category && `Categoría: ${category}`,
  ]
    .filter(Boolean)
    .join("\n");
};

interface FormatOptions {
  /** A false cuando la foto se adjunta como fichero y su URL sobra en el texto. */
  includeImageUrl?: boolean;
}

/** Compone el mensaje de WhatsApp de un evento, omitiendo lo que falte. */
export const formatEventWhatsApp = (
  event: EventInterface,
  { includeImageUrl = true }: FormatOptions = {},
): string =>
  joinBlocks(
    clean(event.title),
    clean(event.description),
    whenBlock(event),
    // Va antes del enlace a la web porque WhatsApp solo previsualiza el primer
    // enlace del mensaje, y lo que interesa que se vea es el cartel.
    includeImageUrl ? clean(mediaUrl(event.image)) : "",
    publicLink(`/eventos/${event.id}`),
  );
