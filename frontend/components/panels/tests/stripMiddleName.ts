import stripMiddleName from '../stripMiddleName';

it('stripMiddleName should work', () => {
  expect(stripMiddleName('Benjamin D Lerner')).toEqual('Benjamin Lerner');
  expect(stripMiddleName('Benjamin Djdkasjfldskj Lerner')).toEqual('Benjamin Lerner');
  expect(stripMiddleName('Benjamin #$%^&*() Lerner')).toEqual('Benjamin Lerner');
  expect(stripMiddleName('Benjamin Lerner')).toEqual('Benjamin Lerner');
  expect(stripMiddleName('Benjamin    Lerner')).toEqual('Benjamin Lerner');
  expect(stripMiddleName('Lerner')).toEqual('Lerner');

  expect(stripMiddleName('Benjamin D. Lerner', true)).toEqual('Benjamin Lerner');
  expect(stripMiddleName('Benjamin den Lerner', true)).toEqual('Benjamin den Lerner');


  expect(stripMiddleName('Benjamin den Lerner', true, 'JDFLSKJ', 'jfldsajfl')).toEqual('Benjamin den Lerner');


  expect(stripMiddleName('Benjamin (den) Lerner', true, 'Benjamin', 'Lerner')).toEqual('Benjamin (den) Lerner');

  // Should be kept (for now) because all the characters between last and first name are more than one letter.
  expect(stripMiddleName('Edwin A. Marengo Fuentes', true)).toEqual('Edwin Marengo Fuentes');
});
