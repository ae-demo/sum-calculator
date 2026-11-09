import { useState, type FormEvent, type ReactElement } from "react";
import {
  Alert,
  AlertTitle,
  Button,
  Card,
  CardContent,
  Form,
  PageContent,
  PageTitle,
  Stack,
  TextField,
  Typography,
} from "@wso2/oxygen-ui";
import { sumApi } from "../api";
import { ForbiddenError } from "../authz/client";

const DECIMAL = /^-?[0-9]+(\.[0-9]+)?$/;
const FORMAT_MESSAGE = "Enter a number such as 12.5 or -3";

function validate(value: string): string | undefined {
  if (value === "") return "This field is required";
  if (!DECIMAL.test(value)) return FORMAT_MESSAGE;
  return undefined;
}

type Errors = { a?: string; b?: string };

export function CalculatorPage(): ReactElement {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [sum, setSum] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    const first = a.trim();
    const second = b.trim();
    const found: Errors = { a: validate(first), b: validate(second) };
    setUnavailable(false);
    if (found.a || found.b) {
      setErrors(found);
      setSum(null);
      return;
    }
    setErrors({});
    setPending(true);
    try {
      const { data, response } = await sumApi.POST("/sums", { body: { a: first, b: second } });
      if (response.status === 400) {
        setErrors({ a: FORMAT_MESSAGE, b: FORMAT_MESSAGE });
        setSum(null);
      } else if (data) {
        setSum(data.sum);
      } else {
        setSum(null);
        setUnavailable(true);
      }
    } catch (error) {
      if (error instanceof ForbiddenError) return; // routed to /forbidden
      setSum(null);
      setUnavailable(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>Add two numbers</PageTitle.Header>
        <PageTitle.SubHeader>Decimals and negatives are fine.</PageTitle.SubHeader>
      </PageTitle>
      <Stack spacing={3}>
        <Card variant="outlined">
          <CardContent>
            <form onSubmit={onSubmit} noValidate>
              <Form.Stack spacing={2}>
                <Typography variant="h6">Numbers</Typography>
                {unavailable && (
                  <Alert severity="error">
                    <AlertTitle>Sum unavailable</AlertTitle>
                    The calculation service is not responding. Try again in a moment.
                  </Alert>
                )}
                <TextField
                  label="First number"
                  required
                  value={a}
                  onChange={(e) => setA(e.target.value)}
                  error={Boolean(errors.a)}
                  helperText={errors.a}
                />
                <TextField
                  label="Second number"
                  required
                  value={b}
                  onChange={(e) => setB(e.target.value)}
                  error={Boolean(errors.b)}
                  helperText={errors.b}
                />
                <Stack direction="row" justifyContent="flex-end" spacing={2}>
                  <Button type="submit" variant="contained" disabled={pending}>
                    Add
                  </Button>
                </Stack>
              </Form.Stack>
            </form>
          </CardContent>
        </Card>
        {sum !== null && (
          <Card variant="outlined">
            <CardContent>
              <Typography variant="overline">Sum</Typography>
              <Typography variant="h4" data-testid="sum-result">
                {sum}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                first number + second number
              </Typography>
            </CardContent>
          </Card>
        )}
      </Stack>
    </PageContent>
  );
}
