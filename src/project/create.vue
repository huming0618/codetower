<template>
  <div id="project_create">
    <div class="header">
      <h1>Choose the repository</h1>
    </div>
    <div class="form__wrapper">
      <form>
        <input type="text" name="name" />
        <button type="submit">Create</button>
      </form>
    </div>
  </div>
</template>
<style scoped>
#project_create {
  background: #3e3b3b;
  width: 673px;
  margin-left: 0;
}

.header {
  color: #a09ca1;
  height: 48px;
  line-height: 48px;
  font-size: 21px;
  padding-left: 16px;
}

.form__wrapper {
  height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
}

form {
  width: 75%;
  height: 36px;
  display: flex;
}

form input {
  border: none;
  flex-grow: 1;
}

form button {
  border: none;
  background: #46ca7f;
  color: #fff;
  width: 24%;
}
</style>
<script>
// import wallet from "@/common/wallet";

// import AppHeader from "@/home/components/AppHeader";
// import Dashboard from "@/home/components/Dashboard";
// import MySummary from "@/mytoken/components/Summary";

// export default {
//   components: {
//     AppHeader,
//     MySummary,
//     Dashboard
//   },
//   methods: {
//     createNewTask: function(item) {
//       console.log("test", this.$router);
//       this.$router.push({ name: "NewTask" });
//     }
//   },

//   mounted() {
//     // wallet.init().then(result => {
//     //   console.log("my.wallet", wallet);
//     // });
//   }
// };
</script>
