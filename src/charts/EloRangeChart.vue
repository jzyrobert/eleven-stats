<template>
  <div class="cardbox p-col-12 p-md-6 p-lg-4">
    <Card class="p-p-2">
      <template #title
        ><Dropdown v-model="choice" :options="choiceOptions" /> against
        different ELO ranges</template
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
import {
  ChartConfiguration,
  ChartData,
  TooltipModel,
  TooltipItem,
  ChartTypeRegistry,
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
  name: "EloRangeChart",
  components: {
    Vue3ChartJs,
    Card,
    Dropdown,
  },
  setup() {
    const chartRef: Ref<Vue3Chart> = ref(null) as unknown as Ref<Vue3Chart>;
    const choice = ref("Games played");
    const choiceOptions = ["Games played", "Winrate", "Elo gained"];

    return {
      choice,
      choiceOptions,
      chartRef,
    };
  },
  data() {
    return {
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
            },
            y: {
              stacked: true,
            },
          },
        },
        data: {
          labels: this.all_player_stats.opponentRanges.map(
            (r) => r.rangeFormatted
          ),
          datasets: [
            {
              label: "Won",
              data: this.all_player_stats.opponentRanges.map((r) => r.won),
              backgroundColor: Array(
                this.all_player_stats.opponentRanges.length
              ).fill("#1fcf39"),
            },
            {
              label: "Lost",
              data: this.all_player_stats.opponentRanges.map((r) => r.lost),
              backgroundColor: Array(
                this.all_player_stats.opponentRanges.length
              ).fill("#c91f1c"),
            },
          ],
        },
      } as ChartConfiguration<"bar">,
    };
  },
  computed: {
    chartData(): ChartData<"bar"> {
      let datasets = [
        {
          label: "Won",
          data: this.all_player_stats.opponentRanges.map((r) => r.won),
          backgroundColor: Array(
            this.all_player_stats.opponentRanges.length
          ).fill("#1fcf39"),
        },
        {
          label: "Lost",
          data: this.all_player_stats.opponentRanges.map((r) => r.lost),
          backgroundColor: Array(
            this.all_player_stats.opponentRanges.length
          ).fill("#c91f1c"),
        },
      ];
      if (this.choice == "Winrate") {
        datasets = [
          {
            label: "Winrate",
            data: this.all_player_stats.opponentRanges.map((r) => r.winrate),
            backgroundColor: Array(
              this.all_player_stats.opponentRanges.length
            ).fill("#177dbd"),
          },
        ];
      } else if (this.choice == "Elo gained") {
        datasets = [
          {
            label: "Gained",
            data: this.all_player_stats.opponentRanges.map((r) => r.eloGained),
            backgroundColor: Array(
              this.all_player_stats.opponentRanges.length
            ).fill("#1fcf39"),
          },
          {
            label: "Lost",
            data: this.all_player_stats.opponentRanges.map((r) => r.eloLost),
            backgroundColor: Array(
              this.all_player_stats.opponentRanges.length
            ).fill("#c91f1c"),
          },
        ];
      }
      return {
        labels: this.all_player_stats.opponentRanges.map(
          (r) => r.rangeFormatted
        ),
        datasets,
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
    formatLabel(
      this: TooltipModel<"bar">,
      tooltipItem: TooltipItem<"bar">
    ): string | string[] {
      if (tooltipItem.dataset.label == "Won") {
        return `Won: ${tooltipItem.formattedValue}`;
      } else if (tooltipItem.dataset.label == "Gained") {
        return `Gained: ${tooltipItem.formattedValue}`;
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
