import pouchManager from "../pouchManager";
import outputManager from "../outputManager";

export async function fetch(id: string, options: any) {
    let db = await pouchManager.getLocalDb();
    try {
        let doc = await db.get(id);
        await outputManager.outputResults([doc], options.output, options.all, options.edit);
    } catch (err) {
        if (err.status === 404) {
            console.log("Id does not exist");
        }
        console.error(err);
    }
}
