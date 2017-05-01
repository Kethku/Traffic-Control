export module Utils {
    export function overwrite<T>(origObj: T, newObj: any) {
        let returnObj = JSON.parse(JSON.stringify(origObj));
        for (let key in origObj) {
            if (key in newObj) {
                if (key === null) {
                    delete returnObj[key];
                } else {
                    returnObj[key] = newObj[key];
                }
            }
        }
        return returnObj;
    }
}

export default Utils;
