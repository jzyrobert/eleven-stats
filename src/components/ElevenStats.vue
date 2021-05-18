<template>
  <div>
    <form @submit.prevent="collectStats">
      <label class="p-m-2" for="id">Enter Eleven ID (exact) </label>
      <InputText
        type="text"
        class="p-m-2"
        @focus="resetName"
        v-model="id"
        name="id"
      />
      <label class="p-m-2" for="id"> or Eleven Name (exact) </label>
      <InputText
        type="text"
        class="p-m-2"
        @focus="resetID"
        v-model="name"
        name="name"
      />
      <Button class="p-m-2" label="submit" type="submit" />
      <label for="offset">UTC Offset:</label>
      <InputNumber
        id="offset"
        inputStyle="width: 4rem"
        showButtons
        v-model="utcOffset"
        suffix=":00"
        :max="12"
        :min="-12"
      />
      <label for="cutoff">Day cutoff:</label>
      <InputNumber
        id="cutoff"
        inputStyle="width: 5rem"
        showButtons
        v-model="dayCutoff"
        suffix=":00 am"
        :max="7"
        :min="0"
      />
    </form>

    <div v-if="message">{{ message }}</div>
    <ProgressSpinner v-if="!loaded" />
    <div v-if="loaded && matches.length > 0 && filteredMatches.length == 0">
      Your selection does not match any matches!
    </div>
    <div v-if="matches.length > 0">
      <label for="ranked">Match type: </label>
      <Dropdown
        name="ranked"
        v-model="ranked"
        :options="rankedOptions"
        optionLabel="name"
        optionValue="val"
      />
      <label for="home"> Match Location: </label>
      <Dropdown
        name="home"
        v-model="home"
        :options="homeOptions"
        optionLabel="name"
        optionValue="val"
      />
      <label for="higher"> Opponent ELO: </label>
      <Dropdown
        name="higher"
        v-model="higher"
        :options="higherOptions"
        optionLabel="name"
        optionValue="val"
      />
      <label for="startDate"> Start date:</label>
      <Calendar
        name="startDate"
        v-model="startDate"
        selectOtherMonths
        dateFormat="yy-mm-dd"
        :minDate="earliestDate"
        :maxDate="endDate"
      />
      <label for="endDate"> End date:</label>
      <Calendar
        name="endDate"
        v-model="endDate"
        selectOtherMonths
        dateFormat="yy-mm-dd"
        :minDate="startDate"
        :maxDate="latestDate"
      />
      <h2 v-html="formatDetailsHTML"></h2>
      <h3>
        I want to know about:
        <ToggleButton
          class="p-mr-2"
          style="vertical-align: middle; height: 25px; width: 25px"
          v-model="selfStats"
          onIcon="pi pi-check"
          offIcon="pi pi-times"
        />Myself
        <ToggleButton
          class="p-mr-2"
          style="vertical-align: middle; height: 25px; width: 25px"
          v-model="oppStats"
          onIcon="pi pi-check"
          offIcon="pi pi-times"
        />My opponents
        <ToggleButton
          class="p-mr-2"
          style="vertical-align: middle; height: 25px; width: 25px"
          v-model="eloStats"
          onIcon="pi pi-check"
          offIcon="pi pi-times"
        />My ELO
      </h3>

      <TabView v-if="filteredMatches.length > 0">
        <TabPanel header="Statistics">
          <div class="p-grid">
            <MatchCard
              v-if="selfStats"
              v-bind:all_match_stats="all_match_stats"
              v-bind:all_player_stats="all_player_stats"
            />
            <MostPlayedCard
              v-if="selfStats"
              v-bind:all_match_stats="all_match_stats"
            />
            <EloGainsCard
              v-if="ranked !== 'unranked' && eloStats"
              v-bind:all_ranked_stats="all_ranked_stats"
            />
            <GoodBadCard
              v-if="ranked !== 'unranked' && eloStats"
              v-bind:all_ranked_stats="all_ranked_stats"
            />
            <StreakCard
              v-if="selfStats"
              v-bind:ranked="ranked"
              v-bind:all_match_stats="all_match_stats"
            />
            <AverageOpponentCard
              v-if="oppStats"
              v-bind:all_player_stats="all_player_stats"
              v-bind:all_match_stats="all_match_stats"
            />
            <UniqueOpponentCard
              v-if="oppStats"
              v-bind:all_player_stats="all_player_stats"
            />
            <HighestOpponentCard
              v-if="oppStats"
              v-bind:all_player_stats="all_player_stats"
            />
            <HighestNowCard
              v-if="
                oppStats &&
                all_player_stats.highestEloNow.last.opponent.id !==
                  all_player_stats.highestElo.last.opponent.id
              "
              v-bind:all_player_stats="all_player_stats"
            />
            <LowestOpponentCard
              v-if="oppStats"
              v-bind:all_player_stats="all_player_stats"
            />
            <LowestNowCard
              v-if="
                oppStats &&
                all_player_stats.lowestEloNow.last.opponent.id !=
                  all_player_stats.lowestElo.last.opponent.id
              "
              v-bind:all_player_stats="all_player_stats"
            />
            <MostPlayedOpponentsCard
              v-if="selfStats"
              v-bind:ranked="ranked"
              v-bind:all_player_stats="all_player_stats"
            />
            <MostImprovedCard
              v-if="oppStats"
              v-bind:all_player_stats="all_player_stats"
            />
            <MostDeclinedCard
              v-if="oppStats"
              v-bind:all_player_stats="all_player_stats"
            />
            <EloTakenCard
              v-if="eloStats && ranked !== 'unranked'"
              v-bind:all_ranked_stats="all_ranked_stats"
            />
            <SetInfoCard
              v-if="selfStats"
              v-bind:all_round_stats="all_round_stats"
            />
            <RoundsBeyondCard
              v-if="selfStats"
              v-bind:all_round_stats="all_round_stats"
            />
            <FastWinCard
              v-if="selfStats"
              v-bind:all_round_stats="all_round_stats"
            />
            <ComebackCard
              v-if="selfStats"
              v-bind:all_round_stats="all_round_stats"
            />
            <SetPointsCard
              v-if="selfStats"
              v-bind:all_point_stats="all_point_stats"
            />
            <MatchPointsCard
              v-if="selfStats"
              v-bind:all_point_stats="all_point_stats"
            />
            <LongestRoundCard
              v-if="selfStats"
              v-bind:all_round_stats="all_round_stats"
            />
          </div>
        </TabPanel>
        <TabPanel header="Graphs">
          <div class="p-grid">
            <!-- <LossChart /> -->
            <MostPlayedChart
              v-if="oppStats"
              v-bind:all_player_stats="all_player_stats"
            />
            <MostWonChart
              v-if="oppStats"
              v-bind:all_player_stats="all_player_stats"
            />
            <MostLostChart
              v-if="oppStats"
              v-bind:all_player_stats="all_player_stats"
            />
          </div>
        </TabPanel>
      </TabView>
    </div>
  </div>
</template>

<script lang="ts">
import * as STATS from "../util/stats";
import { processData, filterMatches, formatScore } from "../util/parsing";
// import * as SAMPLE from "../util/sample";
import * as SAMPLE_HUGE from "../util/sampleLarge";
// import * as SAMPLE_TEST from "../util/predator";
import {
  Ref,
  ref,
  defineComponent,
  onMounted,
  computed,
  ComputedRef,
} from "vue";
import {
  Higher,
  Home,
  MatchData,
  MatchStatistics,
  PlayerStatistics,
  PointStatistics,
  Ranked,
  RankedStatistics,
  RoundStatistics,
} from "../types/statTypes";
import dayjs from "dayjs";
import {
  Calendar,
  InputText,
  Button,
  Dropdown,
  ProgressSpinner,
  Card,
  DataTable,
  Column,
  TabView,
  TabPanel,
  InputNumber,
  Avatar,
  ToggleButton,
} from "./primeIndex";
import * as CARDS from "../cards/index";
import * as CHARTS from "../charts/index";

export default defineComponent({
  name: "ElevenStats",
  components: {
    //Primevue
    Calendar,
    InputText,
    Button,
    Dropdown,
    ProgressSpinner,
    Card,
    DataTable,
    Column,
    TabView,
    TabPanel,
    InputNumber,
    Avatar,
    ToggleButton,

    // Custom charts
    LossChart: CHARTS.LossChart,
    MostPlayedChart: CHARTS.MostPlayedChart,
    MostWonChart: CHARTS.MostWonChart,
    MostLostChart: CHARTS.MostLostChart,

    // Custom cards
    MatchCard: CARDS.MatchCard,
    MostPlayedCard: CARDS.MostPlayedCard,
    EloGainsCard: CARDS.EloGainsCard,
    GoodBadCard: CARDS.GoodBadCard,
    AverageOpponentCard: CARDS.AverageOpponentCard,
    UniqueOpponentCard: CARDS.UniqueOpponentCard,
    HighestOpponentCard: CARDS.HighestOpponentCard,
    HighestNowCard: CARDS.HighestNowCard,
    LowestOpponentCard: CARDS.LowestOpponentCard,
    LowestNowCard: CARDS.LowestNowCard,
    MostPlayedOpponentsCard: CARDS.MostPlayedOpponentsCard,
    MostImprovedCard: CARDS.MostImprovedCard,
    MostDeclinedCard: CARDS.MostDeclinedCard,
    EloTakenCard: CARDS.EloTakenCard,
    SetInfoCard: CARDS.SetInfoCard,
    RoundsBeyondCard: CARDS.RoundsBeyondCard,
    FastWinCard: CARDS.FastWinCard,
    ComebackCard: CARDS.ComebackCard,
    SetPointsCard: CARDS.SetPointsCard,
    MatchPointsCard: CARDS.MatchPointsCard,
    LongestRoundCard: CARDS.LongestRoundCard,
    StreakCard: CARDS.StreakCard,
  },
  setup() {
    const loaded = ref(true);

    const id = ref("");
    const name = ref("");
    // Displays status or error messages
    const message = ref("");

    const ranked = ref(Ranked.All);
    const rankedOptions = ref([
      { name: "All", val: Ranked.All },
      { name: "Ranked", val: Ranked.Ranked },
      { name: "Unranked", val: Ranked.Unranked },
    ]);
    const home = ref(Home.All);
    const homeOptions = ref([
      { name: "All", val: Home.All },
      { name: "Home", val: Home.Home },
      { name: "Away", val: Home.Away },
    ]);
    const higher = ref(Higher.All);
    const higherOptions = ref([
      { name: "All", val: Higher.All },
      { name: "Higher Opponent ELO", val: Higher.Higher },
      { name: "Lower Opponent ELO", val: Higher.Lower },
    ]);
    const details = computed(() => {
      var message = `<i>${ranked.value}</i> ${filteredMatches.value.length} matches `;
      if (ranked.value !== Ranked.All) {
        message = `${filteredMatches.value.length} <i>${ranked.value}</i> matches `;
      }
      if (home.value !== Home.All) {
        if (home.value === Home.Home) {
          message += "that you <i>challenged</i> ";
        } else {
          message += "that you <i>accepted</i> ";
        }
      }
      if (higher.value !== Higher.All) {
        if (higher.value === Higher.Higher) {
          message += "against <i>higher</i> ranked opponents ";
        } else {
          message += "against <i>lower</i> ranked opponents ";
        }
      }
      if (
        startDate.value.getTime() == earliestDate.value.getTime() &&
        endDate.value.getTime() != latestDate.value.getTime()
      ) {
        message += `<i>before</i> ${endDate.value.toDateString()}`;
      } else if (
        endDate.value.getTime() == latestDate.value.getTime() &&
        startDate.value.getTime() != earliestDate.value.getTime()
      ) {
        message += `<i>after</i> ${startDate.value.toDateString()}`;
      } else if (
        startDate.value.getTime() != earliestDate.value.getTime() &&
        endDate.value.getTime() != latestDate.value.getTime()
      ) {
        message += `<i>between</i> ${startDate.value.toDateString()} and ${endDate.value.toDateString()}`;
      }
      return message;
    });

    const matches = ref(new Array<MatchData>());
    const filteredMatches: ComputedRef<Array<MatchData>> = computed(() =>
      filterMatches(
        matches.value,
        ranked.value,
        home.value,
        higher.value,
        startDate.value,
        endDate.value,
        dayCutoff.value
      )
    );
    const matchNumber = computed(() => filteredMatches.value.length);

    const startDate: Ref<Date> = ref(new Date());
    const endDate: Ref<Date> = ref(new Date());
    const earliestDate = computed(() => {
      if (matches.value.length > 0) {
        return matches.value[matches.value.length - 1].offsetDate
          .startOf("day")
          .toDate();
      } else {
        return new Date();
      }
    });

    const latestDate = computed(() => {
      if (matches.value.length > 0) {
        return matches.value[0].offsetDate.startOf("day").toDate();
      } else {
        return new Date();
      }
    });

    const utcOffset = ref(0);
    const dayCutoff = ref(0);

    const selfStats = ref(true);
    const oppStats = ref(true);
    const eloStats = ref(true);

    onMounted(() => {
      matches.value = processData(
        // SAMPLE.SAMPLE_ID_BIG,
        // SAMPLE.SAMPLE_MATCHES_BIG,
        // SAMPLE.SAMPLE_ROUNDS_BIG
        SAMPLE_HUGE.SAMPLE_ID_HUGE,
        SAMPLE_HUGE.SAMPLE_MATCHES_HUGE,
        SAMPLE_HUGE.SAMPLE_ROUNDS_HUGE
        // SAMPLE_TEST.SAMPLE_ID_TEST,
        //     SAMPLE_TEST.SAMPLE_MATCHES_TEST,
        //     SAMPLE_TEST.SAMPLE_ROUNDS_TEST
      );
    });

    return {
      loaded,

      id,
      name,
      message,

      ranked,
      home,
      higher,
      details,

      rankedOptions,
      homeOptions,
      higherOptions,

      matches,
      filteredMatches,
      matchNumber,
      startDate,
      endDate,
      earliestDate,
      latestDate,

      utcOffset,
      dayCutoff,

      STATS,
      selfStats,
      oppStats,
      eloStats,
    };
  },
  computed: {
    formatDetailsHTML(): string {
      return `You selected ${this.details}`;
    },
    all_match_stats(): MatchStatistics {
      return STATS.ALL_MATCH_STATS(this.filteredMatches);
    },
    all_ranked_stats(): RankedStatistics {
      return STATS.ALL_RANKED_STATS(this.filteredMatches);
    },
    all_player_stats(): PlayerStatistics {
      return STATS.ALL_PLAYER_STATS(this.filteredMatches);
    },
    all_round_stats(): RoundStatistics {
      return STATS.ALL_ROUND_STATS(this.filteredMatches);
    },
    all_point_stats(): PointStatistics {
      return STATS.ALL_POINT_STATS(this.filteredMatches);
    },
  },
  watch: {
    utcOffset() {
      this.matches = this.matches.map((m) => {
        m.offsetDate = m.date.add(this.utcOffset, "hours");
        return m;
      });
    },
    latestDate() {
      this.startDate = new Date(this.earliestDate.getTime());
      this.endDate = new Date(this.latestDate.getTime());
    },
  },
  methods: {
    dayjs: dayjs,
    formatScore: formatScore,
    resetName() {
      this.name = "";
    },
    resetID() {
      this.id = "";
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
        this.name = (await check.json()).data.attributes["user-name"];
        return this.id;
      }
    },
    resetValues() {
      this.matches = [];
      this.loaded = false;
      this.ranked = Ranked.All;
      this.home = Home.All;
      this.higher = Higher.All;
      this.utcOffset = 0;
      this.dayCutoff = 0;
    },
    async collectStats() {
      this.resetValues();
      const id = await this.validateID();
      if (!id) {
        this.loaded = true;
        return;
      } else {
        this.id = id;
      }
      const matches = [];
      const rounds = [];
      var nexturl = `https://www.elevenvr.club/accounts/${this.id}/matches`;
      // let currentPage = 0;
      // let totalPages = 0;
      while (nexturl) {
        // this.message = `Collecting match data: ${currentPage} of ${totalPages} pages`;
        const currentMatchData = await this.getJSON(nexturl);
        matches.push(...currentMatchData["data"]);
        rounds.push(...currentMatchData["included"]);
        // currentPage++;
        // if (currentPage <= 1) {
        //   totalPages = parseInt(
        //     (currentMatchData["links"]["last"] as string).match(
        //       /page%5Bnumber%5D=(\d+)/
        //     )![1]
        //   );
        // }
        nexturl = currentMatchData["links"]["next"];
      }
      this.matches = processData(id, matches, rounds);
      this.message = "";
      this.loaded = true;
      this.startDate = this.earliestDate;
      this.endDate = this.latestDate;
    },
  },
});
</script>

<style>
a {
  color: #42b983;
}

p {
  margin: 10px;
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

.cardbox {
  padding: 5px;
}

.p-card {
  height: 100%;
}
</style>
