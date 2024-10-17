import { apiClient } from "../apiClient";
import { DbDto } from "./types";

export const rootApi = {
  getDatabases: () => apiClient.get<DbDto[]>("/"),
};
