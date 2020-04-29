import Course from '../../classModels/Course';
import mockData from '../../panels/tests/mockData';

let course : Course;

beforeEach(() => {
  course = Course.create(mockData.cs2500Config);
  course.loadSectionsFromServerList(mockData.course2500Sections);
});

describe('tests basic getters', () => {
  it('hashing', () => {
    expect(course.getHash()).toBe('neu.edu/202110/CS/2500');
  });

  it('hasHonorsSections', () => {
    expect(course.hasHonorsSections()).toBe(false);
  });

  it('has online sections', () => {
    expect(course.hasOnlineSections()).toBe(false);
  });

  it('has wait list', () => {
    expect(course.hasWaitlist()).toBe(false);
  });

  it('highest professor count', () => {
    expect(course.getHeighestProfCount()).toBe(2);
  });

  it('pretty class id', () => {
    expect(course.getPrettyClassId()).toBe('2500');
  });

  it('is at least one section full', () => {
    expect(course.isAtLeastOneSectionFull()).toBe(true);
  });

  it('sections have exam', () => {
    expect(course.sectionsHaveExam()).toBe(false);
  });
});
