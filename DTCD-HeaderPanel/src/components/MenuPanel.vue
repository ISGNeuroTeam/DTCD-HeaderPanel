<template>
  <div class="HeaderBottom">
    <div class="MenuPanel">
      <div class="HomeGroup">
        <button class="ButtonIcon" @click="goToHomePage">
          <span class="FontIcon name_homeFill"></span>
        </button>
      </div>
      <button v-if="showBackButton" class="ButtonIcon type_back" @click="goBack">
        <span class="FontIcon name_arrowBack"></span>
      </button>

      <div v-if="showPageTitle" class="CurrentPage">
        <div>{{ routeTitle }}</div>
      </div>

      <div class="AdditionalPages">
        <base-dropdown
          v-if="settingsMode && showPanelSelect"
          class="PanelDropdownSelect"
          ref="panelDropdown"
        >
          <span class="DropdownGroup" slot="toggle-btn"> Панели </span>
          <div
            class="DropdownScrollContainer"
            :style="{ paddingRight: `${widthInnerDropdownContent}px` }"
          >
            <nav class="NavList type_dropdown">
              <li class="NavItem" v-for="panel in sortedPanels" :key="panels[panel].title">
                <base-dropdown
                  placement="rightStart"
                  class="PanelDropdownSelect"
                  @toggle="handleTypePanelDropdownToggle"
                >
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
                  <nav class="NavList type_dropdown">
                    <a
                      class="NavButton without_dropdown"
                      v-for="version in panels[panel].versions.sort()"
                      :key="version"
                      @click="addPanel(panel, version)"
                    >
                      <span class="PanelVersion">{{ version }}</span>
                    </a>
                  </nav>
                </base-dropdown>
              </li>
            </nav>
          </div>
        </base-dropdown>
      </div>
    </div>

    <div class="EditMenuPanel">
      <base-dropdown
        v-if="showWorkspaceSettings"
        alignment="right"
        class="ShareLinkDropdown"
        @toggle="(event) => this.visibleShareLink = event.detail.opened"
      >
        <button
          class="ButtonIcon type_edit"
          slot="toggle-btn"
        >
          <span class="FontIcon name_share"></span>
        </button>
        <span slot="icon-arrow"></span>
        <share-link v-if="visibleShareLink"/>
      </base-dropdown>

      <button
        v-if="settingsMode && showWorkspaceSettings"
        class="ButtonIcon type_edit"
        @click.stop="openWorkspaceSettings"
      >
        <span class="FontIcon name_dashboard"></span>
      </button>

      <button 
        v-if="showSettingsButton"
        class="ButtonIcon type_edit"
        @click="toggleSetting"
      >
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
import ShareLink from './ShareLink.vue';
export default {
  components: { ShareLink },
  name: 'MenuPanelComponent',
  data({ $root }) {
    return {
      settingsMode: false,
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
      widthInnerDropdownContent: 0,
      countOpenedDropdowns: 0,
      visibleShareLink: false,
    };
  },
  mounted() {
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
      return this.router.getRouteTitle();
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
      const workspaceGuid = this.$root.workspaceSystem.getGUID();
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
    //   this.$root.workspaceSystem.changeMode();
    // },
    toggleSetting() {
      this.settingsMode = !this.settingsMode;
      this.appGUI.toggleSidebar('right', this.settingsMode);
    },
    // applySetting() {
    //   this.$root.workspaceSystem.saveConfiguration();
    //   this.cancelSettings();
    // },
    // cancelSettings() {
    //   this.settingsMode = false;

    //   // if (this.$refs.workspaceModeSwitch.value) {
    //   //   this.$root.workspaceSystem.changeMode();
    //   // }

    //   this.appGUI.toggleSidebar('right');
    // },
    handleTypePanelDropdownToggle(event) {
      // countOpenedDropdowns нужен, чтобы паддинг не обнулялся,
      // когда открывается другой дропдаун.
      event.detail.opened ? this.countOpenedDropdowns++ : this.countOpenedDropdowns--;

      if (event.detail.opened) {
        const innerBlock = event.currentTarget.querySelector('.NavList');
        // 10 прибавляется, чтобы тень внутреннего дропдауна не обрезалась.
        this.widthInnerDropdownContent = innerBlock?.clientWidth ? innerBlock?.clientWidth + 10 : 0;
      } else {
        if (this.countOpenedDropdowns < 1) this.widthInnerDropdownContent = 0;
      }
    },
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

    &.name_copy
      color: var(--button_primary)

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
    height: 100%

    &.type_back
      width: auto
      margin-left: 9px

    &.type_edit

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
    z-index: 10

    @media (max-width: 768px)
      column-gap: 10px

    @media (max-width: 576px)
      display: none

  .DropdownScrollContainer
    max-height: 60vh
    overflow-x: visible
    overflow-y: auto
    direction: rtl

    & > .NavList.type_dropdown
      direction: ltr

  .PanelDropdownSelect
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
    $nav-item-margin: 8px

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

        &:hover
          background-color: var(--button_primary_12)

        &:not(:last-child)
          margin-bottom: $nav-item-margin

  .PanelVersion
    padding-left: 8px

  svg
    path
      fill: var(--accent)

  .IconArrow
    margin-right: 16px

  .EditMenuPanel
    display: flex
    align-items: center

  .ButtonsGroup
    .ButtonCancel
      padding-right: 20px

  .ShareLinkDropdown
    height: 100%
</style>
