import os from "os";
import { findKey } from "lodash";
import keycodeNamesWin from "./keycodes/win32";
import keycodeNamesMac from "./keycodes/darwin";
import keycodeNamesLinux from "./keycodes/linux";

export const getCurrentLayout = (): { [key: number]: string } => {
  switch (os.platform()) {
    case "win32":
      return keycodeNamesWin;
    case "darwin":
      return keycodeNamesMac;
    case "linux":
      return keycodeNamesLinux;
    default:
      console.error(`No layout for ${os.platform()} ! Fallback to Linux `);
      return keycodeNamesLinux;
  }
};

export const getCodeFromName = (keyName: string): number => {
  const layout = getCurrentLayout();
  return parseInt(
    findKey(layout, (value) => value === keyName),
    10
  );
};

export const getNameFromCode = (keyCode: number): string => {
  const layout = getCurrentLayout();
  return layout[keyCode];
};
