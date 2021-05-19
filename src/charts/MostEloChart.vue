<template>
  <div class="cardbox p-col-12 p-md-6 p-lg-4">
    <Card class="p-p-2">
      <template #title
        >Opponents with <Dropdown v-model="direction" :options="directionOptions" />
        <Dropdown v-model="choice" :options="choiceOptions" /> ELO
        gain</template
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
  name: "MostEloChart",
  components: {
    Vue3ChartJs,
    Card,
    Dropdown,
  },
  setup() {
    const chartRef: Ref<Vue3Chart> = ref(null) as unknown as Ref<Vue3Chart>;
    const direction = ref("most");
    const directionOptions = ["most", "least"];

    const choice = ref("total");
    const choiceOptions = ["total", "net", "positive", "negative"];

    return {
      chartRef,
      direction,
      directionOptions,
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
            },
            y: {
              stacked: true,
            },
          },
        },
        data: {
          labels: this.all_ranked_stats.mostElo.mostTotalList.slice(0, 10),
          datasets: [
            {
              label: "Gained",
              data: this.all_ranked_stats.mostElo.mostTotalList
                .slice(0, 10)
                .map((l) => this.all_ranked_stats.mostElo.gains[l].gained),
              backgroundColor: Array(10).fill("#1fcf39"),
            },
            {
              label: "Lost",
              data: this.all_ranked_stats.mostElo.mostTotalList
                .slice(0, 10)
                .map((l) => -1 * this.all_ranked_stats.mostElo.gains[l].lost),
              backgroundColor: Array(10).fill("#c91f1c"),
            },
          ],
        },
      } as ChartConfiguration,
    };
  },
  computed: {
    chartData(): ChartData {
      let data = this.all_ranked_stats.mostElo.mostTotalList;
      if (this.choice == "net") {
        data = this.all_ranked_stats.mostElo.mostNetList;
      } else if (this.choice == "positive") {
        data = this.all_ranked_stats.mostElo.mostGainedList;
      } else if (this.choice == "negative") {
        data = this.all_ranked_stats.mostElo.mostLostList;
      }
      let labels = data.slice(0, 10);
      if (this.direction == "least") {
        labels = data.slice(-10).reverse()
      }
      return {
        labels,
        datasets: [
          {
            label: "Gained",
            data: labels.map(
              (l) => this.all_ranked_stats.mostElo.gains[l].gained
            ),
            backgroundColor: Array(10).fill("#1fcf39"),
          },
          {
            label: "Lost",
            data: labels.map(
              (l) => -1 * this.all_ranked_stats.mostElo.gains[l].lost
            ),
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
  },
  props: {
    all_match_stats: {
      type: Object as PropType<MatchStatistics>,
      required: false,
      // required: true
    },
    all_ranked_stats: {
      type: Object as PropType<RankedStatistics>,
      // required: false,
      required: true,
    },
    all_player_stats: {
      type: Object as PropType<PlayerStatistics>,
      required: false,
      // required: true,
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
