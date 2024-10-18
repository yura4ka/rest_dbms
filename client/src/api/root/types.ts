export interface DbDto {
  id: string;
  name: string;
}

export interface CreateDatabaseDto {
  name: string;
}

export interface CreateDatabaseResponse {
  id: string;
}

export interface CreateDatabaseError {
  message: string;
}
