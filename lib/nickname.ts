const ADJECTIVES = [
  '포근한',
  '몽글몽글',
  '느긋한',
  '보드라운',
  '아늑한',
  '소복한',
  '도톰한',
  '뭉실뭉실',
  '폭신한',
  '나른한',
  '반짝이는',
  '차분한',
];

const NOUNS = [
  '실타래',
  '목도리',
  '뜨개인',
  '코바늘',
  '대바늘',
  '실뭉치',
  '겉뜨기',
  '안뜨기',
  '양모',
  '앙고라',
  '가터뜨기',
  '니터',
];

/**
 * Random example nickname with a number suffix so the placeholder differs
 * every visit — copying the example verbatim no longer creates duplicates.
 */
export function suggestNickname(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 99) + 1;
  return `${adj} ${noun} ${num}`;
}
