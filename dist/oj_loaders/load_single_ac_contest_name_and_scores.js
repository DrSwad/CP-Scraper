import { env } from '../env.js';
import { load_atcoder_contest_details, load_atcoder_contest_submissions_by_user } from '../api/atcoder.js';
async function load_single_ac_contest_name_and_scores(contest_id, contestant_ids, contestant_details) {
    const ac_handles_array = [];
    const ac_handle_to_id = {};
    contestant_ids.forEach(id => {
        let handle_found = false;
        contestant_details?.[id]?.ac?.split(",").forEach(ac_handle => {
            ac_handle = ac_handle.trim().toLowerCase();
            ac_handles_array.push(ac_handle);
            ac_handle_to_id[ac_handle] = id;
            handle_found = true;
        });
        if (!handle_found)
            console.error("Missing AC handle for ", id);
    });
    const contest_scores = {};
    contestant_ids.forEach(id => {
        contest_scores[id] = {
            points: 0,
            penalty: 0,
        };
    });
    const consider_score = (id, score) => {
        const prv_points = contest_scores[id].points;
        const prv_penalty = contest_scores[id].penalty;
        const new_points = score.points;
        const new_penalty = score.penalty;
        let points = prv_points;
        let penalty = prv_penalty;
        if ((prv_points < new_points) ||
            (prv_points == new_points && prv_penalty > new_penalty)) {
            points = new_points;
            penalty = new_penalty;
        }
        contest_scores[id] = { points, penalty };
    };
    const contest_details = await load_atcoder_contest_details(contest_id);
    console.log(`Fetching results of ${contest_details["id"]}`);
    for (const ac_handle of ac_handles_array) {
        console.log(`Processing handle ${ac_handle}`);
        const contest_submissions = await load_atcoder_contest_submissions_by_user(contest_details["id"], ac_handle, contest_details["start_epoch_second"], contest_details["duration_second"]);
        const participant_status = {};
        for (const submission of contest_submissions) {
            const { problem_id, result, epoch_second } = submission;
            if (!participant_status[problem_id]) {
                participant_status[problem_id] = {
                    solved: false,
                    penalty: 0,
                    seconds: 0
                };
            }
            if (!participant_status[problem_id].solved) {
                if (result === "AC") {
                    participant_status[problem_id].solved = true;
                    participant_status[problem_id].seconds = epoch_second - contest_details["start_epoch_second"];
                }
                else {
                    participant_status[problem_id].penalty++;
                }
            }
        }
        const participant_score = {
            points: 0,
            penalty: 0
        };
        // let max_problem_penalty_seconds = 0;
        for (const problem in participant_status) {
            if (participant_status[problem].solved) {
                participant_score.points += env.AC_PROBLEM_WEIGHT;
                participant_score.penalty += participant_status[problem].seconds;
                // participant_score.penalty += participant_status[problem].penalty * 300;
                // max_problem_penalty_seconds = Math.max(max_problem_penalty_seconds, participant_status[problem].seconds);
            }
        }
        // participant_score.penalty += max_problem_penalty_seconds;
        participant_score.penalty = Math.floor(participant_score.penalty / 60);
        consider_score(ac_handle_to_id[ac_handle], participant_score);
    }
    return { contest_name: contest_details["title"], contest_scores };
}
export default load_single_ac_contest_name_and_scores;
