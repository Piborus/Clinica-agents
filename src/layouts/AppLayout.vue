<script setup lang="ts">
import { LogOut, Menu, UserRound, UsersRound, X } from '@lucide/vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppBrand from '@/components/AppBrand.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const isOpen = ref(false)
async function handleSignOut() {
  await auth.signOut()
  await router.replace('/entrar')
}
</script>

<template>
  <div class="app-shell">
    <button
      class="mobile-menu"
      type="button"
      :aria-expanded="isOpen"
      aria-controls="primary-navigation"
      @click="isOpen = !isOpen"
    >
      <X v-if="isOpen" /><Menu v-else /><span class="sr-only">Menu</span>
    </button>
    <aside id="primary-navigation" class="sidebar" :class="{ 'sidebar--open': isOpen }">
      <AppBrand />
      <nav aria-label="Navegação principal">
        <RouterLink to="/pacientes" @click="isOpen = false"><UsersRound /> Pacientes</RouterLink>
        <RouterLink to="/perfil" @click="isOpen = false"><UserRound /> Meu perfil</RouterLink>
      </nav>
      <div class="account">
        <span class="avatar">{{ auth.profile?.fullName?.charAt(0) || 'P' }}</span>
        <span
          ><strong>{{ auth.profile?.fullName || 'Profissional' }}</strong
          ><small v-if="auth.profile"
            >CRP {{ auth.profile.crpState }}/{{ auth.profile.crpNumber }}</small
          ></span
        >
      </div>
      <button class="sign-out" type="button" @click="handleSignOut">
        <LogOut :size="18" /> Sair
      </button>
    </aside>
    <main class="main"><RouterView /></main>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 260px 1fr;
}
.sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  background: white;
  border-right: 1px solid #e2e8f0;
  padding: 1.5rem 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  z-index: 40;
}
nav {
  display: grid;
  gap: 0.35rem;
}
nav a,
.sign-out {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  min-height: 44px;
  padding: 0.7rem 0.8rem;
  border-radius: var(--radius);
  color: var(--ink-muted);
  text-decoration: none;
  border: 0;
  background: transparent;
}
nav a.router-link-active {
  background: var(--secondary-soft);
  color: #183f32;
  font-weight: 650;
  box-shadow: inset 3px 0 var(--secondary);
}
nav svg {
  width: 20px;
}
.account {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid #e8ebf0;
  display: flex;
  gap: 0.7rem;
  align-items: center;
  min-width: 0;
}
.account strong,
.account small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.account strong {
  font-size: 0.86rem;
}
.account small {
  color: var(--ink-muted);
  font-size: 0.72rem;
  margin-top: 0.2rem;
}
.avatar {
  flex: 0 0 38px;
  height: 38px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--surface-container);
  color: var(--primary);
  font-weight: 700;
}
.sign-out {
  width: 100%;
  text-align: left;
}
.main {
  min-width: 0;
}
.mobile-menu {
  display: none;
}
@media (max-width: 900px) {
  .app-shell {
    grid-template-columns: 1fr;
  }
  .sidebar {
    position: fixed;
    left: 0;
    transform: translateX(-105%);
    width: min(86vw, 300px);
    transition: transform 0.18s ease;
    box-shadow: var(--shadow-2);
  }
  .sidebar--open {
    transform: translateX(0);
  }
  .mobile-menu {
    display: grid;
    position: fixed;
    right: 1rem;
    top: 0.9rem;
    z-index: 50;
    width: 44px;
    height: 44px;
    place-items: center;
    border: 0;
    border-radius: 50%;
    background: var(--primary);
    color: white;
  }
}
</style>
