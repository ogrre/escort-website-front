import eslint from '@eslint/js';
import vue from 'eslint-plugin-vue';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', '**/*.vue.js'] },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...vue.configs['flat/recommended'],
  {
    files: ['**/*.{ts,vue}'],
    languageOptions: {
      parserOptions: { parser: tseslint.parser },
      globals: {
        localStorage: 'readonly',
        window: 'readonly',
        document: 'readonly',
        computed: 'readonly',
        ref: 'readonly',
        reactive: 'readonly',
        watch: 'readonly',
        onMounted: 'readonly',
        onBeforeUnmount: 'readonly',
        useRoute: 'readonly',
        useRouter: 'readonly',
        useAuth: 'readonly',
        useRuntimeConfig: 'readonly',
        useAsyncData: 'readonly',
        useSeoMeta: 'readonly',
        useHead: 'readonly',
        createError: 'readonly',
        definePageMeta: 'readonly',
        defineNuxtRouteMiddleware: 'readonly',
        navigateTo: 'readonly',
        usePublicApi: 'readonly',
        navigator: 'readonly',
        Event: 'readonly',
        HTMLSelectElement: 'readonly',
        KeyboardEvent: 'readonly',
        sendRedirect: 'readonly',
        getRouterParam: 'readonly',
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/mustache-interpolation-spacing': 'off',
      'vue/html-indent': 'off',
      'vue/html-closing-bracket-newline': 'off',
      'vue/html-self-closing': 'off',
      'vue/multiline-html-element-content-newline': 'off',
    },
  },
);
