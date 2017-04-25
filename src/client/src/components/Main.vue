

<template>
    <div id="main">
        <div class="left row-item">
            <SourceView></SourceView>
        </div>
        <div class="middle row-item">
            <CodeEditor></CodeEditor>
        </div>
        <div class="right row-item">

        </div>
    </div>

</template>

<script>
import SourceView from './SourceView.vue';
import CodeEditor from './CodeEditor.vue';
            
export default {
    name: 'Main',
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
#main{
    width: 100%;
    min-height: 800px;

    display: -webkit-flex;
    -webkit-flex-direction: row;

    display: flex;
    flex-direction: row;
}

.row-item{
    -webkit-flex: 1 1 auto;
    flex: 1 1 auto;
    width: 30px;
}

.left {
    background: #F8F8F8;
}

.middle{
    background: green;
}

.right{
    background: red;
}
</style>
