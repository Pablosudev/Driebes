// Declaración mínima para formidable v3 (no incluye tipos propios).
declare module 'formidable' {
  import type { IncomingMessage } from 'http';

  interface File {
    originalFilename: string | null;
    newFilename: string;
    filepath: string;
    mimetype: string | null;
    size: number;
  }

  type Fields = Record<string, string | string[] | undefined>;
  type Files = Record<string, File | File[] | undefined>;

  interface Options {
    multiples?: boolean;
    [key: string]: unknown;
  }

  interface Formidable {
    parse(
      req: IncomingMessage,
      callback: (err: Error | null, fields: Fields, files: Files) => void,
    ): void;
  }

  function formidable(options?: Options): Formidable;
  export default formidable;
}
