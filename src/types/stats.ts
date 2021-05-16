export const enum Ranked {
  All = "all",
  Ranked = "ranked",
  Unranked = "unranked",
}

export const enum Home {
    All = "all",
    Home = "home",
    Away = "away"
}

export const enum Higher {
    All = "all",
    Higher = "higher",
    Lower = "lower"
}
//Example match data
// {
//     "id": "8128594",
//     "type": "matches",
//     "attributes": {
//         "ranked": true,
//         "number-of-rounds": 3,
//         "state": 1,
//         "winner": 0,
//         "home-score": 0,
//         "away-score": 0,
//         "home-user-id": 323214,
//         "away-user-id": 68225,
//         "created-at": "2021-05-12T10:07:41.634Z",
//         "home-team": [
//             {
//                 "id": 323214,
//                 "UserName": "Whirligig",
//                 "ELO": 1859.8,
//                 "Rank": 3663,
//                 "Wins": 813,
//                 "Losses": 706,
//                 "LastOnline": "2021-05-13T22:35:49.709Z"
//             }
//         ],
//         "away-team": [
//             {
//                 "id": 68225,
//                 "UserName": "RobGB",
//                 "ELO": 1895.1,
//                 "Rank": 3076,
//                 "Wins": 108,
//                 "Losses": 66,
//                 "LastOnline": "2021-05-12T10:14:13.826Z"
//             }
//         ],
//         "elo-change": 20.0,
//         "home-elo": 1804.2,
//         "away-elo": 1915.1
//     },
//     "relationships": {
//         "rounds": {
//             "data": [
//                 {
//                     "id": "18212478",
//                     "type": "rounds"
//                 },
//                 {
//                     "id": "18212417",
//                     "type": "rounds"
//                 },
//                 {
//                     "id": "18212353",
//                     "type": "rounds"
//                 }
//             ]
//         }
//     }
// }
export interface RawMatchData {
  id: string;
  type: string;
  attributes: RawMatchAttr;
  relationships: RawMatchRel;
}

interface RawMatchAttr {
  ranked: boolean;
  "number-of-rounds": number;
  state: number;
  winner: number;
  "home-score": number;
  "away-score": number;
  "home-user-id": number;
  "away-user-id": number;
  "created-at": string;
  "home-team": Array<RawPlayer>;
  "away-team": Array<RawPlayer>;
  "elo-change": number;
  "home-elo": number;
  "away-elo": number;
}

interface RawPlayer {
  id: number;
  UserName: string;
  ELO: number;
  Rank: number;
  Wins: number;
  Losses: number;
  LastOnline: string;
}

interface RawMatchRel {
  rounds: {
    data: Array<RawRoundID>;
  };
}

interface RawRoundID {
  id: string;
  type: string;
}

// Example round data
// {
//     "id": "18212478",
//     "type": "rounds",
//     "attributes": {
//         "id": 18212478,
//         "away-score": 11,
//         "home-score": 13,
//         "match-id": 8128594,
//         "round-number": 0,
//         "state": 0,
//         "winner": -1,
//         "created-at": "2021-05-12T10:11:50.722Z"
//     }
// }
export interface RawRoundData {
  id: string;
  type: string;
  attributes: {
    id: number;
    "away-score": number;
    "home-score": number;
    "match-id": number;
    "round-number": number;
    state: number;
    winner: number;
    "created-at": string;
  };
}

export interface MatchData {
  id: string;
  ranked: boolean;
  home: boolean;
  won: boolean;
  complete: boolean;
  self: PlayerData;
  opponent: PlayerData;
  "elo-diff": number,
  "elo-diff-formatted": string,
  "elo-diff-now": number,
  "elo-diff-now-formatted": string,
  "elo-change": number;
  // "elo-change-corrected": number,
  // "elo-change-formatted": string,
  date: Date;
  rounds: Array<RoundData>;
}

export interface RoundData {
  id: string;
  "opponent-id": number,
  "opponent-username": string,
  "self-score": number;
  "opponent-score": number;
  "score-formatted": string,
  won: boolean;
  complete: boolean;
}

export interface PlayerData {
  id: number;
  userName: string;
  "current-elo": number;
  "match-elo": number;
  "elo-gain-corrected": number,
  "elo-gain-formatted": string,
  rank: number;
  wins: number;
  losses: number;
  lastOnline: string;
}

export interface RoundStatistics {
  matchesTo3: string,
  matchesTo3Won: string,
  roundsToOvertime: string,
  roundsToOvertimeWon: string,
  matchesTo2Won: string,
  hardWonRounds: number,
  hardWonRoundsPercentage: string,
  hardLostRounds: number,
  hardLostRoundsPercentage: string,
  longestRoundWon: RoundData,
  longestRoundLost: RoundData,
}

export interface MostPlayedStatistics {
  mostPlayed: string,
  mostPlayedGames: number,
  mostPlayedWon: number,
  mostPlayedEloChange: number,
  mostPlayedData: Array<MatchData>,
  mostWon: string,
  mostWonGames: number,
  mostWonWon: number,
  mostWonEloChange: number,
  mostWonData: Array<MatchData>,
  mostLost: string,
  mostLostGames: number,
  mostLostLost: number,
  mostLostEloChange: number,
  mostLostData: Array<MatchData>
}
