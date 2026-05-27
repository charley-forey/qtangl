export function formatRelativeDate(value: string | null) {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days < 1) {
    return "Updated today";
  }
  if (days === 1) {
    return "Updated yesterday";
  }
  if (days < 30) {
    return `Updated ${days}d ago`;
  }
  if (days < 365) {
    return `Updated ${Math.floor(days / 30)}mo ago`;
  }
  return `Updated ${Math.floor(days / 365)}y ago`;
}

export function isNewThisMonth(value: string | null) {
  if (!value) {
    return false;
  }
  const date = new Date(value);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()
  );
}
