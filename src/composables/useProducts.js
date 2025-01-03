import { ref, onMounted, onUnmounted } from 'vue'
import { collection, addDoc, doc, deleteDoc, onSnapshot, query, orderBy, limit, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'

const products = ref([])
let unsubscribe = null

export function useProducts() {
  const fetchProducts = () => {
    if (!unsubscribe) {
      const productsRef = collection(db, 'products')
      const q = query(productsRef, orderBy('name'), limit(100))

      unsubscribe = onSnapshot(q, (snapshot) => {
        products.value = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        // Save products to localStorage for persistence
        localStorage.setItem('products', JSON.stringify(products.value))
      }, (error) => {
        console.error("Error fetching products:", error)
      })
    }
  }

  const addProduct = async (product) => {
    try {
      const productsRef = collection(db, 'products')
      await addDoc(productsRef, {
        name: product.name,
        price: parseFloat(product.price),
        category: product.category
      })
      // Product will be added to the list via onSnapshot
    } catch (error) {
      console.error('Error adding product:', error)
      throw error
    }
  }

  const deleteProduct = async (productId) => {
    try {
      const productRef = doc(db, 'products', productId)
      await deleteDoc(productRef)
      // Product will be removed from the list via onSnapshot
    } catch (error) {
      console.error('Error deleting product:', error)
      throw error
    }
  }

  const updateProductInDB = async (product) => {
    try {
      const productRef = doc(db, 'products', product.id)
      await updateDoc(productRef, {
        name: product.name,
        price: parseFloat(product.price),
        category: product.category
      })
      // Product will be updated in the list via onSnapshot
    } catch (error) {
      console.error('Error updating product:', error)
      throw error
    }
  }

  onMounted(() => {
    // Load products from localStorage if available
    const storedProducts = localStorage.getItem('products')
    if (storedProducts) {
      products.value = JSON.parse(storedProducts)
    }
    fetchProducts()
  })

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
  })

  return {
    products,
    addProduct,
    deleteProduct,
    fetchProducts,
    updateProductInDB
  }
}

