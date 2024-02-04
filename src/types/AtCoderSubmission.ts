interface AtCoderSubmission {
  id: number,
  epoch_second: number,
  problem_id: string,
  contest_id: string,
  user_id: string,
  language: string,
  point: number,
  length: number,
  result: "AC" | "WA" | "TLE" | "MLE" | "RE" | "CE" | "QLE" | "OLE" | "IE" | "WJ" | "WR" | "Judging",
  execution_time: number,
}

export default AtCoderSubmission;
