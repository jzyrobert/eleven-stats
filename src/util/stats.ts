import {
  MatchData,
  MostPlayedStatistics,
  RoundStatistics,
} from "../types/statTypes";
import _ from "lodash";
import { SAMPLE_MATCHES_TEST } from "./predator";

export function WINS(matches: Array<MatchData>) {
  // console.log(_.filter(SAMPLE_MATCHES_TEST, m => m.attributes.ranked && m.attributes["elo-change"] > 0 && m.attributes.state != 0 && m.attributes.winner < 0))
  // let discrep = 0;
  // _.reduceRight(matches, (first, second) => {
  //   const diff = (first.won ? 1 : -1) * first["elo-change"];
  //   if (first.self["match-elo"] + diff != second.self["match-elo"]) {
  //     console.log(first);
  //     console.log(second)
  //     console.log(first.self["match-elo"])
  //     console.log(diff)
  //     console.log(second.self["match-elo"])
  //     discrep += first["elo-change"]
  //   }
  //   return second;
  // });
  // console.log(discrep)
  return matches.filter((m) => m.won).length;
}

export function WINRATE(matches: Array<MatchData>) {
  return round(matches.filter((m) => m.won).length / matches.length, true);
}

export function UNIQUE_OPPONENTS(matches: Array<MatchData>) {
  const uniqueCount = _.uniqBy(matches, "opponent.id").length;
  const groupedOpponents = _.groupBy(matches, (m) => m.opponent.id);
  const neverWonCount = Object.keys(groupedOpponents).filter(
    (name) => groupedOpponents[name].filter((m) => m.won).length == 0
  ).length;
  const neverLostCount = Object.keys(groupedOpponents).filter(
    (name) => groupedOpponents[name].filter((m) => !m.won).length == 0
  ).length;
  const playedOnceCount = Object.keys(groupedOpponents).filter(
    (name) => groupedOpponents[name].length == 1
  ).length;
  const playedMoreCount = Object.keys(groupedOpponents).filter(
    (name) => groupedOpponents[name].length >= 5
  ).length;
  return {
    uniqueCount,
    neverWonCount,
    neverLostCount,
    playedOnceCount,
    playedMoreCount,
  };
}

export function AVERAGE_CHANGE(matches: Array<MatchData>) {
  return round(
    _.mean(
      matches
        .filter((m) => m["elo-change"] > 0)
        .map((m) => (m.won ? m["elo-change"] : -1 * m["elo-change"]))
    ),
    false
  );
}

export function AVERAGE_GAIN(matches: Array<MatchData>) {
  return round(
    _.mean(
      matches
        .filter((m) => m.won && m["elo-change"] > 0)
        .map((m) => m["elo-change"])
    ),
    false
  );
}

export function AVERAGE_LOSS(matches: Array<MatchData>) {
  return round(
    _.mean(
      matches
        .filter((m) => !m.won && m["elo-change"] > 0)
        .map((m) => -1 * m["elo-change"])
    ),
    false
  );
}

export function TOTAL_CHANGE(matches: Array<MatchData>) {
  return _.sum(
    matches.map((m) => (m.won ? m["elo-change"] : -1 * m["elo-change"]))
  );
}

export function TOTAL_GAIN(matches: Array<MatchData>) {
  return _.sum(matches.filter((m) => m.won).map((m) => m["elo-change"]));
}

export function TOTAL_LOSS(matches: Array<MatchData>) {
  return _.sum(matches.filter((m) => !m.won).map((m) => -1 * m["elo-change"]));
}

export function AVERAGE_ELO_MATCH(matches: Array<MatchData>) {
  return Math.round(_.mean(matches.map((m) => m.opponent["match-elo"])));
}

export function AVERAGE_ELO_DIFF_MATCH(matches: Array<MatchData>) {
  return Math.round(_.mean(matches.map((m) => m["elo-diff"])));
}

export function AVERAGE_OPPONENT_WINRATE(matches: Array<MatchData>) {
  return round(
    _.meanBy(
      matches.filter((m) => m.opponent.wins + m.opponent.losses > 0),
      (m) => m.opponent.wins / (m.opponent.wins + m.opponent.losses)
    ),
    true
  );
}

export function AVERAGE_OPPONENT_WINRATE_UNIQUE(matches: Array<MatchData>) {
  return round(
    _.meanBy(
      _.uniqBy(
        matches.filter((m) => m.opponent.wins + m.opponent.losses > 0),
        "opponent.id"
      ),
      (m) => m.opponent.wins / (m.opponent.wins + m.opponent.losses)
    ),
    true
  );
}

export function AVERAGE_ELO_NOW(matches: Array<MatchData>) {
  return Math.round(_.mean(matches.map((m) => m.opponent["current-elo"])));
}

export function AVERAGE_ELO_DIFF_UNIQUE(matches: Array<MatchData>) {
  return Math.round(
    _.mean(_.uniqBy(matches, "opponent.id").map((m) => m["elo-diff-now"]))
  );
}

export function AVERAGE_ELO_UNIQUE(matches: Array<MatchData>) {
  return Math.round(
    _.mean(
      _.uniqBy(matches, "opponent.id").map((m) => m.opponent["current-elo"])
    )
  );
}

export function HIGHEST_MATCH(matches: Array<MatchData>) {
  const maxMatch = _.maxBy(matches, "opponent.match-elo")!;
  const firstMatch = _.findLast(
    matches,
    (m) => m.opponent.id == maxMatch?.opponent.id
  )!;
  return {
    last: maxMatch,
    first: firstMatch,
  };
}

export function HIGHEST_NOW(matches: Array<MatchData>) {
  const maxMatch = _.maxBy(matches, "opponent.current-elo")!;
  const firstMatch = _.findLast(
    matches,
    (m) => m.opponent.id == maxMatch?.opponent.id
  )!;
  return {
    last: maxMatch,
    first: firstMatch,
  };
}

export function LOWEST_MATCH(matches: Array<MatchData>) {
  return _.minBy(matches, "opponent.match-elo");
}

export function LOWEST_NOW(matches: Array<MatchData>) {
  return _.minBy(matches, "opponent.current-elo");
}

export function MOST_IMPROVED(matches: Array<MatchData>) {
  const mostImproved = _.maxBy(matches, "opponent.elo-gain")!;
  const mostRecentGame = matches.find(
    (m) => m.id != mostImproved.id && m.opponent.id === mostImproved.opponent.id
  );
  return {
    firstGame: mostImproved,
    lastGame: mostRecentGame,
  };
}

export function LEAST_IMPROVED(matches: Array<MatchData>) {
  return _.minBy(
    matches.filter(
      (m) =>
        m.opponent["elo-gain"] <= 0 &&
        m.opponent["current-elo"] > 0 &&
        m.opponent["current-elo"] != 1500
    ),
    "opponent.elo-gain"
  );
}

export function MATCHES_DAY(matches: Array<MatchData>) {
  const dayCounts = _.reduce(
    matches,
    (dict, match) => {
      const date = match.date.toDateString();
      if (!(date in dict)) {
        dict[date] = 0;
      }
      dict[date]++;
      return dict;
    },
    {} as { [date: string]: number }
  );
  const maxDate = _.maxBy(Object.keys(dayCounts), (d) => dayCounts[d]);
  const maxDateMatches = matches.filter(
    (m) => m.date.toDateString() == maxDate
  );
  const maxDateNet = _.sumBy(maxDateMatches, (m) =>
    m.won ? m["elo-change"] : -1 * m["elo-change"]
  );
  const maxDateWins = _.sumBy(maxDateMatches, "won");
  const maxDateStart =
    maxDateMatches[maxDateMatches.length - 1].self["match-elo"];
  const maxDateEnd =
    maxDateMatches[0].self["match-elo"] +
    (maxDateMatches[0].won
      ? maxDateMatches[0]["elo-change"]
      : -1 * maxDateMatches[0]["elo-change"]);
  const average = round(_.mean(Object.values(dayCounts)), false);
  return {
    average,
    max: dayCounts[maxDate!],
    maxDate: new Date(maxDate!),
    maxDateElo: maxDateNet,
    maxDateWins,
    maxDateStart,
    maxDateEnd,
  };
}

export function MOST_ELO_GAINED_LOST(matches: Array<MatchData>) {
  const gainCounts = _.reduce(
    matches,
    (dict, match) => {
      if (!(match.opponent.userName in dict)) {
        dict[match.opponent.userName] = 0;
      }
      dict[match.opponent.userName] += match.won
        ? match["elo-change"]
        : -1 * match["elo-change"];
      return dict;
    },
    {} as { [name: string]: number }
  );
  const maxName = _.maxBy(Object.keys(gainCounts), (id) => gainCounts[id])!;
  const maxGain = gainCounts[maxName];
  const maxId = _.find(matches, (m) => m.opponent.userName == maxName)!.opponent
    .id;

  const minName = _.minBy(Object.keys(gainCounts), (id) => gainCounts[id])!;
  const minGain = gainCounts[minName];
  const minId = _.find(matches, (m) => m.opponent.userName == minName)!.opponent
    .id;

  return {
    maxName,
    maxId,
    maxGain,
    minName,
    minId,
    minGain,
  };
}

export function MOST_PLAYED(matches: Array<MatchData>): MostPlayedStatistics {
  const groupedMatches = _.groupBy(matches, (m) => m.opponent.userName);
  const mostPlayed = _.maxBy(
    Object.keys(groupedMatches),
    (name) => groupedMatches[name].length
  )!;
  const mostPlayedData = groupedMatches[mostPlayed];
  const mostWon = _.maxBy(
    Object.keys(groupedMatches),
    (name) => groupedMatches[name].filter((m) => m.won).length
  )!;
  const mostWonData = groupedMatches[mostWon];
  const mostLost = _.maxBy(
    Object.keys(groupedMatches),
    (name) => groupedMatches[name].filter((m) => !m.won).length
  )!;
  const mostLostData = groupedMatches[mostLost];

  return {
    mostPlayed,
    mostPlayedGames: mostPlayedData.length,
    mostPlayedWon: mostPlayedData.filter((m) => m.won).length,
    mostPlayedData,
    mostPlayedEloChange: _.sumBy(
      mostPlayedData,
      (m) => (m.won ? 1 : -1) * m["elo-change"]
    ),
    mostWon,
    mostWonGames: mostWonData.length,
    mostWonWon: mostWonData.filter((m) => m.won).length,
    mostWonData,
    mostWonEloChange: _.sumBy(
      mostWonData,
      (m) => (m.won ? 1 : -1) * m["elo-change"]
    ),
    mostLost,
    mostLostGames: mostLostData.length,
    mostLostLost: mostLostData.filter((m) => !m.won).length,
    mostLostData,
    mostLostEloChange: _.sumBy(
      mostLostData,
      (m) => (m.won ? 1 : -1) * m["elo-change"]
    ),
  };
}

export function ALL_ROUND_STATS(matches: Array<MatchData>): RoundStatistics {
  const roundCount = _.sumBy(matches, (m) => m.rounds.length);
  const rounds = matches
    .flatMap((m) => m.rounds)
    .filter(
      (r) =>
        r["self-score"] == 11 ||
        r["opponent-score"] == 11 ||
        Math.abs(r["self-score"] - r["opponent-score"]) == 2
    );
  const roundsToOvertime = rounds.filter(
    (r) => r["self-score"] >= 12 || r["opponent-score"] >= 12
  );
  const matchesFirstRoundWon = matches.filter(
    (m) => m.rounds.length > 1 && m.rounds[0].won
  );
  const matchesFirstRoundLost = matches.filter(
    (m) => m.rounds.length > 1 && !m.rounds[0].won
  );
  const matchesTo3 = matches.filter((m) => m.rounds.length > 2);
  const matchesTo2 = matches.filter((m) => m.rounds.length <= 2);
  const statistics: RoundStatistics = {
    matchesTo3: round(matchesTo3.length / matches.length, true),
    matchesTo3Won: round(
      matchesTo3.filter((m) => m.won).length / matchesTo3.length,
      true
    ),
    roundsToOvertime: round(roundsToOvertime.length / roundCount, true),
    roundsToOvertimeWon: round(
      roundsToOvertime.filter((r) => r.won).length / roundsToOvertime.length,
      true
    ),
    matchesTo2Won: round(
      matchesTo2.filter((m) => m.won).length / matchesTo2.length,
      true
    ),
    hardWonRounds: rounds.filter((r) => r["opponent-score"] == 0).length,
    hardWonRoundsPercentage: round(
      rounds.filter((r) => r["opponent-score"] == 0).length / rounds.length,
      true
    ),
    hardLostRounds: rounds.filter((r) => r["self-score"] == 0).length,
    hardLostRoundsPercentage: round(
      rounds.filter((r) => r["self-score"] == 0).length / rounds.length,
      true
    ),
    longestRoundWon: _.maxBy(
      rounds.filter((r) => r.won),
      (r) => r["self-score"] + r["opponent-score"]
    )!,
    longestRoundLost: _.maxBy(
      rounds.filter((r) => !r.won),
      (r) => r["self-score"] + r["opponent-score"]
    )!,
    matchesFirstRoundWon: round(
      matchesFirstRoundWon.filter((m) => m.won && m.rounds.length == 2).length /
        matchesFirstRoundWon.length,
      true
    ),
    matchesFirstRoundLost: round(
      matchesFirstRoundLost.filter((m) => m.won).length /
        matchesFirstRoundLost.length,
      true
    ),
  };
  // console.log(matchesFirstRoundLost.filter((m) => m.won))
  // console.log(matchesFirstRoundLost)
  // console.log(matchesTo3)
  return statistics;
}

// export const ALL_STATS = {
//   WINS: (matches: Array<MatchData>) => {
//     return matches.filter((m) => m.won).length;
//   },
//   WINRATE: (matches: Array<MatchData>) => {
//     return round(matches.filter((m) => m.won).length / matches.length, true);
//   },
//   AVERAGE_CHANGE: (matches: Array<MatchData>) => {
//     return round(
//       _.mean(
//         matches.map((m) => (m.won ? m["elo-change"] : -1 * m["elo-change"]))
//       ),
//       false
//     );
//   },
//   AVERAGE_GAIN: (matches: Array<MatchData>) => {
//     return round(
//       _.mean(matches.filter((m) => m.won).map((m) => m["elo-change"])),
//       false
//     );
//   },
//   AVERAGE_LOSS: (matches: Array<MatchData>) => {
//     return round(
//       _.mean(matches.filter((m) => !m.won).map((m) => -1 * m["elo-change"])),
//       false
//     );
//   },
//   TOTAL_CHANGE: (matches: Array<MatchData>) => {
//     return _.sum(
//       matches.map((m) => (m.won ? m["elo-change"] : -1 * m["elo-change"]))
//     );
//   },
//   TOTAL_GAIN: (matches: Array<MatchData>) => {
//     return _.sum(matches.filter((m) => m.won).map((m) => m["elo-change"]));
//   },
//   TOTAL_LOSS: (matches: Array<MatchData>) => {
//     return _.sum(
//       matches.filter((m) => !m.won).map((m) => -1 * m["elo-change"])
//     );
//   },
//   AVERAGE_ELO_MATCH: (matches: Array<MatchData>) => {
//     return Math.round(_.mean(matches.map((m) => m.opponent["match-elo"])));
//   },
//   AVERAGE_ELO_NOW: (matches: Array<MatchData>) => {
//     return Math.round(_.mean(matches.map((m) => m.opponent["current-elo"])));
//   },
//   AVERAGE_ELO_UNIQUE: (matches: Array<MatchData>) => {
//     return Math.round(
//       _.mean(
//         _.uniqBy(matches, "opponent.id").map((m) => m.opponent["current-elo"])
//       )
//     );
//   },
// };

function round(num: number, percentage: boolean) {
  if (percentage) {
    return (Math.round(num * 1000) / 10).toFixed(1);
  } else {
    return (Math.round(num * 10) / 10).toFixed(1);
  }
}
