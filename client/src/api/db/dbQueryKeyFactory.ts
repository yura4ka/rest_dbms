export const dbQueryKeyFactory = {
  dbInfo: ["dbInfo"] as const,
  dbById: (id: string) => ["dbInfo", id],
};
