import { act } from 'react-test-renderer';
import { TextInput } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import {
  byRole,
  renderComponent,
  textContent,
  type RenderResult,
} from '@presentation/base/test-support/render-component';
import { CollapsingHomeHeader } from '@presentation/screens/recipes/collapsing-home-header';
import { t } from '@presentation/i18n';

jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  const Icon = (props: { name: string }): React.JSX.Element => <Text>{`icon:${props.name}`}</Text>;
  return { Ionicons: Icon, MaterialCommunityIcons: Icon };
});

interface HeaderOverrides {
  unreadCount?: number;
  searchValue?: string;
  reduceMotion?: boolean;
}

const renderHeader = (
  overrides: HeaderOverrides = {},
): {
  root: RenderResult['root'];
  onNotificationsPress: jest.Mock;
  onSearchChange: jest.Mock;
} => {
  const onNotificationsPress = jest.fn();
  const onSearchChange = jest.fn();

  const Probe = (): React.JSX.Element => {
    const scrollY = useSharedValue(0);
    const headerTranslateY = useSharedValue(0);
    return (
      <CollapsingHomeHeader
        scrollY={scrollY}
        headerTranslateY={headerTranslateY}
        reduceMotion={overrides.reduceMotion ?? true}
        onNotificationsPress={onNotificationsPress}
        unreadCount={overrides.unreadCount ?? 0}
        searchValue={overrides.searchValue ?? ''}
        onSearchChange={onSearchChange}
      />
    );
  };

  const { root } = renderComponent(<Probe />);
  return { root, onNotificationsPress, onSearchChange };
};

describe('CollapsingHomeHeader', () => {
  it('renders the screen title from the recipes i18n namespace', () => {
    const { root } = renderHeader();

    expect(textContent(root)).toContain(t().recipes.title);
  });

  it('renders the "Recipely" eyebrow', () => {
    const { root } = renderHeader();

    expect(textContent(root)).toContain('Recipely');
  });

  it('renders a SearchBar wired to the search value and change handler', () => {
    const { root, onSearchChange } = renderHeader({ searchValue: 'pasta' });

    const input = root.findByType(TextInput);
    expect(input.props.value).toBe('pasta');
    expect(input.props.placeholder).toBe(t().recipes.searchPlaceholder);

    act(() => (input.props.onChangeText as (text: string) => void)('soup'));
    expect(onSearchChange).toHaveBeenCalledWith('soup');
  });

  it('fires onNotificationsPress when the bell is tapped', () => {
    const { root, onNotificationsPress } = renderHeader();

    act(() => (byRole(root, 'button').props.onPress as () => void)());

    expect(onNotificationsPress).toHaveBeenCalledTimes(1);
  });

  it('uses the outline bell icon and a plain label when there are no unread items', () => {
    const { root } = renderHeader({ unreadCount: 0 });

    expect(textContent(root)).toContain('icon:notifications-outline');
    expect(byRole(root, 'button').props.accessibilityLabel).toBe(t().notifications.title);
  });

  it('shows the unread badge count and the filled bell when unread > 0', () => {
    const { root } = renderHeader({ unreadCount: 4 });

    const texts = textContent(root);
    expect(texts).toContain('icon:notifications');
    expect(texts).toContain('4');
  });

  it('folds the unread count into the bell accessibility label', () => {
    const { root } = renderHeader({ unreadCount: 4 });

    expect(byRole(root, 'button').props.accessibilityLabel).toBe(`${t().notifications.title}, 4`);
  });

  it('caps the unread badge at "9+" while keeping the true count in the label', () => {
    const { root } = renderHeader({ unreadCount: 15 });

    const texts = textContent(root);
    expect(texts).toContain('9+');
    expect(texts).not.toContain('15');
    expect(byRole(root, 'button').props.accessibilityLabel).toBe(`${t().notifications.title}, 15`);
  });
});
