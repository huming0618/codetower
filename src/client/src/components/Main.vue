

<template>
    <div id="main">
        <SourceView></SourceView>
        <CodeEditor></CodeEditor>
    </div>

</template>

<script>
import SourceView from './SourceView.vue';
import CodeEditor from './CodeEditor.vue';
            
export default {
    name: 'SourceView',
    components: {
        "SourceView": SourceView,
        "CodeEditor": CodeEditor
    },
    props: {
    },
    methods: {

    }
}
</script>

<style scoped>
body{

}
.left-nav{
    position: absolute;
    height: 100%;
    top: 0;
    left: 0;
    width: 300px;
    overflow: auto;
    background-color: #F6F6F6;
}
</style>
