import { apiClient } from "../apiClient";
import { DbInfoDto, DbTable, EditRowDto, EditTableDto } from "./types";

export const dbApi = {
  getInfo: (id: string) => apiClient.get<DbInfoDto>(`db/${id}`).then((res) => res.data),
  getTable: (id: string, tableName: string, search?: string) =>
    apiClient.get<DbTable>(`db/${id}/${tableName}`, { params: { search } }).then((res) => res.data),
  createRow: (id: string, tableName: string, data: EditRowDto) =>
    apiClient.post(`db/${id}/${tableName}`, data),
  editRow: (id: string, tableName: string, pk: string, data: EditRowDto) =>
    apiClient.put(`db/${id}/${tableName}/${pk}`, data),
  createTable: (id: string, data: EditTableDto) => apiClient.post(`db/${id}`, data),
  dropTable: (id: string, tableName: string) => apiClient.delete(`db/${id}/${tableName}`),
  deleteRow: (id: string, tableName: string, pkValue: string) =>
    apiClient.delete(`db/${id}/${tableName}/${pkValue}`),
};
