/**
 * @file 表单控件
 * @author Leon(lupengyu@baidu)
 */
define(function (require) {

    var $       = require('jquery');
    var lib     = require('./lib');
    var Panel   = require('./Panel');
    var main    = require('./main');

    var Form = Panel.extend({

        type: 'Form',

        options: {
            action: '',
            method: 'GET',
            target: '_self'
        },

        /**
         * 创建主元素
         * @return {Element}
         */
        createMain: function () {
            return document.createElement('form');
        },

        init: function (options) {
            this.$parent(options);
            this.action = this.action || this.main.action;
        },

        initStructure: function () {
            var options = this.options;
            var main = this.main;
            if (main.tagName === 'FORM') {
                main.action = this.action || main.action;
                main.method = this.method || main.method;
                main.target = this.target || main.target;
            }
        },

        initEvents: function () {
            var options = this.options;
            if (this.main.tagName === 'FORM') {
                this.delegate(this.main, 'submit', this.submit);
            }
        },

        repaint: require('./painter').createRepaint(
            Panel.prototype.repaint,
            {
                name: 'action',
                paint: function (conf, action) {
                    this.main.action = action;
                }
            }
        ),

        /**
         * 提交表单
         * @return {Form}
         */
        submit: function (e) {

            var event = new $.Event('submit');

            this.fire(event);

            if (event.isDefaultPrevented()) {
                e && e.preventDefault();
                return false;
            }

            if (this.main.tagName === 'FORM') {
                this.main.submit();
            }

            return this;
        },

        /**
         * 获取表单中的InputControl的数据
         * @return {Object}
         */
        getData: function () {
            var controls = this.getInputControls();
            var data = {};

            lib.each(controls, function (control) {

                // 被禁用的控件不能作为表单数据, 跳过之
                if (control.isDisabled()) {
                    return;
                }

                var name = control.name;
                var value = control.getValue();
                // 这里处理多个InputControl共用一个name的情况
                // 按原生Form的处理规则, 将它们合并为一个数组
                if (data.hasOwnProperty(name)) {
                    data[name] = [].concat(data[name], value);
                }
                else {
                    data[name] = value;
                }
            });

            return data;
        },

        /**
         * 获取表单中的InputControl控件
         * @return {Array.Control}
         */
        getInputControls: function () {

            var me = this;
            var controls = [];

            // 深度优先遍历DOM树
            // 从根结点->叶子结点搜索控件
            // 遇到任意一个InputControl停止搜索
            function walk(root) {
                $(root).children().each(function (index, child) {
                    var control = main.getControlByDOM(child);
                    if (
                        // 是一个控件
                        control
                        // 必须有属性name
                        && control.name
                        // 是一个输入控件
                        && lib.isFunction(control.getValue)
                        // 与form在同一上下文中
                        && control.context === me.context
                    ) {
                        controls.push(control);
                    }
                    else {
                        walk(child);
                    }
                });
            }
            walk(me.main);
            return controls;
        }

    });

    return Form;
});
