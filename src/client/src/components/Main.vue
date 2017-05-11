

<template>
    <div id="main">
        <div class="left row-item">
            <SourceView></SourceView>
        </div>
        <div class="middle row-item">
            <CodeEditor :value="editorCode"></CodeEditor>
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

    data () {
        return {
            editorCode: ''
        }
    },

    methods: {
        updateSourceCode: function(path){
            //this.editorCode = code;
            fetch('http://localhost:3000/code/codetower/' + path)
                .then(resp=>{
                    return resp.text();
                })
                .then(data=>{
                    //console.log('data', data);
                    this.editorCode = data;
                })
        }
    },

    mounted: function(){
        const vm = this;

        window.bus.$on('source-path-selected', function(path){
            // console.log('path-selected', path);
            //vm.sourceCode = "test";
            vm.updateSourceCode(path);
            //vm.$set(vm._data, 'value', '<div></div>')
            //         fetch('http://localhost:3000/code/codetower')
            // .then(resp=>{
            //     return resp.json();
            // })
            // .then(data=>{
            //     //console.log('data', data);
            //     resolve(data);
            // })
        });
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
    background: gray;
}

.right{
    background: #fff;
}
</style>
