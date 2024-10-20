import { apiClient } from "../apiClient";
import { CreateDatabaseDto, CreateDatabaseError, CreateDatabaseResponse, DbDto } from "./types";

export const rootApi = {
  getDatabases: () => apiClient.get<DbDto[]>("/").then((res) => res.data),
  createDatabase: (request: CreateDatabaseDto) =>
    apiClient.post<CreateDatabaseError, CreateDatabaseResponse>("/", request),
  deleteDatabase: (id: string) => apiClient.delete(`/${id}`),
};
