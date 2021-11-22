import { EvntComNode } from "evntcom-js/dist/node";
import ioHook from "iohook";
import { getCodeFromName } from "./utils";

export class ShortCutConnexion {
  private evntCom: EvntComNode;
  private name: string;
  private keys: string[] | Array<number[]>;

  private shortcuts: Map<string, number> = new Map<string, number>();
  private shortcutsNumber: Map<string, number> = new Map<string, number>();

  constructor(
    evntBoardHost: string,
    evntBoardPort: number,
    name: string,
    keys: string[] | Array<number[]>
  ) {
    this.name = name;
    this.keys = keys;
    this.evntCom = new EvntComNode({
      name,
      port: evntBoardPort,
      host: evntBoardHost,
    });

    this.evntCom.on('open', async () => {
      await this.evntCom.notify("newEvent", [
        "shortcut-load",
        null,
        { emitter: this.name },
      ]);

      try {
        if (Array.isArray(this.keys)) {
          await Promise.all(
            this.keys?.map(async (keys: string | number[]) => {
              if (Array.isArray(keys)) {
                await this.registerShortCutNumber(keys);
              } else {
                await this.registerShortCut(keys);
              }
            })
          );
        }
      } catch (e) {
        console.log(e);
      }
      ioHook.start(false);
    });

    this.evntCom.expose("registerShortCut", this.registerShortCut);
    this.evntCom.expose("unregisterShortCut", this.unregisterShortCut);
    this.evntCom.expose("registerShortCutNumber", this.registerShortCutNumber);
    this.evntCom.expose(
      "unregisterShortCutNumber",
      this.unregisterShortCutNumber
    );
  }

  registerShortCut = async (keysString: string) => {
    const keyStringArray: string[] = keysString.split("+");
    let idHook = this.shortcuts.get(keysString);
    if (idHook === undefined) {
      const keysCode = keyStringArray.map((i) => getCodeFromName(i));
      idHook = ioHook.registerShortcut(keysCode, () => {
        this.evntCom.notify("newEvent", [
          `shortcut:${keysString}`,
          null,
          { emitter: this.name },
        ]);
      });
      this.shortcuts.set(keysString, idHook);
    } else {
      console.debug(`shortcut:${keysString} already registered !`);
    }
  };

  unregisterShortCut = async (keysString: string) => {
    const idHook = this.shortcuts.get(keysString);
    if (idHook !== undefined) {
      this.shortcuts.delete(keysString);
      return ioHook.unregisterShortcut(idHook);
    } else {
      console.debug(`shortcut:${keysString} is unregistered !`);
    }
  };

  // NUMBERS

  registerShortCutNumber = async (keys: number[]) => {
    const keyString: string = keys.join(",");
    let idHook = this.shortcutsNumber.get(keyString);
    if (idHook === undefined) {
      idHook = ioHook.registerShortcut(keys, () => {
        this.evntCom.callMethod("newEvent", [
          `shortcut:${keyString}`,
          null,
          { emitter: this.name },
        ]);
      });
      this.shortcutsNumber.set(keyString, idHook);
    } else {
      console.debug(`shortcut:${keyString} already registered !`);
    }
  };

  unregisterShortCutNumber = async (keys: number[]) => {
    const keyString: string = keys.join(",");
    const idHook = this.shortcutsNumber.get(keyString);
    if (idHook !== undefined) {
      this.shortcuts.delete(keyString);
      return ioHook.unregisterShortcut(idHook);
    } else {
      console.debug(`shortcut:${keys} is unregistered !`);
    }
  };
}
