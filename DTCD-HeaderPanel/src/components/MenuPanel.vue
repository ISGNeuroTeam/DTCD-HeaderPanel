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
        <base-expander
          v-if="(settingsMode || isWorkspaceInEditMode) && showPanelSelect"
          class="ExpanderSelect"
          ref="panelExpander"
        >
          <span class="ExpanderGroup" slot="summary"> Панели </span>
          <span class="FontIcon name_chevronDown size_2xs" slot="icon-arrow"></span>
          <div
            class="ExpanderScrollContainer"
            :style="{ paddingRight: `${widthInnerExpanderContent}px` }"
          >
            <nav class="NavList type_expander">
              <li class="NavItem" v-for="panel in sortedPanels" :key="panels[panel].title">
                <base-expander
                  class="ExpanderSelect"
                  @toggle="handleTypePanelExpanderToggle"
                >
                  <span class="ExpanderTitle" slot="summary">
                    <div class="NavButton">
                      <span>{{ panels[panel].title }}</span>
                    </div>
                  </span>
                  <span class="IconArrow FontIcon name_chevronDown size_2xs" slot="icon-arrow"></span>
                  <nav class="NavList">
                    <a
                      class="NavButton without_expander"
                      v-for="version in panels[panel].versions.sort(sortedVersions)"
                      :key="version"
                      @click="addPanel(panel, version)"
                    >
                      <span>{{ version }}</span>
                    </a>
                  </nav>
                </base-expander>
              </li>
            </nav>
          </div>
        </base-expander>
      </div>
    </div>

    <div class="EditMenuPanel">
      <base-dropdown
        v-if="showWorkspaceSettings"
        v-show="false"
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

      <base-tooltip
        v-if="showWorkspaceSettings"
        content="Редактировать"
        placement="bottom"
        class="UIElementWrapper with_switch"
      >
        <base-switch
          :checked="isWorkspaceInEditMode"
          @click.stop=""
          @input="handleSettingsModeChange"
        ></base-switch>
      </base-tooltip>

      <base-tooltip
        v-if="showWorkspaceSettings"
        content="Сохранить рабочий стол"
        placement="bottom"
        class="UIElementWrapper"
      >
        <button 
          class="ButtonIcon type_edit"
          @click.stop="handleSaveWorkspaceClick"
        >
          <span class="FontIcon name_save"></span>
        </button>
      </base-tooltip>

      <base-tooltip
        v-if="showSettingsButton"
        content="Настройки"
        placement="bottom"
        class="UIElementWrapper"
      >
        <button 
          v-if="showWorkspaceSettings"
          class="ButtonIcon type_edit"
          :class="settingsMode && 'active'"
          @click.stop="openWorkspaceSettings"
        >
          <span class="FontIcon name_settingsFilled"></span>
        </button>

        <button 
          v-if="!showWorkspaceSettings"
          class="ButtonIcon type_edit"
          :class="settingsMode && 'active'"
          @click="toggleSetting"
        >
          <span class="FontIcon name_settingsFilled"></span>
        </button>
      </base-tooltip>
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
      isWorkspaceInEditMode: false,
      showPageTitle: false,
      showAddPanelButton: false,
      showBackButton: false,
      showSettingsButton: false,
      showWorkspaceSettings: false,
      showPanelSelect: false,
      panels: {},
      widthInnerExpanderContent: 0,
      countOpenedExpanders: 0,
      visibleShareLink: false,
      title: '',
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

    this.$root.$on('onWorkspaceEditModeChange', (event) => {
      this.isWorkspaceInEditMode = event.editMode;
    });
    this.$root.$on('onToggledRightSidebar', (event) => {
      this.settingsMode = event.isOpened;
    });
  },
  computed: {
    routeTitle() {
      if (this.router.getRouteTitle() == 'Рабочий стол') {
        return this.title;
      }
      return this.router.getRouteTitle(); 
    },
    sortedPanels() {
      return Object.keys(this.panels).sort((a, b) => {
        if (this.panels[a].title > this.panels[b].title) return 1;
        if (this.panels[a].title < this.panels[b].title) return -1;
        return 0;
      });
    },
    eventSystem() {
      return window.Application.getSystem('EventSystem', '0.4.0');
    },
    router(){
      return this.$root.router;
    },
    appGUI(){
      return this.$root.appGUI;
    },
    plugin(){
      return this.$root.plugin;
    },
  },
  methods: {
    addPanel(name, version) {
      this.$root.workspaceSystem.instance.createCell({ name, version });
      this.$refs.panelExpander.toggle();
    },
    openWorkspaceSettings() {
      const workspaceGuid = this.$root.workspaceSystem.getGUID();
      
      this.eventSystem.publishEvent(
        workspaceGuid,
        'WorkspaceCellClicked',
        {
          guid: workspaceGuid,
        }
      );

      this.appGUI.toggleSidebar('right', true);
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
      this.appGUI.toggleSidebar('right', true);
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
    handleTypePanelExpanderToggle(event) {
      // countOpenedExpanders нужен, чтобы паддинг не обнулялся,
      // когда открывается другой дропдаун.
      event.detail.opened ? this.countOpenedExpanders++ : this.countOpenedExpanders--;

      if (event.detail.opened) {
        const innerBlock = event.currentTarget.querySelector('.NavList');
        // 10 прибавляется, чтобы тень внутреннего дропдауна не обрезалась.
        this.widthInnerExpanderContent = innerBlock?.clientWidth ? innerBlock?.clientWidth + 10 : 0;
      } else {
        if (this.countOpenedExpanders < 1) this.widthInnerExpanderContent = 0;
      }
    },
    sortedVersions(a, b) {
      const param1 = a.split('.');
      const param2 = b.split('.');

      const length = Math.max(param1.length, param2.length);

      for (let i = 0; i < length; i++) {
        const value = (Number(param1[i]) || 0) - (Number(param2[i]) || 0);
        if (value < 0) return -1;
        if (value > 0) return 1;
      }

      return 0;
    },
    handleSaveWorkspaceClick() {
      this.$root.workspaceSystem.saveConfiguration();
    },
    handleSettingsModeChange() {
      this.$root.workspaceSystem.changeMode();
    }
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
    padding: 3px
    display: inline-flex
    align-items: center
    justify-content: center
    width: 40px
    height: 40px

    &.type_back
      // width: auto
      margin-left: 9px

    &.active,
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
    padding-top: 12px
    z-index: 10

    @media (max-width: 768px)
      column-gap: 10px

    @media (max-width: 576px)
      display: none

  .ExpanderScrollContainer
    max-height: 60vh
    overflow-x: visible
    overflow-y: auto
    position: absolute
    margin-top: 1px

  .ExpanderSelect

    & > *
      cursor: pointer

  .ExpanderTitle
    margin: 3px 8px 3px 16px

  .ExpanderTitle,
  .ExpanderGroup
    font-size: 15px
    font-family: 'Proxima Nova'
    color: var(--text_main)

    @media (max-width: 768px)
      font-size: 13px

  .NavList
    $nav-item-margin: 8px

    &.type_expander
      background-color: var(--background_main)
      border: 1px solid var(--border)
      display: flex
      flex-direction: column
      box-shadow: 1px 1px 2px rgba(8, 18, 55, 0.12), 0px 4px 12px rgba(8, 18, 55, 0.12)
      border-radius: 0px 0px 8px 8px
      padding: 16px 0
      cursor: default
      max-height: inherit
      overflow: auto

    .NavItem
      list-style: none
      padding-right: 14px
      padding-bottom: 8px

      &:hover
        background-color: var(--button_primary_12)

    .NavButton
      display: flex
      font-size: 14px
      line-height: 1.58
      font-weight: 400
      color: var(--text_main)
      cursor: pointer

      &.without_expander
        padding: 3px 16px 3px 20px
        background-color: var(--border_12)
        margin-left: 16px

        &:hover
          background-color: var(--button_primary_24)

        &:not(:last-child)
          margin-bottom: $nav-item-margin

  .IconArrow
    color: var(--accent)

  .EditMenuPanel
    display: flex
    align-items: center

    @media (max-width: 576px)
      display: none

    .UIElementWrapper
      display: inline-flex
      align-items: center
      justify-content: center
      width: 40px
      height: 40px

      &.with_switch
        justify-content: start

  // .ButtonsGroup
  //   .ButtonCancel
  //     padding-right: 20px

  .ShareLinkDropdown
    height: 100%
</style>