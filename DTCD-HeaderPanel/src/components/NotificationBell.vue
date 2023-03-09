<template>
  <div 
    class="NotificationBell" 
    @click="keepOpen = 2"
  >
    <button
      class="IconButton"
      @click.prevent="clickOnIcon()"
    >
      <span
        class="FontIcon name_notification size_md"
        :class="iconClasses"
      ></span>
    </button>

    <div
      v-if="showList"
      class="NotificationContainer"
    >
      <div class="NotificationList">
        <div class="HeaderButton">
          <base-button
            v-if="notifications.length >= 5"
            class="ButtonClear"
            @click.prevent="$root.notificationSystem.clearList()"
            theme="theme_blueSec"
          >
            Удалить все
          </base-button>
        </div>
        <div
          v-if="notificationList.length === 0"
          class="EmptyNotificationList"
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
            class="NotificationItem"
            :class="className"
          >
            <span 
              class="FontIcon FrontIcon"
              :class="getIcon(className)"
            >
            </span>
            <span 
              @click.prevent="$root.notificationSystem.remove(id)" 
              class="FontIcon name_closeBig size_md ButtonClose"
            >
            </span>
            <div
              v-if="title" 
              class="NotificationTitle"
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
              class="NotificationBody"
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

    <div :class="`NotificationList type_floating ${settings.notificationPosition}`">
      <transition-group 
        name="list" 
        tag="div"
      >
        <div
          v-for="item of notificationFloatList"
          :key="item.id"
          class="NotificationItem"
          :class="item.className"
          @mouseenter="onMouseEnterFloatItem(item)"
          @mouseleave="onMouseLeaveFloatItem(item)"
        >
          <span 
            class="FontIcon FrontIcon"
            :class="getIcon(item.className)"
          >
          </span>
          <span 
            @click.prevent="$root.notificationSystem.remove(item.id)"
            class="FontIcon name_closeBig size_md ButtonClose"
          >
          </span>
          <div
            v-if="item.title"
            class="NotificationTitle"
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
            class="NotificationBody"
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

      let checkСondition = !!notifications.length ? 'indication' : '';

      if (notifications.findIndex(({options}) => options.type === 'error') !== -1) {
        return `${checkСondition} type_error`
      }
      if (notifications.findIndex(({options}) => options.type === 'warning') !== -1) {
        return `${checkСondition} type_warning`
      }
      if (notifications.findIndex(({options}) => options.type === 'success') !== -1) {
        return `${checkСondition} type_success`
      }

      return `${checkСondition}`
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
        this.setTimer(options);
      }
    },

    setTimer(options)  {
      options.floatTimeOut = setTimeout(() => {
        options.floatMode = false;
        options.floatTimeOut = undefined;
      }, (options.floatTime || 5) * 1000)
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

    onMouseLeaveFloatItem(item) {
      this.setTimer(item.options);
    }
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

  .IconButton {
    background: transparent;
    border: none;
    cursor: pointer;
  }

  .NotificationContainer {
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

  .HeaderButton {
    position: sticky;
    top: 0;
    background-color: var(--background_secondary);
    text-align: center;
    z-index: 1;
    padding-bottom: 5px;
    margin-bottom: -5px;
  }

  .ButtonClear {
    margin-top: 10px;
    margin-bottom: 5px;
    width: 80%;
  }

  .EmptyNotificationList {
    padding: 32px 16px;
    text-align: center;
    color: var(--text_main);
  }

  .NotificationList {
    background-color: var(--background_secondary);
    border: 1px solid var(--border);
    border-radius: 8px;
    box-shadow: 1px 1px 12px rgb(8 18 55 / 12%);
    max-height: 700px;
    overflow-y: auto;
    overflow-x: unset;
    width: 360px;
    margin-right: -8px;

    &.type_floating {
      position: fixed;
      z-index: 30;
      padding: 0;
      margin: 8px;
      background-color: transparent;
      border: none;
      box-shadow: none;
      max-height: 100%;
      right: 0;
      bottom: 20px;
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
  }

  .NotificationItem {
    margin: 6px;
    padding: 10px;
    background: var(--border_12);
    border-radius: 8px;
    border: 1px solid;
    color: var(--accent);
    position: relative;
    min-height: 20px;

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
    
  .FrontIcon {
    position: absolute;
    left: 0;
    top: 0;
    margin: 10px;
    display: flex;
    font-size: 18px;
    align-items: center;
  }

  .ButtonClose {
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

  .NotificationTitle {
    font-weight: 700;
    font-size: 16px;
    position: relative;
    margin: 0 18px 0 21px;
  }

  .NotificationBody {
    margin-top: 8px;
    font-size: 14px;
    color: var(--text_main);
  }
  
  .FontIcon {
    color: var(--accent);

    &.name_closeBig {
      color: var(--border);
    }

    &.name_notification {
      position: relative;
      color: var(--general_white);

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

        &.type_success {
          &::after {
            background-color: var(--success);
          }
        }

        &.type_warning {
          &::after {
            background-color: var(--warning);
          }
        }

        &.type_error {
          &::after {
            background-color: var(--danger);
          }
        }
      }
    }
  }
}
</style>
