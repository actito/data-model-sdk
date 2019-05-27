import { init } from "../init";
import { createProfile, deleteProfile, getProfile, getProfiles, updateProfile, registerWebhook, increment } from "../profiles";
import { IAPIProfileBody, IProfileRecord, WebhookType } from "../types";
import { checkLastCall, checkCall, credentials } from "./helpers";

const PROFILE_TABLE = "Clients";

let mocked: jest.Mock<any, any>;
const dummyProfile: IAPIProfileBody = {
  attributes: [{ name: "profileId", value: "7" }, { name: "value", value: "1" }],
  subscriptions: [],
  segmentations: []
};
const emptyProfile: IAPIProfileBody = {
  attributes: [],
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
  const expectFetchOrder = checkCall(mocked);
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

  it("registers webhook", async () => {
    mocked.mockImplementationOnce(() => ({ ok: true, json: () => ({ id: 123 }) }));
    const { id } = await registerWebhook(PROFILE_TABLE, WebhookType.CREATE, "https://www.example.com", true);
    expectFetch({
      url: "https://test.actito.be/ActitoWebServices/ws/v4/entity/product/table/Clients/webhookSubscription",
      options: {
        method: "POST",
        body: '{"eventType":"CREATE","isActive":true,"targetUrl":"https://www.example.com"}'
      }
    });
    expect(id.toString()).toBe("123");
  });

  it("deletes profile", async () => {
    mocked.mockImplementationOnce(() => ({ ok: true, text: () => "" }));
    await deleteProfile(PROFILE_TABLE, "7");
    expectFetch({
      url: "https://test.actito.be/ActitoWebServices/ws/v4/entity/product/table/Clients/profile/7",
      options: { method: "DELETE" }
    });
  });

  it("increments profile field", async () => {
    mocked.mockReset();
    mocked
      .mockImplementationOnce(() => ({ ok: true, json: () => dummyProfile }))
      .mockImplementationOnce(() => ({ ok: true, json: () => { } }));
    await increment(PROFILE_TABLE, "7", "value", 1);
    expectFetchOrder(1, {
      url: `https://test.actito.be/ActitoWebServices/ws/v4/entity/product/table/${PROFILE_TABLE}/profile/7`,
      options: { method: "GET" }
    });
    expectFetchOrder(2, {
      url: `https://test.actito.be/ActitoWebServices/ws/v4/entity/product/table/${PROFILE_TABLE}/profile/7`,
      options: {
        method: "PUT",
        body: JSON.stringify({ "attributes": [{ "name": "value", "value": "2" }] })
      }
    });
  });

  it("increments undefined field in profile", async () => {
    mocked.mockReset();
    mocked
      .mockImplementationOnce(() => ({ ok: true, json: () => dummyProfile }))
      .mockImplementationOnce(() => ({ ok: true, json: () => { } }));
    await increment(PROFILE_TABLE, "7", "otherValue", 1);
    expectFetchOrder(1, {
      url: `https://test.actito.be/ActitoWebServices/ws/v4/entity/product/table/${PROFILE_TABLE}/profile/7`,
      options: { method: "GET" }
    });
    expectFetchOrder(2, {
      url: `https://test.actito.be/ActitoWebServices/ws/v4/entity/product/table/${PROFILE_TABLE}/profile/7`,
      options: {
        method: "PUT",
        body: JSON.stringify({ "attributes": [{ "name": "otherValue", "value": "1" }] })
      }
    });
  });

  it("increments no profile data", async () => {
    mocked.mockReset();
    mocked.mockImplementationOnce(() => ({ ok: true, json: () => emptyProfile }));
    await expect(increment(PROFILE_TABLE, "7", "value", 1)).rejects.toEqual(new Error('no profile data for 7'));
  });
});
