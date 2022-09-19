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
} from './../../DTCD-SDK/index';

export class Plugin extends AppPanelPlugin {
  #vue;
  #workspaceSystem;

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
    const interactionSystem = new InteractionSystemAdapter('0.4.0');
    this.#workspaceSystem = new WorkspaceSystemAdapter('0.4.0');
    const styleSystem = new StyleSystemAdapter('0.4.0');
    const router = new RouteSystemAdapter('0.1.0');
    const appGUI = new AppGUISystemAdapter('0.1.0');
    const notificationSystem = new NotificationSystemAdapter('0.1.0');

    eventSystem.registerPluginInstance(this, [
      'newNotify',
      'removeNotify',
      'clearNotifyList',
    ]);

    const guidNotifySystem = this.getGUID(this.getSystem('NotificationSystem', '0.1.0'));
    eventSystem.subscribe(guidNotifySystem, 'newNotify', guid, 'onNewNotify');
    eventSystem.subscribe(guidNotifySystem, 'removeNotify', guid, 'onRemoveNotify');
    eventSystem.subscribe(guidNotifySystem, 'clearNotifyList', guid, 'onClearNotifyList');

    const VueJS = this.getDependence('Vue');

    const data = {
      plugin: this,
      guid,
      interactionSystem,
      eventSystem,
      workspaceSystem: this.#workspaceSystem,
      styleSystem,
      router,
      appGUI,
      notificationSystem,
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
}
