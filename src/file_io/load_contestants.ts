import Contestant from '../types/Contestant.js';
import Team from '../types/Team.js';

import { env } from '../env.js';

import { join, dirname } from 'path';
import parser, { Options } from 'csv-parser'
import { createReadStream } from 'fs'

async function load_contestants() {
  const rows : Array<{ [key: string]: string }> = [];

  return new Promise((
    resolve: (args: {
      contestant_ids: Array<string>;
      contestant_details: { [id: string]: Contestant }
    }) => void,
    reject: (args: {
      contestant_ids: Array<string>;
      contestant_details: { [id: string]: Contestant }
    }) => void
  ) => {
    const input_data_path = join(dirname(process.argv[1]), 'data/' + env.INPUT_FILE_NAME);
    createReadStream(input_data_path)
      .pipe(parser({ delimiter: ",", from_line: 2 } as Options))
      .on("data", function (row : { [key: string]: string }) {
        rows.push(row);
      })
      .on("end", function () {
        const contestant_ids : Array<string> = [];
        const contestant_details : { [id: string]: Contestant } = {};
        rows.forEach(row => {
          let contestant : Contestant = {
            id: '',
            name: '',
          };
          if (!row[env.ID_COLUMN_NAME]) {
            if (contestant_ids.length !== 0) {
              contestant = contestant_details[contestant_ids[contestant_ids.length - 1]];
            }
            else {
              return;
            }
          }
          else {
            const contestant_id = row[env.ID_COLUMN_NAME];
            if (contestant_details[contestant_id]) {
              contestant = contestant_details[contestant_id];
            }
            else {
              contestant.id = row[env.ID_COLUMN_NAME];
            }
          }
          contestant.name = row[env.NAME_COLUMN_NAME] || contestant.name;
          if (env.CF_COLUMN_NAME) {
            contestant.cf = row[env.CF_COLUMN_NAME] || contestant.cf;
          }
          if (env.AC_COLUMN_NAME) {
            contestant.ac = row[env.AC_COLUMN_NAME] || contestant.ac;
          }
          if (env.VJ_COLUMN_NAME) {
            contestant.vj = row[env.VJ_COLUMN_NAME] || contestant.vj;
          }

          if (!contestant_details[contestant.id]) {
            contestant_ids.push(contestant.id);
            contestant_details[contestant.id] = contestant;
          }

          if (env.MEMBERS_COLUMN_NAME && row[env.MEMBERS_COLUMN_NAME]) {
            if (!(contestant_details[contestant.id] as Team).members) {
              (contestant_details[contestant.id] as Team).members = [];
            }
            (contestant_details[contestant.id] as Team).members.push({ id: '', name: row[env.MEMBERS_COLUMN_NAME] });
          }
        });
        resolve({ contestant_ids, contestant_details });
      })
      .on("error", function (error) {
        console.log("Error loading contestant data:", error.message);
        reject({ contestant_ids: [], contestant_details: {} });
      });
  })
}

export default load_contestants;
