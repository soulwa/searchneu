import _ from 'lodash';
import axios from 'axios';
import URI from 'urijs';
import Keys from '../common/Keys';

function elemContainsSubstrs(array, strs) {
  return strs.some((str) => array.some((elem) => elem.indexOf(str) > -1));
}

function getFirstClassResult(results) {
  return results.data.results[0].class;
}

async function prodSearch(query, termId, min, max, filters = {}) {
  const queryUrl = new URI('http://searchneu.com/search').query({
    query,
    termId,
    filters: JSON.stringify(filters),
    minIndex: min,
    maxIndex: max,
    apiVersion: 2,
  }).toString();

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
    const firstResult = results.data.results[0].employee;
    expect(firstResult.emails).toContain('a.mislove@northeastern.edu');
  });

  it('returns a professor if email requested', async () => {
    const results = await prodSearch('a.mislove@northeastern.edu', '202110', 0, 1);
    const firstResult = results.data.results[0].employee;
    expect(firstResult.emails).toContain('a.mislove@northeastern.edu');
  });

  it('returns a professor if phone requested', async () => {
    const results = await prodSearch('6173737069', '202110', 0, 1);
    const firstResult = results.data.results[0].employee;
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
    results.data.results.map((result) => { return expect(result.class.subject).toBe('CS'); });
  });

  it('autocorrects typos', async () => {
    const firstResult = getFirstClassResult(await prodSearch('fundimentals of compiter science', '202110', 0, 1));
    expect(Keys.getClassHash(firstResult)).toBe('neu.edu/202110/CS/2500');
  });

  it('does return default results', async () => {
    const results = await prodSearch('', '202110', 0, 10);
    expect(results.data.results.length).toBe(10);
  });

  it('fetches correct result if query is a crn', async () => {
    const results = await prodSearch('10460', '202110', 0, 1);
    const firstResult = getFirstClassResult(results);
    expect(Keys.getClassHash(firstResult)).toBe('neu.edu/202110/CS/2500');
  });

  describe('filter queries', () => {
    it('filters by one NUpath', async () => {
      const nupath = 'Writing Intensive';
      const allResults = (await prodSearch('2500', '202110', 0, 20, { nupath: [nupath] })).data.results;
      expect(allResults.length > 0).toBe(true);
      allResults.forEach((result) => expect(elemContainsSubstrs(result.class.classAttributes, [nupath])).toBeTruthy());
    });

    it('filter by multiple NUpaths', async () => {
      const nupaths = ['Difference/Diversity', 'Interpreting Culture'];
      const allResults = (await prodSearch('2500', '202110', 0, 20, { nupath: nupaths })).data.results;
      expect(allResults.length > 0).toBe(true);
      allResults.forEach((result) => expect(elemContainsSubstrs(result.class.classAttributes, nupaths)).toBeTruthy());
    });

    it('filter by one subject', async () => {
      const subject = 'CS';
      const allResults = (await prodSearch('2500', '202110', 0, 20, { subject: [subject] })).data.results;
      expect(allResults.length > 0).toBe(true);
      allResults.forEach((result) => expect(result.class.subject).toBe(subject));
    });

    it('filter by multiple subjects', async () => {
      const subjects = ['CS', 'ENGL'];
      const allResults = (await prodSearch('2500', '202110', 0, 20, { subject: subjects })).data.results;
      expect(allResults.length > 0).toBe(true);
      allResults.forEach((result) => expect(subjects).toContain(result.class.subject));
    });

    it('filter by multiple subjects', async () => {
      const subjects = ['CS', 'ENGL'];
      const allResults = (await prodSearch('2500', '202060', 0, 20, { subject: subjects })).data.results;
      expect(allResults.length > 0).toBe(true);
      allResults.forEach((result) => expect(subjects).toContain(result.class.subject));
    });

    it('filter for online: if any section is online', async () => {
      const onlineFilter = { online: true };
      const allResults = (await prodSearch('2500', '202110', 0, 20, onlineFilter)).data.results;
      expect(allResults.length > 0).toBe(true);
      allResults.forEach((result) => expect(result.sections.map((section) => section.online)).toContain(true));
    });

    it('filter for online: online option not selected', async () => {
      const onlineFilter = { online: false };
      const allResults = (await prodSearch('2500', '202110', 0, 20, onlineFilter)).data.results;
      expect(allResults.length > 0).toBe(true);
    });
  });

  // TODO your macro for later:
  // /it(wV%yNw%pko/searcher.searchdt(iprodSearch:w/it(wV%jdhN

  describe('filter aggregations', () => {
    it('gives no aggregations', async () => {
      expect((await prodSearch('fundies', '202110', 0, 10, {})).data.filterOptions).toEqual({});
    });

    it('gives multiple aggregations for a single filter with multiple options', async () => {
      const filters = { nupath: ['NU Core/NUpath Adv Writ Dscpl', 'NUpath Interpreting Culture'] };
      expect((await prodSearch('science', '202110', 0, 10, filters)).data.filterOptions).toEqual({
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
      };

      expect((await prodSearch('science', '202110', 0, 10, filters))).toEqual({
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
  });
});

/*
describe('searcher', () => {
  describe('filter aggregations', () => {
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


  TODO Tests with no home :(


    it('filter for class type of seminar', async () => {
      const classTypeFilter = { classType: ['Seminar'] };
      const allResults = (await prodSearch('2500', '202110', 0, 20, classTypeFilter)).data.results;
      expect(allResults.length > 0).toBe(true);
      allResults.forEach((result) => {
        console.log(result.class);
        expect(result.class.classType).toBe(classTypeFilter.classType)
      });
    });
});
*/
