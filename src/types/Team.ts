import Individual from "./Individual";

interface Team {
  id: string;
  name: string;
  cf?: string;
  ac?: string;
  vj?: string;
  members: Array<Individual>;
}

export default Team;
