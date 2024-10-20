export const dbQueryKeyFactory = {
  dbInfo: ["dbInfo"] as const,
  dbById: (id: string) => ["dbInfo", id],
  tableById: (id: string, tableName: string, search?: string) => ["dbInfo", id, tableName, search],
};
