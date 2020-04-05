<template>
  <form class="login__form">
    <div>
      <input type="text" id="username" placeholder="User Name" />
    </div>
    <div>
      <input type="text" id="token" placeholder="Token" />
    </div>
    <div>
      <button>Login</button>
    </div>
  </form>
</template>
<style scoped>
.login__form {
  width: 600px;
  height: 300px;
  /* display: grid;
  grid-template-columns: repeat(3, 33.33%);
  grid-template-rows: repeat(3, 33.33%); */
}
</style>
<script>
export default {};
</script>