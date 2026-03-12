export function FieldError({
  error,
  id,
  className = "mt-2 text-sm text-red-600",
}: {
  error?: string;
  id: string;
  className?: string;
}) {
  if (!error) {
    return null;
  }

  return (
    <p id={id} className={className} role="alert">
      {error}
    </p>
  );
}
