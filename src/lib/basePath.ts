const baseUrl = import.meta.env.BASE_URL;

export const routerBasename =
  baseUrl === "/" || baseUrl === "./" ? undefined : baseUrl.replace(/\/$/, "");

export const publicAssetUrl = (path: string) =>
  `${baseUrl}${path.replace(/^\//, "")}`;
