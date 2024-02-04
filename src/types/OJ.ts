const enum OJ {
  vj = 'VJ',
  cf = 'CF',
  ac = 'AC',
};

type OJ_Key = keyof typeof OJ;

export { OJ, OJ_Key };
