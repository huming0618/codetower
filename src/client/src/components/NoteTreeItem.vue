<template>
  <li>
    <div
      :class="{bold: isFolder}"
      @click="toggle">
      {{model.name}}
      <span v-if="isFolder">[{{open ? '-' : '+'}}]</span>
    </div>
    <ul v-show="open" v-if="isFolder">
      <CodeTreeItem
        class="item"
        v-for="model in model.items"
        :model="model">
      </CodeTreeItem>
    </ul>
  </li>
</template>

<script>
export default {
    name: 'CodeTreeItem',
    data () {
        return {
            open: false
        }
    },
    computed: {
        isFolder: function () {
            return this.model.items && this.model.items.length
        }
    },
    props: {
        model: Object
    },
    methods: {
        toggle: function () {
            if (this.isFolder) {
                this.open = !this.open
            }
            else {
                console.log(this.model.path);
                window.bus.$emit('source-path-selected', this.model.path);
            }
        }
        // ,changeType: function () {
        //     if (!this.isFolder) {
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
