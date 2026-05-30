import { StyleSheet, View } from 'react-native';
import { VideoSlide } from '@presentation/base/widgets/video-slide';
import { RecipeImage } from '@presentation/base/widgets/recipe-image';
import { t } from '@presentation/i18n';
import type { MediaItem } from '@domain/recipes/media-item';

interface MediaSlideProps {
  item: MediaItem;
  width: number;
  height: number;
}

/** Renders a single media item (image or video) sized to the given dimensions. */
export const MediaSlide = ({ item, width, height }: MediaSlideProps): React.JSX.Element => {
  if (item.type === 'video') {
    return <VideoSlide item={item} width={width} height={height} />;
  }
  return (
    <View style={{ width, height }}>
      <RecipeImage
        uri={item.url}
        style={styles.coverImage}
        placeholderLabel={t().recipes.noPhoto}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});
