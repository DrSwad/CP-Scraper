import load_single_cf_contest_name_and_scores from './load_single_cf_contest_name_and_scores.js';
import load_single_ac_contest_name_and_scores from './load_single_ac_contest_name_and_scores.js';
import load_single_vj_contest_name_and_scores from './load_single_vj_contest_name_and_scores.js';
async function load_multiple_contest_names_and_scores(contest_details, contestant_ids, score_overwrites, contestant_details) {
    const contest_names = {};
    const single_contest_scores = {};
    const combined_contest_scores = {};
    contestant_ids.forEach(id => { combined_contest_scores[id] = { points: 0, penalty: 0 }; });
    const oj_score_overwrites = {};
    score_overwrites.forEach(score_overwrite => {
        if (!oj_score_overwrites[score_overwrite.oj]) {
            oj_score_overwrites[score_overwrite.oj] = {};
        }
        if (!oj_score_overwrites[score_overwrite.oj][score_overwrite.contest_id])
            oj_score_overwrites[score_overwrite.oj][score_overwrite.contest_id] = {};
        oj_score_overwrites[score_overwrite.oj][score_overwrite.contest_id][score_overwrite.contestant_id] = score_overwrite.score;
    });
    for (const contest_detail of contest_details) {
        let load_single_contest_scores;
        const { oj, id: contest_id } = contest_detail;
        if (oj === "CF")
            load_single_contest_scores = load_single_cf_contest_name_and_scores(contest_id, contestant_ids, contestant_details);
        else if (oj === "AC")
            load_single_contest_scores = load_single_ac_contest_name_and_scores(contest_id, contestant_ids, contestant_details);
        else if (oj === "VJ")
            load_single_contest_scores = load_single_vj_contest_name_and_scores(contest_id, contestant_ids, contestant_details);
        else {
            throw new Error("Invalid oj: " + oj);
        }
        await load_single_contest_scores.then(({ contest_name, contest_scores }) => {
            const modded_contest_id = oj + "_" + contest_id;
            contest_names[modded_contest_id] = contest_name;
            contestant_ids.forEach(contestant_id => {
                if (oj_score_overwrites?.[oj]?.[contest_id]?.[contestant_id]) {
                    contest_scores[contestant_id].points = oj_score_overwrites[oj][contest_id][contestant_id].points;
                    contest_scores[contestant_id].penalty = oj_score_overwrites[oj][contest_id][contestant_id].penalty;
                }
                combined_contest_scores[contestant_id].points += contest_scores[contestant_id].points;
                combined_contest_scores[contestant_id].penalty += contest_scores[contestant_id].penalty;
            });
            single_contest_scores[modded_contest_id] = contest_scores;
        });
    }
    return { contest_names, single_contest_scores, combined_contest_scores };
}
export default load_multiple_contest_names_and_scores;
