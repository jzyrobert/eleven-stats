import dayjs from "dayjs";
import { MatchData } from "../types/stats";
import _ from "lodash";
import { formatDiff } from "./util";

export function WINS(matches: Array<MatchData>) {
  return matches.filter((m) => m.won).length;
}

export function UNIQUE_OPPONENTS(matches: Array<MatchData>) {
  return _.uniqBy(matches, "opponent.id").length;
}

export function WINRATE(matches: Array<MatchData>) {
  return round(matches.filter((m) => m.won).length / matches.length, true);
}

export function AVERAGE_CHANGE(matches: Array<MatchData>) {
  return round(
    _.mean(
      matches.map((m) => (m.won ? m["elo-change"] : -1 * m["elo-change"]))
    ),
    false
  );
}

export function AVERAGE_GAIN(matches: Array<MatchData>) {
  return round(
    _.mean(matches.filter((m) => m.won).map((m) => m["elo-change"])),
    false
  );
}

export function AVERAGE_LOSS(matches: Array<MatchData>) {
  return round(
    _.mean(matches.filter((m) => !m.won).map((m) => -1 * m["elo-change"])),
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
      _.filter(matches, (m) => m.opponent.wins + m.opponent.losses > 0),
      (m) => m.opponent.wins / (m.opponent.wins + m.opponent.losses)
    ),
    true
  );
}

export function AVERAGE_OPPONENT_WINRATE_UNIQUE(matches: Array<MatchData>) {
  return round(
    _.meanBy(
      _.uniqBy(
        _.filter(matches, (m) => m.opponent.wins + m.opponent.losses > 0),
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
  return _.maxBy(matches, "opponent.elo-gain");
}

export function LEAST_IMPROVED(matches: Array<MatchData>) {
  return _.minBy(matches, "opponent.elo-gain");
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
  console.log(dayCounts);
  const maxDate = _.maxBy(Object.keys(dayCounts), (d) => dayCounts[d]);
  const maxDateMatches = _.filter(
    matches,
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
