<template>
  <div
    class="cardbox p-col-12 p-md-6 p-lg-3"
  >
    <Card class="p-p-2">
      <template #title>
        <div v-if="all_match_stats.perDay.maxPlayed <= 5">Step it up</div>
        <div v-else>Marathon day</div></template
      >
      <template #content>
        <div v-if="all_match_stats.perDay.maxPlayed <= 5">
          <p>
            You have never played more than
            {{ all_match_stats.perDay.maxPlayed }}
            {{ all_match_stats.perDay.maxPlayed < 2 ? "match" : "matches" }}
            on any day!
          </p>
        </div>
        <div v-else>
          <p>
            The <b>most</b> matches you played was on
            {{ all_match_stats.perDay.maxDate.format("YYYY-MM-DD") }},
            with an impressive
            <b>{{ all_match_stats.perDay.maxPlayed }}</b> matches.
          </p>
          <div v-if="hasRanked">
            <p>
              Of those, you <b>won</b> {{ all_match_stats.perDay.maxWins }},
              with a net ELO change of
              <b>{{ all_match_stats.perDay.maxNetElo }}</b
              >.
            </p>
            <p>
              You started the day with
              <b>{{ all_match_stats.perDay.maxStartElo }}</b> ELO and ended with
              <b>{{ all_match_stats.perDay.maxEndElo }}</b> ELO
            </p>
          </div>
          <p v-else>
            Of those, you <b>won</b> {{ all_match_stats.perDay.maxWins }}.
          </p>
        </div>
      </template>
    </Card>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import Card from "primevue/card";
import {
  MatchStatistics,
  PlayerStatistics,
  PointStatistics,
  RankedStatistics,
  RoundStatistics,
} from "../types/statTypes";
import dayjs from "dayjs";

export default defineComponent({
  name: "MostPlayedCard",
  components: {
    Card,
  },
  props: {
    hasRanked: {
      type: Boolean,
      required: true,
    },
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
      // required: true
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
  },
});
</script>

<style></style>
