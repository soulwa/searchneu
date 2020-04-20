import searcher from '../searcher';

beforeAll(async () => {
  searcher.subjects = [];
})

describe('searcher', () => {
  describe('generateMQuery', () => {
    it('generates with no filters', () => {
      expect(searcher.generateMQuery('fundies', '202030', 0, 10, {})).toMatchSnapshot();
    });

    it('generates aggs with online filters applied', () => {
      expect(searcher.generateMQuery('fundies', '202030', 0, 10, { online: true })).toMatchSnapshot();
    });
  });

  // TODO: create an association between cols in elasticCourseSerializer and here
  describe('generateQuery', () => {
    it('generates match_all when no query', () => {
      expect(searcher.generateQuery('', '202030', [], 0, 10).query.bool.must).toEqual({ match_all:{} });
    });

    it('generates a query without filters', () => {
      expect(searcher.generateQuery('fundies', '202030', [], 0, 10, 'nupath')).toMatchSnapshot();
    });
  });

  describe('validateFilters', () => {
    it('removes invalid filters', () => {
      const invalidFilters = {
        NUpath: 'NU Core/NUpath Adv Writ Dscpl',
        college: 'GS Col of Arts',
        subject: 'CS',
        online: false,
        classType: ['Lecture'],
        inValidFilterKey: '',
      };
      expect(searcher.validateFilters(invalidFilters)).toMatchObject({});
    });

    it('keeps all valid filters', () => {
      const validFilters = {
        NUpath: ['NU Core/NUpath Adv Writ Dscpl', 'NUpath Interpreting Culture'],
        college: ['UG Col Socl Sci & Humanities', 'GS Col of Arts', 'Computer&Info Sci'],
        subject: ['ENGW', 'ARTG', 'CS'],
        online: true,
        classType: 'Lecture',
      };
      expect(searcher.validateFilters(validFilters)).toMatchObject(validFilters);
    });
  });

  describe('getClassFilterQuery', () => {
    it('converts filters to es class filters', () => {
      const termId = '202110';
      const filters = {
        NUpath: ['NU Core/NUpath Adv Writ Dscpl', 'NUpath Interpreting Culture'],
        college: ['UG Col Socl Sci & Humanities', 'GS Col of Arts', 'Computer&Info Sci'],
        subject: ['ENGW', 'ARTG', 'CS'],
        online: true,
        classType: 'Lecture',
      };
      const esFilters = searcher.getClassFilterQuery(termId, filters);
      const expectedEsFilters = [{ exists: { field: 'sections' } }, { term: { 'class.termId': '202110' } },
        {
          bool: {
            should: [{ match_phrase: { 'class.classAttributes': 'NU Core/NUpath Adv Writ Dscpl' } },
              { match_phrase: { 'class.classAttributes': 'NUpath Interpreting Culture' } }],
          },
        },
        {
          bool: {
            should: [{ match_phrase: { 'class.classAttributes': 'UG Col Socl Sci & Humanities' } },
              { match_phrase: { 'class.classAttributes': 'GS Col of Arts' } },
              { match_phrase: { 'class.classAttributes': 'Computer&Info Sci' } }],
          },
        },
        { bool: { should: [{ match: { 'class.subject': 'ENGW' } }, { match: { 'class.subject': 'ARTG' } }, { match: { 'class.subject': 'CS' } }] } },
        { term: { 'sections.online': true } }, { match: { 'class.scheduleType': 'Lecture' } }];
      expect(esFilters).toMatchObject({ bool:{ must: expectedEsFilters } });
    });
  });
});
