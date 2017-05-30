import Class from './Class';
import Section from './Section';
import Keys from '../Keys';

export default class DataLib {

  constructor(termDump) {
    this.termDump = termDump;
  }


  // Possibly add a downloadData() method here
  // that downloads the data from github pages with superagent (http library that works in frontend and backend)

  static loadData(termDump) {
    if (!termDump.classMap || !termDump.sectionMap) {
      console.error('invalid termDump', termDump);
      return null;
    }

    return new this(termDump);
  }

  // Right now only the class that is created is loaded. Need to add loading on demand later for times when you need more info on prereqs, corereqs, etc (prereq.prereq.prereq...)
  // That is not needed for this project, however.
  static createClassFromSearchResult(searchResultData) {
    const aClass = Class.create(searchResultData.class);
    aClass.loadSectionsFromServerList(searchResultData.sections);
    return aClass;
  }

  // Returns a list of the keys in a subject, sorted by classId
  // Usually takes ~ 5ms and does not instantiate any instances of Class or Subject
  getClassesInSubject(subject) {
    const keys = Object.keys(this.termDump.classMap);

    const startTime = Date.now();

    const retVal = [];
    for (const key of keys) {
      const row = this.termDump.classMap[key];
      if (row.subject === subject) {
        retVal.push(key);
      }
    }

    // Sort the classes
    retVal.sort((a, b) => {
      return parseInt(this.termDump.classMap[a].classId) - parseInt(this.termDump.classMap[b].classId);
    });

    // Turn this into a analytics call when that is working
    console.log('send', 'timing', subject, 'subject', Date.now() - startTime);

    return retVal;
  }


  getSubjects() {
    return Object.values(this.termDump.subjectMap);
  }

  getClassServerDataFromHash(hash) {
    return this.termDump.classMap[hash];
  }

  getSectionServerDataFromHash(hash) {
    return this.termDump.sectionMap[hash];
  }



  createClass(searchResultData) {
    const keys = Keys.createWithHash(config);
    if (!keys) {
      console.error('broooo');
    }
    const hash = keys.getHash();

    const serverData = this.termDump.classMap[hash];

    if (!serverData) {
      console.error('wtf');
      return;
    }

    const aClass = Class.create(serverData, this.termDump);

    return aClass;
  }

}
