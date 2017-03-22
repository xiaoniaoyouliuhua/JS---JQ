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
            splice.call(this,0,this.length);//本身没有length属性，会设置length属性的值为0

            if(selector==null) return this;

            if(jQuery.isString(selector)){
                //selector可能是一个选择器，也可能是一个html标签(<开头，>结尾)
                if(selector[0]==="<" && selector[selector.length-1]===">" && selector.length>=3){
                    //selector是一个html标签-->将这一段html标签转换为DOM元素
                    //dom.innerHTML="html标签"
                    //要找到一个dom元素，就不能使用HTML页面中已经存在的标签，可以在内存中创建出这样的DOM元素
                    var div=document.createElement("div");
                    div.innerHTML=selector;//这一行代码执行完毕，div就会拥有一系列的子节点

                    //将div的子节点遍历追加到this中
                    //div.childNodes：获取到所有的子节点

                    var nodes=div.childNodes;
                    push.apply(this,nodes);

                }else{
                    //2、通过选择器函数获取元素
                    var elements=Sizzle(selector);
                    //3、借用push方法将elements中的每一个DOM元素遍历添加到this中
                    push.apply(this,elements);
                }



            }else if(selector.nodeType){
                //selector是一个dom元素
                this[0]=selector;
                this.length=1;//this["length"]=1
            }else{
                jQuery.merge(this,selector);
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
        },
        error:function(msg){
            throw new Error(msg);
        }
    });

    jQuery.fn.extend({
        //遍历F的实例(JQuery对象)中每一个DOM元素的遍历
        each: function (callback) {
            jQuery.each(this, callback);

            return this;
        }
    });

    jQuery.extend({
        //获取指定DOM元素的所有的兄弟元素
        elementSiblings: function (dom) {
            var result = [];

            //1、找到父元素
            var parent = dom.parentNode;
            //2、找到父元素的所有的子节点
            var children = parent.childNodes;
            //3、过滤出元素节点，并过滤掉自己
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                //如果是元素节点，并且不是本身，才是该DOM元素的兄弟元素
                if (child.nodeType === 1 && child != dom) {
                    result.push(child);
                }

            }
            //4、返回结果
            return result;
        },

        //找到该dom元素的下一个兄弟元素
        //找不到返回null
        nextElementSibling:function(dom){
            //尝试找dom的下一个兄弟节点
            //判断该节点是否是一个元素，如果是一个元素直接返回
            //如果不是，应该查找下一个兄弟节点的下一个兄弟节点，继续以上过程
            //......
            //结束条件：1、找到  2、当前已经是最后一个兄弟节点了(dom.nextSibling=null)

            var next=dom.nextSibling;

            if(next==null) return null;

            if(next.nodeType===1) return next;

            return jQuery.nextElementSibling(dom.nextSibling);
        },

        //$.insert($("body"),$("<div></div>"),true)
        insert:function(parent,child,isAppend){
            var $parent=jQuery(parent);
            var $child=jQuery(child);

            $parent.each(function(){
                var parent=this;
                var firstChild=parent.firstChild;

                $child.each(function(){
                    var child =this;

                    var fnName=isAppend?"appendChild":"insertBefore";

                    //parent["appendChild"](child,firstChild)
                    parent[fnName](child.cloneNode(true),firstChild);

//                    if(isAppend){
//                        parent.appendChild(child.cloneNode(true));
//                    }else{
//                        parent.insertBefore(child.cloneNode(true),firstChild);
//                    }
                })
            })
        }
    });

    //CSS模块
    jQuery.fn.extend({
        css:function(){
            var len=arguments.length,
                arg0=arguments[0],
                arg1=arguments[1];

            if(len===0) return this;

            if(len===1){
                if(jQuery.isString(arg0)){
                    var firstDom=this[0];
                    return window.getComputedStyle(firstDom,null)[arg0];
                }else{
                    return this.each(function(){
                       //this:DOM
                        var dom=this;

                        jQuery.each(arg0,function(styleName,styleValue){
                            dom.style[styleName]=styleValue;
                        });
                    });
                }

            }else{
                return this.each(function(){
                    this.style[arg0]=arg1;
                });

            }
        },

        show:function(){
            return this.css("display","block");
        },

        hide:function(){
            return this.css("display","none");
        },

        toggle:function(){
            return this.each(function(){
                var $dom=jQuery(this);
                if($dom.css("display")==="none"){
                    $dom.show();
                }else{
                    $dom.hide();
                }
            });
        }
    });

    //DOM操作1：
    jQuery.fn.extend({
        get:function(index){
            var len=arguments.length;

            if(len===0){
                return jQuery.makeArray(this);
            }

            if(index>=0){
                return this[index];
            }

            return this[index+this.length];
        },//1

        //返回由第一个DOM元素组成的jquery对象
        first:function(){
            // return jQuery(this.get(0));

            return this.eq(0);
        },

        //返回由最后一个DOM元素组成的jquery对象
        last:function(){
            // return jQuery(this.get(-1));

            return this.eq(-1);
        },

        eq:function(index){
            return jQuery(this.get(index));
        },

        find:function(selector){
            var $=jQuery();

            this.each(function(){
                var dom=this;
                var elements=dom.querySelectorAll(selector);
                jQuery.merge($,elements);
            });

            return $;
        }//2
    });

    //DOM操作2：
    jQuery.fn.extend({
        appendTo:function(){
            var $parent=arguments[0];
            var $child=this;

            jQuery.insert($parent,$child,true);
            return this;
        },//3

        prependTo:function(){
            var $parent=arguments[0];
            var $child=this;

            jQuery.insert($parent,$child);

            return this;
        },

        append:function(){
            var $parent=this;
            var $child=arguments[0];

            jQuery.insert($parent,$child,true);

            return this;
        },

        prepend:function(){
            var $parent=this;
            var $child=arguments[0];
            jQuery.insert($parent,$child);

            return this;
        },//4

        before: function (prevSibling) {
            var $prev = jQuery(prevSibling);
            var $next = this;

            //要将$prev中的元素遍历的追加到$next中的所有元素之前
            $next.each(function () {
                var next = this;

                $prev.each(function () {
                    var prev = this;

                    //因为next是已知的，prev是要插入的元素-->实现将prev插入到next之前
                    //原生JS：父节点.insertBefore(prev,next)
                    //要找到父节点，因为next是已知的，可以通过next.parentNode找到他们的父节点(但是prev不行，因为prev是要插入的节点，它暂时没有父节点)
                    var parent = next.parentNode;

                    parent.insertBefore(prev.cloneNode(true), next);

                });


            });
            return this;
        },//5

        after: function (nextSibling) {
            var $prev = this;
            var $next = jQuery(nextSibling);
            $prev.each(function(){
                var prev=this;

                $next.each(function(){
                    var next=this;

                    //已知的是prev，要将next插入到prev之后，实际上就是要将next插入到prev的下一个兄弟节点的前面
                    prev.parentNode.insertBefore(next.cloneNode(true),prev.nextSibling);

                });
            });
            return this;
        },//6

        html:function(arg){

            if(arg===undefined){
                //1、不传参、或者传递undefined-->这里使用arguments.length只能判断不传参的情况，不能处理undefined，应该获取第一个实参的值进行判断
                return this.get(0).innerHTML;

            }

            //2、其他情况(包括null)--->设置所有元素的内容
            return this.each(function(){
                var dom=this;
                dom.innerHTML=arg;
            })



        },

        text: function (text) {
            if (text === undefined) {
                var str = "";
                this.each(function () {
                    var dom = this;
                    str += dom.innerText;
                });
                return str;
            }

            //设置每一个元素的文本
            this.each(function () {
                var dom = this;
                dom.innerText = text;
            });
            return this;
        },//7

        siblings: function (filter) {
            var $siblings = jQuery();

            //获取所有的当前DOM元素的所有的兄弟元素
            this.each(function () {
                var dom = this;
                //要找到dom的所有兄弟元素，可以通过父元素的childNodes获取所有的子节点，再过滤出元素节点，再排除本身
                var sibs = jQuery.elementSiblings(dom);

                //将sibs中的元素遍历追加到$中
                jQuery.merge($siblings, sibs);
            });

            if (!filter) {//filter是假值的情况，进入if-->filter为假值：不传参,""
                return $siblings;
            }

            var $result = jQuery();
            //进行筛选
            var $filter = jQuery(filter);

            var doms = [];//存放所有的筛选后的DOM元素
            $siblings.each(function () {
                var sibling = this;
                $filter.each(function () {
                    var filter = this;
                    //如果sibling和filter相等，就是我们要获取的DOM元素，把它放到结果中
                    if (sibling == filter) {
                        doms.push(sibling);
                    }
                })
            });
            //将doms中的元素追加到$result中
            return jQuery.merge($result, doms);
        },//8

        next:function(filter){
            //要获取到每一个元素的下一个兄弟元素

            var $next=jQuery();
            var nexts=[];
            this.each(function(){
                var dom=this;

                var nextElement=jQuery.nextElementSibling(dom);

                nexts.push(nextElement);

            });
            //将nexts中的元素遍历追加到$next中
            jQuery.merge($next,nexts);

            if(!filter) return $next;

            var arr2=[];//存放所有筛选后的元素
            var $filter=jQuery(filter);
            $next.each(function(){
                var next=this;
                $filter.each(function(){
                    var filter=this;
                    if(next==filter){
                        arr2.push(next);
                    }
                })
            });

            return jQuery.merge(jQuery(),arr2);

        }//9
    });

    //属性操作方法
    //attr removeAttr prop hasClass addClass removeClass toggleClass val

    window.$=window.jQuery=jQuery;

})(window);