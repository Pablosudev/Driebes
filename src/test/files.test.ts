import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { urlToFile } from "../shared/files";

let fetchMock: ReturnType<typeof vi.fn>;

const okResponse = (type = "image/png") =>
  ({ ok: true, status: 200, blob: async () => new Blob(["contenido"], { type }) });

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("urlToFile", () => {
  it("descarga la url y la envuelve en un File", async () => {
    fetchMock.mockResolvedValue(okResponse());

    const file = await urlToFile("http://api.test/uploads/news/plaza.png");

    expect(file).toBeInstanceOf(File);
    expect(file?.name).toBe("plaza.png");
    expect(file?.type).toBe("image/png");
  });

  it("ignora la query al deducir el nombre del fichero", async () => {
    fetchMock.mockResolvedValue(okResponse());

    const file = await urlToFile("http://api.test/uploads/plaza.png?v=2");

    expect(file?.name).toBe("plaza.png");
  });

  it("devuelve null si no hay url", async () => {
    expect(await urlToFile(undefined)).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("devuelve null si la respuesta no es correcta", async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 404 });

    expect(await urlToFile("http://api.test/no-existe.png")).toBeNull();
  });

  it("devuelve null si la descarga falla", async () => {
    // Sin conexion o bloqueado por CORS: compartir debe seguir siendo posible.
    fetchMock.mockRejectedValue(new Error("Failed to fetch"));

    expect(await urlToFile("http://api.test/uploads/plaza.png")).toBeNull();
  });
});