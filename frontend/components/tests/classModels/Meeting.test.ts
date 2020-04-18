/*
 * This file is part of Search NEU and licensed under AGPL3.
 * See the license file in the root folder for details.
 */
import Meeting, { ServerData } from '../../classModels/Meeting';
import { DayOfWeek } from '../../types';

let meeting : Meeting;
let exam : Meeting;

beforeEach(() => {
  const serverDataForMeeting : ServerData = {
    startDate: 18267,
    endDate: 18366,
    where: 'Robinson Hall 411',
    type: 'Class',
    times: {
      2: [
        {
          start: 35400,
          end: 41400,
        },
      ],
      5: [
        {
          start: 35400,
          end: 41400,
        },
      ],
    },
  };
  meeting = new Meeting(serverDataForMeeting);

  const serverDataForExam : ServerData = {
    startDate: 18375,
    endDate: 18375,
    where: 'Mugar Life Science Building 201',
    type: 'Final Exam',
    times: {
      4: [
        {
          start: 37800,
          end: 45000,
        },
      ],
    },
  };
  exam = new Meeting(serverDataForExam);
});

it('Testing basic getters on meeting', () => {
  expect(meeting.getBuilding()).toBe('Robinson Hall');
  expect(meeting.getHoursPerWeek()).toBe(3.3);
  expect(meeting.isExam()).toBe(false);
  expect(meeting.getIsHidden()).toBe(false);
  expect(meeting.getMeetsOnWeekends()).toBe(false);
  expect(meeting.getWeekdayStrings()).toStrictEqual(['Tuesday', 'Friday']);
});

it('Testing getMeetsOnDay', () => {
  expect(meeting.getMeetsOnDay(DayOfWeek.TUESDAY)).toBe(true);
  expect(meeting.getMeetsOnDay(DayOfWeek.WEDNESDAY)).toBe(false);
  expect(exam.getMeetsOnDay(DayOfWeek.SUNDAY)).toBe(false);
  expect(exam.getMeetsOnDay(DayOfWeek.THURSDAY)).toBe(true);
});

it('Testing basic getters on exam', () => {
  expect(exam.getBuilding()).toBe('Mugar Life Science Building');
  expect(exam.getHoursPerWeek()).toBe(2);
  expect(exam.isExam()).toBe(true);
  expect(exam.getIsHidden()).toBe(false);
  expect(exam.getMeetsOnWeekends()).toBe(false);
  expect(exam.getWeekdayStrings()).toStrictEqual(['Thursday']);
});
