import fs from "fs";
import readline from "readline";
import { Edge, InputData } from "./types";

/**
 * Produces random input data. If file path passed, writes to file as well.
 * @param inputFilePath
 * @param print
 * @param filepath
 */
async function produceRandomInputData({
  N,
  print,
  filepath,
}: {
  N: number;
  print: boolean;
  filepath?: string;
}) {
  /* Create input data */
  let costs = "1";
  let reliabilities = "0.901";
  for (let i = 2; i <= (N * (N - 1)) / 2; i++) {
    costs = `${costs} ${i}`;
    reliabilities = `${reliabilities} ${(0.9 + i / 10000).toFixed(4)}`;
  }

  /* Print to console */
  if (print) {
    console.info(N);
    console.info(costs);
    console.info(reliabilities);
  }

  /* Write to file */
  if (!!filepath) {
    return new Promise<void>(function (resolve) {
      fs.writeFile(
        filepath,
        `${N}\n${costs.toString()}\n${reliabilities.toString()}`,
        (error) => {
          if (!!error) console.error(error);
          resolve();
        }
      );
    });
  }
}

/**
 * Request user requirements.
 * @param prompt
 */
async function requestRequirement(prompt: string): Promise<number> {
  const requestPrompt = (prompt: string): Promise<string> => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) =>
      rl.question(prompt, (ans) => {
        rl.close();
        resolve(ans);
      })
    );
  };

  const requestValue = async (): Promise<number> => {
    const ans = await requestPrompt(`Value of requirment: `);
    if (isNaN(ans as any)) {
      console.info(`Value provided not a number.`);
      return requestValue();
    }
    const value = Number(ans);
    if (value <= 0) {
      console.info(`Value must be positive.`);
      return requestValue();
    }

    return value;
  };

  const ans = await requestPrompt(prompt);
  if (ans !== "y" && ans !== "n") {
    console.info(`Answer must by 'y' or 'n'.`);
    return requestRequirement(prompt);
  }
  if (ans === "n") return 0;

  return requestValue();
}

/**
 * Read in the input data for the cities.
 * @param inputFilePath
 */
async function readInputData(inputFilePath: string): Promise<InputData> {
  return new Promise<InputData>(function (resolve, reject) {
    /** Read in Input Data (cities) */
    fs.readFile(inputFilePath, (error, data) => {
      if (error) {
        console.error(error);
        return reject(new Error(`Error: reading input file.`));
      }

      /* Read in Input file lines */
      let line1: string, line2: string, line3: string;
      try {
        [line1, line2, line3] = data.toString().split(`\n`);
      } catch (error) {
        console.error(error);
        return reject(
          new Error(`Error: reading the input lines. Check input syntax.`)
        );
      }
      if (!line1 || !line2 || !line3) {
        return reject(new Error(`Error: missing input data.`));
      }

      /* N - number of cities */
      let N: number;
      if (isNaN(line1 as any)) {
        return reject(
          new Error(`Error: number of cities provided N is not a number.`)
        );
      }
      N = Number(line1);
      if (N <= 0) {
        return reject(new Error(`Error: N must be greater than zero.`));
      }

      /* costs - costs provided for each city */
      let costs: number[];
      try {
        costs = line2.split(` `).map((str, index) => {
          if (isNaN(str as any)) {
            throw new Error(
              `Error: costs number at index: ${index} with data: '${str}' is not a number.`
            );
          }

          const num = Number(str);
          if (num <= 0) {
            throw new Error(
              `Error: costs number at index: ${index} with data: '${str}' must be positive.`
            );
          }
          return num;
        });
      } catch (error) {
        return reject(error);
      }
      if (costs.length !== (N * (N - 1)) / 2) {
        throw new Error(`Error: costs has length: ${costs.length} but N: ${N}`);
      }

      /* reliabilities - reliabilities provided for each city */
      let reliabilities: number[];
      try {
        reliabilities = line3.split(` `).map((str, index) => {
          if (isNaN(str as any)) {
            throw new Error(
              `Error: reliablity number at index: ${index} with data: '${str}' is not a number.`
            );
          }

          const num = Number(str);
          if (num <= 0) {
            throw new Error(
              `Error: reliablity number at index: ${index} with data: '${str}' must be positive.`
            );
          }
          return num;
        });
      } catch (error) {
        return reject(error);
      }
      if (reliabilities.length !== (N * (N - 1)) / 2) {
        throw new Error(
          `Error: reliabilities has length: ${reliabilities.length} but N: ${N}`
        );
      }

      resolve({ N, costs, reliabilities });
    });
  });
}

/**
 * Display the matrix with choosen edges.
 * @param N
 * @param edges
 */
function displayMatrix(N: number, edges: Edge[]) {
  const xyMap = edges.reduce(
    (result: { [xy: string]: boolean }, { nodeA, nodeB }) => {
      result[`${nodeA} ${nodeB}`] = true;
      return result;
    },
    {}
  );

  let line = "  ";
  let line2 = "  ";
  for (let x = 0; x < N; x++) {
    line = `${line} ${x}`;
    line2 = `${line2} -`;
  }
  console.info(line);
  console.info(line2);

  for (let y = 0; y < N; y++) {
    line = `${y}|`;
    for (let x = 0; x < N; x++) {
      if (!!xyMap[`${x} ${y}`]) line = `${line} X`;
      else line = `${line} o`;
    }
    console.info(line);
  }
}

export {
  produceRandomInputData,
  requestRequirement,
  readInputData,
  displayMatrix,
};
