export const MOSCA_PARAM_X = "moscaX";
export const MOSCA_PARAM_Y = "moscaY";
export const MOSCA_PARAM_Z = "moscaZ";

export type MoscaUrlInputs = {
  dataYears: number;
  migrationYears: number;
  quantumYears: number;
};

export function readMoscaFromSearchParams(
  params: URLSearchParams | ReadonlyURLSearchParams
): MoscaUrlInputs | null {
  const x = params.get(MOSCA_PARAM_X);
  const y = params.get(MOSCA_PARAM_Y);
  const z = params.get(MOSCA_PARAM_Z);
  if (x == null || y == null || z == null) return null;
  const dataYears = Number(x);
  const migrationYears = Number(y);
  const quantumYears = Number(z);
  if (!Number.isFinite(dataYears) || !Number.isFinite(migrationYears) || !Number.isFinite(quantumYears)) {
    return null;
  }
  return { dataYears, migrationYears, quantumYears };
}

export function moscaInequalityHolds(inputs: MoscaUrlInputs): boolean {
  return inputs.dataYears + inputs.migrationYears > inputs.quantumYears;
}

export function appendMoscaToParams(params: URLSearchParams, inputs: MoscaUrlInputs): void {
  params.set(MOSCA_PARAM_X, String(inputs.dataYears));
  params.set(MOSCA_PARAM_Y, String(inputs.migrationYears));
  params.set(MOSCA_PARAM_Z, String(inputs.quantumYears));
}

type ReadonlyURLSearchParams = Pick<URLSearchParams, "get">;
