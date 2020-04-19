/*
 * This file is part of Search NEU and licensed under AGPL3.
 * See the license file in the root folder for details.
 */

import macros from './macros';
import { Course, Professor } from './database/models';

// This file generates https://searchneu.com/sitemap.xml
// This helps SIGIFICANTLY with SEO on Google (and other search engines).

// Goes through every employee and class in the DB and generates a url entry in the sitemap
// for every entry in the data dump.

// This file is ran with the other processors.

export default async function generateSitemap() {
  // Items to link to.
  // The part after the https://searchneu.com/
  let items = [];

  const currentTerm: string = (await Course.findAll({
    attributes: ['termId'],
    group: ['termId'],
    order: [['termId', 'DESC']],
    limit: 1,
  }))[0].get('termId');

  macros.log('The current term is:', currentTerm);

  // Add the classes
  const courses = await Course.findAll({
    attributes: ['subject', 'classId', 'name'],
    where: { termId: currentTerm },
  });
  for (const course of courses) {
    items.push(`${course.get('subject')} ${course.get('classId')}`);
    items.push(course.get('name'));
  }

  // Add the employees
  const employees = await Professor.findAll({
    attributes: ['name'],
  });
  for (const employee of employees) {
    items.push(employee.get('name'));
  }

  // Remove duplicates
  items = Array.from(new Set(items));

  // Convert the items to urls and put them inside xml
  const xml = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];
  for (const item of items) {
    xml.push('  <url>');
    xml.push(`    <loc>https://searchneu.com/${currentTerm}/${encodeURIComponent(item)}</loc>`);
    xml.push('  </url>');
  }
  xml.push('</urlset>');

  const output = xml.join('\n');

  // await fs.writeFile(path.join('public', 'sitemap.xml'), output);
  return output;
}
