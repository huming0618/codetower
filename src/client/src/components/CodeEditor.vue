

<template>
    <div>
        <editor :model="content" @init="initEditor();" lang="html" theme="chrome" width="500" height="100"></editor>
    </div>
</template>

<script>

import editor from 'vue2-ace-editor';


export default {
    name: 'CodeEditor',
    
    components: {
        "editor": editor
    },

    props: {

    },
    data () {
        return {
            content: "<div></div>"
        }
    },
    methods: {
        initEditor: function(){

        }
    }
}
</script>

<style scoped>


</style>
