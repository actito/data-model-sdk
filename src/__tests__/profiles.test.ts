import { init } from "../init";
import { createProfile, deleteProfile, getProfile, getProfiles, updateProfile } from "../profiles";
import { IAPIProfileBody, IProfileRecord } from "../types";
import { checkLastCall, credentials } from "./helpers";

const PROFILE_TABLE = "Clients";

let mocked: jest.Mock<any, any>;
const dummyProfile: IAPIProfileBody = {
  attributes: [{ name: "profileId", value: "7" }],
  subscriptions: [],
  segmentations: []
};

const dummyProfiles = { profiles: [dummyProfile] };

jest.mock("node-fetch", () => {
  mocked = jest.fn();
  return { default: mocked };
});

describe("profile", () => {
  const expectFetch = checkLastCall(mocked);
  init(credentials);

  it("fails on non initialized", async () => {
    mocked.mockImplementationOnce(() => ({ ok: false, statusText: "Unauthorized" }));
    await expect(getProfile(PROFILE_TABLE, "7")).rejects.toThrow("Unauthorized");
  });

  it("gets profile", async () => {
    mocked.mockImplementationOnce(() => ({ ok: true, json: () => dummyProfile }));
    const { profile, subscriptions, segmentations } = await getProfile(PROFILE_TABLE, "7");
    expectFetch({
      url: "https://test.actito.be/ActitoWebServices/ws/v4/entity/product/table/Clients/profile/7",
      options: { method: "GET" }
    });
    expect(profile).toMatchObject({ profileId: "7" });
    expect(subscriptions).toBeInstanceOf(Array);
    expect(segmentations).toBeInstanceOf(Array);
    return profile;
  });

  it("gets profiles", async () => {
    mocked.mockImplementationOnce(() => ({ ok: true, json: () => dummyProfiles }));
    const profiles: IProfileRecord[] = await getProfiles(PROFILE_TABLE, "profileId=7");
    expect(profiles.length).toEqual(1);
    const { profile, subscriptions, segmentations } = profiles[0];
    expectFetch({
      url: "https://test.actito.be/ActitoWebServices/ws/v4/entity/product/table/Clients/profile?search=profileId%3D7&",
      options: { method: "GET" }
    });
    expect(profile).toMatchObject({ profileId: "7" });
    expect(subscriptions).toBeInstanceOf(Array);
    expect(segmentations).toBeInstanceOf(Array);
    return profile;
  });

  it("creates profile", async () => {
    mocked.mockImplementationOnce(() => ({ ok: true, json: () => ({ profileId: 7 }) }));
    const { profileId } = await createProfile(PROFILE_TABLE, { profile: { firstName: "Alain" } });
    expectFetch({
      url: "https://test.actito.be/ActitoWebServices/ws/v4/entity/product/table/Clients/profile",
      options: {
        method: "POST",
        body: '{"attributes":[{"name":"firstName","value":"Alain"}]}'
      }
    });
    expect(profileId.toString()).toBe("7");
  });

  it("updates profile", async () => {
    mocked.mockImplementationOnce(() => ({ ok: true, json: () => ({ profileId: 7 }) }));
    const { profileId } = await updateProfile(PROFILE_TABLE, "7", { profile: { firstName: "Alain" } });
    expectFetch({
      url: "https://test.actito.be/ActitoWebServices/ws/v4/entity/product/table/Clients/profile/7",
      options: {
        method: "PUT",
        body: '{"attributes":[{"name":"firstName","value":"Alain"}]}'
      }
    });
    expect(profileId.toString()).toBe("7");
  });

  it("deletes profile", async () => {
    mocked.mockImplementationOnce(() => ({ ok: true, text: () => "" }));
    await deleteProfile(PROFILE_TABLE, "7");
    expectFetch({
      url: "https://test.actito.be/ActitoWebServices/ws/v4/entity/product/table/Clients/profile/7",
      options: { method: "DELETE" }
    });
  });
});
