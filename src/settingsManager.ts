import * as os from "os";
import * as path from "path";
import * as fs from "fs";
import * as yaml from "js-yaml";
import utils from "./utils";
import asyncUtils from "./async-utils";

export module Settings {
    let defaultSettings = {
        editCommand: "emacsclientw -na runemacs.exe -c ",
        extension: "pdb",
        remoteUrl: false
    };

    let dotFile = path.join(path.join(os.homedir(), ".dbsettings"));
    let settings: any;

    export async function getSettings() {
        if (settings === undefined) {
            try {
                let dotFileData = await asyncUtils.readFile(dotFile);
                let newSettings = yaml.load(dotFileData.toString());
                let overwrittenSettings: typeof defaultSettings = utils.overwrite(defaultSettings, newSettings);
                settings = overwrittenSettings;
            } catch (err) {
                console.warn("Settings file missing. Using defaults");
                settings = defaultSettings;
            }
        }
        return settings;
    }

}

export default Settings;
