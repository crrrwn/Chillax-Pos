import { ref, onMounted, onUnmounted } from 'vue'
import { getFirestore, collection, query, orderBy, limit, Timestamp, onSnapshot } from 'firebase/firestore'

export function useSalesData() {
  const db = getFirestore()
  const dailySales = ref(0)
  const monthlySales = ref(0)
  const overallSales = ref(0)
  const recentSales = ref([])
  const productSales = ref([])

  let unsubscribe = null

  const updateSalesData = (sales) => {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Calculate daily sales
    dailySales.value = sales
      .filter(sale => {
        const saleDate = sale.timestamp instanceof Timestamp 
          ? sale.timestamp.toDate() 
          : new Date(sale.timestamp)
        return saleDate >= startOfDay
      })
      .reduce((sum, sale) => sum + sale.total, 0)

    // Calculate monthly sales
    monthlySales.value = sales
      .filter(sale => {
        const saleDate = sale.timestamp instanceof Timestamp 
          ? sale.timestamp.toDate() 
          : new Date(sale.timestamp)
        return saleDate >= startOfMonth
      })
      .reduce((sum, sale) => sum + sale.total, 0)

    // Calculate overall sales
    overallSales.value = sales.reduce((sum, sale) => sum + sale.total, 0)

    updateProductSales(sales)
  }

  const fetchSalesData = async () => {
    try {
      const salesRef = collection(db, 'sales')
      const recentSalesQuery = query(
        salesRef,
        orderBy('timestamp', 'desc'),
        limit(50)
      )

      // Set up real-time listener
      if (!unsubscribe) {
        unsubscribe = onSnapshot(recentSalesQuery, (snapshot) => {
          const sales = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp instanceof Timestamp 
              ? doc.data().timestamp 
              : Timestamp.fromDate(new Date(doc.data().timestamp))
          }))

          // Filter completed sales
          const completedSales = sales.filter(sale => sale.status === 'completed')
          recentSales.value = completedSales
          updateSalesData(completedSales)
        }, (error) => {
          console.error('Error fetching sales data:', error)
        })
      }
    } catch (error) {
      console.error('Error setting up sales listener:', error)
    }
  }

  const updateProductSales = (sales) => {
    const productMap = new Map()

    sales.forEach(sale => {
      sale.items.forEach(item => {
        if (!productMap.has(item.productId)) {
          productMap.set(item.productId, {
            id: item.productId,
            name: item.productName,
            price: item.price,
            sold: 0,
            revenue: 0,
            lastSold: sale.timestamp instanceof Timestamp 
              ? sale.timestamp.toDate() 
              : new Date(sale.timestamp)
          })
        }
        const product = productMap.get(item.productId)
        product.sold += item.quantity
        product.revenue += item.price * item.quantity
        const saleDate = sale.timestamp instanceof Timestamp 
          ? sale.timestamp.toDate() 
          : new Date(sale.timestamp)
        if (saleDate > product.lastSold) {
          product.lastSold = saleDate
        }
      })
    })

    productSales.value = Array.from(productMap.values())
  }

  const refreshSalesData = async () => {
    await fetchSalesData()
  }

  onMounted(() => {
    fetchSalesData()
  })

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe()
    }
  })

  return {
    dailySales,
    monthlySales,
    overallSales,
    recentSales,
    productSales,
    fetchSalesData,
    refreshSalesData
  }
}

