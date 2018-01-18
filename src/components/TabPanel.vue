<template>
    <ul>
        <li></li>
        <li></li>
        <li></li>
    </ul>
    <div>
        
    </div>
</template>

<script>
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
</style>