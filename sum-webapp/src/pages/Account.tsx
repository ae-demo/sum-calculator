import { useEffect, useState, type ReactElement } from "react";
import { Card, CardContent, CardHeader, Grid, PageContent, PageTitle, Typography } from "@wso2/oxygen-ui";
import { currentUser } from "../authz/session";

export function AccountPage(): ReactElement {
  const [who, setWho] = useState<{ name: string; email: string }>({ name: "", email: "" });
  useEffect(() => {
    void currentUser().then((user) => {
      const profile = (user?.profile ?? {}) as Record<string, unknown>;
      setWho({
        name: typeof profile.name === "string" ? profile.name : String(profile.sub ?? ""),
        email: typeof profile.email === "string" ? profile.email : "",
      });
    });
  }, []);
  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>Account</PageTitle.Header>
      </PageTitle>
      <Card variant="outlined">
        <CardHeader title="Your account" />
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="overline">Name</Typography>
              <Typography variant="body2">{who.name}</Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="overline">Email</Typography>
              <Typography variant="body2">{who.email}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </PageContent>
  );
}
