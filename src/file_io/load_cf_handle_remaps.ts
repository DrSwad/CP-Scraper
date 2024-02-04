import { env } from '../env.js';

import { join, dirname } from 'path';
import parser, { Options } from 'csv-parser'
import { createReadStream } from 'fs'

async function load_cf_handle_remaps() {
  const changed_handles: {[key: string]: string} = {};

  return new Promise((
    resolve: (args: {[key: string]: string}) => void,
    reject: (args: {[key: string]: string}) => void
  ) => {
    const input_data_path = join(dirname(process.argv[1]), 'data/' + env.CF_HANDLE_REMAPS_FILE_NAME);
    createReadStream(input_data_path)
      .pipe(parser({ delimiter: ",", from_line: 2 } as Options))
      .on("data", function (row) {
        changed_handles[row["old_handle"]] = row["new_handle"]
      })
      .on("end", function () {
        resolve(changed_handles);
      })
      .on("error", function (error) {
        console.log(error.message);
        reject({});
      });
  })
}

export default load_cf_handle_remaps;