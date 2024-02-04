import Score from "./Score";
import { OJ } from "./OJ";

interface ScoreOverwrite {
  contestant_id: string;
  oj: OJ;
  contest_id: string;
  score: Score;
}

export default ScoreOverwrite;
