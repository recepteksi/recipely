/**
 * `SignInPromptSheet` is the CTA shown when a guest attempts a gated
 * interaction. Covers: generic vs. per-action message, title, and that
 * `onSignIn` fires on the primary button press.
 */

import { act } from 'react-test-renderer';
import { byRole, renderComponent, textContent } from '@presentation/base/test-support/render-component';
import { SignInPromptSheet } from '@presentation/base/widgets/sign-in-prompt-sheet';
import { t } from '@presentation/i18n';

describe('SignInPromptSheet', () => {
  it('renders the generic title and message when no per-action message is given', () => {
    const { root } = renderComponent(
      <SignInPromptSheet visible onClose={jest.fn()} onSignIn={jest.fn()} />,
    );

    const texts = textContent(root);
    expect(texts).toContain(t().signInPrompt.title);
    expect(texts).toContain(t().signInPrompt.message);
  });

  it('renders a per-action message instead of the generic one', () => {
    const { root } = renderComponent(
      <SignInPromptSheet
        visible
        onClose={jest.fn()}
        onSignIn={jest.fn()}
        message="Sign in to like this recipe."
      />,
    );

    const texts = textContent(root);
    expect(texts).toContain('Sign in to like this recipe.');
    expect(texts).not.toContain(t().signInPrompt.message);
  });

  it('fires onSignIn when the primary button is pressed', () => {
    const onSignIn = jest.fn();
    const { root } = renderComponent(
      <SignInPromptSheet visible onClose={jest.fn()} onSignIn={onSignIn} />,
    );

    act(() => (byRole(root, 'button').props.onPress as () => void)());

    expect(onSignIn).toHaveBeenCalledTimes(1);
  });

  it('renders nothing interactable when not visible (Modal not shown)', () => {
    const onSignIn = jest.fn();
    expect(() =>
      renderComponent(<SignInPromptSheet visible={false} onClose={jest.fn()} onSignIn={onSignIn} />),
    ).not.toThrow();
  });
});
