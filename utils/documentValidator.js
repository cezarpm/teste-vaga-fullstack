export const validateDocument = (string) => {
  const sanitized = string.replace(/[^\d]+/g, "");

  if (sanitized.length == 11) return validateCPF(sanitized);
  if (sanitized.length == 14) return validateCNPJ(sanitized);

  return "Tamanho de CPF/CNPJ Inválido";
};

const validateCNPJ = (string) => {
  const digits = string.split("").map(Number);
  const first12Digits = digits.slice(0, 12);

  const firstDigitVerificator = calculateDigitVerificator(
    calculateSum(first12Digits, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
  );

  const secondDigitVerificator = calculateDigitVerificator(
    calculateSum(
      first12Digits.concat(firstDigitVerificator),
      [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    )
  );

  const isValid =
    digits[12] === firstDigitVerificator &&
    digits[13] === secondDigitVerificator;

  return isValid ? "CNPJ válido" : "CNPJ inválido";
};

const validateCPF = (string) => {
  const digits = string.split("").map(Number);
  const firstNineDigits = digits.slice(0, 9);

  const firstDigitVerificator = calculateDigitVerificator(
    calculateSum(firstNineDigits, [10, 9, 8, 7, 6, 5, 4, 3, 2])
  );

  const firstNineDigitsAndFirstVerificator = firstNineDigits.concat(
    firstDigitVerificator
  );

  const secondDigitVerificator = calculateDigitVerificator(
    calculateSum(
      firstNineDigitsAndFirstVerificator,
      [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]
    )
  );

  const isValid =
    digits[9] === firstDigitVerificator &&
    digits[10] === secondDigitVerificator;

  return isValid ? "CPF válido" : "CPF inválido";
};

const calculateDigitVerificator = (value) => {
  const mod = value % 11;

  // If the mod of the division is less than 2, the digit is 0
  // If the mod is greater than or equal to 2, the digit is 11 - mod
  return mod < 2 ? 0 : 11 - mod;
};

const calculateSum = (digits, weights) => {
  return digits.reduce((accumulator, currentNum, index) => {
    const weight = weights[index];

    // console.log(
    //   `Expressão: ${currentNum} x ${increment}. Total ${accumulator}`
    // );

    return accumulator + currentNum * weight;
  }, 0);
};
