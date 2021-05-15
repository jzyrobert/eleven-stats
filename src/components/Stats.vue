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
      <label for="startDate"> Start date:</label>
      <input
        name="startDate"
        v-model="startDate"
        :min="earliestDate"
        :max="latestDate"
        type="date"
      />
      <label for="endDate"> End date:</label>
      <input
        name="endDate"
        v-model="endDate"
        :min="earliestDate"
        :max="latestDate"
        type="date"
      />
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

<script lang="ts">
import { ALL_STATS, processData, filterMatches } from "../util/util";
import * as SAMPLE from "../util/sample";
import { ref, defineComponent, onMounted, computed, ComputedRef } from "vue";
import { Higher, Home, MatchData, Ranked } from "../types/stats";

export default defineComponent({
  name: "Stats",
  setup() {
    const id = ref("");
    const name = ref("");
    // Displays status or error messages
    const message = ref("");

    const ranked = ref(Ranked.All);
    const home = ref(Home.All);
    const higher = ref(Higher.All);
    const details = computed(() => {
      var message = `${ranked.value} games `;
      if (home.value !== Home.All) {
        if (home.value === Home.Home) {
          message += "that you challenged ";
        } else {
          message += "that you accepted ";
        }
      }
      if (higher.value !== Higher.All) {
        if (higher.value === Higher.Higher) {
          message += "against higher ranked opponents ";
        } else {
          message += "against lower ranked opponents ";
        }
      }
      return message;
    });

    const matches = ref(new Array<MatchData>());
    const filteredMatches: ComputedRef<Array<MatchData>> = computed(() =>
      filterMatches(matches.value, ranked.value, home.value, higher.value)
    );
    const matchNumber = computed(() => filteredMatches.value.length);

    const startDate = ref("");
    const endDate = ref("");
    const earliestDate = computed(() => {
      if (filteredMatches.value.length > 0) {
        return filteredMatches.value[filteredMatches.value.length - 1].date
          .toISOString()
          .split("T")[0];
      } else {
        return "";
      }
    });

    const latestDate = computed(() => {
      if (filteredMatches.value.length > 0) {
        return filteredMatches.value[0].date.toISOString().split("T")[0];
      } else {
        return "";
      }
    });

    onMounted(() => {
      matches.value = processData(
        SAMPLE.SAMPLE_ID,
        SAMPLE.SAMPLE_MATCHES,
        SAMPLE.SAMPLE_ROUNDS
      );
      startDate.value = earliestDate.value;
      endDate.value = latestDate.value;
    });

    return {
      id,
      name,
      message,

      ranked,
      home,
      higher,
      details,

      matches,
      filteredMatches,
      matchNumber,
      startDate,
      endDate,
      earliestDate,
      latestDate,
    };
  },
  //   wins() {
  //       return ALL_STATS["WINRATE"](this.filteredMatches);
  //     },
  //     winrate() {
  //       return round(this.wins / this.matchNumber, true);
  //     },
  //     average_change() {
  //       return round(ALL_STATS["AVERAGE_CHANGE"](this.filteredMatches), false);
  //     },
  //     average_gain() {
  //       return round(ALL_STATS["AVERAGE_GAIN"](this.filteredMatches), false);
  //     },
  //     average_loss() {
  //       return round(ALL_STATS["AVERAGE_LOSS"](this.filteredMatches), false);
  //     },
  //     total_change() {
  //       return ALL_STATS["TOTAL_CHANGE"](this.filteredMatches);
  //     },
  //     total_gain() {
  //       return ALL_STATS["TOTAL_GAIN"](this.filteredMatches);
  //     },
  //     total_loss() {
  //       return ALL_STATS["TOTAL_LOSS"](this.filteredMatches);
  //     },
  //     average_elo_game() {
  //       return Math.round(ALL_STATS["AVERAGE_ELO_GAME"](this.filteredMatches));
  //     },
  //     average_elo_now() {
  //       console.log(this.filteredMatches);
  //       return Math.round(ALL_STATS["AVERAGE_ELO_NOW"](this.filteredMatches));
  //     },
  //     highest_elo_game() {
  //       return 0;
  //     },
  //     highest_elo_now() {
  //       return 0;
  //     },
  //     lowest_elo_game() {
  //       return 0;
  //     },
  //     lowest_elo_now() {
  //       return 0;
  //     },
  methods: {
    getStat(name: string): number|string {
        return ALL_STATS[name](this.filteredMatches)
    },
    async getJSON(url: string) {
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
});
</script>

<style scoped>
a {
  color: #42b983;
}

label {
  margin: 0 0.5em;
  font-weight: bold;
}

code {
  background-color: #eee;
  padding: 2px 4px;
  border-radius: 4px;
  color: #304455;
}
</style>
