import {
  IoCalendarClearOutline,
  IoImageOutline,
  IoLocationOutline,
} from "react-icons/io5";
import { mediaUrl } from "../apiFetch";

interface PublicationCardProps {
  image: string | null;
  status: string;
  date: string;
  title: string;
  description: string;
  location?: string;
  onClick?: () => void;
}

export default function PublicationCard({
  image,
  status,
  date,
  title,
  description,
  location,
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

        <span className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 font-label text-xs text-neutral">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          {status}
        </span>

        <span className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 font-label text-xs text-neutral">
          <IoCalendarClearOutline className="h-3.5 w-3.5" />
          {date}
        </span>
      </div>

      <div className="flex flex-col gap-3 p-4">
        <h3 className="font-headline text-headline">{title}</h3>

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