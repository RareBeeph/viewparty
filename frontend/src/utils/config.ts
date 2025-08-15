import * as ConfigStore from '../../wailsjs/go/wailsconfigstore/ConfigStore';

interface Credentials {
  host: string;
  port: number;
  password: string;
}

// To save us some magic string repetition
const AUTH_FILE = 'auth.json';

const defaults = {
  host: 'localhost',
  port: 4445,
  password: '',
};

const readConfig = async () => JSON.parse(await ConfigStore.Get(AUTH_FILE, 'null')) as Credentials;

export const getCredentials = async () =>
  ({
    ...defaults,
    ...(await readConfig()),
  }) as Credentials;

export const saveCredentials = (creds: Credentials) =>
  ConfigStore.Set(AUTH_FILE, JSON.stringify(creds));
