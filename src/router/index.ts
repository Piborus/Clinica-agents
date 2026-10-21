import { createRouter, createWebHistory } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth: boolean
    guestOnly?: boolean
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    {
      path: '/',
      redirect: () => (useAuthStore().isAuthenticated ? '/pacientes' : '/entrar'),
      meta: { requiresAuth: false },
    },
    {
      path: '/',
      component: () => import('@/layouts/AuthLayout.vue'),
      meta: { requiresAuth: false, guestOnly: true },
      children: [
        {
          path: 'entrar',
          name: 'login',
          component: () => import('@/views/auth/LoginView.vue'),
          meta: { requiresAuth: false, guestOnly: true },
        },
        {
          path: 'cadastro',
          name: 'sign-up',
          component: () => import('@/views/auth/SignUpView.vue'),
          meta: { requiresAuth: false, guestOnly: true },
        },
        {
          path: 'confirmar-email',
          name: 'confirm-email',
          component: () => import('@/views/auth/ConfirmEmailView.vue'),
          meta: { requiresAuth: false },
        },
        {
          path: 'recuperar-senha',
          name: 'forgot-password',
          component: () => import('@/views/auth/ForgotPasswordView.vue'),
          meta: { requiresAuth: false, guestOnly: true },
        },
        {
          path: 'redefinir-senha',
          name: 'reset-password',
          component: () => import('@/views/auth/ResetPasswordView.vue'),
          meta: { requiresAuth: false },
        },
        {
          path: 'auth/callback',
          name: 'auth-callback',
          component: () => import('@/views/auth/AuthCallbackView.vue'),
          meta: { requiresAuth: false },
        },
      ],
    },
    {
      path: '/',
      component: () => import('@/layouts/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: 'pacientes',
          name: 'patients',
          component: () => import('@/views/patients/PatientsView.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'pacientes/novo',
          name: 'patient-new',
          component: () => import('@/views/patients/PatientFormView.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'pacientes/:patientId',
          name: 'patient',
          component: () => import('@/views/patients/PatientView.vue'),
          meta: { requiresAuth: true },
          redirect: { name: 'patient-evolutions' },
          children: [
            {
              path: 'cadastro',
              name: 'patient-edit',
              component: () => import('@/views/patients/PatientFormView.vue'),
              meta: { requiresAuth: true },
            },
            {
              path: 'anamnese',
              name: 'patient-anamnesis',
              component: () => import('@/views/clinical/ClinicalDocumentView.vue'),
              props: { type: 'anamnesis' },
              meta: { requiresAuth: true },
            },
            {
              path: 'plano-terapeutico',
              name: 'patient-plan',
              component: () => import('@/views/clinical/ClinicalDocumentView.vue'),
              props: { type: 'therapeutic_plan' },
              meta: { requiresAuth: true },
            },
            {
              path: 'evolucoes',
              name: 'patient-evolutions',
              component: () => import('@/views/clinical/EvolutionsView.vue'),
              meta: { requiresAuth: true },
            },
            {
              path: 'evolucoes/nova',
              name: 'evolution-new',
              component: () => import('@/views/clinical/EvolutionFormView.vue'),
              meta: { requiresAuth: true },
            },
            {
              path: 'evolucoes/:evolutionId',
              name: 'evolution-edit',
              component: () => import('@/views/clinical/EvolutionFormView.vue'),
              meta: { requiresAuth: true },
            },
            {
              path: 'anexos',
              name: 'patient-attachments',
              component: () => import('@/views/documents/AttachmentsView.vue'),
              meta: { requiresAuth: true },
            },
            {
              path: 'auditoria',
              name: 'patient-audit',
              component: () => import('@/views/audit/AuditView.vue'),
              meta: { requiresAuth: true },
            },
          ],
        },
        {
          path: 'perfil',
          name: 'profile',
          component: () => import('@/views/profile/ProfileView.vue'),
          meta: { requiresAuth: true },
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: { requiresAuth: false },
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated)
    return { name: 'login', query: { redirect: to.fullPath } }
  if (to.meta.guestOnly && auth.isAuthenticated) return { name: 'patients' }
})

export default router
