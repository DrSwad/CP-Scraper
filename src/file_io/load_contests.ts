import Contest from '../types/Contest'

import { env } from '../env.js';

import { join, dirname } from 'path';
import parser, { Options } from 'csv-parser'
import { createReadStream } from 'fs'

async function load_contests() {
  const contest_details : Array<Contest> = [];

  return new Promise((
    resolve: (args: Array<Contest>) => void,
    reject: (args: Array<Contest>) => void
  ) => {
    const input_data_path = join(dirname(process.argv[1]), 'data/' + env.CONTESTS_FILE_NAME);
    createReadStream(input_data_path)
      .pipe(parser({ delimiter: ",", from_line: 2 } as Options))
      .on("data", function (row : Contest) {
        contest_details.push(row);
      })
      .on("end", function () {
        resolve(contest_details);
      })
      .on("error", function (error) {
        console.log("Error loading contest data:", error.message);
        reject([]);
      });
  })
}

export default load_contests;
