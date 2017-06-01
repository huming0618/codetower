<template>
  <li>
    <div
      :class="{expandable: expandable}"
      @click="toggle">
      <span v-if="!editable">{{model.name}}</span>
      <input v-if="editable" type="input" length=20  :value="model.name"/>
      <span v-if="expandable">[{{open ? '-' : '+'}}]</span>
    </div>
    <ul v-show="open" v-if="expandable">
      <TreeViewItem
        class="item"
        v-for="modelItem in model.items"
        :model="modelItem"
        :editable="editable"
        :treeItemOnClick="treeItemOnClick">
      </TreeViewItem>
      <li v-if="editable" class="add" @click="addChild">+</li>
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
        editable: Boolean,
        treeItemOnClick: Function
    },
    methods: {
        toggle: function () {
            console.log('toggle');
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
        ,addChild: function () {
            this.model.items.push({
                name: ''
            })
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.expandable {
  color: #4682b4;
  font-weight: bold;
  text-align: left;
}
</style>
