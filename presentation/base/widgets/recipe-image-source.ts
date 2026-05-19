import type { ImageSourcePropType } from 'react-native';

const placeholderImage: ImageSourcePropType = require('../../../assets/images/recipe-placeholder.png');

/**
 * Returns the `<Image source>` for a recipe / media URI. Falls back to the
 * bundled brand placeholder when the URI is missing or whitespace, so cards
 * and galleries never render a blank box for recipes without media.
 */
export const recipeImageSource = (
  uri: string | undefined | null,
): ImageSourcePropType => {
  if (uri && uri.trim().length > 0) {
    return { uri };
  }
  return placeholderImage;
};
