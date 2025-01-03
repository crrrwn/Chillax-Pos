import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import AdminLogin from '../views/AdminLogin.vue'
import CashierLogin from '../views/CashierLogin.vue'
import AdminDashboard from '../views/AdminDashboard.vue'
import ManageProducts from '../views/ManageProducts.vue'
import ManageCategories from '../views/ManageCategories.vue'
import FinancialReports from '../views/FinancialReports.vue'
import CashierInterface from '../views/CashierInterface.vue'

const routes = [
  { path: '/', name: 'HomePage', component: HomePage },
  { path: '/admin-login', name: 'AdminLogin', component: AdminLogin },
  { path: '/cashier-login', name: 'CashierLogin', component: CashierLogin },
  { path: '/admin-dashboard', name: 'AdminDashboard', component: AdminDashboard },
  { path: '/manage-products', name: 'ManageProducts', component: ManageProducts },
  { path: '/manage-categories', name: 'ManageCategories', component: ManageCategories },
  { path: '/financial-reports', name: 'FinancialReports', component: FinancialReports },
  { path: '/cashier', name: 'CashierInterface', component: CashierInterface },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router