/**
 * Regression: the step text must ALWAYS be visible.
 *
 * The card used to feed `<Text>` element children (one `Fragment` per parsed
 * part) instead of a string. Native text layout can drop non-string children on
 * a re-measure — mid-scroll the step then rendered as blank space at full card
 * height. The text is now passed as one plain string, and these tests lock that
 * in: `parts` may only drive the timer chips below the text, never the text
 * node's children.
 */

import type { ReactTestInstance } from 'react-test-renderer';
import { renderComponent, textContent } from '@presentation/base/test-support/render-component';
import { InstructionCard } from '@presentation/app/recipes/[recipeId]/items/instruction-card';

jest.mock('@presentation/app/recipes/[recipeId]/items/inline-timer', () => ({
  InlineTimer: (): null => null,
}));

const STEP_WITH_TIMER = 'Bake at 170°C for 10 minutes, then rest.';
const PLAIN_STEP = 'Chop the onions finely.';

const renderCard = (step: string): ReactTestInstance =>
  renderComponent(
    <InstructionCard
      index={0}
      step={step}
      completed={false}
      onToggle={jest.fn()}
      recipeId="recipe-1"
      recipeName="Test recipe"
    />,
  ).root;

const stepTextNodes = (root: ReactTestInstance): ReactTestInstance[] =>
  root.findAllByType('Text').filter((node) => typeof node.props.children === 'string');

describe('InstructionCard step text', () => {
  it('renders a step containing a duration as one plain string, in full', () => {
    const root = renderCard(STEP_WITH_TIMER);

    expect(textContent(root)).toContain(STEP_WITH_TIMER);
    expect(stepTextNodes(root).map((node) => node.props.children)).toContain(STEP_WITH_TIMER);
  });

  it('renders a step without a duration in full', () => {
    const root = renderCard(PLAIN_STEP);

    expect(textContent(root)).toContain(PLAIN_STEP);
  });

  it('keeps the text visible when the step is completed', () => {
    const root = renderCard(PLAIN_STEP);
    const completed = renderCard(PLAIN_STEP);

    expect(textContent(root)).toContain(PLAIN_STEP);
    expect(textContent(completed)).toContain(PLAIN_STEP);
  });
});
