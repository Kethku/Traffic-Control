import pouchManager from "../pouchManager";
import indexManager from "../indexManager";

export async function sync() {
    await pouchManager.sync();
    await indexManager.indexAll();
}

