<template>
  <div class="cardbox p-col-12 p-md-6 p-lg-3">
    <Card class="p-p-2">
      <template #title>Ready set go</template>
      <template #content>
        <DataTable :value="setTable">
          <Column field="type" header="Match outcome" />
          <Column field="average" header="Average Sets" />
          <Column field="total" header="Total sets" />
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
  name: "CardName",
  components: {
    Card,
    DataTable,
    Column
  },
  computed: {
    setTable(): Array<Object> {
      return [
        {
          type: "Won",
          average: this.all_round_stats.averageRoundsWon,
          total: this.all_round_stats.roundsWon,
        },
        {
          type: "Lost",
          average: this.all_round_stats.averageRoundsLost,
          total:
            this.all_round_stats.roundsPlayed - this.all_round_stats.roundsWon,
        },
        {
          type: "Overall",
          average: this.all_round_stats.averageRounds,
          total: this.all_round_stats.roundsPlayed,
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
  },
});
</script>

<style></style>
