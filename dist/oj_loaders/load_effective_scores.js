import { env } from '../env.js';
const compare_scores_ascending = (score1, score2) => {
    if (score1.points < score2.points)
        return true;
    else if (score1.points > score2.points)
        return false;
    else if (score1.penalty > score2.penalty)
        return true;
    else
        return false;
};
async function load_effective_scores(contest_details, contestant_ids, contestant_scores, single_contest_scores) {
    const effective_scores = {};
    contestant_ids.forEach(id => {
        let online_sorted_scores = [];
        let onsite_sorted_scores = [];
        let combined_sorted_scores = [];
        contest_details.forEach((contest => {
            const { oj, id: contest_id } = contest;
            const modded_contest_id = oj + "_" + contest_id;
            if (oj === "VJ") {
                online_sorted_scores.push(single_contest_scores[modded_contest_id][id]);
                combined_sorted_scores.push(single_contest_scores[modded_contest_id][id]);
            }
            else {
                onsite_sorted_scores.push(single_contest_scores[modded_contest_id][id]);
                combined_sorted_scores.push(single_contest_scores[modded_contest_id][id]);
            }
        }));
        onsite_sorted_scores.sort((score1, score2) => {
            if (compare_scores_ascending(score1, score2))
                return -1;
            else if (compare_scores_ascending(score2, score1))
                return 1;
            else
                return 0;
        });
        online_sorted_scores.sort((score1, score2) => {
            if (compare_scores_ascending(score1, score2))
                return -1;
            else if (compare_scores_ascending(score2, score1))
                return 1;
            else
                return 0;
        });
        combined_sorted_scores.sort((score1, score2) => {
            if (compare_scores_ascending(score1, score2))
                return -1;
            else if (compare_scores_ascending(score2, score1))
                return 1;
            else
                return 0;
        });
        let points = contestant_scores[id].points;
        let penalty = contestant_scores[id].penalty;
        if (env.REMOVE_WORST_PERFORMANCE === "onsite" ||
            env.REMOVE_WORST_PERFORMANCE === "separately") {
            for (let i = 0; i < Math.min(onsite_sorted_scores.length, env.NUMBER_OF_WORST_PERFORMANCE_REMOVAL); i++) {
                points -= onsite_sorted_scores[i].points;
                penalty -= onsite_sorted_scores[i].penalty;
            }
        }
        if (env.REMOVE_WORST_PERFORMANCE === "online" ||
            env.REMOVE_WORST_PERFORMANCE === "separately") {
            for (let i = 0; i < Math.min(online_sorted_scores.length, env.NUMBER_OF_WORST_PERFORMANCE_REMOVAL); i++) {
                points -= online_sorted_scores[i].points;
                penalty -= online_sorted_scores[i].penalty;
            }
        }
        if (env.REMOVE_WORST_PERFORMANCE === "combined") {
            for (let i = 0; i < Math.min(combined_sorted_scores.length, env.NUMBER_OF_WORST_PERFORMANCE_REMOVAL); i++) {
                points -= combined_sorted_scores[i].points;
                penalty -= combined_sorted_scores[i].penalty;
            }
        }
        effective_scores[id] = { points, penalty };
    });
    return { effective_scores };
}
export default load_effective_scores;
