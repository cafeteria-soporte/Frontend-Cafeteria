export const formatCurrency = (value) =>
  new Intl.NumberFormat("es-BO", { style: "currency", currency: "BOB" }).format(value);

export const formatDate = (date) =>
  new Intl.DateTimeFormat("es-BO").format(new Date(date));

export const formatDateTime = (date) =>
  new Intl.DateTimeFormat("es-BO", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(date));
