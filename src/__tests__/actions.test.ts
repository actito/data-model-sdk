import { applyMapping, IActionContext, IActionParams, IMappingDefinition } from "../actions";

it("applies defaults", () => {
  const mapping: IMappingDefinition = {
    defaults: { withDefault: 1 },
    indirections: {}
  };
  const inputParams: IActionParams = { profileId: 1 };
  const mapped = applyMapping(inputParams, mapping);
  expect(mapped).toMatchObject({ profileId: 1, withDefault: 1 });
});

it("applies indirections", () => {
  const mapping: IMappingDefinition = {
    defaults: {},
    indirections: { indirected: "indirected.value" }
  };
  const inputParams: IActionParams = { profileId: 1 };
  const context: IActionContext = {
    indirected: { value: 1 }
  };
  const mapped = applyMapping(inputParams, mapping, context);
  expect(mapped).toMatchObject({ profileId: 1, indirected: 1 });
});

it("throws error on missing context", () => {
  const mapping: IMappingDefinition = {
    defaults: {},
    indirections: { indirected: "indirected.value" }
  };
  const inputParams: IActionParams = { profileId: 1 };
  expect(() => applyMapping(inputParams, mapping)).toThrow();
});

it("throws error on invalid indirection", () => {
  const mapping: IMappingDefinition = {
    defaults: {},
    indirections: { indirected: "invalid" }
  };
  const inputParams: IActionParams = { profileId: 1 };
  expect(() => applyMapping(inputParams, mapping)).toThrow();
});
