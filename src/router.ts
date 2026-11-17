import { createMemoryHistory, createRouter, createWebHistory } from 'vue-router';
import Home from './views/Home.vue';
import Profile from './views/Profile.vue';
import Dashboard from './views/Dashboard.vue';
import Admin from './views/Admin.vue';
import Login from './views/Login.vue';
import Register from './views/Register.vue';
import CityLanding from './views/CityLanding.vue';
import Legal from './views/Legal.vue';
import CityDirectory from './views/CityDirectory.vue';
export const routes = [
  { path: '/', component: Home },
  { path: '/fr/villes', component: CityDirectory, props: { locale: 'fr' } },
  { path: '/en/cities', component: CityDirectory, props: { locale: 'en' } },
  { path: '/fr/villes/:citySlug', component: CityLanding, props: { locale: 'fr' } },
  { path: '/en/cities/:citySlug', component: CityLanding, props: { locale: 'en' } },
  { path: '/fr/profil/:uuid', component: Profile, props: { locale: 'fr' } },
  { path: '/en/profile/:uuid', component: Profile, props: { locale: 'en' } },
  {
    path: '/cities/:citySlug',
    redirect: (to: { params: Record<string, string | string[]> }) => {
      const citySlug = String(to.params.citySlug);
      return /^[a-z0-9]+-\d+$/.test(citySlug) ? `/fr/villes/${encodeURIComponent(citySlug)}` : '/';
    },
  },
  { path: '/search', redirect: '/' },
  { path: '/recherche', redirect: '/' },
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
  history: typeof window === 'undefined' ? createMemoryHistory() : createWebHistory(),
  routes,
});
