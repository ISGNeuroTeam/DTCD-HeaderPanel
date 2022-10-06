<template>
  <div 
    class="NotificationBell" 
    @click="keepOpen = 2"
  >
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
            theme="theme_blueSec"
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
        <transition-group 
          name="list" 
          tag="div"
        >
          <div
            v-for="{ title, body, className, id, hasAction } of notificationList"
            :key="id"
            class="notification-item"
            :class="className"
          >
            <span 
              class="FontIcon FrontIcon"
              :class="getIcon(className)"
            >
            </span>
            <span 
              @click.prevent="$root.notificationSystem.remove(id)" 
              class="FontIcon name_closeBig size_md close-btn"
            >
            </span>
            <div
              v-if="title" 
              class="title"
              :class="{
              'has-action': hasAction,
              }"
              @click.prevent="onClick(id)"
            >
              <vue-show-more-text
                :text="title"
                :lines="1"
                additional-container-css="padding:0;display:flex;margin-right:18px;"
                additional-anchor-css="color:transparent;padding:0;position:absolute;right:0;width:100%;height:100%;"
              />
            </div>
            <div 
              v-if="body" 
              class="body-text"
            >
              <vue-show-more-text
                :text="body"
                :lines="4"
                more-text="Show"
                less-text="Hide"
                additional-container-css="padding:0;"
                additional-anchor-css="color: var(--text_secondary);margin-bottom:0;padding:10px 0 0;"
              />
            </div>
          </div>
        </transition-group>
      </div>
    </div>

    <div :class="`notification-list floating-list ${settings.notificationPosition}`">
      <transition-group 
        name="list" 
        tag="div"
      >
        <div
          v-for="item of notificationFloatList"
          :key="item.id"
          class="notification-item"
          :class="item.className"
          @mouseenter="onMouseEnterFloatItem(item)"
        >
          <span 
            class="FontIcon FrontIcon"
            :class="getIcon(item.className)"
          >
          </span>
          <span 
            @click.prevent="$root.notificationSystem.remove(item.id)"
            class="FontIcon name_closeBig size_md close-btn"
          >
          </span>
          <div
            v-if="item.title"
            class="title"
            :class="{
            'has-action': item.hasAction,
            }"
            @click.prevent="onClick(item.id)"
          >
            <vue-show-more-text
              :text="item.title"
              :lines="1"
              additional-container-css="padding:0;display:flex;margin-right: 18px;"
              additional-anchor-css="color:transparent;padding:0;position:absolute;right:0;width:100%;height:100%;"
            />
          </div>
          <div 
            v-if="item.body" 
            class="body-text"
          >
            <vue-show-more-text
              :text="item.body"
              :lines="4"
              more-text="Show"
              less-text="Hide"
              additional-container-css="padding:0;"
              additional-anchor-css="color: var(--text_secondary);margin-bottom:0;padding:10px 0 0;"
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
      classes: {
        'success':'name_circleCheckOutline',
        'warning': 'name_warningOutline',
        'error': 'name_offOutlineClose',
        'info': 'name_infoCircleOutline'
      },
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
          options,
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
          options,
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

    getIcon(className) {
      if (Object.keys(this.classes).includes(className)) {
        return this.classes[className]
      } else {
        return 'name_infoCircleOutline'
      }
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
        options.floatTimeOut = setTimeout(() => {
          options.floatMode = false;
          options.floatTimeOut = undefined;
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

    onMouseEnterFloatItem(item) {
      if (item.options.floatTimeOut) {
        clearTimeout(item.options.floatTimeOut);
        item.options.floatTimeOut = undefined;
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
  font-family: "Proxima Nova";

  &,
  *,
  *::after,
  *::before {
    box-sizing: border-box;
  }

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
    z-index: 30;

    &::before {
      content: "";
      background-color: var(--background_secondary);
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
    background-color: var(--background_secondary);
    text-align: center;
    z-index: 1;
    padding-bottom: 10px;
    margin-bottom: -5px;
  }

  .clear-btn {
    margin-top: 10px;
    width: 80%;
  }

  .empty-text {
    padding: 32px 16px;
    text-align: center;
    color: var(--text_main);
  }

  .notification-list {
    background-color: var(--background_secondary);
    border: 1px solid var(--border);
    border-radius: 8px;
    box-shadow: 1px 1px 12px rgb(8 18 55 / 12%);
    max-height: 700px;
    overflow-y: auto;
    overflow-x: unset;
    width: 360px;
    margin-right: -8px;

    &.floating-list {
      position: fixed;
      z-index: 30;
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
      margin: 6px;
      padding: 10px;
      background: var(--border_12);
      border-radius: 8px;
      border: 1px solid;
      color: var(--accent);
      position: relative;
      min-height: 20px;

      .FrontIcon {
        position: absolute;
        left: 0;
        top: 0;
        margin: 10px;
        display: flex;
        font-size: 18px;
        align-items: center;
      }

      .close-btn {
        position: absolute;
        right: 0;
        top: 0;
        margin: 10px;
        text-decoration: none;
        cursor: pointer;

        &:hover {
          color: var(--text_main);
        }
      }

      .title {
        font-weight: 700;
        font-size: 16px;
        position: relative;
        margin: 0 18px 0 21px;
      }

      .body-text {
        margin-top: 8px;
        font-size: 14px;
        color: var(--text_main);
      }

      &.success {
        color: var(--success);

        .FontIcon {
          &.name_circleCheckOutline {
            color: var(--success);
          }   
        }
      }

      &.warning {
        color: var(--warning);

        .FontIcon {
          &.name_warningOutline {
            color: var(--warning);
          }   
        }
      }

      &.error {
        color: var(--danger);

        .FontIcon {
          &.name_offOutlineClose {
            color: var(--danger);
          }   
        }
      }
    }
  }
  .FontIcon {
    color: var(--accent);

    &.name_closeBig {
      color: var(--border);
    }

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
          color: var(--warning);
        }

        &.has-error {
          &::after {
            background-color: var(--danger);
          }
        }
      }
    }
  }
}
</style>
