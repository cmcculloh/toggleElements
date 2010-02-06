/**
 * Package: Toggle Element Display
 *
 * @author Christopher McCulloh
 *
 * This plugin will dynamically hide/show HTML elements on a page. Yes it is almost identical to
 * jQuery .toggle() and then defining methods to show hide. The difference is that with this plugin
 * you don't have to write the code yourself.
 *
 * This plugin was specifically written to address problems with ie6 and select menus, so it comes out
 * of the box ready to just handle that one thing. However, I made it expandable to address anything
 * anyone could want to toggle on the page.
 *
 * Also, you can use this to only toggle the display of elements within a certain x/y height/width area
 * on a page, or even an x/y height/width area as determined by an element currently displayed on the page.
 */
;(function($){
  /**
   * Class: toggleElements
   *
   * Toggles the display value of HTML elements on a page specific to element class/parent class with
   * the added ability to show or hide (instead of just toggle) explicitly
   *
   * @param options - JSON list of options you can specify for plugin see Defaults for possible options
   *
   * Use Like:
   * >  $.toggleSelects({parentClass:"ie6", toggle:"show", elementClass:"narrow"});
   * or like (to just use defaults):
   * >  $.toggleSelects();
   *
   * That's all you need to do, you don't need to call any of the following methods...
   */
  jQuery.toggleElements = function(options){
    //get the default options, override with user options
    var opts = jQuery.extend({}, jQuery.toggleElements.defaults, options);

    jQuery.toggleElements.beforeToggle();
    return doToggle(opts);
  };

  /**
   * Method: beforeToggle
   *
   * Can customize this plugin to do specific action before performing toggle
   *
   * Use Like:
   * > $.toggleElements.beforeToggle = function(){
   * >  //your code here
   * > }
   */
  jQuery.toggleElements.beforeToggle = function(){

  };  

  /**
   * Method: doToggle
   * Performs show/hide on selects
   *
   * YOU CAN NOT CALL THIS METHOD
   * Use beforeToggle to "add" to this method. This method will be called automatically
   * simply by invoking the plugin.
   */
  var doToggle = function(opts){
    //if user is defining a new set, save the set with the specified setName
    if(opts.defineSet === true){
      toggleElements.opts.set = toggleElements.opts.set || {};
      toggleElements.opts.set[opts.setName] = {
        targetBrowser: opts.targetBrowser || toggleElements.defaults.targetBrowser,
        parentSelector: opts.parentSelector || toggleElements.defaults.parentSelector,
        toggleTo: opts.toggleTo || toggleElements.defaults.toggleTo,
        elementSelector: opts.elementSelector || toggleElements.defaults.elementSelector,
        elementType: opts.elementType || toggleElements.defaults.elementType,
        byArea: opts.byArea || toggleElements.defaults.byArea,
        byElement: opts.byElement || toggleElements.defaults.byElement        
      }
    }else if(!!opts.setName){//if user has specified a setName, use that set
      opts.targetBrowser = opts.set[opts.setName].targetBrowser;
      opts.parentSelector = opts.set[opts.setName].parentSelector;
      opts.toggleTo = opts.set[opts.setName].toggleTo;
      opts.elementSelector = opts.set[opts.setName].elementSelector;
      opts.elementType = opts.set[opts.setName].elementType;
      opts.byArea = opts.set[opts.setName].byArea;
      opts.byElement = opts.set[opts.setName].byElement;
    }
    
    //check browser requirements
    if(!!opts.targetBrowser){
      theBrowser = detectBrowser();
      
      //if browser is not target browser, quit
      if(theBrowser !== opts.targetBrowser){
        return;
      }
    }
    
    //build fullSelector, this helps people write more efficient jQuery selectors...
    var fullSelector = "";
    fullSelector += !!opts.parentSelector ? opts.parentSelector + " " : "";
    fullSelector += !!opts.elementType ? opts.elementType : "";
    fullSelector += !!opts.elementSelector ? opts.elementSelector : "";
    var $elms = $(fullSelector);
    
    //if not byElement or byArea
    if(!opts.byElement || !opts.byArea.areaX){
      if(opts.toggleTo === "autoSelect"){
        $($elms).each(function() {
          var $this = $(this);
          $this.is(":visible") ? $this.hide() : $this.show();
        });
      }else if(opts.toggleTo === "hidden"){
        $elms.hide();
      }else if(opts.toggleTo === "shown"){
        $elms.show();
      }
    }else if(!!opts.byArea || !!opts.byElement){
      if(!!opts.byElement){
        var $target = $(targetSelector);
            var tAxis = $target.offset();
            var t_x = [tAxis.left, tAxis.left + $target.outerWidth()];
            var t_y = [tAxis.top, tAxis.top + $target.outerHeight()];
      }else{
        var t_x = [byArea.areaX, byArea.areaX + byArea.areaWidth];
        var t_y = [byArea.areaY, byArea.areaY + byArea.areaHeight];
      }
      
      $($elms).each(function() {
        var $this = $(this);
        var thisPos = $this.offset();
        var i_x = [thisPos.left, thisPos.left + $this.outerWidth()]
        var i_y = [thisPos.top, thisPos.top + $this.outerHeight()];
        
        if ( t_x[0] < i_x[1] && t_x[1] > i_x[0] &&
            t_y[0] < i_y[1] && t_y[1] > i_y[0]) {
          if(opts.toggleTo === "autoSelect"){
            $this.is(":visible") ? $this.hide() : $this.show();
          }else if(opts.toggleTo === "hidden"){
            $this.is(":visible") ? $this.hide() : '';
          }else if(opts.toggleTo === "shown"){
            $this.is(":visible") ? '' : $this.show();
          }
        }
      });
    }
  };  
  
  /**
   * Method: detectBrowser
   * YOU CANNOT CALL THIS METHOD DIRECTLY
   *
   * This method uses jQuery.browser to detect what browser a user is in.
   * I realize that this method is deprecated, but because this plugin
   * allows a user to explicitly target a browser, I need to use this
   * rather than feature detection. If the user wants they can opt
   * not to use this feature of the plugin and handle x-browser themselves.
   *
   * Simply set targetBrowser to false to opt out of this. Otherwise set
   * to one of the possible values as indicated below.
   *
   * Possible values are:
   *
   * ff - All versions of Firefox
   * ie6 - Internet Explorer 6
   * ie7 - Internet Explorer 7
   * ie8 - Internet Explorer 8
   * wk - Webkit browsers, all versions (Chrome, Safari)
   * op - Opera browsers, all versions
   * other - Could not determine browser
   */
  var detectBrowser = function(){
    if(!!jQuery.browser.mozilla){
      return "ff";
    }else if(!!jQuery.browser.msie){
      if(jQuery.browser.version.substr(0,3)=="6.0"){
        return "ie6";
      }else if(jQuery.browser.version.substr(0,3)=="7.0"){
        return "ie7";
      }else if(jQuery.browser.version.substr(0,3)=="8.0"){
        return "ie8";
      }
    }else if(!!jQuery.browser.webkit){
      return "wk";
    }else if(!!jQuery.browser.opera){
      return "op";
    }
    return "other";
  }
  
  /**
   * Properties: Defaults & Options
   * You can override the defaults for this plugin if you expect to toggle the same elements
   * repeatedly. Otherwise, you will have to pass in your options each time (which is the standard
   * way to do it, and should be done except for edge cases).
   *
   * All params are optional.
   * @param targetBrowser - One of ie6, ie7, ie8, ff, op, wk
   * @param parentSelector - jQuery selector for element for all toggleable elements to descend from
   * @param toggleTo - One of "autoSelect", "hidden" or "shown" defaults to "autoSelect"
   * @param elementSelector - jQuery selector for all toggleable elements
   * @param elementType - Any group of HTML elements, "select", "div", etc to toggle
   * @param byArea - Object indicating area toggleable elements must intersect with to be toggled
   * @param byArea.areaX - number (no "px") for top edge of area
   * @param byArea.areaY - number (no "px") for left edge of area
   * @param byArea.areaWidth - number (no "px") for width of area
   * @param byArea.areaHeight - number (no "px") for height of area
   * @param byElement - jQuery selector for Object elements must intersect with to be toggled
   *
   * To override defautls, do something like this:
   * >jQuery.toggleElements.defaults = {
   * >
   * >}
   *
   * Otherwise, pass in your options each time like this (this will not override the defaults):
   * >$.toggleElements({
   * >  targetBrowser:"ie7",
   * >  parentSelector:"#loginForm",
   * >  toggleTo:"hidden",
   * >  elementSelector:".optional",
   * >  elementType:"select",
   * >  byArea:{
   * >    areaX:"100",
   * >    areaY:"300",
   * >    areaWidth:"500",
   * >    areaHeight:"200"
   * >  },
   * >  byElement:"#dropDown1"
   * >});
   *
   * Note that you don't need to do all of these, you can do one or more of them, like this:
   * >$.toggleElements({
   * >  targetBrowser:"ie7",
   * >  elementSelector: "#formFields",
   * >  elementType: "input"
   * >});
   * or:
   * >$.toggleElements({
   * >  byArea:{
   * >    areaX:"100",
   * >    areaY:"300",
   * >    areaWidth:"500",
   * >    areaHeight:"200"
   * >  }
   * >});
   */
  jQuery.toggleElements.defaults = {
    targetBrowser:"ie6",
    parentSelector:undefined,
    toggleTo:"autoSelect",
    elementSelector:undefined,
    elementType:"select",
    byArea:{
      areaX:undefined,
      areaY:undefined,
      areaWidth:undefined,
      areaHeight:undefined
    },
    byElement:undefined
  };
})(jQuery);