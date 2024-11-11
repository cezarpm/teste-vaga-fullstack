export const calculateInstallmentAmount = (
  totalAmount,
  numberOfInstallments
) => {
  const installmentAmountInCents =
    (totalAmount * 100) / parseInt(numberOfInstallments) / 100;

  return installmentAmountInCents.toFixed(2).toString();
};
