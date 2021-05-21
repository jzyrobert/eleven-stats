<template>
  <div class="cardbox p-col-12 p-md-6 p-lg-6">
    <Card class="p-p-2">
      <template #title
        ><Dropdown v-model="choice" :options="choiceOptions" /> point
        differences</template
      >
      <template #content>
        <vue3-chart-js
          style="height: 100%"
          ref="chartRef"
          v-bind="{ ...baseData }"
        />
      </template>
    </Card>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, Ref } from "vue";
import { Card, Dropdown } from "../components/primeIndex";
import Vue3ChartJs, { Vue3Chart } from "@j-t-mcc/vue3-chartjs";
import {
  ChartConfiguration,
  ChartData,
  ChartDataset,
  TooltipItem,
  TooltipModel,
} from "chart.js";
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
  name: "PointDiffChart",
  components: {
    Vue3ChartJs,
    Card,
    Dropdown,
  },
  setup() {
    const chartRef: Ref<Vue3Chart> = ref(null) as unknown as Ref<Vue3Chart>;

    return {
      chartRef,
    };
  },
  data() {
    return {
      choice: "Set wins and losses over",
      choiceOptions: [
        "Set wins and losses over",
        "Set winrate over",
        "Set wins and losses over previous set",
        "Set winrate over previous set",
      ],
      baseData: {
        type: "bar",
        options: {
          plugins: {
            tooltip: {
              callbacks: {
                label: this.formatLabel as (
                  this: TooltipModel<"bar">,
                  tooltipItem: TooltipItem<"bar">
                ) => string | string[],
              },
            },
          },
          scales: {
            x: {
              stacked: true,
              title: {
                // display: true,
                text: "Set Point difference",
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
      } as ChartConfiguration<"bar">,
    };
  },
  mounted() {
    this.updateChart();
  },
  computed: {
    chartData(): ChartData<"bar"> {
      let data: ChartDataset<"bar">[] = [
        {
          label: "Won",
          data: this.all_round_stats.differenceStats.pointDiffWins.map(
            (d) => d.stat
          ),
          backgroundColor: Array(10).fill("#1fcf39"),
        },
        {
          label: "Lost",
          data: this.all_round_stats.differenceStats.pointDiffLoss.map(
            (d) => d.stat
          ),
          backgroundColor: Array(10).fill("#c91f1c"),
        },
      ];
      if (this.choice == this.choiceOptions[1]) {
        data = [
          {
            label: "Winrate",
            data: this.all_round_stats.differenceStats.pointDiffWinrate.map(
              (d) => d.stat
            ),
            backgroundColor: Array(10).fill("#177dbd"),
          },
        ];
      } else if (this.choice == this.choiceOptions[2]) {
        data = [
          {
            label: "Won",
            data: this.all_round_stats.differenceStats.prevPointDiffWins.map(
              (d) => d.stat
            ),
            backgroundColor: Array(10).fill("#1fcf39"),
          },
          {
            label: "Lost",
            data: this.all_round_stats.differenceStats.prevPointDiffLoss.map(
              (d) => d.stat
            ),
            backgroundColor: Array(10).fill("#c91f1c"),
          },
        ];
      } else if (this.choice == this.choiceOptions[3]) {
        data = [
          {
            label: "Winrate",
            data: this.all_round_stats.differenceStats.prevPointDiffWinrate.map(
              (d) => d.stat
            ),
            backgroundColor: Array(10).fill("#177dbd"),
          },
        ];
      }
      return {
        labels: this.all_round_stats.differenceStats.pointDiffs,
        datasets: data,
      };
    },
  },
  watch: {
    chartData() {
      this.updateChart();
    },
    // activeIndex() {
    //   this.updateChart();
    // },
  },
  props: {
    activeIndex: {
      type: Number,
      required: true,
    },
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
      // required: true,
    },
    all_round_stats: {
      type: Object as PropType<RoundStatistics>,
      // required: false,
      required: true,
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
    updateAxis() {
      if (
        this.choice == this.choiceOptions[1] ||
        this.choice == this.choiceOptions[3]
      ) {
        this.baseData.options!.scales!.y!.title!.text = "Winrate";
      } else {
        this.baseData.options!.scales!.y!.title!.text = "Matches";
      }
      if (
        this.choice == this.choiceOptions[2] ||
        this.choice == this.choiceOptions[3]
      ) {
        this.baseData.options!.scales!.x!.title!.text =
          "Previous set point difference";
      } else {
        this.baseData.options!.scales!.x!.title!.text = "Set point difference";
      }
      if (this.activeIndex == 1) {
        this.baseData.options!.scales!.x!.title!.display = true;
        this.chartRef.update();
      }
    },
    updateChart() {
      this.baseData.data.labels = this.chartData.labels!;
      this.baseData.data.datasets = this.chartData.datasets!;
      this.chartRef.update();
      // this.updateAxis();
    },
    formatLabel(
      this: TooltipModel<"bar">,
      tooltipItem: TooltipItem<"bar">
    ): string | string[] {
      if (tooltipItem.dataset.label == "Won") {
        return `Won: ${tooltipItem.formattedValue}`;
      } else if (tooltipItem.dataset.label == "Lost") {
        return `Lost: ${tooltipItem.formattedValue}`;
      } else if (tooltipItem.dataset.label == "Winrate") {
        return `Winrate: ${tooltipItem.formattedValue}%`;
      }
      return tooltipItem.formattedValue;
    },
  },
});
</script>

<style></style>
