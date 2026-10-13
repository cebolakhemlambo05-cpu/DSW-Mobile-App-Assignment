export function fmt(value) {
  const amount = Number(value || 0);
  return `R${Math.round(amount).toLocaleString("en-ZA")}`;
}

export function shortDate(value) {
  if (!value) return "Flexible";
  return new Date(value).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
  });
}
