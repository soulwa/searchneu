import _ from 'lodash';
import axios from 'axios';
import Keys from '../common/Keys';

function getFirstClassResult(results) {
  return results.data[0].class;
}

async function prodSearch(query, termId, min, max, filters = {}) {
  const queryUrl = `http://searchneu.com/search?query=${query}&termId=${termId}&minIndex=${min}&maxIndex=${max}`
  return axios.get(queryUrl);
}

describe('search', () => {
  it('returns specified class with class code query', async () => {
    const firstResult = getFirstClassResult(await prodSearch('cs2500', '202110', 0, 1));
    expect(Keys.getClassHash(firstResult)).toBe('neu.edu/202110/CS/2500');
  });

  it('returns specified class with name query', async () => {
    const firstResult = getFirstClassResult(await prodSearch('fundamentals of computer science 2', '202110', 0, 1));
    expect(Keys.getClassHash(firstResult)).toBe('neu.edu/202110/CS/2510');
  });

  it('returns a professor if name requested', async () => {
    const results = await prodSearch('mislove', '202110', 0, 1);
    const firstResult = results.data[0].employee;
    expect(firstResult.emails).toContain('a.mislove@northeastern.edu');
  });

  it('returns a professor if email requested', async () => {
    const results = await prodSearch('a.mislove@northeastern.edu', '202110', 0, 1);
    const firstResult = results.data[0].employee;
    expect(firstResult.emails).toContain('a.mislove@northeastern.edu');
  });

  it('returns a professor if phone requested', async () => {
    const results = await prodSearch('6173737069', '202110', 0, 1);
    const firstResult = results.data[0].employee;
    expect(firstResult.emails).toContain('a.mislove@northeastern.edu');
  });

  it('does not place labs and recitations as top results', async () => {
    const firstResult = getFirstClassResult(await prodSearch('cs', '202110', 0, 1));
    expect(['Lab', 'Recitation & Discussion', 'Seminar']).not.toContain(firstResult.scheduleType);
  });

  it('aliases class names', async () => {
    const firstResult = getFirstClassResult(await prodSearch('fundies', '202110', 0, 1));
    expect(Keys.getClassHash(firstResult)).toBe('neu.edu/202110/CS/2500');
  });

  [['cs', '2500'], ['cs', '2501'], ['thtr', '1000']].forEach((item) => {
    it(`always analyzes course code  ${item.join(' ')} the same way regardless of string`, async () => {
      const canonicalResult = getFirstClassResult(await prodSearch(item.join(' '), '202110', 0, 1));

      const firstResult = getFirstClassResult(await prodSearch(item.join(''), '202110', 0, 1));
      expect(Keys.getClassHash(firstResult)).toBe(Keys.getClassHash(canonicalResult));

      const secondResult = getFirstClassResult(await prodSearch(item.join(' ').toUpperCase(), '202110', 0, 1));
      expect(Keys.getClassHash(secondResult)).toBe(Keys.getClassHash(canonicalResult));

      const thirdResult = getFirstClassResult(await prodSearch(item.join('').toUpperCase(), '202110', 0, 1));
      expect(Keys.getClassHash(thirdResult)).toBe(Keys.getClassHash(canonicalResult));
    });
  });

  it('returns search results of same subject if course code query', async () => {
    const results = await prodSearch('cs2500', '202110', 0, 10);
    results.data.map((result) => { return expect(result.class.subject).toBe('CS'); });
  });

  it('autocorrects typos', async () => {
    const firstResult = getFirstClassResult(await prodSearch('fundimentals of compiter science', '202110', 0, 1));
    expect(Keys.getClassHash(firstResult)).toBe('neu.edu/202110/CS/2500');
  });

  it('does return default results', async () => {
    const results = await prodSearch('', '202110', 0, 10);
    expect(results.data.length).toBe(10);
  });

  it.only('fetches correct result if query is a crn', async () => {
    const results = await prodSearch('10460', '202110', 0, 1);
    console.log(results.data);
    const firstResult = getFirstClassResult(results);
    expect(Keys.getClassHash(firstResult)).toBe('neu.edu/202110/CS/2500');
  });
});

/*
describe('searcher', () => {
  describe('searches', () => {
    it('returns specified class with class code query', async () => {
      const firstResult = getFirstClassResult(await searcher.search('cs2500', '202110', 0, 1));
      expect(Keys.getClassHash(firstResult)).toBe('neu.edu/202110/CS/2500');
    });

    it('returns specified class with name query', async () => {
      const firstResult = getFirstClassResult(await searcher.search('fundamentals of computer science 2', '202110', 0, 1));
      expect(Keys.getClassHash(firstResult)).toBe('neu.edu/202110/CS/2510');
    });

    it('returns a professor if name requested', async () => {
      const results = await searcher.search('mislove', '202110', 0, 1);
      const firstResult = results.data[0].employee;
      expect(firstResult.emails).toContain('a.mislove@northeastern.edu');
    });

    it('returns a professor if email requested', async () => {
      const results = await searcher.search('a.mislove@northeastern.edu', '202110', 0, 1);
      const firstResult = results.data[0].employee;
      expect(firstResult.emails).toContain('a.mislove@northeastern.edu');
    });

    it('returns a professor if phone requested', async () => {
      const results = await searcher.search('6173737069', '202110', 0, 1);
      const firstResult = results.data[0].employee;
      expect(firstResult.emails).toContain('a.mislove@northeastern.edu');
    });

    it('does not place labs and recitations as top results', async () => {
      const firstResult = getFirstClassResult(await searcher.search('cs', '202110', 0, 1));
      expect(['Lab', 'Recitation & Discussion', 'Seminar']).not.toContain(firstResult.scheduleType);
    });

    it('aliases class names', async () => {
      const firstResult = getFirstClassResult(await searcher.search('fundies', '202110', 0, 1));
      expect(Keys.getClassHash(firstResult)).toBe('neu.edu/202110/CS/2500');
    });

    [['cs', '2500'], ['cs', '2501'], ['thtr', '1000']].forEach((item) => {
      it(`always analyzes course code  ${item.join(' ')} the same way regardless of string`, async () => {
        const canonicalResult = getFirstClassResult(await searcher.search(item.join(' '), '202110', 0, 1));

        const firstResult = getFirstClassResult(await searcher.search(item.join(''), '202110', 0, 1));
        expect(Keys.getClassHash(firstResult)).toBe(Keys.getClassHash(canonicalResult));

        const secondResult = getFirstClassResult(await searcher.search(item.join(' ').toUpperCase(), '202110', 0, 1));
        expect(Keys.getClassHash(secondResult)).toBe(Keys.getClassHash(canonicalResult));

        const thirdResult = getFirstClassResult(await searcher.search(item.join('').toUpperCase(), '202110', 0, 1));
        expect(Keys.getClassHash(thirdResult)).toBe(Keys.getClassHash(canonicalResult));
      });
    });

    it('returns search results of same subject if course code query', async () => {
      const results = await searcher.search('cs2500', '202110', 0, 10);
      results.data.map((result) => { return expect(result.class.subject).toBe('CS'); });
    });

    it('autocorrects typos', async () => {
      const firstResult = getFirstClassResult(await searcher.search('fundimentals of compiter science', '202110', 0, 1));
      expect(Keys.getClassHash(firstResult)).toBe('neu.edu/202110/CS/2500');
    });

    it('qoes not return default results', async () => {
      const results = await searcher.search('', '202110', 0, 10);
      expect(results.data.length).toBe(0);
    });

    it('fetches correct result if query is a crn', async () => {
      const firstResult = getFirstClassResult(await searcher.search('10460', '202110', 0, 1));
      expect(Keys.getClassHash(firstResult)).toBe('neu.edu/202110/CS/2500');
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

  describe('filter results', () => {
    it('filter by one NUpath', async () => {
      const NUpath = 'NUpath Writing Intensive';
      const allResults = (await searcher.search('2500', '202110', 0, 20, { NUpath: [NUpath] })).data;
      expect(allResults.length > 0).toBe(true);
      allResults.forEach((result) => expect(result.class.classAttributes).toContain(NUpath));
    });

    it('filter by multiple NUpaths', async () => {
      const NUpaths = ['NUpath Difference/Diversity', 'NUpath Interpreting Culture'];
      const allResults = (await searcher.search('2500', '202110', 0, 20, { college: NUpaths })).data;
      expect(allResults.length > 0).toBe(true);
      allResults.forEach((result) => expect(_.intersection(result.class.classAttributes, NUpaths).length > 0).toBe(true));
    });

    it('filter by one college', async () => {
      const college = 'Computer&Info Sci';
      const allResults = (await searcher.search('2500', '202110', 0, 20, { college: [college] })).data;
      expect(allResults.length > 0).toBe(true);
      allResults.forEach((result) => expect(result.class.classAttributes).toContain(college));
    });

    it('filter by multiple colleges', async () => {
      const colleges = ['GS College of Science', 'GSBV Bouve'];
      const allResults = (await searcher.search('2500', '202110', 0, 20, { college: colleges })).data;
      expect(allResults.length > 0).toBe(true);
      allResults.forEach((result) => expect(_.intersection(result.class.classAttributes, colleges).length > 0).toBe(true));
    });

    it('filter by one subject', async () => {
      const subject = 'CS';
      const allResults = (await searcher.search('2500', '202110', 0, 20, { subject: [subject] })).data;
      expect(allResults.length > 0).toBe(true);
      allResults.forEach((result) => expect(result.class.subject).toBe(subject));
    });

    it('filter by multiple subjects', async () => {
      const subjects = ['CS', 'ENGL'];
      const allResults = (await searcher.search('2500', '202060', 0, 20, { subject: subjects })).data;
      expect(allResults.length > 0).toBe(true);
      allResults.forEach((result) => expect(subjects).toContain(result.class.subject));
    });

    it('filter for online: if any section is online', async () => {
      const onlineFilter = { online: true };
      const allResults = (await searcher.search('2500', '202110', 0, 20, onlineFilter)).data;
      expect(allResults.length > 0).toBe(true);
      allResults.forEach((result) => expect(result.sections.map((section) => section.online)).toContain(true));
    });

    it('filter for online: online option not selected', async () => {
      const onlineFilter = { online: false };
      const allResults = (await searcher.search('2500', '202110', 0, 20, onlineFilter)).data;
      expect(allResults.length > 0).toBe(true);
    });

    it('filter for class type of seminar', async () => {
      const classTypeFilter = { classType: 'Seminar' };
      const allResults = (await searcher.search('2500', '202110', 0, 20, classTypeFilter)).data;
      expect(allResults.length > 0).toBe(true);
      allResults.forEach((result) => expect(result.class.scheduleType).toBe(classTypeFilter.classType));
    });

    it('filter for class type of lab', async () => {
      const classTypeFilter = { classType: 'Lab' };
      const allResults = (await searcher.search('2500', '202110', 0, 20, classTypeFilter)).data;
      expect(allResults.length > 0).toBe(true);
      allResults.forEach((result) => expect(result.class.scheduleType).toBe(classTypeFilter.classType));
    });

    it('filter for one NUpath, college, subject, online, classType', async () => {
      const filters = {
        NUpath: ['NU Core/NUpath Adv Writ Dscpl'],
        college: ['UG Col Socl Sci & Humanities'],
        subject: ['ENGW'],
        online: true,
        classType: 'Lecture',
      };
      const allResults = (await searcher.search('writing', '202110', 0, 5, filters)).data;
      expect(allResults.length > 0).toBe(true);
      allResults.forEach((result) => expect(result.class.classAttributes).toContain(filters.NUpath[0]));
      allResults.forEach((result) => expect(result.class.classAttributes).toContain(filters.college[0]));
      allResults.forEach((result) => expect(result.class.subject).toBe(filters.subject[0]));
      allResults.forEach((result) => expect(result.sections.map((section) => section.online)).toContain(true));
      allResults.forEach((result) => expect(result.class.scheduleType).toBe(filters.classType));
    });

    it('filter for multiple NUpath, college, subject, online, classType', async () => {
      const filters = {
        NUpath: ['NU Core/NUpath Adv Writ Dscpl', 'NUpath Interpreting Culture'],
        college: ['UG Col Socl Sci & Humanities', 'GS Col of Arts', 'Computer&Info Sci'],
        subject: ['ENGW', 'ARTG', 'CS'],
        online: true,
        classType: 'Lecture',
      };
      const allResults = (await searcher.search('science', '202110', 0, 2, filters)).data;
      expect(allResults.length > 0).toBe(true);
      allResults.forEach((result) => expect(_.intersection(result.class.classAttributes, filters.NUpath).length > 0).toBe(true));
      allResults.forEach((result) => expect(_.intersection(result.class.classAttributes, filters.college).length > 0).toBe(true));
      allResults.forEach((result) => expect(filters.subject).toContain(result.class.subject));
      allResults.forEach((result) => expect(result.sections.map((section) => section.online)).toContain(true));
      allResults.forEach((result) => expect(result.class.scheduleType).toBe(filters.classType));
    });
  });

  describe('filter aggregations', () => {
    it('gives no aggregations', async () => {
      expect((await searcher.search('fundies', '202110', 0, 10, {})).aggregations).toEqual({});
    });

    it('gives an aggregation for a single filter', async () => {
      const filters = { online: true };
      expect((await searcher.search('writing', '202110', 0, 10, filters)).aggregations).toEqual({
        online: {
          value: true,
          // this should be the count for all possible results you see
          count: 100,
        },
      });
    });

    it('gives multiple aggregations for a single filter with multiple options', async () => {
      const filters = { nupath: ['NU Core/NUpath Adv Writ Dscpl', 'NUpath Interpreting Culture'] };
      expect((await searcher.search('science', '202110', 0, 10, filters)).aggregations).toEqual({
        // these guys should be OR'd. When getting their aggregation, ignore the selection of other filters of their kind.
        nupath: [
          {
            value: 'NU Core/NUpath Adv Writ Dscpl',
            count: 30,
          },
          {
            value: 'NUpath Interpreting Culture',
            count: 50,
          },
        ],
      });
    });

    it('gives an AND count for aggregations of multiple filters', async () => {
      const filters = {
        sectionsAvailable: true,
        online: true,
      };

      expect((await searcher.search('science', '202110', 0, 10, filters))).toEqual({
        // these guys should be ANDed together
        sectionsAvailable: {
          value: true,
          count: 50,
        },
        online: {
          value: true,
          count: 30,
        },
      });
    });

    it('gives an OR count for aggregations with multiple filters of the same kind', async () => {
      const filters = {
        sectionsAvailable: true,
        classType: ['Lab', 'Lecture'],
      };

      expect((await searcher.search('science', '202110', 0, 10, filters))).toEqual({
        // these guys should be ANDed together
        sectionsAvailable: {
          value: true,
          count: 50,
        },
        classType: [
          {
            value: 'Lab',
            count: 100,
          },
          {
            value: 'Lecture',
            count: 30,
          },
        ],
      });
    });
  });
});
*/
