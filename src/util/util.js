import _ from "lodash";

export const ALL_STATS = {
  WINRATE: (matches) => {
    return matches.filter((m) => m.won).length;
  },
  AVERAGE_CHANGE: (matches) => {
    return _.mean(
      matches.map((m) => (m.won ? m["elo-change"] : -1 * m["elo-change"]))
    );
  },
  AVERAGE_GAIN: (matches) => {
    return _.mean(matches.filter((m) => m.won).map((m) => m["elo-change"]));
  },
  AVERAGE_LOSS: (matches) => {
    return _.mean(
      matches.filter((m) => !m.won).map((m) => -1 * m["elo-change"])
    );
  },
  TOTAL_CHANGE: (matches) => {
    return _.sum(
      matches.map((m) => (m.won ? m["elo-change"] : -1 * m["elo-change"]))
    );
  },
  TOTAL_GAIN: (matches) => {
    return _.sum(matches.filter((m) => m.won).map((m) => m["elo-change"]));
  },
  TOTAL_LOSS: (matches) => {
    return _.sum(
      matches.filter((m) => !m.won).map((m) => -1 * m["elo-change"])
    );
  },
  AVERAGE_ELO_GAME: (matches) => {
    return _.mean(matches.map((m) => m.opponent.ELO));
  },
  AVERAGE_ELO_NOW: (matches) => {
    return _.mean(
      _.uniqBy(matches, "opponent.id").map((m) => m.opponent["current-elo"])
    );
  },
};

export function round(num, percentage) {
  if (percentage) {
    return (Math.round(num * 1000) / 10).toFixed(1);
  } else {
    return (Math.round(num * 10) / 10).toFixed(1);
  }
}

export function filterMatches(matches, ranked, home, higher) {
  return matches.filter((match) => {
    if (ranked !== "all") {
      if (match.ranked !== (ranked === "ranked")) {
        return false;
      }
    }
    if (home !== "all") {
      if (match.home !== (home === "home")) {
        return false;
      }
    }
    if (higher !== "all") {
      if (higher === "higher" && match.opponent.ELO < match.self.ELO) {
        return false;
      } else if (higher === "lower" && match.opponent.ELO >= match.self.ELO) {
        return false;
      }
    }
    return true;
  });
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
export function processData(id, matches, rounds) {
  const processedMatches = [];
  const hashedRounds = Object.fromEntries(rounds.map((r) => [r["id"], r]));
  for (const match of matches) {
    const newMatch = {
      id: match.id,
      ranked: match.attributes.ranked,
      home: match.attributes["home-team"][0]["id"] == id,
      "elo-change": match.attributes["elo-change"],
      date: new Date(match.attributes["created-at"]),
      rounds: [],
    };
    if (newMatch.home) {
      newMatch.won = match.attributes["winner"] == 0;
      newMatch.self = match.attributes["home-team"][0];
      newMatch.self["current-elo"] = newMatch.self.ELO;
      newMatch.self["ELO"] = match.attributes["home-elo"];
      newMatch.opponent = match.attributes["away-team"][0];
      newMatch.opponent["current-elo"] = newMatch.opponent.ELO;
      newMatch.opponent["ELO"] = match.attributes["away-elo"];
    } else {
      newMatch.won = match.attributes["winner"] == 1;
      newMatch.self = match.attributes["away-team"][0];
      newMatch.self["current-elo"] = newMatch.self.ELO;
      newMatch.self["ELO"] = match.attributes["away-elo"];
      newMatch.opponent = match.attributes["home-team"][0];
      newMatch.opponent["current-elo"] = newMatch.opponent.ELO;
      newMatch.opponent["ELO"] = match.attributes["home-elo"];
    }
    for (const round of match.relationships.rounds.data) {
      const roundData = hashedRounds[round.id];
      const newRoundData = {
        id: roundData.id,
      };
      if (newMatch.home) {
        newRoundData["self-score"] = roundData.attributes["home-score"];
        newRoundData["opponent-score"] = roundData.attributes["away-score"];
      } else {
        newRoundData["self-score"] = roundData.attributes["away-score"];
        newRoundData["opponent-score"] = roundData.attributes["home-score"];
      }
      newRoundData["won"] =
        newRoundData["self-score"] > newRoundData["opponent-score"];
      newRoundData["complete"] =
        newRoundData["self-score"] >= 11 ||
        newRoundData["opponent-score"] >= 11;
      newMatch.rounds.push(newRoundData);
    }
    processedMatches.push(newMatch);
  }
  return processedMatches;
}
