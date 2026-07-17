import type { TextPart } from '@presentation/base/widgets/text/text-part';

const DURATION_UNIT = 'minutes?|mins?|dakika|dk';
// Alternation, tried in order at every match position: a "45-50 minutes"
// range is matched whole by the first branch (captured in group 1) before the
// second branch gets a chance to latch onto just the trailing number — that
// ordering is what previously produced the "45-" + badge("50 min") split.
const TIME_RE = new RegExp(
  `(\\d+(?:\\.\\d+)?\\s*-\\s*\\d+(?:\\.\\d+)?\\s*(?:${DURATION_UNIT}))|(\\d+(?:\\.\\d+)?)\\s*(?:${DURATION_UNIT})`,
  'gi',
);

/** Splits an instruction step into plain-text and inline-timer parts. */
export const splitStepWithTimers = (text: string): TextPart[] => {
  const out: TextPart[] = [];
  let last = 0;
  TIME_RE.lastIndex = 0;
  let match: RegExpExecArray | null = TIME_RE.exec(text);
  while (match !== null) {
    if (match.index > last) {
      out.push({ kind: 'text', value: text.slice(last, match.index) });
    }
    if (match[1] !== undefined) {
      // A range ("45-50 minutes") isn't a single actionable duration — keep
      // it as plain text rather than badge-ify a partial, misleading match.
      out.push({ kind: 'text', value: match[0] });
    } else {
      const minutes = parseFloat(match[2]);
      out.push({ kind: 'timer', value: match[0], minutes });
    }
    last = match.index + match[0].length;
    match = TIME_RE.exec(text);
  }
  if (last < text.length) {
    out.push({ kind: 'text', value: text.slice(last) });
  }
  if (out.length === 0) {
    out.push({ kind: 'text', value: text });
  }
  return out;
};
