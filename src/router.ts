import { createRouter, createWebHistory } from 'vue-router';
import Home from './views/Home.vue';
import Profile from './views/Profile.vue';
import Dashboard from './views/Dashboard.vue';
import Admin from './views/Admin.vue';
import Login from './views/Login.vue';
import Register from './views/Register.vue';
import CityLanding from './views/CityLanding.vue';
import Legal from './views/Legal.vue';
export const routes = [
  { path: '/', component: Home },
  { path: '/cities/:city', component: CityLanding },
  { path: '/:city/:id', component: Profile },
  { path: '/dashboard', component: Dashboard },
  { path: '/profile', redirect: '/dashboard' },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/compte', redirect: '/login' },
  { path: '/admin', component: Admin },
  { path: '/mentions-legales', component: Legal, meta: { legalPage: 'legal' } },
  { path: '/confidentialite', component: Legal, meta: { legalPage: 'privacy' } },
  { path: '/cookies', component: Legal, meta: { legalPage: 'cookies' } },
  { path: '/cgu', component: Legal, meta: { legalPage: 'terms' } },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
