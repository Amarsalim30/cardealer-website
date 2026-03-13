export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  as = "h2",
}: {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
  as?: "h1" | "h2";
}) {
  const HeadingTag = as;

  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : ""}>
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-primary">
        {eyebrow}
      </p>
      <HeadingTag className="display-font text-balance text-3xl text-stone-950 sm:text-4xl">
        {title}
      </HeadingTag>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600 sm:text-base">
        {description}
      </p>
    </div>
  );
}
