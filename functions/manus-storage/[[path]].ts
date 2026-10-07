// Cloudflare Pages Function: backend-served media (press kit videos, poster)
// lives under /manus-storage/*. Forward it instead of letting the SPA fallback
// answer with index.html.
import { proxyApiRequest, type ApiProxyEnv } from "../../edge/apiProxy";

type PagesContext = { request: Request; env: ApiProxyEnv };

export const onRequest = (context: PagesContext) => proxyApiRequest(context.request, context.env);
