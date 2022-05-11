<template>
  <div class="HeaderBottom">
    <div class="MenuPanel">
      <div class="HomeGroup">
        <button class="ButtonIcon" @click="goToHomePage">
          <svg width="14" height="17" viewBox="0 0 14 17" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0.577663 6.92251L6.411 1.08917C6.73641 0.763855 7.26391 0.763855 7.58933 1.08917L13.4227 6.92251C13.579 7.07875 13.6668 7.29068 13.6668 7.51167V15.5C13.6668 15.9602 13.2937 16.3333 12.8335 16.3333H8.66683V10.5H5.3335V16.3333H1.16683C0.706592 16.3333 0.333496 15.9602 0.333496 15.5V7.51167C0.333496 7.29068 0.421372 7.07875 0.577663 6.92251Z"
            />
          </svg>
        </button>
      </div>
      <button v-if="showBackButton" class="ButtonIcon type_buttonBack" @click="goBack">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M13.5 7C15.2239 7 16.8772 7.68482 18.0962 8.90381C19.3152 10.1228 20 11.7761 20 13.5C20 15.2239 19.3152 16.8772 18.0962 18.0962C16.8772 19.3152 15.2239 20 13.5 20H10V18H13.5C16 18 18 16 18 13.5C18 11 16 9 13.5 9H7.83L10.91 12.09L9.5 13.5L4 8L9.5 2.5L10.92 3.91L7.83 7H13.5ZM6 18H8V20H6V18Z"
            fill="#51515C"
          />
        </svg>
      </button>

      <div v-if="showPageTitle" class="CurrentPage">
        <div>{{ routeTitle }}</div>
      </div>

      <div class="AdditionalPages">
        <base-dropdown v-if="settingsMode && showPanelSelect" class="DropdownSelect" ref="panelDropdown">
          <span class="DropdownGroup" slot="toggle-btn"> Панели </span>
          <svg
            slot="icon-arrow"
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7.00022 9.16572L10.5061 5.65989L9.6818 4.83447L7.00022 7.51781L4.31922 4.83447L3.49438 5.65931L7.00022 9.16572Z"
              fill="#51515C"
            />
          </svg>
          <nav class="NavList type_dropdown">
            <li class="NavItem" v-for="panel in sortedPanels" :key="panels[panel].title">
              <base-dropdown placement="rightStart" class="DropdownSelect">
                <span class="DropdownTitle" slot="toggle-btn">
                  <div class="NavButton">
                    <span class="Text">{{ panels[panel].title }}</span>
                  </div>
                </span>
                <svg
                  class="IconArrow"
                  slot="icon-arrow"
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9.16597 7.00003L5.66013 3.49419L4.83472 4.31844L7.51805 7.00003L4.83472 9.68103L5.65955 10.5059L9.16597 7.00003Z"
                    fill="#51515C"
                  />
                </svg>
                <nav
                  class="NavList type_dropdown"
                  v-for="version in panels[panel].versions"
                  :key="version"
                >
                  <a class="NavButton without_dropdown" @click="addPanel(panel, version)">
                    <span class="Text">{{ version }}</span>
                  </a>
                </nav>
              </base-dropdown>
            </li>
          </nav>
        </base-dropdown>
      </div>
    </div>

    <div class="EditMenuPanel">
      <button
        v-if="settingsMode && showWorkspaceSettings"
        @click.stop="openWorkspaceSettings"
        class="ButtonIcon"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M21 21H13V15H21V21ZM11 21H3V11H11V21ZM21 13H13V3H21V13ZM11 9H3V3H11V9Z"
            fill="#17569B"
          />
        </svg>
      </button>

      <button v-if="showSettingsButton" @click="toggleSetting" class="ButtonIcon type_settings">
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M11.5167 18.3333H8.48335C8.09178 18.3333 7.75298 18.0608 7.66918 17.6783L7.33001 16.1083C6.87756 15.9101 6.44853 15.6622 6.05085 15.3692L4.52001 15.8567C4.14668 15.9757 3.74084 15.8186 3.54501 15.4792L2.02501 12.8533C1.83134 12.5138 1.89806 12.0854 2.18585 11.8208L3.37335 10.7375C3.31934 10.2467 3.31934 9.75156 3.37335 9.26082L2.18585 8.17999C1.89764 7.9153 1.83089 7.48642 2.02501 7.14666L3.54168 4.51916C3.7375 4.17974 4.14335 4.0226 4.51668 4.14166L6.04751 4.62916C6.2509 4.47845 6.46262 4.33934 6.68168 4.21249C6.89196 4.0939 7.10838 3.98653 7.33001 3.89082L7.67001 2.32249C7.7534 1.93996 8.09184 1.66707 8.48335 1.66666H11.5167C11.9082 1.66707 12.2466 1.93996 12.33 2.32249L12.6733 3.89166C12.9073 3.99459 13.1352 4.11089 13.3558 4.23999C13.5619 4.35897 13.7611 4.48945 13.9525 4.63082L15.4842 4.14332C15.8573 4.02471 16.2626 4.18179 16.4583 4.52082L17.975 7.14832C18.1687 7.48789 18.102 7.91625 17.8142 8.18082L16.6267 9.26416C16.6807 9.7549 16.6807 10.2501 16.6267 10.7408L17.8142 11.8242C18.102 12.0887 18.1687 12.5171 17.975 12.8567L16.4583 15.4842C16.2626 15.8232 15.8573 15.9803 15.4842 15.8617L13.9525 15.3742C13.7587 15.5169 13.5573 15.649 13.3492 15.77C13.1307 15.8966 12.9054 16.0109 12.6742 16.1125L12.33 17.6783C12.2463 18.0605 11.9079 18.333 11.5167 18.3333ZM9.99668 6.66666C8.15573 6.66666 6.66335 8.15904 6.66335 9.99999C6.66335 11.8409 8.15573 13.3333 9.99668 13.3333C11.8376 13.3333 13.33 11.8409 13.33 9.99999C13.33 8.15904 11.8376 6.66666 9.99668 6.66666Z"
            fill="#51515C"
          />
        </svg>
      </button>
    </div>

    <!-- <div class="ButtonsGroup">
      <base-button
        class="ButtonCancel"
        size="small"
        theme="theme_secondary"
      >
      Отменить
      </base-button>
      <base-button
        size="small"
        theme="theme_green"
      >
      Сохранить
      </base-button>
    </div> -->
  </div>
</template>

<script>
export default {
  name: 'MenuPanelComponent',
  data({ $root }) {
    return {
      settingsMode: false,
      workspaceTitle: '',
      workspaceSystem: $root.workspaceSystem,
      eventSystem: $root.eventSystem,
      router: $root.router,
      appGUI: $root.appGUI,
      plugin: $root.plugin,
      showPageTitle: false,
      showAddPanelButton: false,
      showBackButton: false,
      showSettingsButton: false,
      showWorkspaceSettings: false,
      showPanelSelect: false,
      panels: {},
    };
  },
  mounted() {
    this.workspaceTitle = this.workspaceSystem.getPluginConfig().title;
    this.plugin
      .getPanels()
      .filter(plugin => Object.getPrototypeOf(plugin.plugin).name === 'PanelPlugin')
      .forEach(panelPlugin => {
        if (this.panels.hasOwnProperty(panelPlugin.name)) {
          this.panels[panelPlugin.name].versions.push(panelPlugin.version);
        } else {
          this.panels[panelPlugin.name] = {
            title: panelPlugin.title,
            versions: [panelPlugin.version],
          };
        }
      });
  },
  computed: {
    routeTitle() {
      return this.router.instance.route.title;
    },
    sortedPanels() {
      return Object.keys(this.panels).sort((a, b) => {
        if (this.panels[a].title > this.panels[b].title) return 1;
        if (this.panels[a].title < this.panels[b].title) return -1;
        return 0;
      });
    },
  },
  methods: {
    addPanel(name, version) {
      this.$root.workspaceSystem.instance.createCell({ name, version });
      this.$refs.panelDropdown.toggle();
    },
    openWorkspaceSettings() {
      const workspaceGuid = this.workspaceSystem.getGUID();
      Application.getSystem('EventSystem', '0.4.0').publishEvent(
        workspaceGuid,
        'WorkspaceCellClicked',
        {
          guid: workspaceGuid,
        }
      );
    },
    setPanelSettings(settings) {
      for (let key in settings) {
        this[key] = settings[key];
      }
    },
    goToHomePage() {
      this.router.navigate('/workspaces');
    },
    goBack() {
      history.back();
    },
    // switchWorkspaceMode() {
    //   this.workspaceSystem.changeMode();
    // },
    toggleSetting() {
      this.settingsMode = !this.settingsMode;
      this.appGUI.toggleSidebar('right', this.settingsMode);
    },
    // applySetting() {
    //   this.workspaceSystem.saveConfiguration();
    //   this.cancelSettings();
    // },
    // cancelSettings() {
    //   this.settingsMode = false;

    //   // if (this.$refs.workspaceModeSwitch.value) {
    //   //   this.workspaceSystem.changeMode();
    //   // }

    //   this.appGUI.toggleSidebar('right');
    // },
  },
};
</script>

<style lang="sass" scoped>
.HeaderBottom
  width: 100vw
  display: flex
  height: 40px
  padding: 0 20px
  background-color: var(--background_main)
  justify-content: space-between
  font-family: 'Proxima Nova'

  &,
  *,
  *::after,
  *::before
    box-sizing: border-box

  svg
    path
      fill: var(--text_main)

  .MenuPanel
    display: flex

  .HomeGroup
    border-left: 1px solid var(--background_secondary)
    border-right: 1px solid var(--background_secondary)
    display: flex
    height: 100%

  .ButtonIcon
    border: none
    cursor: pointer
    background-color: transparent
    padding: 0 12px
    align-items: center
    display: flex

    &.type_buttonBack
      width: auto
      margin-left: 9px

    &.type_settings
      height: 100%

      @media (max-width: 576px)
        display: none

    &:hover
      background: rgba(198, 198, 212, 0.2)

  .CurrentPage
    display: flex
    align-items: center
    color: var(--text_main)
    padding: 0px 5px 0 15px
    margin-right: 56px
    font-weight: 700
    font-size: 17px
    line-height: 1
    flex: none

    @media (max-width: 768px)
      margin-right: 10px
      font-size: 15px

  .AdditionalPages
    display: flex
    align-items: center
    column-gap: 30px

    @media (max-width: 768px)
      column-gap: 10px

    @media (max-width: 576px)
      display: none

  .DropdownSelect
    fill: var(--text_main)
    display: contents

    & > *
      cursor: pointer

  .DropdownGroup
    margin-right: 5px

  .DropdownTitle
    margin: 3px 8px 3px 16px

  .DropdownTitle,
  .DropdownGroup
    font-size: 15px
    font-family: 'Proxima Nova'
    color: var(--text_main)
    display: flex
    align-items: center

    @media (max-width: 768px)
      font-size: 13px

  .NavList

    $nav-item-height: 28px
    $nav-item-margin: 8px

    // max-height: 10 * ($nav-item-height + $nav-item-margin) + 16px
    // overflow-y: auto

    &.type_dropdown
      background-color: var(--background_main)
      border: 1px solid var(--border)
      display: flex
      flex-direction: column
      box-shadow: 1px 1px 2px rgba(8, 18, 55, 0.12), 0px 4px 12px rgba(8, 18, 55, 0.12)
      border-radius: 8px
      padding: 16px 0
      cursor: default

    .NavItem
      list-style: none
      height: $nav-item-height

      &:hover
        background-color: var(--button_primary_12)

      &:not(:last-child)
        margin-bottom: $nav-item-margin

    .NavButton
      display: flex
      font-size: 14px
      line-height: 1.58
      font-weight: 400
      color: var(--text_main)
      cursor: pointer
      align-items: center
      text-align: initial

      &.without_dropdown
        padding: 3px 16px
        height: $nav-item-height

        &:hover
          background-color: var(--button_primary_12)

        &:not(:last-child)
          margin-bottom: $nav-item-margin

    .Text
      padding-left: 8px

    svg
      path
        fill: var(--accent)

  .IconArrow
    margin-right: 16px
    transform: rotateX( 180deg)

  .EditMenuPanel
    display: flex
    align-items: center

  .ButtonsGroup
    .ButtonCancel
      padding-right: 20px
</style>
