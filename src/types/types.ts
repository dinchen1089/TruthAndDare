
export interface Player {
  id: string;
  name: string;
  color: string;
}

export enum GamePhase {
  SETUP = 'SETUP',
  READY = 'READY',
  SPINNING = 'SPINNING',
  RESULT = 'RESULT',
  CHALLENGE_SELECTION = 'CHALLENGE_SELECTION',
  CHALLENGE_ACTIVE = 'CHALLENGE_ACTIVE',
}

export enum ChallengeType {
  TRUTH = 'TRUTH',
  DARE = 'DARE',
}

export interface Challenge {
  type: ChallengeType;
  text: string;
  isAiGenerated: boolean;
}
