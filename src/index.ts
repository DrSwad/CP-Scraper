import { env, loadEnv } from './env.js';
loadEnv();

import Score from './types/Score.js';
import Team from './types/Team.js';

import load_contestants from './file_io/load_contestants.js';
const { contestant_ids, contestant_details } = await load_contestants();

const contestant_scores : { [id: string]: Score } = {};
const contestant_effective_scores : { [id: string]: Score } = {};
contestant_ids.forEach(contestant_id => {
  contestant_scores[contestant_id] = {
    points: 0,
    penalty: 0,
  };
  contestant_effective_scores[contestant_id] = {
    points: 0,
    penalty: 0,
  };
});

import load_contests from './file_io/load_contests.js';
const contest_details = await load_contests();

import load_score_overwrites from './file_io/load_score_overwrites.js';
const score_overwrites = await load_score_overwrites();

import load_multiple_contest_names_and_scores from './oj_loaders/load_multiple_contest_names_and_scores.js';
const { contest_names, single_contest_scores, combined_contest_scores } = await load_multiple_contest_names_and_scores(contest_details, contestant_ids, score_overwrites, contestant_details);
contestant_ids.forEach(id => {
  contestant_scores[id].points += combined_contest_scores[id].points;
  contestant_scores[id].penalty += combined_contest_scores[id].penalty;
});

import load_effective_scores from './oj_loaders/load_effective_scores.js';
const { effective_scores } = await load_effective_scores(contest_details, contestant_ids, contestant_scores, single_contest_scores);
contestant_ids.forEach(id => {
  contestant_effective_scores[id].points += effective_scores[id].points;
  contestant_effective_scores[id].penalty += effective_scores[id].penalty;
});

const compare_scores_descending = (score1 : Score, score2 : Score) => {
  if (score1.points > score2.points) return true;
  else if (score1.points < score2.points) return false;
  else if (score1.penalty < score2.penalty) return true;
  else return false;
};

contestant_ids.sort((id1, id2) => {
  // if (contestant_details[id1].name == contestant_details[id2].name) return 0;
  // return contestant_details[id1].name < contestant_details[id2].name ? -1 : 1;
  if (compare_scores_descending(effective_scores[id1], effective_scores[id2])) return -1;
  else if (compare_scores_descending(effective_scores[id2], effective_scores[id1])) return 1;
  else return 0;
});

const output_data = [];

const header_row = ['Rank'];
if (env.CONTEST_TYPE === "team") {
  header_row.push('Team');
  header_row.push('Members');
}
else {
  header_row.push('Name');
}
header_row.push('Score');
header_row.push('Effective Score');
contest_details.forEach(contest => header_row.push(contest_names[contest.oj + "_" + contest.id]));
output_data.push(header_row);

let current_rank = 0
let previous_score = { points: -1, penalty: 0 }

contestant_ids.forEach((contestant_id, index) => {
  if (compare_scores_descending(effective_scores[contestant_id], previous_score) ||
      compare_scores_descending(previous_score, effective_scores[contestant_id])) {
    current_rank++;
  }
  previous_score = effective_scores[contestant_id];

  const contestant = contestant_details[contestant_id] as Team;
  const top_row: Array<string> = [];
  top_row.push(current_rank.toString());
  top_row.push(contestant.name);
  if (env.CONTEST_TYPE === "team") {
    top_row.push(contestant.members[0].name);
  }
  top_row.push("Solved = " + contestant_scores[contestant_id].points / env.WEIGHT_SCALE);
  top_row.push("Solved = " + effective_scores[contestant_id].points / env.WEIGHT_SCALE);
  contest_details.forEach((contest => {
    const { oj, id: contest_id } = contest;
    const modded_contest_id = oj + "_" + contest_id;
    top_row.push("Solved = " + single_contest_scores[modded_contest_id][contestant_id].points / env.WEIGHT_SCALE);
  }));
  output_data.push(top_row);

  if (env.CONTEST_TYPE === "team") {
    contestant.members.splice(1).forEach((member, index) => {
      const new_row: Array<string> = [];

      new_row.push(""); // Rank
      new_row.push(""); // Team name
      new_row.push(member.name);
      if (index == 0) new_row.push("Penalty = " + contestant_scores[contestant_id].penalty); // Combined score
      else new_row.push(""); // Combined score
      if (index == 0) new_row.push("Penalty = " + effective_scores[contestant_id].penalty); // Effective score
      else new_row.push(""); // Effective score
      contest_details.forEach((contest => {
        if (index == 0) {
          const { oj, id: contest_id } = contest;
          const modded_contest_id = oj + "_" + contest_id;
          new_row.push("Penalty = " + single_contest_scores[modded_contest_id][contestant_id].penalty); // Contest score
        }
        else {
          new_row.push(""); // Contest score
        }
      }));

      output_data.push(new_row);
    });
  }
  else {
    const new_row: Array<string> = [];

    new_row.push(""); // Rank
    new_row.push(""); // Name
    new_row.push("Penalty = " + contestant_scores[contestant_id].penalty); // Combined score
    new_row.push("Penalty = " + effective_scores[contestant_id].penalty); // Effective score
    contest_details.forEach((contest => {
      const { oj, id: contest_id } = contest;
      const modded_contest_id = oj + "_" + contest_id;
      new_row.push("Penalty = " + single_contest_scores[modded_contest_id][contestant_id].penalty); // Contest score
    }));

    output_data.push(new_row);
  }
});

import write_data from './file_io/write_data.js';
await write_data(output_data);
