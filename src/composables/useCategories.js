import { ref, onMounted, onUnmounted } from 'vue'
import { collection, addDoc, doc, deleteDoc, updateDoc, onSnapshot, query, orderBy, limit } from 'firebase/firestore'
import { db } from '../firebase'

const categories = ref([])
let unsubscribe = null

export function useCategories() {
  const fetchCategories = () => {
    if (!unsubscribe) {
      const categoriesRef = collection(db, 'categories')
      const q = query(categoriesRef, orderBy('name'), limit(100))

      unsubscribe = onSnapshot(q, (snapshot) => {
        categories.value = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        
        // Save categories to localStorage for persistence
        localStorage.setItem('categories', JSON.stringify(categories.value))
      }, (error) => {
        console.error("Error fetching categories:", error)
      })
    }
  }

  const addCategory = async (categoryName) => {
    try {
      const categoriesRef = collection(db, 'categories')
      await addDoc(categoriesRef, { name: categoryName })
      // The new category will be added through the onSnapshot listener
    } catch (error) {
      console.error('Error adding category:', error)
      throw error
    }
  }

  const deleteCategory = async (categoryId) => {
    try {
      const categoryRef = doc(db, 'categories', categoryId)
      await deleteDoc(categoryRef)
      // The category will be removed through the onSnapshot listener
    } catch (error) {
      console.error('Error deleting category:', error)
      throw error
    }
  }

  const updateCategory = async (category) => {
    try {
      const categoryRef = doc(db, 'categories', category.id)
      await updateDoc(categoryRef, { name: category.name })
      // The category will be updated through the onSnapshot listener
    } catch (error) {
      console.error('Error updating category:', error)
      throw error
    }
  }

  onMounted(() => {
    // Load categories from localStorage if available
    const storedCategories = localStorage.getItem('categories')
    if (storedCategories) {
      categories.value = JSON.parse(storedCategories)
    }
    fetchCategories()
  })

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
  })

  return {
    categories,
    addCategory,
    deleteCategory,
    updateCategory,
    fetchCategories
  }
}

