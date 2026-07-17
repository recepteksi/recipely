import type { ParsedIngredient } from '@presentation/app/recipes/[recipeId]/model/parsed-ingredient';

const FRACTION_RE = /[¼½¾⅓⅔⅛⅜⅝⅞]/;
const QTY_HEAD_RE = /^\s*(\d+(?:[.,]\d+)?(?:\/\d+)?|[¼½¾⅓⅔⅛⅜⅝⅞])(?:\s*-\s*\d+(?:[.,]\d+)?)?(?:\s*(?:[a-zA-ZçğıöşüÇĞİÖŞÜ]{1,6}\.?))?/;

/** Splits a raw ingredient line into a leading quantity chunk and its name. */
export const parseIngredient = (raw: string): ParsedIngredient => {
  const trimmed = raw.trim();
  if (trimmed.length === 0) return { qty: '', name: '' };

  const match = trimmed.match(QTY_HEAD_RE);
  if (!match) return { qty: '', name: trimmed };

  const qtyChunk = match[0].trim();
  const rest = trimmed.slice(match[0].length).trim();
  if (rest.length === 0) return { qty: '', name: trimmed };

  if (!/\d/.test(qtyChunk) && !FRACTION_RE.test(qtyChunk)) {
    return { qty: '', name: trimmed };
  }

  return { qty: qtyChunk, name: rest };
};
