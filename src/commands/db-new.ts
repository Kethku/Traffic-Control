import * as moment from "moment";
import * as yaml from "js-yaml";
import {exec} from "child_process"
import {archive} from "./db-archive";
import asyncUtils from "./async-utils";
import settingsManager from "./settingsManager";
import editorManager from "./editorManager";

export async function newEntry(tag?: string | number) {
    let settings = await settingsManager.getSettings();
    let now = moment.utc().valueOf();
    let fileName = "docs." + settings.extension;
    let entryName = now.toString();
    let entryData: any = { };
    if (tag) entryData[tag] = "";
    let entry: any = {};
    entry[entryName] = entryData;
    try {
        await asyncUtils.writeFile(fileName, yaml.dump(entry));
    } catch (err) {
        console.log(err);
    }

    await editorManager.editFile(fileName);

    await archive();
}
