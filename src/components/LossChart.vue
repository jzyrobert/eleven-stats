<script>
import { defineComponent, ref } from "vue";
import { Pie } from "vue3-chart-v2";

export default defineComponent({
  name: "LossChart",
  extends: Pie,
  mounted() {
    this.renderChart({
      labels: [
        "Hitting the bed",
        "Couldn't return serve",
        "Dog distracted you",
        "Arrow to the knee",
      ],
      datasets: [
        {
          backgroundColor: ["#41B883", "#E46651", "#00D8FF", "#DD1B16"],
          data: [30, 20, 25, 15],
        },
      ],
    });
  },
});
</script>

<style></style>
