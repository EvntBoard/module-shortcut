import {isArray, isString} from "lodash";

require("dotenv").config();
import { EvntComNode } from "evntcom-js/dist/node";
import ioHook from "iohook";
import { getCodeFromName } from "./utils";

const NAME: string = process.env.EVNTBOARD_NAME || "shortcut";
const HOST: string = process.env.EVNTBOARD_HOST || "localhost";
const PORT: number = process.env.EVNTBOARD_PORT ? parseInt(process.env.EVNTBOARD_PORT) : 5001;
const KEYS: any = process.env.EVNTBOARD_CONFIG_KEYS;

const evntCom = new EvntComNode({
    name: NAME,
    port: PORT,
    host: HOST,
});

evntCom.onOpen = async () => {
    try {
        if (isArray(KEYS)) {
            await Promise.all(KEYS?.map(async (keys: string) => {
                await registerShortCut(keys)
            }))
        } else if (isString(KEYS)) {
            await Promise.all(KEYS.split(',')?.map(async (keys: string) => {
                await registerShortCut(keys)
            }))
        }
    } catch (e) {
        console.log(e)
    }
    ioHook.start(false);
}

const shortcuts: Map<string, number> = new Map<string, number>()
const shortcutsNumber: Map<string, number> = new Map<string, number>()

const registerShortCut = async (keysString: string) => {
    const keyStringArray: string[] = keysString.split('+')
    let idHook = shortcuts.get(keysString);
    if (idHook === undefined) {
        const keysCode = keyStringArray.map((i) => getCodeFromName(i));
        idHook = ioHook.registerShortcut(keysCode, () => {
            evntCom.callMethod("newEvent", [
                `shortcut:${keysString}`,
                null,
                {emitter: NAME},
            ]);
        });
        shortcuts.set(keysString, idHook);
    } else {
        console.debug(
          `shortcut:${keysString} already registered !`
        );
    }
}

const unregisterShortCut = async (keysString: string) => {
    const idHook = shortcuts.get(keysString);
    if (idHook !== undefined) {
        shortcuts.delete(keysString);
        return ioHook.unregisterShortcut(idHook);
    } else {
        console.debug(
          `shortcut:${keysString} is not registered !`
        );
    }
}

// NUMBERS

const registerShortCutNumber = async (keys: number[]) => {
    const keyString: string = keys.join(',')
    let idHook = shortcutsNumber.get(keyString);
    if (idHook === undefined) {
        idHook = ioHook.registerShortcut(keys, () => {
            evntCom.callMethod("newEvent", [
                `shortcut:${keyString}`,
                null,
                {emitter: NAME},
            ]);
        });
        shortcutsNumber.set(keyString, idHook);
    } else {
        console.debug(
            `shortcut:${keyString} already registered !`
        );
    }
}

const unregisterShortCutNumber = async (keys: number[]) => {
    const keyString: string = keys.join(',')
    const idHook = shortcutsNumber.get(keyString);
    if (idHook !== undefined) {
        shortcuts.delete(keyString);
        return ioHook.unregisterShortcut(idHook);
    } else {
        console.debug(
            `shortcut:${keys} is not registered !`
        );
    }
}

evntCom.expose("registerShortCut", registerShortCut);
evntCom.expose("unregisterShortCut", unregisterShortCut);
evntCom.expose("registerShortCutNumber", registerShortCutNumber);
evntCom.expose("unregisterShortCutNumber", unregisterShortCutNumber);