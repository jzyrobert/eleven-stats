<template>
  <div class="cardbox p-col-12 p-md-12 p-lg-12">
    <Card class="p-p-2">
      <template #title>Match graph</template>
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
import {
  ChartConfiguration,
  ChartData,
  TooltipItem,
  TooltipModel,
} from "chart.js";
import dayjs from "dayjs";
import {
  GraphMatchData,
  MatchStatistics,
  PlayerStatistics,
  PointStatistics,
  RankedStatistics,
  RoundStatistics,
} from "../types/statTypes";
import { formatScore } from "../util/parsing";

export default defineComponent({
  name: "MatchGraphChart",
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
      baseData: {
        type: "line",
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
            y: {
              title: {
                display: true,
                text: "Match ELO",
              },
            },
            x: {
              title: {
                display: true,
                text: "Match number",
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
    this.updateChart();
  },
  computed: {
    chartData(): ChartData {
      return {
        labels: [
          ...Array(this.all_match_stats.playedGraph.selfElos.length).keys(),
        ].map((x) => x + 1),
        datasets: [
          {
            type: "line",
            label: "Self ELO",
            // @ts-ignore
            data: this.all_match_stats.playedGraph.selfElos,
            backgroundColor: Array(
              this.all_match_stats.playedGraph.wonMatches.length
            ).fill("#177dbd"),
            parsing: {
              xAxisKey: "id",
              yAxisKey: "elo",
            },
          },
          {
            type: "scatter",
            label: "Won match",
            // @ts-ignore
            data: this.all_match_stats.playedGraph.wonMatches,
            backgroundColor: Array(
              this.all_match_stats.playedGraph.wonMatches.length
            ).fill("#1fcf39"),
            parsing: {
              xAxisKey: "id",
              yAxisKey: "oppElo",
            },
          },
          {
            type: "scatter",
            label: "Lost match",
            // @ts-ignore
            data: this.all_match_stats.playedGraph.lostMatches,
            backgroundColor: Array(
              this.all_match_stats.playedGraph.lostMatches.length
            ).fill("#c91f1c"),
            parsing: {
              xAxisKey: "id",
              yAxisKey: "oppElo",
            },
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
    formatLabel(
      this: TooltipModel<"bar">,
      tooltipItem: TooltipItem<"bar">
    ): string | string[] {
      if (tooltipItem.dataset.label == "Won match") {
        const match = tooltipItem.dataset.data[
          tooltipItem.dataIndex
        ] as unknown as GraphMatchData;
        return [
          `Opponent: ${match.oppName}`,
          `Opponent ELO: ${tooltipItem.formattedValue}`,
          `Self ELO: ${match.selfElo}`,
          `ELO gain: ${match.eloGain}`,
          `Match score: ${match.matchScore}`,
        ];
      } else if (tooltipItem.dataset.label == "Lost match") {
        const match = tooltipItem.dataset.data[
          tooltipItem.dataIndex
        ] as unknown as GraphMatchData;
        return [
          `Opponent: ${match.oppName}`,
          `Opponent ELO: ${tooltipItem.formattedValue}`,
          `Self ELO: ${match.selfElo}`,
          `ELO loss: ${match.eloGain}`,
          `Match score: ${match.matchScore}`,
        ];
      } else if (tooltipItem.dataset.label == "Self ELO") {
        return [
          `Self ELO: ${tooltipItem.formattedValue}`,
          `Match date: ${
            (
              tooltipItem.dataset.data[tooltipItem.dataIndex] as unknown as {
                date: string;
              }
            ).date
          }`,
        ];
      }
      return tooltipItem.formattedValue;
    },
  },
});
</script>

<style></style>
