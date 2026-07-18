/**
 * Behavior tests for the shared `SuccessSheet`. Covers the content rendering,
 * the primary/secondary action wiring, and the optional secondary action being
 * omitted entirely when not provided.
 */

import { act } from 'react-test-renderer';
import {
  renderComponent,
  textContent,
} from '@presentation/base/test-support/render-component';
import type { RenderResult } from '@presentation/base/test-support/render-result';
import { SuccessSheet } from '@presentation/base/widgets/sheets/success-sheet';

const PRIMARY_LABEL = 'View recipe';
const SECONDARY_LABEL = 'Done';

const buttonByLabel = (root: RenderResult['root'], label: string) =>
  root.findAll(
    (node) =>
      node.props.accessibilityRole === 'button' &&
      node.props.accessibilityLabel === label &&
      typeof node.props.onPress === 'function',
  )[0];

const renderSheet = (overrides: Partial<React.ComponentProps<typeof SuccessSheet>> = {}) =>
  renderComponent(
    <SuccessSheet
      visible
      title="Recipe saved"
      message="Your recipe is now published."
      primaryLabel={PRIMARY_LABEL}
      onPrimary={jest.fn()}
      onClose={jest.fn()}
      {...overrides}
    />,
  );

describe('SuccessSheet', () => {
  it('renders the title, message, and primary label when visible', () => {
    const { root } = renderSheet();

    const text = textContent(root);
    expect(text).toContain('Recipe saved');
    expect(text).toContain('Your recipe is now published.');
    expect(text).toContain(PRIMARY_LABEL);
  });

  it('calls onPrimary when the primary action is pressed', () => {
    const onPrimary = jest.fn();
    const { root } = renderSheet({ onPrimary });

    act(() => (buttonByLabel(root, PRIMARY_LABEL).props.onPress as () => void)());

    expect(onPrimary).toHaveBeenCalledTimes(1);
  });

  it('calls onSecondary when the secondary action is pressed', () => {
    const onSecondary = jest.fn();
    const { root } = renderSheet({
      secondaryLabel: SECONDARY_LABEL,
      onSecondary,
    });

    act(() => (buttonByLabel(root, SECONDARY_LABEL).props.onPress as () => void)());

    expect(onSecondary).toHaveBeenCalledTimes(1);
  });

  it('omits the secondary action when no label is provided', () => {
    const { root } = renderSheet();

    expect(buttonByLabel(root, SECONDARY_LABEL)).toBeUndefined();
  });
});
