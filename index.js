/**
 * Created by yexiaoyi on 14-8-20.
 */
'use strict';
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var chalk = require('chalk');

exports.summary = 'Compile underscore templates to JST file';

exports.usage = '<src> [options]';

exports.options = {
    'src': {
        alias: 's',
        default: 'template/*.html',
        describe: 'template folder path(模版文件所在目录)'
    },
    templateName: {
        alias: 't',
        default: function (fileName) {
            if (!fileName) {
                return '';
            }
            return fileName[0] === '_' ? '' : fileName;
        },
        describe: 'function for parse the file name to template function name(把文件名转换成调用模版的方法名)'
    },
    'dest': {
        alias: 'd',
        default: 'js/template.js',
        describe: 'target pack file path(生成jst文件路径)'
    },
    charset: {
        alias: 'c',
        default: 'UTF-8',
        describe: 'charset of template'
    },
    templateSettings: {
        alias: 'c',
        default: {
            evaluate: /<%([\s\S]+?)%>/g,
            interpolate: /<%=([\s\S]+?)%>/g,
            escape: /<%-([\s\S]+?)%>/g,
            partial: /<%@([\s\S]+?)%>/g
        },
        describe: 'charset of template'
    }
};

exports.run = function (options) {
    var file = exports.file;
    var charset = options.charset;
    var outputFile = options.dest;
    var outputSource = '';
    exports.files.forEach(function (inputFile) {
        var extName = path.extname(inputFile);
        var fileName = path.basename(inputFile, extName);
        var templateName = options.templateName(fileName);
        var fileContent;

        if (templateName) {
            fileContent = file.read(inputFile, charset);

            fileContent = exports.partialTemplate(inputFile, fileContent, charset, options);

            fileContent = exports.generate(templateName, fileContent);

            outputSource = outputSource ? (outputSource + ',') : '';
            outputSource += '\n' + fileContent;

            exports.log('template ' + chalk.cyan(inputFile) + ' is compiled.');
        }
    });
    outputSource = 'var JST = {\n' + outputSource + '\n}';
    file.write(outputFile, outputSource, charset);
};

exports.partialTemplate = function (fileName, fileContent, charset, options) {
    var file = exports.file;
    var refered = [fileName];
    var referedTemp = [];
    try {
        while (options.templateSettings.partial.test(fileContent)) {
            fileContent = fileContent.replace(options.templateSettings.partial, function (replaceStatement, name) {
                var partialName = _.find(exports.files, function (file) {
                    return path.basename(file).toLowerCase() === name.toLowerCase();
                });
                if (!partialName) {
                    exports.warn('partial template ' + chalk.cyan(name) + ' is not exists.');
                }
                if (_.contains(refered, partialName)) {
                    throw 'An infinite loop may occur in importing partial template';
                }
                referedTemp.push(partialName);
                return partialName ? file.read(partialName, charset) : '';
            });
            Array.prototype.push.apply(refered, referedTemp);
            referedTemp = [];
        }
        return fileContent;
    } catch (e) {
        exports.error(e);
        exports.warn('JST ' + chalk.cyan(templateName) + ' failed to compile.');
        throw e;
    }
};

exports.generate = function (templateName, fileContent) {
    var compiled;
    try {
        compiled = _.template(fileContent, false).source;
    } catch (e) {
        exports.error(e);
        exports.warn('JST ' + chalk.cyan(templateName) + ' failed to compile.');
        throw e;
    }
    return templateName + ':' + compiled;
};

