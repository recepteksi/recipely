import { act } from 'react-test-renderer';
import { useSharedValue } from 'react-native-reanimated';
import {
  byRole,
  renderComponent,
  textContent,
  type RenderResult,
} from '@presentation/base/test-support/render-component';
import { FilterSortFab } from '@presentation/screens/recipes/filter-sort-fab';
import { t } from '@presentation/i18n';

jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  const Icon = (props: { name: string }): React.JSX.Element => <Text>{`icon:${props.name}`}</Text>;
  return { Ionicons: Icon, MaterialCommunityIcons: Icon };
});

interface FabCase {
  activeCount: number;
  reduceMotion?: boolean;
}

const renderFab = (props: FabCase): { onPress: jest.Mock; root: RenderResult['root'] } => {
  const onPress = jest.fn();

  const Probe = (): React.JSX.Element => {
    const scrollY = useSharedValue(0);
    return (
      <FilterSortFab
        scrollY={scrollY}
        reduceMotion={props.reduceMotion ?? true}
        activeCount={props.activeCount}
        onPress={onPress}
      />
    );
  };

  const { root } = renderComponent(<Probe />);
  return { onPress, root };
};

describe('FilterSortFab', () => {
  it('renders the "Filter & Sort" label from the i18n key', () => {
    const { root } = renderFab({ activeCount: 0 });

    expect(textContent(root)).toContain(t().recipes.filtersAndSort);
  });

  it('exposes a button role with an accessibility label', () => {
    const { root } = renderFab({ activeCount: 0 });

    const btn = byRole(root, 'button');

    expect(btn.props.accessibilityRole).toBe('button');
    expect(btn.props.accessibilityLabel).toBe(t().recipes.filtersAndSort);
  });

  it('fires onPress when the FAB is pressed', () => {
    const { root, onPress } = renderFab({ activeCount: 0 });

    act(() => (byRole(root, 'button').props.onPress as () => void)());

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('hides the count badge when there are no active filters', () => {
    const { root } = renderFab({ activeCount: 0 });

    const texts = textContent(root);
    expect(texts).toContain(t().recipes.filtersAndSort);
    expect(texts.some((text) => /^\d/.test(text))).toBe(false);
  });

  it('shows the active count in the badge when filters are applied', () => {
    const { root } = renderFab({ activeCount: 3 });

    expect(textContent(root)).toContain('3');
  });

  it('folds the count into the accessibility label when filters are applied', () => {
    const { root } = renderFab({ activeCount: 3 });

    expect(byRole(root, 'button').props.accessibilityLabel).toBe(`${t().recipes.filtersAndSort}, 3`);
  });

  it('caps the badge text at "9+" for large counts', () => {
    const { root } = renderFab({ activeCount: 12 });

    const texts = textContent(root);
    expect(texts).toContain('9+');
    expect(texts).not.toContain('12');
  });

  it('keeps the real count (not the capped badge) in the accessibility label', () => {
    const { root } = renderFab({ activeCount: 12 });

    expect(byRole(root, 'button').props.accessibilityLabel).toBe(`${t().recipes.filtersAndSort}, 12`);
  });
});
