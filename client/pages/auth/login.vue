<script setup lang="ts">
import * as yup from 'yup'
import { Field, Form, FormActions } from 'vee-validate'
import { definePageMeta, useLocalePath } from '#imports'
import { useRouter } from '#app'
import { useAuthStore } from '~/stores'
import { LoginMutation, LoginMutationVariables, UserLoginInput } from '~/types/graphql'
import loginMutation from '~/graphql/auth/mutations/login.graphql'

const { t } = useI18n()
const { onLogin } = useApollo()
const router = useRouter()
const localePath = useLocalePath()
const authStore = useAuthStore()

definePageMeta({
  middleware: 'guest',
})

useHead({ title: t('auth.title') })

const { mutate, onDone, loading } = useMutation<LoginMutation, LoginMutationVariables>(loginMutation)
onDone(async ({ data }) => {
  console.log(data)
  if (!data) return
  const { accessToken, user } = data.login
  await onLogin(accessToken)
  authStore.user = user
  await router.push(localePath({ name: 'index' }))
})

const schema = yup.object({
  username: yup.string().required().min(2).label(t('auth.username')),
  password: yup.string().required().min(6).label(t('auth.password')),
})

const handleLogin = async (userLoginInput: UserLoginInput, { setErrors }: FormActions<UserLoginInput>) => {
  try {
    await mutate({ userLoginInput })
  } catch (e) {
    setErrors({ username: t('auth.error'), password: t('auth.error') })
  }
}
</script>
<template>
  <v-container>
    <Form as="v-form" :validation-schema="schema" @submit="handleLogin">
      <v-card :loading="loading" class="mx-auto w-50">
        <v-card-title>{{ $t('auth.title') }}</v-card-title>
        <v-card-text>
          <Field v-slot="{ field, errors }" name="username">
            <v-text-field v-bind="field" :label="$t('auth.username')" :error-messages="errors" />
          </Field>
          <Field v-slot="{ field, errors }" name="password">
            <v-text-field v-bind="field" :label="$t('auth.password')" :error-messages="errors" type="password" />
          </Field>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" type="submit">
            {{ $t('auth.singing') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </Form>
  </v-container>
</template>
