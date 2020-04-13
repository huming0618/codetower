<template>
  <div id="project_view">
    <div class="header">
      <h1>View the repo</h1>
    </div>
  </div>
</template>
<style scoped>
#project_view {
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
</style>
<script>
import GitService from "../service/GitService";
// import wallet from "@/common/wallet";

// import AppHeader from "@/home/components/AppHeader";
// import Dashboard from "@/home/components/Dashboard";
// import MySummary from "@/mytoken/components/Summary";

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

  methods: {},

  async mounted() {
    const params = new URLSearchParams(window.location.search);
    const authCode = params.get("code");
    const repo = params.get("repo");

    const link = document.createElement("a");
    link.href = repo;

    console.log("link", link, link.host, link.pathname);

    const host = link.host;

    console.log("view project", authCode, repo);
    const service = await GitService.create({
      baseURL: `https://${host}`,
      clientId: "95512368c4d39bb1a507",
      clientSecret: "ba902651559c7d7532bab1a64ac707d7b210a4bd",
      authCode: authCode
    });
  }
};
</script>
