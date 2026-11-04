import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import './styles.css';
import App from './App.vue';

if (localStorage.getItem('theme') === 'dark') {
  document.documentElement.classList.add('dark');
}

const app = createApp(App).use(createPinia()).use(router);

router.isReady().then(() => app.mount('#app'));
