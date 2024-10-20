import { apiClient } from "../apiClient";
import { DbInfoDto, DbTable } from "./types";

export const dbApi = {
  getInfo: (id: string) => apiClient.get<DbInfoDto>(`db/${id}`).then((res) => res.data),
  getTable: (id: string, tableName: string, search?: string) =>
    apiClient.get<DbTable>(`db/${id}/${tableName}`, { params: { search } }).then((res) => res.data),
};
