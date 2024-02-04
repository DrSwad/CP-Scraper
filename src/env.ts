import { EnvType, load } from 'ts-dotenv';

export type Env = EnvType<typeof schema>;

export const schema = {
  NODE_ENV: ['production' as const, 'development' as const],
  INPUT_FILE_NAME: String,
  OUTPUT_FILE_NAME: String,
  CONTESTS_FILE_NAME: String,
  CF_HANDLE_REMAPS_FILE_NAME: String,
  SCORE_OVERWRITES_FILE_NAME: String,
  CONTEST_TYPE: ['team' as const, 'individual' as const],
  CF_API_KEY: String,
  CF_API_SECRET: String,
  VJ_JSESSIONID_COOKIE: String,
  ID_COLUMN_NAME: String,
  NAME_COLUMN_NAME: String,
  CF_COLUMN_NAME: {
    type: String,
    default: '',
  },
  AC_COLUMN_NAME: {
    type: String,
    default: '',
  },
  VJ_COLUMN_NAME: {
    type: String,
    default: '',
  },
  MEMBERS_COLUMN_NAME: {
    type: String,
    default: '',
  },
  CONSIDER_ONSITE_PENALTY: Boolean,
  CONSIDER_ONLINE_PENALTY: Boolean,
  CUSTOM_ONLINE_PENALTY: Boolean,
  ONSITE_PENALTY_PER_REJECTED_ATTEMPT: Number,
  ONLINE_PENALTY_PER_REJECTED_ATTEMPT: Number,
  REMOVE_WORST_PERFORMANCE: [
    'no' as const,
    'online' as const,
    'onsite' as const,
    'combined' as const,
    'separately' as const
  ],
  NUMBER_OF_WORST_PERFORMANCE_REMOVAL: Number,
  ONSITE_PROBLEM_WEIGHT: Number,
  CF_PROBLEM_WEIGHT: Number,
  AC_PROBLEM_WEIGHT: Number,
  WEIGHT_SCALE: Number,
};

export let env: Env;

export function loadEnv(): void {
  env = load(schema);
}
