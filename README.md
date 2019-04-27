# data-model-sdk

|***THIS IS STILL VERY PRELIMINARY. PLEASE DON'T USE.***|
|---|

## Example use

```javascript
async function demoProfiles() {
  const newProfile = { firstName: "Alain", lastName: "Dresse", emailAddress: "ziki@example.com" };

  const { profileId } = await createProfile("Clients", { profile: newProfile });
  const { profile: initialProfile } = await getProfile("Clients", profileId);
  await updateProfile("Clients", profileId, { profile: { firstName: "Ziki" } });
  const { profile: updatedProfile } = await getProfile("Clients", profileId);
  await deleteProfile("Clients", profileId);

  console.log({initialProfile, updatedProfile});
}

async function demoTables() {
  const tableName = "OfferAssignments";
  const newRecord = { synchronized: false, offerReference: "springoffer", profileReference: "alaindresse@example.com" };

  const { businessKey: id } = await addRecord(tableName, newRecord);
  const initialRecord = await getRecord(tableName, id);
  await updateRecord(tableName, id, { assignmentReference: "aaa" });
  const updatedRecord = await getRecord(tableName, id);
  await deleteRecord(tableName, id);

  console.log({initialRecord, updatedRecord});
}
```