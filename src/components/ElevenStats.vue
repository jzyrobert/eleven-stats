<template>
  <div>
    <form @submit.prevent="collectStats">
      <div>
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
      </div>
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
      <label for="pullLimit"> Request (up to):</label>
      <InputNumber
        id="pullLimit"
        inputStyle="width: 8rem"
        v-model="pullLimit"
        :min="0"
      />
      <label for="incomplete"> Complete matches only:</label>
      <InputSwitch name="incomplete" v-model="complete" />
    </form>

    <div v-if="message">{{ message }}</div>
    <ProgressSpinner v-if="!loaded" />
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
      <div class="p-mt-3">
        <label for="selfRange">
          My match ELO: {{ selfRange[0] }} - {{ selfRange[1] }}</label
        >
        <div class="p-m-3">
          <Slider
            name="selfRange"
            style="margin: auto; width: 50%"
            v-model="selfRange"
            :range="true"
            :min="selfMin"
            :max="selfMax"
          />
        </div>
        <label for="oppRange">
          Opponent match ELO: {{ opponentRange[0] }} -
          {{ opponentRange[1] }}</label
        >
        <div class="p-m-3">
          <Slider
            name="oppRange"
            style="margin: auto; width: 50%"
            v-model="opponentRange"
            :range="true"
            :min="opponentMin"
            :max="opponentMax"
          />
        </div>
      </div>
      <h2 v-html="formatDetailsHTML"></h2>
      <h3 v-if="filteredMatches.length > 0">
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

      <TabView
        v-model:activeIndex="activeIndex"
        v-if="filteredMatches.length > 0"
      >
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
              v-bind:hasRanked="hasRanked"
            />
            <EloGainsCard
              v-if="hasRanked && ranked !== 'unranked' && eloStats"
              v-bind:all_ranked_stats="all_ranked_stats"
            />
            <GoodBadCard
              v-if="hasRanked && ranked !== 'unranked' && eloStats"
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
              v-bind:hasRanked="hasRanked"
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
              v-if="hasRanked && eloStats && ranked !== 'unranked'"
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
            <LongestRoundCard
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
          </div>
        </TabPanel>
        <TabPanel header="Graphs">
          <div class="p-grid">
            <!-- <LossChart /> -->
            <MostPlayedChart
              v-if="oppStats"
              v-bind:all_player_stats="all_player_stats"
            />
            <MostEloChart
              v-if="hasRanked && eloStats"
              v-bind:all_ranked_stats="all_ranked_stats"
            />
            <EloRangeChart
              v-if="oppStats"
              v-bind:all_player_stats="all_player_stats"
            />
            <PointDiffChart
              v-if="selfStats"
              v-bind:activeIndex="activeIndex"
              v-bind:all_round_stats="all_round_stats"
            />
            <MatchGraphChart
              v-if="selfStats"
              v-bind:all_match_stats="all_match_stats"
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
import { minBy, maxBy, debounce } from "lodash";
import * as SAMPLE_HUGE from "../util/sampleLarge";
import { Ref, ref, defineComponent, onMounted, computed } from "vue";
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
  Slider,
  InputSwitch,
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
    Slider,
    InputSwitch,

    // Custom charts
    LossChart: CHARTS.LossChart,
    MostPlayedChart: CHARTS.MostPlayedChart,
    MostEloChart: CHARTS.MostEloChart,
    EloRangeChart: CHARTS.EloRangeChart,
    PointDiffChart: CHARTS.PointDiffChart,
    MatchGraphChart: CHARTS.MatchGraphChart,

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

    const matches = ref(new Array<MatchData>());

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

    const complete = ref(true);

    // onMounted(() => {
    //   matches.value = processData(
    //     // SAMPLE.SAMPLE_ID_BIG,
    //     // SAMPLE.SAMPLE_MATCHES_BIG,
    //     // SAMPLE.SAMPLE_ROUNDS_BIG
    //     SAMPLE_HUGE.SAMPLE_ID_HUGE,
    //     SAMPLE_HUGE.SAMPLE_MATCHES_HUGE,
    //     SAMPLE_HUGE.SAMPLE_ROUNDS_HUGE
    //     // SAMPLE_TEST.SAMPLE_ID_TEST,
    //     //     SAMPLE_TEST.SAMPLE_MATCHES_TEST,
    //     //     SAMPLE_TEST.SAMPLE_ROUNDS_TEST
    //   );
    // });

    return {
      loaded,

      id,
      name,
      message,

      ranked,
      home,
      higher,

      rankedOptions,
      homeOptions,
      higherOptions,

      matches,
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

      complete,
    };
  },
  data() {
    return {
      activeIndex: 0,
      pullLimit: 0,
      selfRange: [0, 4000],
      actualSelfRange: [0, 4000],
      opponentRange: [0, 4000],
      actualOpponentRange: [0, 4000],
    };
  },
  computed: {
    filteredMatches(): Array<MatchData> {
      return filterMatches(
        this.matches,
        this.ranked,
        this.home,
        this.higher,
        this.startDate,
        this.endDate,
        this.dayCutoff,
        this.complete,
        this.actualSelfRange,
        this.actualOpponentRange
      );
    },
    details(): string {
      var message = `<i>${this.ranked}</i> ${this.filteredMatches.length} matches`;
      if (this.ranked !== Ranked.All) {
        message = `${this.filteredMatches.length} <i>${this.ranked}</i> matches`;
      }
      if (this.home !== Home.All) {
        if (this.home === Home.Home) {
          message += " that you <i>challenged</i>";
        } else {
          message += " that you <i>accepted</i>";
        }
      }
      if (this.higher !== Higher.All) {
        if (this.higher === Higher.Higher) {
          message += " against <i>higher</i> ranked opponents";
        } else {
          message += " against <i>lower</i> ranked opponents";
        }
      }
      if (
        this.startDate.getTime() == this.earliestDate.getTime() &&
        this.endDate.getTime() != this.latestDate.getTime()
      ) {
        message += ` <i>before</i> ${this.endDate.toDateString()}`;
      } else if (
        this.endDate.getTime() == this.latestDate.getTime() &&
        this.startDate.getTime() != this.earliestDate.getTime()
      ) {
        message += ` <i>after</i> ${this.startDate.toDateString()}`;
      } else if (
        this.startDate.getTime() != this.earliestDate.getTime() &&
        this.endDate.getTime() != this.latestDate.getTime()
      ) {
        message += ` <i>between</i> ${this.startDate.toDateString()} and ${this.endDate.toDateString()}`;
      }
      if (
        this.selfRange[0] != this.selfMin ||
        this.selfRange[1] != this.selfMax
      ) {
        message += ` when you were ${this.selfRange[0]}-${this.selfRange[1]}`;
        if (
          this.opponentRange[0] != this.opponentMin ||
          this.opponentRange[1] != this.opponentMax
        ) {
          message += ` and they were ${this.opponentRange[0]}-${this.opponentRange[1]}`;
        }
      } else if (
        this.opponentRange[0] != this.opponentMin ||
        this.opponentRange[1] != this.opponentMax
      ) {
        message += ` when they were ${this.opponentRange[0]}-${this.opponentRange[1]}`;
      }
      message += `. See your official profile at <a href="url">https://www.elevenvr.net/eleven/${this.id}</a>`;
      return message;
    },
    matchNumber(): number {
      return this.filteredMatches.length;
    },
    formatDetailsHTML(): string {
      if (this.filteredMatches.length == 0) {
        return "Your selection does not match any matches!";
      }
      return `Statistics calculated from ${this.details}`;
    },
    hasRanked(): boolean {
      return this.filteredMatches.filter((m) => m.ranked).length > 0;
    },
    all_match_stats(): MatchStatistics {
      return STATS.ALL_MATCH_STATS(this.filteredMatches, this.dayCutoff);
    },
    all_ranked_stats(): RankedStatistics {
      return STATS.ALL_RANKED_STATS(this.filteredMatches, this.dayCutoff);
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
    selfMin(): number {
      if (this.matches.length == 0) {
        return 0;
      }
      return Math.floor(
        minBy(this.matches, (m) => m.self["match-elo"])!.self["match-elo"]
      );
    },
    selfMax(): number {
      if (this.matches.length == 0) {
        return 0;
      }
      return Math.ceil(
        maxBy(this.matches, (m) => m.self["match-elo"])!.self["match-elo"]
      );
    },
    opponentMin(): number {
      if (this.matches.length == 0) {
        return 0;
      }
      return Math.floor(
        minBy(this.matches, (m) => m.opponent["match-elo"])!.opponent[
          "match-elo"
        ]
      );
    },
    opponentMax(): number {
      if (this.matches.length == 0) {
        return 0;
      }
      return Math.ceil(
        maxBy(this.matches, (m) => m.opponent["match-elo"])!.opponent[
          "match-elo"
        ]
      );
    },
  },
  watch: {
    selfMin(val: number) {
      this.selfRange[0] = val;
      this.actualSelfRange[0] = val;
    },
    selfMax(val: number) {
      this.selfRange[1] = val;
      this.actualSelfRange[1] = val;
    },
    opponentMin(val: number) {
      this.opponentRange[0] = val;
      this.actualOpponentRange[0] = val;
    },
    opponentMax(val: number) {
      this.opponentRange[1] = val;
      this.actualOpponentRange[1] = val;
    },
    selfRange(newValue: Array<number>) {
      this.debounceSelfRange(newValue);
    },
    opponentRange(newValue: Array<number>) {
      this.debounceOpponentRange(newValue);
    },
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
    debounceSelfRange: debounce(function (value: Array<number>) {
      // @ts-ignore
      this.actualSelfRange = value;
    }, 1000),
    debounceOpponentRange: debounce(function (value: Array<number>) {
      // @ts-ignore
      this.actualOpponentRange = value;
    }, 1000),
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
      while (
        nexturl &&
        (this.pullLimit == 0 || matches.length < this.pullLimit)
      ) {
        const currentMatchData = await this.getJSON(nexturl);
        matches.push(...currentMatchData["data"]);
        rounds.push(...currentMatchData["included"]);
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
