type InputData = {
  readonly N: number;
  readonly costs: number[];
  readonly reliabilities: number[];
};

type Requirements = {
  readonly reliabilityGoal?: number;
  readonly costConstraint?: number;
};

type Output = {
  readonly reliability: number;
  readonly cost: number;
  readonly combination: Edge[];
  combinationCount: number;
};

type Edge = {
  readonly nodeA: number;
  readonly nodeB: number;
  readonly reliability: number;
  readonly cost: number;
};

export { InputData, Requirements, Output, Edge };
