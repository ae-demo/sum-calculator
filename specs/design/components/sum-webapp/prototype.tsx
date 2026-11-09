import { useState, type ReactNode } from "react";
import {
  Alert, AppShell, Button, Detail, Field, Form, Heading, Screen, Section, Stat, StatGroup,
  ValidationSummary, defineApp, useDisplayState,
} from "@wso2/prototype-kit";

const user = { name: "Nimali Jayasuriya", email: "nimali@acme.example" };

function Shell({ children }: { children: ReactNode }) {
  return (
    <AppShell
      id="shell"
      user={user}
      nav={[{ id: "nav.calculator", label: "Add two numbers", to: "screen.calculator" }]}
      account="screen.account"
      signOut="screen.signed-out"
    >
      {children}
    </AppShell>
  );
}

function Calculator() {
  const state = useDisplayState();
  const [sum, setSum] = useState<string | null>(null);
  const invalid = state === "state.validation-error";
  const failed = state === "state.failed";
  return (
    <Shell>
      <Heading id="heading.calculator" text="Add two numbers" />
      <Section id="section.form" title="Numbers" subtitle="Decimals and negatives are fine.">
        {failed && (
          <Alert
            id="alert.service-down"
            tone="error"
            title="Sum unavailable"
            text="The calculation service is not responding. Try again in a moment."
          />
        )}
        {invalid && (
          <ValidationSummary id="summary.errors" issues={["First number is required", "Second number must be a number"]} />
        )}
        <Form
          id="form.sum"
          onSubmit={(values) => {
            const total = Number(values["a"]) + Number(values["b"]);
            setSum(String(Number(total.toPrecision(12))));
          }}
          actions={<Button id="btn.add" label="Add" emphasis="primary" submit />}
        >
          <Field
            id="field.a"
            name="a"
            label="First number"
            required
            defaultValue="12.5"
            pattern="-?[0-9]+(\.[0-9]+)?"
            patternMessage="Enter a number such as 12.5 or -3"
            error={invalid ? "Enter a number" : undefined}
          />
          <Field
            id="field.b"
            name="b"
            label="Second number"
            required
            defaultValue="-4.25"
            pattern="-?[0-9]+(\.[0-9]+)?"
            patternMessage="Enter a number such as 12.5 or -3"
            error={invalid ? "Enter a number" : undefined}
          />
        </Form>
      </Section>
      {sum !== null && !failed && !invalid && (
        <StatGroup>
          <Stat id="stat.sum" label="Sum" value={sum} hint="first number + second number" icon="ChartColumn" tone="success" />
        </StatGroup>
      )}
    </Shell>
  );
}

function Account() {
  return (
    <Shell>
      <Heading id="heading.account" text="Account" />
      <Detail id="detail.account" fields={[{ label: "Name", value: user.name }, { label: "Email", value: user.email }]} />
    </Shell>
  );
}

function SignedOut() {
  return (
    <Screen>
      <Heading id="heading.signed-out" text="You are signed out" />
      <Button id="btn.sign-in" label="Sign in" emphasis="primary" to="screen.calculator" />
    </Screen>
  );
}

export default defineApp({
  screens: {
    "screen.calculator": Calculator,
    "screen.account": Account,
    "screen.signed-out": SignedOut,
  },
  data: {},
});
