export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> extends PaginationParams {
  items: T[];
  total: number;
}
