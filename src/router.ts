import { createRouter, createWebHistory } from 'vue-router';
import Home from './views/Home.vue';
import Search from './views/Search.vue';
import Profile from './views/Profile.vue';
import Dashboard from './views/Dashboard.vue';
import Admin from './views/Admin.vue';
import Auth from './views/Auth.vue';
import CityLanding from './views/CityLanding.vue';
export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/search', component: Search },
    { path: '/recherche', redirect: '/search' },
    { path: '/cities/:city', component: CityLanding },
    { path: '/:city/:slug', component: Profile },
    { path: '/dashboard', component: Dashboard },
    { path: '/profile', redirect: '/dashboard' },
    { path: '/login', component: Auth },
    { path: '/register', component: Auth },
    { path: '/compte', redirect: '/login' },
    { path: '/admin', component: Admin },
  ],
});
