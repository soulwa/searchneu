import Course from '../../classModels/Course';
import mockData from '../../panels/tests/mockData';

let course : Course;

beforeEach(() => {
  course = Course.create(mockData.cs2500Config);
  course.loadSectionsFromServerList(mockData.course2500Sections);
});

it('tests basic getters', () => {
  expect(course.getHash()).toBe('neu.edu/202110/CS/2500');
  expect(course.getHasHonorsSections()).toBe(false);
  expect(course.getHasOnlineSections()).toBe(false);
  expect(course.getHasWaitList()).toBe(false);
  expect(course.getHeighestProfCount()).toBe(2);
  expect(course.getPrettyClassId()).toBe('2500');
  expect(course.isAtLeastOneSectionFull()).toBe(true);
  expect(course.sectionsHaveExam()).toBe(false);
});
