<template>
  <div class="cardbox p-col-12 p-md-6 p-lg-4">
    <Card class="p-p-2">
      <template #title>Chart Title</template>
      <template #content>
        <vue3-chart-js ref="chartRef" v-bind="{ ...baseData }" />
      </template>
    </Card>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, Ref } from "vue";
import { Card, Dropdown } from "../components/primeIndex";
import Vue3ChartJs, { Vue3Chart } from "@j-t-mcc/vue3-chartjs";
import { ChartConfiguration, ChartData } from "chart.js";
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
    Card,
    Dropdown,
  },
  setup() {
    const chartRef: Ref<Vue3Chart> = ref(null) as unknown as Ref<Vue3Chart>;

    return {
      chartRef
    };
  },
  data() {
    return {
      baseData: {
        type: "bar",
        options: {
        },
        data: {
          labels: [],
          datasets: [],
        },
      } as ChartConfiguration,
    };
  },
  computed: {
    chartData(): ChartData {
      return {
        labels: [],
        datasets: [],
      };
    },
  },
  watch: {
    chartData() {
      this.updateChart();
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
    updateChart() {
      this.baseData.data.labels = this.chartData.labels!;
      this.baseData.data.datasets = this.chartData.datasets!;
      this.chartRef.update();
    },
  },
});
</script>

<style></style>
