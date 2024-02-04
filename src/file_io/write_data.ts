import { env } from '../env.js';
import { join, dirname } from 'path';
import { createArrayCsvWriter as writer } from 'csv-writer';

async function write_data(data: Array<Array<string>>) {
  const output_data_path = join(dirname(process.argv[1]), 'data/' + env.OUTPUT_FILE_NAME);
  return new Promise((resolve) => {
    writer({
      header: data[0],
      path: output_data_path
    }).writeRecords(data.slice(1));
    resolve(undefined);
  })
}

export default write_data;
