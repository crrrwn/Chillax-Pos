<template>
  <div class="cashier-interface">
    <header>
      <h1>Chillax Cafeteria</h1>
      <button @click="handleLogout" class="btn-logout">
        <i class="logout-icon"></i>
        Logout
      </button>
    </header>
    
    <main>
      <div class="product-selection">
        <!-- Category Buttons -->
        <div class="category-buttons">
          <button 
            @click="selectCategory('all')" 
            :class="{ active: selectedCategory === 'all' }" 
            class="category-btn"
          >
            All
          </button>
          <button 
            v-for="category in categories" 
            :key="category.id" 
            @click="selectCategory(category.id)" 
            :class="{ active: selectedCategory === category.id }" 
            class="category-btn"
          >
            {{ category.name }}
          </button>
        </div>

        <!-- Product Grid -->
        <div class="product-grid">
          <button 
            v-for="product in filteredProducts" 
            :key="product.id" 
            @click="addToOrder(product)" 
            class="product-card"
          >
            <h3>{{ product.name }}</h3>
            <p class="price">₱ {{ product.price.toFixed(2) }}</p>
          </button>
        </div>
      </div>

      <!-- Current Order -->
      <div class="order-panel">
        <div class="order-header">
          <h2>Current Order</h2>
        </div>
        
        <div class="order-items">
          <div v-for="item in currentOrder" :key="item.product.id" class="order-item">
            <div class="item-details">
              <h4>{{ item.product.name }}</h4>
              <p>₱ {{ (item.product.price * item.quantity).toFixed(2) }}</p>
            </div>
            <div class="item-controls">
              <button @click="decreaseQuantity(item)" class="quantity-btn">-</button>
              <span class="quantity">{{ item.quantity }}</span>
              <button @click="increaseQuantity(item)" class="quantity-btn">+</button>
              <button @click="removeFromOrder(item)" class="delete-btn">
                <i class="trash-icon"></i>
              </button>
            </div>
          </div>
        </div>

        <div class="order-footer">
          <div class="total">
            <h3>Total:</h3>
            <h3>₱ {{ orderTotal.toFixed(2) }}</h3>
          </div>
          <div class="order-actions">
            <button @click="clearOrder" class="action-btn clear-btn">Clear</button>
            <button @click="processPayment" class="action-btn pay-btn">Pay</button>
            <button @click="generateAndPrintReceipt" class="action-btn print-btn">Print Receipt</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useCategories } from '../composables/useCategories'
import { useProducts } from '../composables/useProducts'

const router = useRouter()
const { categories, fetchCategories } = useCategories()
const { products, fetchProducts } = useProducts()
const selectedCategory = ref('all')
const currentOrder = ref([])

// Generate a random receipt number
const generateReceiptNumber = () => {
  const timestamp = Date.now().toString()
  const random = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `${random}${timestamp.slice(-4)}`
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

const selectCategory = (categoryId) => {
  selectedCategory.value = categoryId
}

const filteredProducts = computed(() => {
  if (selectedCategory.value === 'all') {
    return products.value
  }
  return products.value.filter(product => product.category === selectedCategory.value)
})

const addToOrder = (product) => {
  const existingItem = currentOrder.value.find(item => item.product.id === product.id)
  if (existingItem) {
    existingItem.quantity++
  } else {
    currentOrder.value.push({ product, quantity: 1 })
  }
}

const removeFromOrder = (item) => {
  const index = currentOrder.value.indexOf(item)
  if (index !== -1) {
    currentOrder.value.splice(index, 1)
  }
}

const increaseQuantity = (item) => {
  item.quantity++
}

const decreaseQuantity = (item) => {
  if (item.quantity > 1) {
    item.quantity--
  } else {
    removeFromOrder(item)
  }
}

const orderTotal = computed(() => {
  return currentOrder.value.reduce((total, item) => total + item.product.price * item.quantity, 0)
})

const clearOrder = () => {
  currentOrder.value = []
}

const generateAndPrintReceipt = () => {
  if (currentOrder.value.length === 0) {
    alert('Please add items to your order first.')
    return
  }

  const now = new Date()
  const receiptNumber = generateReceiptNumber()
  const subtotal = orderTotal.value
  //const vat = subtotal * 0.12
  //const total = subtotal + vat

  const receiptContent = `
    <html>
      <head>
        <title>Receipt</title>
        <style>
          @page {
            margin: 0;
            size: 80mm 200mm;
          }
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            width: 80mm;
            margin: 0;
            padding: 10px;
          }
          .header {
            text-align: center;
            margin-bottom: 10px;
          }
          .header h2 {
            font-size: 16px;
            margin: 0;
            padding: 0;
          }
          .business-info {
            text-align: center;
            margin-bottom: 20px;
          }
          .receipt-details {
            margin-bottom: 20px;
          }
          .items {
            margin-bottom: 10px;
          }
          .item-header {
            border-bottom: 1px solid #000;
            margin-bottom: 5px;
            font-weight: bold;
          }
          .item-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
          }
          .totals {
            margin-top: 10px;
            border-top: 1px solid #000;
            padding-top: 10px;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            border-top: 1px solid #000;
            padding-top: 10px;
          }
          .disclaimer {
            text-align: center;
            margin-top: 20px;
            font-style: italic;
          }
          @media print {
            body { 
              width: 80mm;
              margin: 0;
              padding: 5mm;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>CHILLAX CAFE</h2>
        </div>
        <div class="business-info">
          Citywalk Food Park Sto. Niño, Calapan, Philippines<br>
          Contact: 09279663946<br>
          <!-- VAT Reg TIN removed -->
        </div>
        <div class="receipt-details">
          Date: ${now.toLocaleDateString()}<br>
          Time: ${now.toLocaleTimeString()}<br>
          Receipt No: ${receiptNumber}<br>
          Cashier: ${getAuth().currentUser?.email?.split('@')[0] || 'Unknown'}
        </div>
        <div class="items">
          <div class="item-header">
            <div class="item-row">
              <span style="width: 40%;">Item</span>
              <span style="width: 20%; text-align: center;">Qty</span>
              <span style="width: 20%; text-align: right;">Price</span>
              <span style="width: 20%; text-align: right;">Amount</span>
            </div>
          </div>
          ${currentOrder.value.map(item => `
            <div class="item-row">
              <span style="width: 40%;">${item.product.name}</span>
              <span style="width: 20%; text-align: center;">${item.quantity}</span>
              <span style="width: 20%; text-align: right;">₱${item.product.price.toFixed(2)}</span>
              <span style="width: 20%; text-align: right;">₱${(item.product.price * item.quantity).toFixed(2)}</span>
            </div>
          `).join('')}
        </div>
        <div class="totals">
          <div class="item-row">
            <span>Subtotal:</span>
            <span>₱${subtotal.toFixed(2)}</span>
          </div>
          <div class="item-row" style="font-weight: bold;">
            <span>TOTAL:</span>
            <span>₱${subtotal.toFixed(2)}</span>
          </div>
        </div>
        <div class="footer">
          Thank you for chilling with us!<br>
          Please come again
        </div>
        <div class="disclaimer">
        </div>
      </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  printWindow.document.write(receiptContent);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  setTimeout(() => {
    printWindow.close();
  }, 1000);
}

const processPayment = async () => {
  if (currentOrder.value.length === 0) {
    alert('Please add items to your order first.')
    return
  }

  try {
    const auth = getAuth()
    const user = auth.currentUser
    if (!user) {
      alert('You must be logged in to process a payment.')
      return
    }

    const salesRef = collection(db, 'sales')
    await addDoc(salesRef, {
      items: currentOrder.value.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.product.price
      })),
      total: orderTotal.value,
      timestamp: new Date(),
      status: 'completed',
      cashierId: user.uid,
      receiptNumber: generateReceiptNumber()
    })
    
    // Generate and print receipt before clearing the order
    generateAndPrintReceipt()
    
    alert('Payment processed successfully!')
    clearOrder()
  } catch (error) {
    console.error('Error processing payment:', error)
    alert('Error processing payment. Please try again.')
  }
}

onMounted(() => {
  const auth = getAuth()
  onAuthStateChanged(auth, (user) => {
    if (user) {
      fetchCategories()
      fetchProducts()
    } else {
      // Redirect to login page if not authenticated
      router.push('/cashier-login')
    }
  })
})
</script>

<style scoped>
.cashier-interface {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f8f9fa;
}

header {
  background: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

h1 {
  font-family: "Playfair Display", serif;
  color: #333;
  margin: 0;
}

.btn-logout {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 25px;
  background: #ff1493;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-logout:hover {
  background: #ff69b4;
}

.logout-icon {
  width: 16px;
  height: 16px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' /%3E%3C/svg%3E") no-repeat center;
}

main {
  display: flex;
  flex: 1;
  gap: 2rem;
  padding: 2rem;
  overflow: hidden;
}

.product-selection {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  overflow: hidden;
}

.category-buttons {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.category-btn {
  padding: 0.75rem 1.5rem;
  border: 2px solid #e9ecef;
  border-radius: 25px;
  background: white;
  color: #495057;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.category-btn:hover {
  border-color: #ff1493;
  color: #ff1493;
}

.category-btn.active {
  background: #ff1493;
  border-color: #ff1493;
  color: white;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.product-card {
  background: white;
  border: none;
  border-radius: 10px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.product-card h3 {
  margin: 0 0 0.5rem;
  color: #333;
  font-size: 1.1rem;
}

.price {
  margin: 0;
  color: #ff1493;
  font-weight: 600;
  font-size: 1.2rem;
}

.order-panel {
  width: 400px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
}

.order-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.order-header h2 {
  margin: 0;
  font-family: "Playfair Display", serif;
  color: #333;
}

.order-items {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.order-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 10px;
  background: #f8f9fa;
  margin-bottom: 1rem;
}

.item-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-details h4 {
  margin: 0;
  color: #333;
}

.item-details p {
  margin: 0;
  color: #ff1493;
  font-weight: 600;
}

.item-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quantity-btn {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 50%;
  background: white;
  color: #ff1493;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quantity-btn:hover {
  background: #ff1493;
  color: white;
}

.quantity {
  min-width: 30px;
  text-align: center;
  font-weight: 600;
}

.delete-btn {
  margin-left: auto;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 50%;
  background: #fff1f3;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-btn:hover {
  background: #ffe0e7;
}

.trash-icon {
  width: 16px;
  height: 16px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23ff1493'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' /%3E%3C/svg%3E") no-repeat center;
}

.order-footer {
  padding: 1.5rem;
  border-top: 1px solid #e9ecef;
}

.total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.total h3 {
  margin: 0;
  color: #333;
  font-size: 1.2rem;
}

.order-actions {
  display: flex;
  gap: 1rem;
}

.action-btn {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-btn {
  background: #fff1f3;
  color: #ff1493;
}

.clear-btn:hover {
  background: #ffe0e7;
}

.pay-btn {
  background: #ff1493;
  color: white;
}

.pay-btn:hover {
  background: #ff69b4;
}

.print-btn {
  background: #4CAF50;
  color: white;
}

.print-btn:hover {
  background: #45a049;
}

/* Scrollbar Styles */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #ff69b4;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #ff1493;
}

@media (max-width: 1024px) {
  main {
    flex-direction: column;
  }

  .order-panel {
    width: 100%;
    margin-top: 2rem;
  }
}

@media (max-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

  .category-buttons {
    flex-wrap: wrap;
    justify-content: center;
  }

  .category-btn {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .btn-logout {
    align-self: flex-end;
  }

  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }

  .product-card {
    padding: 1rem;
  }

  .product-card h3 {
    font-size: 1rem;
  }

  .price {
    font-size: 1rem;
  }

  .order-item {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .item-controls {
    flex-direction: column;
  }

  .quantity-btn {
    width: 24px;
    height: 24px;
    font-size: 1rem;
  }

  .delete-btn {
    width: 24px;
    height: 24px;
  }

  .trash-icon {
    width: 14px;
    height: 14px;
  }
}

@media print {
  .cashier-interface {
    display: none;
  }
}
</style>

