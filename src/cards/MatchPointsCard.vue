<template>
  <div class="cardbox p-col-12 p-md-6 p-lg-3">
    <Card class="p-p-2">
      <template #title>and more Points</template>
      <template #content>
        <DataTable :value="pointsTable">
          <Column field="type" header="Match outcome" />
          <Column field="matchAverage" header="Average match points" />
          <Column field="matchAverageWon" header="Average points won" />
          <Column field="matchAverageWinrate" header="Point Winrate">
            <template #body="{ data }">
              {{ data.matchAverageWinrate }}%
            </template>
          </Column>
          <Column field="matchTotal" header="Total points" />
        </DataTable>
      </template>
    </Card>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { Card, DataTable, Column } from "../components/primeIndex";
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
  name: "MatchPointsCard",
  components: {
    Card,
    DataTable,
    Column
  },
  computed: {
    pointsTable(): Array<Object> {
      return [
        {
          type: "Won",
          matchAverage: this.all_point_stats.wonMatch.average,
          matchAverageWon: this.all_point_stats.wonMatch.averageWon,
          matchAverageWinrate: this.all_point_stats.wonMatch.winrate,
          matchTotal: this.all_point_stats.wonMatch.total,
        },
        {
          type: "Lost",
          matchAverage: this.all_point_stats.lostMatch.average,
          matchAverageWon: this.all_point_stats.lostMatch.averageWon,
          matchAverageWinrate: this.all_point_stats.lostMatch.winrate,
          matchTotal: this.all_point_stats.lostMatch.total,
        },
        {
          type: "Overall",
          matchAverage: this.all_point_stats.match.average,
          matchAverageWon: this.all_point_stats.match.averageWon,
          matchAverageWinrate: this.all_point_stats.match.winrate,
          matchTotal: this.all_point_stats.match.total,
        },
      ];
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
      // required: false,
      required: true,
    },
  },
  methods: {
    dayjs: dayjs,
    formatScore: formatScore,
  },
});
</script>

<style></style>
