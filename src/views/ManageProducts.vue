<template>
  <div class="manage-products">
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
        <router-link to="/manage-products" class="nav-item active">
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
      <h2 class="page-title">Manage Product</h2>
      
      <!-- Add New Product Form -->
      <div class="content-card">
        <h3>Add New Product</h3>
        <form @submit.prevent="addNewProduct" class="add-product-form">
          <div class="form-group">
            <input 
              type="text" 
              id="productName" 
              v-model="newProduct.name" 
              placeholder="Product Name"
              required
            >
          </div>
          <div class="form-group">
            <input 
              type="number" 
              id="productPrice" 
              v-model="newProduct.price" 
              placeholder="Price"
              step="0.01" 
              required
            >
          </div>
          <div class="form-group">
            <select 
              id="productCategory" 
              v-model="newProduct.category" 
              required
            >
              <option value="" disabled selected>Select Category</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>
          <button type="submit" class="btn-primary" :disabled="isAddingProduct">
            {{ isAddingProduct ? 'Adding...' : 'Add Product' }}
          </button>
        </form>
      </div>

      <!-- Product List -->
      <div class="content-card">
        <h3>Product List</h3>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Category</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in paginatedProducts" :key="product.id">
                <td>
                  <div v-if="editingProduct && editingProduct.id === product.id" class="edit-form">
                    <input v-model="editingProduct.name" type="text" required>
                  </div>
                  <span v-else>{{ product.name }}</span>
                </td>
                <td>
                  <div v-if="editingProduct && editingProduct.id === product.id" class="edit-form">
                    <input v-model="editingProduct.price" type="number" step="0.01" required>
                  </div>
                  <span v-else>₱ {{ product.price.toFixed(2) }}</span>
                </td>
                <td>
                  <div v-if="editingProduct && editingProduct.id === product.id" class="edit-form">
                    <select v-model="editingProduct.category" required>
                      <option v-for="category in categories" :key="category.id" :value="category.id">
                        {{ category.name }}
                      </option>
                    </select>
                  </div>
                  <span v-else>{{ getCategoryName(product.category) }}</span>
                </td>
                <td class="action-buttons">
                  <template v-if="editingProduct && editingProduct.id === product.id">
                    <button @click="updateProduct" class="btn-save">
                      <i class="save-icon"></i> Save
                    </button>
                    <button @click="cancelEdit" class="btn-cancel">
                      <i class="cancel-icon"></i> Cancel
                    </button>
                  </template>
                  <template v-else>
                    <button @click="editProduct(product)" class="btn-edit">
                      <i class="edit-icon"></i> Edit
                    </button>
                    <button @click="removeProduct(product.id)" class="btn-delete" :disabled="isDeletingProduct === product.id">
                      <i class="delete-icon"></i> {{ isDeletingProduct === product.id ? 'Deleting...' : 'Delete' }}
                    </button>
                  </template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Pagination -->
        <div class="pagination">
          <button @click="prevPage" :disabled="currentPage === 1" class="pagination-btn">
            <i class="chevron-left-icon"></i> Previous
          </button>
          <span>Page {{ currentPage }} of {{ totalPages }}</span>
          <button @click="nextPage" :disabled="currentPage === totalPages" class="pagination-btn">
            Next <i class="chevron-right-icon"></i>
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAuth, signOut } from 'firebase/auth'
import { useProducts } from '../composables/useProducts'
import { useCategories } from '../composables/useCategories'

const router = useRouter()
const { products, addProduct, deleteProduct, fetchProducts, updateProductInDB } = useProducts()
const { categories } = useCategories()

const newProduct = ref({ name: '', price: 0, category: '' })
const isAddingProduct = ref(false)
const isDeletingProduct = ref(null)
const editingProduct = ref(null)

// Pagination
const currentPage = ref(1)
const itemsPerPage = 5

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return products.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(products.value.length / itemsPerPage))

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
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

const addNewProduct = async () => {
  if (newProduct.value.name && newProduct.value.price && newProduct.value.category) {
    isAddingProduct.value = true
    try {
      await addProduct({
        name: newProduct.value.name,
        price: parseFloat(newProduct.value.price),
        category: newProduct.value.category
      })
      newProduct.value = { name: '', price: 0, category: '' }
    } catch (error) {
      console.error('Error adding product:', error)
    } finally {
      isAddingProduct.value = false
    }
  }
}

const editProduct = (product) => {
  editingProduct.value = { ...product }
}

const updateProduct = async () => {
  if (editingProduct.value) {
    try {
      await updateProductInDB(editingProduct.value)
      const index = products.value.findIndex(p => p.id === editingProduct.value.id)
      if (index !== -1) {
        products.value[index] = { ...editingProduct.value }
      }
      editingProduct.value = null
    } catch (error) {
      console.error('Error updating product:', error)
    }
  }
}

const cancelEdit = () => {
  editingProduct.value = null
}

const removeProduct = async (productId) => {
  isDeletingProduct.value = productId
  try {
    await deleteProduct(productId)
    // Adjust currentPage if the last item on the last page is deleted
    if (paginatedProducts.value.length === 1 && currentPage.value > 1) {
      currentPage.value--
    }
  } catch (error) {
    console.error('Error deleting product:', error)
  } finally {
    isDeletingProduct.value = null
  }
}

const getCategoryName = (categoryId) => {
  const category = categories.value.find(cat => cat.id === categoryId)
  return category ? category.name : 'Unknown'
}

onMounted(() => {
  fetchProducts()
})
</script>

<style scoped>
.manage-products {
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

.content-card {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.content-card h3 {
  font-family: "Playfair Display", serif;
  font-size: 1.25rem;
  margin: 0 0 1.5rem;
  color: #333;
}

/* Form Styles */
.add-product-form {
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
}

.form-group {
  flex: 1;
  max-width: 300px;
  display: flex;
  align-items: center;
}

input, select {
  height: 42px;
  width: 100%;
  padding: 0 0.75rem;
  border: 1px solid #e9ecef;
  border-radius: 5px;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.2s ease;
}

input:focus, select:focus {
  border-color: #FF1493;
  box-shadow: 0 0 0 2px rgba(255, 20, 147, 0.1);
}

.btn-primary {
  height: 42px;
  padding: 0 1.5rem;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  min-width: 120px;
  background: #FF1493;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
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

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-edit, .btn-delete, .btn-save, .btn-cancel {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.btn-edit {
  background: #f8f9fa;
  color: #495057;
}

.btn-delete {
  background: #ff4136;
  color: white;
}

.btn-save {
  background: #28a745;
  color: white;
}

.btn-cancel {
  background: #6c757d;
  color: white;
}

.btn-edit:hover {
  background: #e9ecef;
}

.btn-delete:hover {
  background: #ff1a1a;
}

.btn-save:hover {
  background: #218838;
}

.btn-cancel:hover {
  background: #5a6268;
}

/* Icon styles using SVG backgrounds */
.dashboard-icon, .products-icon, .categories-icon, .sales-icon, .logout-icon,
.edit-icon, .delete-icon, .save-icon, .cancel-icon, .chevron-left-icon, .chevron-right-icon {
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

.edit-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' /%3E%3C/svg%3E");
}

.delete-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' /%3E%3C/svg%3E");
}

.save-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M5 13l4 4L19 7' /%3E%3C/svg%3E");
}

.cancel-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 18L18 6M6 6l12 12' /%3E%3C/svg%3E");
}

.chevron-left-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M15 19l-7-7 7-7' /%3E%3C/svg%3E");
}

.chevron-right-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M9 5l7 7-7 7' /%3E%3C/svg%3E");
}

.edit-form {
  display: flex;
  align-items: center;
}

.edit-form input,
.edit-form select {
  width: 100%;
  padding: 0.25rem 0.5rem;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  font-size: 0.9rem;
}

/* Pagination Styles */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1rem;
  gap: 1rem;
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 5px;
  color: #495057;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.pagination-btn:hover:not(:disabled) {
  background: #e9ecef;
  color: #FF1493;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

  .add-product-form {
    flex-direction: column;
  }

  .form-group {
    width: 100%;
  }
}
</style>

