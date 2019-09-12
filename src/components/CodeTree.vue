
<script>
import TreeView from '../mixins/TreeView.vue';
import Vue from 'vue';
import Rx from 'rxjs/Rx';
import VueRx from 'vue-rx';
import axios from 'axios'

Vue.use(VueRx,Rx);

// const getTreeCode = new Promise((resolve,reject)=>{
//     fetch('http://localhost:3000/code/codetower')
//         .then(resp=>{
//             return resp.json();
//         })
//         .then(data=>{
//             //console.log('data', data);
//             resolve(data);
//         })
// });

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



        const getTreeCode = async ()=>{
            const auth = {
                username:'huqiming',
                password:'8a795508ef9a8b190db4314d8e3a4bd821dd8f95'
            }

            let resp = await axios.get('https://oss.navercorp.com/api/v3/repos/GWorks-Service/webtalk/commits', { auth })
            const commits = resp.data


            //?recursive=1
            resp = await axios.get(`https://oss.navercorp.com/api/v3/repos/GWorks-Service/webtalk/git/trees/${commits[0].sha}`, { auth })
            const tree = resp.data.tree
            console.log('tree', tree)
            const result = {
                    name: "",
                    items:  tree.map(x=>{return {name:x.path, type:x.type}}).sort((a,b)=>a.type > b.type)
            }
            console.log('result', result)
            return result
        }

        return {
            treeData: Rx.Observable.fromPromise(getTreeCode()).startWith(empty)
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
