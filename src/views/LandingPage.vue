<template>
  <div class="landing-page wide">
    <div class="instance-group">
      <div v-if="instance" class="instance-info">
        <h1 class="instance-title">{{ instance.title }}</h1>
        <div class="instance-description">
          {{ instance.short_description }}
          <br>
          <router-link :to="{name: 'about-public'}">Learn more <span class="arrow">&gt;&gt;</span></router-link>
        </div>
        <div class="login">
          <button @click="login()">Sign In</button>
          <div v-if="loginErrorMessage" class="error-message">{{ loginErrorMessage }}</div>
        </div>
      </div>
      <form v-if="instance" class="registration-form">
        <div v-if="isLoading" class="registration-form-loader">
          <loader></loader>
        </div>
        <div class="form-title">Want to join?</div>
        <div class="form-control">
          <div class="input-group">
            <input id="username" v-model="username" required placeholder="Username">
            <div class="addon">@{{ instance.uri }}</div>
          </div>
          <div class="form-message">Only letters, numbers and underscores are allowed.</div>
        </div>
        <div class="form-control" v-if="!instance.registrations">
          <input
            id="invite-token"
            v-model="inviteCode"
            required
            placeholder="Enter the invite code"
          >
        </div>
        <div class="wallet-required">
          <img :src="require('@/assets/forkawesome/ethereum.svg')">
          <router-link :to="{ name: 'ethereum' }">Ethereum Wallet</router-link> is required
        </div>
        <button
          type="submit"
          :disabled="!username"
          @click.prevent="register()"
        >Sign Up</button>
        <div v-if="registrationErrorMessage" class="error-message">{{ registrationErrorMessage }}</div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue, setup } from "vue-class-component"

import {
  createUser,
  getAccessToken,
  getCurrentUser,
} from "@/api/users"
import { InstanceInfo } from "@/api/instance"
import Loader from "@/components/Loader.vue"
import { useInstanceInfo } from "@/store/instance"
import { useCurrentUser } from "@/store/user"
import { createEip4361_SignedMessage, getWallet } from "@/utils/ethereum"

@Options({
  components: { Loader },
})
export default class LandingPage extends Vue {

  username = ""
  inviteCode: string | null = null
  isLoading = false
  loginErrorMessage: string | null = null
  registrationErrorMessage: string | null = null

  private store = setup(() => {
    const { setCurrentUser, setAuthToken } = useCurrentUser()
    const { instance } = useInstanceInfo()
    return { setCurrentUser, setAuthToken, instance }
  })

  get instance(): InstanceInfo | null {
    return this.store.instance
  }

  async register() {
    this.registrationErrorMessage = null
    if (!this.store.instance) {
      return
    }
    const instanceHost = this.store.instance.uri
    const loginMessage = this.store.instance.login_message
    const signer = await getWallet()
    if (!signer) {
      return
    }
    const { message, signature } = await createEip4361_SignedMessage(
      signer,
      instanceHost,
      loginMessage,
    )
    this.isLoading = true
    let user
    let authToken
    try {
      user = await createUser({
        username: this.username,
        message,
        signature,
        invite_code: this.inviteCode,
      })
      authToken = await getAccessToken(message, signature)
    } catch (error: any) {
      this.isLoading = false
      this.registrationErrorMessage = error.message
      return
    }
    this.store.setCurrentUser(user)
    this.store.setAuthToken(authToken)
    this.isLoading = false
    this.$router.push({ name: "home" })
  }

  async login() {
    this.loginErrorMessage = null
    if (!this.store.instance) {
      return
    }
    const instanceHost = this.store.instance.uri
    const loginMessage = this.store.instance.login_message
    const signer = await getWallet()
    if (!signer) {
      return
    }
    const { message, signature } = await createEip4361_SignedMessage(
      signer,
      instanceHost,
      loginMessage,
    )
    let user
    let authToken
    try {
      authToken = await getAccessToken(message, signature)
      user = await getCurrentUser(authToken)
    } catch (error: any) {
      this.loginErrorMessage = error.message
      return
    }
    this.store.setCurrentUser(user)
    this.store.setAuthToken(authToken)
    this.$router.push({ name: "home" })
  }

}

</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/theme";

$text-color: #fff;

button {
  background-color: #000;
  border: none;
  border-radius: 10px;
  color: $text-color;
  cursor: pointer;
  display: block;
  font-size: 20px;
  font-weight: bold;
  padding: 10px 60px;
}

.landing-page {
  background-color: #000;
  background-image: url("../assets/startpage.png");
  background-repeat: no-repeat;
  background-size: cover;
  box-sizing: border-box;
  color: $text-color;
  min-height: 100vh;
  padding-top: 20vh;
}

.instance-group {
  align-items: flex-start;
  display: flex;
  flex-direction: row;
  gap: $content-gap;
  justify-content: space-between;
  margin: 0 auto;
  max-width: $wide-content-width + $content-gap + $wide-sidebar-width;
}

.instance-info {
  max-width: $wide-content-width;
  min-width: 0;
}

.instance-title {
  font-size: 90px;
  font-weight: bold;
  margin-bottom: 20px;
  text-transform: uppercase;
  word-wrap: break-word;
}

.instance-description {
  font-size: 24px;
  line-height: 1.75;

  a {
    color: $text-color;
  }

  .arrow {
    color: #7DFF54;

    &:hover {
      color: $text-color;
    }
  }
}

.login {
  display: inline-block;
  margin-top: 30px;
  text-align: center;

  button {
    border: 1px solid #979797;
    box-shadow: 0 2px 16px -5px #6E6E6E;

    &:hover {
      background-color: #fff;
      border-color: #fff;
      color: #000;
    }
  }

  .error-message {
    color: $error-color;
    margin-top: 5px;
  }
}

.registration-form {
  border: 1px solid #979797;
  border-radius: 10px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 15px;
  min-width: $wide-sidebar-width - 50px;
  padding: 25px 40px;
  position: relative;
  width: $wide-sidebar-width;

  .form-title {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 10px;
    text-align: center;
  }

  input,
  .addon {
    background-color: #201f1f;
    border: none;
    line-height: 18px;
    padding: 15px;
  }

  input {
    border-radius: 10px;
    color: $text-color;
    min-width: 100px;

    &::placeholder {
      color: #B3B3B3;
    }
  }

  .input-group {
    display: flex;
    flex-direction: row;

    input {
      border-radius: 10px 0 0 10px;
      min-width: 0;
    }

    .addon {
      border-radius: 0 10px 10px 0;
      color: #B3B3B3;
      padding-left: 0;
      text-align: right;
    }
  }

  .form-message {
    font-size: 12px;
    margin-top: 3px;
    padding: 0 15px;
  }

  button {
    background: linear-gradient(to right, #FF5959, #FF5EAD, #D835FE, #D963FF);
    box-shadow: 0 2px 16px -5px #BB5CC7;
    height: 48px;
    margin-top: 5px;

    &:hover {
      background: linear-gradient(to right, #FF7373, #FF78BA, #DD4FFE, #DF7DFF);
    }
  }

  .error-message {
    color: $error-color;
    margin-top: 10px;
    text-align: center;
  }

  .wallet-required {
    align-items: center;
    display: flex;
    flex-direction: row;
    gap: 0.4em;
    justify-content: center;

    img {
      filter: $btn-text-colorizer;
      height: 1em;
    }

    a {
      color: $text-color;
      text-decoration: underline;
    }
  }
}

.registration-form-loader {
  bottom: 0;
  display: flex;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
  z-index: 1;

  .loader {
    margin-bottom: auto;
    margin-top: auto;
  }
}

.loader {
  margin: 0 auto;
}

@media screen and (max-width: $screen-breakpoint-medium) {
  .registration-form {
    padding: 25px;
  }
}

@media screen and (max-width: $screen-breakpoint-small) {
  .landing-page {
    padding-top: $content-gap;
  }

  .instance-group {
    flex-wrap: wrap;
    justify-content: flex-start;
  }

  .registration-form {
    margin-right: auto;
    min-width: auto;

    .form-title {
      text-align: left;
    }
  }
}
</style>
