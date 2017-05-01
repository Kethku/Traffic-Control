import {exec} from "child_process"
import asyncUtils from "./async-utils";
import settingsManager from "./settingsManager";

export module EditorManager {
    export async function editFile(path: string, watch?: boolean) {
        let settings = await settingsManager.getSettings();
        if (settings.editCommand) {
            let editCommand = settings.editCommand + path;
            exec(editCommand);
        } else {
            console.log("Edit " + path);
        }

        if (watch === undefined || watch) {
            await asyncUtils.watch(path);
        }
    }
}

export default EditorManager;
