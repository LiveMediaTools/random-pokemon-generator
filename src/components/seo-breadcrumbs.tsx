import { Link } from "@tanstack/react-router";

type BreadcrumbItem = {
  label: string;
  to?: string;
};

type SeoBreadcrumbsProps = {
  items: BreadcrumbItem[];
  className?: string;
  linkClassName?: string;
  currentClassName?: string;
  separatorClassName?: string;
};

export function SeoBreadcrumbs({
  items,
  className = "",
  linkClassName = "",
  currentClassName = "",
  separatorClassName = "",
}: SeoBreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className={`flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground ${className}`.trim()}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {item.to && !isLast ? (
                <Link to={item.to as any} className={`hover:underline ${linkClassName}`.trim()}>
                  {item.label}
                </Link>
              ) : (
                <span className={`text-foreground ${currentClassName}`.trim()} aria-current={isLast ? "page" : undefined}>
                  {item.label}
                </span>
              )}
              {!isLast && <span className={separatorClassName}>/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
