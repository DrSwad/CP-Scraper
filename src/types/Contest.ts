import { OJ } from "./OJ";

interface Contest {
  oj: OJ;
  id: string;
  type: 'individual' | 'team';
}

export default Contest;
