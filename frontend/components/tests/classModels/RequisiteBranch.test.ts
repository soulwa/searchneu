import RequisiteBranch from '../../classModels/RequisiteBranch';
import mockData from '../../panels/tests/mockData'

let swdEnglishReqOr : RequisiteBranch;

beforeEach(() => {
  swdEnglishReqOr = new RequisiteBranch(mockData.swdEnglishReqOr);
});

it('constructor tests...', () => {
  expect(swdEnglishReqOr.coreqs).toStrictEqual({ type: 'or', values: [] });
  expect(swdEnglishReqOr.prereqs).toStrictEqual({
    type: 'or',
    values: [
      {
        classId: '1111',
        coreqs: {
          type: 'or',
          values: [],
        },
        host: 'neu.edu',
        isString: false,
        optPrereqsFor: {
          values: [],
        },
        prereqs: {
          type: 'or',
          values: [],
        },
        prereqsFor: {
          values: [],
        },
        sections: [],
        subject: 'ENGW',
        termId: '202110',
      },
      {
        classId: '1102',
        coreqs: {
          type: 'or',
          values: [],
        },
        host: 'neu.edu',
        isString: false,
        optPrereqsFor: {
          values: [],
        },
        prereqs: {
          type: 'or',
          values: [],
        },
        prereqsFor: {
          values: [],
        },
        sections: [],
        subject: 'ENGW',
        termId: '202110',
      },
    ],
  });
});
