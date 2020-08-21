/*
 * This file is part of Search NEU and licensed under AGPL3.
 * See the license file in the root folder for details.
 *
 * script to fill elasticsearch by quering postgres
 */

import { Professor, Course } from '../database/models/index';
import macros from '../macros';

if (require.main === module) {
  macros.log(`Populating ES at ${macros.getEnvVariable('elasticURL')} from Postgres at ${macros.getEnvVariable('dbHost')}`);
  (async () => {
    await Course.bulkUpsertES(await Course.findAll());
    await Professor.bulkUpsertES(await Professor.findAll());
  })().catch((e) => macros.error(e));
}
