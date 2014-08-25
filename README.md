#mod-jst

把underscore模版编译为jst的modjs任务插件，<strong style="color:#FF0000;">并支持模版嵌套</strong>

##安装配置说明
###安装:
    npm install mod-jst -g

###Mod配置（Modfile.js）

    module.exports = {
        plugins: {
            "jst": "mod-jst"
        },
        tasks: {
            "jst": {
                namespace: 'JST',
                src: 'template/*.html',
                dist: 'js/template.js',
                charset: 'utf-8',
                templateName: function (fileName) {
                    if (!fileName) {
                        return '';
                    }
                    return fileName[0] === '_' ? '' : fileName;
                },
                templateSettings: {
                    evaluate: /<%([\s\S]+?)%>/g,
                    interpolate: /<%=([\s\S]+?)%>/g,
                    escape: /<%-([\s\S]+?)%>/g,
                    partial: /<%@([\s\S]+?)%>/g
                },
                moduleDefinition: 'amd',
                underscore: 'underscore'
            }
        }
    };
    
###选项说明

####namespace
类型: String <br />
默认值: 'JST' <br />
说明: 所有template方法的namespace，在moduleDefinition不为'amd'或者'cmd'时有效

####charset
类型: String <br />
默认值: 'utf-8' <br />
说明: 所有template文件的字符集编码


####templateName
类型: Function <br />
默认值: 

    function (fileName) {
        if (!fileName) {
            return '';
        }
        return fileName[0] === '_' ? '' : fileName;
    } 
    
说明: 由template文件的名称转换为template方法名的转换方法，如果返回空字符串则该template不生成（例如内嵌的模版），默认方法中文件名称以'_'开头的不生成，其他直接用文件名作为方法名

####templateSettings
类型: Object <br />
默认值: 

    {
        evaluate: /<%([\s\S]+?)%>/g,
        interpolate: /<%=([\s\S]+?)%>/g,
        escape: /<%-([\s\S]+?)%>/g,
        partial: /<%@([\s\S]+?)%>/g
    }

说明: 所有template文件匹配串正则，前3项参考underscore的template方法，最后一项为嵌套模版语法<%@test.html%>

####moduleDefinition
类型: String <br />
默认值: '' <br />
说明: 模块化包装器类型 （amd/cmd），如果非'amd'或者'cmd'，则使用namespace作为对象名，直接生成模版方法

####underscore
类型: String <br />
默认值: 'underscore' <br />
说明: cmd中的underscore模版require标示，比如设置为'./underscore'，生成代码： 

    var _ = require('./underscore');