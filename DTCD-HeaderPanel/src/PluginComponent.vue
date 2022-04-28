<template>
  <div class="HeaderPanel">
    <Header />
    <MenuPanel />
  </div>
</template>

<script>
import MenuPanel from '@/components/MenuPanel';
import Header from '@/components/Header';
export default {
  name: 'PluginComponent',
  components: { Header, MenuPanel },
};
</script>

<style lang="scss" scoped>
.HeaderPanel {
  &,
  *,
  *::after,
  *::before {
    box-sizing: border-box;
  }
}
</style>
