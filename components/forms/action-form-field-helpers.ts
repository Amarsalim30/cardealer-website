import type { ActionState } from "@/types/dealership";

export function getActionFieldError(state: ActionState, name: string) {
  return state.fieldErrors?.[name]?.[0];
}

export function getActionFieldErrorId(formId: string, name: string) {
  return `${formId}-${name}-error`;
}

export function getActionFieldState(
  state: ActionState,
  formId: string,
  name: string,
) {
  const error = getActionFieldError(state, name);
  const errorId = getActionFieldErrorId(formId, name);

  return {
    error,
    errorId,
    inputProps: {
      "aria-describedby": error ? errorId : undefined,
      "aria-invalid": error ? true : undefined,
    },
  };
}
