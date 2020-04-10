/*
 * This file is part of Search NEU and licensed under AGPL3.
 * See the license file in the root folder for details.
 */
import macros from '../macros';
import { Course } from '../types';

export interface ReqType {
  type: string,
  values: Course[]
}

export interface ReqFor {
  values : any[]
}


// This class holds a branch in the prerequisite or corequisite graph. For instance, if
// a clas's prereqs are ((a or b) and (c or d)), then

class RequisiteBranch {
  prereqs: ReqType;

  coreqs: ReqType;

  constructor(data : ReqType) {
    if (data.type !== 'and' && data.type !== 'or') {
      macros.error('invalid branch type');
    }

    if (!data.values || !Array.isArray(data.values)) {
      macros.error('invalid values for req branch');
    }

    const values = data.values.slice(0).sort((a, b) => {
      return a.compareTo(b);
    });

    this.prereqs = {
      type: data.type,
      values: values,
    };


    this.coreqs = {
      type: 'or',
      values: [],
    };
  }

  // Downloads the first layer of prereqs
  async loadPrereqs(classMap) {
    this.prereqs.values.forEach((childBranch) => {
      if (childBranch instanceof RequisiteBranch) {
        childBranch.loadPrereqs(classMap);
      } else if (!childBranch.isString) {
        childBranch.loadFromClassMap(classMap);
      }
    });
  }
}


export default RequisiteBranch;
