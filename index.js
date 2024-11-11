import { formatBrlToCSV } from "./utils/currencyFormatter.js";
import { validateDocument } from "./utils/documentValidator.js";
import { calculateInstallmentAmount } from "./utils/calculateInstallments.js";
import fs from "fs";
import csvParser from "csv-parser";

const fieldTransformations = {
  documentIsValid: ({ nrCpfCnpj }) => validateDocument(nrCpfCnpj),
  valorPrestacao: (result) =>
    formatBrlToCSV(
      calculateInstallmentAmount(result.vlTotal, result.qtPrestacoes)
    ),
};

const monetaryFields = ["vlTotal", "vlPresta", "vlMora", "vlAtual", "vlMulta"];

monetaryFields.forEach((field) => {
  fieldTransformations[field] = (data) => formatBrlToCSV(data[field]);
});

const transformResult = (result) => {
  Object.keys(fieldTransformations).forEach((field) => {
    result[field] = fieldTransformations[field](result);
  });
  return result;
};

const saveToCSV = (data, filename) => {
  const headers = Object.keys(data[0]);

  const csvData = [
    headers.join(","),
    ...data.map((row) => headers.map((header) => row[header]).join(",")),
  ].join("\n");

  fs.writeFile(filename, csvData, (err) => {
    if (err) {
      console.error("Erro ao salvar o arquivo CSV:", err);
    } else {
      console.log("Arquivo CSV salvo com sucesso!");
    }
  });
};

const processCSV = (inputFilename, outputFilename) => {
  const results = [];

  fs.createReadStream(inputFilename)
    .pipe(csvParser())
    .on("data", (row) => {
      const transformedRow = transformResult(row);

      results.push(transformedRow);
    })
    .on("end", () => {
      saveToCSV(results, outputFilename);
    });
};

processCSV("dataWithValidData.csv", "output.csv");
