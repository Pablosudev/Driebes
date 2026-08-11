import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import PublicationCard from "../shared/components/PublicationCard";

const base = {
  image: null,
  status: "PUBLICADO",
  date: "2026-09-08T18:00:00.000Z",
  title: "Fiesta de Verano",
  description: "Celebración organizada por el Ayuntamiento.",
};

beforeEach(() => {
  vi.stubEnv("VITE_API_URL", "http://api.test");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("PublicationCard - la fecha", () => {
  it("se muestra como dia/mes/año", () => {
    render(<PublicationCard {...base} />);

    expect(screen.getByText("08/09/2026")).toBeInTheDocument();
  });

  it("no se muestra en el formato ISO que devuelve la API", () => {
    render(<PublicationCard {...base} />);

    expect(screen.queryByText(/2026-09-08/)).not.toBeInTheDocument();
  });

  it("va en el mismo bloque que el titulo y la descripcion", () => {
    render(<PublicationCard {...base} />);
    const titulo = screen.getByRole("heading", { level: 3 });

    expect(titulo.parentElement).toContainElement(screen.getByText("08/09/2026"));
  });

  it("no se pinta encima de la imagen", () => {
    const { container } = render(
      <PublicationCard {...base} image="/uploads/news/plaza.png" />,
    );
    const imagen = container.querySelector("img");

    expect(imagen?.parentElement).not.toContainElement(
      screen.getByText("08/09/2026"),
    );
  });

  it("no deja hueco si la fecha viene vacia", () => {
    render(<PublicationCard {...base} date="" />);

    expect(screen.queryByText("//")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3 })).toBeInTheDocument();
  });
});

describe("PublicationCard - lo ya finalizado", () => {
  it("no marca nada por defecto", () => {
    render(<PublicationCard {...base} />);

    expect(screen.queryByText("Finalizado")).not.toBeInTheDocument();
  });

  it("avisa de que ha finalizado cuando se le indica", () => {
    render(<PublicationCard {...base} finished />);

    expect(screen.getByText("Finalizado")).toBeInTheDocument();
  });

  it("sigue mostrando la fecha y el titulo de lo finalizado", () => {
    render(<PublicationCard {...base} finished />);

    expect(screen.getByText("08/09/2026")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
      "Fiesta de Verano",
    );
  });
});

describe("PublicationCard - la etiqueta de estado", () => {
  it("muestra el texto que recibe", () => {
    render(<PublicationCard {...base} status="PUBLICADO" />);

    expect(screen.getByText("PUBLICADO")).toBeInTheDocument();
  });

  it("sirve igual para la categoria de un evento", () => {
    // La tarjeta no sabe de categorias: cada modulo decide que poner ahi.
    render(<PublicationCard {...base} status="Festivo" />);

    expect(screen.getByText("Festivo")).toBeInTheDocument();
    expect(screen.queryByText("PUBLICADO")).not.toBeInTheDocument();
  });
});
