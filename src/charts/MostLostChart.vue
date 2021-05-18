<template>
  <div class="cardbox p-col-12 p-md-6 p-lg-4">
    <Card class="p-p-2">
      <template #title>Most played opponents</template>
      <template #content>
        <vue3-chart-js v-bind="{ ...chartData }" />
      </template>
    </Card>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from "vue";
import { Card } from "../components/primeIndex";
import Vue3ChartJs from "@j-t-mcc/vue3-chartjs";
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
  name: "MostLostChart",
  components: {
    Vue3ChartJs,
    Card,
  },
  computed: {
    chartData(): Object {
      return {
        type: "bar",
        options: {
          scales: {
            x: {
              stacked: true,
            },
            y: {
              stacked: true,
            },
          },
        },
        data: {
          labels: this.all_player_stats.mostPlayed.mostPlayedList.slice(0, 10),
          datasets: [
            {
              label: "Matches",
              data: this.all_player_stats.mostPlayed.mostPlayedCount.slice(0, 10),
              backgroundColor: Array(10).fill("#1f65cf"),
              stack: "Stack 0",
            },
            {
              label: "Lost",
              data: this.all_player_stats.mostPlayed.mostPlayedLost.slice(0, 10),
              backgroundColor: Array(10).fill("#c91f1c"),
              stack: "Stack 1",
            },
            {
              label: "Won",
              data: this.all_player_stats.mostPlayed.mostPlayedWon.slice(0, 10),
              backgroundColor: Array(10).fill("#1fcf39"),
              stack: "Stack 1",
            },
          ],
        },
      };
    },
  },
  props: {
    all_match_stats: {
      type: Object as PropType<MatchStatistics>,
      required: false,
      // required: true
    },
    all_ranked_stats: {
      type: Object as PropType<RankedStatistics>,
      required: false,
      // required: true
    },
    all_player_stats: {
      type: Object as PropType<PlayerStatistics>,
      //   required: false,
      required: true,
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
