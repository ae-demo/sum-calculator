import { canCall } from "./core";
import { OPERATIONS, isOperationKey, type OperationKey } from "./operations.gen";

export interface ScreenRoute {
  /** A stable id the App maps to a page component. */
  readonly key: string;
  /** The prototype screen's `name` as written, for the rail and the Forbidden copy. */
  readonly label: string;
  readonly path: string;
  /** The operation the screen performs (a form names its submit), or null. */
  readonly loads: OperationKey | null;
  /** Reachable before sign-in; routed above the sign-in guard. */
  readonly public?: boolean;
}

/**
 * One row per rail screen, in rail order. Account is a user-menu screen that
 * needs no operation, so it is not in this table (see App.tsx).
 */
export const SCREEN_ROUTES: readonly ScreenRoute[] = [
  { key: "calculator", label: "Add two numbers", path: "/calculator", loads: "POST /sums" },
];

// Fail loudly on a committed operations table that outlived its contract.
for (const screen of SCREEN_ROUTES) {
  if (screen.loads !== null && !isOperationKey(screen.loads)) {
    throw new Error(
      `src/authz/screens.ts: screen "${screen.label}" loads "${screen.loads}", which ` +
        `no contract declares. Re-run \`npm run gen\`, or name the operation the ` +
        `way openapi.yaml spells it.`,
    );
  }
}

/** The screens a caller can open, in rail order. */
export function reachableScreens(
  scopes: ReadonlySet<string>,
  signedIn: boolean,
): readonly ScreenRoute[] {
  return SCREEN_ROUTES.filter((screen) => {
    if (screen.public) return true;
    if (screen.loads === null) return signedIn;
    return canCall(OPERATIONS[screen.loads], scopes, signedIn);
  });
}

/** The NoAccess question: does the caller reach anything their scopes earned? */
export function hasScopedReach(scopes: ReadonlySet<string>, signedIn: boolean): boolean {
  return reachableScreens(scopes, signedIn).some((screen) => !screen.public && screen.loads !== null);
}
