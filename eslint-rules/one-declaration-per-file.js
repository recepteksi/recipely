'use strict';

/**
 * Enforces the repo coding standard "one declaration per file" (CLAUDE.md
 * §Mandatory coding standards #1): at most one top-level class, interface,
 * type alias, or enum per .ts/.tsx file.
 *
 * Exceptions, mirroring the written standard:
 * - `index.ts` / `index.tsx` barrel files are skipped entirely;
 * - interfaces / type aliases ending in `Props` are not counted, so a
 *   component's Props interface may live next to the component;
 * - test files are excluded via the eslint config (files/rules mapping),
 *   not here.
 */
const COUNTED_DECLARATIONS = new Set([
  'ClassDeclaration',
  'TSInterfaceDeclaration',
  'TSTypeAliasDeclaration',
  'TSEnumDeclaration',
]);

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce at most one top-level class / interface / type alias / enum per file',
    },
    schema: [],
    messages: {
      multipleDeclarations:
        '"{{name}}" must live in its own file: {{count}} top-level declarations found, the repo standard is one per file (index.ts barrels and *Props next to their component are exempt).',
    },
  },
  create(context) {
    const filename = context.filename ?? context.getFilename();
    const basename = filename.split('/').pop() ?? '';
    if (/^index\.(ts|tsx)$/.test(basename)) {
      return {};
    }
    return {
      Program(program) {
        const declarations = [];
        for (const statement of program.body) {
          const node =
            statement.type === 'ExportNamedDeclaration' ||
            statement.type === 'ExportDefaultDeclaration'
              ? statement.declaration
              : statement;
          if (!node || !COUNTED_DECLARATIONS.has(node.type)) {
            continue;
          }
          const name = node.id ? node.id.name : '(anonymous)';
          if (name.endsWith('Props')) {
            continue;
          }
          declarations.push({ node, name });
        }
        if (declarations.length < 2) {
          return;
        }
        for (const { node, name } of declarations.slice(1)) {
          context.report({
            node: node.id ?? node,
            messageId: 'multipleDeclarations',
            data: { name, count: String(declarations.length) },
          });
        }
      },
    };
  },
};
