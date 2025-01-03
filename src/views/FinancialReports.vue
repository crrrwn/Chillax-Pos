<template>
  <div class="financial-reports">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <h1>Chillax Admin</h1>
      </div>
      <nav class="sidebar-nav">
        <router-link to="/admin-dashboard" class="nav-item">
          <i class="dashboard-icon"></i>
          Dashboard
        </router-link>
        <router-link to="/manage-products" class="nav-item">
          <i class="products-icon"></i>
          Products
        </router-link>
        <router-link to="/manage-categories" class="nav-item">
          <i class="categories-icon"></i>
          Categories
        </router-link>
        <router-link to="/financial-reports" class="nav-item active">
          <i class="sales-icon"></i>
          Sales
        </router-link>
        <a @click="handleLogout" class="nav-item logout">
          <i class="logout-icon"></i>
          Logout
        </a>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <h2 class="page-title">Financial Reports</h2>
      
      <!-- Revenue Overview -->
      <div class="revenue-overview">
        <div class="revenue-card">
          <h3>Today's Revenue</h3>
          <p class="amount">₱ {{ todayRevenue.toFixed(2) }}</p>
        </div>
        <div class="revenue-card">
          <h3>Weekly Revenue</h3>
          <p class="amount">₱ {{ weeklyRevenue.toFixed(2) }}</p>
        </div>
        <div class="revenue-card">
          <h3>Monthly Revenue</h3>
          <p class="amount">₱ {{ monthlyRevenue.toFixed(2) }}</p>
        </div>
        <div class="revenue-card">
          <h3>Yearly Revenue</h3>
          <p class="amount">₱ {{ yearlyRevenue.toFixed(2) }}</p>
        </div>
      </div>

      <!-- Sale Summary -->
      <div class="sales-section">
        <div class="section-header">
          <h3>Sale Summary</h3>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Total Sales</th>
                <th>Number of Transactions</th>
                <th>Average Transaction Value</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sale in saleSummary" :key="sale.date">
                <td>{{ formatDate(sale.date) }}</td>
                <td>₱ {{ sale.totalSales.toFixed(2) }}</td>
                <td>{{ sale.numberOfTransactions }}</td>
                <td>₱ {{ (sale.totalSales / sale.numberOfTransactions).toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAuth, signOut } from 'firebase/auth'
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore'

const router = useRouter()
const db = getFirestore()

const todayRevenue = ref(0)
const weeklyRevenue = ref(0)
const monthlyRevenue = ref(0)
const yearlyRevenue = ref(0)
const saleSummary = ref([])

const handleLogout = async () => {
  try {
    const auth = getAuth()
    await signOut(auth)
    router.push('/')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

const fetchFinancialData = async () => {
  try {
    const salesRef = collection(db, 'sales')
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfYear = new Date(now.getFullYear(), 0, 1)

    const todayQuery = query(salesRef, where('timestamp', '>=', startOfDay))
    const weekQuery = query(salesRef, where('timestamp', '>=', startOfWeek))
    const monthQuery = query(salesRef, where('timestamp', '>=', startOfMonth))
    const yearQuery = query(salesRef, where('timestamp', '>=', startOfYear))

    const [todaySnapshot, weekSnapshot, monthSnapshot, yearSnapshot] = await Promise.all([
      getDocs(todayQuery),
      getDocs(weekQuery),
      getDocs(monthQuery),
      getDocs(yearQuery)
    ])

    todayRevenue.value = todaySnapshot.docs.reduce((sum, doc) => sum + doc.data().total, 0)
    weeklyRevenue.value = weekSnapshot.docs.reduce((sum, doc) => sum + doc.data().total, 0)
    monthlyRevenue.value = monthSnapshot.docs.reduce((sum, doc) => sum + doc.data().total, 0)
    yearlyRevenue.value = yearSnapshot.docs.reduce((sum, doc) => sum + doc.data().total, 0)

    saleSummary.value = [
      { date: new Date(), totalSales: todayRevenue.value, numberOfTransactions: todaySnapshot.docs.length },
      { date: startOfWeek, totalSales: weeklyRevenue.value, numberOfTransactions: weekSnapshot.docs.length },
      { date: startOfMonth, totalSales: monthlyRevenue.value, numberOfTransactions: monthSnapshot.docs.length },
      { date: startOfYear, totalSales: yearlyRevenue.value, numberOfTransactions: yearSnapshot.docs.length }
    ]
  } catch (error) {
    console.error('Error fetching financial data:', error)
  }
}

onMounted(() => {
  fetchFinancialData()
})
</script>

<style scoped>
.financial-reports {
  display: flex;
  min-height: 100vh;
  background: #f8f9fa;
}

/* Sidebar Styles */
.sidebar {
  width: 250px;
  background: white;
  border-right: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.sidebar-header h1 {
  font-family: "Playfair Display", serif;
  font-size: 1.5rem;
  margin: 0;
  color: #333;
}

.sidebar-nav {
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  color: #495057;
  text-decoration: none;
  transition: all 0.2s ease;
  font-size: 1rem;
  gap: 0.75rem;
}

.nav-item:hover, .nav-item.active {
  background: #f8f9fa;
  color: #FF1493;
}

.nav-item i {
  width: 20px;
  height: 20px;
  opacity: 0.7;
}

/* Icon styles using SVG backgrounds */
.dashboard-icon {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' /%3E%3C/svg%3E") no-repeat center;
}

.products-icon {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' /%3E%3C/svg%3E") no-repeat center;
}

.categories-icon {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' /%3E%3C/svg%3E") no-repeat center;
}

.sales-icon {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' /%3E%3C/svg%3E") no-repeat center;
}

.logout-icon {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' /%3E%3C/svg%3E") no-repeat center;
}

.logout {
  margin-top: auto;
  margin-bottom: 1rem;
}

/* Main Content Styles */
.main-content {
  flex: 1;
  margin-left: 250px;
  padding: 2rem;
}

.page-title {
  font-family: "Playfair Display", serif;
  font-size: 2rem;
  margin: 0 0 2rem;
  color: #333;
}

/* Revenue Overview */
.revenue-overview {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  margin-bottom: 2rem;
}

.revenue-card {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.revenue-card h3 {
  font-family: "Playfair Display", serif;
  font-size: 1.25rem;
  margin: 0 0 1rem;
  color: #333;
}

.amount {
  font-size: 2rem;
  font-weight: 600;
  margin: 0;
  color: #FF1493;
}

/* Sales Sections */
.sales-section {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.sales-section h3 {
  font-family: "Playfair Display", serif;
  font-size: 1.25rem;
  margin: 0;
  color: #333;
}

/* Table Styles */
.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin: 0;
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
}

th {
  font-weight: 600;
  color: #495057;
  background: #f8f9fa;
}

td {
  color: #495057;
}

tr:last-child td {
  border-bottom: none;
}

@media (max-width: 1024px) {
  .revenue-overview {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
}

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    height: auto;
    position: relative;
  }

  .main-content {
    margin-left: 0;
    padding: 1rem;
  }

  .revenue-overview {
    grid-template-columns: 1fr;
  }
}
</style>

