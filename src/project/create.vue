<template>
  <div id="project_create">
    <div class="header">
      <h1>Choose the repository</h1>
    </div>
    <div class="form__wrapper">
      <form @submit="onSubmit">
        <input type="text" name="name" autofocus v-model="repo" />
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
  padding-left: 12px;
}

form input:focus {
  border: none;
  outline: 0;
}

form button {
  border: none;
  background: #46ca7f;
  color: #fff;
  width: 24%;
  cursor: pointer;
}
</style>
<script>
// import wallet from "@/common/wallet";

// import AppHeader from "@/home/components/AppHeader";
// import Dashboard from "@/home/components/Dashboard";
// import MySummary from "@/mytoken/components/Summary";

import URLService from "../service/URLService";

export default {
  // components: {
  //   AppHeader,
  //   MySummary,
  //   Dashboard
  // },

  data() {
    return {
      repo: ""
    };
  },

  methods: {
    onSubmit: function(e) {
      e.preventDefault();
      // const link = document.createElement("a");
      // link.href = this.repo;
      const repoInfo = URLService.getRepoInfo(this.repo);

      if (repoInfo.host === "github.com") {
        const repoName = repoInfo.repo;
        const clientId = "95512368c4d39bb1a507";
        const redirectUrl = `http://localhost:8000/project/view/${repoInfo.host}/${repoInfo.owner}/${repoInfo.repo}`;
        const authScope = encodeURIComponent(
          "user public_repo repo repo_deployment repo:status read:repo_hook read:org read:public_key read:gpg_key"
        );
        window.location = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUrl}&scope=${authScope}`;
      }
      return false;
    }
  },

  mounted() {
    // wallet.init().then(result => {
    //   console.log("my.wallet", wallet);
    // });
  }
};
</script>
