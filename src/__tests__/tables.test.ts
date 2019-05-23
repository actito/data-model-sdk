import { init } from "../init";
import { addRecord, deleteRecord, getRecord, getRecords, increment, updateRecord, registerWebhook } from "../tables";
import { checkLastCall, credentials } from "./helpers";
import { WebhookType } from "../types";

const CUSTOM_TABLE = "OfferAssignments";
const RECORD_ID = "20";
const SEARCH_FIELD = "id";
const SEARCH_VALUE = RECORD_ID;
const SORTED_FIELD = "id";
const ASCENDING = true;
const LIMIT = 10;

let mocked: jest.Mock<any, any>;

const dummyRecordProperties = {
  properties: [
    { name: "synchronized", value: true },
    { name: "offerReference", value: "springoffer" },
    { name: "profileReference", value: "alaindresse@gmail.com" }
  ]
};

const dummyRecordsProperties =
{
  records: [
    dummyRecordProperties
  ]
};

const dummyRecord = {
  synchronized: true,
  offerReference: "springoffer",
  profileReference: "alaindresse@gmail.com"
};

jest.mock("node-fetch", () => {
  mocked = jest.fn();
  return { default: mocked.mockImplementation(() => ({ ok: true, json: () => ({}) })) };
});

describe("tables", () => {
  const expectFetch = checkLastCall(mocked);
  init(credentials);

  it("fetches record", async () => {
    mocked.mockImplementationOnce(() => ({ ok: true, json: () => dummyRecordProperties }));
    const record = await getRecord(CUSTOM_TABLE, RECORD_ID);
    expectFetch({
      url: `https://test.actito.be/ActitoWebServices/ws/v4/entity/product/customTable/${CUSTOM_TABLE}/record/${RECORD_ID}`,
      options: { method: "GET" }
    });
    expect(record).toMatchObject(dummyRecord);
  });

  it("fetches records", async () => {
    mocked.mockImplementationOnce(() => ({ ok: true, json: () => dummyRecordsProperties }));
    const records = await getRecords(CUSTOM_TABLE, { searchField: SEARCH_FIELD, searchValue: SEARCH_VALUE }, { sortedField: SORTED_FIELD, ascending: ASCENDING }, LIMIT);
    expect(records.length).toEqual(1);
    expectFetch({
      url: `https://test.actito.be/ActitoWebServices/ws/v4/entity/product/customTable/${CUSTOM_TABLE}/record?searchField=${SEARCH_FIELD}&searchValue=${SEARCH_VALUE}&sortedField=${SORTED_FIELD}&ascending=${ASCENDING}&number=${LIMIT}&`,
      options: { method: "GET" }
    });
    expect(records[0]).toMatchObject(dummyRecord);
  });

  it("updates record", async () => {
    await updateRecord(CUSTOM_TABLE, RECORD_ID, { assignmentReference: "newReference" });
    expectFetch({
      url: `https://test.actito.be/ActitoWebServices/ws/v4/entity/product/customTable/${CUSTOM_TABLE}/record/${RECORD_ID}`,
      options: {
        method: "PUT",
        body: '{"properties":[{"name":"assignmentReference","value":"newReference"}]}'
      }
    });
  });

  it("adds new record", async () => {
    await addRecord(CUSTOM_TABLE, dummyRecord);

    expectFetch({
      url: `https://test.actito.be/ActitoWebServices/ws/v4/entity/product/customTable/${CUSTOM_TABLE}/record`,
      options: {
        method: "POST",
        body: JSON.stringify(dummyRecordProperties)
      }
    });
  });

  it("deletes record", async () => {
    mocked.mockImplementationOnce(() => ({ ok: true, text: () => "" }));
    await deleteRecord(CUSTOM_TABLE, RECORD_ID);
    expectFetch({
      url: `https://test.actito.be/ActitoWebServices/ws/v4/entity/product/customTable/${CUSTOM_TABLE}/record/${RECORD_ID}`,
      options: { method: "DELETE" }
    });
  });

  it("registers webhook", async () => {
    mocked.mockImplementationOnce(() => ({ ok: true, json: () => ({ id: 123 }) }));
    const { id } = await registerWebhook(CUSTOM_TABLE, WebhookType.CREATE, "https://www.example.com", true);
    expectFetch({
      url: `https://test.actito.be/ActitoWebServices/ws/v4/entity/product/customTable/${CUSTOM_TABLE}/webhookSubscription`,
      options: {
        method: "POST",
        body: '{"eventType":"CREATE","isActive":true,"targetUrl":"https://www.example.com"}'
      }
    });
    expect(id.toString()).toBe("123");
  });

  it("increments record", async () => {
    mocked.mockImplementationOnce(() => ({ ok: true, json: () => ({ properties: [{ name: "value", value: 1 }] }) }));
    await increment(CUSTOM_TABLE, RECORD_ID, "value", 1);
    expectFetch({
      url: `https://test.actito.be/ActitoWebServices/ws/v4/entity/product/customTable/${CUSTOM_TABLE}/record/${RECORD_ID}`,
      options: {
        method: "PUT",
        body: JSON.stringify({ properties: [{ name: "value", value: 2 }] })
      }
    });
  });

  it("increments undefined field in record", async () => {
    mocked.mockImplementationOnce(() => ({ ok: true, json: () => ({ properties: [{ name: "value", value: 1 }] }) }));
    await increment(CUSTOM_TABLE, RECORD_ID, "otherValue", 1);
    expectFetch({
      url: `https://test.actito.be/ActitoWebServices/ws/v4/entity/product/customTable/${CUSTOM_TABLE}/record/${RECORD_ID}`,
      options: {
        method: "PUT",
        body: JSON.stringify({ properties: [{ name: "otherValue", value: 1 }] })
      }
    });
  });
});
