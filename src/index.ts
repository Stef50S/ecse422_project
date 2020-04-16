import maximizeReliability from "./algo";
import {
  readInputData,
  produceRandomInputData,
  displayMatrix,
  requestRequirement,
} from "./util";
import { Requirements } from "./types";

/***************************************************************************
 * Config
 */
const filepath = `./input.txt`; /* Path to input file */

/* Uncomment this line to write to input file valid random data. */
//(async () => await produceRandomInputData({ N: 4, print: false, filepath }))();

/***************************************************************************
 * Program
 */
async function main(requirements: Requirements) {
  /* Read input file data */
  const input = await readInputData(filepath).catch((error) => {
    console.error(error);
    throw new Error(`Error: reading in the input data.`);
  });

  /* Compute a optimal graph provided data, constraints and goals */
  console.time("Execution Time");
  const optimum = await maximizeReliability(input, requirements).catch(
    (error) => {
      console.error(error);
      throw new Error(`Error: computing optimum graph.`);
    }
  );

  /** Output */
  console.timeEnd("Execution Time");
  console.info(`Edges: ${optimum.edges.length}`);
  console.info(`Combinations: ${optimum.combinationCount}`);
  console.info(`Reliability: ${optimum.reliability}`);
  console.info(`Cost: ${optimum.cost}`);
  console.info(optimum.combination);
  console.info(`Matrix: `);
  displayMatrix(input.N, optimum.combination);
}

/***************************************************************************
 * Execute
 */

/* to execute optimizations for current data in file and with user prompt */
if (true)
  (async () => {
    await main({
      reliabilityGoal: await requestRequirement(
        `Set minimum realiability goal? (y/n): `
      ),
      costConstraint: await requestRequirement(`Set cost constraint? (y/n): `),
    });
  })().catch((error) => {
    console.error(error);
    console.info(`\nExiting safely.`);
  });

/* to execute optimizations from minN to maxN without user prompt */
const minN = 3; /* the program will compute optimization starting at this N */
const maxN = 7; /* the program will stop optimizing at this N */
const requirements = {
  reliabilityGoal: 0 /* set to 0 to ignore reliability constraint */,
  costConstraint: 0 /* set to 0 to ignore cost constraint */,
};

if (false)
  (async () => {
    for (let N = minN; N <= maxN; N++) {
      console.info(`\n\n${new Array(50).map(() => "-").toString()}`);
      console.info(`Computing N: ${N}`);
      await produceRandomInputData({
        N,
        print: false,
        filepath: filepath,
      });
      await main(requirements);
    }
  })().catch((error) => {
    console.error(error);
    console.info(`\nExiting safely.`);
  });
