<template>
  <div class="login-overlay">
    <div class="login-modal">
      <!-- Logo -->
      <img 
        src="../assets/chillaxlogo.png" 
        alt="Chillax Cafetria Logo" 
        class="modal-logo"
      />
      
      <!-- Close button -->
      <button class="close-btn" @click="handleClose">×</button>
      
      <!-- Login Form -->
      <h2 class="modal-title">Cashier Login</h2>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <div class="input-wrapper">
            <i class="user-icon"></i>
            <input 
              type="text" 
              id="username" 
              v-model="username" 
              placeholder="username"
              required
            >
          </div>
        </div>
        <div class="form-group">
          <div class="input-wrapper">
            <i class="lock-icon"></i>
            <input 
              type="password" 
              id="password" 
              v-model="password" 
              placeholder="password"
              required
            >
          </div>
        </div>
        <button type="submit" class="login-btn">
          login
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'

const username = ref('cashier@gmail.com')
const password = ref('cashier123')
const router = useRouter()

const handleLogin = async () => {
  try {
    const auth = getAuth()
    await signInWithEmailAndPassword(auth, username.value, password.value)
    router.push('/cashier')
  } catch (error) {
    console.error('Login failed:', error)
    alert('Login failed. Please check your credentials.')
  }
}

const handleClose = () => {
  router.push('/')
}
</script>

<style scoped>
.login-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.login-modal {
  background: white;
  padding: 2rem 2rem 2.5rem;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  width: 85%;
  max-width: 380px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.modal-logo {
  width: 80px;
  height: auto;
  margin-bottom: 1rem;
  opacity: 0.95;
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
}

.close-btn:hover {
  color: #FF1493;
}

.modal-title {
  font-family: "Playfair Display", serif;
  text-align: center;
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #333;
  font-weight: 600;
  letter-spacing: -0.5px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 280px;
}

.form-group {
  width: 100%;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper i {
  position: absolute;
  left: 1.2rem;
  width: 16px;
  height: 16px;
  opacity: 0.5;
}

.user-icon {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' /%3E%3C/svg%3E") no-repeat center;
}

.lock-icon {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' /%3E%3C/svg%3E") no-repeat center;
}

.form-group input {
  width: 100%;
  padding: 0.9rem 1.2rem 0.9rem 3rem;
  border: 1.5px solid #f0f0f0;
  border-radius: 50px;
  font-size: 1rem;
  outline: none;
  transition: all 0.2s ease;
  background: #fafafa;
}

.form-group input:focus {
  border-color: #FF1493;
  background: white;
  box-shadow: 0 2px 8px rgba(255, 20, 147, 0.08);
}

.form-group input:focus + i {
  opacity: 1;
}

.form-group input::placeholder {
  color: #aaa;
  text-align: left;
  font-size: 1rem;
  letter-spacing: 0.3px;
}

.login-btn {
  background: #FF1493;
  color: white;
  border: none;
  padding: 0.9rem;
  border-radius: 50px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 0.5rem;
  text-transform: lowercase;
  letter-spacing: 0.5px;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(255, 20, 147, 0.15);
  width: 100%;
}

.login-btn:hover {
  background: #FF69B4;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 20, 147, 0.2);
}

.login-btn:active {
  transform: translateY(0);
}

@media (max-width: 480px) {
  .login-modal {
    padding: 1.5rem 1.5rem 2rem;
    width: 90%;
  }
  
  .modal-title {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
  }
  
  .modal-logo {
    width: 70px;
  }
  
  .form-group input {
    padding: 0.8rem 1rem 0.8rem 2.8rem;
    font-size: 0.95rem;
  }
  
  .login-btn {
    padding: 0.8rem;
    font-size: 1rem;
  }
}
</style>

