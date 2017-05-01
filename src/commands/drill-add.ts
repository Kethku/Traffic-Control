import * as moment from "moment";
import pouchManager from "../pouchManager";
import indexManager from "../indexManager";

export async function add(question?: string, answer?: string, category?: string) {
    let q = question;
    let a = answer;
    let c = category;

    let contString = "";
    do {
        // if (!question) {
        //     q = await askQuestion("question:");
        // }
        // if (!answer) {
        //     a = await askQuestion("answer:");
        // }
        // if (!category) {
        //     c = await askQuestion("category:");
        // }
        // contString = await askQuestion("correct?:");
        question = undefined;
        answer = undefined;
        category = undefined;
    }
    while (contString.toLowerCase() !== "y" && contString.toLowerCase() !== "yes")

    close();

    try {
        let db = await pouchManager.getLocalDb();
        let card = {
            _id: moment.now().toString(),
            q: q,
            a: a,
            category: c
        }

        await indexManager.updateIndexedFields(card);
        await db.put(card);
    } catch (err) {
        console.error(err);
    }
}
