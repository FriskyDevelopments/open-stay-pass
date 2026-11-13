// Cloudflare Pages Function: forwards every /api/* request to the Open Stay
// Pass backend so the browser only ever talks to the page origin.
import { proxyApiRequest, type ApiProxyEnv } from "../../edge/apiProxy";

type PagesContext = { request: Request; env: ApiProxyEnv };

export const onRequest = (context: PagesContext) => proxyApiRequest(context.request, context.env);
