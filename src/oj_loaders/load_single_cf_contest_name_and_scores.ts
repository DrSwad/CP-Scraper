/// <reference path="../types/codeforces-api.d.ts" />

import Contestant from '../types/Contestant.js';
import Score from '../types/Score.js';

import { env } from '../env.js';

import cf from 'codeforces-api';

async function load_single_cf_contest_name_and_scores(contest_id: string, contestant_ids: Array<string>, contestant_details: { [id: string]: Contestant }) {
  cf.setApis(env.CF_API_KEY, env.CF_API_SECRET);

  const cf_handles_array: Array<string> = [];
  const cf_handle_to_id: { [handle: string]: string } = {};
  contestant_ids.forEach(id => {
    let handle_found = false;
    contestant_details?.[id]?.cf?.split(",").forEach(cf_handle => {
      cf_handle = cf_handle.trim().toLowerCase();
      cf_handles_array.push(cf_handle);
      cf_handle_to_id[cf_handle] = id;
      handle_found = true;
    })
    if (!handle_found) console.error("Missing CF handle for ", id);
  });

  const contest_scores: { [id: string]: Score } = {};
  contestant_ids.forEach(id => {
    contest_scores[id] = {
      points: 0,
      penalty: 0,
    };
  });

  const consider_score = (id: string, score: Score) => {
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

  return new Promise((
    resolve: (args: {
      contest_name: string;
      contest_scores: { [id: string]: Score };
    }) => void,
    reject: (args: {
      contest_name: string;
      contest_scores: { [id: string]: Score };
    }) => void
  ) => {
    cf.contest.standings({
      contestId: contest_id,
      handles: cf_handles_array,
      showUnofficial: true
    } as any, function (err, data) {
      if (err) {
        console.error("Failed to retrieve CF contest " + contest_id + " standings.", err);
        reject({ contest_name: "", contest_scores: {} });
      }
      else {
        const contest_name = data["contest"]["name"];
        const contest_duration = (data["contest"] as any)["durationSeconds"] as number;
        data["rows"].forEach(row => {
          const handle = row["party"]["members"][0]["handle"].toLowerCase();
          if (!handle || !cf_handle_to_id[handle]) {
            console.error("Corresponding id not found for handle:", handle);
          }

          let points = 0;
          let penalty = 0;

          if (env.CONSIDER_ONLINE_PENALTY) {
            if (!env.CUSTOM_ONLINE_PENALTY) {
              if (parseInt(row["penalty"]) != 0) {
                penalty += parseInt(row["penalty"]);
              }
              else if (parseInt(row["points"]) >= 10) {
                penalty -= parseInt(row["points"]);
              }
            }
          }

          row["problemResults"].forEach(({
            rejectedAttemptCount,
            bestSubmissionTimeSeconds
          }) => {
            if (bestSubmissionTimeSeconds &&
              parseInt(bestSubmissionTimeSeconds) <= contest_duration) {
              points += env.CF_PROBLEM_WEIGHT;
              if (env.CONSIDER_ONLINE_PENALTY) {
                if (env.CUSTOM_ONLINE_PENALTY) {
                  penalty += Math.floor(parseInt(bestSubmissionTimeSeconds) / 60);
                  penalty += parseInt(rejectedAttemptCount) * env.ONLINE_PENALTY_PER_REJECTED_ATTEMPT;
                }
              }
            }
          });

          consider_score(cf_handle_to_id[handle], { points, penalty });
        });

        let min_penalty = 0;
        contestant_ids.forEach(id => {
          min_penalty = Math.min(min_penalty, contest_scores[id].penalty);
        });
        contestant_ids.forEach(id => {
          contest_scores[id].penalty -= min_penalty;
        });

        resolve({ contest_name, contest_scores });
      }
    });
  });
}

export default load_single_cf_contest_name_and_scores;
