import { Edge, InputData, Requirements, Output } from "./types";
import { createEdges, allEdgeCombinations, isValidCombination } from "./util";

/**
 * Get the total cost of the combination.
 * @param combination
 */
function getCost(combination: Edge[]): number {
  return combination.reduce((sum: number, { cost }) => {
    return sum + cost;
  }, 0);
}

/**
 * Gets the reliability of the combination.
 * @param combination
 */
function getReliability(combination: Edge[]): number {
  return combination.reduce((prob: number, { reliability }) => {
    return prob * reliability;
  }, 1);
}

/**
 * Computes the graph with the highest possible reliability provided
 * the given data and constraints. If the reliabilityGoal constraint is
 * provided (non zero), the algorithm will return the first solution
 * that meets that reliabilityGoal.
 * @param inputData
 * @param requirements
 */
async function maximizeReliability(
  inputData: InputData,
  { reliabilityGoal, costConstraint }: Requirements
): Promise<Output> {
  /* Create all possible edges between nodes */
  const edges = createEdges(inputData);

  /* Create all viable edge combinations */
  const combinations = allEdgeCombinations(edges);

  /* Find optimum combination meeting constraints */
  let optimum: Output = {
    reliability: 0,
    cost: 0,
    combination: [],
    combinationCount: 0,
  };

  for (const combination of combinations) {
    optimum.combinationCount++;

    /* Check if valid combination */
    if (!isValidCombination(inputData.N, combination)) continue;

    /* Cost constraint */
    const cost = getCost(combination);
    if (!!costConstraint && cost > costConstraint) continue;

    /* Realiability Goal */
    const reliability = getReliability(combination);
    if (!!reliabilityGoal && reliability >= reliabilityGoal)
      return { ...optimum, reliability, cost, combination };

    /* Optimum Solution */
    if (reliability > optimum.reliability)
      optimum = { ...optimum, reliability, cost, combination };
  }

  return optimum;
}

export default maximizeReliability;
