import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { KeyboardAvoider } from '@presentation/base/widgets/layout/keyboard-avoider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StateView } from '@presentation/app/recipes/[recipeId]/items/state-view';
import { SignInPromptSheet } from '@presentation/base/widgets/sheets/sign-in-prompt-sheet';
import { WebRecipeDetail } from '@presentation/app/recipes/[recipeId]/body/web-recipe-detail';
import { MobileRecipeDetail } from '@presentation/app/recipes/[recipeId]/body/mobile-recipe-detail';
import { RecipeFloatingActions } from '@presentation/app/recipes/[recipeId]/body/recipe-floating-actions';
import { DeleteRecipeSheet } from '@presentation/app/recipes/[recipeId]/sheets/delete-recipe-sheet';
import { RecipeShareSheet } from '@presentation/app/recipes/[recipeId]/sheets/recipe-share-sheet';
import { useRecipeDetail } from '@presentation/app/recipes/[recipeId]/hooks/use-recipe-detail';
import { recipeWebUrl } from '@infrastructure/constants/api';
import { ResponsiveContainer } from '@presentation/base/widgets/layout/responsive-container';
import { useLayout } from '@presentation/base/responsive/use-layout';
import { useTheme } from '@presentation/base/theme/use-theme';
import { spacing, radii, sizes } from '@presentation/base/theme';

export const RecipeDetailScreen = (): React.JSX.Element => {
  const router = useRouter();
  const colors = useTheme().colors;
  const { isWebShell } = useLayout();
  const insets = useSafeAreaInsets();
  const vm = useRecipeDetail();

  return (
    <KeyboardAvoider style={[styles.root, { backgroundColor: colors.background }]}>
      <ResponsiveContainer route="recipeDetail" gutter={false} fill>
        <ScrollView ref={vm.scrollViewRef} contentContainerStyle={styles.scroll}>
          <StateView status={vm.status} failure={vm.failure} onRetry={vm.onRetry}>
            {vm.recipe !== null ? (
              isWebShell ? (
                <WebRecipeDetail
                  recipe={vm.recipe}
                  recipeId={vm.recipeId}
                  media={vm.media}
                  isOwner={vm.isOwner}
                  authorState={vm.authorState}
                  liked={vm.liked}
                  likeCount={vm.likeCount}
                  userId={vm.userId}
                  isSaved={vm.isSaved}
                  saveDisabled={vm.saveDisabled}
                  onBack={() => router.back()}
                  onToggleLike={vm.onToggleLike}
                  onToggleSave={vm.onToggleSave}
                  onEdit={vm.onEdit}
                  onDelete={vm.onOpenDelete}
                  checkedIngredients={vm.checkedIngredients}
                  onToggleIngredient={vm.onToggleIngredient}
                  completedSteps={vm.completedSteps}
                  onToggleStep={vm.onToggleStep}
                  commentState={vm.commentState}
                  commentInput={vm.commentInput}
                  submitError={vm.submitError}
                  onChangeCommentInput={vm.onChangeCommentInput}
                  onAddComment={vm.onAddComment}
                  onLoadMoreComments={vm.onLoadMoreComments}
                  onToggleCommentLike={vm.onToggleCommentLike}
                  onDeleteComment={vm.onDeleteComment}
                />
              ) : (
                <MobileRecipeDetail
                  recipe={vm.recipe}
                  recipeId={vm.recipeId}
                  media={vm.media}
                  isOwner={vm.isOwner}
                  isWebShell={isWebShell}
                  authorState={vm.authorState}
                  liked={vm.liked}
                  likeCount={vm.likeCount}
                  userId={vm.userId}
                  checkedIngredients={vm.checkedIngredients}
                  onToggleIngredient={vm.onToggleIngredient}
                  completedSteps={vm.completedSteps}
                  onToggleStep={vm.onToggleStep}
                  commentState={vm.commentState}
                  commentInput={vm.commentInput}
                  submitError={vm.submitError}
                  onChangeCommentInput={vm.onChangeCommentInput}
                  onFocusCommentInput={vm.onFocusCommentInput}
                  onToggleLike={vm.onToggleLike}
                  onEdit={vm.onEdit}
                  onDelete={vm.onOpenDelete}
                  onAddComment={vm.onAddComment}
                  onLoadMoreComments={vm.onLoadMoreComments}
                  onToggleCommentLike={vm.onToggleCommentLike}
                  onDeleteComment={vm.onDeleteComment}
                />
              )
            ) : null}
          </StateView>
        </ScrollView>
      </ResponsiveContainer>

      {!isWebShell ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          style={[styles.backButton, { top: insets.top + 8, backgroundColor: colors.overlayLight }]}
        >
          <Ionicons name="chevron-back" size={24} color={colors.onOverlay} />
        </Pressable>
      ) : null}

      <DeleteRecipeSheet
        visible={vm.showDeleteSheet}
        deleteError={vm.deleteError}
        isDeleting={vm.isDeleting}
        onClose={vm.onCloseDelete}
        onConfirm={vm.onConfirmDelete}
      />

      <SignInPromptSheet
        visible={vm.promptVisible}
        onClose={vm.onClosePrompt}
        onSignIn={vm.onGoToSignIn}
        message={vm.promptMessage}
      />

      {vm.recipe !== null ? (
        <>
          {!isWebShell ? (
            <RecipeFloatingActions
              insetsTop={insets.top}
              isOwner={vm.isOwner}
              likedByMe={vm.likedByMe}
              isSaved={vm.isSaved}
              saveDisabled={vm.saveDisabled}
              onEdit={vm.onEdit}
              onShare={vm.onOpenShare}
              onToggleLike={vm.onToggleLike}
              onToggleSave={vm.onToggleSave}
            />
          ) : null}
          <RecipeShareSheet
            visible={vm.shareOpen}
            onClose={vm.onCloseShare}
            recipeName={vm.recipe.name}
            cuisine={vm.cuisineName}
            imageUrl={vm.firstImageUrl}
            url={recipeWebUrl(vm.recipeId)}
          />
        </>
      ) : null}
    </KeyboardAvoider>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
  },
  backButton: {
    position: 'absolute',
    left: spacing.lg,
    width: sizes.floatingBtn,
    height: sizes.floatingBtn,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default RecipeDetailScreen;
