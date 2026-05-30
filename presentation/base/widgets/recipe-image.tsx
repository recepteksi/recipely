import { useEffect, useState } from 'react';
import { Image, type ImageStyle, type StyleProp } from 'react-native';
import { recipeImageSource } from './recipe-image-source';

export interface RecipeImageProps {
  /** Remote recipe / media URI. Empty or missing falls back to the placeholder. */
  uri: string | undefined | null;
  style?: StyleProp<ImageStyle>;
  accessibilityLabel?: string;
}

/**
 * Recipe image that degrades to the bundled brand placeholder both when the URI
 * is missing and when the remote file fails to load (e.g. a deleted upload that
 * now 404s). Without the `onError` fallback those rows render a broken-image box.
 */
export const RecipeImage = ({
  uri,
  style,
  accessibilityLabel,
}: RecipeImageProps): React.JSX.Element => {
  const [failed, setFailed] = useState(false);

  // A row can be recycled for a different recipe, so clear the failed flag
  // whenever the URI changes — otherwise a once-broken image stays a placeholder.
  useEffect(() => {
    setFailed(false);
  }, [uri]);

  return (
    <Image
      source={recipeImageSource(failed ? null : uri)}
      style={style}
      accessibilityLabel={accessibilityLabel}
      onError={() => setFailed(true)}
    />
  );
};
