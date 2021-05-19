<template>
  <div class="cardbox p-col-12 p-md-6 p-lg-3">
    <Card class="p-p-2"
      >{
      <template #title>On a streak</template>
      <template #content>
        <p v-html="winMessage"></p>
        <p v-html="lossMessage"></p>
      </template>
    </Card>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { Card } from "../components/primeIndex";
import dayjs from "dayjs";
import {
  MatchStatistics,
  PlayerStatistics,
  PointStatistics,
  RankedStatistics,
  RoundStatistics,
} from "../types/statTypes";
import { formatScore } from "../util/parsing";

export default defineComponent({
  name: "StreakCard",
  components: {
    Card,
  },
  computed: {
    winMessage(): String {
      let message = `Your longest <b>win streak</b> lasted
          <b>${this.all_match_stats.winStreak.played}</b> games`;
      if (
        this.all_match_stats.winStreak.startDate.isSame(
          this.all_match_stats.winStreak.endDate
        )
      ) {
        message += ` on <b>${this.all_match_stats.winStreak.startDate.format(
          "YYYY-MM-DD"
        )}</b>.`;
      } else {
        message += `, from <b>${this.all_match_stats.winStreak.startDate.format(
          "YYYY-MM-DD"
        )}</b> to <b>${this.all_match_stats.winStreak.endDate.format(
          "YYYY-MM-DD"
        )}</b>.`;
      }
      if (this.all_match_stats.winStreak.netElo != 0) {
        message += ` In these games, you went from <b>${this.all_match_stats.winStreak.startElo}</b> to <b>${this.all_match_stats.winStreak.endElo}</b>, gaining a total of <b>${this.all_match_stats.winStreak.netElo}</b> ELO`;
      }
      return message;
    },
    lossMessage(): String {
      let message = `Your longest <b>loss streak</b> lasted
          <b>${this.all_match_stats.lossStreak.played}</b> games`;
      if (
        this.all_match_stats.lossStreak.startDate.isSame(
          this.all_match_stats.lossStreak.endDate
        )
      ) {
        message += ` on <b>${this.all_match_stats.lossStreak.startDate.format(
          "YYYY-MM-DD"
        )}</b>.`;
      } else {
        message += `, from <b>${this.all_match_stats.lossStreak.startDate.format(
          "YYYY-MM-DD"
        )}</b> to <b>${this.all_match_stats.lossStreak.endDate.format(
          "YYYY-MM-DD"
        )}</b>.`;
      }
      if (this.all_match_stats.lossStreak.netElo != 0) {
        message += ` In these games, you <b>${this.all_match_stats.winStreak.startElo}</b> to <b>${this.all_match_stats.winStreak.endElo}</b>, losing a total of <b>${this.all_match_stats.lossStreak.netElo}</b> ELO`;
      }
      return message;
    },
  },
  props: {
    ranked: {
      type: String,
      required: true,
    },
    all_match_stats: {
      type: Object as PropType<MatchStatistics>,
      // required: false,
      required: true,
    },
    all_ranked_stats: {
      type: Object as PropType<RankedStatistics>,
      required: false,
      // required: true
    },
    all_player_stats: {
      type: Object as PropType<PlayerStatistics>,
      required: false,
      // required: true
    },
    all_round_stats: {
      type: Object as PropType<RoundStatistics>,
      required: false,
      // required: true
    },
    all_point_stats: {
      type: Object as PropType<PointStatistics>,
      required: false,
      // required: true
    },
  },
  methods: {
    dayjs: dayjs,
    formatScore: formatScore,
  },
});
</script>

<style></style>
