import pouchManager from "../pouchManager";
import outputManager from "../outputManager";

import * as chrono from "chrono-node";
import * as moment from "moment";

let productiveTimePerDay = 300;

export async function next(timeAvailable: string, options: any) {
    try {
        let db = await pouchManager.getLocalDb();
        let findResults = await db.find({
            selector: { $and: [
                { todo: { $exists: true } },
                { effort: { $exists: true } }
            ] }
        });

        let scoredDocs = findResults.docs.map((doc) => {
            let referenceDate = moment.utc(parseInt(doc["_id"]));
            if ("due" in doc) {
                let dueDate = chrono.parseDate(doc["due"], referenceDate.toDate(), {forwardDatesOnly: true});
                let daysTillDue = moment(dueDate).diff(moment(), "days");
                let effort = parseEffort(doc.effort);
                doc.amountOverdue = effort - daysTillDue * productiveTimePerDay;
            }
            if ("scheduled" in doc) {
                let scheduledDate = chrono.parseDate(doc["scheduled"], referenceDate.toDate(), {forwardDatesOnly: true});
                doc.scheduledToday = moment(scheduledDate).isSameOrBefore(moment(), "days");
            }
            return doc;
        }).sort((doc1, doc2) => {
            return scoreDoc(doc2) - scoreDoc(doc1);
        });

        let minutesLeft = parseEffort(timeAvailable);
        let selectedItems: any[] = [];

        while (minutesLeft > 0) {
            let nextHighestPriority = scoredDocs[0];
            if (("amountOverdue" in nextHighestPriority && nextHighestPriority.amountOverdue > 0) ||
                (nextHighestPriority.scheduledToday)) {
                let effort = parseEffort(nextHighestPriority.effort);
                if (minutesLeft - effort > 0 || selectedItems.length == 0) {
                    scoredDocs.shift();
                    selectedItems.push(nextHighestPriority);
                    minutesLeft -= effort;
                    continue;
                }
            }

            let nextLowestEffort = scoredDocs.pop();
            selectedItems.push(nextLowestEffort);
            let effort = parseEffort(nextLowestEffort.effort);
            minutesLeft -= effort;
        }

        selectedItems.forEach((doc) => {
            delete doc.amountOverdue;
            delete doc.scheduledToday;
        });
        await outputManager.outputResults(selectedItems, options.output, options.all, options.edit);

    } catch (err) {
        console.error(err);
    }
}

export function parseEffort(effortString: string) {
    try {
        let parts = effortString.split(" ");
        let minutes = 0;
        let temp = 0;
        if (parts.length == 1) {
            let result = parseInt(parts[0]) * 60;
            if (isNaN(result)) {
                return undefined;
            } else {
                return result;
            }
        }
        for (let part of parts) {
            part = part.toLowerCase();
            if (part === "hours" ||
                part === "hour" ||
                part === "h") {
                minutes += temp * 60;
                temp = 0;
            } else if (part === "minutes" ||
                       part === "minute" ||
                       part === "mins" ||
                       part === "min" ||
                       part === "m") {
                minutes += temp;
                temp = 0;
            } else {
                temp = parseInt(part);
                if (isNaN(temp)) {
                    return undefined;
                }
            }
        }
        minutes += temp;
        return minutes;
    } catch (err) {
        return undefined;
    }
}

export function scoreDoc(doc: any) {
    let score = 0;
    if ("amountOverdue" in doc) {
        if (doc.amountOverdue > 0) {
            score += doc.amountOverdue * 1000000;
        }
    }
    if (doc.scheduledToday) {
        score += 1000;
    }
    score += parseEffort(doc.effort);
    return score;
}
