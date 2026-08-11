import {
  clean,
  joinBlocks,
  publicLink,
} from "../../../services/whatsapp/message";
import type { JobInterface } from "../Interfaces/JobsInterfaces";

/** Como llegar a la oferta. Ambos campos son opcionales en la API. */
const contactBlock = (job: JobInterface): string => {
  const phone = clean(job.phone);
  const email = clean(job.email);

  return [phone && `Teléfono: ${phone}`, email && `Email: ${email}`]
    .filter(Boolean)
    .join("\n");
};

const labelled = (label: string, value: string | null | undefined): string => {
  const text = clean(value);
  return text ? `${label}:\n${text}` : "";
};

/**
 * Compone el mensaje de WhatsApp de una oferta, omitiendo lo que falte.
 *
 * A diferencia de eventos y noticias, las ofertas no tienen imagen: no hay
 * nada que adjuntar, asi que aqui no aplica la variante sin URL de foto.
 */
export const formatJobWhatsApp = (job: JobInterface): string =>
  joinBlocks(
    clean(job.title),
    clean(job.companyName) && `Empresa: ${clean(job.companyName)}`,
    clean(job.description),
    labelled("Requisitos", job.requirements),
    contactBlock(job),
    publicLink(`/ofertas/${job.id}`),
  );
