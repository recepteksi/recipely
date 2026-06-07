import { fail, ok, type Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import { Comment } from '@domain/comments/comment';
import type { CommentPage, ICommentRepository } from '@domain/comments/i-comment-repository';
import type { HttpClient } from '@infrastructure/network/http-client';
import type { CommentDto, CommentPageDto } from '@infrastructure/comments/comment-dto';

/**
 * Implements `ICommentRepository` against the Recipely backend. Supports
 * paginated listing, adding, and removing comments scoped to a recipe.
 */
export class CommentRepository implements ICommentRepository {
  constructor(private readonly http: HttpClient) {}

  async listByRecipe(
    recipeId: string,
    page: number,
    pageSize: number,
  ): Promise<Result<CommentPage, Failure>> {
    const result = await this.http.request<CommentPageDto>({
      method: 'GET',
      url: `/recipes/${encodeURIComponent(recipeId)}/comments`,
      params: { page, pageSize },
    });
    if (!result.ok) {
      return result;
    }
    const items: Comment[] = [];
    for (const dto of result.value.items) {
      const mapped = mapDtoToComment(dto);
      if (!mapped.ok) {
        return fail(mapped.failure);
      }
      items.push(mapped.value);
    }
    return ok({
      items,
      total: result.value.total,
      page: result.value.page,
      pageSize: result.value.pageSize,
    });
  }

  async add(recipeId: string, body: string): Promise<Result<Comment, Failure>> {
    const result = await this.http.request<CommentDto>({
      method: 'POST',
      url: `/recipes/${encodeURIComponent(recipeId)}/comments`,
      data: { body },
    });
    if (!result.ok) {
      return result;
    }
    return mapDtoToComment(result.value);
  }

  async remove(recipeId: string, commentId: string): Promise<Result<void, Failure>> {
    const result = await this.http.request<unknown>({
      method: 'DELETE',
      url: `/recipes/${encodeURIComponent(recipeId)}/comments/${encodeURIComponent(commentId)}`,
    });
    if (!result.ok) {
      return result;
    }
    return ok(undefined);
  }

  async like(recipeId: string, commentId: string): Promise<Result<void, Failure>> {
    const result = await this.http.request({
      method: 'POST',
      url: `/recipes/${encodeURIComponent(recipeId)}/comments/${encodeURIComponent(commentId)}/like`,
    });
    if (!result.ok) return fail(result.failure);
    return ok(undefined);
  }

  async unlike(recipeId: string, commentId: string): Promise<Result<void, Failure>> {
    const result = await this.http.request({
      method: 'DELETE',
      url: `/recipes/${encodeURIComponent(recipeId)}/comments/${encodeURIComponent(commentId)}/like`,
    });
    if (!result.ok) return fail(result.failure);
    return ok(undefined);
  }
}

function mapDtoToComment(dto: CommentDto): Result<Comment, Failure> {
  return Comment.create({
    id: dto.id,
    body: dto.body,
    authorId: dto.authorId,
    recipeId: dto.recipeId,
    createdAt: new Date(dto.createdAt),
    authorDisplayName: dto.authorDisplayName,
    authorPhotoUrl: dto.authorPhotoUrl,
    likeCount: dto.likeCount ?? 0,
    likedByMe: dto.likedByMe ?? false,
  });
}
