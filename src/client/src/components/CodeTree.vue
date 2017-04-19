

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

export default {
    name: 'CodeTree',
    components: {
        "CodeTreeItem": CodeTreeItem
    },
    subscriptions: function(){
        return {
            treeData: Rx.Observable.create()
        }
    }, 
    data () {
        return {
            treeData: {
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
            }
        }
    },
    computed: {
        isFolder: function () {
            return this.model.children && this.model.children.length
        }
    },
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
