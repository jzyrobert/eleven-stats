<template>
  <div class="cardbox p-col-12 p-md-6 p-lg-3">
    <Card class="p-p-2">
      <template #title> ELO gains (Not accurate) </template>
      <template #content>
        <DataTable :value="gains">
          <Column field="type" header="" />
          <Column field="average" header="Average" />
          <Column field="total" header="Total" />
        </DataTable>
      </template>
    </Card>
  </div>
</template>

<script lang="ts">
import { defineComponent, Prop, PropType } from "vue";
import { Card, DataTable, Column } from "../components/primeIndex";
import { MatchStatistics, RankedStatistics } from "../types/statTypes"
import dayjs from "dayjs";

export default defineComponent({
  name: "EloGainsCard",
  components: {
    Card,
    DataTable,
    Column
  },
  props: {
    all_match_stats: Object as PropType<MatchStatistics>,
    all_ranked_stats: {
      type: Object as PropType<RankedStatistics>,
      required: true
    },
    all_player_stats: Object,
    all_round_stats: Object,
    all_point_stats: Object,
  },
  methods: {
    dayjs: dayjs,
  },
  computed: {
    gains(): Array<Object> {
      return [
        {
          type: "Gain",
          average: this.all_ranked_stats.average_gain,
          total: this.all_ranked_stats.total_gain,
        },
        {
          type: "Loss",
          average: this.all_ranked_stats.average_loss,
          total: this.all_ranked_stats.total_loss,
        },
        {
          type: "Net",
          average: this.all_ranked_stats.average_change.toLocaleString(
            undefined,
            { maximumFractionDigits: 1, minimumFractionDigits: 1 }
          ),
          total: this.all_ranked_stats.total_change.toLocaleString(undefined, {
            maximumFractionDigits: 1,
            minimumFractionDigits: 1,
          }),
        },
      ];
    },
  }
});
</script>

<style></style>
