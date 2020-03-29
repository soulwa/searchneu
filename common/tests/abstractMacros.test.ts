/*
 * This file is part of Search NEU and licensed under AGPL3.
 * See the license file in the root folder for details.
 */

import macros from '../abstractMacros';

it('isNumeric should work', () => {
  expect(macros.isNumeric('fjdaslkfjlas')).toBe(false);
  expect(macros.isNumeric('3')).toBe(true);
  expect(macros.isNumeric(NaN)).toBe(false);
});
