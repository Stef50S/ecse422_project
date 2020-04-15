import fs from "fs";
import { Edge, InputData } from "./types";

/**
 * Produces random input data. If file path passed, writes to file as well.
 * @param inputFilePath
 * @param print
 * @param filepath
 */
async function produceRandomInputData(
  { N }: { N: number },
  print: boolean,
  filepath?: string
) {
  /* Create input data */
  let costs = "1";
  let reliabilities = "0.901";
  for (let i = 2; i <= (N * (N - 1)) / 2; i++) {
    costs = `${costs} ${i}`;
    reliabilities = `${reliabilities} ${(0.9 + i / 10000).toFixed(4)}`;
  }

  /* Print to console */
  if (print) {
    console.log(N);
    console.log(costs);
    console.log(reliabilities);
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
  console.log(line);
  console.log(line2);

  for (let y = 0; y < N; y++) {
    line = `${y}|`;
    for (let x = 0; x < N; x++) {
      if (!!xyMap[`${x} ${y}`]) line = `${line} X`;
      else line = `${line} o`;
    }
    console.log(line);
  }
}

/**
 * Create all possible edges between nodes and sorts them by decreasing
 * realiabilities.
 * @param inputData
 */
function createEdges({ N, costs, reliabilities }: InputData): Edge[] {
  /* Create all possible edges */
  const edges: Edge[] = [];
  for (let nodeA = 0; nodeA < N; nodeA++) {
    for (let nodeB = nodeA + 1; nodeB < N; nodeB++) {
      edges.push({
        nodeA,
        nodeB,
        reliability: reliabilities[edges.length],
        cost: costs[edges.length],
      });
    }
  }

  /* Sort these edges according to reliability */
  edges.sort((edgeA, edgeB) => {
    if (edgeA.reliability > edgeB.reliability) return -1;
    if (edgeB.reliability > edgeA.reliability) return 1;
    return 0;
  });

  return edges;
}

/**
 * Creates all possible combinations of edges lazily. That is, it will only
 * compute the next combination when requested.
 * @param edges
 */
function allEdgeCombinations(edges: Edge[]): Generator<Edge[], void> {
  let fn = function* (active: Edge[], rest: Edge[]): Generator<Edge[], void> {
    if (rest.length === 0) {
      yield active;
    } else {
      /* first recursive side */
      const activeS1 = [...active];
      const restS1 = [...rest.slice(1)];
      activeS1.push(rest[0]);
      if (activeS1.length !== 0 || restS1.length !== 0)
        yield* fn(activeS1, restS1);

      /* second recursive side */
      const activeS2 = [...active];
      const restS2 = [...rest.slice(1)];
      if (activeS2.length !== 0 || restS2.length !== 0)
        yield* fn(activeS2, restS2);
    }
  };

  return fn([], edges);
}

/**
 * Checks combination is of length at least N-1, with
 * all nodes present and where all nodes are somehow connected.
 * @param N
 * @param edges
 */
function isValidCombination(N: number, combination: Edge[]): boolean {
  /* Doesn't have enough edges > (N-1) */
  if (combination.length < N - 1) return false;

  /* Is missing a node */
  const nodesMap = combination.reduce(
    (result: { [node: number]: boolean }, { nodeA, nodeB }) => {
      if (!result[nodeA]) result[nodeA] = true;
      if (!result[nodeB]) result[nodeB] = true;
      return result;
    },
    {}
  );
  for (let i = 0; i < N; i++) if (!nodesMap[i]) return false;

  /* All nodes not connected */
  const connectedNodes: number[] = [0];
  for (let i = 0; i < N; i++) {
    combination.forEach(({ nodeA, nodeB }) => {
      if (nodeA === connectedNodes[i] && !connectedNodes.includes(nodeB))
        connectedNodes.push(nodeB);

      if (nodeB === connectedNodes[i] && !connectedNodes.includes(nodeA))
        connectedNodes.push(nodeA);
    });

    if (connectedNodes.length === N) return true;
  }
}

export {
  produceRandomInputData,
  readInputData,
  displayMatrix,
  createEdges,
  allEdgeCombinations,
  isValidCombination,
};
