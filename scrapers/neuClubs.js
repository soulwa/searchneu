import * as acorn from 'acorn';
import cheerio from 'cheerio';
import fs from 'fs-promise';
import mkdirp from 'mkdirp-promise';
import path from 'path';

import request from './request';
import macros from './macros';


// TODO
// might be able to scrape events off facebook pages for more info on when they are meeting
// also hit the orgsync profile to get more information about meetings
// clean up the parsed data right now. Only parse links out of values for whitelisted values.
// CLean up twitter handles, and make sure that all of the fields are standardized. 
// looks like a lot of them havae outdated/missing/incorrect/unparssable timestamps of when they are meeting on here ewwww
// but there is probably enough to get a proof of concept working
// could email to verify
// 

// http://neu.orgsync.com/student_orgs
// Example schema:
//   { audience: 'Undergraduate',
//     organizationemailaddress: '[redacted]@gmail.com',
//     facebookPage: 'https://www.facebook.com/[redacted]/',
//     meetingDay: 'Tuesday',
//     meetingTime: '7:00 PM',
//     meetingLocation: 'Lake Hall',
//     advisorName: 'Peter Simon',
//     presidentName: 'bob smith',
//     treasurerName: 'joe smith',
//     organizationMissionStatement: 'ECO.....',
//     name: 'EconPress',
//     site: 'http://www.northeastern.edu/econpress' },

// Not scraping right now: Description and some other stuff. No reason, just haven't had a reason to add it yet :P


async function scrapeDetails(url) {

  // Fire a get to that url
  const detailHtml = (await request.get({
    url: url,
    shortBodyWarning: false,
  })).body;

  // load the new html
  const $ = cheerio.load(detailHtml);

  // this part needs to be cleaned up but yea
  const detailElements = $('#profile_for_org > ul > li');

  const obj = {};

  // console.log(detailElements.length, url)
  // Looks like need to grab the href from the links but this is close
  for (let i = 0; i < detailElements.length; i++) {
    const $thisEle = $(detailElements[i]);

    // Get the key and convert it to cammel case
    let key = $('strong', $thisEle).text();

    key = key.trim();
    if (key.endsWith(':')) {
      key = key.slice(0, key.length - 1);
    }
    key = key.replace(/ /gi, '');
    key = key[0].toLowerCase() + key.slice(1);

    // Get the value of this field
    // If its a link to something, get all the links
    // If not, get the text
    let value;
    const possibleLinks = $('a', $thisEle);

    if (possibleLinks.length > 0) {
      const emails = [];
      for (let j = 0; j < possibleLinks.length; j++) {
        emails.push(possibleLinks[j].attribs.href);
      }
      value = emails;
    } else {
      value = $('p', $thisEle).text();
    }

    if (value) {
      obj[key] = value;
    }
  }

  // Remove mailto: from the beginning of the email addr
  if (obj.organizationemailaddress && obj.organizationemailaddress.length > 0) {
    for (let j = 0; j < obj.organizationemailaddress.length; j++) {
      const email = obj.organizationemailaddress[j];
      if (email.startsWith('mailto:')) {
        obj.organizationemailaddress[j] = email.slice('mailto:'.length);
      }
    }
  }

  // Slurp up the name
  obj.name = $('#full_profile > h2').text().trim();

  // and get link jawn too
  obj.site = $('#org_extranet_url > a').attr('href')

  // Scrape the organization portal link too. 
  obj.orgPortalLink = $('#org-portal-link > strong > a').attr('href')


  // Scrape description and category
  const possibleElements = $('#org_profile_info > ul > li')
  for (var i = 0; i < possibleElements.length; i++) {
    if (possibleElements[i].attribs.id) {
      continue;
    }

    var strong = $('strong', $(possibleElements[i]))

    if (!strong[0].next) {
      continue
    }

    const strongText = strong.text().trim().replace(/:/gi, '').toLowerCase()

    let value = strong[0].next.data.trim()

    if (strongText === 'category') {
      obj.category = value
    }
    else if (strongText === 'description') {
      obj.description = value
    }
    else {
      console.log('Unknown info box prop', strongText)
    }

  }


  if (Object.keys(obj).length < 3) {
    console.log('Error', url);
  }

  return obj;
}


async function scrapeLetterAndPage(letter, pageNum) {
  const resp = await request.post({
    shortBodyWarning: false,
    url: `http://neu.orgsync.com/search/get_orgs_by_letter/${letter.toUpperCase()}?page=${pageNum}`,
  });

  // Abstract Syntax Trees are the data structure that is used to parse programming languages (like javascript)
  // Like, the first step of running a programming language is to parse it into a AST
  // then preform a bunch of optimizations on it
  // and then compile it to machine code (if it is something like C)
  // or just run the AST directly (like python or js)
  // google for more info, feel free to log this directly
  const ast = acorn.parse(resp.body);

  // The reponse that we get back from that url is two lines of JS code
  // We are looking for the string arguments in the second line
  const html = ast.body[1].expression.arguments[0].value;

  // Dope, lets treat that as HTML and parse it
  const $ = cheerio.load(html);

  // Get all the a elements from it
  const elements = $('a');

  const orgs = [];
  const promises = [];

  // Look through all the below elements
  for (let i = elements.length - 1; i >= 0; i--) {
    if (!elements[i].attribs || !elements[i].attribs.href || elements[i].attribs.href === '#' || !elements[i].attribs.href.includes('show_profile')) {
      continue;
    }

    promises.push(scrapeDetails(elements[i].attribs.href).then((org) => {
      orgs.push(org);
    }));
  }


  await Promise.all(promises);

  return orgs;
}


async function scrapeLetter(letter) {
  let totalOrgs = [];

  let pageNum = 1;

  // Each letter is pagenated
  // Increment the page number until hit a page with no results
  while (true) {
    const orgs = await scrapeLetterAndPage(letter, pageNum);
    console.log(letter, 'page#', pageNum, 'had', orgs.length, 'orgs now at ', orgs.length);
    pageNum++;
    if (orgs.length === 0) {
      return totalOrgs;
    }

    if (pageNum > 30) {
      console.log('Warning! Hit 30 page max, returning');
      return totalOrgs;
    }

    totalOrgs = totalOrgs.concat(orgs);
  }
}


async function main() {
  let orgs = [];

  const promises = [];

  macros.ALPHABET.split('').forEach((letter) => {
    promises.push(scrapeLetter(letter).then((someOrgs) => {
      orgs = orgs.concat(someOrgs);
    }));
  });

  await Promise.all(promises);

  const outputPath = path.join(macros.PUBLIC_DIR, 'getClubs', 'neu.edu');

  await mkdirp(outputPath);

  await fs.writeFile(path.join(outputPath, 'data.json'), JSON.stringify(orgs));
  console.log('done!', orgs.length, outputPath);
}

if (require.main === module) {
  main();
}


export default main;
