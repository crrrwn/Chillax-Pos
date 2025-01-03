<template>
  <div class="admin-dashboard">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <h1>Chillax Admin</h1>
      </div>
      <nav class="sidebar-nav">
        <router-link to="/admin-dashboard" class="nav-item active">
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
        <router-link to="/financial-reports" class="nav-item">
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
      <h2 class="page-title">Dashboard</h2>
      
      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <h3>Daily Sales</h3>
          <p class="amount">₱ {{ dailySales.toFixed(2) }}</p>
        </div>
        <div class="stat-card">
          <h3>Monthly Sales</h3>
          <p class="amount">₱ {{ monthlySales.toFixed(2) }}</p>
        </div>
        <div class="stat-card">
          <h3>Overall Sales</h3>
          <p class="amount">₱ {{ overallSales.toFixed(2) }}</p>
        </div>
      </div>

      <!-- Recent Sales with Filtering -->
      <section class="sales-section">
        <div class="section-header">
          <h3>Recent Sales</h3>
          <div class="filter-controls">
            <select v-model="recentSalesFilter" @change="setRecentSalesFilter" class="filter-input">
              <option value="today">Today</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Products</th>
                <th>Quantity</th>
                <th>Total</th>
                <th>Date and Time</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sale in paginatedRecentSales" :key="sale.id">
                <td>{{ formatProducts(sale.items) }}</td>
                <td>{{ calculateTotalQuantity(sale.items) }}</td>
                <td>₱ {{ sale.total.toFixed(2) }}</td>
                <td>{{ formatDate(sale.timestamp) }}</td>
              </tr>
              <tr v-if="paginatedRecentSales.length === 0">
                <td colspan="4" class="empty-state">No sales found for the selected period</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="pagination-controls" v-if="filteredRecentSales.length > itemsPerPage">
          <button 
            @click="changePage(currentPage - 1)" 
            :disabled="currentPage === 1"
            class="pagination-btn"
          >
            Previous
          </button>
          <span>Page {{ currentPage }} of {{ totalPages }}</span>
          <button 
            @click="changePage(currentPage + 1)" 
            :disabled="currentPage === totalPages"
            class="pagination-btn"
          >
            Next
          </button>
        </div>
      </section>

      <!-- Product Sales with Filtering -->
      <section class="sales-section">
        <div class="section-header">
          <h3>Product Sales</h3>
          <div class="filter-controls">
            <select v-model="productSalesFilter" @change="setProductSalesFilter" class="filter-input">
              <option value="today">Today</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="all">All Time</option>
            </select>
            <input 
              type="text" 
              v-model="productSearchFilter"
              placeholder="Search products..."
              class="filter-input"
            >
            
            <button class="print-btn" @click="handlePrint">
              <i class="print-icon"></i>
              Print
            </button>
          </div>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Sold</th>
                <th>Revenue</th>
                <th>Date and Time</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in paginatedProductSales" :key="product.id">
                <td>{{ product.name }}</td>
                <td>₱ {{ product.price.toFixed(2) }}</td>
                <td>{{ product.sold }}</td>
                <td>₱ {{ product.revenue.toFixed(2) }}</td>
                <td>{{ formatDate(product.lastSold) }}</td>
              </tr>
              <tr v-if="paginatedProductSales.length === 0">
                <td colspan="5" class="empty-state">No products found for the selected period</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="pagination-controls" v-if="filteredProductSales.length > itemsPerPage">
          <button 
            @click="changeProductPage(currentProductPage - 1)" 
            :disabled="currentProductPage === 1"
            class="pagination-btn"
          >
            Previous
          </button>
          <span>Page {{ currentProductPage }} of {{ totalProductPages }}</span>
          <button 
            @click="changeProductPage(currentProductPage + 1)" 
            :disabled="currentProductPage === totalProductPages"
            class="pagination-btn"
          >
            Next
          </button>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth'
import { useSalesData } from '../composables/useSalesData'

const router = useRouter()
const { dailySales, monthlySales, overallSales, recentSales, fetchSalesData } = useSalesData()

// Filters
const recentSalesFilter = ref('all')
const productSalesFilter = ref('today')
const productSearchFilter = ref('')

// Pagination
const currentPage = ref(1)
const currentProductPage = ref(1)
const itemsPerPage = ref(5)

// Computed filtered sales
const filteredRecentSales = computed(() => {
  const filtered = filterSalesByPeriod(recentSales.value, recentSalesFilter.value)
  return filtered.sort((a, b) => {
    const dateA = a.timestamp?.toDate?.() || new Date(a.timestamp)
    const dateB = b.timestamp?.toDate?.() || new Date(b.timestamp)
    return dateB - dateA
  })
})

// Computed filtered and sorted products
const filteredProductSales = computed(() => {
  const filteredSales = filterSalesByPeriod(recentSales.value, productSalesFilter.value)
  
  const productMap = new Map()

  filteredSales.forEach(sale => {
    sale.items.forEach(item => {
      if (!productMap.has(item.productId)) {
        productMap.set(item.productId, {
          id: item.productId,
          name: item.productName,
          price: item.price,
          sold: 0,
          revenue: 0,
          lastSold: sale.timestamp
        })
      }
      const product = productMap.get(item.productId)
      product.sold += item.quantity
      product.revenue += item.price * item.quantity
      if (sale.timestamp > product.lastSold) {
        product.lastSold = sale.timestamp
      }
    })
  })

  let filtered = Array.from(productMap.values())

  if (productSearchFilter.value) {
    const searchTerm = productSearchFilter.value.toLowerCase()
    filtered = filtered.filter(product => 
      product.name.toLowerCase().includes(searchTerm)
    )
  }

  return filtered.sort((a, b) => {
    const dateA = new Date(a.lastSold)
    const dateB = new Date(b.lastSold)
    return dateB - dateA
  })
})

// Computed properties for pagination
const paginatedRecentSales = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredRecentSales.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredRecentSales.value.length / itemsPerPage.value)
})

const paginatedProductSales = computed(() => {
  const start = (currentProductPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredProductSales.value.slice(start, end)
})

const totalProductPages = computed(() => {
  return Math.ceil(filteredProductSales.value.length / itemsPerPage.value)
})

// Filter functions
const filterSalesByPeriod = (sales, period) => {
  if (!sales || sales.length === 0) return []
  
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfYear = new Date(now.getFullYear(), 0, 1)

  return sales.filter(sale => {
    const saleDate = sale.timestamp?.toDate?.() || new Date(sale.timestamp)
    
    if (!saleDate) return false

    switch (period) {
      case 'today':
        return saleDate >= startOfDay
      case 'month':
        return saleDate >= startOfMonth
      case 'year':
        return saleDate >= startOfYear
      default:
        return true
    }
  })
}

const setRecentSalesFilter = () => {
  currentPage.value = 1
}

const setProductSalesFilter = () => {
  currentProductPage.value = 1
}

const handleLogout = async () => {
  try {
    const auth = getAuth()
    await signOut(auth)
    router.push('/')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

const handlePrint = () => {
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  
  // Create the print content with only the filtered products
  const printContent = `
    <html>
      <head>
        <title>Product Sales Report</title>
        <style>
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f8f9fa; }
          .title { margin-bottom: 20px; }
          @media print {
            .title { margin-bottom: 20px; }
          }
        </style>
      </head>
      <body>
        <h2 class="title">Product Sales Report - ${productSalesFilter.value.charAt(0).toUpperCase() + productSalesFilter.value.slice(1)}</h2>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Sold</th>
              <th>Revenue</th>
              <th>Date and Time</th>
            </tr>
          </thead>
          <tbody>
            ${filteredProductSales.value.map(product => `
              <tr>
                <td>${product.name}</td>
                <td>₱ ${product.price.toFixed(2)}</td>
                <td>${product.sold}</td>
                <td>₱ ${product.revenue.toFixed(2)}</td>
                <td>${formatDate(product.lastSold)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;

  // Write the content to the new window and print it
  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
}

const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  const date = timestamp instanceof Date ? timestamp : 
               (timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp));
  return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleString();
}

const calculateTotalQuantity = (items) => {
  return items.reduce((sum, item) => sum + item.quantity, 0)
}

const formatProducts = (items) => {
  return items.map(item => `${item.productName} (${item.quantity})`).join(', ')
}

const changePage = (page) => {
  currentPage.value = page
}

const changeProductPage = (page) => {
  currentProductPage.value = page
}

watch([recentSalesFilter, productSalesFilter, productSearchFilter], () => {
  currentPage.value = 1
  currentProductPage.value = 1
})

onMounted(async () => {
  const auth = getAuth()
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      await fetchSalesData()
    } else {
      // Redirect to login page if not authenticated
      router.push('/admin-login')
    }
  })
})
</script>

<style scoped>
.admin-dashboard {
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

.logout {
  margin-top: auto;
  margin-bottom: 1rem;
  cursor: pointer;
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

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.stat-card h3 {
  font-family: "Playfair Display", serif;
  font-size: 1.25rem;
  margin: 0 0 0.5rem;
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

.section-header h3 {
  font-family: "Playfair Display", serif;
  font-size: 1.25rem;
  margin: 0;
  color: #333;
}

/* Filter Controls */
.filter-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.filter-input {
  padding: 0.5rem;
  border: 1px solid #e9ecef;
  border-radius: 5px;
  font-size: 0.9rem;
}

.filter-input[type="text"] {
  margin-left: auto;
  width: 200px;
}

.filter-btn, .print-btn {
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 5px;
  color: #495057;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.filter-btn:hover, .print-btn:hover, .filter-btn.active {
  background: #f8f9fa;
  border-color: #FF1493;
  color: #FF1493;
}

/* Table Styles */
.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
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

.empty-state {
  text-align: center;
  color: #6c757d;
  padding: 2rem;
}

/* Icon styles */
.dashboard-icon, .products-icon, .categories-icon, .sales-icon, .logout-icon, .print-icon {
  display: inline-block;
  width: 20px;
  height: 20px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.dashboard-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' /%3E%3C/svg%3E");
}

.products-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' /%3E%3C/svg%3E");
}

.categories-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' /%3E%3C/svg%3E");
}

.sales-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' /%3E%3C/svg%3E");
}

.logout-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' /%3E%3C/svg%3E");
}

.print-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z' /%3E%3C/svg%3E");
}

/* Responsive Design */
@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
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
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .filter-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-input, .filter-btn, .print-btn {
    width: 100%;
    margin-bottom: 0.5rem;
  }
}

/* Print Styles */
@media print {
  .sidebar, .filter-controls, .print-btn, .stats-grid, .sales-section:first-of-type {
    display: none;
  }

  .main-content {
    margin-left: 0;
  }

  .sales-section:last-of-type {
    box-shadow: none;
    padding: 0;
  }

  .sales-section:last-of-type .filter-controls {
    display: none;
  }

  .pagination-controls {
    display: none;
  }
}

/* Pagination Styles */
.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1rem;
  gap: 1rem;
}

.pagination-btn {
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 5px;
  color: #495057;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.pagination-btn:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: #FF1493;
  color: #FF1493;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>

