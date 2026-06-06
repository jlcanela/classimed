type WebsiteEnv = {
  BACKEND: {
    fetch(request: Request): Promise<Response>;
  };
  WEBSITE: {
    fetch(request: Request): Promise<Response>;
  };
};

export default {
  async fetch(request: Request, env: WebsiteEnv): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    if (pathname === "/api" || pathname.startsWith("/api/")) {
      url.pathname = pathname === "/api" ? "/" : pathname.slice(4);
      return env.BACKEND.fetch(new Request(url.toString(), request));
    }

    return env.WEBSITE.fetch(request);
  },
};
