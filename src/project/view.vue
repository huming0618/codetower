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
import URLService from "../service/URLService";
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
    // const repo = params.get("repo");
    const repoInfo = URLService.getRepoInfoFromPathName(
      window.location.pathname.replace(/^\/project\/view\//i, "")
    );

    console.log("view project", authCode, repoInfo);
    const service = await GitService.create({
      baseURL: `https://${repoInfo.host}`,
      clientId: "95512368c4d39bb1a507",
      clientSecret: "ba902651559c7d7532bab1a64ac707d7b210a4bd",
      authCode: authCode
    });

    const branchList = await service.getBranchList(
      repoInfo.owner,
      repoInfo.repo
    );
    console.log("branches", branchList);

    const commits = await service.getCommitList(repoInfo.owner, repoInfo.repo);
  }
};
</script>
