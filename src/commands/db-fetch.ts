import pouchManager from "../pouchManager";

export async function fetch(id: string, options: any) {
  let db = await pouchManager.getLocalDb();
  try {
    let doc = await db.get(id);
  } catch (err) {
    if (err.status === 404) {
      console.log("Id does not exist");
    }
    console.error(err);
  }
}
