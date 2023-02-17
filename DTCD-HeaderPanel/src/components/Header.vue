<template>
  <div class="HeaderTop">
    <nav class="HeaderNav">
      <div ref="logoWrapper" class="LogoWrapper">
        <img
          @error="handleLogoErrorLoad"
          src="/logo/logo.svg"
          alt="logo"
        >
      </div>
      <div class="HeaderNavItem">Дашборды</div>
      <div class="HeaderNavItem">Помощь</div>
    </nav>

    <div class="HeaderUser">
      <NotificationBell class="NotificationBell"/>
      <base-dropdown class="DropdownUserSelect" alignment="right">   
        <span class="DropdownUsername" slot="toggle-btn">     
          <div class="IconUser" ref="userPhoto"></div>
          <div class="UsernameWrapper" v-text="userData.username" />         
        </span>
        <span slot="icon-arrow" class="FontIcon name_chevronBigDown size_xs"></span>
        <nav class="UserNavList">
          <a class="UserNavItem" @click="router.navigate('/profile')">
            <span class="FontIcon name_user size_md"></span>
            <span class="Text">Профиль</span>
          </a>
          <!-- <a class="UserNavItem" @click="goToAdmin">
            <span class="FontIcon name_adminEmpty size_md"></span>
            <span class="Text">Панель администратора</span>
          </a> -->
          <a class="UserNavItem" @click="logout">
            <span class="FontIcon name_logout size_md"></span>
            <span class="Text">Выход</span>
          </a>
        </nav>
      </base-dropdown>
      <div class="BurgerButton" @click="changeVisibility()" :class="{ active: burgerVisibility }">
        <span class="BurgerBar"></span>
        <span class="BurgerBar"></span>
        <span class="BurgerBar"></span>
      </div>
    </div>

    <section class="MenuBurger" :class="{ open: burgerVisibility }">
      <div class="MenuWrapper">
        <div class="MenuHeader">
          <div class="MenuUserPhoto" ref="userPhotoMenu"></div>
          <div>
            <!-- <p class="MenuUserRole">Администратор</p> -->
            <p class="MenuUserName" v-text="fullName" />
          </div>
        </div>

        <div class="MenuBody">
          <nav class="MenuList">
            <li class="MenuListItem">
              <a class="MenuLink" @click="router.navigate('/profile')">Профиль</a>
            </li>
            <!-- <li class="MenuListItem">
              <a class="MenuLink">Панель администратора</a>
            </li> -->
          </nav>
        </div>

        <div class="MenuFooter">
          <button @click="logout" class="ButtonBack">
            <span class="FontIcon name_logout"></span>
            <span class="Text">Выход</span>
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { LOGO_DATACAD } from '../images/logo';

import NotificationBell from './NotificationBell';

export default {
  components: {
    NotificationBell,
  },
  data({ $root }) {
    return {
      router: $root.router,
      interactionSystem: $root.interactionSystem,
      burgerVisibility: false,
      userData: {
        username: '',
        photo: '',
        firstName: '',
        lastName: '',
      },
    };
  },
  computed: {
    fullName() {
      const { firstName, lastName } = this.userData;
      return `${firstName} ${lastName}`;
    },
  },
  async mounted() {
    const data = await this.getUserData();
    this.setUserData(data);
  },
  methods: {
    async logout() {
      await Application.getSystem('AuthSystem', '0.1.0').logout();
    },

    async getUserData() {
      const fields = ['username', 'photo', 'firstName', 'lastName'];
      const url = '/dtcd_utils/v1/user?photo_quality=low&' + fields.join('&');
      const result = await this.interactionSystem.GETRequest(url);
      return result.data;
    },

    async goToAdmin() {
      document.location.replace('/admin');
    },

    setUserData(data) {
      for (const [key, value] of Object.entries(data)) {
        if (key in this.userData) {
          this.userData[key] = value;
          if (key === 'photo') this.setUserPhotoBackground(value);
        }
      }
    },

    setUserPhotoBackground(photoBase64) {
      const { userPhoto, userPhotoMenu } = this.$refs;
      const url = `url(${photoBase64})`;
      userPhoto.style.backgroundImage = url;
      userPhotoMenu.style.backgroundImage = url;
    },

    changeVisibility() {
      this.burgerVisibility = !this.burgerVisibility;
    },

    handleLogoErrorLoad() {
      this.$refs.logoWrapper.innerHTML = LOGO_DATACAD;
    }
  },
};
</script>

<style lang="scss" scoped>
.HeaderTop {
  background-color: #272a3a;
  color: var(--general_white);
  width: 100vw;
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
  height: 30px;
  font-family: 'Proxima Nova';

  &,
  *,
  *::after,
  *::before {
    box-sizing: border-box;
  }

  .LogoWrapper {
    flex: none;
    display: inline-flex;

    svg {
      flex: none;
    }
  }
}

.FontIcon {
  color: var(--accent);

  &.name_chevronBigDown {
    color: var(--general_white);
  }
}

.HeaderNav {
  display: flex;
  align-items: center;
  column-gap: 30px;
  margin-right: 10%;
}

.HeaderUserNavItem {
  font-size: 13px;
  cursor: pointer;

  @media (max-width: 576px) {
    display: none;
  }
}

.HeaderUser {
  display: flex;
  align-items: center;
}

.IconNotification {
  display: flex;
  cursor: pointer;
  border: none;
  background-color: transparent;
  padding: 0;
  margin-right: 30px;

  @media (max-width: 576px) {
    margin-right: 16px;
  }
}

.IconUser {
  cursor: pointer;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  margin-right: 6px;
  overflow: hidden;
  background-color: var(--button_primary_24);
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;

  @media (max-width: 576px) {
    display: none;
  }
}

.NotificationBell {
  margin-right: 16px;
}

.DropdownUserSelect {
  display: contents;

  & > * {
    cursor: pointer;
  }

  @media (max-width: 576px) {
    display: none;
  }
}

.UsernameWrapper {
  text-overflow: ellipsis;
  overflow: hidden;
  max-width: 150px;
  white-space: nowrap;
}

.DropdownUsername {
  display: flex;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
  margin-right: 9px;
  color: var(--general_white);
}

.UserNavList { 
  background-color: var(--background_main);
  border: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  box-shadow: 1px 1px 2px rgba(8, 18, 55, 0.12), 0px 4px 12px rgba(8, 18, 55, 0.12);
  border-radius: 8px;
  padding: 16px;

  .UserNavItem {
    padding-bottom: 8px;
    display: flex;
    font-size: 14px;
    line-height: 1.58;
    color: var(--text_main);
    cursor: pointer;

    &:hover {
      color: var(--button_primary);
    }

    &:last-child {
      padding-bottom: 0;
    }
  }
}

.Text {
  padding-left: 8px;
}

.BurgerButton {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 18px;
  height: 18px;
  gap: 1.8px;
  cursor: pointer;

  @media (max-width: 576px) {
    display: flex;
  }

  .BurgerBar {
    width: 13.5px;
    height: 1.8px;
    background-color: #fff;
    transition: all ease 0.2s;
  }

  &.active .BurgerBar {
    &:nth-of-type(1) {
      transform: translateY(3.2px) rotate(-45deg);
    }

    &:nth-of-type(2) {
      opacity: 0;
    }

    &:nth-of-type(3) {
      transform: translateY(-4px) rotate(45deg);
    }
  }
}

.MenuBurger {
  --inner-horizontal-padding: 20px;

  height: calc(100% - 30px);
  width: 100%;
  position: fixed;
  right: 0;
  top: 30px;
  display: none;
  z-index: 10;
  background-color: var(--accent);
  overflow-y: auto;

  &.open {
    @media (max-width: 576px) {
      display: block;
    }
  }

  .MenuWrapper {
    display: flex;
    flex-direction: column;
    min-height: 100%;
  }

  .MenuList {
    list-style: none;
    margin: 0;
  }

  .MenuListItem {
    display: block;
    margin-bottom: 24px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .MenuLink {
    display: inline-block;
    text-decoration: none;
    font-size: 17px;
    font-weight: 700;
    line-height: 1.3;
    cursor: pointer;
    color: var(--general_white);

    &:hover {
      color: var(--border);
    }
  }

  .MenuHeader {
    background-color: #2c67a6;
    padding: 20px var(--inner-horizontal-padding);
    display: flex;
    align-items: center;
  }

  .MenuBody {
    padding: 58px var(--inner-horizontal-padding);
  }

  .MenuFooter {
    padding-left: var(--inner-horizontal-padding);
    padding-right: var(--inner-horizontal-padding);
    padding-bottom: 42px;
    margin-top: auto;
  }

  .MenuUserPhoto {
    flex: none;
    width: 50px;
    height: 50px;
    border-radius: 8px;
    background-color: var(--button_primary_24);
    margin-right: 13px;
    overflow: hidden;
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
  }

  .MenuUserRole {
    font-size: 14px;
    color: var(--border);
    margin-top: 0;
    margin-bottom: 0;
  }

  .MenuUserName {
    margin: 0;
    font-size: 20px;
    color: var(--general_white);
    line-height: 1.19;
  }

  .ButtonBack {
    border: none;
    background-color: transparent;
    display: flex;
    cursor: pointer;
    font-weight: 700;
    font-size: 17px;
    align-items: center;
    color: var(--general_white);
    font-family: 'Proxima Nova';
    padding: 0;

    &:hover {
      color: var(--border);
    }
  }
}
</style>
