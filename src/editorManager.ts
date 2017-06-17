import {exec} from "child_process"
import asyncUtils from "./async-utils";

export module EditorManager {
    export async function editFile(path: string, watch?: boolean) {
        let editCommand = "emacsclientw -na runemacs.exe -c " + path;
        exec(editCommand);

        if (watch === undefined || watch) {
            await asyncUtils.watch(path);
        }
    }
}

export default EditorManager;
