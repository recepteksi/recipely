/**
 * Behavior tests for the shared `BottomSheet`. Covers the two beta-reported
 * bugs: the grabber is now a real (if not fully simulate-able, see
 * `use-drag-to-dismiss.test.tsx`) dismiss control, and the redundant "×"
 * close button is hidden unless a consumer opts in via `showCloseButton`.
 */

import { act } from 'react-test-renderer';
import { renderComponent, textContent } from '@presentation/base/test-support/render-component';
import type { RenderResult } from '@presentation/base/test-support/render-result';
import { ThemedText } from '@presentation/base/widgets/text/themed-text';
import { BottomSheet } from '@presentation/base/widgets/sheets/bottom-sheet';
import { t } from '@presentation/i18n';

/**
 * The explicit header "×" and the grabber both use role `button` + the same
 * "Close" label (the grabber is dismissible by plain tap too, not just
 * drag/VoiceOver) — `onPress` is what actually distinguishes them: the header
 * button is a real `Pressable` with `onPress`, while the grabber only wires
 * `onAccessibilityTap` (see `bottom-sheet.tsx`).
 */
const explicitCloseButton = (root: RenderResult['root']) =>
  root.findAll(
    (node) =>
      node.props.accessibilityRole === 'button' &&
      node.props.accessibilityLabel === t().common.close &&
      typeof node.props.onPress === 'function',
  )[0];

/** The node exposing `onAccessibilityTap` — the draggable grabber. */
const grabber = (root: RenderResult['root']) =>
  root.findAll((node) => typeof node.props.onAccessibilityTap === 'function')[0];

describe('BottomSheet', () => {
  it('hides the header close button by default, leaving the grabber as the only dismiss affordance beyond the backdrop', () => {
    const { root } = renderComponent(
      <BottomSheet visible title="Title" onClose={jest.fn()}>
        <ThemedText variant="body">content</ThemedText>
      </BottomSheet>,
    );

    expect(explicitCloseButton(root)).toBeUndefined();
    expect(grabber(root)).toBeDefined();
  });

  it('shows the explicit close button when showCloseButton is set, and it calls onClose', () => {
    const onClose = jest.fn();
    const { root } = renderComponent(
      <BottomSheet visible title="Title" onClose={onClose} showCloseButton>
        <ThemedText variant="body">content</ThemedText>
      </BottomSheet>,
    );

    const closeButton = explicitCloseButton(root);
    expect(closeButton).toBeDefined();
    act(() => (closeButton.props.onPress as () => void)());

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('dismisses via the grabber accessibility tap (VoiceOver double-tap equivalent)', () => {
    const onClose = jest.fn();
    const { root } = renderComponent(
      <BottomSheet visible title="Title" onClose={onClose}>
        <ThemedText variant="body">content</ThemedText>
      </BottomSheet>,
    );

    act(() => (grabber(root).props.onAccessibilityTap as () => void)());

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('still dismisses on a backdrop tap', () => {
    const onClose = jest.fn();
    const { root } = renderComponent(
      <BottomSheet visible title="Title" onClose={onClose}>
        <ThemedText variant="body">content</ThemedText>
      </BottomSheet>,
    );

    // The backdrop `Pressable` is wired directly to the `onClose` prop
    // (no intermediate handler), so it's the node whose `onPress` is that
    // exact function reference.
    const backdrop = root.findAll((node) => node.props.onPress === onClose)[0];
    act(() => (backdrop.props.onPress as () => void)());

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders a rightAction independent from onClose', () => {
    const onClose = jest.fn();
    const onPressRight = jest.fn();
    const { root } = renderComponent(
      <BottomSheet
        visible
        title="Title"
        onClose={onClose}
        rightAction={{ label: 'Clear', onPress: onPressRight }}
      >
        <ThemedText variant="body">content</ThemedText>
      </BottomSheet>,
    );

    expect(textContent(root)).toContain('Clear');
    const rightButton = root.findAll(
      (node) => node.props.accessibilityRole === 'button' && node.props.accessibilityLabel === 'Clear',
    )[0];
    act(() => (rightButton.props.onPress as () => void)());

    expect(onPressRight).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });
});
