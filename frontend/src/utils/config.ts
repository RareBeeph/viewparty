import * as ConfigStore from '../../wailsjs/go/wailsconfigstore/ConfigStore';

interface Credentials {
  host: string;
  port: number;
  password: string;
}

interface SourceDir {
  sourceDir: string;
}

// To save us some magic string repetition
const AUTH_FILE = 'auth.json';
const QUEUE_SOURCE_FILE = 'sourcedir.json';

const configDefaults = {
  host: 'localhost',
  port: 4455,
  password: '',
};

const defaultSource = { sourceDir: './videos' };

export const getCredentials = async () =>
  JSON.parse(
    (await ConfigStore.Get(AUTH_FILE, JSON.stringify(configDefaults))) as string,
  ) as Credentials;

export const saveCredentials = (creds: Credentials) =>
  ConfigStore.Set(AUTH_FILE, JSON.stringify(creds));

export const getSourceDir = async () =>
  JSON.parse(
    (await ConfigStore.Get(QUEUE_SOURCE_FILE, JSON.stringify(defaultSource))) as string,
  ) as SourceDir;

export const saveSourceDir = (sourceDir: string) =>
  ConfigStore.Set(QUEUE_SOURCE_FILE, JSON.stringify({ sourceDir }));
