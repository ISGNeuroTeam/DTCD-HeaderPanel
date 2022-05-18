import pluginMeta from './Plugin.Meta';
import PluginComponent from './PluginComponent.vue';

import {
  AppPanelPlugin,
  InteractionSystemAdapter,
  EventSystemAdapter,
  WorkspaceSystemAdapter,
  StyleSystemAdapter,
  RouteSystemAdapter,
  AppGUISystemAdapter,
} from './../../DTCD-SDK/index';

export class Plugin extends AppPanelPlugin {
  #vue;
  #workspaceSystem;
  #settings;

  static getRegistrationMeta() {
    return pluginMeta;
  }

  constructor(guid, selector) {
    super(guid, selector);
    const eventSystem = new EventSystemAdapter('0.4.0', guid);
    const interactionSystem = new InteractionSystemAdapter('0.4.0');
    this.#workspaceSystem = new WorkspaceSystemAdapter('0.4.0');
    const styleSystem = new StyleSystemAdapter('0.4.0');
    const router = new RouteSystemAdapter('0.1.0');
    const appGUI = new AppGUISystemAdapter('0.1.0');

    const VueJS = this.getDependence('Vue');

    this.#settings = {
      showPageTitle: false,
      showAddPanelButton: false,
      showBackButton: false,
      showSettingsButton: false,
      showWorkspaceSettings: false,
      showPanelSelect: false,
    };

    const data = {
      plugin: this,
      guid,
      interactionSystem,
      eventSystem,
      workspaceSystem: this.#workspaceSystem,
      styleSystem,
      router,
      appGUI,
    };

    this.#vue = new VueJS.default({
      data: () => data,
      render: h => h(PluginComponent),
    }).$mount(selector);
  }

  setPluginConfig(configuration) {
    this.resetSettings();
    for (let setting in configuration) {
      if (this.#settings.hasOwnProperty(setting)) {
        this.#settings[setting] = configuration[setting];
      }
    }
    this.#vue.$children[0].$children[1].setPanelSettings(this.#settings);
  }

  resetSettings() {
    this.#settings = {
      showPageTitle: false,
      showAddPanelButton: false,
      showBackButton: false,
      showSettingsButton: false,
      showWorkspaceSettings: false,
      showPanelSelect: false,
    };
  }

  getPluginConfig() {}

  setFormSettings() {}

  getFormSettings() {}
}
