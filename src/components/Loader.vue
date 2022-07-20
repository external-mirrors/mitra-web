<template>
  <div class="loader">
    <div></div>
    <div></div>
  </div>
</template>

<style scoped lang="scss">
@import "../styles/theme";

/* https://github.com/loadingio/css-spinner/blob/master/dist/ripple.html */

$loader-color: #999;
$loader-size: 80px;
$loader-width: 4px;

.loader {
  height: $loader-size;
  position: relative;
  width: $loader-size;
}

.loader div {
  animation: loader 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;
  border: $loader-width solid $loader-color;
  border-radius: 50%;
  opacity: 1;
  position: absolute;
}

.loader div:nth-child(2) {
  animation-delay: -0.5s;
}

@keyframes loader {
  0% {
    height: 0;
    left: $loader-size / 2 - $loader-width;
    opacity: 1;
    top: $loader-size / 2 - $loader-width;
    width: 0;
  }

  100% {
    height: $loader-size - $loader-width * 2;
    left: 0;
    opacity: 0;
    top: 0;
    width: $loader-size - $loader-width * 2;
  }
}
</style>
