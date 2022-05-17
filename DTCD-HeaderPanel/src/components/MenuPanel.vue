<template>
  <div class="HeaderBottom">
    <div class="MenuPanel">
      <div class="HomeGroup">
        <button class="ButtonIcon" @click="goToHomePage">
          <span class="FontIcon name_homeFill"></span>
        </button>
      </div>
      <button v-if="showBackButton" class="ButtonIcon type_buttonBack" @click="goBack">
        <span class="FontIcon name_arrowBack"></span>
      </button>

      <div v-if="showPageTitle" class="CurrentPage">
        <div>{{ routeTitle }}</div>
      </div>

      <div class="AdditionalPages">
        <base-dropdown v-if="settingsMode && showPanelSelect" class="DropdownSelect" ref="panelDropdown">
          <span class="DropdownGroup" slot="toggle-btn"> Панели </span>
          <span slot="icon-arrow" class="FontIcon name_chevronDown size_2xs"></span>
          <nav class="NavList type_dropdown">
            <li class="NavItem" v-for="panel in sortedPanels" :key="panels[panel].title">
              <base-dropdown placement="rightStart" class="DropdownSelect">
                <span class="DropdownTitle" slot="toggle-btn">
                  <div class="NavButton">
                    <span class="Text">{{ panels[panel].title }}</span>
                  </div>
                </span>
                <span slot="icon-arrow" class="FontIcon name_chevronDown size_2xs rotate_270"></span>
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
        class="ButtonIcon type_settings"
      >
        <span class="FontIcon name_dashboard"></span>
      </button>

      <button v-if="showSettingsButton" @click="toggleSetting" class="ButtonIcon type_settings">
        <span class="FontIcon name_settingsFilled"></span>
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

  .FontIcon 
    font-size: 19px
    color: var(--text_main)
    
    &.name_dashboard::before
      color: var(--accent)

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
