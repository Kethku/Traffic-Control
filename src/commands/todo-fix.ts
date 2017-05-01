import * as moment from "moment";
import * as chrono from "chrono-node";

import pouchManager from "./pouchManager";
import outputManager from "./outputManager";
import {parseEffort} from "./todo-next";

function dateNeedsUpdated(doc: any, id: string) {
    if (id in doc) {
        let referenceDate = moment.utc(parseInt(doc["_id"]));
        let scheduledDate = chrono.parseDate(doc[id], referenceDate.toDate(), {forwardDatesOnly: true});
        if (moment().isAfter(scheduledDate, "day")) {
            doc[id] = null;
            return true;
        }
    } else {
        return false;
    }
}

export async function fix() {
    try {
        let db = await pouchManager.getLocalDb();
        let findResponse = await db.find({
            selector: {
                todo: { $exists: true }
            }
        });

        let problemTodoItems: any[] = [];
        for (let doc of findResponse.docs) {
            let problem = false;
            if (!("effort" in doc)) {
                problem = true;
                doc.effort = null;
            } else {
                let parsedEffort = parseEffort(doc.effort);
                if (parsedEffort === undefined) {
                    problem = true;
                    doc.effort = null
                }
            }

            problem = problem || dateNeedsUpdated(doc, "scheduled");
            problem = problem || dateNeedsUpdated(doc, "due");

            if (problem) {
                problemTodoItems.push(doc);
            }
        }

        if (problemTodoItems.length != 0) {
            await outputManager.outputResults(problemTodoItems, true, false, false);
        } else {
            console.log("All good");
        }
    } catch (err) {
        console.error(err);
    }
}
