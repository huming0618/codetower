import Vue from 'vue';
import Router from 'vue-router';
//import Hello from '@/components/Hello'
import SourceView from '@/components/SourceView';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'SourceView',
      component: SourceView
    }
  ]
})
