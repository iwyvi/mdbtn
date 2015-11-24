(function ( root, factory ) {
    
    if ( typeof exports === 'object' ) {

        // CommonJS like
        module.exports = factory(root);

    } else if ( typeof define === 'function' && define.amd ) {

        // AMD
        define( function() { return factory( root); });

    } else {
        // Browser global
        root.mdbtn = factory(root);
    }

}( typeof window !== "undefined" ? window : this, function  (root) {

    "use strict";
    var mdbtn = {};

    var process = [],
        MDbtnElement = {},
        isProcess = false,
        lastTime,
        currentTime,
        canvas = {},
        mousedown = false,
        hideDelay = 1000,
        containers = document.getElementsByClassName('material-design');

        /*
        初始化每个button里的canvas并添加点击事件监听
         */
        
    mdbtn.init = function () {
          for (var i = 0; i < containers.length; i += 1) {
            containers[i].style.overflow = "hidden";
            containers[i].style.position = "relative";
            canvas = document.createElement('canvas');
            containers[i].appendChild(canvas);
            //添加鼠标事件
            containers[i].addEventListener('mousedown', function  (event) {
                mousedown = true;
                //这里似乎chrome和Firefox、IE识别到event.target不一样，然而并不知道原因
                if(event.target.tagName == 'CANVAS'){
                    var canvas = event.target;
                }else{
                    var canvas = event.target.getElementsByTagName('canvas')[0];
                }
                press(event,canvas);
            },false);
            containers[i].addEventListener('mouseup',function  (event) {
                if(mousedown){
                  lastTime = new Date().getTime();
                  mousedown = false;
                }
            },false);
            containers[i].addEventListener('mouseleave',function  (event) {
                if(mousedown){
                  hideDelay = 150;
                  lastTime = new Date().getTime();
                  mousedown = false;
                }
            },false);
            canvas.style.width ='100%';
            canvas.style.height='100%';
            canvas.style.opacity = 0.25;
            canvas.style.position = "absolute";
            canvas.style.top = 0;
            canvas.style.left = 0;
            canvas.width  = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            canvas.setAttribute("index",i);
          }
        };

        /*
        按键事件
         */
        
    var press = function (event,canvas) {
          hideDelay = 800;
          var color = canvas.parentNode.dataset.color || "#222",
              element = canvas,
              context = element.getContext('2d'),
              centerX = event.offsetX,
              centerY = event.offsetY,
              index = parseInt(element.getAttribute('index'));
          MDbtnElement = new MDbtn(color,element,context,centerX,centerY,index);
          var j = -1;
          //当点击了其他按钮时上个按钮自动进入autoClear的状态
          for(var i = 0;i<process.length;i++){ 
            process[i].autoClear = true;
            if(process[i].index == index){
              j = i;
              continue;
            }
          }
          //这里这样写我是为了处理队列长度但是方法似乎并不好
          if(j>=0){
            process[j].clear();
            process.splice(j,1);
          }
          process.push(MDbtnElement);
          lastTime = new Date().getTime();
          if(!isProcess){
            draw();
          }
        },
          
        /*
        绘图事件
         */
        draw = function () {
          if(process.length>=1){
            isProcess = true;
            for(var i = 0;i<process.length;i++){
              if (process[i].autoClear) {
                process[i].radiusStep = 6;
              };
              //当内部的阴影大于边框了就准备开始hide
              if(process[i].radius >= process[i].canvas.width * Math.sqrt(2)){
                if(process[i].autoClear){
                  process[i].hide();
                  if(process[i].alpha<0){
                    process[i].clear();
                    process.splice(i,1);
                  }
                }
              }else{
                process[i].draw();
              }
            }
            if(process.length == 1){
              currentTime = new Date().getTime();
              if ((currentTime - lastTime >= hideDelay) && !mousedown) {
                process[0].autoClear = true;
              };
            }
            requestNextFrame(draw);
          }else{
            isProcess = false;
          }
        },

        /*
        获取每一帧
         */
        requestNextFrame = function () {
          return (
            window.requestAnimationFrame       || 
            window.mozRequestAnimationFrame    || 
            window.oRequestAnimationFrame      || 
            window.msRequestAnimationFrame     || 
            function (callback) {
              window.setTimeout(callback, 1000 / 60);
            }
          );
        } (),

        /*
        按钮类
         */
        
        MDbtn = function  (color,canvas,context,centerX,centerY,index) {
          this.init(color,canvas,context,centerX,centerY,index);
        };
    MDbtn.prototype = {
      init: function  (color,canvas,context,centerX,centerY,index) {
        this.color = color;
        this.alpha = 1;
        this.canvas = canvas;
        this.context = context;
        this.centerX = centerX;
        this.centerY = centerY;
        this.radius = 0;
        this.radiusStep = 2;
        this.autoClear = false;
        this.index = index;
      },
      draw: function  () {
        this.context.save();
        this.context.beginPath();
        this.context.arc(this.centerX, this.centerY, this.radius, 0, 2 * Math.PI, false);
        this.context.fillStyle = this.color;
        this.context.fill();
        this.context.restore();
        this.radius += this.radiusStep;
      },
      hide: function  () {
        this.clear();
        this.context.save();
        this.context.beginPath();
        this.context.arc(this.centerX, this.centerY, this.radius, 0, 2 * Math.PI, false);
        //这里处理透明度
        this.context.fillStyle = this.color.colorToRgba(this.alpha);
        this.context.fill();
        this.context.restore();
        this.alpha -=0.1;
      },
      clear: function  () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
    }   

    /*
    colorToHex 出处： http://www.zhangxinxu.com/wordpress/2010/03/javascript-hex-rgb-hsl-color-convert/
    colorToRgba 由colorToRgb 修改扩展
     */
    
    var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/; 
    String.prototype.colorToHex = function(){
      var that = this;
      if(/^(rgb|RGB)/.test(that)){
        var aColor = that.replace(/(?:\(|\)|rgb|RGB)*/g,"").split(",");
        var strHex = "#";
        for(var i=0; i<aColor.length; i++){
          if(Number(aColor[i])<16){
            var hex = "0" + Number(aColor[i]).toString(16);
          }else{
            var hex = Number(aColor[i]).toString(16);
          }
          strHex += hex;
        }
        if(strHex.length !== 7){
          strHex = that;  
        }
        return strHex;
      }else if(reg.test(that)){
        var aNum = that.replace(/#/,"").split("");
        if(aNum.length === 6){
          return that.toString();  
        }else if(aNum.length === 3){
          var numHex = "#";
          for(var i=0; i<aNum.length; i+=1){
            numHex += (aNum[i].toString()+aNum[i].toString());
          }
          return numHex;
        }
      }else{
        return that.toString();
      }
    };
    //这个函数的可以转入一个参数作为alpha值
    String.prototype.colorToRgba = function  () {
      var tempA = arguments[0] || 1;
      var sColor = this.colorToHex().toLowerCase();
      if(sColor && reg.test(sColor)){
        var sColorChange = [];
        for(var i=1; i<7; i+=2){
          sColorChange.push(parseInt("0x" + sColor.slice(i,i+2)));
        }
        return "rgba(" + sColorChange.join(",") + "," + tempA + ")";
      }else{
        return sColor;
      }
    };

    root.onload = function  () {
      mdbtn.init();
    }   
    return mdbtn;
}));