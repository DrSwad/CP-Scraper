import Contestant from '../types/Contestant.js';
import Score from '../types/Score.js';

import { env } from '../env.js';

import axios from 'axios';

async function load_single_vj_contest_name_and_scores(contest_id: string, contestant_ids: Array<string>, contestant_details: { [id: string]: Contestant }) :
  Promise<{
    contest_name: string;
    contest_scores: { [id: string]: Score };
  }> {
  const vj_handles_array: Array<string> = [];
  const vj_handle_to_id: { [handle: string]: string } = {};
  contestant_ids.forEach(id => {
    if (!contestant_details?.[id]?.vj) {
      console.error("Missing VJ handle for ", id);
    }
    else {
      contestant_details?.[id]?.vj?.split(",").forEach(vj_handle => {
      vj_handle = vj_handle.trim().toLowerCase();
      vj_handles_array.push(vj_handle);
      vj_handle_to_id[vj_handle] = id;
    });
    }
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

  try {
    let response = await axios.get('https://vjudge.net/contest/rank/single/' + contest_id, { headers: { 'cookie': 'JSESSIONID=' + env.VJ_JSESSIONID_COOKIE } });
    const { title: contest_name, length: duration_ms, participants, submissions } = response.data;
    const duration_s = parseInt(duration_ms) / 1000;
    const vj_id_to_handle: { [id: string]: string } = {};
    for (const participant_id in participants) {
      vj_id_to_handle[participant_id] = participants[participant_id][0].toLowerCase();
    }

    const participant_status: {
      [handle: string]: {
        [problem: number]: {
          solved: boolean;
          penalty: number;
        };
      }
    } = {};

    submissions.sort((submission1: Array<string>, submission2: Array<string>) => {
      const time_s1 = parseInt(submission1[3]);
      const time_s2 = parseInt(submission2[3]);
      return time_s1 - time_s2;
    });

    submissions.forEach((submission: Array<string>) => {
      const time_s = parseInt(submission[3]);
      if (time_s > duration_s) return;
      const handle = vj_id_to_handle[parseInt(submission[0])];
      const problem = parseInt(submission[1]);
      const status = parseInt(submission[2]);

      if (!participant_status[handle]) {
        participant_status[handle] = {};
      }

      if (!participant_status[handle][problem]) {
        participant_status[handle][problem] = {
          solved: false,
          penalty: 0
        };
      }

      if (!participant_status[handle][problem].solved) {
        if (status) {
          participant_status[handle][problem].solved = true;
          if (env.CONSIDER_ONSITE_PENALTY) {
            participant_status[handle][problem].penalty += time_s;
          }
        }
        else {
          if (env.CONSIDER_ONSITE_PENALTY) {
            participant_status[handle][problem].penalty += env.ONSITE_PENALTY_PER_REJECTED_ATTEMPT * 60;
          }
        }
      }
    });

    for (const handle in participant_status) {
      if (!vj_handles_array.includes(handle)) {
        console.error("Unrecognized participant " + handle + " in VJudge contest " + contest_name);
      }
    }

    vj_handles_array.forEach(handle => {
      handle = handle.toLowerCase();
      if (participant_status[handle]) {
        const participant_score = {
          points: 0,
          penalty: 0
        };
        for (const problem in participant_status[handle]) {
          if (participant_status[handle][problem].solved) {
            participant_score.points += env.ONSITE_PROBLEM_WEIGHT;
            participant_score.penalty += participant_status[handle][problem].penalty;
          }
        }
        participant_score.penalty = Math.floor(participant_score.penalty / 60);
        consider_score(vj_handle_to_id[handle], participant_score);
      }
    });

    return { contest_name, contest_scores };
  }
  catch (err) {
    console.error("Failed to retrieve VJudge round " + contest_id + " standings.", err);
    return { contest_name: "", contest_scores: {} };
  }
}

export default load_single_vj_contest_name_and_scores;
