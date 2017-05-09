

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
            content: "<div></div>"
        }
    },

    methods: {

    },

    mounted: function(){
        const vm = this;

        const lang = 'javascript';
        const theme = 'chrome';

        const editor = ace.edit(vm.$el);
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
