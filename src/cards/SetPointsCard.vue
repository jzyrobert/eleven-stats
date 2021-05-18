<template>
  <div class="cardbox p-col-12 p-md-6 p-lg-3">
    <Card class="p-p-2">
      <template #title>Points...</template>
      <template #content>
        <DataTable :value="pointsTable">
          <Column field="type" header="Set outcome" />
          <Column field="setAverage" header="Average Set points" />
          <Column field="setAverageWon" header="Average points won" />
          <Column field="setAverageWinrate" header="Point Winrate">
            <template #body="{ data }">
              {{ data.setAverageWinrate }}%
            </template>
          </Column>
          <Column field="setTotal" header="Total points" />
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
  name: "SetPointsCard",
  components: {
    Card,
    DataTable,
    Column,
  },
  computed: {
    pointsTable(): Array<Object> {
      return [
        {
          type: "Won",
          setAverage: this.all_point_stats.wonSet.average,
          setAverageWon: this.all_point_stats.wonSet.averageWon,
          setAverageWinrate: this.all_point_stats.wonSet.winrate,
          setTotal: this.all_point_stats.wonSet.total,
        },
        {
          type: "Lost",
          setAverage: this.all_point_stats.lostSet.average,
          setAverageWon: this.all_point_stats.lostSet.averageWon,
          setAverageWinrate: this.all_point_stats.lostSet.winrate,
          setTotal: this.all_point_stats.lostSet.total,
        },
        {
          type: "Overall",
          setAverage: this.all_point_stats.set.average,
          setAverageWon: this.all_point_stats.set.averageWon,
          setAverageWinrate: this.all_point_stats.set.winrate,
          setTotal: this.all_point_stats.set.total,
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
