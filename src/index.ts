import maximizeReliability from "./algo";
import { readInputData, produceRandomInputData, displayMatrix } from "./util";

/***************************************************************************
 * Config
 */
const inputFilePath = `./input.txt`; /* Path to input file */
const minN = 2; /* the program will compute optimization starting at this N */
const maxN = 8; /* the program will stop optimizing at this N */
const requirements = {
  reliabilityGoal: 0.4 /* set to 0 to ignore reliability constraint */,
  costConstraint: 0 /* set to 0 to ignore cost constraint */,
};

/* Uncomment this line to write to input file valid random data. */
//(async () => await produceRandomInputData({ N: 7 }, true))();

/***************************************************************************
 * Program
 */
async function main() {
  /* Read input file data */
  const input = await readInputData(inputFilePath).catch((error) => {
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
  console.log(`Combinations: ${optimum.combinationCount}`);
  console.log(`Reliability: ${optimum.reliability}`);
  console.log(`Cost: ${optimum.cost}`);
  console.log(`Edges: `);
  console.log(optimum.combination);
  console.log(`Matrix: `);
  displayMatrix(input.N, optimum.combination);
}

/***************************************************************************
 * Execute
 */

/* to execute optimizations from minN to maxN */
if (false)
  (async () => {
    for (let N = minN; N <= maxN; N++) {
      console.log(`\n\n${new Array(50).map(() => "-").toString()}`);
      console.log(`Computing N: ${N}`);
      await produceRandomInputData({ N }, false, inputFilePath);
      await main();
    }
  })().catch((error) => {
    console.error(error);
    console.log(`\nExiting safely.`);
  });

/* to execute optimizations for current data in file */
if (true)
  (async () => {
    await main();
  })().catch((error) => {
    console.error(error);
    console.log(`\nExiting safely.`);
  });
