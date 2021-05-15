import { MatchData } from "../types/stats";
import _ from "lodash";

export const ALL_STATS = {
  WINS: (matches: Array<MatchData>) => {
    return matches.filter((m) => m.won).length;
  },
  WINRATE: (matches: Array<MatchData>) => {
    return round(matches.filter((m) => m.won).length / matches.length, true);
  },
  AVERAGE_CHANGE: (matches: Array<MatchData>) => {
    return round(
      _.mean(
        matches.map((m) => (m.won ? m["elo-change"] : -1 * m["elo-change"]))
      ),
      false
    );
  },
  AVERAGE_GAIN: (matches: Array<MatchData>) => {
    return round(
      _.mean(matches.filter((m) => m.won).map((m) => m["elo-change"])),
      false
    );
  },
  AVERAGE_LOSS: (matches: Array<MatchData>) => {
    return round(
      _.mean(matches.filter((m) => !m.won).map((m) => -1 * m["elo-change"])),
      false
    );
  },
  TOTAL_CHANGE: (matches: Array<MatchData>) => {
    return _.sum(
      matches.map((m) => (m.won ? m["elo-change"] : -1 * m["elo-change"]))
    );
  },
  TOTAL_GAIN: (matches: Array<MatchData>) => {
    return _.sum(matches.filter((m) => m.won).map((m) => m["elo-change"]));
  },
  TOTAL_LOSS: (matches: Array<MatchData>) => {
    return _.sum(
      matches.filter((m) => !m.won).map((m) => -1 * m["elo-change"])
    );
  },
  AVERAGE_ELO_GAME: (matches: Array<MatchData>) => {
    return Math.round(_.mean(matches.map((m) => m.opponent["game-elo"])));
  },
  AVERAGE_ELO_NOW: (matches: Array<MatchData>) => {
    return Math.round(_.mean(matches.map((m) => m.opponent["current-elo"])));
  },
  AVERAGE_ELO_UNIQUE: (matches: Array<MatchData>) => {
    return Math.round(
      _.mean(
        _.uniqBy(matches, "opponent.id").map((m) => m.opponent["current-elo"])
      )
    );
  },
};

function round(num: number, percentage: boolean) {
  if (percentage) {
    return (Math.round(num * 1000) / 10).toFixed(1);
  } else {
    return (Math.round(num * 10) / 10).toFixed(1);
  }
}
