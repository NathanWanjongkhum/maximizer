<script setup lang="ts">
import { ref, onMounted } from "vue";
import Sidebar from "./components/Sidebar.vue";
import { init } from "./ts/main";

const overlayLayer = ref(null);
const mainLayer = ref(null);
const staticLayer = ref(null);

onMounted(() => {
  if (overlayLayer.value && mainLayer.value && staticLayer.value)
    init(overlayLayer.value, mainLayer.value, staticLayer.value);
});
</script>

<template>
  <!-- <Sidebar /> -->
  <canvas style="z-index: 10" ref="overlayLayer"></canvas>
  <canvas style="z-index: 1" ref="mainLayer"></canvas>
  <canvas style="z-index: 0" ref="staticLayer"></canvas>
</template>

<style scoped>
canvas {
  width: 100%;
  height: 100%;

  position: absolute;
}
</style>
