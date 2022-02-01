import os from "os";
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
  const layoutKey = Object.entries(layout).find(([ key, value ]) => {
    return value === keyName
  })
  if (layoutKey) {
    return parseInt(layoutKey[0],10);
  }
  return undefined;
};

export const getNameFromCode = (keyCode: number): string => {
  const layout = getCurrentLayout();
  return layout[keyCode];
};
