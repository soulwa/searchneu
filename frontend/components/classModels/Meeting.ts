/*
 * This file is part of Search NEU and licensed under AGPL3.
 * See the license file in the root folder for details.
 */

import _ from 'lodash';
import moment, { Moment } from 'moment';
import macros from '../macros';
import { DayOfWeek } from '../types';

export interface ServerData {
  startDate : number;
  endDate : number;
  where : string;
  type : string;
  times: DayOfWeekToTime;
}

type DayOfWeekToTime = {
  [key in DayOfWeek]? : TimeTuple[];
};

type TimeTuple = {
  start : number;
  end : number;
}

export type MomentTuple = {
  start : Moment,
  end : Moment
}

type TimeToMoment = {
  [key: number] : MomentTuple[];
}

class Meeting {
  where: string;

  startDate: Moment;

  endDate: Moment;

  times: MomentTuple[][];

  constructor(serverData : ServerData) {
    if (!serverData) {
      return null;
    }

    this.where = serverData.where;

    // if without spaces and case insensitive is tba, make it TBA
    // TODO: I don't think this code actually triggers
    if (this.where.replace(/\s/gi, '').toUpperCase() === 'TBA') {
      this.where = 'TBA';
    }

    //beginning of the day that the class starts/ends
    this.startDate = moment((serverData.startDate + 1) * 24 * 60 * 60 * 1000);
    this.endDate = moment((serverData.endDate + 1) * 24 * 60 * 60 * 1000);

    //grouped by start+end time on each day.
    // eg, if have class that meets tue, wed, thu, at same time each day,
    // each list must be at least 1 long
    // you would have [[{start:end:},{start:end:},{start:end:}]]
    // where each start:end: object is a different day
    this.times = [];

    const timeMoments = [];

    if (serverData.times) {
      const dayIndexies = Object.keys(serverData.times);

      for (const dayIndex of dayIndexies) {
        serverData.times[dayIndex].forEach((event) => {
          //3 is to set in the second week of 1970
          const day = parseInt(dayIndex, 10) + 3;

          const obj = {
            start: moment.utc(event.start * 1000).add(day, 'day'),
            end: moment.utc(event.end * 1000).add(day, 'day'),
          };

          if (parseInt(obj.start.format('YYYY'), 10) !== 1970) {
            macros.error();
          }

          timeMoments.push(obj);
        });
      }
    }


    // returns objects like this: {3540000041400000: Array[3]}
    // if has three meetings per week that meet at the same times
    const groupedByTimeOfDay : TimeToMoment = _.groupBy(timeMoments, (event) => {
      const zero = moment(event.start).startOf('day');
      return `${event.start.diff(zero)}${event.end.diff(zero)}`;
    });

    // Get the values of the object returned above
    const valuesGroupedByTimeOfDay : MomentTuple[][] = _.values(groupedByTimeOfDay);

    // And sort by start time
    valuesGroupedByTimeOfDay.sort((meetingsInAday) => {
      const zero = moment(meetingsInAday[0].start).startOf('day');
      return meetingsInAday[0].start.diff(zero);
    });

    this.times = valuesGroupedByTimeOfDay;
  }

  getBuilding() : string {
    // regex off the room number
    return this.where.replace(/\d+\s*$/i, '').trim();
  }

  getHoursPerWeek() : number {
    let retVal = 0;

    _.flatten(this.times).forEach((time) => {
      // moment#diff returns ms, need hr
      retVal += time.end.diff(time.start) / (1000 * 60 * 60);
    });

    return Math.round(10 * retVal) / 10;
  }

  // returns sorted list of weekday strings, eg
  //["Monday","Friday"]
  getWeekdayStrings() : string[] {
    const retVal = [];

    const flatTimes = _.flatten(this.times);

    flatTimes.sort((a, b) => {
      return a.start.unix() - b.start.unix()
    });

    flatTimes.forEach((time) => {
      const weekdayString = time.start.format('dddd');
      if (!retVal.includes(weekdayString)) {
        retVal.push(weekdayString);
      }
    });

    return retVal;
  }

  getIsHidden() : boolean {
    return this.getHoursPerWeek() === 0;
  }

  isExam() : boolean {
    // this could be improved by scraping more data...
    return this.startDate.unix() === this.endDate.unix();
  }

  getMeetsOnDay(dayIndex : DayOfWeek) : boolean {
    const flatTimes = _.flatten(this.times);
    return flatTimes.some((time) => { return time.start.day() === dayIndex; });
  }

  getMeetsOnWeekends() : boolean {
    return !this.isExam()
        && this.getMeetsOnDay(DayOfWeek.SUNDAY) || this.getMeetsOnDay(DayOfWeek.SATURDAY);
  }
}


export default Meeting;
