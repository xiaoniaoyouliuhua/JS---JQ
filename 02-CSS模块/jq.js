/**
 *
 * Created by ChengXiancheng on 2017/3/15.
 */

(function(window){
    var arr=[];
    var push=arr.push;
    var splice=arr.splice;
    var slice=arr.slice;

    var toString = Object.prototype.toString;

    var class2type = {};
    var types = "Number String Boolean Object Array Math Date RegExp Function".split(" ");
    for (var i = 0; i < types.length; i++) {
        var type = types[i];//"Number"

        //class2type["[object Number]"]="number"
        class2type["[object " + type + "]"] = type.toLowerCase();
    }


    function isLikeArray(array) {
        var len = array.length;//数组、伪数组的长度
        return typeof len === "number"
            && len >= 0
            && len - 1 in array;
    }

    //1、选择器函数
    var Sizzle=function(selector){
        return document.querySelectorAll(selector);
    };
    //2、入口函数
    var jQuery=function(selector){
        //返回一个F的实例
        return new jQuery.fn.F(selector);
    };
    jQuery.fn=jQuery.prototype={
        constructor:jQuery,
        F:function(selector){

            //1、清空之前的DOM元素
            splice.call(this,0,this.length);

            //selector有2种情况，分别表示一个DOM元素，或者是一个选择器，对于不同的功能需要进行分支判断
            ///     DOM元素是对象类型，选择器一定是字符串类型，所以可以根据参数类型判断功能

            if(jQuery.isString(selector)){//这里可以正常访问$.isString，以为F方法是在用户通过入口函数来进行访问，在访问入口函数的时候，框架中的代码已经加载完毕，$.isString方法已经存在


                //2、通过选择器函数获取元素
                var elements=Sizzle(selector);
                //3、借用push方法将elements中的每一个DOM元素遍历添加到this中
                push.apply(this,elements);

            }else{
                //暂且认为selector是一个DOM元素--->{ 0:selector,length:1 }

                this[0]=selector;
                this.length=1;
            }

            //4、返回this
            return this;


        }
    };

    //设置F的原型指向jquery的原型
    jQuery.fn.F.prototype=jQuery.fn;

    //extend方法
    jQuery.fn.extend=jQuery.extend=function(){
        var target,sources,
            arg0=arguments[0];

        if(arguments.length==0) return this;
        if(arguments.length==1){
            target=this;
            sources=[arg0];
        }else{
            target=arg0;
            sources=slice.call(arguments,1);
        }

        for (var i = 0; i < sources.length; i++) {
            var source = sources[i];
            for (var key in source) {
                target[key]=source[key];
            }
        }
        return target;
    };


    jQuery.extend({
        /**
         * 1、遍历数组、伪数组  2、遍历普通的对象
         * @param array
         * @param callback
         */
        each: function (array, callback) {
            var i, len;
            if (isLikeArray(array)) {
                for (i = 0, len = array.length; i < len; i++) {
                    if (callback.call(array[i], i, array[i]) === false)
                        break;

                }
            } else {
                for (i in array) {
                    if (callback.call(array[i], i, array[i]) === false)
                        break;
                }
            }
        },
        type: function (data) {
            if (data == null) {
                return String(data);
            }

            var result = toString.call(data);//"[object Xxxx]"

            //发现result正好就在class2type中有该属性的名称
            return class2type[result];       //return "xxxx";

        },
        isString: function (str) {
            return typeof str === "string";
        },
        isFunction: function (fn) {
            return typeof fn === "function";
        },
        isArray: Array.isArray || function (array) {
            return jQuery.type(array) === "array";
        },
//        isArray2: function (array) {
//            return Array.isArray?
//                    Array.isArray(array) :
//                    jQuery.type(array) === "array";
//        }

        //将source中的元素遍历添加到target中
        merge:function(target,source){
            //target:{0:10,length:1}
            //source:{0:"a",1:"b",length:2}

            //保存了原始目标对象的长度
            var len=target.length;      //len:1
            for (var i = 0; i < source.length; i++) {
                var v = source[i];

                //在追加的时候：设置以target的长度为索引的元素的值，这一行代码对于数组来说长度自增，对于伪数组来说长度不会发生任何变化
                target[len+i]=v;
            }
            //第一次遍历：i=0 len=1 target[1]="a"
            //第二次遍历：i=1 len=1 target[2]="b"


            //这一行代码执行之前，target.length对于数组来说是：3，对于伪数组来说：1
            target.length=source.length+len;//target.length=2+1=3

            return target;

        },

        makeArray:function(data){
            if(isLikeArray(data)){
                return jQuery.merge([],data);
            }

            return [data];
        },
        trim:function(str){
            return str.replace(/^\s+|\s+$/g,"");
        }
    });

    jQuery.fn.extend({
        //遍历F的实例(JQuery对象)中每一个DOM元素的遍历
        each: function (callback) {
            jQuery.each(this, callback);

            return this;
        }
    });

    //CSS模块
    jQuery.fn.extend({
        css:function(){
            //参数为1：获取指定样式；设置多个样式
            //    根据参数类型再来条件判断
            //参数>1(只处理2个参数)：设置单个样式

            var len=arguments.length;
            var arg0=arguments[0];
            var arg1=arguments[1];

            if(len===0) return this;

            if(len==1){
                //参数为1：获取指定样式；设置多个样式
                //    根据参数类型再来条件判断


                if(jQuery.isString(arg0)){
                    //arg0是一个样式名称-->$("div").css("fontSize")
                    //功能：只能获取该F实例中第一个DOM元素的指定样式

                    //this[0]:获取this的0属性，this是F的实例--->this的对象结构：{ 0:div,length:1 }
                    var firstDom=this[0];

                    //全部样式：
                    var styles=window.getComputedStyle(firstDom,null);

                    //返回指定样式：
                    return styles[arg0];


                }else{
                    //arg0是一个对象(对象中包含多个样式)-->$("div").css({ color:"red" })

                    //原生JS：dom.style[样式名称]=样式的值
                    //解决1；dom在this中，需要遍历this
                    //解决2：样式名称、样式的值在参数(arg0)中，需要通过for...in循环($.each)遍历出每一个属性，也就是每一个样式名称，从而进一步获取到样式的值
                    //解决上述2个问题之后，就可以完成设置样式的操作
                    //实现链式编程

                    return this.each(function(){
                        //this:DOM元素
                        var dom=this;

                        //arg0:{ color:"red" }

                        //优化后：
                        jQuery.extend(dom.style,arg0);

                        //优化前
                        //这一段代码的本质就是将arg0中的属性拷贝到dom.style对象中-->混入继承
//                        jQuery.each(arg0,function(styleName,styleValue){
//                            dom.style[styleName]=styleValue;
//                        });
                    });
                }


            }else{
                //参数>1(只处理2个参数)：设置单个样式  $("div").css("color","red")

                //遍历this从而获取到this中存放的每一个DOM元素

//                var obj=this.each(function(){
//                    //this:每一个DOM元素
//                    //arguments[0]：元素的索引
//                    //arguments[1]：元素的值：DOM元素
//
//
//                    //dom.style[样式名称]=样式的值
//                    this.style[arg0]=arg1;
//                    //变量搜索原则：arg0/arg1并不是当前作用域声明的，要确定arg0和arg1就要去当前作用域的上一级作用域(就看当前函数写在哪个函数体内部)，发现上一级作用域就是css方法，css方法中声明了arg0和arg1，分别表示样式的名称和样式的值
//                });
//                return obj;

                //简化后：
                return this.each(function(){
                    this.style[arg0]=arg1;
                })

            }

        },

        show:function(){
            //dom.style.display="block"

//            return this.each(function(){
//                //this:dom
//                this.style.display="block";
//            });

            return this.css("display","block");
        },
        hide:function(){
            return this.css("display","none");
        },

        //功能：判定每一个元素是否显示，如果显示就隐藏，反之就显示
        toggle:function(){
            //1、获取DOM元素
            this.each(function(){
                var dom=this;
                //2、判断该元素是否隐藏？-->display:"none"
                //          错误做法：因为dom是一个DOM元素，无法访问到css方法：var isHidden=dom.css("display")==="none";//
                //      正确做法：联想到jquery中具有将dom元素转换为jquery对象的功能，实现方式：$(dom)

                var $dom=jQuery(dom);

                //优化前：
//                if($dom.css("display")==="none"){
//                    $dom.show();
//                }else{
//                    $dom.hide();
//                }

                //优化1：
//                $dom.css("display")==="none"?
//                        $dom.show():
//                        $dom.hide();

                //优化2：
//                var isHidden=$dom.css("display")==="none";
//                $dom[isHidden?"show":"hide"]();
                //   $dom["show"]()
                //   $dom["hide"]()

                //优化3：
                $dom[$dom.css("display")==="none"?"show":"hide"]();
            })
        }
    });

    window.$=window.jQuery=jQuery;

})(window);