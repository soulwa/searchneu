/*
 * This file is part of Search NEU and licensed under AGPL3.
 * See the license file in the root folder for details.
 */

import _ from 'lodash';

import Keys from '../../../common/Keys';
import macros from '../macros';
import Meeting, { MomentTuple } from './Meeting';

class Section {
  static requiredPath : string[] = ['host', 'termId', 'subject', 'classId'];

  static optionalPath : string[]= ['crn'];

  static API_ENDPOINT : string = '/listSections';

  dataStatus : string;

  lastUpdateTime : any; // TODO: can anyone figure this out? I can't find an instance -- probably related to notifs broken

  meetings: Meeting[];

  profs : string[];

  waitCapacity : number;

  waitRemaining : 0;

  online : boolean;

  seatsRemaining: number;

  seatsCapacity : number;

  hasWaitList : number;

  honors : boolean;

  constructor(config) {
    //loading status is done if any sign that has data
    if (config.dataStatus !== undefined) {
      this.dataStatus = config.dataStatus;
    } else if (this.lastUpdateTime !== undefined || this.meetings) {
      this.dataStatus = macros.DATASTATUS_DONE;
    }

    //seperate reasons to meet: eg Lecture or Lab.
    //each of these then has times, and days
    //instances of Meeting
    this.meetings = [];
  }

  static create(config) : Section {
    const instance = new this(config);
    instance.updateWithData(config);
    return instance;
  }

  getHash() : string {
    return Keys.getSectionHash(this);
  }

  meetsOnWeekends() : boolean {
    return this.meetings.some((meeting) => { return meeting.getMeetsOnWeekends(); });
  }

  getAllMeetingMoments(ignoreExams = true) : MomentTuple[] {
    let retVal = [];
    this.meetings.forEach((meeting) => {
      if (ignoreExams && meeting.getIsExam()) {
        return;
      }

      retVal = retVal.concat(_.flatten(meeting.times));
    });

    retVal.sort((a, b) => {
      return a.start.unix() - b.start.unix();
    });

    return retVal;
  }

  //returns [false,true,false,true,false,true,false] if meeting mon, wed, fri
  getWeekDaysAsBooleans() : boolean[] {
    const retVal = [false, false, false, false, false, false, false];


    this.getAllMeetingMoments().forEach((time) => {
      retVal[time.start.day()] = true;
    });

    return retVal;
  }

  getWeekDaysAsStringArray() : string[] {
    const weekdaySet = new Set<string>();
    this.getAllMeetingMoments().forEach((time) => {
      weekdaySet.add(time.start.format('dddd'));
    });

    return Array.from(weekdaySet);
  }

  //returns true if has exam, else false
  getHasExam() : boolean {
    return this.meetings.some((meeting) => { return meeting.getIsExam(); });
  }

  //returns the {start:end:} moment object of the first exam found
  //else returns null
  getExamMeeting() {
    for (let i = 0; i < this.meetings.length; i++) {
      const meeting = this.meetings[i];
      if (meeting.getIsExam()) {
        if (meeting.times.length > 0) {
          return meeting;
        }
      }
    }
    return null;
  }

  // Unique list of all professors in all meetings, sorted alphabetically
  getProfs() {
    return Array.from(this.profs).sort();
  }

  getLocations(ignoreExams = true) {
    const retVal = [];
    this.meetings.forEach((meeting) => {
      if (ignoreExams && meeting.getIsExam()) {
        return;
      }

      const where = meeting.where;
      if (!retVal.includes(where)) {
        retVal.push(where);
      }
    });

    // If it is at least 1 long with TBAs remove, return the array without any TBAs
    // Eg ["TBA", "Richards Hall 201" ] -> ["Richards Hall 201"]
    const noTBAs = _.pull(retVal.slice(0), 'TBA');
    if (noTBAs.length > 0) {
      return noTBAs;
    }

    return retVal;
  }

  getHasWaitList() {
    return this.waitCapacity > 0 || this.waitRemaining > 0;
  }

  updateWithData(data) {
    for (const attrName of Object.keys(data)) {
      if ((typeof data[attrName]) === 'function') {
        macros.error('given fn??', data, this, this.constructor.name);
        continue;
      }
      this[attrName] = data[attrName];
    }

    if (data.meetings) {
      const newMeetings = [];

      data.meetings.forEach((serverData) => {
        newMeetings.push(new Meeting(serverData));
      });

      this.meetings = newMeetings;
    }
  }


  compareTo(other) {
    const thisProfs = this.getProfs();
    const otherProfs = other.getProfs();

    const meetingsExistChecks : boolean[][] = [
      [this.online, other.online],
      [this.meetings.length === 0, other.meetings.length === 0, true],
      [this.meetings.length > other.meetings.length, other.meetings.length > this.meetings.length],
    ];

    // If both sections have meetings, then sort alphabetically by professor.
    const profChecks : boolean[][] = [
      [otherProfs.length === 0 && thisProfs.length === 0],
      [thisProfs.length === 1 && thisProfs[0] === 'TBA', otherProfs.length === 1 && otherProfs[0] === 'TBA'],
      [thisProfs[0] > otherProfs[0], otherProfs[0] > thisProfs[0]],
    ];

    const meetingChecks : boolean[][] = [
      [this.meetings[0].times.length === 0, !(other.meetings[0].times.length === 0), true],
      [this.meetings[0].times[0][0].start.unix() > other.meetings[0].times[0][0].start.unix(),
        !(this.meetings[0].times[0][0].start.unix() < other.meetings[0].times[0][0].start.unix())],
    ];

    const checks = [[true, meetingsExistChecks],
      [this.profs.length > 0 || otherProfs.length > 0, profChecks],
      [true, meetingChecks]];

    for (let i = 0; i < checks.length; i++) {
      if (checks[i][0]) {
        const compareCheck = this.compareList(checks[i][1]);
        if (compareCheck !== null) {
          return compareCheck
        }
      }
    }

    return 0;
  }

  compareList(checks) : number {
    for (let i = 0; i < checks.length; i++) {
      if (checks[i].length === 3) {
        if (checks[i][0] && checks[i][1]) {
          return 0;
        }
      }
      if (this.compareTwoBools(checks[i][0], checks[i][1]) !== 0) {
        return this.compareTwoBools(checks[i][0], checks[i][1]);
      }
    }
    return null;
  }

  compareTwoBools(bool1, bool2) {
    if (bool1 && !bool2) {
      return 1;
    }
    if (bool2 && !bool1) {
      return -1;
    }
    return 0;
  }
}

export default Section;
