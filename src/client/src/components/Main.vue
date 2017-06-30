

<template>
    <div id="main">
        <div class="left col-item">
            <md-tabs>
                <md-tab id="source-tab" md-label="Source">
                    <SourceView></SourceView>
                </md-tab>
                <md-tab id="note-tab" md-label="Note">
                   <NoteView></NoteView>
                </md-tab>
            </md-tabs>
        </div>
        <div class="middle col-item">
            <md-toolbar  class="md-dense">
                <md-button class="md-icon-button">
                    <md-icon>menu</md-icon>
                </md-button>
                <h2 class="md-title" style="flex: 1">Code</h2>
                <md-button class="md-icon-button">
                    
                </md-button>
            </md-toolbar>
            <CodeEditor :value="editorCode"></CodeEditor>
        </div>
        <div class="right col-item">
            <md-toolbar  class="md-dense">
                <md-button class="md-icon-button">
     
                </md-button>

                <md-button class="md-icon-button">
             
                </md-button>
            </md-toolbar>
        </div>
    </div>

</template>

<script>
import SourceView from './SourceView.vue';
import NoteView from './NoteView.vue';
import CodeEditor from './CodeEditor.vue';
            
export default {
    name: 'Main',

    components: {
        "SourceView": SourceView,
        "CodeEditor": CodeEditor,
        "NoteView": NoteView
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

        window.bus.$on('source-file-selected', function(path){
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

.col-item{
    -webkit-flex: 1 1 auto;
    flex: 1 1 auto;
    width: 30px;
}

.left {
    background: #F8F8F8;

}

.middle{
    background: gray;
    flex-grow: 2;
}

.right{
    background: #fff;
}
</style>
