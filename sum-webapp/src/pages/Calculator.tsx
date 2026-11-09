import type { ReactElement } from "react";
import { PageContent, PageTitle } from "@wso2/oxygen-ui";

/** Foundation placeholder: the sum form is feature F1. */
export function CalculatorPage(): ReactElement {
  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>Add two numbers</PageTitle.Header>
        <PageTitle.SubHeader>Decimals and negatives are fine.</PageTitle.SubHeader>
      </PageTitle>
    </PageContent>
  );
}
