

<template>
    <div class="left-nav">
        <CodeTree>
        </CodeTree>
    </div>
</template>

<script>
import CodeTree from './CodeTree.vue';
            
export default {
    name: 'SourceView',
    components: {
        "CodeTree": CodeTree
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
