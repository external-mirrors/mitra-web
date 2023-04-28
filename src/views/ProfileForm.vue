<template>
  <sidebar-layout>
    <template #content>
      <h1>Edit profile</h1>
      <form class="profile-form" @submit.prevent="save()">
        <div class="input-group">
          <label for="display-name">Display name</label>
          <input id="display-name" type="text" v-model.trim="form.display_name">
        </div>
        <div class="input-group">
          <label for="bio">Bio</label>
          <textarea
            id="bio"
            ref="bioInputRef"
            :value="form.note || ''"
            @input="onBioUpdate($event)"
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
                @change="onFilePicked('avatar', $event)"
              >
            </div>
            <div class="input-group">
              <label for="banner">Banner</label>
              <input
                type="file"
                id="banner"
                accept="image/*"
                @change="onFilePicked('header', $event)"
              >
            </div>
          </div>
        </div>
        <div class="extra-fields input-group">
          <label>
            Additional info
            <div class="sub-label">You can have up to {{ EXTRA_FIELD_COUNT_MAX }} items displayed as a table on your profile</div>
          </label>
          <div
            v-for="(field, index) in form.fields_attributes"
            :key="index"
            class="extra-field"
            :class="{'error': !isValidExtraField(index)}"
          >
            <input
              type="text"
              v-model.trim="field.name"
              placeholder="Label"
            >
            <input
              type="text"
              v-model.trim="field.value"
              placeholder="Content"
            >
            <a
              class="remove-extra-field"
              title="Remove item"
              @click="removeExtraField(index)"
            >
              <div class="remove-icon">
                <img src="@/assets/feather/x-circle.svg">
              </div>
            </a>
          </div>
          <button
            v-if="canAddExtraField()"
            type="button"
            class="add-extra-field"
            @click="addExtraField()"
          >
            <img src="@/assets/feather/plus-circle.svg">
            Add new item
          </button>
        </div>
        <button
          type="submit"
          class="btn"
          :disabled="!isFormValid() || isLoading"
        >
          Save
        </button>
        <div class="error-message" v-if="errorMessage">{{ errorMessage }}</div>
      </form>
    </template>
  </sidebar-layout>
</template>

<script setup lang="ts">
import { onMounted } from "vue"
import { $, $computed, $ref } from "vue/macros"
import { useRouter } from "vue-router"

import {
  Profile,
  ProfileUpdateData,
  updateProfile,
  EXTRA_FIELD_COUNT_MAX,
} from "@/api/users"
import ProfileCard from "@/components/ProfileCard.vue"
import SidebarLayout from "@/components/SidebarLayout.vue"
import { useCurrentUser } from "@/composables/user"
import { setupAutoResize } from "@/utils/autoresize"
import { fileToDataUrl, dataUrlToBase64 } from "@/utils/upload"

const router = useRouter()
const { ensureCurrentUser, setCurrentUser, ensureAuthToken } = $(useCurrentUser())

const profile = ensureCurrentUser()
let isLoading = $ref(false)
let errorMessage = $ref<string | null>(null)

function getFieldsAttributes() {
  const fields_attributes = []
  for (let index = 0; index < profile.fields.length; index++) {
    const field_attributes = {
      name: profile.source.fields[index].name,
      value: profile.source.fields[index].value,
    }
    fields_attributes.push(field_attributes)
  }
  return fields_attributes
}

const form = $ref<ProfileUpdateData>({
  display_name: profile.display_name,
  note: profile.source.note,
  fields_attributes: getFieldsAttributes(),
  avatar: null,
  avatar_media_type: null,
  header: null,
  header_media_type: null,
})
const images = $ref({
  avatar: profile.avatar,
  header: profile.header,
})

const bioInputRef = $ref<HTMLTextAreaElement | null>(null)

onMounted(() => {
  if (bioInputRef) {
    setupAutoResize(bioInputRef)
  }
})

const profilePreview = $computed<Profile>(() => {
  return {
    ...profile,
    display_name: form.display_name,
    avatar: images.avatar,
    header: images.header,
  }
})

function onBioUpdate(event: Event) {
  const value = (event.target as HTMLTextAreaElement).value
  if (value) {
    form.note = value
  }
}

async function onFilePicked(fieldName: "avatar" | "header", event: Event) {
  const files = (event.target as HTMLInputElement).files
  if (!files) {
    return
  }
  const imageDataUrl = await fileToDataUrl(files[0])
  images[fieldName] = imageDataUrl
  const imageData = dataUrlToBase64(imageDataUrl)
  form[fieldName] = imageData.data
  form[`${fieldName}_media_type`] = imageData.mediaType
}

function isValidExtraField(index: number): boolean {
  const field = form.fields_attributes[index]
  for (let prevIndex = 0; prevIndex < index; prevIndex++) {
    const prevField = form.fields_attributes[prevIndex]
    if (field.name && field.name === prevField.name) {
      // Label is not unique
      return false
    }
  }
  return true
}

function removeExtraField(index: number) {
  form.fields_attributes.splice(index, 1)
}

function canAddExtraField(): boolean {
  return form.fields_attributes.length <= EXTRA_FIELD_COUNT_MAX
}

function addExtraField() {
  form.fields_attributes.push({ name: "", value: "" })
}

function isFormValid(): boolean {
  if (form.display_name && form.display_name.length > 75) {
    return false
  }
  return true
}

async function save() {
  const authToken = ensureAuthToken()
  isLoading = true
  errorMessage = null
  let user
  try {
    user = await updateProfile(authToken, form)
  } catch (error: any) {
    isLoading = false
    errorMessage = error.message
    return
  }
  isLoading = false
  setCurrentUser(user)
  router.push({ name: "profile-by-acct", params: { acct: user.acct } })
}
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/mixins";
@import "../styles/theme";

.profile-form {
  @include content-form;

  margin-bottom: $block-outer-padding;
}

.image-upload-group {
  display: grid;
  gap: $input-padding;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  width: 100%;

  .image-upload-inputs {
    display: flex;
    flex-direction: column;
    gap: $input-padding;
  }

  .input-group:last-child {
    margin-bottom: 0;
  }
}

.extra-field {
  display: flex;
  gap: $input-padding;
  margin-bottom: $input-padding;
  position: relative;

  input {
    flex-basis: 50%;
  }

  .remove-extra-field {
    $icon-size: 15px;

    align-items: center;
    display: none;
    height: $icon-size * 2;
    justify-content: center;
    position: absolute;
    right: -$icon-size;
    top: -$icon-size;
    width: $icon-size * 2;

    .remove-icon {
      background-color: var(--block-background-color);
      border-radius: 50%;
      height: $icon-size;
      width: $icon-size;

      /* stylelint-disable-next-line selector-max-compound-selectors */
      img {
        filter: var(--link-hover-colorizer);
      }
    }
  }

  &:hover .remove-extra-field {
    display: flex;
  }

  &.error input {
    border: 1px solid $error-color;
  }
}

.add-extra-field {
  align-items: center;
  display: flex;

  img {
    filter: var(--link-colorizer);
    height: $icon-size;
    margin-right: 5px;
    vertical-align: middle;
    width: $icon-size;
  }

  &:hover img {
    filter: var(--link-hover-colorizer);
  }
}
</style>
