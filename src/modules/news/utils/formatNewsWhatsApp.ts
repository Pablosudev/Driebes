import { longDateLabel } from "../../../shared/dates";
import { mediaUrl } from "../../../shared/apiFetch";
import {
  clean,
  joinBlocks,
  publicLink,
} from "../../../services/whatsapp/message";
import type { NewsInterface } from "../Interfaces/newsInterface";

interface FormatOptions {
  /** A false cuando la foto se adjunta como fichero y su URL sobra en el texto. */
  includeImageUrl?: boolean;
}

/** Compone el mensaje de WhatsApp de una noticia, omitiendo lo que falte. */
export const formatNewsWhatsApp = (
  news: NewsInterface,
  { includeImageUrl = true }: FormatOptions = {},
): string =>
  joinBlocks(
    clean(news.title),
    clean(news.description),
    longDateLabel(clean(news.uploadDate)),
    // Va antes del enlace a la web porque WhatsApp solo previsualiza el primer
    // enlace del mensaje, y lo que interesa que se vea es la foto.
    includeImageUrl ? clean(mediaUrl(news.image)) : "",
    publicLink(`/noticias/${news.id}`),
  );
