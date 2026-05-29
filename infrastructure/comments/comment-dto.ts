export interface CommentDto {
  id: string;
  body: string;
  moderationStatus: string;
  recipeId: string;
  authorId: string;
  authorDisplayName: string;
  authorPhotoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CommentPageDto {
  items: CommentDto[];
  total: number;
  page: number;
  pageSize: number;
}
