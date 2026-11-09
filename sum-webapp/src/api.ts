import createClient from "openapi-fetch";
import type { paths } from "./generated/sum-api";
import { ForbiddenError, authorizationHeader, classifyResponse } from "./authz/client";

export const sumApi = createClient<paths>({ baseUrl: "/api" });

sumApi.use({
  async onRequest({ request }) {
    const header = await authorizationHeader();
    if (header) request.headers.set("Authorization", header);
    return request;
  },
  async onResponse({ response }) {
    if ((await classifyResponse(response.status)) === "forbidden") {
      throw new ForbiddenError(response.status);
    }
    return response;
  },
});
