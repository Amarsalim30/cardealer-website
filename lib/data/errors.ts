export type RepositoryUnavailableCode =
  | "admin_unavailable"
  | "persistence_unavailable";

export class RepositoryUnavailableError extends Error {
  code: RepositoryUnavailableCode;

  constructor(code: RepositoryUnavailableCode, message: string) {
    super(message);
    this.code = code;
    this.name = "RepositoryUnavailableError";
  }
}

export function isRepositoryUnavailableError(
  error: unknown,
): error is RepositoryUnavailableError {
  return error instanceof RepositoryUnavailableError;
}
