<template>
  <div class="NotificationBell" @click="keepOpen = 2">
    <button
      class="button-icon"
      @click.prevent="clickOnIcon()"
    >
      <span
        class="FontIcon name_notification"
        :class="iconClasses"
      ></span>
    </button>

    <div
      v-if="showList"
      class="notification-scrolling"
    >
      <div class="notification-list">
        <div class="btn-header">
          <base-button
              v-if="notifications.length >= 5"
              class="clear-btn"
              @click.prevent="$root.notificationSystem.clearList()"
          >
            Удалить все
          </base-button>
        </div>
        <div
          v-if="notificationList.length === 0"
          class="empty-text"
        >
          Уведомлений нет
        </div>
        <transition-group name="list" tag="div">
          <div
              v-for="{ title, body, className, id, hasAction } of notificationList"
              :key="id"
              class="notification-item"
              :class="className"
          >
            <a
                href="#"
                class="close-btn"
                @click.prevent="$root.notificationSystem.remove(id)"
            >✕</a>
            <div
                class="title"
                :class="{
              'has-action': hasAction,
            }"
                @click.prevent="onClick(id)"
            >{{ title }}</div>
            <div v-if="body" class="body-text">
              <vue-show-more-text
                  :text="body"
                  :lines="4"
                  additional-container-css="padding:0;"
                  additional-anchor-css="padding:8px 8px 0 8px;"
              />
            </div>
          </div>
        </transition-group>
      </div>
    </div>

    <div :class="`notification-list floating-list ${settings.notificationPosition}`">
      <transition-group name="list" tag="div">
        <div
            v-for="{ title, body, className, id, hasAction } of notificationFloatList"
            :key="id"
            class="notification-item"
            :class="className"
        >
          <a
              href="#"
              class="close-btn"
              @click.prevent="$root.notificationSystem.remove(id)"
          >✕</a>
          <div
              class="title"
              :class="{
              'has-action': hasAction,
            }"
              @click.prevent="onClick(id)"
          >{{ title }}</div>
          <div v-if="body" class="body-text">
            <vue-show-more-text
                :text="body"
                :lines="4"
                additional-container-css="padding:0;"
                additional-anchor-css="padding:8px 8px 0 8px;"
            />
          </div>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script>
import vueShowMoreText from 'vue-show-more-text';

export default {
  name: "NotificationBell",
  components: {
    vueShowMoreText,
  },
  data({ $root }) {
    return {
      showList: false,
      notifications: [],
      keepOpen: 2,
      settings: $root.settings,
    }
  },
  computed: {
    settings() {
      return this.$root.settings
    },
    notificationList() {
      const list = this.notifications
        .map(({ title, body, options = {} }, i) => ({
          title,
          body,
          className: options.type || 'info',
          id: options.id,
          hasAction: typeof options.action === 'function',
        }));
      return list.reverse()
    },
    notificationFloatList() {
      const list = this.notifications
        .filter(({ options }) => !this.showList && options.floatMode)
        .map(({ title, body, options = {} }, i) => ({
          title,
          body,
          className: options.type || 'info',
          id: options.id,
          hasAction: typeof options.action === 'function',
        }));
      if (this.$root.settings.notificationPosition.includes('top')) {
        return list.reverse();
      }
      return list;
    },
    iconClasses() {
      const {
        notifications,
      } = this;
      return {
        indication: !!notifications.length,
        'has-success': notifications.findIndex(({options}) => options.type === 'success') !== -1,
        'has-warning': notifications.findIndex(({options}) => options.type === 'warning') !== -1,
        'has-error': notifications.findIndex(({options}) => options.type === 'error') !== -1,
      };
    },
  },
  mounted() {
    this.notifications = this.$root.notificationSystem.getList();
    this.$root.$on('onNewNotify', this.addItem);
    this.$root.$on('onRemoveNotify', this.removeNotification);
    this.$root.$on('onClearNotifyList', this.clearNotifyList);
    document.addEventListener('click', this.outsideClick);
  },
  beforeDestroy() {
    document.removeEventListener('click', this.outsideClick);
  },
  watch: {
    notifications(val) {
      if (val.length === 0) {
        this.showList = false;
      }
    },

    showList() {
      this.disableAllFloatNotifications();
    }
  },
  methods: {
    disableAllFloatNotifications() {
      this.notifications.forEach(item => {
        if (item?.options.floatMode) {
          item.options.floatMode = false;
        }
      })
    },

    outsideClick(){
      this.keepOpen -= 1;
      if (this.keepOpen < 1) {
        this.showList = false;
      }
    },

    clickOnIcon() {
      this.showList = !this.showList;
    },

    addItem({title, body, options = {}}) {
      const idx = this.notifications.findIndex((item) => item.options.id === options.id);
      if (idx > -1) {
        this.notifications[idx].title = title;
        this.notifications[idx].body = body;
        this.notifications[idx].options = options;
      } else {
        this.notifications.push({ title, body, options });
      }

      if (options.floatMode) {
        setTimeout(() => {
          options.floatMode = false
        }, (options.floatTime || 5) * 1000)
      }
    },

    removeNotification(id) {
      const idx = this.notifications.findIndex((item) => item.options.id === id);
      if (idx >= 0) {
        this.notifications.splice(idx, 1);
      }
    },

    clearNotifyList() {
      this.notifications = [];
    },

    onClick(id) {
      const item = this.notifications.find((item) => item.options.id === id);
      if (typeof item.options?.action === 'function') {
        item.options.action(item);
      }
    },
  }
}
</script>

<style lang="scss" scoped>
.list-enter-active, .list-leave-active {
  transition: opacity .5s;
  opacity: 1;
}
.list-enter, .list-leave-to {
  opacity: 0;
}

.NotificationBell {
  position: relative;

  .button-icon {
    background: transparent;
    border: none;
    cursor: pointer;
  }

  .notification-scrolling {
    position: absolute;
    right: 0;
    top: 30px;
    bottom: 0;
    z-index: 10000;

    &::before {
      content: "";
      background: var(--background_main);
      border: 1px solid var(--border);
      width: 10px;
      height: 10px;
      transform: rotate(45deg);
      position: absolute;
      right: 10px;
      top: -6px;
      border-right: none;
      border-bottom: none;
    }
  }

  .btn-header {
    position: sticky;
    top: 0;
    background: linear-gradient(#ffffffd6 80%, #ff000000);
    text-align: center;
    z-index: 1;
    padding-bottom: 8px;
    margin-bottom: -8px;
  }

  .clear-btn {
    margin: 8px 8px 0;
  }

  .empty-text {
    padding: 32px 16px;
    text-align: center;
  }

  .notification-list {
    background-color: var(--background_main);
    border: 1px solid var(--border);
    border-radius: 8px;
    box-shadow: 3px 7px 15px var(--border);
    max-height: 700px;
    overflow-y: auto;
    overflow-x: unset;
    box-sizing: border-box;
    width: 360px;
    margin-right: -8px;
    color: var(--text_main);

    &.floating-list {
      position: fixed;
      z-index: 10000;
      padding: 0;
      margin: 8px;
      background-color: transparent;
      border: none;
      box-shadow: none;
      max-height: 100%;
      right: 0;
      bottom: 0;
      &.top {
        bottom: auto;
        top: 20px;
      }
      &.left {
        right: auto;
        left: 0;
      }
    }

    &::-webkit-scrollbar {
      width: 16px;
    }
    &::-webkit-scrollbar-track {
      border-radius: 16px;
    }
    &::-webkit-scrollbar-thumb {
      background-color: var(--border);
      border-radius: 16px;
      border: 4px solid transparent;
      background-clip: content-box;
    }

    .notification-item {
      margin: 8px;
      padding: 8px 8px 8px 30px;
      background: #f5f3fa;
      border-radius: 10px;
      border: 1px solid;
      color: #2c67a6;
      position: relative;
      min-height: 20px;

      &::before {
        content: 'i';
        width: 16px;
        height: 16px;
        border: 1px solid;
        border-radius: 50%;
        position: absolute;
        left: 0;
        top: 0;
        margin: 8px;
        text-align: center;
        font-size: 11px;
        font-weight: bold;
        line-height: 18px;
      }

      .close-btn {
        position: absolute;
        right: 0;
        top: 0;
        margin: 6px 8px;
        text-decoration: none;
        color: var(--divider);
        font-size: 20px;

        &:hover {
          color: var(--text_main);
        }
      }

      .has-action {
        cursor: pointer;
      }

      .title {
        font-weight: bold;
        &.has-action:hover {
          text-decoration: underline;
        }
      }
      .body-text {
        margin-top: 8px;
        color: var(--text_main);
      }

      &.info {}
      &.success {
        color: var(--success);
        &::before {
          content: '✓';
        }
      }
      &.warning {
        color: var(--warning);
        &::before {
          content: '!';
        }
      }
      &.error {
        color: var(--danger);
        &::before {
          content: '✕';
          background: var(--danger);
          color: white;
        }
      }
    }
  }
}
.FontIcon {
  color: var(--accent);

  &.name_notification {
    position: relative;

    &::before {
      font-size: 18px;
      color: var(--general_white);
    }

    &.indication {
      &::after {
        content: '';
        background-color: var(--accent);
        display: block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        position: absolute;
        right: 1px;
        top: 0;
      }

      &.has-success {
        &::after {
          background-color: var(--success);
        }
      }

      &.has-warning {
        &::after {
          background-color: var(--warning);
        }
      }

      &.has-error {
        &::after {
          background-color: var(--danger);
        }
      }
    }
  }
}
</style>
