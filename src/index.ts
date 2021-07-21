import process from 'process';
import ioHook from "iohook";
import { EvntComClient, EvntComServer } from "evntboard-communicate";
import { getCodeFromName } from "./utils";

// parse params
const { name: NAME, customName: CUSTOM_NAME, config: CONFIG } = JSON.parse(process.argv[2]);
const EMITTER = CUSTOM_NAME || NAME;

// create Client and Server COM
const evntComClient = new EvntComClient(
    (cb: any) => process.on('message', cb),
    (data: any) => process.send(data),
);

const evntComServer = new EvntComServer();

evntComServer.registerOnData((cb: any) => process.on('message', async (data) => {
    const toSend = await cb(data);
    if (toSend) process.send(toSend);
}));

evntComServer.expose("newEvent", () => {});
evntComServer.expose("load", () => {
    try {
        console.log(CONFIG)
        CONFIG.forEach((keys: string) => {
            registerShortCut(keys)
        })
    } catch (e) {
        console.log(e)
    }
    ioHook.start(false);
});
evntComServer.expose("unload", () => {});
evntComServer.expose("reload", () => {});


const shortcuts: Map<string, number> = new Map<string, number>()


const registerShortCut = (keysString: string) => {
    const keyStringArray: string[] = keysString.split('+')
    let idHook = shortcuts.get(keysString);
    if (idHook === undefined) {
        const keysCode = keyStringArray.map((i) => getCodeFromName(i));
        idHook = ioHook.registerShortcut(keysCode, () => {
            evntComClient?.newEvent(`shortcut:${keysString}`, null, { emitter: EMITTER })
        });
        shortcuts.set(keysString, idHook);
    } else {
        console.debug(
          `shortcut:${keysString} already registered !`
        );
    }
}

const unregisterShortCut = (keysString: string) => {
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

evntComServer.expose("registerShortCut", registerShortCut);
evntComServer.expose("unregisterShortCut", unregisterShortCut);