import { Edge, InputData, Requirements, Output } from "./types";

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
