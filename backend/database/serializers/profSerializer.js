/*
 * This file is part of Search NEU and licensed under AGPL3.
 * See the license file in the root folder for details.
 */
import _ from 'lodash';

/* eslint-disable no-underscore-dangle */
class ProfSerializer {
  async bulkSerialize(instances) {
    return _.keyBy(instances.map((instance) => {
      return this._bulkSerializeProf(this._serializeProf(instance));
    }), (res) => res.employee.id);
  }

  _bulkSerializeProf(prof) {
    return {
      employee: prof,
      type: 'employee',
    };
  }

  _serializeProf(_prof) {
    throw new Error('serializeProf not implemented');
  }
}

export default ProfSerializer;
