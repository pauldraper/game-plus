export async function loadImplementation(mode = 'practice') {
  if (!['practice', 'example'].includes(mode)) throw new RangeError('Unknown implementation.');
  const prefix = mode === 'example' ? '../example/src/' : './';
  const [rules, game] = await Promise.all([
    import(`${prefix}rules.js`),
    import(`${prefix}game.js`),
  ]);
  return { ...rules, ...game };
}
