export function evaluateGuess(secret: string, guess: string): { bulls: number; cows: number } {
  const secretChars = [...secret.toLowerCase()];
  const guessChars = [...guess.toLowerCase()];

  const bulls = guessChars.filter((char, i) => char === secretChars[i]).length;

  const secretDigits = new Set(secretChars);
  const common = guessChars.filter((char) => secretDigits.has(char)).length;
  const cows = common - bulls;

  return { bulls, cows };
}
