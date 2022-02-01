import { ConfigLoader } from "./ConfigLoader";
import { ShortCutConnexion } from "./ShortCutConnexion";

const main = async () => {
  const configLoader = new ConfigLoader();
  await configLoader.load();

  const conf = configLoader.getConfig();

  if (!conf.name) {
    conf.name = "shortcut";
  }
  new ShortCutConnexion(conf.host, conf.port, conf.name, conf.keys);
};

main();
