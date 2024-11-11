import { formatBrlToCSV } from "./utils/currencyFormatter.js";
import { validateDocument } from "./utils/documentValidator.js";
import { calculateInstallmentAmount } from "./utils/calculateInstallments.js";
import fs from "fs";
import csvParser from "csv-parser";
import { Writable } from "stream";

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

const saveToCSVStream = (outputFilename) => {
  const writableStream = fs.createWriteStream(outputFilename);
  let firstLineWritten = false;

  return new Writable({
    objectMode: true,
    write(chunk, encoding, callback) {
      const row = Object.values(chunk).join(",") + "\n";

      if (!firstLineWritten) {
        const headers = Object.keys(chunk).join(",");
        writableStream.write(headers + "\n");
        firstLineWritten = true;
      }

      writableStream.write(row, encoding, callback);
    },
  });
};

const countTotalLines = (inputFilename) => {
  return new Promise((resolve, reject) => {
    let lineCount = 0;

    fs.createReadStream(inputFilename)
      .pipe(csvParser())
      .on("data", () => {
        lineCount++;
      })
      .on("end", () => {
        resolve(lineCount);
      })
      .on("error", (err) => {
        reject(err);
      });
  });
};

const processCSV = async (inputFilename, outputFilename) => {
  const totalLines = await countTotalLines(inputFilename);
  console.log(`Total de linhas a serem processadas: ${totalLines}`);

  const writableStream = saveToCSVStream(outputFilename);

  const startTime = Date.now();
  let processedLines = 0;

  const displayProgress = () => {
    const elapsedTime = (Date.now() - startTime) / 1000;
    const estimatedTimeRemaining =
      (elapsedTime / processedLines) * (totalLines - processedLines);

    console.clear();
    console.log(`Linhas processadas: ${processedLines} / ${totalLines}`);
    console.log(`Tempo decorrido: ${elapsedTime.toFixed(2)} segundos`);
    console.log(
      `Estimativa de tempo restante: ${estimatedTimeRemaining.toFixed(
        2
      )} segundos`
    );
  };

  fs.createReadStream(inputFilename)
    .pipe(csvParser())
    .on("data", (row) => {
      const transformedRow = transformResult(row);
      writableStream.write(transformedRow);

      processedLines++;

      if (processedLines % 10 === 0) {
        setTimeout(displayProgress, 3000);
      }
    })
    .on("end", () => {
      writableStream.end();
      console.log("Arquivo CSV processado e salvo com sucesso!");
    })
    .on("error", (err) => {
      console.error("Erro ao processar o CSV:", err);
    });
};

processCSV("data.csv", "output.csv");
