var isMobile, overrideMobile, hasDrawer, color;
jQuery(document).ready(function($) {
	// Custom function to do case-insensitive selector matching
	$.extend($.expr[":"], {
		"containsInsensitive": function(elem, i, match, array) {
			return (elem.textContent || elem.innerText || "").toLowerCase().indexOf((match[3] || "").toLowerCase()) >= 0;
		}
	});
	var branch = $("#branch-data").attr('data');
	$.getJSON("https://api.github.com/repos/mescon/Muximux/commits?sha=" + branch, function(myjson) {
		$('#git-data').attr('data', JSON.stringify(myjson));
	});
	hasDrawer = ($('#drawer').attr('data') == 'true');
	getSecret();
	var tabs = $('.cd-tabs');
	// Set default title to the selected item on load
	var activeTitle = $('li .selected').attr("data-title");
	muximuxMobileResize();
	if (isMobile) {
		$('#override').css('display', 'block');
	} else {
		$('#override').css('display', 'none');
	}
	overrideMobile = false;
	setTitle(activeTitle);
	//get appropriate CSS3 box-shadow property
	var boxshadowprop = getsupportedprop(['boxShadow', 'MozBoxShadow', 'WebkitBoxShadow'])
		//Hide the nav to start	
	$('.drop-nav').toggleClass('hide-nav');
	tabs.each(function() {
		var tab = $(this),
			tabItems = tab.find('ul.cd-tabs-navigation, .main-nav'),
			tabContentWrapper = tab.children('ul.cd-tabs-content'),
			tabNavigation = tab.find('nav');
		tabItems.on('click', 'a:not(#reload, #hamburger, #override, #logout)', function(event) {
			// Set up menu for desktip view
			if (!isMobile) {
				$('.drop-nav').addClass('hide-nav');
				$('.drop-nav').removeClass('show-nav');
			}
			resizeIframe(hasDrawer); // Call resizeIframe when document is ready
			event.preventDefault();
			var selectedItem = $(this);
			color = selectedItem.attr("data-color");
			if (!selectedItem.hasClass('selected')) {
				var selectedTab = selectedItem.data('content'),
					selectedContent = tabContentWrapper.find('li[data-content="' + selectedTab + '"]'),
					selectedContentHeight = selectedContent.innerHeight();
				selectedItem.dblclick(function() {
					selectedContent.children('iframe').attr('src', selectedContent.children('iframe').attr('src'));
				});
				var sifsrc = selectedContent.children('iframe').attr('src');
				var srcUrl = selectedContent.children('iframe').data('src');
				if (sifsrc === undefined || sifsrc === "") {
					selectedContent.children('iframe').attr('src', srcUrl);
				}
				// This doesn't work often, but it's a nice surprise when it does
				// Work on a way to do this with PHP that isn't taxing
				//changeFavicon('http://api.byi.pw/favicon?url=' + srcUrl);
				// Fix issue with color not resetting on settings close
				if (!(selectedItem.attr("data-title") == "Settings")) {
					clearColors();
					tabItems.find('a.selected').removeClass('selected');
					selectedItem.addClass('selected');
					setSelectedColor();
					// Change window title after class "selected" has been added to item
					var activeTitle = selectedItem.attr("data-title");
					setTitle(activeTitle);
					selectedContent.addClass('selected').siblings('li').removeClass('selected');
					// animate tabContentWrapper height when content changes
					tabContentWrapper.animate({
						'height': selectedContentHeight
					}, 200);
				}
			}
		});
		// hide the .cd-tabs::after element when tabbed navigation has scrolled to the end (mobile version)
		checkScrolling(tabNavigation);
		tabNavigation.on('scroll', function() {
			checkScrolling($(this));
		});
	});
	$('li.dd').on('click', function() {
		toggleClasses();
	});
	// This fetches the broweser-appropriate box-shadow value so we can set it
	function getsupportedprop(proparray) {
		var root = document.documentElement //reference root element of document
		for (var i = 0; i < proparray.length; i++) { //loop through possible properties
			if (proparray[i] in root.style) { //if property exists on element (value will be string, empty string if not set)
				return proparray[i] //return that string
			}
		}
	}
	$('#reload').on('click', function() {
		var selectedFrame = $('.cd-tabs-content').find('.selected').children('iframe');
		selectedFrame.attr('src', selectedFrame.attr('src'));
	});
	// Detect click on override button, fire resize
	$('#override').on('click', function() {
		overrideMobile = !overrideMobile;
		muximuxMobileResize();
		if (overrideMobile && isMobile) {
			$('#override').addClass('or-active');
		} else {
			$('#override').removeClass('or-active');
		}
	});
	$("#authenticationCheckbox").click(function() {
		// this function will get executed every time the #home element is clicked (or tab-spacebar changed)
		if ($(this).is(":checked")) // "this" refers to the element that fired the event
		{
			$('.userinput').removeClass('hidden');
		} else {
			$('.userinput').addClass('hidden');
		}
	});
	$("#logout").click(function() {
		 window.location.href = '?logout';
	});
	// When settings modal is open, set title to "Settings"
	$('#settingsModal').on('show.bs.modal', function() {
		setTitle("Settings");
	});
	// When settings modal closes, set title to the previous title used
	$('#settingsModal').on('hidden.bs.modal', function() {
		var activeTitle = $('.cd-tabs-content').find('.selected').children('iframe').attr("data-title");
		setTitle(activeTitle);
	});
	$(window).on('resize', function() {
		tabs.each(function() {
			var tab = $(this);
			checkScrolling(tab.find('nav'));
			tab.find('.cd-tabs-content').css('height', 'auto');
		});
		resizeIframe(hasDrawer); // Resize iframes when window is resized.
		scaleFrames(); // Scale frames when window is resized.
	});
	$('.dd').click(function() {
		dropDownFixPosition($('.dd'), $('.drop-nav'));
	});
	$('#autohideCheckbox').click(function() {
		$('#mobileoverrideCheckbox').prop('checked', false);
	});
	$('#mobileoverrideCheckbox').click(function() {
		$('#autohideCheckbox').prop('checked', false);
	});
	// This triggers a menu close when mouse has left the drop nav.
	$('.dd').mouseleave(function() {
		if (!($('.drop-nav:hover').length != 0 || $('.dd:hover').length != 0)) {
			timeoutId = setTimeout(function() {
				$('.drop-nav').addClass('hide-nav');
				$('.drop-nav').removeClass('show-nav');
			}, 500);
		}
	});
	jQuery.fn.reverse = [].reverse;
	$('.drawerItem').mouseleave(function() {
		$('.drawerItem').removeClass('full');
	});
	$('.drawerItem').mouseenter(function() {
		$('.drawerItem').addClass('full');
	});
	// Move items to the dropdown on mobile devices
	settingsEventHandlers();
	scaleFrames();
	resizeIframe(hasDrawer); // Call resizeIframe when document is ready
	initIconPicker('.iconpicker');
	// Load the menu item that is set in URL, for example http://site.com/#plexpy
	if ($(location).attr('hash')) {
		var bookmarkHash = $(location).attr('hash').substr(1).replace("%20", " ").replace("_", " ");
		var menuItem = $(document).find('a:containsInsensitive("' + bookmarkHash + '")');
		menuItem.trigger("click");
	}
});
window
$(window).load(function() {
	if ($('#popupdate').attr('data') == 'true') {
		var updateCheck = setInterval(updateBox(), 10000);
	}
});
// Close modal on escape key
$("html").on("keyup", function(e) {
	if(e.keyCode === 27 && !($('#modal-dialog').hasClass("no-display")))
	$('.close').trigger("click");
});
// When user closes the page, create new unique ID in secret.txt so that the token is no longer valid if used after page load.
$(window).unload(function() {
	$.ajax({
		async: true,
		dataType: 'text',
		url: "muximux.php?secret=" + dataStore().secret + "&set=secret",
		type: 'GET'
	});
});
$(window).resize(muximuxMobileResize);

function muximuxMobileResize() {
	if ($(window).width() < 800) {
		isMobile = true;
	} else {
		isMobile = false;
	}
	if (isMobile) {
		$('#override').css('display', 'block');
	} else {
		$('#override').css('display', 'none');
	}
	if (isMobile && !overrideMobile) {
		$('.cd-tabs-navigation nav').children().appendTo(".drop-nav");
		var menuHeight = $(window).height() * .80;
		$('.drop-nav').css('max-height', menuHeight + 'px');
	} else {
		$(".drop-nav").children('.cd-tab').appendTo('.cd-tabs-navigation nav');
		$('.drop-nav').css('max-height', '');
		var listWidth = 0;
		$('.cd-tab').each(function() {
			var myWidth = $(this).width();
			if (myWidth + listWidth > $(window).width() - $(".main-nav").width()) {
				$(this).appendTo(".drop-nav");
			} else {
				$(this).appendTo('.cd-tabs-navigation nav');
			}
			listWidth = listWidth + $(this).width();
		});
	}
	clearColors();
	setSelectedColor();
}
// Simple method to toggle show/hide classes in navigation
function toggleClasses() {
	$('.drop-nav').toggleClass('hide-nav');
	$('.drop-nav').toggleClass('show-nav');
}
// Clear color values from tabs
function clearColors() {
	$(".selected").children("span").css("color", "");
	$(".selected").css("color", "");
	$(".selected").css("Box-Shadow", "");
}
// Add relevant color value to tabs
// Refactor to a more appropriate name
function setSelectedColor() {
	color = $('li .selected').attr("data-color");
	$('.droidtheme').replaceWith('<meta name="theme-color" class="droidtheme" content="' + color + '" />');
	$('.mstheme').replaceWith('<meta name="msapplication-navbutton-color" class="mstheme" content="' + color + '" />');
	$('.iostheme').replaceWith('<meta name="apple-mobile-web-app-status-bar-style" class="iostheme" content="' + color + '" />');
		   
	if (isMobile && !overrideMobile) {
		$(".cd-tabs-bar").removeClass("drawer");
		$('.cd-tab').removeClass('drawerItem');
		$('.navbtn').removeClass('drawerItem');
		$('.cd-tabs-bar').removeClass('drawerItem');
		$(".selected").children("span").css("color", "" + color + "");
		$(".selected").css("color", "" + color + "");
	} else {
		$(".selected").css("Box-Shadow", "inset 0 5px 0 " + color + "");
		// Super hacky, but we're refrencing a placeholder div to quickly see if we have a drawer
		if (hasDrawer) {
			$('.cd-tab').addClass('drawerItem');
			$('.navbtn').addClass('drawerItem');
			$('.cd-tabs-bar').addClass('drawerItem');
		} else {
			$('.cd-tab').removeClass('drawerItem');
			$('.navbtn').removeClass('drawerItem');
			$('.cd-tabs-bar').removeClass('drawerItem');
		}
	}
}