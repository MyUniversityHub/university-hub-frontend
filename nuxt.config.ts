// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  components: [
    {
      path: '~/components',
      pathPrefix: false, // Đảm bảo sử dụng đúng tên component
    }
  ],
  css: ['~/assets/css/main.css', '@fortawesome/fontawesome-free/css/all.min.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  runtimeConfig: {
    public: {
      apiUrl: process.env.API_BASE_URL,
    },
  },
  ssr: false,
  app: {
    head: {
      title: 'Admin',
      meta: [
        // {charset: 'utf-8'},
        // {name: 'viewport', content: 'width=device-width, initial-scale=1, shrink-to-fit=no'},
        // {name: 'robots', content: 'follow, index'},
        // {name: 'description', content: ''},
        // {name: 'twitter:site', content: '@keenthemes'},
        // {name: 'twitter:creator', content: '@keenthemes'},
        // {name: 'twitter:card', content: 'summary_large_image'},
        // {name: 'twitter:title', content: 'Metronic - Tailwind CSS'},
        // {name: 'twitter:description', content: ''},
        // {name: 'twitter:image', content: 'assets/media/app/og-image.png'},
        // {property: 'og:url', content: 'https://127.0.0.1:8001/metronic-tailwind-html/demo1/index.html'},
        // {property: 'og:locale', content: 'en_US'},
        // {property: 'og:type', content: 'website'},
        // {property: 'og:site_name', content: '@keenthemes'},
        // {property: 'og:title', content: 'Metronic - Tailwind CSS'},
        // {property: 'og:description', content: ''},
        // {property: 'og:image', content: '/assets/media/app/logo.svg'}
      ],
      link: [
        // {rel: 'canonical', href: 'https://127.0.0.1:8001/metronic-tailwind-html/demo1/index.html'},
        // {rel: 'apple-touch-icon', href: 'assets/media/app/apple-touch-icon.png', sizes: '180x180'},
        // {rel: 'icon', href: 'assets/media/app/logo.svg', sizes: '32x32', type: 'image/png'},
        // {rel: 'icon', href: 'assets/media/app/logo.svg', sizes: '16x16', type: 'image/png'},
        // {rel: 'shortcut icon', href: '/assets/media/app/logo.svg'},
        // {
        //   rel: 'stylesheet',
        //   href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
        // },
        {rel: 'stylesheet', href: '/assets/vendors/apexcharts/apexcharts.css'},
        {rel: 'stylesheet', href: '/assets/vendors/keenicons/styles.bundle.css'},
        {rel: 'stylesheet', href: '/assets/css/styles-added.css'},
        {rel: 'stylesheet', href: '/assets/css/styles.css'}
      ],
      htmlAttrs: {
        class: 'h-full',
        'data-theme': 'true',
        'data-theme-mode': 'light',
        dir: 'ltr',
        lang: 'en'
      },
      bodyAttrs: {
        class: 'h-full text-base text-gray-700 [--tw-page-bg:#fefefe] [--tw-page-bg-dark:var(--tw-coal-500)] demo1 sidebar-fixed header-fixed bg-[--tw-page-bg]'
      },
      script: [
        {src: '/assets/js/core.bundle.js'},
        {src: '/assets/vendors/apexcharts/apexcharts.min.js'},
        {src: '/assets/js/widgets/general.js'},
        {src: '/assets/js/layouts/demo1.js'},
      ]
    }
  },
  modules: ['@pinia/nuxt', [
    '@vee-validate/nuxt',
    {
      // disable or enable auto imports
      autoImports: true,
      // Use different names for components
      componentNames: {
        Form: 'VeeForm',
        Field: 'VeeField',
        FieldArray: 'VeeFieldArray',
        ErrorMessage: 'VeeErrorMessage',
      },
    },
  ]],
})
