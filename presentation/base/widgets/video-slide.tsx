import { useVideoPlayer, VideoView } from 'expo-video';
import type { MediaItem } from '@domain/recipes/media-item';

interface MediaSlideProps {
  item: MediaItem;
  width: number;
  height: number;
}

/** Renders a loopless muted video player sized to the given dimensions. */
export const VideoSlide = ({ item, width, height }: MediaSlideProps): React.JSX.Element => {
  const player = useVideoPlayer(item.url, (p) => {
    p.loop = false;
    p.muted = true;
  });
  return (
    <VideoView
      style={{ width, height }}
      player={player}
      contentFit="cover"
      nativeControls
    />
  );
};
