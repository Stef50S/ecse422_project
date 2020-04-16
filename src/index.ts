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
//(async () => await produceRandomInputData({ N: 7, print: false, filepath }))();

/***************************************************************************
 * Program
 */
async function main(requirements: Requirements) {
  /* Read input file data */
  const input = await readInputData(filepath).catch((error) => {
    console.error(error);
    throw new Error(`Error: reading in the input data.`);
  });

  /* Output - start */
  const seperator = `*****************************************`;
  console.log(`\n${seperator}${seperator}`);
  console.time("Execution Time");
  console.info(`Computing N: ${input.N}`);
  console.info(`Reliability Goal: ${requirements.reliabilityGoal}`);
  console.info(`Cost Constraint: ${requirements.costConstraint}`);

  /* Compute a optimal graph provided data, constraints and goals */
  const optimum = await maximizeReliability(input, requirements).catch(
    (error) => {
      console.error(error);
      throw new Error(`Error: computing optimum graph.`);
    }
  );

  /* Output */
  console.info(`Edges: ${optimum.edges.length}`);
  console.info(`Combinations: ${optimum.combinationCount}`);
  console.timeEnd("Execution Time");

  /* Output - Failure */
  if (optimum.reliability < 0) {
    console.log(`---------------- Error ----------------`);
    console.info(`Optimization with cost constraint not achievable.`);
    return;
  }
  if (
    !!requirements.reliabilityGoal &&
    optimum.reliability < requirements.reliabilityGoal
  ) {
    console.log(`---------------- Error ----------------`);
    console.info(`Optimization with reliability goal not achievable.`);
    console.info(`The following is approx. optimal solution found.`);
  }

  /* Output Success */
  console.log(`---------------- Solution ----------------`);
  console.info(`Reliability of Network: ${optimum.reliability}`);
  console.info(`Cost of Network: ${optimum.cost}`);
  console.info(`Selected Edges: `);
  console.info(optimum.combination);
  console.info(`Node to Edges Matrix: `);
  displayMatrix(input.N, optimum.combination);
}

/***************************************************************************
 * Execute
 */

/* to execute optimizations for current data in file and with user prompt */
if (false)
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

if (true)
  (async () => {
    for (let N = minN; N <= maxN; N++) {
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
