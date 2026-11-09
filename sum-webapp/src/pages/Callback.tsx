import { useEffect, useRef, type ReactElement } from "react";
import { Box, Typography } from "@wso2/oxygen-ui";
import { handleCallback } from "../authz/session";

/** OIDC redirect target. Dispatches the redirect or silent leg exactly once. */
export function CallbackPage(): ReactElement {
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void handleCallback().then(
      () => window.location.replace(window.location.origin),
      (error: unknown) => console.error("sign-in callback failed", error),
    );
  }, []);
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="body1">Signing you in…</Typography>
    </Box>
  );
}
