import * as ConfigStore from '../../wailsjs/go/wailsconfigstore/ConfigStore';

export interface Config {
  host: string;
  port: number;
  password: string;
  sourceDir: string;
}

// To save us some magic string repetition
const CONFIG_FILE = 'config.json';

const configDefaults = {
  host: 'localhost',
  port: 4455,
  password: '',
  sourceDir: './videos',
};

export const getConfig = async () =>
  JSON.parse(
    (await ConfigStore.Get(CONFIG_FILE, JSON.stringify(configDefaults))) as string,
  ) as Config;

export const saveConfig = (creds: Config) => ConfigStore.Set(CONFIG_FILE, JSON.stringify(creds));
