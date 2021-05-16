import {
  Home,
  MatchData,
  PlayerData,
  Ranked,
  Higher,
  RawMatchData,
  RawRoundData,
  RoundData,
} from "../types/statTypes";
import dayjs from "dayjs";

export function filterMatches(
  matches: Array<MatchData>,
  ranked: Ranked,
  home: Home,
  higher: Higher,
  startDate: Date,
  endDate: Date
) {
  const parsedStart = dayjs(startDate).startOf("day");
  const parsedEnd = dayjs(endDate).endOf("day");
  return matches.filter((match) => {
    // Bugged matches
    // if (match.rounds.length < 2) {
    //   return false;
    // }
    if (!match.complete) {
      return false;
    }
    if (!match.ranked && match["elo-change"] > 0) {
      return false;
    }
    // Regular filtering
    if (ranked !== Ranked.All) {
      if (match.ranked !== (ranked === Ranked.Ranked)) {
        return false;
      }
    }
    if (home !== Home.All) {
      if (match.home !== (home === Home.Home)) {
        return false;
      }
    }
    if (higher !== Higher.All) {
      if (
        higher === Higher.Higher &&
        match.opponent["match-elo"] < match.self["match-elo"]
      ) {
        return false;
      } else if (
        higher === Higher.Lower &&
        match.opponent["match-elo"] >= match.self["match-elo"]
      ) {
        return false;
      }
    }
    const date = dayjs(match.date);
    if (date.isBefore(parsedStart) || date.isAfter(parsedEnd)) {
      return false;
    }
    return true;
  });
}

export function processData(
  id: string,
  matches: Array<RawMatchData>,
  rounds: Array<RawRoundData>
): Array<MatchData> {
  // console.log(matches);
  // console.log(rounds);
  const processedMatches = new Array<MatchData>();
  const hashedRounds = Object.fromEntries(rounds.map((r) => [r["id"], r]));
  for (const [index, match] of matches.entries()) {
    const home = match.attributes["home-team"][0]["id"] == parseInt(id);
    const newMatch: MatchData = {
      id: match.id,
      ranked: match.attributes.ranked,
      home: home,
      won: match.attributes["winner"] != Number(home),
      complete: match.attributes.state == 1 && match.attributes.winner > -1,
      self: createPlayerData(home, match, true),
      opponent: createPlayerData(home, match, false),
      "elo-diff": 0,
      "elo-diff-formatted": "",
      "elo-diff-now": 0,
      "elo-diff-now-formatted": "",
      "elo-change": match.attributes["elo-change"],
      date: new Date(match.attributes["created-at"]),
      rounds: [],
    };
    newMatch["elo-diff"] =
      newMatch.self["match-elo"] - newMatch.opponent["match-elo"];
    newMatch["elo-diff-formatted"] = formatDiff(newMatch["elo-diff"]);
    newMatch["elo-diff-now"] =
      newMatch.self["current-elo"] - newMatch.opponent["current-elo"];
    newMatch["elo-diff-now-formatted"] = formatDiff(newMatch["elo-diff-now"]);
    for (const round of match.relationships.rounds.data) {
      const roundData = hashedRounds[round.id];
      // console.log(round)
      const newRoundData: RoundData = {
        id: roundData.id,
        "opponent-id": newMatch.opponent.id,
        "opponent-username": newMatch.opponent.userName,
        "self-score": home
          ? roundData.attributes["home-score"]
          : roundData.attributes["away-score"],
        "opponent-score": home
          ? roundData.attributes["away-score"]
          : roundData.attributes["home-score"],
        "score-formatted": "",
        won: false,
        complete:
          roundData.attributes["home-score"] >= 11 ||
          roundData.attributes["away-score"] >= 11,
      };
      newRoundData["score-formatted"] = `${newRoundData["self-score"]}-${newRoundData["opponent-score"]}`
      newRoundData["won"] =
        newRoundData["self-score"] > newRoundData["opponent-score"];
      newMatch.rounds.push(newRoundData);
    }
    newMatch.rounds.sort((r1, r2) => parseInt(r1.id) - parseInt(r2.id))
    processedMatches.push(newMatch);
  }
  return processedMatches;
}

function createPlayerData(
  home: boolean,
  match: RawMatchData,
  self: boolean
): PlayerData {
  let raw = match.attributes["home-team"][0];
  let score = match.attributes["home-elo"];
  if (home != self) {
    raw = match.attributes["away-team"][0];
    score = match.attributes["away-elo"];
  }
  return {
    id: raw.id,
    userName: raw.UserName,
    "current-elo": raw.ELO,
    "match-elo": score,
    "elo-gain": raw.ELO - score,
    "elo-gain-formatted": formatDiff(raw.ELO - score),
    rank: raw.Rank,
    wins: raw.Wins,
    losses: raw.Losses,
    lastOnline: raw.LastOnline,
  };
}

export function formatDiff(diff: number) {
  if (diff == 0) {
    return "=";
  } else if (diff > 0) {
    return `+${Math.round(diff)}`;
  } else {
    return Math.round(diff).toString();
  }
}
