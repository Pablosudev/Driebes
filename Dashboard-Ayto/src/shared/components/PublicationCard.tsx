import {
  IoCalendarClearOutline,
  IoImageOutline,
  IoLocationOutline,
} from "react-icons/io5";
import { mediaUrl } from "../apiFetch";
import { shortDateLabel } from "../dates";

interface PublicationCardProps {
  image: string | null;
  status: string;
  date: string;
  title: string;
  description: string;
  location?: string;
  finished?: boolean;
  onClick?: () => void;
}

export default function PublicationCard({
  image,
  status,
  date,
  title,
  description,
  location,
  finished = false,
  onClick,
}: PublicationCardProps) {
  return (
    <article
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`w-full max-w-60 border border-secondary-[50px] overflow-hidden rounded-2xl bg-white ${
        onClick ? "cursor-pointer transition-shadow hover:shadow-md" : ""
      }`}
    >
      <div className="relative flex h-40 items-center justify-center bg-tertiary-200">
        {image ? (
          <img
            src={mediaUrl(image)}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <IoImageOutline className="h-8 w-8 text-tertiary-500" />
        )}

        {/* Antes de la etiqueta: al ser los dos absolutos, el velo taparia el
            estado si se pintase despues. */}
        {finished && <div className="absolute inset-0 bg-neutral/30" />}

        <span className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 font-label text-xs text-neutral">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              finished ? "bg-secondary-400" : "bg-primary"
            }`}
          />
          {status}
        </span>
      </div>

      <div className="flex flex-col gap-3 p-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            {shortDateLabel(date) && (
              <span className="flex items-center gap-1.5 font-body text-xs text-secondary-500">
                <IoCalendarClearOutline className="h-3.5 w-3.5" />
                {shortDateLabel(date)}
              </span>
            )}

            {finished && (
              <span className="rounded-full bg-danger px-2.5 py-0.5 font-label text-[0.6875rem] tracking-wide text-white uppercase">
                Finalizado
              </span>
            )}
          </div>

          <h3 className="font-headline text-headline">{title}</h3>
        </div>

        <p className="font-body text-body text-secondary-500 line-clamp-2">
          {description}
        </p>

        {location && (
          <div className="flex items-center gap-1.5 font-body text-xs text-secondary-500">
            <IoLocationOutline className="h-4 w-4" />
            {location}
          </div>
        )}
      </div>
    </article>
  );
}