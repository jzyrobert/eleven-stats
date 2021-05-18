import {
  DayStatistics,
  GainStatistics,
  MatchData,
  MatchDayStatistics,
  MatchStatistics,
  MatchupStatistics,
  MostPlayedStatistics,
  PlayerStatistics,
  PointStatistics,
  PointSumStatistics,
  RankedStatistics,
  RoundStatistics,
  StreakStatistics,
  UniqueOpponentStatistics,
} from "../types/statTypes";
import _ from "lodash";

// All statistics related to matches played
export function ALL_MATCH_STATS(matches: Array<MatchData>): MatchStatistics {
  return {
    played: matches.length,
    won: WINS(matches),
    winrate: WINRATE(matches),
    average_elo: AVERAGE_ELO_MATCH(matches),
    average_elo_diff: AVERAGE_ELO_DIFF_MATCH(matches),
    perDay: MATCHES_DAY_STATISTICS(matches),
    winStreak: LONGEST_WINSTREAK(matches),
    lossStreak: LONGEST_LOSSSTREAK(matches),
  };
}

// All statistics related to players, self and opponents
export function ALL_PLAYER_STATS(matches: Array<MatchData>): PlayerStatistics {
  const { most, won, lost } =
    MOST_PLAYED(matches);
  return {
    unique_opponents: UNIQUE_OPPONENTS(matches),
    unique_opponents_elo: AVERAGE_ELO_UNIQUE(matches),
    opponent_winrate: AVERAGE_OPPONENT_WINRATE(matches),
    highestElo: HIGHEST_MATCH(matches),
    highestEloNow: HIGHEST_NOW(matches),
    lowestElo: LOWEST_MATCH(matches),
    lowestEloNow: LOWEST_NOW(matches),
    mostImproved: MOST_IMPROVED(matches),
    leastImproved: LEAST_IMPROVED(matches),
    mostPlayed: most,
    mostWon: won,
    mostLost: lost,
  };
}

// All statistics relating to ELO
export function ALL_RANKED_STATS(matches: Array<MatchData>): RankedStatistics {
  const { most, least } = MOST_ELO_GAINED_LOST(matches);
  const { best, worst } = BEST_WORST_DAY(matches);
  return {
    average_change: AVERAGE_CHANGE(matches),
    average_gain: AVERAGE_GAIN(matches),
    average_loss: AVERAGE_LOSS(matches),
    total_change: TOTAL_CHANGE(matches),
    total_gain: TOTAL_GAIN(matches),
    total_loss: TOTAL_LOSS(matches),
    mostGained: most,
    mostLost: least,
    bestDay: best,
    worstDay: worst,
  };
}

// Match section

export function WINS(matches: Array<MatchData>) {
  return matches.filter((m) => m.won).length;
}

export function WINRATE(matches: Array<MatchData>) {
  return round(matches.filter((m) => m.won).length / matches.length, true);
}

export function AVERAGE_ELO_MATCH(matches: Array<MatchData>) {
  return Math.round(_.mean(matches.map((m) => m.opponent["match-elo"])));
}

export function AVERAGE_ELO_DIFF_MATCH(matches: Array<MatchData>) {
  return Math.round(_.mean(matches.map((m) => m["elo-diff"])));
}

export function MATCHES_DAY_STATISTICS(
  matches: Array<MatchData>
): MatchDayStatistics {
  const dayCounts = _.reduce(
    matches,
    (dict, match) => {
      const date = match.offsetDate.format("YYYY-MM-DD");
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
    (m) => m.offsetDate.format("YYYY-MM-DD") == maxDate
  );
  const maxNetElo = _.sumBy(maxDateMatches, (m) => m["elo-change-corrected"]);
  // const maxNetElo = _.sumBy(maxDateMatches, (m) =>
  //   m.won ? m["elo-change"] : -1 * m["elo-change"]
  // );
  const maxWins = _.sumBy(maxDateMatches, "won");
  let maxStartElo = 0;
  let maxEndElo = 0;
  if (matches.length > 0) {
    maxStartElo = maxDateMatches[maxDateMatches.length - 1].self["match-elo"];
    maxEndElo =
      maxDateMatches[0].self["match-elo"] +
      maxDateMatches[0]["elo-change-corrected"];
  }
  // const maxEndElo =
  //   maxDateMatches[0].self["match-elo"] +
  //   (maxDateMatches[0].won
  //     ? maxDateMatches[0]["elo-change"]
  //     : -1 * maxDateMatches[0]["elo-change"]);
  const average = round(_.mean(Object.values(dayCounts)), false);
  return {
    average,
    maxDate: new Date(maxDate!),
    maxPlayed: dayCounts[maxDate!],
    maxNetElo,
    maxWins,
    maxStartElo,
    maxEndElo,
  };
}

export function LONGEST_WINSTREAK(matches: Array<MatchData>): StreakStatistics {
  const sortedMatches = _.sortBy(matches, (m) => Number(m.id));
  let longestStreak: Array<MatchData> = [];
  let currentStreak: Array<MatchData> = [];
  for (const match of sortedMatches) {
    if (!match.won) {
      if (currentStreak.length > longestStreak.length) {
        longestStreak = currentStreak;
      }
      currentStreak = [];
    } else {
      currentStreak.push(match);
    }
  }
  return {
    played: longestStreak.length,
    startDate: longestStreak[0].offsetDate.startOf("day"),
    endDate: longestStreak[longestStreak.length - 1].offsetDate.startOf("day"),
    netElo: _.sumBy(longestStreak, (m) => m["elo-change-corrected"]),
    matches: longestStreak,
  };
}

export function LONGEST_LOSSSTREAK(
  matches: Array<MatchData>
): StreakStatistics {
  const sortedMatches = _.sortBy(matches, (m) => Number(m.id));
  let longestStreak: Array<MatchData> = [];
  let currentStreak: Array<MatchData> = [];
  for (const match of sortedMatches) {
    if (match.won) {
      if (currentStreak.length > longestStreak.length) {
        longestStreak = currentStreak;
      }
      currentStreak = [];
    } else {
      currentStreak.push(match);
    }
  }
  return {
    played: longestStreak.length,
    startDate: longestStreak[0].offsetDate.startOf("day"),
    endDate: longestStreak[longestStreak.length - 1].offsetDate.startOf("day"),
    netElo: _.sumBy(longestStreak, (m) => m["elo-change-corrected"]),
    matches: longestStreak,
  };
}

// Player section

export function UNIQUE_OPPONENTS(
  matches: Array<MatchData>
): UniqueOpponentStatistics {
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
    winrate: AVERAGE_OPPONENT_WINRATE_UNIQUE(matches),
    averageEloDiff: AVERAGE_ELO_DIFF_UNIQUE(matches),
    uniqueCount,
    neverWonCount,
    neverLostCount,
    playedOnceCount,
    playedMoreCount,
  };
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

export function HIGHEST_MATCH(matches: Array<MatchData>): MatchupStatistics {
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

export function HIGHEST_NOW(matches: Array<MatchData>): MatchupStatistics {
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

export function LOWEST_MATCH(matches: Array<MatchData>): MatchupStatistics {
  const lowMatch = _.minBy(matches, "opponent.match-elo")!;
  const firstMatch = _.findLast(
    matches,
    (m) => m.opponent.id == lowMatch?.opponent.id
  )!;
  return {
    last: lowMatch,
    first: firstMatch,
  };
}

export function LOWEST_NOW(matches: Array<MatchData>): MatchupStatistics {
  const lowMatch = _.minBy(matches, "opponent.current-elo")!;
  const firstMatch = _.findLast(
    matches,
    (m) => m.opponent.id == lowMatch?.opponent.id
  )!;
  return {
    last: lowMatch,
    first: firstMatch,
  };
}

export function MOST_IMPROVED(matches: Array<MatchData>): MatchupStatistics {
  const mostImproved = _.maxBy(matches, "opponent.elo-gain")!;
  const mostRecentGame = matches.find(
    (m) => m.opponent.id === mostImproved.opponent.id
  )!;
  return {
    first: mostImproved,
    last: mostRecentGame,
  };
}

export function LEAST_IMPROVED(matches: Array<MatchData>): MatchupStatistics {
  const leastImproved = _.minBy(
    matches.filter(
      (m) =>
        m.opponent["elo-gain"] <= 0 &&
        m.opponent["current-elo"] > 0 &&
        m.opponent["current-elo"] != 1500
    ),
    "opponent.elo-gain"
  )!;
  const mostRecentGame = matches.find(
    (m) => m.opponent.id === leastImproved.opponent.id
  )!;
  return {
    first: leastImproved,
    last: mostRecentGame,
  };
}

export function MOST_PLAYED(matches: Array<MatchData>): {
  most: MostPlayedStatistics;
  won: MostPlayedStatistics;
  lost: MostPlayedStatistics;
} {
  const groupedMatches = _.groupBy(matches, (m) => m.opponent.userName);
  const mostPlayedList = _.sortBy(
    Object.keys(groupedMatches),
    (n) => -1 * groupedMatches[n].length
  );
  const mostPlayedCount = mostPlayedList.map(n => groupedMatches[n].length)
  const mostPlayedWon = mostPlayedList.map(n => groupedMatches[n].filter(m => m.won).length)
  const mostPlayedLost = mostPlayedList.map(n => groupedMatches[n].filter(m => !m.won).length)
  const mostPlayed = _.maxBy(
    Object.keys(groupedMatches),
    (name) => groupedMatches[name].length
  )!;
  const mostPlayedData = groupedMatches[mostPlayed];

  const mostWonList = _.sortBy(
    Object.keys(groupedMatches),
    (n) => -1 * groupedMatches[n].filter(m => m.won).length
  );
  const mostWonCount = mostWonList.map(n => groupedMatches[n].length)
  const mostWonWon = mostWonList.map(n => groupedMatches[n].filter(m => m.won).length)
  const mostWonLost = mostWonList.map(n => groupedMatches[n].filter(m => !m.won).length)
  const mostWon = _.maxBy(
    Object.keys(groupedMatches),
    (name) => groupedMatches[name].filter((m) => m.won).length
  )!;
  const mostWonData = groupedMatches[mostWon];

  const mostLostList = _.sortBy(
    Object.keys(groupedMatches),
    (n) => -1 * groupedMatches[n].filter(m => !m.won).length
  );
  const mostLostCount = mostLostList.map(n => groupedMatches[n].length)
  const mostLostWon = mostLostList.map(n => groupedMatches[n].filter(m => m.won).length)
  const mostLostLost = mostLostList.map(n => groupedMatches[n].filter(m => !m.won).length)
  const mostLost = _.maxBy(
    Object.keys(groupedMatches),
    (name) => groupedMatches[name].filter((m) => !m.won).length
  )!;
  const mostLostData = groupedMatches[mostLost];

  return {
    most: {
      mostPlayedList,
      mostPlayedCount,
      mostPlayedWon,
      mostPlayedLost,
      username: mostPlayed,
      id: mostPlayedData[0].opponent.id,
      matches: mostPlayedData.length,
      won: mostPlayedData.filter((m) => m.won).length,
      gain: _.sumBy(mostPlayedData, (m) => m["elo-change-corrected"]),
      // gain: _.sumBy(mostPlayedData, (m) => (m.won ? 1 : -1) * m["elo-change"]),
      data: mostPlayedData,
    },
    won: {
      mostPlayedList: mostWonList,
      mostPlayedCount: mostWonCount,
      mostPlayedWon: mostWonWon,
      mostPlayedLost: mostWonLost,
      username: mostWon,
      id: mostWonData[0].opponent.id,
      matches: mostWonData.length,
      won: mostWonData.filter((m) => m.won).length,
      gain: _.sumBy(mostWonData, (m) => m["elo-change-corrected"]),
      // gain: _.sumBy(mostWonData, (m) => (m.won ? 1 : -1) * m["elo-change"]),
      data: mostWonData,
    },
    lost: {
      mostPlayedList: mostLostList,
      mostPlayedCount: mostLostCount,
      mostPlayedWon: mostLostWon,
      mostPlayedLost: mostLostLost,
      username: mostLost,
      id: mostLostData[0].opponent.id,
      matches: mostLostData.length,
      won: mostLostData.filter((m) => m.won).length,
      gain: _.sumBy(mostLostData, (m) => m["elo-change-corrected"]),
      // gain: _.sumBy(mostLostData, (m) => (m.won ? 1 : -1) * m["elo-change"]),
      data: mostLostData,
    },
  };
}

// Ranked section

export function AVERAGE_CHANGE(matches: Array<MatchData>) {
  return round(
    _.mean(
      matches.filter((m) => m.ranked).map((m) => m["elo-change-corrected"])
      // .map((m) => (m.won ? m["elo-change"] : -1 * m["elo-change"]))
    ),
    false
  );
}

export function AVERAGE_GAIN(matches: Array<MatchData>) {
  return round(
    _.mean(
      matches
        .filter((m) => m.ranked && m.won)
        .map((m) => m["elo-change-corrected"])
      // .map((m) => m["elo-change"])
    ),
    false
  );
}

export function AVERAGE_LOSS(matches: Array<MatchData>) {
  return round(
    _.mean(
      matches
        .filter((m) => m.ranked && !m.won)
        .map((m) => m["elo-change-corrected"])
      // .map((m) => -1 * m["elo-change"])
    ),
    false
  );
}

export function TOTAL_CHANGE(matches: Array<MatchData>) {
  return _.sum(
    matches.map((m) => m.ranked && m["elo-change-corrected"])
    // matches.map((m) => (m.won ? m["elo-change"] : -1 * m["elo-change"]))
  );
}

export function TOTAL_GAIN(matches: Array<MatchData>) {
  return _.sum(
    matches
      .filter((m) => m.ranked && m.won)
      .map((m) => m["elo-change-corrected"])
  );
  // return _.sum(matches.filter((m) => m.won).map((m) => m["elo-change"]));
}

export function TOTAL_LOSS(matches: Array<MatchData>) {
  return _.sum(
    matches
      .filter((m) => m.ranked && !m.won)
      .map((m) => m["elo-change-corrected"])
  );
  // return _.sum(matches.filter((m) => m.ranked && !m.won).map((m) => -1 * m["elo-change"]));
}

export function MOST_ELO_GAINED_LOST(matches: Array<MatchData>): {
  most: GainStatistics;
  least: GainStatistics;
} {
  const gainCounts = _.reduce(
    matches,
    (dict, match) => {
      if (!(match.opponent.userName in dict)) {
        dict[match.opponent.userName] = 0;
      }
      dict[match.opponent.userName] += match["elo-change-corrected"];
      // dict[match.opponent.userName] += match.won
      //   ? match["elo-change"]
      //   : -1 * match["elo-change"];
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
    most: {
      username: maxName,
      id: maxId,
      gain: maxGain,
    },
    least: {
      username: minName,
      id: minId,
      gain: minGain,
    },
  };
}

export function BEST_WORST_DAY(matches: Array<MatchData>): {
  best: DayStatistics;
  worst: DayStatistics;
} {
  let groupedMatches = _.groupBy(
    matches.filter((m) => m.ranked),
    (m) => m.offsetDate.startOf("day").format("YYYY-MM-DD")
  );
  groupedMatches = _.mapValues(groupedMatches, (matches) =>
    _.sortBy(matches, "id")
  );
  const dayGains = _.mapValues(
    groupedMatches,
    (matches) => _.sumBy(matches, (m) => m["elo-change-corrected"])
    // _.sumBy(matches, (m) => (m.won ? 1 : -1) * m["elo-change"])
  );
  const bestDay = _.maxBy(Object.keys(dayGains), (d) => dayGains[d])!;
  const bestDayLastMatch =
    groupedMatches[bestDay][groupedMatches[bestDay].length - 1];
  const bestEndElo =
    bestDayLastMatch.self["match-elo"] +
    bestDayLastMatch["elo-change-corrected"];
  // (bestDayLastMatch.won ? 1 : -1) * bestDayLastMatch["elo-change"];
  const worstDay = _.minBy(Object.keys(dayGains), (d) => dayGains[d])!;
  const worstDayLastMatch =
    groupedMatches[worstDay][groupedMatches[worstDay].length - 1];
  const worstEndElo =
    worstDayLastMatch.self["match-elo"] +
    worstDayLastMatch["elo-change-corrected"];
  // (worstDayLastMatch.won ? 1 : -1) * worstDayLastMatch["elo-change"];
  return {
    best: {
      date: groupedMatches[bestDay][0].offsetDate.startOf("day"),
      played: groupedMatches[bestDay].length,
      won: groupedMatches[bestDay].filter((m) => m.won).length,
      gain: dayGains[bestDay],
      startElo: groupedMatches[bestDay][0].self["match-elo"],
      endElo: bestEndElo,
    },
    worst: {
      date: groupedMatches[worstDay][0].offsetDate.startOf("day"),
      played: groupedMatches[worstDay].length,
      won: groupedMatches[worstDay].filter((m) => m.won).length,
      gain: dayGains[worstDay],
      startElo: groupedMatches[worstDay][0].self["match-elo"],
      endElo: worstEndElo,
    },
  };
}

// All round statistics

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
  const wonMatches = matches.filter((m) => m.won);
  const lostMatches = matches.filter((m) => !m.won);
  const wonRounds = rounds.filter((r) => r.won);
  const lostRounds = rounds.filter((r) => !r.won);
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
  return {
    roundsPlayed: rounds.length,
    roundsWon: wonRounds.length,
    roundsWinrate: wonRounds.length / roundCount,
    averageRounds: round(
      _.meanBy(matches, (m) => m.rounds.length),
      false
    ),
    averageRoundsWon: round(
      _.meanBy(wonMatches, (m) => m.rounds.length),
      false
    ),
    averageRoundsLost: round(
      _.meanBy(lostMatches, (m) => m.rounds.length),
      false
    ),
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
    incompleteRounds: rounds.filter((r) => !r.complete).length,
  };
}

export function ALL_POINT_STATS(matches: Array<MatchData>): PointStatistics {
  const wonMatches = matches.filter((m) => m.won);
  const wonMatchRounds = wonMatches.flatMap((m) => m.rounds);
  // .filter(
  //   (r) =>
  //     r["self-score"] == 11 ||
  //     r["opponent-score"] == 11 ||
  //     Math.abs(r["self-score"] - r["opponent-score"]) == 2
  // );
  const lostMatches = matches.filter((m) => !m.won);
  const lostMatchRounds = lostMatches.flatMap((m) => m.rounds);
  // .filter(
  //   (r) =>
  //     r["self-score"] == 11 ||
  //     r["opponent-score"] == 11 ||
  //     Math.abs(r["self-score"] - r["opponent-score"]) == 2
  // );
  const rounds = matches.flatMap((m) => m.rounds);
  // .filter(
  //   (r) =>
  //     r["self-score"] == 11 ||
  //     r["opponent-score"] == 11 ||
  //     Math.abs(r["self-score"] - r["opponent-score"]) == 2
  // );
  const wonRounds = rounds.filter((r) => r.won);
  const lostRounds = rounds.filter((r) => !r.won);
  const pointsPlayed = _.sumBy(
    rounds,
    (r) => r["self-score"] + r["opponent-score"]
  );
  const pointsWon = _.sumBy(rounds, (r) => r["self-score"]);
  const set: PointSumStatistics = {
    total: pointsPlayed,
    average: round(pointsPlayed / rounds.length, false),
    averageWon: round(pointsWon / rounds.length, false),
    winrate: 0,
  };
  set.winrate = round(set.averageWon / set.average, true);
  const wonSet: PointSumStatistics = {
    total: _.sumBy(wonRounds, (r) => r["self-score"] + r["opponent-score"]),
    average: round(
      _.meanBy(wonRounds, (r) => r["self-score"] + r["opponent-score"]),
      false
    ),
    averageWon: round(
      _.meanBy(wonRounds, (r) => r["self-score"]),
      false
    ),
    winrate: 0,
  };
  wonSet.winrate = round(wonSet.averageWon / wonSet.average, true);
  const lostSet: PointSumStatistics = {
    total: _.sumBy(lostRounds, (r) => r["self-score"] + r["opponent-score"]),
    average: round(
      _.meanBy(lostRounds, (r) => r["self-score"] + r["opponent-score"]),
      false
    ),
    averageWon: round(
      _.meanBy(lostRounds, (r) => r["self-score"]),
      false
    ),
    winrate: 0,
  };
  lostSet.winrate = round(lostSet.averageWon / lostSet.average, true);
  const match: PointSumStatistics = {
    total: pointsPlayed,
    average: round(pointsPlayed / matches.length, false),
    averageWon: round(pointsWon / matches.length, false),
    winrate: 0,
  };
  match.winrate = round(match.averageWon / match.average, true);
  const wonMatch: PointSumStatistics = {
    total: _.sumBy(
      wonMatchRounds,
      (r) => r["self-score"] + r["opponent-score"]
    ),
    average: round(
      _.sumBy(wonMatchRounds, (r) => r["self-score"] + r["opponent-score"]) /
        wonMatches.length,
      false
    ),
    averageWon: round(
      _.sumBy(wonMatchRounds, (r) => r["self-score"]) / wonMatches.length,
      false
    ),
    winrate: 0,
  };
  wonMatch.winrate = round(wonMatch.averageWon / wonMatch.average, true);
  const lostMatch: PointSumStatistics = {
    total: _.sumBy(
      lostMatchRounds,
      (r) => r["self-score"] + r["opponent-score"]
    ),
    average: round(
      _.sumBy(lostMatchRounds, (r) => r["self-score"] + r["opponent-score"]) /
        lostMatches.length,
      false
    ),
    averageWon: round(
      _.sumBy(lostMatchRounds, (r) => r["self-score"]) / lostMatches.length,
      false
    ),
    winrate: 0,
  };
  lostMatch.winrate = round(lostMatch.averageWon / lostMatch.average, true);
  return {
    set,
    wonSet,
    lostSet,
    match,
    wonMatch,
    lostMatch,
  };
}

function round(num: number, percentage: boolean) {
  if (percentage) {
    return Number((Math.round(num * 1000) / 10).toFixed(1));
  } else {
    return Number((Math.round(num * 10) / 10).toFixed(1));
  }
}
