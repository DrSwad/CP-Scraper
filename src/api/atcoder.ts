import fetch from 'node-fetch';

import Contestant from '../types/Contestant.js';
import Score from '../types/Score.js';
import AtCoderContest from '../types/AtCoderContest.js';
import AtCoderSubmission from '../types/AtCoderSubmission.js';

async function delay(time: number) {
  return new Promise(resolve => setTimeout(resolve, time));
}

async function load_atcoder_contest_details(contest_id: string) {
  await(delay(1000));
  const response = await fetch('https://kenkoooo.com/atcoder/resources/contests.json');
  const data = await response.json() as Array<AtCoderContest>;
  const contest = data.filter(({id}) => (id === contest_id));
  if (contest.length !== 1) {
    if (contest.length === 0) throw new Error("AtCoder contest not found: " + contest_id);
    else throw new Error("Multiple instances of AtCoder contests found with this id: " + contest_id);
  }
  return contest[0];
}

async function load_atcoder_contest_submissions_by_user(contest_id: string, user_id: string, from_second: number, duration_second: number) {
  await(delay(1000));
  const response = await fetch(`https://kenkoooo.com/atcoder/atcoder-api/v3/user/submissions?user=${user_id}&from_second=${from_second}`);
  const data = await response.json() as Array<AtCoderSubmission>;
  return data.filter(({
    epoch_second,
    contest_id: submission_contest_id,
    user_id: submission_user_id
  }) => {
    return epoch_second <= from_second + duration_second &&
           contest_id == submission_contest_id &&
           user_id.toLowerCase() == submission_user_id.toLowerCase();
  });
  // const ac_handles_array: Array<string> = [];
  // const ac_handle_to_id: { [handle: string]: string } = {};
  // contestant_ids.forEach(id => {
  //   let handle_found = false;
  //   contestant_details?.[id]?.ac?.split(",").forEach(ac_handle => {
  //     ac_handle = ac_handle.trim().toLowerCase();
  //     ac_handles_array.push(ac_handle);
  //     ac_handle_to_id[ac_handle] = id;
  //     handle_found = true;
  //   })
  //   if (!handle_found) console.error("Missing AC handle for ", id);
  // });

  // const contest_scores: { [id: string]: Score } = {};
  // contestant_ids.forEach(id => {
  //   contest_scores[id] = {
  //     points: 0,
  //     penalty: 0,
  //   };
  // });

  // const consider_score = (id: string, score: Score) => {
  //   const prv_points = contest_scores[id].points;
  //   const prv_penalty = contest_scores[id].penalty;
  //   const new_points = score.points;
  //   const new_penalty = score.penalty;

  //   let points = prv_points;
  //   let penalty = prv_penalty;

  //   if ((prv_points < new_points) ||
  //     (prv_points == new_points && prv_penalty > new_penalty)) {
  //     points = new_points;
  //     penalty = new_penalty;
  //   }

  //   contest_scores[id] = { points, penalty };
  // };

  // return new Promise((
  //   resolve: (args: {
  //     contest_name: string;
  //     contest_scores: { [id: string]: Score };
  //   }) => void,
  //   reject: (args: {
  //     contest_name: string;
  //     contest_scores: { [id: string]: Score };
  //   }) => void
  // ) => {
  //   const contest_name = "";
  //   resolve({ contest_name, contest_scores });

    // cf.contest.standings({
    //   contestId: contest_id,
    //   handles: cf_handles_array,
    //   showUnofficial: true
    // } as any, function (err, data) {
    //   if (err) {
    //     console.error("Failed to retrieve CF contest " + contest_id + " standings.", err);
    //     reject({ contest_name: "", contest_scores: {} });
    //   }
    //   else {
    //     const contest_duration = (data["contest"] as any)["durationSeconds"] as number;
    //     data["rows"].forEach(row => {
    //       const handle = row["party"]["members"][0]["handle"].toLowerCase();
    //       if (!handle || !cf_handle_to_id[handle]) {
    //         console.error("Corresponding id not found for handle:", handle);
    //       }

    //       let points = 0;
    //       let penalty = 0;

    //       if (env.CONSIDER_ONLINE_PENALTY) {
    //         if (!env.CUSTOM_ONLINE_PENALTY) {
    //           if (parseInt(row["penalty"]) != 0) {
    //             penalty += parseInt(row["penalty"]);
    //           }
    //           else if (parseInt(row["points"]) >= 10) {
    //             penalty -= parseInt(row["points"]);
    //           }
    //         }
    //       }

    //       row["problemResults"].forEach(({
    //         rejectedAttemptCount,
    //         bestSubmissionTimeSeconds
    //       }) => {
    //         if (bestSubmissionTimeSeconds &&
    //           parseInt(bestSubmissionTimeSeconds) <= contest_duration) {
    //           points += env.ONLINE_POINTS_WEIGHT;
    //           if (env.CONSIDER_ONLINE_PENALTY) {
    //             if (env.CUSTOM_ONLINE_PENALTY) {
    //               penalty += Math.floor(parseInt(bestSubmissionTimeSeconds) / 60);
    //               penalty += parseInt(rejectedAttemptCount) * env.ONLINE_PENALTY_PER_REJECTED_ATTEMPT;
    //             }
    //           }
    //         }
    //       });

    //       consider_score(cf_handle_to_id[handle], { points, penalty });
    //     });

    //     let min_penalty = 0;
    //     contestant_ids.forEach(id => {
    //       min_penalty = Math.min(min_penalty, contest_scores[id].penalty);
    //     });
    //     contestant_ids.forEach(id => {
    //       contest_scores[id].penalty -= min_penalty;
    //     });

    //   }
    // });
  // });
}

export { load_atcoder_contest_details, load_atcoder_contest_submissions_by_user };
