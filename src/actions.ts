export type TActitoType = number | string | boolean | Date;

export interface IActionParams {
  profileId: number;
  [key: string]: TActitoType;
}

type TAction = (inputParams: IActionParams) => IActionParams;

export interface IActionContext {
  [key: string]: { [key: string]: TActitoType };
}

export interface IMappingDefinition {
  defaults: { [key: string]: TActitoType };
  indirections: { [key: string]: string };
}

export function applyMapping(
  params: IActionParams,
  { defaults, indirections }: IMappingDefinition,
  context: IActionContext = {}
): IActionParams {
  const result = { ...defaults, ...params };
  Object.entries(indirections).forEach(([indirectionDestination, indirectionSource]) => {
    const [contextKey, contextField] = indirectionSource.split(".");
    if (!contextKey || !contextField) {
      throw Error(`invalid indirection ${indirectionSource} -> ${indirectionDestination}`);
    }
    result[indirectionDestination] = context[contextKey][contextField];
  });
  return result;
}
