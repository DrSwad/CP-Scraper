import { env } from '../env.js';
import { join, dirname } from 'path';
import parser from 'csv-parser';
import { createReadStream } from 'fs';
async function load_contestants() {
    const rows = [];
    return new Promise((resolve, reject) => {
        const input_data_path = join(dirname(process.argv[1]), 'data/' + env.INPUT_FILE_NAME);
        createReadStream(input_data_path)
            .pipe(parser({ delimiter: ",", from_line: 2 }))
            .on("data", function (row) {
            rows.push(row);
        })
            .on("end", function () {
            const contestant_ids = [];
            const contestant_details = {};
            rows.forEach(row => {
                let contestant = {
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
                    if (!contestant_details[contestant.id].members) {
                        contestant_details[contestant.id].members = [];
                    }
                    contestant_details[contestant.id].members.push({ id: '', name: row[env.MEMBERS_COLUMN_NAME] });
                }
            });
            resolve({ contestant_ids, contestant_details });
        })
            .on("error", function (error) {
            console.log("Error loading contestant data:", error.message);
            reject({ contestant_ids: [], contestant_details: {} });
        });
    });
}
export default load_contestants;
