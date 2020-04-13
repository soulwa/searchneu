import RequisiteBranch from '../../classModels/RequisiteBranch';
import mockData from '../../panels/tests/mockData'

let swdEnglishReqOr : RequisiteBranch;

beforeEach(() => {
  swdEnglishReqOr = new RequisiteBranch(mockData.swdEnglishReqOr);
});

it('constructor tests...', () => {
  expect(swdEnglishReqOr.coreqs).toStrictEqual({ type: 'or', values: [] });
  //expect(swdEnglishReqOr.prereqs).toBeGreaterThan('oooo');
})
