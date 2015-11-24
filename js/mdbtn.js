/*
一个简单的新手练习，借鉴了网上的许多代码
material-design button
2015.8.2
修改时间：2015.11.23
 */
;(function(window, document, undefined) {

  "use strict";

  var NAME = 'mdbtn';
  var process = [],
     isProcess = false,
     mousedown = false;
    /*
    初始化每个button里的canvas并添加点击事件监听
     */
  var mdbtn = {
    elements: 'mdbtn',
    option: {
      color: '#222222',//默认圆圈的颜色
      pressColor: '#888888',//按下后按键的颜色
      showPressColor: false,
      processStep: 80,//步长的倒数
    },
  };
  /**
   * [setOption 设置mdbtn的选项]
   * @param {object} opt 传进来一个包含option的对象
   */
  mdbtn.setOption = function  (opt) {
    for(var key in opt){
      if(typeof(this.option[key]) != undefined){
        this.option[key] = opt[key];
      }
    }
  };
  /**
   * 初始化mdbtn
   * @param  {string || object} elements 若传入字符串则将默认修改内容设置为以字符串为类名的元素
   * 若为object则将其设为mdbtn的选项
   * @param  {obj（可选）} option   mdbtn的选项
   */
  mdbtn.init = function (elements, option) {
    if(elements && typeof(elements) == "string"){this.elements = elements;};
    if(option){
      this.setOption(option);
    }else if(typeof(elements) == "object"){
      this.setOption(elements);
    };
    this.addElements();
  };
  /**
   * 向所有目标元素添加事件监听
   * @param {string（可选）} elements 设置目标对象
   */
  mdbtn.addElements = function (elements) {
    if(elements && typeof(elements) == "string"){this.elements = elements;};
    var containers = document.getElementsByClassName(this.elements);
    for (var i = 0; i < containers.length; i++) {
       containers[i].style.position = "relative";
       containers[i].setAttribute('style',containers[i].getAttribute("style") + ";overflow:hidden !important;");
      //添加鼠标事件-
      //目前没有处理触屏事件
      containers[i].addEventListener('mousedown', function (event) {
        mousedown = true;
        press(event, getEffectElement(event));
      },false);
      containers[i].addEventListener('mouseup',function (event) {
        mousedown = false;
      },false);
      containers[i].addEventListener('mouseleave',function (event) {
        mousedown = false;
      },false);
    }
  }

  /**
   * 按键事件
   * @param  {object} event 传入事件
   * @param  {HTMLObject} ele   目标DOM元素
   */
  var press = function (event, ele) {
    var color = ele.dataset.color || mdbtn.option.color,
      centerX = event.layerX || event.offsetX,
      centerY = event.layerY || event.offsetY;
    var canvas = document.createElement('canvas');
    ele.appendChild(canvas);
    canvas.style.width ='100%';
    canvas.style.height='100%';
    canvas.style.opacity = 0.25;
    canvas.style.position = "absolute";
    canvas.style.top = 0;
    canvas.style.left = 0;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    var context = canvas.getContext('2d');

    var singleMdbtnElement = new singleMdbtn(color,canvas,context,centerX,centerY);
    process.push(singleMdbtnElement);
    if(!isProcess){
      draw();
    }
  };
    
  /*
  绘图事件
   */
  var draw = function () {
    if(process.length>=1){
      isProcess = true;
      for (var i = process.length - 1; i >= 0; i--) {
        process[i].draw();
        if(process[i].isFinish){
          process[i].canvas.parentNode.removeChild(process[i].canvas);
          process.splice(i,1);
        }
      };
      if(!mousedown){
        for(var i = 0;i<process.length;i++){ 
          process[i].autoClear = true;
        }
      }
      requestNextFrame(draw);
    }else{
      isProcess = false;
    }
  };

  /*
  获取帧
   */
  var requestNextFrame = function () {
    return (
      window.requestAnimationFrame    || 
      window.mozRequestAnimationFrame || 
      window.oRequestAnimationFrame   || 
      window.msRequestAnimationFrame  || 
      function (callback) {
        window.setTimeout(callback, 1000 / 60);
      }
    );
  } ();
  var getCurrentStyle = function (obj, prop) {     
    if (obj.currentStyle) {        
        return obj.currentStyle[prop];     
    }      
    else if (window.getComputedStyle) {        
        var propprop = prop.replace (/([A-Z])/g, '-$1');           
        propprop = prop.toLowerCase ();        
        return document.defaultView.getComputedStyle (obj,null)[prop];     
    }      
    return null;   
  };
  var getEffectElement = function (e) {
    var element = null;
    var target = e.target || e.srcElement;
    while (target.parentElement !== null) {
        if (target.className.indexOf(mdbtn.elements) !== -1) {
            element = target;
            break;
        }
        target = target.parentElement;
    }
    return element;
  };

  /*
  按钮类
   */  
  var singleMdbtn = function  (color,canvas,context,centerX,centerY) {
    this.init(color,canvas,context,centerX,centerY);
  };
  singleMdbtn.prototype = {
    init: function (color,canvas,context,centerX,centerY) {
      this.color = color;
      this.alpha = 1;
      this.canvas = canvas;
      this.context = context;
      this.centerX = centerX;
      this.centerY = centerY;
      this.radius = 0;
      this.autoClear = false;
      this.shadowRadius = function(obj) {
        var max = obj.centerX;
        if(obj.centerY > max){max = obj.centerY;}
        if(obj.canvas.width-obj.centerX > max){max = obj.canvas.width-obj.centerX;}
        if(obj.canvas.height-obj.centerY > max){max = obj.canvas.height-obj.centerY;}
        return max;
      }(this);
      this.setStep();
      this.isFinish = false;
    },
    draw: function () {
      if(this.autoClear){
        this.setStep(10);
      };
      if(this.radius >= this.shadowRadius*Math.sqrt(2)){
        if(this.autoClear){
          this.hide();
          if(this.alpha<0){  
            this.clear();
            this.isFinish = true;
          }
        }
      }else{
        this.spread();
      }
    },
    spread: function () {
      if(mdbtn.option.showPressColor){
        this.context.save();
        this.context.fillStyle = mdbtn.option.pressColor;
        this.context.fillRect(0,0,this.canvas.width,this.canvas.height);
        this.context.restore();
      }
      this.context.save();
      this.context.beginPath();
      this.context.arc(this.centerX, this.centerY, this.radius, 0, 2 * Math.PI, false);
      this.context.fillStyle = this.color;
      this.context.fill();
      this.context.restore();
      this.radius += this.radiusStep;
    },
    hide: function () {
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
    clear: function () {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    setStep: function (percent) {
      var tpercent = percent || mdbtn.option.processStep;
      this.radiusStep = (this.shadowRadius+(this.canvas.width>this.canvas.height?this.canvas.width:this.canvas.height))/2/tpercent > 2? 
      (this.shadowRadius+(this.canvas.width>this.canvas.height?this.canvas.width:this.canvas.height))/2/tpercent : 2;
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
  String.prototype.colorToRgba = function () {
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
  window[NAME] = mdbtn;
})(window, document);