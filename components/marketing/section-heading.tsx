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
      <p className="mb-2 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-accent sm:mb-3 sm:text-xs sm:tracking-[0.28em]">
        {eyebrow}
      </p>
      <HeadingTag className="text-balance text-[1.8rem] font-semibold leading-tight tracking-tight text-text-primary sm:text-[2.25rem]">
        {title}
      </HeadingTag>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary sm:mt-4 sm:text-base sm:leading-7">
        {description}
      </p>
    </div>
  );
}
