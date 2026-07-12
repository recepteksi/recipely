export interface FavoritesListResponse {
  items: { id: string }[];
  total: number;
  page: number;
  pageSize: number;
}
