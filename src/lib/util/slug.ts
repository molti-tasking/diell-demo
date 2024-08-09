const slugify = (text: string) =>
  text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");

export const getProductSlug = (
  title: string | null,
  vendor?: string | null,
  manufacturer?: string | null
) => {
  return slugify(title + " " + (vendor ?? "") + (manufacturer ?? ""));
};
