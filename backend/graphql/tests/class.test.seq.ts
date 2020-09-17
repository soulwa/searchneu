/*
 * This file is part of Search NEU and licensed under AGPL3.
 * See the license file in the root folder for details.
 */
import { createTestClient } from 'apollo-server-testing';
import { PrismaClient } from '@prisma/client';
import { gql } from 'apollo-server';
import server from '../index';

const { query } = createTestClient(server);

let prisma: PrismaClient;

beforeAll(async () => {
  prisma = new PrismaClient();

  await prisma.section.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.course.create({
    data: {
      id: 'neu.edu/201930/CS/2500',
      host: 'neu.edu',
      termId: '201930',
      subject: 'CS',
      classId: '2500',
      name: 'Fundamentals of Computer Science 1',
      lastUpdateTime: new Date(),
    },
  });

  await prisma.course.create({
    data: {
      id: 'neu.edu/201830/CS/2500',
      host: 'neu.edu',
      termId: '201830',
      subject: 'CS',
      classId: '2500',
      name: 'Fundamentals of Computer Science 1',
      lastUpdateTime: new Date(),
    },
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

it('gets all occurrences', async () => {
  const res = await query({
    query: gql`
      query class {
        class(subject: "CS", classId: 2500) {
          name
          allOccurrences {
            termId
          }
        }
      }
    `,
  });
  expect(res).toMatchSnapshot();
});

it('gets latest occurrence', async () => {
  const res = await query({
    query: gql`
      query class {
        class(subject: "CS", classId: 2500) {
          name
          latestOccurrence {
            termId
          }
        }
      }
    `,
  });
  expect(res).toMatchSnapshot();
});

it('gets specific occurrence', async () => {
  const res = await query({
    query: gql`
      query class {
        class(subject: "CS", classId: 2500) {
          name
          occurrence(termId: 201930) {
            termId
          }
        }
      }
    `,
  });
  expect(res).toMatchSnapshot();
});

it('gets the name of class from subject and classId', async () => {
  const res = await query({
    query: gql`
      query class {
        class(subject: "CS", classId: 2500) {
          name
        }
      }
    `,
  });
  expect(res).toMatchSnapshot();
});
