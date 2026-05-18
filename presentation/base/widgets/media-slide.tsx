import { Image, StyleSheet } from 'react-native';
import { VideoSlide } from '@presentation/base/widgets/video-slide';
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
    <Image
      source={{ uri: item.url }}
      style={[styles.coverImage, { width, height }]}
    />
  );
};

const styles = StyleSheet.create({
  coverImage: {
    resizeMode: 'cover',
  },
});
