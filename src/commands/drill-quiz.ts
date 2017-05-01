import * as moment from "moment";
import {question, close} from "./inputManager";
import pouchManager from "./pouchManager";
import settingsManager from "./settingsManager";

function clamp(x: number) {
    if (x < 0) {
        return 0;
    }
    if (x > 1) {
        return 1;
    }
    return x;
}

export async function quiz() {
    let db = await pouchManager.getLocalDb();
    let findResponse = await db.find({
        selector: {
            $and: [
                { $or: [
                    { question: { $exists: true } },
                    { q: { $exists: true } }
                ] },
                { $or: [
                    { answer: { $exists: true } },
                    { a: { $exists: true } }
                ] }
            ]
        }
    });

    let cards = findResponse.docs;
    let infoCards = cards.filter((card) => {
        return ("difficulty" in card) &&
            ("$daysBetweenReviews" in card) &&
            ("$dateLastReviewed" in card);
    });
    infoCards.forEach((card) => {
        card.$daysSinceReviewed = moment().diff(moment(card.$dateLastReviewed), "days", true)
        card.$percentOverdue = Math.min(card.$daysSinceReviewed / card.$daysBetweenReviews, 2);
    });

    cards = cards.sort((a, b) =>  {
        if (!a.$percentOverdue) {
            return -1;
        } else if (!b.$percentOverdue) {
            return 1;
        } else {
            return b.$percentOverdue - a.$percentOverdue
        }
    }).filter(card => {
        let daysOverdue = card.$daysSinceReviewed - card.$daysBetweenReviews;
        return daysOverdue >= -2 && card.$daysSinceReviewed > 0.333;
    });

    if (cards.length === 0) {
        console.log("All done, nothing to study at the moment.")
    } else {
        for (let card of cards) {
            let q = card.q;
            let a = card.a;
            await question(q);

            console.log(a);
            let query = "Understanding:";
            let performanceRating = parseFloat(await question(query));
            while(isNaN(performanceRating) || performanceRating < 1 || performanceRating > 10) {
                console.log("Require number between 1 and 10.");
                performanceRating = parseFloat(await question(query));
            }

            performanceRating = performanceRating / 10;
            let correct = performanceRating > 0.6;

            if ("$percentOverdue" in card) {
                card.difficulty += card.$percentOverdue * (1/17) * (8 - 9*performanceRating);
                card.difficulty = clamp(card.difficulty);
                console.log("New difficulty: " + card.difficulty);
            } else {
                card.difficulty = 0.3;
                card.$percentOverdue = 1;
                console.log("New Card, defaulting to 0.3 difficulty")
            }

            let difficultyWeight = 3 - 1.7 * card.difficulty;
            card.$dateLastReviewed = moment.now();
            if (correct) {
                card.$daysBetweenReviews = 1 + (difficultyWeight - 1) * card.$percentOverdue;
            } else {
                card.$daysBetweenReviews = 1 / difficultyWeight;
            }

            delete card["$daysSinceReviewed"];
            delete card["$percentOverdue"];
            delete card["$difficulty"];
        }
    }

    close();

    if (cards.length != 0) {
        await db.bulkDocs(cards);
    }
}
