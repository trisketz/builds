/////////////////////////////////////////////////////////////////
//
//	Developers:
//
//	Please Be Mindful of javascript library being used within
//	hub (if any). Use no conflict mode to avoid library
//	compatibility. Native JS is always allowed.
//
/////////////////////////////////////////////////////////////////

if (!jq) {
	var jq = $;
}

jQuery(document).ready(function(jq) {
	var $ = jq,
		el = $('.super-group-menu>ul');

	// For responsive (e.g., mobile) menus
	//
	// This runs through the menu and generates a
	// <select> list of all menu items, then adds
	// an onChange event to redirect the page to
	// whatever option is selected.
	if (el.length) {
		el.addClass('js');

		var select = $("<select />").on('change', function() {
			window.location = $(this).find("option:selected").val();
		});

		$("<option />", {
			"value"   : "",
			"text"    : "Select ..." //el.attr('data-label')
		}).appendTo(select);

		el.find("a").each(function() {
			var elm = $(this),
				prfx = '';

			if (elm.hasClass('alrt')) {
				return;
			}

			if ($(elm.parent().parent()).hasClass('tab-options')) {
				prfx = '- ';
			}

			var opts = {
				"value"   : elm.attr("href"),
				"text"    : prfx + elm.text()
			};
			if ($(elm.parent()).hasClass('active')) {
				opts.selected = 'selected';
			}
			$("<option />", opts).appendTo(select);
		});

		var li = $("<li />").addClass('option-select');

		select.appendTo(li);
		li.appendTo(el);
	}

	/*
		Enter custom JS code here.
	*/

	/* Fix content for sticky group announcements and respond to resizing of menu. */
	var $scontainer = $(".scontainer");
	var $menuWrap = $(".super-group-menu-wrap");
	var $contentWrap = $(".super-group-content-wrap");
	var $sidebarWrap = $("#sidebar-wrapper");
	var $moreMenu = $('.more-menu');
	var $sidebarNav = $('.sidebar-nav');
	var $moreLinks = $('.more-links');

	// Make sure content is at least as large as sidebar size.
	$contentWrap.css("min-height", $sidebarWrap.outerHeight(true) + "px");

	$scontainer.css("margin-top", $menuWrap.css("height"));
	$contentWrap.css("margin-top", $scontainer.css("height"));
  	$menuWrap.css("margin-bottom", -1 * parseFloat($menuWrap.height()) + "px");
  	$contentWrap.css("padding-top", $menuWrap.height());
	new ResizeSensor(jQuery('.super-group-menu-wrap'), function() {
		$scontainer.css("margin-top", $menuWrap.css("height"));
		$contentWrap.css("margin-top", $scontainer.css("height"));
	  	$menuWrap.css("margin-bottom", -1 * parseFloat($menuWrap.height()) + "px");
	  	$contentWrap.css("padding-top", $menuWrap.height());
	});

	/* Smoothly readjust content after closing of announcements */
	$('.announcement .close').on('click', function() {
		$contentWrap.animate({marginTop: '-=' + $(this).parent().parent().outerHeight() + 'px'});
	});

	/* Sticky navbar */
	/* https://teamtreehouse.com/community/forum-tip-create-a-sticky-navigation-with-css-and-jquery-2 */
	//
	// Bug in login - had to comment out the following line
	//		$('#username, #password').placeholder();
	// in the file /www/dev/core/components/com_users/site/assets/js/login.js
	// to get it to work.

	var $headerId = $(".header-id");
	var $footerWrap = $(".super-group-footer-wrap");
	var poweredBy = document.getElementsByClassName("poweredby")[0];

	var scrollTop = 0;
	var bannerHeight = $(".super-group-header-overlay").height();
	var barHeight = $(".super-group-bar").height();

	var windowTop = 0;
	var startBarFade = 0;
	var pushAndPullSidebar = false;
	pushingDown = pushingUp = false;

	$(window).on("resize scroll", function() {
		windowTop = $(this).scrollTop();

		if (windowTop > scrollTop) {
			scrollingDown = true;
		} else {
			scrollingDown = false;
		}
		scrollTop = windowTop;

		// Fade effect for "poweredby QUBES"
		startBarFade = bannerHeight - barHeight;
		if (windowTop > startBarFade) {
			poweredBy.style["opacity"] = Math.max(1 - (4/startBarFade)*(windowTop-startBarFade), 0);
			poweredBy.style["cursor"] = "default";
			poweredBy.style["pointerEvents"] = "none";
		} else {
			poweredBy.style["opacity"] = 1.0;
			poweredBy.style["cursor"] = "inherit";	// Doesn't reset properly on Firefox
			poweredBy.style["pointerEvents"] = "inherit";
		}

		// Replace "poweredby QUBES" with group logo and title
		if (windowTop > bannerHeight - (barHeight/2)) {
			$headerId.addClass("header-id-scrolled");

		} else {
			$headerId.removeClass("header-id-scrolled");
		}

		// if ($headerId.hasClass('header-id-scrolled')) {
		// 	$('.header-id > a > span').addClass('hide');
		//
		// } else {
		// 	$('.header-id > a > span').removeClass('hide');
		// }

		if ($headerId.hasClass('header-id-scrolled')) {
			$headerId.css({'z-index': 1000, 'background-size': '0 0', 'width': 'calc(100% - 189px)', 'left': '20px'});
			$('.header-id > a > img').removeClass('hide');
			$('.header-id > a > span').removeClass('hide');
		} else {
			$headerId.css({'z-index': 0, 'background-size': 'contain', 'width': '', 'left': '0'});
			$('.header-id > a > img').addClass('hide');
			$('.header-id > a > span').addClass('hide');
		}

		// Fix menu directly under QUBES navbar
		if (windowTop > bannerHeight) {
			$menuWrap.addClass("super-group-menu-scrolled");
		} else {
			$menuWrap.removeClass("super-group-menu-scrolled");
		}
	});


	// Add class to the main navigation and remove the select dropdown
	$('.super-group-menu > ul.cf.js').addClass('visible-links');

	// Move group menu items to .super-group-menu then remove ul
	$('#group-menu > li').each(function() {
		$(this).appendTo('.visible-links');
	});

	$('#group-menu').remove();
	$('.visible-links .option-select').remove();

	// Make parent menu item as the first menu item in the submenu
	$('.visible-links > li').each(function() {
		if ($(this).children('ul').length) {
			var $subMenu = $(this).find('ul'),
					$parentLinkText = $(this).children('a').text();

			$subMenu.prepend('<li></li>');
			$(this).children('a').prependTo($subMenu.children().first('li'));
			$(this).addClass('menuItem').prepend('<button aria-label="menu item" aria-haspopup="true" aria-expanded="false">' + $parentLinkText + '</button');

		} else {
			// do nothing
		}

		//Check if meta exists
		if ($(this).children().hasClass('meta')) {
			$(this).css('position', 'relative');
		}
	});

	$('.menuItem > button').click(function(e) {
		var $menuItem = $(this).parent(),
				$menuBtn = $(this);

		$menuItem.find('ul').toggleClass('subMenuExpand');

		if ($menuItem.find('ul').hasClass('subMenuExpand')) {
			$menuBtn.attr('aria-expanded', 'true');
		} else {
			$menuBtn.attr('aria-expanded', 'false');
		}

		$('.menuItem').not($menuItem).find('ul').removeClass('subMenuExpand');
		$('.menuItem > button').not($menuBtn).attr('aria-expanded', 'false');
		e.stopPropagation();
	});

	//Close submenu when clicking elsewhere
	$(document).click(function(e) {
		if ($(e.target).closest('a').length === 0) {
			$('.menuItem ul').removeClass('subMenuExpand');
			$('.menuItem > button').attr('aria-expanded', 'false');
		}
	});

	//Close submenu on escape
	$(document).keyup(function(e) {
		if (e.which == 27) {
			$(document).click();
			$('.menuItem').children().blur();
		}
	});

	var $nav = $('.super-group-menu');
	var $btn = $('.super-group-menu .hidden-menu');
	var $vlinks = $('.super-group-menu .visible-links');
	var $totalMenuWidth = 0;

	// Get total width of menu before resizing
	$vlinks.children().each(function() {
		$totalMenuWidth +=$(this).outerWidth(true);
	});

	$(window).on('load resize', function() {
		var $availableSpace;

		// Get measurements
		$availableSpace = $nav.width() - 40;
		$menuWidth = 0;

		$vlinks.children().each(function() {
			$menuWidth +=$(this).outerWidth(true);
		});

		// Make sure mobile menu is not open
		if (!$('.super-group-menu-wrap').hasClass('menuExpand')) {

			// If menu overflows the available space, change to mobile menu
			if ($menuWidth > $availableSpace) {
				$vlinks.addClass('hidden');
				$btn.removeClass('hidden');
				$nav.css('overflow', 'hidden');
			} else {
				$vlinks.removeClass('hidden');
				$btn.addClass('hidden');
				$nav.css('overflow', 'initial');
			}
		} else {

			// Go back to fullsize if menu fits in the window
			if ($totalMenuWidth < $(window).width()) {
				$vlinks.removeClass('hidden');
				$btn.addClass('hidden');
				$nav.css('overflow', 'initial');
				$('.super-group-menu-wrap').removeClass('menuExpand');
			}
		}

		if (!$('.super-group-menu-wrap').hasClass('menuExpand')) {
			$('body, html').removeClass('no-scroll');
		}
	});

	$('.super-group-menu > button').click(function() {
		$('.visible-links').toggleClass('hidden');
		$('.super-group-menu-wrap').toggleClass('menuExpand');
		if ($('.super-group-menu-wrap').hasClass('menuExpand')) {
			$('.super-group-menu > button').attr('aria-expanded', 'true');
			$('.visible-links').find('ul').addClass('subMenuExpand');
			$('body, html').addClass('no-scroll');
		} else {
			$('.super-group-menu > button').attr('aria-expanded', 'false');
			$('.visible-links').find('ul').removeClass('subMenuExpand');
			$('body, html').removeClass('no-scroll');
		}
	});
});
