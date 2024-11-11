export const formatBrlToCSV = (number) => {
  const formatted = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);

  // The substitution is made to ensure that the format is compatible with CSV, which uses a period as the decimal separator.
  return formatted.replace(/\./g, "").replace(",", ".");
};
