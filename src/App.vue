<script setup lang="ts">
import { ref, onMounted } from "vue";
import Sidebar from "./components/Sidebar.vue";
import { init } from "./ts/main";

const view = ref(null);

onMounted(() => {
  if (view.value) init(view.value);
});
</script>

<template>
  <!-- <Sidebar /> -->
  <canvas ref="view"></canvas>
</template>

<style scoped>
canvas {
  width: 100%;
  height: 100%;

  position: absolute;
}
</style>
