/**
 * Package: Toggle Element Display
 *
 * @author Christopher McCulloh
 *
 * This plugin will dynamically hide/show HTML elements on a page. Yes it is almost identical to
 * jQuery .toggle() and then defining methods to show hide. The difference is that with this plugin
 * you don't have to write the code yourself.
 *
 * Also, you can use this to only toggle the display of elements within a certain x/y height/width area
 * on a page, or even an x/y height/width area as determined by an element currently displayed on the page.
 * 
 * You can use defineSet in your options when calling $.toggleElements. If you pass in a name of a set you
 * would like to define, a specific options configuration will be saved with that "set" name. If you call
 * the plugin passing in that "set" name with the useSet parameter, that options configuration will be
 * used instead of the default. When you pass in a parameter for defineSet, the plugin WILL NOT perform the
 * toggle, it will simply return after defining the set, unless you pass in continueAfterDefineSet as true.
 * 
 * You can override any of the options set in a defined set when you are calling that defined set using useSet
 * by simply passing the overriding parameter through with the call. So if you set a target browser in the
 * defineSet, and then for just one call you want to override that, just call the plugin using useSet, but also
 * pass through the new targetBrowser that you want to use in that instance.
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
	 * >	$.toggleSelects({parentClass:"ie6", toggle:"show", elementClass:"narrow"});
	 * or like (to just use defaults):
	 * >	$.toggleSelects();
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
	 * >	//your code here
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
		//if user is defining a new set, save the set with the specified useSet
		if(!!opts.defineSet){
			jQuery.toggleElements.defaults.set = jQuery.toggleElements.defaults.set || {};
			jQuery.toggleElements.defaults.set[opts.defineSet] = jQuery.extend({}, jQuery.toggleElements.defaults, opts);
			if(!opts.continueAfterDefineSet){return;}
		}else if(!!opts.useSet && jQuery.toggleElements.defaults.set[opts.useSet]){//if user has specified a useSet, and that set exists, use that set
			opts = jQuery.extend({}, jQuery.toggleElements.defaults.set[opts.useSet], opts);
		}
		
		//check browser requirements
		if(!!opts.targetBrowser){
			theBrowser = detectBrowser();
			
			//if browser is not target browser, quit
			if(theBrowser !== opts.targetBrowser){return;}
		}

		//make sure the parent element even exists on the page before going any further. Parent expected to be an element id
		opts.parentSelector = !!opts.parentSelector ? opts.parentSelector : "body";//if no parent selector specified, use body
		var $parentElm = $(opts.parentSelector);
		if($parentElm.length <= 0){return;}
		
		//build fullSelector (combine type & element selector. Type expected to be a class name.)
		var fullSelector = "";
		fullSelector += !!opts.elementType ? opts.elementType : "";
		fullSelector += !!opts.elementSelector ? opts.elementSelector : "";
		var $elms = $parentElm.find(fullSelector);
		
		//if we have selected nothing, just return
		if($elms.length <= 0){return;}
		
		//if not byElement or byArea
		if(!opts.byElement && !opts.byArea.areaX){
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
				var $target = $(opts.byElement);
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
	 * @param toggleTo - One of "autoSelect", "hidden" or "shown" defaults to "autoSelect", I suggest using either hidden or shown if at all possible, probably more performant
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
	 * >	targetBrowser:"ie7",
	 * >	parentSelector:"#loginForm",
	 * >	toggleTo:"hidden",
	 * >	elementSelector:".optional",
	 * >	elementType:"select",
	 * >	byArea:{
	 * >	areaX:"100",
	 * >	areaY:"300",
	 * >	areaWidth:"500",
	 * >	areaHeight:"200"
	 * >	},
	 * >	byElement:"#dropDown1"
	 * >});
	 *
	 * Note that you don't need to do all of these, you can do one or more of them, like this:
	 * >$.toggleElements({
	 * >	targetBrowser:"ie7",
	 * >	elementSelector: "#formFields",
	 * >	elementType: "input"
	 * >});
	 * or:
	 * >$.toggleElements({
	 * >	byArea:{
	 * >	areaX:"100",
	 * >	areaY:"300",
	 * >	areaWidth:"500",
	 * >	areaHeight:"200"
	 * >	}
	 * >});
	 */
	jQuery.toggleElements.defaults = {
		targetBrowser:undefined,
		parentSelector:undefined,
		toggleTo:"autoSelect",
		elementSelector:undefined,
		elementType:undefined,
		byArea:{
			areaX:undefined,
			areaY:undefined,
			areaWidth:undefined,
			areaHeight:undefined
		},
		byElement:undefined,
		set:{}
	};
})(jQuery);
