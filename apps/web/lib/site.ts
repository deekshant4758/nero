const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");

function withBasePath(path: string) {
  if (!basePath || path.startsWith("http") || path.startsWith("#")) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (normalizedPath === "/") {
    return `${basePath}/`;
  }

  if (normalizedPath.includes("#")) {
    return `${basePath}${normalizedPath}`;
  }

  return `${basePath}${normalizedPath.endsWith("/") ? normalizedPath : `${normalizedPath}/`}`;
}

export const siteConfig = {
  name: "nero",
  title: "nero",
  description: "Beautiful insights. Your data never leaves your PC.",
  repoUrl: "https://github.com/deekshant4758/nero",
  docsHref: withBasePath("/docs"),
  changelogHref: withBasePath("/changelog"),
  privacyHref: withBasePath("/privacy"),
  termsHref: withBasePath("/terms"),
  communityHref: withBasePath("/community"),
  downloadHref: withBasePath("/downloads"),
  supportHref: withBasePath("/#support"),
};
