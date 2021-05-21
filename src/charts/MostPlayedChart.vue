<template>
  <div class="cardbox p-col-12 p-md-6 p-lg-6">
    <Card class="p-p-2">
      <template #title
        >Most
        <Dropdown v-model="choice" :options="choiceOptions" />
        opponents</template
      >
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
  name: "MostPlayedChart",
  components: {
    Vue3ChartJs,
    Card,
    Dropdown,
  },
  setup() {
    const chartRef: Ref<Vue3Chart> = ref(null) as unknown as Ref<Vue3Chart>;
    const choice = ref("played");
    const choiceOptions = ["played", "won", "losses"];

    return {
      chartRef,
      choice,
      choiceOptions,
    };
  },
  data() {
    return {
      baseData: {
        type: "bar",
        options: {
          scales: {
            x: {
              stacked: true,
              title: {
                display: true,
                text: "Opponents",
              },
            },
            y: {
              stacked: true,
              title: {
                display: true,
                text: "Matches",
              },
            },
          },
        },
        data: {
          labels: [],
          datasets: [],
        },
      } as ChartConfiguration,
    };
  },
  mounted() {
    this.updateChart()
  },
  computed: {
    chartData(): ChartData {
      const data =
        this.choice == "played"
          ? this.all_player_stats.mostPlayed
          : this.choice == "won"
          ? this.all_player_stats.mostWon
          : this.all_player_stats.mostLost;
      return {
        labels: data.mostPlayedList.slice(0, 10),
        datasets: [
          {
            label: "Won",
            data: data.mostPlayedWon.slice(0, 10) as number[],
            backgroundColor: Array(10).fill("#1fcf39"),
          },
          {
            label: "Lost",
            data: data.mostPlayedLost.slice(0, 10) as number[],
            backgroundColor: Array(10).fill("#c91f1c"),
          },
        ],
      };
    },
  },
  watch: {
    chartData() {
      this.updateChart();
    },
    choice() {
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
