export function calculateNetScore(correctCount: number, wrongCount: number, penaltyDivisor: number = 4): number {
 return Math.max(0, correctCount - wrongCount / penaltyDivisor);
}
