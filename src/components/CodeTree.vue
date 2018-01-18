
<script>
import TreeView from '../mixins/TreeView.vue';
import Vue from 'vue';
import Rx from 'rxjs/Rx';
import VueRx from 'vue-rx';

Vue.use(VueRx,Rx);

const getTreeCode = new Promise((resolve,reject)=>{
    fetch('http://localhost:3000/code/codetower')
        .then(resp=>{
            return resp.json();
        })
        .then(data=>{
            //console.log('data', data);
            resolve(data);
        })
});

const empty = {
    name: "",
    items: []
}


            
export default {
    name: 'CodeTree',
    mixins: [TreeView],
    // components: {
    //     "CodeTreeItem": CodeTreeItem
    // },
    subscriptions: function(){
        return {
            treeData: Rx.Observable.fromPromise(getTreeCode).startWith(empty)
        }
    }, 
    data () {
        return {
            editable: false
        }
    },
    methods: {
        treeItemOnClick: function(node){
            console.log('node', node);
            if (node.type === 'file'){
                window.bus.$emit('source-file-selected', node.path);
            }
            
        }
    }
}
</script>
