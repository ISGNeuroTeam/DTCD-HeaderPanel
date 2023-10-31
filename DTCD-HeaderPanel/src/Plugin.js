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
  NotificationSystemAdapter,
  LogSystemAdapter,
  StorageSystemAdapter,
} from './../../DTCD-SDK/index';

export class Plugin extends AppPanelPlugin {
  #vue;
  #workspaceSystem;
  #interactionSystem;
  #storageSystem;
  #logSystem;
  #keycloak;
  #idAuthorizedUser = null;

  #settings = {
    showPageTitle: false,
    showAddPanelButton: false,
    showBackButton: false,
    showSettingsButton: false,
    showWorkspaceSettings: false,
    showPanelSelect: false,
    notificationPosition: 'right top',
  };

  static getRegistrationMeta() {
    return pluginMeta;
  }

  constructor(guid, selector) {
    super(guid, selector);
    const eventSystem = new EventSystemAdapter('0.4.0', guid);
    this.#interactionSystem = new InteractionSystemAdapter('0.4.0');
    this.#workspaceSystem = new WorkspaceSystemAdapter('0.17.0');
    this.#storageSystem = new StorageSystemAdapter('0.9.0');
    const styleSystem = new StyleSystemAdapter('0.4.0');
    const router = new RouteSystemAdapter('0.1.0');
    const appGUI = new AppGUISystemAdapter('0.1.0');
    const notificationSystem = new NotificationSystemAdapter('0.1.0');
    const keycloak = this.getDependence('keycloak');

    this.#keycloak = keycloak;
    this.#logSystem = new LogSystemAdapter('0.7.0', guid, Plugin.getRegistrationMeta().name);

    eventSystem.registerPluginInstance(this, [
      'newNotify',
      'removeNotify',
      'clearNotifyList',
    ]);

    const guidNotifySystem = this.getGUID(this.getSystem('NotificationSystem', '0.1.0'));
    eventSystem.subscribe({
      eventGUID: guidNotifySystem,
      eventName: 'newNotify',
      actionGUID: guid,
      actionName: 'onNewNotify',
      subsctiptionType: 'system',
    });
    eventSystem.subscribe({
      eventGUID: guidNotifySystem,
      eventName: 'removeNotify',
      actionGUID: guid,
      actionName: 'onRemoveNotify',
      subsctiptionType: 'system',
    });
    eventSystem.subscribe({
      eventGUID: guidNotifySystem,
      eventName: 'clearNotifyList',
      actionGUID: guid,
      actionName: 'onClearNotifyList',
      subsctiptionType: 'system',
    });
    eventSystem.subscribe({
      eventGUID: this.#workspaceSystem.getGUID(),
      eventName: 'WorkspaceEditModeChanged',
      actionGUID: guid,
      actionName: 'onWorkspaceEditModeChange',
      subsctiptionType: 'system',
    });
    eventSystem.subscribe({
      eventGUID: appGUI.instance.guid,
      eventName: 'ToggledRightSidebar',
      actionGUID: guid,
      actionName: 'onToggledRightSidebar',
      subsctiptionType: 'system',
    });

    const VueJS = this.getDependence('Vue');

    const data = {
      plugin: this,
      guid,
      interactionSystem: this.#interactionSystem,
      eventSystem,
      workspaceSystem: this.#workspaceSystem,
      storageSystem: this.#storageSystem,
      styleSystem,
      router,
      appGUI,
      notificationSystem,
      keycloak,
      logSystem: this.#logSystem,
      settings: this.#settings,
    };

    this.#vue = new VueJS.default({
      data: () => data,
      render: h => h(PluginComponent),
      methods: {
        setPanelSettings(settings) {
          for (let key in settings) {
            this.settings[key] = settings[key];
          }
        },
      }
    }).$mount(selector);

    this.#setSettingsFromLS();
  }

  onNewNotify(obj) {
    this.#vue.$emit('onNewNotify', obj)
  }

  onRemoveNotify(id) {
    this.#vue.$emit('onRemoveNotify', id)
  }

  onClearNotifyList(id) {
    this.#vue.$emit('onClearNotifyList')
  }

  onWorkspaceEditModeChange(event) {
    this.#vue.$emit('onWorkspaceEditModeChange', event);
  }

  onToggledRightSidebar(event) {
    this.#vue.$emit('onToggledRightSidebar', event);
  }

  showTitle(title) {
    this.#vue.$children[0].$children[1].title = title;
  }

  setPluginConfig(configuration) {
    for (let setting in configuration) {
      if (this.#settings.hasOwnProperty(setting)) {
        this.#settings[setting] = configuration[setting];
      }
    }
    this.#vue.setPanelSettings(this.#settings);
    this.#vue.$children[0].$children[1].setPanelSettings(this.#settings);
  }

  getPluginConfig() {
    return { ...this.#settings };
  }

  setFormSettings(config) {
    this.setPluginConfig(config);
    this.#saveConfigToLS();
  }

  getFormSettings() {
    return {
      fields: [
        {
          component: 'title',
          innerText: 'Уведомления',
        },
        {
          component: 'select',
          propName: 'notificationPosition',
          options: [
            { label: 'Top right', value: 'top right' },
            { label: 'Bottom right', value: 'bottom right' },
            { label: 'Top left', value: 'top left' },
            { label: 'Bottom left', value: 'bottom left' },
          ],
        },
      ]
    }
  }

  #getIdAuthorizedUser = async () => {
    const userData = await this.#keycloak.loadUserProfile();
    this.#idAuthorizedUser = userData.id;
  }

  #saveConfigToLS = async () => {
    if (this.#idAuthorizedUser == null) await this.#getIdAuthorizedUser();
    if (this.#idAuthorizedUser == null) return;

    // not all settings from object '#settings' need to be saved to localStorage
    const settingsToSave = {
      notificationPosition: this.#settings.notificationPosition,
    };

    window.localStorage.setItem(
      `${this.#idAuthorizedUser}:headerPanelConfig`,
      JSON.stringify(settingsToSave)
    );
  }

  #setSettingsFromLS = async () => {
    if (this.#idAuthorizedUser == null) await this.#getIdAuthorizedUser();
    if (this.#idAuthorizedUser == null) return;

    const jsonSettings = window.localStorage.getItem(
      `${this.#idAuthorizedUser}:headerPanelConfig`
    );
    if (jsonSettings) {
      this.setPluginConfig(JSON.parse(jsonSettings));
    }
  }
}
