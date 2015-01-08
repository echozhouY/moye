/**
 * @file 全屏幕遮罩层
 * @author Leon(lupengyu@baidu)
 */

define(function (require) {

    var $       = require('jquery');
    var Control = require('./Control');
    var lib     = require('./lib');

    /**
     * 当前已经生成的Mask个数
     *
     * @type {number}
     */
    var currentMaskCount = 0;

    /**
     * 遮罩层管理类，提供遮罩层的操作函数
     * @module Mask
     */
    var Mask = Control.extend({


        type: 'mask',

        options: {
            level: 1
        },

        init: function (options) {
            this.$parent(options);
            currentMaskCount++;

            if (lib.browser.ie < 7) {
                this._onWindowResize = lib.delay($.proxy(this._onWindowResize, this), 300);
            }
        },

        initStructure: function () {
            $(this.main).appendTo(document.body);
        },

        initEvents: function () {
            this.delegate(this.main, 'click', this._onClick);
        },

        _onClick: function (e) {
            this.fire(e);
        },

        /**
         * 重新绘制遮盖层的位置
         */
        repaint: require('./painter').createRepaint(
            Control.prototype.repaint,
            {
                name: ['visible'],
                paint: function (conf, visible) {
                    if (visible) {
                        this.addState('visible');
                        if (lib.browser.ie < 7) {
                            this._position();
                            this.delegate(window, 'resize', this._onWindowResize);
                        }
                    }
                    else {
                        this.removeState('visible');
                        if (lib.browser.ie < 7) {
                            this.undelegate(window, 'resize', this._onWindowResize);
                        }
                    }
                }
            }
        ),

        /**
         * 定位
         * @protected
         */
        _position: function () {
            var win = $(window);
            lib.fixed(this.main, {
                width: win.width(),
                height: win.height(),
                left: 0,
                top: 0
            });
        },

        /**
         * window的`resize`事件处理函数
         */
        _onWindowResize: function () {
            this._position();
        },

        /**
         * 显示一个遮罩层
         *
         * @public
         */
        show: function () {
            this.set('visible', true);
        },

        /**
         * 隐藏一个遮罩层
         *
         * @public
         */
        hide: function () {
            this.set('visible', false);
        },

        /**
         * 注销一个遮罩层
         *
         * @public
         */
        dispose: function () {
            this.$parent();
            $(this.main).remove();
            currentMaskCount--;
        }

    });


    /**
     * 创建一个遮罩层
     *
     * @param {Object} options 遮罩选项
     * @return {HTMLElement} 遮罩元素
     */
    Mask.create = function (options) {
        return new Mask(options);
    };

    return Mask;
});
