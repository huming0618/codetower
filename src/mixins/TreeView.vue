

<template>
    <ul id="demo">
        <TreeViewItem
            class="item"
            :treeItemOnClick="treeItemOnClick"
            :editable="editable"
            :model="treeData">
        </TreeViewItem>
    </ul>
</template>

<script>
import TreeViewItem from './TreeViewItem.vue';
import Vue from 'vue';

            
export default {
    components: {
        "TreeViewItem": TreeViewItem
    },
    data () {
        return {
            treeData: {
                name: "",
                items: []
            },
            editable: true
        }
    },
    props: {
        model: Object,
        editable: Boolean
    },
    methods: {
        treeItemOnClick: function(data){
            console.log('treeItemOnClick', 'data', data);
        }
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
  text-align: left;
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
