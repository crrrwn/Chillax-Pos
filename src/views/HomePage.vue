<template>
  <div class="home-page">
    <div class="content-wrapper">
      <!-- Logo -->
      <img 
        src="../assets/chillaxlogo.png" 
        alt="Chillax Cafetria Logo" 
        class="logo"
      />
      
      <!-- Main Heading -->
      <h1 class="main-title">CHILLAX CAFETRIA</h1>
      
      <!-- Subtitle -->
      <h2 class="subtitle">POINT OF SALES</h2>
      
      <!-- Login Buttons -->
      <div class="login-options">
        <router-link to="/admin-login" class="login-btn">
          Administrator
        </router-link>
        <router-link to="/cashier-login" class="login-btn">
          Cashier
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
// Component logic can be added here if needed
</script>

<style scoped>
body {
  font-size: 16px;
}

.home-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  padding: 2rem;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 90vw;
  width: 100%;
}

.logo {
  width: 200px;
  height: auto;
  margin-bottom: 2rem;
}

.main-title {
  font-family: "Playfair Display", serif;
  font-size: 4rem;
  font-weight: 700;
  margin: 0;
  text-align: center;
  line-height: 1.2;
}

.subtitle {
  font-family: sans-serif;
  font-size: 2rem;
  font-weight: 600;
  margin: 1rem 0 3rem;
  text-align: center;
}

.login-options {
  display: flex;
  gap: 2rem;
  margin-top: 1rem;
}

.login-btn {
  background-color: #FF1493;
  color: white;
  text-decoration: none;
  padding: 1rem 3rem;
  border-radius: 50px;
  font-size: 1.25rem;
  font-weight: 500;
  transition: all 0.3s ease;
  display: inline-block;
  text-align: center;
}

.login-btn:hover {
  background-color: #FF69B4;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 20, 147, 0.2);
}

@media (max-width: 1024px) {
  .main-title {
    font-size: 3rem;
  }
  
  .subtitle {
    font-size: 1.75rem;
  }
}

@media (max-width: 768px) {
  body {
    font-size: 14px;
  }

  .main-title {
    font-size: 2.5rem;
  }
  
  .subtitle {
    font-size: 1.5rem;
  }
  
  .login-options {
    flex-direction: column;
    width: 100%;
    max-width: 300px;
  }
  
  .login-btn {
    width: 100%;
    text-align: center;
    padding: 0.75rem 2rem;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .logo {
    width: 150px;
    margin-bottom: 1.5rem;
  }

  .main-title {
    font-size: 2rem;
  }
  
  .subtitle {
    font-size: 1.25rem;
    margin: 0.75rem 0 2rem;
  }

  .home-page {
    padding: 1rem;
  }

  .login-btn {
    padding: 0.75rem 2rem;
    font-size: 1rem;
  }
}
</style>

