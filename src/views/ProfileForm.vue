<template>
  <div id="main">
    <form class="content settings" @submit.prevent="save()">
      <h1>Edit profile</h1>
      <div class="input-group">
        <label for="display-name">Display name</label>
        <input id="display-name" v-model.trim="form.display_name">
      </div>
      <div class="input-group">
        <label for="bio">Bio</label>
        <textarea
          id="bio"
          ref="bioInput"
          :value="form.note_source"
          @input="updateNote($event.target.value)"
        ></textarea>
      </div>
      <div class="image-upload-group">
        <profile-card :profile="profilePreview" :compact="true"></profile-card>
        <div class="image-upload-inputs">
          <div class="input-group">
            <label for="avatar">Avatar</label>
            <input
              type="file"
              id="avatar"
              accept="image/*"
              @change="onFilePicked('avatar', $event.target.files)"
            >
          </div>
          <div class="input-group">
            <label for="banner">Banner</label>
            <input
              type="file"
              id="banner"
              accept="image/*"
              @change="onFilePicked('header', $event.target.files)"
            >
          </div>
        </div>
      </div>
      <div class="extra-fields input-group">
        <label>
          Additional info
          <div class="sub-label">You can have up to {{ extraFieldMaxCount }} items displayed as a table on your profile</div>
        </label>
        <div
          v-for="(field, index) in form.fields_attributes"
          :key="index"
          class="extra-field"
          :class="{'error': !isValidExtraField(index)}"
        >
          <input v-model.trim="field.name" placeholder="Label">
          <input
            :value="field.value_source"
            @input="updateExtraFieldValue(field, $event.target.value)"
            placeholder="Content"
          >
          <a
            class="remove-extra-field"
            title="Remove item"
            @click="removeExtraField(index)"
          >
            <img :src="require('@/assets/feather/x-circle.svg')">
          </a>
        </div>
        <button
          v-if="form.fields_attributes.length <= extraFieldMaxCount"
          type="button"
          class="add-extra-field"
          @click="addExtraField()"
        >
          <img :src="require('@/assets/feather/plus-circle.svg')">
          Add new item
        </button>
      </div>
      <button type="submit" class="btn">Save</button>
    </form>
    <sidebar></sidebar>
  </div>
</template>

<script lang="ts">
import { Options, Vue, setup } from "vue-class-component"

import {
  Profile,
  User,
  ProfileFieldAttrs,
  ProfileUpdateData,
  updateProfile,
} from "@/api/users"
import ProfileCard from "@/components/ProfileCard.vue"
import Sidebar from "@/components/Sidebar.vue"
import { useCurrentUser } from "@/store/user"
import { setupAutoResize } from "@/utils/autoresize"
import { renderMarkdownLite } from "@/utils/markdown"
import { fileToDataUrl, dataUrlToBase64 } from "@/utils/upload"

@Options({
  components: {
    ProfileCard,
    Sidebar,
  },
})
export default class ProfileForm extends Vue {

  private store = setup(() => {
    const { ensureCurrentUser, setCurrentUser, ensureAuthToken } = useCurrentUser()
    return { ensureCurrentUser, setCurrentUser, ensureAuthToken }
  })

  form: ProfileUpdateData = {
    display_name: null,
    note: null,
    note_source: null,
    avatar: null,
    header: null,
    fields_attributes: [],
  }

  images: {
    avatar: string | null,
    header: string | null,
  } = { avatar: null, header: null }

  extraFieldMaxCount = 10

  private get profile(): User {
    return this.store.ensureCurrentUser()
  }

  $refs!: { bioInput: HTMLTextAreaElement }

  created() {
    const fields_attributes = []
    for (let index = 0; index < this.profile.fields.length; index++) {
      const field_attributes = {
        name: this.profile.fields[index].name,
        value: this.profile.fields[index].value,
        value_source: this.profile.source.fields[index].value,
      }
      fields_attributes.push(field_attributes)
    }
    this.form = {
      ...this.form,
      display_name: this.profile.display_name,
      note: this.profile.note,
      note_source: this.profile.source.note,
      fields_attributes: fields_attributes,
    }
    this.images = {
      avatar: this.profile.avatar,
      header: this.profile.header,
    }
  }

  mounted() {
    setupAutoResize(this.$refs.bioInput)
  }

  updateNote(value: string) {
    this.form.note_source = value
    this.form.note = renderMarkdownLite(this.form.note_source)
  }

  get profilePreview(): Profile {
    return {
      ...this.profile,
      display_name: this.form.display_name,
      note: this.form.note,
      avatar: this.images.avatar,
      header: this.images.header,
    }
  }

  async onFilePicked(fieldName: "avatar" | "header", files: File[]) {
    const imageDataUrl = await fileToDataUrl(files[0])
    this.images[fieldName] = imageDataUrl
    this.form[fieldName] = dataUrlToBase64(imageDataUrl)
  }

  updateExtraFieldValue(field: ProfileFieldAttrs, value: string) {
    field.value_source = value
    field.value = renderMarkdownLite(field.value_source)
  }

  isValidExtraField(index: number): boolean {
    const field = this.form.fields_attributes[index]
    for (let prevIndex = 0; prevIndex < index; prevIndex++) {
      const prevField = this.form.fields_attributes[prevIndex]
      if (field.name === prevField.name) {
        // Label is not unique
        return false
      }
    }
    return true
  }

  removeExtraField(index: number) {
    this.form.fields_attributes.splice(index, 1)
  }

  addExtraField() {
    this.form.fields_attributes.push({ name: "", value: "", value_source: "" })
  }

  async save() {
    const authToken = this.store.ensureAuthToken()
    const profile = await updateProfile(authToken, this.form)
    this.store.setCurrentUser(profile)
    this.$router.push({ name: "profile", params: { profileId: profile.id } })
  }

}
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/theme";

$form-inner-padding: 10px;

.input-group {
  margin-bottom: $block-outer-padding;

  label {
    display: block;
    font-weight: bold;
    margin-bottom: $form-inner-padding;
  }

  .sub-label {
    color: $secondary-text-color;
    font-size: 12px;
    font-weight: normal;
    margin-top: 3px;
  }

  input,
  textarea {
    border-radius: $btn-border-radius;
    width: 100%;
  }
}

.image-upload-group {
  display: grid;
  gap: $form-inner-padding;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  margin-bottom: $block-outer-padding;

  .input-group:last-child {
    margin-bottom: 0;
  }
}

.extra-field {
  display: flex;
  gap: $form-inner-padding;
  margin-bottom: $form-inner-padding;
  position: relative;

  input {
    flex-basis: 50%;
  }

  .remove-extra-field {
    $icon-size: 15px;

    display: none;
    height: $icon-size * 2;
    line-height: $icon-size * 2;
    position: absolute;
    right: -$icon-size;
    text-align: center;
    top: -$icon-size;
    width: $icon-size * 2;

    img {
      background-color: $block-background-color;
      border-radius: 50%;
      filter: $link-hover-colorizer;
      height: $icon-size;
      vertical-align: middle;
    }
  }

  &:hover .remove-extra-field {
    display: block;
  }

  &.error input {
    border: 1px solid $error-color;
  }
}

.add-extra-field {
  align-items: center;
  display: flex;

  img {
    filter: $link-colorizer;
    height: 20px;
    margin-right: 5px;
    vertical-align: middle;
  }

  &:hover img {
    filter: $link-hover-colorizer;
  }
}

button[type="submit"] {
  box-shadow: $btn-shadow;
}
</style>
