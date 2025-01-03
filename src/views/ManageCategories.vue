<template>
  <div class="manage-categories">
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
        <router-link to="/manage-categories" class="nav-item active">
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
      <h2 class="page-title">Manage Categories</h2>
      
      <!-- Add New Category Form -->
      <div class="content-card">
        <h3>Add New Category</h3>
        <form @submit.prevent="addNewCategory" class="add-category-form">
          <div class="form-group">
            <input 
              type="text" 
              id="categoryName" 
              v-model="newCategory" 
              placeholder="New Category"
              required
            >
          </div>
          <button type="submit" class="btn-primary" :disabled="isAddingCategory">
            {{ isAddingCategory ? 'Adding...' : 'Add Category' }}
          </button>
        </form>
      </div>

      <!-- Category List -->
      <div class="content-card">
        <h3>Category List</h3>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="category in paginatedCategories" :key="category.id">
                <td>
                  <div v-if="editingCategory && editingCategory.id === category.id">
                    <input 
                      type="text" 
                      v-model="editingCategory.name" 
                      @keyup.enter="updateCategory"
                      @keyup.esc="cancelEdit"
                    >
                  </div>
                  <span v-else>{{ category.name }}</span>
                </td>
                <td class="action-buttons">
                  <template v-if="editingCategory && editingCategory.id === category.id">
                    <button @click="updateCategory" class="btn-save" :disabled="isUpdatingCategory">
                      {{ isUpdatingCategory ? 'Saving...' : 'Save' }}
                    </button>
                    <button @click="cancelEdit" class="btn-cancel">Cancel</button>
                  </template>
                  <template v-else>
                    <button @click="editCategory(category)" class="btn-edit">Edit</button>
                    <button @click="removeCategory(category.id)" class="btn-delete" :disabled="isDeletingCategory">
                      {{ isDeletingCategory ? 'Deleting...' : 'Delete' }}
                    </button>
                  </template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
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
import { useCategories } from '../composables/useCategories'

const router = useRouter()
const { categories, addCategory, deleteCategory, updateCategory: updateCategoryInDB, fetchCategories } = useCategories()

const newCategory = ref('')
const editingCategory = ref(null)
const isAddingCategory = ref(false)
const isUpdatingCategory = ref(false)
const isDeletingCategory = ref(false)

const currentPage = ref(1)
const itemsPerPage = 5

const paginatedCategories = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return categories.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(categories.value.length / itemsPerPage))

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

const addNewCategory = async () => {
  if (newCategory.value.trim()) {
    try {
      isAddingCategory.value = true
      await addCategory(newCategory.value.trim())
      newCategory.value = ''
    } catch (error) {
      console.error('Error adding category:', error)
    } finally {
      isAddingCategory.value = false
    }
  }
}

const editCategory = (category) => {
  editingCategory.value = { ...category }
}

const updateCategory = async () => {
  if (editingCategory.value) {
    try {
      isUpdatingCategory.value = true
      await updateCategoryInDB(editingCategory.value)
      editingCategory.value = null
    } catch (error) {
      console.error('Error updating category:', error)
    } finally {
      isUpdatingCategory.value = false
    }
  }
}

const cancelEdit = () => {
  editingCategory.value = null
}

const removeCategory = async (categoryId) => {
  try {
    isDeletingCategory.value = true
    await deleteCategory(categoryId)
    // Adjust currentPage if the last item on the last page is deleted
    if (paginatedCategories.value.length === 1 && currentPage.value > 1) {
      currentPage.value--
    }
  } catch (error) {
    console.error('Error deleting category:', error)
  } finally {
    isDeletingCategory.value = false
  }
}

onMounted(() => {
  fetchCategories()
})
</script>

<style scoped>
.manage-categories {
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
  transition: all 0.3s ease;
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
  transition: all 0.3s ease;
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
.add-category-form {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.form-group {
  flex: 1;
  max-width: 500px;
  display: flex;
  align-items: center;
}

input {
  height: 42px;
  width: 100%;
  padding: 0 0.75rem;
  border: 1px solid #e9ecef;
  border-radius: 5px;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.2s ease;
}

input:focus {
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
  width: 120px;
  background: #FF1493;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.btn-primary:hover {
  background: #ff0080;
}

.btn-primary:disabled,
.btn-save:disabled,
.btn-delete:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
.chevron-left-icon, .chevron-right-icon {
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

.chevron-left-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M15 19l-7-7 7-7' /%3E%3C/svg%3E");
}

.chevron-right-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M9 5l7 7-7 7' /%3E%3C/svg%3E");
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

/* Responsive Styles */
@media (max-width: 1024px) {
  .sidebar {
    width: 200px;
  }

  .main-content {
    margin-left: 200px;
  }
}

@media (max-width: 768px) {
  .manage-categories {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    height: auto;
    position: static;
  }

  .sidebar-nav {
    flex-direction: row;
    justify-content: space-around;
    flex-wrap: wrap;
  }

  .nav-item {
    padding: 0.5rem 1rem;
  }

  .main-content {
    margin-left: 0;
    padding: 1rem;
  }

  .add-category-form {
    flex-direction: column;
  }

  .form-group {
    max-width: 100%;
  }

  .btn-primary {
    width: 100%;
    margin-top: 1rem;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.5rem;
  }

  .content-card {
    padding: 1rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn-edit, .btn-delete, .btn-save, .btn-cancel {
    width: 100%;
    margin-bottom: 0.5rem;
  }

  .pagination {
    flex-direction: column;
  }

  .pagination-btn {
    width: 100%;
  }
}
</style>

