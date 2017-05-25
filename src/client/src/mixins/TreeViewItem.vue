<template>
  <li>
    <div
      :class="{bold: expandable}"
      @click="toggle">
      {{model.name}}
      <span v-if="expandable">[{{open ? '-' : '+'}}]</span>
    </div>
    <ul v-show="open" v-if="expandable">
      <TreeViewItem
        class="item"
        v-for="modelItem in model.items"
        :model="modelItem"
        :treeItemOnClick="treeItemOnClick">
      </TreeViewItem>
    </ul>
  </li>
</template>

<script>
export default {
    name: 'TreeViewItem',
    data () {
        return {
            open: false
        }
    },
    computed: {
        expandable: function () {
            return this.model.items && this.model.items.length
        }
    },
    props: {
        model: Object,
        treeItemOnClick: Function
    },
    methods: {
        toggle: function () {
            if (this.expandable) {
                this.open = !this.open
            }
            else {
                //console.log(this.model.path);
                //window.bus.$emit('source-path-selected', this.model.path);
            }
            this.treeItemOnClick(this.model);
        }
        // ,changeType: function () {
        //     if (!this.expandable) {
        //         Vue.set(this.model, 'children', [])
        //         this.addChild()
        //         this.open = true
        //     }
        // }
        // ,addChild: function () {
        //     this.model.children.push({
        //         name: 'new stuff'
        //     })
        // }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
body {
  font-family: Menlo, Consolas, monospace;
  color: #444;
}
.bold {
  font-weight: bold;
  text-align: left;
}
ul {
  padding-left: 1em;
  line-height: 1.5em;
  list-style-type: dot;
}
</style>
