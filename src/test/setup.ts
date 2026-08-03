// Setup global de los tests. No es un fichero de test: vitest solo lo carga
// porque esta declarado en `test.setupFiles` de vite.config.ts.

// Añade los matchers de jest-dom (toBeDisabled, toBeInTheDocument...).
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Desmonta lo renderizado despues de cada test para que no se filtre al
// siguiente. Sin esto, dos render() dejan dos formularios en el documento y las
// queries por rol fallan con "found multiple elements".
afterEach(() => {
  cleanup();
});
