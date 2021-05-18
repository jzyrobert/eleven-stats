<template>
    <div class="cardbox p-col-12 p-md-6 p-lg-4">
      <Card class="p-p-2">
        <template #title>Chart Title</template>
        <template #content>
          <vue3-chart-js v-bind="{ ...chartData }" />
        </template>
      </Card>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { Card } from "../components/primeIndex"
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
  name: "Chart",
  components: {
    Vue3ChartJs,
    Card
  },
  setup() {
    const chartData = {
      type: "TYPE",
      data: {
        labels: [
        ],
        datasets: [
        ],
      },
    };
    return {
      chartData,
    };
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
