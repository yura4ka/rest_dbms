import { apiClient } from "../apiClient";
import { DbInfoDto } from "./types";

export const dbApi = {
  getInfo: (id: string) => apiClient.get<DbInfoDto>(`db/${id}`).then((res) => res.data),
};
