<template>
  <div class="LinkContent">
    <div
      v-if="typeVisibleContent === 'preloader'"
      class="PreloaderContent"
    >
      <span class="FontIcon size_3xl name_cloudUp"></span>
      <div>Подождите несколько секунд.</div>
    </div>

    <div v-if="typeVisibleContent === 'error'">
      {{ errorText }}
    </div>
    
    <div v-if="typeVisibleContent === 'form'">
      <base-textarea
        class="DashboardLinkField"
        rows="5"
        readonly
        :value="this.dashboardUrl"
      ></base-textarea>

      <p class="LinkNote">Не забудьте сохранить настройки рабочего стола, если вы их меняли.</p>

      <base-button
        theme="theme_blueSec"
        @click="handleUrlCopyBtnClick"
      >
        <span slot="icon-left" class="FontIcon name_copy"></span>
        Скопировать ссылку
      </base-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'share-link',
  data() {
    return {
      typeVisibleContent: 'preloader',
      dashboardUrl: '',
      errorText: 'Произошла ошибка формирования ссылки рабочего стола.',
    };
  },
  created() {
    const wssResponse = this.$root.workspaceSystem.instance.getURLDashboardState();
    wssResponse.then((result) => {
      if (result) {
        this.dashboardUrl = result;
        this.typeVisibleContent = 'form';
      } else {
        this.typeVisibleContent = 'error';
      }
    }).catch((error) => {
      console.debug(error);
      this.typeVisibleContent = 'error';
    });
  },
  methods: {
    handleUrlCopyBtnClick() {
      if (!this.dashboardUrl) return;

      navigator.clipboard.writeText(this.dashboardUrl)
        .then(() => {})
        .catch((err) => {
          this.$root.logSystem.instance.error('Error copy to buffer: ' + err.message);
          this.$root.notificationSystem.instance.create(
            'Error.',
            'Произошла ошибка копирования ссылки в буфер обмена.',
            {
              floatMode: true,
              floatTime: 5,
              type: 'error',
            }
          );
        });
    },
  },
}
</script>

<style lang="sass" scoped>
.LinkContent
  color: var(--text_secondary)
  background-color: var(--background_main)
  border: 1px solid var(--border)
  display: flex
  flex-direction: column
  box-shadow: 1px 1px 2px rgba(8, 18, 55, 0.12), 0px 4px 12px rgba(8, 18, 55, 0.12)
  border-radius: 6px
  padding: 10px

  &,
  *,
  *::after,
  *::before
    box-sizing: border-box

  .PreloaderContent
    text-align: center

    .FontIcon.name_cloudUp
      animation: lsd 1s linear infinite

  .DashboardLinkField 
    padding-bottom: 10px

  .LinkNote
    margin: 0 0 10px

@keyframes lsd
  0%
    color: inherit
  50%
    color: var(--success)
  100%
    color: inherit
</style>