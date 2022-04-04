<template>
  <div>
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
