export function formatTaskFilename(
  username: string,
  ext: string,
  roleOrLabel?: string,
): string {
  const cleanName = username
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const nameSlug = cleanName || "user";

  let roleSlug = "";
  if (roleOrLabel) {
    roleSlug = roleOrLabel
      .toLowerCase()
      .replace("task", "")
      .replace("pdf", "")
      .replace("upload", "")
      .trim()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  if (roleSlug) {
    return `${nameSlug}-${roleSlug}-task.${ext}`;
  }
  return `${nameSlug}-task.${ext}`;
}
