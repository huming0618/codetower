

<template>
    <div :style="{height: height ,width: width}">
    </div>
</template>

<script>

// import editor from 'vue2-ace-editor';

import ace from 'brace';

export default {
    name: 'CodeEditor',

    props: {
        value:{
            type: String,
            required: true,
            default: ''
        },
        height: {
            default: '100%'
        },
        width: {
            default: '100%'
        }
    },

    data () {
        return {
            content: "<div></div>",
            editor: null
        }
    },

    methods: {

    },

    watch:{
        value:function (val) {
            if(this.contentBackup !== val)
                this.editor.setValue(val,1);
        }
    },

    mounted: function(){
        const vm = this;

        const lang = 'javascript';
        const theme = 'chrome';

        const editor = ace.edit(vm.$el);
        vm.editor = editor;
        
        editor.$blockScrolling = Infinity;
        //editor.setOption("enableEmmet", true);
        editor.getSession().setMode('ace/mode/'+lang);
        editor.setTheme('ace/theme/'+theme);
        editor.setValue(vm.value, 1);

        console.log('ace', ace, editor);
        
        editor.on('change',function () {
            const content = editor.getValue();
            vm.$emit('input', content);
            vm.contentBackup = content;
        });

    }
}
</script>

<style scoped>


</style>
