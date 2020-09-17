/*
 * This file is part of Search NEU and licensed under AGPL3.
 * See the license file in the root folder for details.
 *
 * script to fill elasticsearch by quering postgres
 */
import { PrismaClient, Course, Professor } from '@prisma/client';

import elastic from '../elastic';
import ElasticCourseSerializer from '../database/serializers/elasticCourseSerializer';
import ElasticProfSerializer from '../database/serializers/elasticProfSerializer';
import macros from '../macros';

export async function bulkUpsertCourses(courses: Course[]): Promise<void> {
  const serializedCourses = await ((new ElasticCourseSerializer()).bulkSerialize(courses));
  return elastic.bulkIndexFromMap(elastic.CLASS_INDEX, serializedCourses);
}

export async function bulkUpsertProfs(profs: Professor[]): Promise<void> {
  const serializedProfs = await ((new ElasticProfSerializer()).bulkSerialize(profs));
}

export async function populateES(): Promise<void> {
  const prisma = new PrismaClient();
  await bulkUpsertCourses(await prisma.course.findMany());
  await bulkUpsertProfs(await prisma.professor.findMany());
  await prisma.$disconnect();
}

if (require.main === module) {
  macros.log(`Populating ES at ${macros.getEnvVariable('elasticURL')} from Postgres at ${macros.getEnvVariable('dbHost')}`);
  (async () => populateES())().catch((e) => macros.error(e));
}
