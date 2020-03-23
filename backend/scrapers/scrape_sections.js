import TermParser from './classes/parsersxe/termParser';

if (require.main === module) {
  TermParser.requestsSectionsForTerm('202030').then((a) => { return console.log(a.length); });
}
