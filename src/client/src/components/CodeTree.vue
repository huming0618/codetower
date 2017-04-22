

<template>
    <ul id="demo">
        <CodeTreeItem
            class="item"
            :model="treeData">
        </CodeTreeItem>
    </ul>
</template>

<script>
import CodeTreeItem from './CodeTreeItem.vue';
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

// Rx.Observable.fromPromise(getTreeCode).subscribe(x=>{
//     console.log('from getTreeCode', x);
// })
// const getTreeCode = function(){
//     return fetch('http://localhost:3000/code/codetower')
//         // .then(response=>{
//         //     //console.log(response);
//         //     return response.json();
//         // });
// }

// getTreeCode().then(x=>console.log(x));

const empty = {
    name: "",
    items: []
}

const treeCode = {
                name: 'My Tree',
                children: [
                        { name: 'hello' },
                        { name: 'wat' },
                        {
                        name: 'child folder',
                        children: [
                            {
                            name: 'child folder',
                            children: [
                                { name: 'hello' },
                                { name: 'wat' }
                            ]
                            },
                            { name: 'hello' },
                            { name: 'wat' },
                            {
                            name: 'child folder',
                            children: [
                                { name: 'hello' },
                                { name: 'wat' }
                            ]
                            }
                        ]
                        }
                    ]
            };
            
export default {
    name: 'CodeTree',
    components: {
        "CodeTreeItem": CodeTreeItem
    },
    subscriptions: function(){
        return {
            treeData: Rx.Observable.fromPromise(getTreeCode).startWith(empty)
        }
    }, 
    // data () {
    //     return {
    //         treeData: {
    //             items: [],
    //             "name": ""
    //         }
    //     }
    // },
    props: {
        model: Object
    },
    methods: {

    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
body {
  font-family: Menlo, Consolas, monospace;
  color: #444;
}
.item {
  cursor: pointer;
}
.bold {
  font-weight: bold;
}
ul {
  padding-left: 1em;
  line-height: 1.5em;
  list-style-type: dot;
}
</style>
