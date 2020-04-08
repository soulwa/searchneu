/*
 * This file is part of Search NEU and licensed under AGPL3.
 * See the license file in the root folder for details.
 */

import Section from '../../classModels/Section';
import mockData from '../../panels/tests/mockData'
import moment from "moment";

let section : Section;

beforeEach(() => {
  section = Section.create(mockData.probStatsSectionConfig);
});

it('testing basic getters', () => {
  expect(section.getAllMeetingMoments()).toEqual([
    { start: moment('1970-01-05T10:30:00.000Z'), end: moment('1970-01-05T11:35:00.000Z') },
    { start: '1970-01-07T10:30:00.000Z', end: '1970-01-07T11:35:00.000Z' },
    { start: '1970-01-08T10:30:00.000Z', end: '1970-01-08T11:35:00.000Z' }]);
});
