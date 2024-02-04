declare module 'codeforces-api' {
  export function setApis(
    CF_API_KEY: string,
    CF_API_SECRET: string
  ): void;

  export var contest: {
    standings(
      args: {
        contestId: string,
        handles: Array<string>
      },
      callback: (err: Error, data: {
        contest: {
          name: string;
        };
        rows: Array<{
          points: string,
          penalty: string,
          party: {
            members: Array<{
              handle: string
            }>
          };
          problemResults: Array<{
            rejectedAttemptCount: string;
            bestSubmissionTimeSeconds: string;
          }>;
        }>
      }) => void
    ): void;
  };
}
