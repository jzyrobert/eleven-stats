<template>
  <div>
    <form @submit.prevent="collectStats">
      <label for="id">Enter Eleven ID (exact) </label>
      <input type="text" v-model="id" name="id" />
      <label for="id"> or Eleven Name (exact) </label>
      <input type="text" v-model="name" name="name" />
      <input type="submit" />
    </form>
    <div v-if="message">{{ message }}</div>
    <div v-if="matches.length > 0">
      <label for="ranked">Match type: </label>
      <select name="ranked" v-model="ranked">
        <option>all</option>
        <option>ranked</option>
        <option>unranked</option>
      </select>
      <label for="home"> Home (if you sent the challenge): </label>
      <select name="ranked" v-model="home">
        <option>all</option>
        <option>home</option>
        <option>away</option>
      </select>
      <label for="home"> Opponent ELO (at time of match): </label>
      <select name="ranked" v-model="higher">
        <option>all</option>
        <option>higher</option>
        <option>lower</option>
      </select>
      <label for="startdate"> Start date:</label>
      <input name="startdate" v-model="startdate" :min="earliestDate" :max="latestDate" type="date" />
      <label for="enddate"> End date:</label>
      <input name="enddate" v-model="enddate" :min="earliestDate" :max="latestDate" type="date" />
      <p>You selected {{ details }}</p>
      <p>
        You <b>won</b> {{ wins }} out of {{ matchNumber }} games, a winrate of
        {{ winrate }}%
      </p>
      <div v-if="ranked === 'ranked'">
        <p>
          Your average ELO <b>change</b> per match is {{ average_change }}, for
          a <b>total</b> of {{ total_change }}
        </p>
        <p>
          Your average ELO <b>gain</b> per match is {{ average_gain }}, for a
          <b>total</b> of {{ total_gain }}
        </p>
        <p>
          Your average ELO <b>loss</b> per match is {{ average_loss }}, for a
          <b>total</b> of {{ total_loss }}
        </p>
      </div>
      <p>
        At match time, your <b>average</b> opponent ELO was
        {{ average_elo_game }}
      </p>
      <p>
        Currently, your <b>average</b> (unique) opponent ELO is
        {{ average_elo_now }}
      </p>
    </div>
  </div>
</template>

<script>
import { ALL_STATS, round, processData, filterMatches } from "../util/util";
import { SAMPLE_ID, SAMPLE_MATCHES, SAMPLE_ROUNDS } from "../util/sample";

export default {
  name: "Stats",
  data() {
    return {
      id: "",
      name: "",
      message: "",
      matches: [],
      ranked: "all",
      home: "all",
      higher: "all",
      startdate: null,
      enddate: null
    };
  },
  mounted() {
    this.matches = processData(SAMPLE_ID, SAMPLE_MATCHES, SAMPLE_ROUNDS);
    this.startdate = this.earliestDate;
    this.enddate = this.latestDate;
  },
  computed: {
    earliestDate() {
        if (this.filteredMatches.length > 0) {
            return this.filteredMatches[this.filteredMatches.length -1].date.toISOString().split('T')[0]
        } else {
            return null;
        }
    },
    latestDate() {
        if (this.filteredMatches.length > 0) {
            return this.filteredMatches[0].date.toISOString().split('T')[0]
        } else {
            return null;
        }
    },
    details() {
      var details = `${this.ranked} games `;
      if (this.home !== "all") {
        if (this.home === "home") {
          details += "that you challenged ";
        } else {
          details += "that you accepted ";
        }
      }
      if (this.higher !== "all") {
        if (this.higher === "higher") {
          details += "against higher ranked opponents ";
        } else {
          details += "against lower ranked opponents ";
        }
      }
      return details;
    },
    filteredMatches() {
      return filterMatches(this.matches, this.ranked, this.home, this.higher);
    },
    matchNumber() {
      return this.filteredMatches.length;
    },
    wins() {
      return ALL_STATS["WINRATE"](this.filteredMatches);
    },
    winrate() {
      return round(this.wins / this.matchNumber, true);
    },
    average_change() {
      return round(ALL_STATS["AVERAGE_CHANGE"](this.filteredMatches), false);
    },
    average_gain() {
      return round(ALL_STATS["AVERAGE_GAIN"](this.filteredMatches), false);
    },
    average_loss() {
      return round(ALL_STATS["AVERAGE_LOSS"](this.filteredMatches), false);
    },
    total_change() {
      return ALL_STATS["TOTAL_CHANGE"](this.filteredMatches);
    },
    total_gain() {
      return ALL_STATS["TOTAL_GAIN"](this.filteredMatches);
    },
    total_loss() {
      return ALL_STATS["TOTAL_LOSS"](this.filteredMatches);
    },
    average_elo_game() {
      return Math.round(ALL_STATS["AVERAGE_ELO_GAME"](this.filteredMatches));
    },
    average_elo_now() {
    console.log(this.filteredMatches)
      return Math.round(ALL_STATS["AVERAGE_ELO_NOW"](this.filteredMatches));
    },
    highest_elo_game() {
      return 0;
    },
    highest_elo_now() {
      return 0;
    },
    lowest_elo_game() {
      return 0;
    },
    lowest_elo_now() {
      return 0;
    },
  },
  methods: {
    async getJSON(url) {
      const response = await fetch(url);
      return response.json();
    },
    async validateID() {
      if (!this.name && !this.id) {
        return false;
      } else if (!this.id) {
        const results = await this.getJSON(
          `https://www.elevenvr.club/accounts/search/${encodeURIComponent(
            this.name
          )}`
        );
        for (const user of results.data) {
          if (user["attributes"]["user-name"] === this.name) {
            return user["id"];
          }
        }
        this.message = "No matching name found!";
        return false;
      } else {
        const check = await fetch(
          `https://www.elevenvr.club/accounts/${this.id}`
        );
        if (check.status === 404) {
          this.message = "No matching ID found!";
          return false;
        }
        return this.id;
      }
    },
    async collectStats() {
      const id = await this.validateID();
      if (!id) {
        return;
      } else {
        this.id = id;
      }
      var count = 1;
      const matches = [];
      const rounds = [];
      var nexturl = `https://www.elevenvr.club/accounts/${this.id}/matches`;
      while (nexturl) {
        this.message = `Collecting match data: Page ${count}`;
        count++;
        const currentMatchData = await this.getJSON(nexturl);
        matches.push(...currentMatchData["data"]);
        rounds.push(...currentMatchData["included"]);
        nexturl = currentMatchData["links"]["next"];
      }
      this.matches = processData(id, matches, rounds);
      //   console.log(this.matches);
      this.message = "Matches collected, calculating statistics...";
    },
  },
};
</script>

<style></style>
