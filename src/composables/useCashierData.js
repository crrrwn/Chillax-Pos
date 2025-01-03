import { ref, onMounted, onUnmounted } from 'vue'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from '../firebase'

export function useCashierData() {
  const categories = ref([])
  const products = ref([])
  let unsubscribeCategories = null
  let unsubscribeProducts = null

  const fetchData = () => {
    // Fetch categories with real-time updates
    if (!unsubscribeCategories) {
      const categoriesRef = collection(db, 'categories')
      const categoriesQuery = query(categoriesRef, orderBy('name'))

      unsubscribeCategories = onSnapshot(categoriesQuery, (snapshot) => {
        const updatedCategories = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        categories.value = updatedCategories
        localStorage.setItem('cashier_categories', JSON.stringify(updatedCategories))
      }, (error) => {
        console.error("Error fetching categories:", error)
      })
    }

    // Fetch products with real-time updates
    if (!unsubscribeProducts) {
      const productsRef = collection(db, 'products')
      const productsQuery = query(productsRef, orderBy('name'))

      unsubscribeProducts = onSnapshot(productsQuery, (snapshot) => {
        const updatedProducts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        products.value = updatedProducts
        localStorage.setItem('cashier_products', JSON.stringify(updatedProducts))
      }, (error) => {
        console.error("Error fetching products:", error)
      })
    }
  }

  onMounted(() => {
    // Load from localStorage first
    const storedCategories = localStorage.getItem('cashier_categories')
    const storedProducts = localStorage.getItem('cashier_products')
    
    if (storedCategories) {
      categories.value = JSON.parse(storedCategories)
    }
    if (storedProducts) {
      products.value = JSON.parse(storedProducts)
    }

    // Then setup real-time updates
    fetchData()
  })

  onUnmounted(() => {
    if (unsubscribeCategories) {
      unsubscribeCategories()
    }
    if (unsubscribeProducts) {
      unsubscribeProducts()
    }
  })

  return {
    categories,
    products
  }
}

