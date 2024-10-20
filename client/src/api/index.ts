import { rootApi } from "./root/rootApi";
import { rootQueryKeyFactory } from "./root/rootQueryKeyFactory";
import { dbApi } from "./db/dbApi";
import { dbQueryKeyFactory } from "./db/dbQueryKeyFactory";

export const api = {
  root: rootApi,
  db: dbApi,
};

export const queryKeyFactory = {
  root: rootQueryKeyFactory,
  db: dbQueryKeyFactory,
};
