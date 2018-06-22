/* ======== js/browsecontroller.js ======== */
// <rdar://problem/9715390> Flamingo remote help should work around Help Viewer's "%23" search results bug
if (location.search.match(/%23/)) {
	location.replace(location.href.replace("%23", "#"));
}

var browseController = {
	"name": "browseController",
	currentID: null
};

(function () {
	function createNavigationForHierarchyList (list, level) {
		var $ul = $("<ul>").append($.map(list, function(item) {
			return createNavigationForHierarchyItem(item, level);
		}));
		
		return $ul;
	}
	
	// recursive function to generate navigation lists
	function createNavigationForHierarchyItem (item, level) {
		// get the content object
		var contentObject = item.content;
		
		// if the navigation is set to false, don't show it (or its children)
		if (contentObject && contentObject.navigation == "false") {
			return;
		}
		
		// get the children of this item
		var children = item.children || [];
		
		// create the list item and link
		var $li = $("<li>"),
			$link = $("<a>").appendTo($li);
			
		// add an id if available
		if (item.id) {
			$li.attr("id", "navigation-" + item.id);
		}
		
		// add a class, if any
		if (item["class"]) {
			$link.addClass(item["class"]);
		}
		
		// if we already have a name and href, just use those and return
		if (item.name && item.href) {
			$link.attr("href", item.href);
			$("<span>", { "class": "name", "html": item.name }).appendTo($link);
			return $li.get();
		}
	
		// find out if this item should have children
		var itemHasChildren = (0 != children.length);
		// for top level items with just one child, consolidate the item
		if (itemHasChildren && 1 == children.length) {
			itemHasChildren = false;
		}
		// this is a leaf node level, don't show children
		if (1 == contentObject.leafnode) {
			itemHasChildren = false
		}
		
		// this item is not a leaf node
		if (itemHasChildren) {
			$li.addClass("closed hasChildren");
		}
		
		if (itemHasChildren) {
			$link.click(function () { // TODO move to a delegate method
				$(this).parents("li:first").toggleClass("closed");
			});
		} else {
			$link.attr("href", "#" + item.id);
		}
		
		// find out what this button's alternative name style is
		var button_id = dataController.getButtonIDForObjectWithID(item.id);
		var button_content = dataController.getContentObjectForID(button_id);
		var name_style = button_content['alternativeNameStyle'];
		
		// show the chapter icon
		var iconPath = dataController.getIconForObjectWithID(item.id);
		if (iconPath) {
			$link.css("background-image", "url(" + iconPath + ")");
			$li.addClass("hasIcon alternativeName"+name_style);
		}
		
		// find the item name
		var name = dataController.getNameForObjectWithID(item.id);
		var alt_name = dataController.getAlternativeNameForObjectWithID(item.id);
		if (name_style == "prefix") {
			// add in the alternative name element
			$("<span>", { "class": "alternativename", "html": alt_name }).appendTo($link);
		} else if (name_style == "replace") {
			name = alt_name;
		}
		// add the name element
		$("<span>", { "class": "name", "html": name }).appendTo($link);
		
		// create navigation items for the children (even if they are the only item)
		if (children.length) {
			createNavigationForHierarchyList(children, level+1).appendTo($li);
		}
		
		if (contentObject.leafnode == 1 || children.length == 1) {
			// if this is a 'leafnode' then the children are nested (displayed inline): hide them
			$li.addClass("hiddenChild").find("ul > li").hide();
// <rdar://problem/9036079> add arrow key navigation for TOC items that have hidden single child topic
// 		} else if (children.length == 1) {
// 			// if there is only one child, just return it directly
// 			return $li.find("ul > li").get();
		}
		
		// return DOM node, not jQuery object
		return $li.get();
	}
	
	browseController.createView = function(targetID) {
		// create wrapper div
		var wrapperDiv = $("<div>");
		
		// create a navigation div
		var navigationDiv = $("<div>", { id: "navigationView" }).appendTo(wrapperDiv);
		
		// add search interface
		searchController.addInterfaceElements(navigationDiv);
		
		// get the children for this button
		var buttonChildren = dataController.getHierarchyObjectForID(targetID).children;
		
		// if there is only one child, show it as the chapter
		if (buttonChildren.length == 1) {
			buttonChildren = dataController.getHierarchyObjectForID(buttonChildren[0].id).children;
		}
		
		createNavigationForHierarchyList(buttonChildren, 0).appendTo(navigationDiv);
		
		// add the content view controller
		contentViewController.createView(browseController).appendTo(wrapperDiv);
		
		return wrapperDiv;
	};
	
	browseController.closeAllNavigationItems = function () {
		// get all items with class name closed
		$(".browse #navigationView li").addClass("closed");
	};
	
	browseController.navigateToItemWithID = function(targetID) {
		// if we're already showing this item, don't do anything new
		if (browseController.currentID == targetID) {
			return;
		}
		
		// if this item is a child of an object that is a leaf node, open that object instead
		$.each(dataController.pathToID(targetID).reverse(), function(index, item) {
			if( item.content.leafnode ) {
				targetID = item.id;
				return;
			}
		});
						
		// otherwise, save this ID
		browseController.currentID = targetID;
		
		// deselect all other elements in the navigation
		$(".browse #navigationView li").removeClass("selected");
		
		// select this element in the navigation and make sure that all parent are open
		var $navitem = $(".browse #navigationView #navigation-" + targetID);
		$navitem.addClass("selected").parents("li").removeClass("closed");
		if ($navitem.is(":hidden")) {
			$navitem.parents("li:first").addClass("selected");
		}
			
		// tell the contentViewController to show the content
		contentViewController.navigateToItemWithID(targetID, browseController);
	}

})();

/* ======== js/landingcontroller.js ======== */
var landingController = {
	"name": "landingController",
	currentID: null
};

landingController.createView = function(targetID) {
	var wrapperDiv = browseController.createView(targetID);
	
	// initially hide the navigation: it will be shown again if necessary
	wrapperDiv.find("#navigationView").hide();
	
	// if the right-side submenu list is longer than the left-side menu, items further down will get drawn behind
	var topLevelItems = wrapperDiv.find("#navigationView > ul > li.hasChildren");
	// unbind the click event which toggled the closed class
	topLevelItems.unbind("click").addClass("closed");
	// remove the closed class and set the min-height on the top-level UL to the size of the selected child
	topLevelItems.click(function () {
		topLevelItems.addClass("closed");
		var height = $(this).removeClass("closed").children("ul:first").height();
		$(this).parents("ul").css("min-height", height);
	});
	// wait for the element to be added to the DOM, then click the "open" one to trigger initial size
	setTimeout(function () {
		topLevelItems.not(".closed").click();
	}, 0);

// TODO would be nice to get the howdy page HTML from a method on contentViewController
// TODO move howdy page into browseController.createView()
	// get the howdy page content
	var content = dataController.getContentObjectForID(targetID);
	var howdyPageID = content ? content.howdyPageID : null;
	var howdyPageContent = dataController.getContentForObjectWithID(howdyPageID) || $("<div>");
	
	// create a div for the default page at the top of the page
	var howdyPageDiv = $(howdyPageContent).addClass("howdy")
		.prependTo($("#navigationView", wrapperDiv));
	
	// set up the marquee on the howdy page
	landingController.addMarquee(howdyPageDiv);
	
	// add the new name
	var targetElementTitle = dataController.getNameForObjectWithID(howdyPageID);
	$("<div>", { "class": "contentName", "text": targetElementTitle }).prependTo(howdyPageDiv);
	document.title = dataController.settings["Title"] + ": " + targetElementTitle;
	
	// add the book icon
	var $contentIcon = $("<div>", { "class": "contentIcon" })
		.prependTo(howdyPageDiv)
		.append(contentViewController.bookIcon());
	
	// add the copyright tagline content
	var copyrightTaglineContent = dataController.getContentForObjectWithID("COPYRIGHT_TAGLINE");
	if (copyrightTaglineContent) {
		// add an li to the bottom of the navigation
		$("<div>", { "class": "copyrightTagline", html: copyrightTaglineContent })
			.appendTo($("#navigationView", wrapperDiv));
	}
	
	// pull the bottom anchor out of the howdy page and move it beneath the navigation
	howdyPageDiv.find(".linkTagline").appendTo($("#navigationView", wrapperDiv));
	
	// give topic-heads hrefs so they'll re-open when returning to the navigation page
	$(wrapperDiv).find("li.hasChildren").each(function () {
		var id = this.id || "",
			content_id = id.replace(/navigation-/, "");
		if (content_id) {
			$(this).children("a").attr("href", "#" + content_id);
		}
	});
	
// LoL TODO re-use the code already in the contentviewcontroller for this
	// for any .movie links in the navigation, verify that the content is available
	// and change the link to open the movie appropriately
	$(wrapperDiv).find("a.movie").each(function () {
		var $link = $(this)
			href = $link.attr("href"),
			movieURL = dataController.getMovieURLFromURLParam(href);
		
		if (movieURL) {
			// replace the href with a javascript function for all links below
			if ("HelpViewer" in window && HelpViewer.availableBooks) {
				$link.attr({ "href": movieURL, "target": "hv_overlay_small" });
			} else {
				$link.attr("href", "#").click(function (e) {
					movieLightboxController.showLightboxWithURL(movieURL);
					e.preventDefault();
				});
			}
		} else {
			// we don't have a movie to show, remove the link from the DOM
			$link.remove();
		}
	});
	
	return wrapperDiv;
};

landingController.addMarquee = function($container) {
	var $marquee = $(".marquee", $container),
		image = $("img", $marquee).remove().attr("src"),
		title = $(".title", $marquee).remove().text(),
		bgstyle = "url(" + image + ") 0 0 no-repeat";
	
	if ($marquee.length) {
		$container.addClass("hasMarquee");
	}
	
	$("<p>", { text: title }).appendTo($marquee);
	$("<p>", { "class": "spacer" }).prependTo($marquee).clone().appendTo($marquee);
	
	if ($marquee.hasClass("helpcenter")) {
		// help center gets an additional background gradient
		bgstyle += ", -webkit-gradient(linear, 0 0, 0 100%, from(#fff), to(#ccc))";
	}
	$marquee.css("background", bgstyle);
}

landingController.navigateToItemWithID = function(targetID) {

	// if we're already showing this item, don't do anything new
	if (landingController.currentID == targetID) {
		return;
	}
	
	// find out what the howdy page is for this button
	var buttonID = dataController.getButtonIDForObjectWithID(targetID);
	var buttonContent = dataController.getContentObjectForID(buttonID);
	var howdyPageID = buttonContent ? buttonContent["howdyPageID"] : null;
	
	// if this is the howdy page
	if( howdyPageID == targetID ) {
		
		// go to the very first child
		targetID = dataController.getChildrenIDsForObjectWithID(buttonID)[0];
	}
	
	// otherwise, save this ID
	landingController.currentID = targetID;
	
	// get the path to this ID
	var pathToTargetID = dataController.pathToID(targetID);
	
	// this is a navigation object
	if( 2 == pathToTargetID.length ) {
		// add the new name
		var targetElementTitle = dataController.getNameForObjectWithID(targetID);
		var bookTitle = dataController.settings["Title"];
		document.title = bookTitle + (bookTitle != targetElementTitle ? ": " + targetElementTitle : "");
		
		// show the navigation and hide the content
		$("#navigationView").show();
		$(".landingController .contentView").hide();
		
		// remove the selection from the object
		$("#navigationView .hasChildren").addClass("closed");
		
		// select the object
		var $objectToMakeSelected = $("#navigation-" + targetID);
		
		if ($objectToMakeSelected.length < 1) {
			// the specified object isn't in the navigation, select the first object in the list
			$objectToMakeSelected = $("#navigationView li:first");
		}
		
		// select this object
		$objectToMakeSelected.removeClass("closed");
	}
	
	// this is a content object
	else {
	
		// hide the navigation and show the content
		$("#navigationView").hide();
		$(".landingController .contentView").show();
		
		// tell the content view to show the right content
		contentViewController.navigateToItemWithID(targetID, browseController);
	}
		
	// in MacHelp, remove the breadcrumb in Help Viewer
	if ("HelpViewer" in window
			&& "currentScope" in HelpViewer
			&& "setBreadcrumbBookTitleWithAnchor" in HelpViewer
			&& HelpViewer.currentScope() === "com.apple.machelp") {
		HelpViewer.setBreadcrumbBookTitleWithAnchor("", null);
	}
		
	// scroll the view to the top
	$(".contentView").get(0).scrollTop = 0;
};

landingController.createHelpViewerBookLink = function(helpViewerBook) {
	// get the book id
	var helpViewerBookID = helpViewerBook.bookID();
	
	// create the link
	var helpViewerBookLink = $("<a>", { "href": "help:openbook='" + helpViewerBookID + "'", "class": "book" });	
	
	// get the right URL for the icon
	var helpViewerBookIconSrc = "x-help-icon://" + encodeURIComponent(helpViewerBookID);
	
	if( helpViewerBookIconSrc.length-".help".length == helpViewerBookIconSrc.indexOf(".help") ) {
		helpViewerBookIconSrc = helpViewerBookIconSrc.substring(0, helpViewerBookIconSrc.length-5); //chop off the .help
	}
	
	// add in the icon and title
	$("<img>", { "src": helpViewerBookIconSrc }).appendTo(helpViewerBookLink);
	$("<div>", { "text": helpViewerBook.title() }).appendTo(helpViewerBookLink);
	
	// return the link
	return helpViewerBookLink;
};

/* ======== js/applicationlistcontroller.js ======== */
var applicationListController = {
	currentID: null,
	name: ""
};

applicationListController.createView = function(targetID) {
	var $wrapper = $("<div>"),
		recentTitle = localizationController.localizedUIString("Recent applications"),
		appleTitle = localizationController.localizedUIString("Apple applications"),
		otherTitle = localizationController.localizedUIString("Other applications"),
		showAll = localizationController.localizedUIString("Show all"),
		hideAll = localizationController.localizedUIString("Show less"),
		toggle = function () {
			// find the div to toggle and the new text value
			var $container = $(this).parents(".applist"),
				newText = $container.hasClass("closed") ? hideAll : showAll;
			
			// toggle the class and text
			$container.toggleClass("closed").find(".showHide").text(newText);
		};
	
	if ("HelpViewer" in window && "availableBooks" in HelpViewer) {
		// create a container for listing applictions
		var $recent = $("<div>", { "class": "applist closed" }).appendTo($wrapper);
		
		// add a title
		$("<div>", { "class": "title" }).appendTo($recent);
		// add the "show all" links
		$("<a>", { "class": "showHide", "text": showAll, "click": toggle }).appendTo($recent);
		// add the clearing divs
		$("<div>", { "class": "clear" }).appendTo($recent);
		// add the first twelve divs
		$("<div>", { "class": "firstTwelve" }).appendTo($recent);
		// add the more than twelve divs
		$("<div>", { "class": "moreThanTwelve" }).appendTo($recent);
		
		// create copies to hold Apple and non-Apple apps
		var $apple = $recent.clone(true, true).appendTo($wrapper);
		var $other = $recent.clone(true, true).appendTo($wrapper);
		
		// set the titles
		$recent.find(".title").text(recentTitle);
		$apple.find(".title").text(appleTitle);
		$other.find(".title").text(otherTitle);
		
		// iterate over the book list from help viewer and append them to the lists
		var recentHelpViewerBooks = HelpViewer.recentApplicationList(),
			recentListCount = 0;
		$.each(HelpViewer.availableBooks(), function (index, helpViewerBook) {
			// get the book id
			var bookid = helpViewerBook.bookID();
			
			// do not show the Help Center or Mac Help books in this list
			if (bookid === "com.apple.HelpCenter.help" || bookid === "com.apple.machelp") {
				return;
			}
			
			// figure out what outer div to add this to
			var $container = bookid.match(/^com.apple./) ? $apple : $other;
			
			// figure out if this is in the first twelve or not
			var innerDiv = $container.children(".firstTwelve").children().length < 10 ? $container.children(".firstTwelve") : $container.children(".moreThanTwelve");
			
			// create and append the item
			var bookLink = landingController.createHelpViewerBookLink(helpViewerBook);
			bookLink.appendTo(innerDiv);
			
			// figure out if we should append this to the Recent list
			// have to iterate over the whole list to do a case-insensitive match
			var matched_book;
			$.each(recentHelpViewerBooks, function () {
				if (recentListCount >= 10) {
					return false;
				}
				if (bookid.match(new RegExp(this, "i"))) {
					matched_book = this;
					recentListCount++;
					bookLink.clone().appendTo($recent);
					return false;
				}
			});
			if (matched_book) {
				delete(recentHelpViewerBooks[matched_book]);
			}
		});
		
		$([$recent, $apple, $other]).each(function () {
			// if the section has fewer than twelve items, remove the "See all"
			if ($(".moreThanTwelve", this).children().length == 0) {
				$(".showHide", this).remove();
			}
			
			// if the section has no items, remove the whole thing
			if ($(".book", this).length == 0) {
				$(this).remove();
				return;
			}
			
			// add in the empty boxes at the end, so we come out to a total number that's evenly divisible by 6
			var $lastBook = $(".book:last", this);
			var $parent = $lastBook.parent(); // either .firstTwelve or .moreThanTwelve
			
			// add children until we have something divisible by 6
			while ($parent.find(".book").length % 5 != 0) {
				$("<a>", { "class": "book" }).appendTo($parent);
			}
		});
	}
	
	return $wrapper;
};

/* ======== js/contentviewcontroller.js ======== */
var contentViewController = {
	"name": "contentViewController",
	currentID: null
};

(function () {
	// take divs containing a movie reference, fetch the movie URL, and show it if available
	function processMovieLinks() {
		var $movieDiv = $(this),
			href = $movieDiv.find("a:first").attr("href"),
			movieURL = dataController.getMovieURLFromURLParam(href);
		
		if (movieURL) {
			// add in a new link... will be styled to have an icon
			var linkAppleWebImageLink = $("<a>").prependTo($movieDiv);
			
			// replace the href with a javascript function for all links below
			if ("HelpViewer" in window && HelpViewer.availableBooks) {
				$movieDiv.find("a").attr({ "href": movieURL, "target": "hv_overlay_small" });
			} else {
				$movieDiv.find("a").attr("href", "#").click(function (e) {
					movieLightboxController.showLightboxWithURL(movieURL);
					e.preventDefault();
				});
			}
		} else {
			// we don't have a URL, remove the movie from the DOM
			$movieDiv.remove();
		}
	}
	
	contentViewController.createView = function (sender) {
		// create wrapper div
		var $wrapper = $("<div>", { "id": "contentView-" + sender.name, "class": "contentView" });
		
		// create a content wrapper div
		$("<div>", { "class": "contentWrapper" }).appendTo($wrapper);
		
		return $wrapper;
	};
	
	// event handler for (DITA) lightbox links
	$(".contentView a.lightbox").live("click", function (e) {
		e.preventDefault();

		var id = this.href.match(/[^#]*$/);
		if (id) {
			lightboxController.navigateToItemWithID(id);
		}
	});
	
	// click handler for same-folder .html links, which are assumed to be unresolved DITA references
	// (this is probably not a great assumption, but Open Toolkit does not otherwise mark them
	$(".contentView a[href*='.html']").live("click", function (e) {
		// ignore offsite links or links that are not in the same directory
		var href = $(this).attr("href"), newhref;
		if (href.match(/^http/) || href.match(/\//)) {
			return;
		}
		
		e.preventDefault();
		// if a hash is present, use it; otherwise use the filename
		newhref = href.replace(/^.*(#.*)$/, "$1") || href.replace(/^(.*)\.html#?.*$/, "#$1");
		location.hash = newhref;
	});
	
	contentViewController.navigateToItemWithID = function(targetID, sender) {
		// containers that get updated with content or class names
		var $contentView = $("#contentView-" + sender.name).attr("class", "contentView").empty();
		
		// if this item is a child of an object that is a leaf node, open that object instead
		$.each(dataController.pathToID(targetID).reverse(), function(index, item) {
			if (item.content.leafnode) {
				targetID = item.id;
				return;
			}
		});
		
		// if this item has no content and isn't in the navigation, go to the howdy page
		var htmlcontent = dataController.getContentForObjectWithID(targetID),
			$navItem = $("#navigation-" + targetID);
		if (!htmlcontent && $navItem.length == 0) {
			var buttonID = dataController.getButtonIDForObjectWithID(targetID);
			var buttonContent = dataController.getContentObjectForID(buttonID);
			
			targetID = buttonContent ? buttonContent["howdyPageID"] : targetID;
		}
		
		// otherwise, save this ID
		contentViewController.currentID = targetID;
		
		// find the content
		var content_html = dataController.getContentForObjectWithID(targetID);
		
		// get the content object
		var targetIDContentObject = dataController.getContentObjectForID(targetID);
		
		// if this item only has one child and isn't a leaf node, get it's content instead
// LoL TODO when building the nav (browseController), the child should just replace its parent rather than being hidden as a child
		var itemChildren = dataController.getChildrenIDsForObjectWithID(targetID);
		if (1 == itemChildren.length && !targetIDContentObject.leafnode) {
			var childObjectContent = dataController.getContentForObjectWithID(itemChildren[0]);
			if (childObjectContent) {
				content_html = childObjectContent;
			}
		}
		
		// make the content into a jQuery object, using an empty div if unavailable
		var $targetIDContent = $(content_html || "<div>");
		
		// add the new name
		var targetElementTitle = dataController.getNameForObjectWithID(targetID),
			bookTitle = dataController.settings["Title"];
		// filter the title through a textarea in order to process entities
		targetElementTitle = $("<textarea>", { html: targetElementTitle }).text();
		
		$("<div>", { "class": "contentName", "html": targetElementTitle }).prependTo($targetIDContent);
		// show "Book Title: Topic Title" unless they are the same
		document.title = bookTitle + (targetElementTitle != bookTitle ? ": " + targetElementTitle : "");
		
		// add the book icon
		var $topicIcon = contentViewController.bookIcon(),
			custom_icon = $targetIDContent.find(".title .category-art").attr("src");
		if (custom_icon) {
			$topicIcon.attr("src", custom_icon);
		}
		$("<div>", { "class": "contentIcon" })
			.prependTo($targetIDContent)
			.append($topicIcon);
		
		// set the Help Viewer breadcrumbs title for this object
		controller.setHelpViewerBreadcrumbTitleForObjectWithID(targetID);
		
		// if this is a leaf node, show all of the nested children
		if (targetIDContentObject && targetIDContentObject.leafnode) {
			function addNestedChildForID (id, $parentDiv) {
				// find all of the children
				$.each(dataController.getChildrenIDsForObjectWithID(id), function (index, childID) {
					// open the div
					var $child = $("<div>", { "class": "NestedChild" }).appendTo($parentDiv);
					
					// add the child name
					$("<div>", {
						"class": "NestedChildName",
						html: dataController.getNameForObjectWithID(childID)
					}).appendTo($child);
					
					// add the child content
					var $content = $("<div>", {
						"class": "NestedChildContent",
						html: dataController.getContentForObjectWithID(childID)
					}).appendTo($child);
					
					// recursively add children
					addNestedChildForID(childID, $content);
				});
			}
			
			addNestedChildForID(targetID, $targetIDContent);
		}
		
		// the content isn't available
		if (!content_html) {
			$contentView.addClass("contentNotAvailableMessage");
			$targetIDContent.append( dataController.getContentNotAvailableMessageForID(targetID) );
		}
		
		// add the new content
		$contentView.append($targetIDContent);
		
		// only add other classes if the content was found
		if (!content_html) {
			// if the content was not found, we're done: we don't need to scan for tasks/movies, or add the copyright
			$contentView.get(0).scrollTop = 0;
			return;
		} else {
			// if this content is a howdy page, add a special class
			$.each(dataController.getTopHierearchyObjects(), function (index, hierarchyItem) {
				var contentItem = dataController.getContentObjectForID(hierarchyItem.id);
				
				if (contentItem.howdyPageID == targetID) {
					$contentView.addClass("howdy");
					
					// create a table row for the howdy content
					var contentRow = $("<div>", { "class": "contentRow" }).appendTo($targetIDContent);
					
					// create a table cell for the howdy content
					var contentCell = $("<div>", { "class": "contentCell" }).appendTo(contentRow);
					
					// create a table row for the howdy footer
					var footerRow = $("<div>", { "class": "footer contentRow" }).appendTo($targetIDContent);
					
					// create a table cell for the howdy footer
					var footerCell = $("<div>", { "class": "contentCell" }).appendTo(footerRow);
					
					
					// loop through all of the elements already in the content and move them into the content row
					// LoL TODO this might be easier to do above, using .wrapInner()
					$targetIDContent.children().not(".contentRow").appendTo(contentCell);
					
					// in Browsers, add in the localization pull down
					if (!$.browser.helpviewer) {
						var localizationLink = localizationController.getLocalizationLink();
						if  (localizationLink) {
							footerCell.append(localizationLink);
						}
					}
				}
			});
		}
		
		// check if we should add a feedback link
		if (dataController.settings["ShowFeedbackLink"]) {
			// create the Feedback div
			var feedbackDiv = $("<div>", { "class": "Feedback" }).appendTo($targetIDContent);
			
			// create the text span
			var feedbackTextSpan = $("<span>", {
				"class": "LinkFeedback",
				text: localizationController.localizedUIString("Was this page helpful?")
			}).appendTo(feedbackDiv);
			
			// create the link
			var feedbackParams = $.param({
				bookID: dataController.settings["Title"],
				topicTitle: dataController.getNameForObjectWithID(targetID),
				appVersion: dataController.settings["AppVersion"] || "",
				build: dataController.settings["BuildVersion"] || "",
				source: $.browser.helpviewer ? "helpviewer" : "browser"
			});
			var feedbackLink = $("<a>", {
				text: localizationController.localizedUIString("Send feedback."),
				href: "http://help.apple.com/feedbackR1/English/pgs/fdbck_form.php?" + feedbackParams,
				target: "_new"
			}).appendTo(feedbackDiv);
		}
		
		// fix hidpi images in Firefox/IE
		if (($.browser.msie || $.browser.mozilla) && $("html").is(".HighResolutionGraphics")) {
			$contentView.find("img").load(function (e) {
				var width = this.width/2, height = this.height/2;
				if ($(this).is(".contentIcon *")) {
					width = this.width;
					height = this.height;
				}
				$(this)
					.css("zoom", "1") // set zoom first, to un-stretch it in IE
					.css({ "height": height, "width": width });
			});
		}
		
		// LoL TODO this could be done more cheaply as a click() delegate
		// loop through all links
		$targetIDContent.find("a").each(function () {
			var $link = $(this);
			var click = $link.get(0).attributes["onclick"] ? $link.get(0).attributes["onclick"].value : "";
			var href = $link.attr("href") || "";
			
			// leave the contentNotAvailableMessageLink alone
			if (href == "#contentNotAvailableMessageLink") {
				return;
			}
			
			if (click.match("openCrossReference")) {
				// openCrossReference links
				var targetID = click.match(/^.*'(.*)'.*$/).pop();
				
				// find the LeafNode value for the target topic
				var targetLeafNode = 0;
				var targetContent = dataController.getContentObjectForID(targetID);
				
				if( targetContent &&
					targetContent["leafnode"] ) {
					targetLeafNode = targetContent["leafnode"];
				}
				
				// if there are children content objects, remove the link and replace it with it's children
				if (dataController.getChildrenIDsForObjectWithID(targetID).length &&
					!targetLeafNode) {
					$link.contents().unwrap();
				}
			} else if (href.indexOf("http://") == 0  || 
						href.indexOf("https://") == 0 ) {
						
				// external http and https links: set the target to open in a new window
				$link.attr("target", "_blank");
			}
		});
		
		// loop through all tasks
		var $tasks = $targetIDContent.find(".Task, .task");
		$tasks.each(function () {
			var $task = $(this),
				$show_hide = $("<span>", { "class": "showHideSteps", text: "" }),
				$link = $("<a>").addClass("taskToggle").append($show_hide).click(function (e) {
					// toggle the class
					var hidden = $(this).parent(".TaskWrapper:first, .task:first").toggleClass("closed").hasClass("closed");
					
					// change the text of the span
					$show_hide.text(localizationController.localizedUIString(hidden ? "Show" : "Hide"));
				}).click(); // trigger the click once to create the show/hide text
			
			if ($task.is(".Task")) { // upper-case .Task == APD schema
				$task
					.wrap($("<div>", { "class": "TaskWrapper" })) // wrap the task
					.find(".Name:first").appendTo($link); // move the name into the link
			
				// add the open/close affordance
				$link.insertBefore($task);
			} else if ($task.is(".task")) { // lower-case .task == DITA
				// add the open/close affordance
				$link.prependTo($task);
				
				// find and remove the h2
				var $title = $task.find(".title:first").remove();
				$link
					.addClass($title.attr("class"))
					.append($title.html());
			}
			
			// if are multiple tasks, toggle again to close them up the task
			if ($tasks.length > 1) {
				$link.click();
			}
		});
		
		// loop through all .LinkAppleWebMovie for Sweet books, .movie for DITA
		$targetIDContent.find(".LinkAppleWebMovie, .movie").each(processMovieLinks);
		
		// add the copyright tagline content
		var copyrightTaglineContent = dataController.getContentForObjectWithID("COPYRIGHT_TAGLINE");
		if (copyrightTaglineContent) {
			// add an li to the bottom of the navigation
			var copyrightTaglineDiv = $("<div>", { "class": "copyrightTagline", html: copyrightTaglineContent });
			
			// add it to the right place on the howdy page
			var allContentCells = $targetIDContent.find(".contentCell:last");
			if (allContentCells.length) {
				allContentCells.append(copyrightTaglineDiv);
			} else {
				// add it to the bottom of the content
				$targetIDContent.append(copyrightTaglineDiv);
			}
		}
		
		// scroll the view to the top
		$contentView.get(0).scrollTop = 0;
		
		// scroll to the top in iOS
		if ($("html").is(".ios")) {
			window.scrollTo(0, 1);
		}
		
		$contentView.trigger("contentLoaded");
	};
	
	contentViewController.bookIcon = function(sender) {
		var src;
		
		if ("HelpViewer" in window && HelpViewer.currentScope) {
			// in Help Viewer, figure out which book we're in
			var bookid = HelpViewer.currentScope();
			if (bookid) { // will be undefined in Help Center
				// chop off the .help
				bookid = bookid.replace(/\.help$/, "");
				
				// ask HV for the icon
				src = "x-help-icon://" + encodeURIComponent(bookid);
			}
		} else {
			// in the browser add in the category art
			var categoryArtPath = dataController.settings["CategoryArt"];
			if (categoryArtPath) {
				src = controller.contentURL + categoryArtPath;
			}
		}
				
		// add the image to the content icon div
		if (src) {
			return $("<img>", { "class": "bookIcon", "src": src, "alt": "" });
		}
	};
})();

/* ======== js/controller.js ======== */
var controller = {
	previousHash: null,
	currentHash: null,
	contentURL: "",
	queryParams: {}, // query-string params
	HVDesignDefaults: {
		"default": { height: 520, width: 720 },
		"flamingo2": { height: 520, width: 815 }
	}
};

(function () { // closure
	// get the URL params
	if (location.search) {
		$.each(location.search.substring(1).split("&"), function () {
			var key_val = this.split("=");
			controller.queryParams[decodeURIComponent(key_val[0])] = decodeURIComponent(key_val[1]);
		});
	}
	
	// workaround for problem indexing URLs with #topicid... use ?topic=topicid instead
	if (controller.queryParams.topic) {
		var topicID = controller.queryParams.topic,
			url = location.pathname;
		delete controller.queryParams.topic;
		url += $.param(controller.queryParams) ? "?" + $.param(controller.queryParams) : "";
		url += "#" + topicID;
		location.replace(url); // immediately redirect to the #topicid version
	}
	
	// see if an alternate content set has been passed in
	if (controller.queryParams.contentURL) {
		controller.queryParams.contentURL += (controller.queryParams.contentURL.charAt(controller.queryParams.contentURL.length) == "/" ? "" : "/");
		// check whether there is a loadable Info.json file at the passed-in location
		$.ajax({
			type: "HEAD",
			async: false,
			url: controller.queryParams.contentURL + "Info.json",
			success: function () {
				controller.contentURL = controller.queryParams.contentURL;
			},
			error: function () {
				console.log("Could not load " + controller.queryParams.contentURL);
			}
		});
	}
	
	// monkey-patch jQuery to report if we're in helpviewer
	if (navigator.userAgent.match(/Help Viewer/)) {
		$.browser["helpviewer"] = true;
		
		// the print iFrame is not used on Help Viewer, so we can remove it from the DOM
		$("#printiFrame").remove();
	}
	
	$(document).ready(function () {
		// initialize the controller
		controller.init();
		
		if (dataController.settings["FlamingoUpdateURL"]) {
			// try a remote update
			updateController.update();
		} else {
			// show the interface
			controller.showInterface();
		}
	});
	
	controller.init = function () {
		// if we got here, JS is enabled so we can remove the JS-disabled message from the DOM
		$("#javascriptDisabled").remove();
		
		// detect browser and add classes for conditional styles
		var $html = $('html');
		$.each($.browser, function (key) {
			if (key !== "version") {
				$html.addClass(key);
			}
		});
		
		// localize
		localizationController.localizeBrowser(controller.queryParams);
	
		// add the redirector javascript: this is slow, because of the double request
		// but the hEAD request and try/catch prevent any console warnings
		// the loaded script can be used to test user agent and redirect to a different interface
		if (!$.browser.helpviewer && !$.browser.msie) {
			var xhr = new XMLHttpRequest(),
				redir = "../redirect.js";
			try {
				xhr.open("HEAD", redir, false);
				xhr.send();
			} catch (e) {}
			if (xhr.status == 0 || xhr.status == 200) {
				$.getScript(redir);
			}
		}
		
		// load the data
		dataController.loadData();
		
		// set the CSS class name for the design
		var design = dataController.settings["Design"] || "default";
		design = design.toLowerCase();
		$html.addClass(design);
		
		// on Help Viewer, if a (minimum) default size is defined for this design, resize the window
		if ($.browser.helpviewer && design in controller.HVDesignDefaults) {
			var min_size = controller.HVDesignDefaults[design],
				new_width = Math.max(min_size.width, top.outerWidth),
				new_height = Math.max(min_size.height, top.outerHeight);
			top.resizeTo(new_width, new_height);
		}
		
		// set the CSS clas name for High Resolution Graphics
		if (dataController.settings["HighResolutionGraphics"]) {
			$html.addClass('HighResolutionGraphics');
		}
		
		// add right to left class to the body
		var lang = localizationController.language;
		if (lang == "ar" || lang == "he") {
			$html.addClass("RightToLeft");
		}
		
		// add a class if we are on iOS, to remove (un(der)supported) overflow/fixed styles
		if (navigator.userAgent.match(/(iphone|ipad)/i)) {
			$html.addClass("ios");
			var viewport_width = 720; // default
			if (design in controller.HVDesignDefaults) {
				viewport_width = controller.HVDesignDefaults[design].width;
			}
			$("<meta>", { "name": "viewport", "content": "width="+viewport_width }).prependTo("head");
		}
		
		if ($.browser.helpviewer) {
			// in Red Flamingo, tell Help Viewer to enable the Contents button
			controller.enableHelpViewerContentsButton();
		}
	};
	
	controller.toggleNavigation = function(shouldShow) {
		$("html").toggleClass("navigationHidden");
	};
	
	controller.showInterface = function () {
		// create menu wrapper
		var menuWrapperDiv = $("<div>", { id: "menuWrapper" }).appendTo("body");
		
		// create menu wrapper
		var menuDiv = $("<div>", { id: "menu" }).appendTo(menuWrapperDiv);
		
		// create main page container
		var containerDiv = $("<div>", { id: "container" }).appendTo("body");
		
		// show the version number -- frontendVersionNumber is not defined on print page
		if (dataController.settings["ShowVersionNumber"] && !$("body").is(".printPage")) {
			// create a div
			var versionNumbersDiv = $("<div>", { id: "debugVersionNumber" }).appendTo("body");
			
			// in Red Flamingo, add in the Toggle button
			if ($("html").hasClass("redflamingo")) {
				var toggleButton = $("<a>", {
					"class": "toggleButton",
					text: "Contents",
					click: controller.toggleNavigation
				}).appendTo(versionNumbersDiv);
			}
			
			// add the front end and content version numbers
			frontendVersionNumber = frontendVersionNumber || "(unavailable)";
			var contentVersion = dataController.settings["BuildVersion"];
			if (!contentVersion || contentVersion == "BuildVersion") {
				contentVersion = "(unavailable)";
			}
			versionNumbersDiv.html("front end version: " + frontendVersionNumber + "; content version: " + contentVersion);
		}
		
		// create the title
		controller.createTitle();
		
		// create the menu
		controller.createMenu();
		
		// add print interface
		printController.addInterfaceElements(menuWrapperDiv);
		
		// load the page a first time
		controller.checkHash();
		
		// add some global event handling
		$(document).keydown(function (e) {
			// don't override normal key-commands, or do anything if any element has focus
			// the QSA test fails on IE7, bypassing a bug with :focus (so these events are not supported on IE7)
			if (e.ctrlKey || e.metaKey || e.shiftKey || !("querySelectorAll" in document) || $("body :focus").length) {
				return;
			}
			
			if (e.which == 38 || e.which == 40) {
				// scroll the content with the up/down arrows (option key to scroll the navigation)
				var step = 20,
					offset = (e.which == 38 ? -step : (e.which == 40 ? step : 0)),
					$view = (e.altKey ? $("#navigationView") : $("#contentView-browseController"));
				
				if ($view.length) {
					$view.get(0).scrollTop += offset;
				}
			}
			
			// go to the prev/next TOC item with the left/right arrows
			if (e.which == 37 || e.which == 39) {
				var $toc_items = $("#navigationView li:not(.hasChildren)"),
					$selected_item = $("#navigationView li.selected"),
					selected_index = $toc_items.index($selected_item),
					new_index = selected_index;
				
				if (e.which == 37) {
					new_index = Math.max(0, --new_index);
				} else if (e.which == 39) {
					new_index = Math.min($toc_items.length-1, ++new_index);
				}
				
				var $next_item = $toc_items.eq(new_index),
					next_href = $next_item.find("a").attr("href");
				location = next_href;
				
				// TODO "go next" and "go prev" should be handled by a nav controller
				$("#navigationView li.hasChildren").not($next_item.parents("li")).addClass("closed");
			}
		});
		
		// start checking for changes to the URL
		if ("onhashchange" in window) {
			$(window).bind("hashchange", controller.checkHash);
		} else {
			setTimeout(function () {
				setInterval(controller.checkHash, 100);
			}, 500);
		}
	};
	
	controller.createTitle = function () {
		// create and hide the title div
		var titleDiv = $("<div>", { id: "title" }).addClass("hidden").appendTo("#menuWrapper");
		
		function gohome () {
			searchController.hideSearchResults();
			location.hash = "";
		};
		
		// create the link
		$("<a>", {
			click: gohome,
			text: dataController.settings["Title"]
		}).appendTo(titleDiv);
		
		// add the back button
		$("<a>", {
			id: "backButton",
			click: function () { history.go(-1); }
		}).appendTo("#menuWrapper");
	
		// add the forward button
		$("<a>", {
			id: "forwardButton",
			click: function () { history.go(1); }
		}).appendTo("#menuWrapper");
		
		// add the home button
		$("<a>", {
			id: "homeButton",
			click: gohome
		}).appendTo("#menuWrapper");
		
		// pre-load hover and press graphics
		var images = ["arrow-back-active.png", "arrow-forward-active.png", "home-active.png", "home-hover.png", "print-active.png", "print-hover.png"];
		var path = "";
	
		if ($("html").hasClass("orangeflamingo")) {
			path = "images/orangeflamingo/";
		} else if ($("html").hasClass("blackflamingo")) {
			path = "images/blackflamingo/";
		}
		
		if (path) {
			$.each(images, function (index, name) {
				(new Image()).src = path + name;
			});
		}
	};
	
	controller.createMenu = function() {
		// find out how many buttons there will be
		var buttonCount = 0;
		
		// create the row
		var menuTableRow = $("<tr>");
		$.each(dataController.getTopHierearchyObjects(), function (index, item) {
			var content = dataController.getContentObjectForID(item.id);
			
			// only look at type="navigation"
			if (content.type === "navigation") {
				buttonCount++;
				
				// create the column
				var menuTableColumn = $("<td>", { align: "center" }).appendTo(menuTableRow);
				
				// get item name
				var menuButtonName = content.name;
				// if there is no name, use the name of the first topicref
				if (!menuButtonName) {
					var firstChild = item.children[0];
					menuButtonName = dataController.getNameForObjectWithID(firstChild.id);
				}
				
				// create the link within the column
				var menuTableColumnLink = $("<a>", {
					id: "button-" + index,
					href: "#button-" + index,
					text: menuButtonName
				}).appendTo(menuTableColumn);
			}
		});
	
		// set width for the columns
		menuTableRow.find("td").attr("width", (100/buttonCount) + "%");
				
		// create the table
		var menuTable = $("<table>", {
			align: "center",
			border: 0,
			cellspacing: 0,
			cellpadding: 0,
			col: buttonCount
		}).appendTo("#menu");
		
		// create the table body
		var menuTableBody = $("<tbody>").append(menuTableRow).appendTo(menuTable);
	
		// if there is only one button, add a special class to the menu
		if (1 == buttonCount) {
			$("#menu").addClass("hidden");
			$("#title").removeClass("hidden");
		}
	};
	
	// ========== navigation ==========
	
	controller.navigateToID = function (targetID) {
		// hide the lightbox
		lightboxController.hideLightbox();
		
		// if it's the showHelpViewerApplicationList anchor, show the ApplicationListController
		if( targetID == "showHelpViewerApplicationList" ) {
			controller.navigateToMenuItemWithID("showHelpViewerApplicationList");
			return;
		}
		
		// update the search view (if necessary)
		searchController.navigateToItemWithID(targetID);
		
		// get the content object for this ID
		var content = dataController.getContentObjectForID(targetID);
		
		// find this item's button
		var targetButtonID = dataController.getButtonIDForObjectWithID(targetID);
		
		// get the top level hierarchy items
		var topHierarchyObjects = dataController.getTopHierearchyObjects();
		
		// if we're in the print page, always use the printPageController
		if ($("body").hasClass("printPage")) {
			// navigate to the menu item
			controller.navigateToMenuItemWithID(null);
			
			var foundPrintButton = false;
			
			if (targetID == "printBook") {
				foundPrintButton = true;
			}
			
			$.each(topHierarchyObjects, function (index, item) {
				if (item.id == targetButtonID) {
					foundPrintButton = true;
				}
			});
			
			if (foundPrintButton) {
				printPageController.navigateToItemWithID(targetID);
			} else {
				console.log("Print navigation error, couldn't find button for id: " + targetID);
			}
			
			return;
		}
		
		var button_content = dataController.getContentObjectForID(targetButtonID);
		
		// navigating to a button or its howdy page
		if (targetID === targetButtonID || button_content && targetID === button_content.howdyPageID) {
			// navigate to the menu
			controller.navigateToMenuItemWithID(targetButtonID);
			
			// show the howdy page
			var subController = controller.subControllerForObjectWithID(button_content.howdyPageID);
			subController.navigateToItemWithID(button_content.howdyPageID);
			
			return;
		}
		
		// navigating to a known content item which is explicitly identified as being remote
		// this should ONLY happen for books using the old Flamingo update mechanism
		// since the mechanism is suppressed when going to a specific ID (for help buttons)
		// this custom ID should trigger the update to happen
		if (button_content && button_content.type === "download-remote-book") {
			if (dataController.settings["FlamingoUpdateURL"]) {
				// navigating to the root of the book and reloading will trigger the update mechanism
				location = "#";
				location.reload();
				return; // probably not necessary given the reload()
			}
		}
		
		// navigating to lightbox content
		// this is for APDSchema/Sweet, where the ancestor 'button' determines whether a link
		// shows up in a lightbox. for DITA, this is determined by a 'lightbox' class on the link,
		// and intercepted by a click handler in the contentViewController
		if (button_content && button_content.type === "lightbox") {
			// if we aren't at some content now, manually navigate to the front
			if (!controller.previousHash) {
				var idOfFirstSelectedItem = controller.idOfFirstSelectedItem();
				controller.navigateToID(idOfFirstSelectedItem);
				controller.previousHash = "#" + idOfFirstSelectedItem;
			}
			
			// show it in the lightbox controller
			lightboxController.navigateToItemWithID(targetID);
			navigationWasHandled = true;
			
			return;
		}
		
		// navigating to anything else
		// this used to check that the ID was known somehow, but for DITA remote content that
		// can not be determined. we just try to show it, and let the (contentView)controller
		// show a 'go online' page if available.
		
		// navigate to this button/menu item if we aren't there already
		// TODO this could be handled by the button itself on a navigation event handler
		var $button = $("#" + targetButtonID);
		if ($button.length && !$button.hasClass("selected")) {
			controller.navigateToMenuItemWithID(targetButtonID);
		} else if ($button.length === 0 && $("#menu td a.selected").length === 0) {
			// if there is no button and not already a selected button
			// go to the first one so at least something is shown
			controller.navigateToMenuItemWithID(controller.idOfFirstSelectedItem());
		}
		
		// go to the appropriate controller
		var subController = controller.subControllerForObjectWithID(targetID);
		subController.navigateToItemWithID(targetID);
	};
	
	// ========== menu button tabs ==========
	
	controller.navigateToMenuItemWithID = function (targetID) {
		// get the current controller
		var currentController = controller.subControllerForObjectWithID(targetID);
		
		// empty the container and set the menu type as a class name
		var controllerClass = "browse"; // default, browseController
		switch (currentController) {
			case printPageController:
				controllerClass = "printPageController"; break;
			case landingController:
				controllerClass = "landingController"; break;
			case applicationListController:
				controllerClass = "applicationListController"; break;
		}
		
		// tell the CurrentController not to show anything
		currentController.currentID = null;
		
		// search results need to be maintained between the old and new right TOC view
		var $activeSearch = $("#search");
		
		// create a new TOC and put the search into it
		var $newView = currentController.createView(targetID);
		if ($activeSearch.length) {
			$("#search", $newView).replaceWith($activeSearch);
		}
		
		$("#container").empty().attr("class", controllerClass).append($newView);
		
		// unselect all buttons
		$.each(dataController.getTopHierearchyObjects(), function (index, item) {
			$("#" + item.id).removeClass("selected");
		});
		
		// select this button
		$("#" + targetID).addClass("selected");
	};
	
	controller.idOfFirstSelectedItem = function () {
		var button = "button-0"; // default
		
		$.each(dataController.getTopHierearchyObjects(), function (index, item) {
			var content = dataController.getContentObjectForID(item.id)
			
			// only look at type="navigation" && active-state="selected"
			if (content.type === "navigation" && content['active-state'] === "selected") {
				button = "button-" + index;
				return false; // stop iteration
			}
		});
		
		return button;
	};
	
	// ========== Red Flamingo Help Viewer ==========
	
	controller.enableHelpViewerContentsButton = function () {
		// only do this for Red Flamingo
		if (!$("html").hasClass("redflamingo")) {
			return;
		}
		
		// there is no Help Viewer object, or it doesn't have the necessary methods
		if (!("HelpViewer" in window) || !HelpViewer.enableContentsButtonWithCallback || !HelpViewer.setContentsButtonState) {
			return;
		}
		
		// tell the Help Viewer to enable the button
		HelpViewer.enableContentsButtonWithCallback(controller.toggleNavigation);
		
		// show the navigation if going to the front page
		var hash = location.hash;
		var showNavigation = (!hash || hash === "#" || hash === "#" + controller.idOfFirstSelectedItem());
		
		// tell Help Viewer what the state of the button should be 
		HelpViewer.setContentsButtonState(showNavigation);
	};
	
	controller.setHelpViewerBreadcrumbTitleForObjectWithID = function(id) {
		// only do this for Red Flamingo
		if (!$("html").hasClass("redflamingo")) {
			return;
		}
		
		// there is no Help Viewer object, or it doesn't have the necessary methods
		if (!("HelpViewer" in window) || !HelpViewer.setBreadcrumbPageTitle) {
			return;
		}
		
		// find the title
		var title = dataController.getNameForObjectWithID(id);
		
		// find out if this is a howdy page
		$.each(dataController.getTopHierearchyObjects(), function (index, item) {
			var content = dataController.getContentObjectForID(item.id);
			
			if (item.type === "navigation") {
				// get the howdy page for this item
				var howdyPageID = contentItem.howdyPageID;
				
				// the target item is this hierarchy item's howdy page
				if (id === howdyPageID) {
					// set the title to null
					title = null;
					return false; // stop iteration
				}
			}
		});
		
		// tell the Help Viewer to set this for the title
		HelpViewer.setBreadcrumbPageTitle(title);
	};
	
	// ========== checking the hash ==========
	
	controller.checkHash = function () {
		// periodically check the contents of the history frame, and set the location if it has changed
		var ieRestoringHistory = false;
		if ($.browser.msie && $.browser.version < 8) {
			var state = $("#historyiFrame").contents().find("#state").text();
			if (state && state !== controller.currentHash) {
				ieRestoringHistory = true;
				location.replace(state);
			}
		}
		
		// no new hash
		if (controller.currentHash == location.hash) {
			return;
		}
		
		// save the new hash
		if (!ieRestoringHistory) {
			controller.updateIEHistoryStack(location.hash);
		}
		controller.previousHash = controller.currentHash;
		controller.currentHash = location.hash;
		
		// get the new ID
		var id = controller.currentHash.replace("#", "");
		
		// refresh the page if the user manually wants to refresh
		if (id == "contentNotAvailableMessageLink") {
			location = "#";
			location.reload();
			return;
		}
		
		// fix the ID, if necessary
		if (id.match("didRunUpdate")) {
			id = "browse";
		}
		
		// navigate to the new id
		if (id) {
			controller.navigateToID(id);
		} else {
			// if there is no hash, go to the first item
			// this used to be set as a hash, but that inserted an unnecessary history item
			// (on Help Viewer, the extra history was added even when using location.replace())
			controller.navigateToID(controller.idOfFirstSelectedItem())
		}
		
		// notify the tracking controller
		var currentID = controller.currentHash && controller.currentHash.replace("#", "");
		var previousID = controller.previousHash && controller.previousHash.replace("#", "");
		trackingController.userNavigatedFromIDToID(previousID, currentID);
	};
	
	controller.subControllerForObjectWithID = function(targetID) {
		// application list controller
		if (targetID == "showHelpViewerApplicationList") {
			return applicationListController;
		}
		
		// print page controller
		if( $("body").hasClass("printPage") ) {
			return printPageController;
		}
		
		// the default for Red Flamingo is the LandingController
		if( $("html").hasClass("redflamingo") ) {
			return landingController;
		}
		
		// default
		return browseController;
	};
	
	controller.updateIEHistoryStack = function(hash) {
		// for IE 7 and earlier, this shim should add a history entry when the hash is changed
		if ($.browser.msie && $.browser.version < 8) {
			var ieHistory = $("#historyiFrame").get(0).contentWindow.document;
			ieHistory.open("javascript:'<html><\/html>'");
			ieHistory.write("<html><body><div id='state'>"+hash+"<\/div><\/body><\/html>");
			ieHistory.close();
		}
	}
	
	// ========== cross references ==========
	openCrossReference = function(id) {
		// figure out whether this should open in a lightbox and do that directly,
		try {
			var ancestorType = dataController.pathToID(id)[0].content.type;
			if (ancestorType === "lightbox") {
				lightboxController.navigateToItemWithID(id);
				return;
			}
		} catch (e) {
			// fail silently
		}
		location = "#" + id;
	};
}());

/* ======== js/datacontroller.js ======== */
var dataController = {
	versionNumber: "",
	settings: {}
};

(function () { // closure
	var jsonStructure = {};

	dataController.loadData = function () {
		var folder = localizationController.localePath();
		
		// read in content.json
		$.ajax({
			url: folder + "content.json",
			dataType: "json",
			async: false,
			success: function (json, status, xhr) {
				jsonStructure = json[0];
				
				// detect via server headers if we are on a staging server, and provide a visual clue
				var server_type = xhr.getResponseHeader("x-server-type");
				if (server_type.match(/review|staging/)) {
					$("body").css("background-color", "#f0f7fc");
				}
			},
			error: function () { console.log("Error loading contents.json file"); }
		});
		
		// read in contentjson-version.txt
		$.ajax({
			url: folder + "contentjson-version.txt",
			dataType: "text",
			async: false,
			success: function (text) { dataController.versionNumber = text; },
			error: function () { console.log("Error loading version string file"); }
		});
		
		// change duplicate hierarchy ids in the json structure
		changeDuplicateHierarchyIDs();
		addRelationshipsToJSON();
		fixSettingsValues();
	};
	
// ========== private utility methods ==========
	
	function changeDuplicateHierarchyIDs () {
		var countDictionary = {};
		
		// recursive function to get the count of hierarchy ids
		function countHierarchyIDs(index, item) {
			// skip hierarchy items with no ID
			if (!item.id) {
				return;
			}
			
			// get the current count
			var idCount = countDictionary[item.id];
			if (!idCount) {
				// this item is new, intialize the count
				countDictionary[item.id] = 1;
			} else {
				// this is a duplicate, increment the count
				countDictionary[item.id] += 1;
				
				// change the id
				var newID = item.id + "_" + idCount;
				
				// copy the content object
				jsonStructure.content[newID] = jQuery.extend(true, {}, jsonStructure.content[item.id] );
				
				// change the ID for the duplicate instance
				item.id = newID;
			}
			
			// recurse on the children
			if (item.children) {
				$.each(item.children, countHierarchyIDs);
			}
		};
		
		// make this change to each hierarchy object
		$.each(jsonStructure.hierarchy, countHierarchyIDs);
	};
	
	// add shortcuts to the in-memory items
	// <content>.id is the id of the content item (which is also its key)
	// <content>.hierarchy points to the corresponding hierarchy item
	// <hierarchy>.content points to the corresponding content item (not id)
	// <hierarchy>.parent points to the items parent or null
	function addRelationshipsToJSON () {
		function addRelationships (item, parent) {
			item.parent = parent;
			
			if (item.id) {
				var content = jsonStructure.content[item.id]
				content.id = item.id;
				content.hierarchy = item;
				item.content = content;
			}
			
			if (item.children) {
				$.each(item.children, function (index, child) {
					addRelationships(child, item);
				});
			}
		}
		
		$.each(jsonStructure.hierarchy, function (index, item) {
			addRelationships(item, null); // top level items have no parent
		});
	}
	
	// clean up older versions of the JSON
	function fixSettingsValues () {
		var obj = jsonStructure.settings;
		$.each(obj, function (key, val) {
			// correct string booleans to proper booleans
			if (val === "true") {
				obj[key] = true;
			} else if (val === "false") {
				obj[key] = false;
			}
			
			// correct 0 and 1 or "" and "true" strings to proper booleans
			if (key == "ShowVersionNumber" || key == "HighResolutionGraphics") {
				obj[key] = (val == "1" || val == "true" ? true : false);
			}
		});
		
		// make the settings externally available
		dataController.settings = obj;
	}
	
// ========== Getting Information From Data Structure ==========
	
	dataController.pathToID = function (id) {
		var path = [];
		
		if (!jsonStructure.content[id]) {
			return path;
		}
		
		var hierarchy_item = jsonStructure.content[id].hierarchy;
		while (hierarchy_item) {
			path.push(hierarchy_item);
			hierarchy_item = hierarchy_item.parent;
		}
		
		return path.reverse();
	};
	
	dataController.getTopHierearchyObjects = function () {
		return jsonStructure.hierarchy;
	};
	
	dataController.getContentObjectForID = function (id) {
		return jsonStructure.content[id];
	};
	
	dataController.getHierarchyObjectForID = function (id) {
		var contentObject = jsonStructure.content[id];
		return (contentObject &&
				contentObject.hierarchy ? contentObject.hierarchy : null);
	};
	
	dataController.getParentIDForObjectWithID = function (id) {
		var contentObject = jsonStructure.content[id];
		return (contentObject &&
				contentObject.hierarchy &&
				contentObject.hierarchy.parent ? contentObject.hierarchy.parent.id : null);
	};
	
	dataController.getChildrenIDsForObjectWithID = function (id) {
		var object = dataController.getHierarchyObjectForID(id) || {},
			childrenArray = object.children || [];
		
		return $.map(childrenArray, function (child) {
			return child.id;
		});
	};

	dataController.getButtonIDForObjectWithID = function (id) {
		var path = dataController.pathToID(id);
		if (path.length) {
			return path.shift().id;
		}
		return null;
	};
	
	dataController.getNameForObjectWithID = function (id) {
		if (id === "printBook") {
			return dataController.settings["Title"];
		}
		
		var object = dataController.getContentObjectForID(id) || {};
		return object.name ||  "[id not found: " + id + "]";
	};
	
	dataController.getAlternativeNameForObjectWithID = function (id) {
		var object = dataController.getContentObjectForID(id) || {};
		return object.alternativeName || object.name || "";
		
//		// figure out what the alternative name should be, and save it
// 		if (!object.calculatedName) {
// 			var button_content = dataController.pathToID(id).shift().content,
// 				name_style = button_content['alternativeNameStyle'],
// 				alt_name = object.alternativeName || "",
// 				std_name = object.name || "";
// 			
// 			switch (name_style) {
// 				case "prefix":
// 					var $temp = $("<div>");
// 					$("<span>", {
// 						"class": "alternativename",
// 						"text": alt_name
// 					}).appendTo($temp);
// 					$("<span>", {
// 						"class": "name",
// 						"text": std_name
// 					}).appendTo($temp);
// 					object.calculatedName = $temp.html();
// 					break;
// 				case "replace":
// 					object.calculatedName = alt_name || std_name;
// 					break;
// 				default:
// 					object.calculatedName = std_name;
// 			}
// 		}
// 		
// 		return object.calculatedName;
	};
	
	dataController.getKeywordsForObjectWithID = function (id) {
		var object = dataController.getContentObjectForID(id) || {};
		return object.keywords || "";
	};
	
	dataController.getIconForObjectWithID = function (id) {
		var object = dataController.getContentObjectForID(id) || {},
			icon = object.icon || "";
		
		// fix path to image
		if (icon && !icon.match("data:image/png")) {
			icon = localizationController.localePath() + icon;
		}
		
		return icon;
	};
	
	dataController.getContentForObjectWithID = function (id) {
		// try the override method, first
		// LoL TODO remove this, OverrideMethods.js support has been removed
		if ("contentForID" in window) {
			var overrideReturnValue = contentForID(id, localizationController.language);
			
			if (overrideReturnValue) {
				return overrideReturnValue;
			}
		}
		
		var object = dataController.getContentObjectForID(id) || {},
			content = object.content;
		
		// fix all Art paths
		if (content) {
			var artPath = localizationController.localePath();
			
			// LoL TODO this would be more cleanly done by putting the content into a jQ object and iterating over the images
			content = content.replace(/img([^>]*?) src=(["'])/g, "img$1 src=$2" + artPath);
			
			// fix all external URLs to open in a new window
			// LoL TODO this can be done in a click handler on the content view
			if ($.browser.helpviewer) {
				content = content.replace(/href=\"http/g, "target=\"_new\" href=\"http" );
			}
		}
		
		return content;
	};
	
	dataController.getBreadcrumbsForObjectWithID = function (id, breadcrumbDivider) {
		var path = dataController.pathToID(id),
		    divider = " <span class=\"breadcrumbArrow\">&#9658;</span> ",
		    name_array = [];
		
		// remove last item of path, since user will already be on that page
		path.pop();
		
		name_array = $.map(path, function (obj) {
			var content = dataController.getContentObjectForID(obj.id) || {};
			return content.name || null;
		});
		
		return name_array.join(divider);
	};
	
	// given a JSON URL, fetch the file and extract the movie link from it
	dataController.getMovieURLFromJSONFileAtURL = function (jsonURL) {
		var movieURL = null;
		
		// don't show movies in 64-bit IE (QT plugin doesn't work consistently)
		if ($.browser.msie && navigator.userAgent.match(/x64/i) ) {
			return movieURL;
		}
		
		if (navigator.onLine) {
			$.ajax({
				async: false,
				dataType: "json",
				url: jsonURL,
				success: function (json) {
					// json file may be wrapped in an array
					movieURL = (json.length) ? json[0].url : json.url;
				},
				error: function (xhr, status, error) {
					console && console.log(error);
				}
			});
		}
		
		return movieURL;
	}
	
	// take an href containing movie=<key> and convert it to a JSON URL, then return the movie URL that it points to
	dataController.getMovieURLFromURLParam = function (url) {
		var movieURL = null;
		
		if (url.match(/.*\?movie=/)) {
			// remove the ?movie=
			url = url.replace(/.*\?movie=/, "");
			
			var jsonURL = dataController.settings["RemoteURL"];
			jsonURL += (jsonURL.slice(-1) == "/") ? "" : "/";
			jsonURL += localizationController.language;
			jsonURL += "/movies/" + url + ".json";
			
			movieURL = dataController.getMovieURLFromJSONFileAtURL(jsonURL);
		}
		
		return movieURL;
	}
	
	// get an authored 'content not available' message
	dataController.getContentNotAvailableMessageForID = function (id) {
		var message = "<div>[id not found: " + id + "]<\/div>"; // default text
		
		if ($.browser.helpviewer) { // custom messages are only shown in helpviewer
			// for Sweet/APD Schema, the message is the only child of a special top-level item
			$.each(dataController.getTopHierearchyObjects(), function (index, item) {
				var content = dataController.getContentObjectForID(item.id);
				
				// find the one with the right type and get its first child
				if (content.type === "content-not-available-message") {
					message = dataController.getContentForObjectWithID(item.children[0].id);
					return false; // exit loop
				}
			});
			
			// for DITA, the topic is identified by a class
			$.each(jsonStructure.content, function (index, item) {
				if (item["class"] === "content-not-available-message") {
					message = dataController.getContentForObjectWithID(item.id);
					return false; // exit loop
				}
			});
		}
		
		return message;
	}
	
}());

/* ======== js/lightboxcontroller.js ======== */
var lightboxController = {
	"name": "lightboxController"
};

(function () { // closure
	var $lightbox = "",
		$name = "",
		$contentWrapper = "",
	    $content = "";
	
	function createView () {
		// create wrapper div
		$lightbox = $("<div>", { id: "lightbox" }).appendTo("body");
		
		// create the background div
		$("<div>", { "class": "background" }).appendTo($lightbox);
		
		// create the close button wrapper div
		var closeButtonWrapperDiv = $("<div>", { id: "closeButtonWrapper" }).appendTo($lightbox);
		
		// create the close button
		$("<a>", { "class": "closeButton" })
			.appendTo(closeButtonWrapperDiv)
			.click(lightboxController.hideLightbox);
		
		// create the outer wrapper div
		var outerWrapperDiv = $("<div>", { id: "lightboxOuterWrapper" }).appendTo($lightbox);
		// create the inner wrapper div
		var innerWrapperDiv = $("<div>", { id: "lightboxInnerWrapper" }).appendTo(outerWrapperDiv);
		// create the content wrapper div
		$contentWrapper = $("<div>", { id: "lightboxContentWrapper" }).appendTo(innerWrapperDiv);
		
		// create a name div
		$name = $("<div>", { id: "lightboxContentName", "class": "contentName" }).appendTo($contentWrapper);
		
		// add the content view controller
		contentViewController.createView(lightboxController).appendTo($contentWrapper);
		
		// pre-load the hover graphic at next idle
		setTimeout(function () {
			(new Image()).src = "images/lightbox-close-hover.png";
		}, 10);
	};
	
	lightboxController.showLightbox = function() {
		// show the lightbox
		$lightbox && $lightbox.show();
	};
	
	lightboxController.hideLightbox = function() {
		// hide the lightbox
		$lightbox && $lightbox.hide();
	};
	
	lightboxController.navigateToItemWithID = function(targetID) {
		// initialize the view if necessary
		$lightbox || createView();
		
		// show the lightbox
		$lightbox.show();
		
		// tell the content view to show the right content
		contentViewController.navigateToItemWithID(targetID, lightboxController);
	};
}());

/* ======== js/localizationcontroller.js ======== */
var localizationController = {
	language: null
};

(function () { // closure
	var supportedLanguages = [],
	    uiElements = {}; // redefined below
	
	localizationController.localizeBrowser = function (queryValues) {
		// look up our list of 'supported languages'
		// this is not always accurate on Help Viewer, see below
		$.ajax({
			url: controller.contentURL + "Info.json",
			dataType: "json",
			async: false,
			success: function (json) { supportedLanguages = json },
			error: function (e) { console.log("Error loading Info.json file", e); }
		});
		
		// default to English
		// TODO may need to double-check that English is a supported language, for non-English Type-2 books
		localizationController.language = "en";
		
		var langCode = queryValues["lang"];
		var navigatorLanguage = navigator.language || navigator.systemLanguage;
		
		if (langCode) { // first check for a passed-in language argument
			// let Help Viewer determine our language
			if( "HelpViewer" in window ) {
				localizationController.language = langCode;
			}
			// LoL TODO must also check that it is supported
			else if (uiElements[langCode] && ($.inArray(langCode, supportedLanguages) > -1)) {
				// this language is supported
				localizationController.language = langCode;
			} else {
				// see if it is a more-specific version of a language that we support
				var langOnly = localizationController.convertLocalizationAndRegionToISOCode(langCode);
				if (uiElements[langOnly] && ($.inArray(langOnly, supportedLanguages) > -1)) {
					localizationController.language = langOnly;
				}
			}
		} else if (supportedLanguages.length == 1) { // if only one language was listed as supported, use it
			localizationController.language = supportedLanguages[0];
		} else if (navigatorLanguage) { // fall-back to detecting the browser language
			// convert to the ISO code
			navigatorLanguage = localizationController.convertLocalizationAndRegionToISOCode(navigatorLanguage);
			
			// this language is supported
			if ($.inArray(navigatorLanguage, supportedLanguages) > -1) {
				localizationController.language = navigatorLanguage;
				return;
			}
		}
		
		// check the iTunes language
		if ("iTunes" in window) {
			// get the iTunes accepted languages
			var itunesAcceptedLanguages = iTunes.acceptedLanguages.split(",");
			
			// loop through the languages
			for (var i=0; itunesLanguage = itunesAcceptedLanguages[i++]; ) {
				// separate the language from the q= percentage
				if (-1 != itunesLanguage.indexOf(";")) {
					itunesLanguage = itunesLanguage.substring( 0, itunesLanguage.indexOf(";") );
				}
				
				// convert to the ISO code
				itunesLanguage = localizationController.convertLocalizationAndRegionToISOCode(itunesLanguage);
				
				// this language is supported
				if ($.inArray(itunesLanguage, supportedLanguages) > -1) {
					localizationController.language = itunesLanguage;
					return;
				}
			}
		}
		
		// in Help Viewer builds, we can't always rely on the Info.json file to be accurate
		// so set the supportedLanguages to the one language we know about and exit
		if ($.browser.helpviewer) {
			supportedLanguages = [localizationController.language];
		}
	};
	
	localizationController.localePath = function () {
		return controller.contentURL + localizationController.localizedUIString('folderName') + "/";
	};
	
	localizationController.convertLocalizationAndRegionToISOCode = function (locale) {
		var culture = locale.substring(0,2);
		
		if ("zh" == culture) {          // chinese
			if ("zh-cn" == locale) {
				return "zh_CN";         // simplified chinese
			} else if( "zh-tw" == locale ) {
				return "zh_TW";         // traditional chinese
			}
		} else if ("pt" == culture) {   // portuguese
			if ("pt-br" == locale) {
				return "pt_BR";         // brazilian portuguese
			} else if ( "pt-pt" == locale ) {
				return "pt";            // portuguese
			}
		} else if ("nb-no" == locale) { // norwegian
			return "no";
		}
		
		// default to only the culture code
		return culture;
	};
	
	localizationController.localizedUIString = function(key, lang) {
		lang = lang || localizationController.language;
		// get the array for this language
		var localized = "";
		
		try {
			localized = uiElements[lang][key];
// 			if (!localized) {
// 				console.log("Could not find localized value for " + key);
// 			}
		} catch (e) {
// 			console.log("Could not find localization table for " + localizationController.language);
		}
		
		return localized || key; // default to untranslated key
	};
	
	localizationController.getLocalizationLink = function() {
		// if we dont support multiple languages, return nothing
		if (supportedLanguages.length < 2) {
			return null;
		}
		
		// create the whole wrapper div
		var localizationDiv = $("<div>", { id: "localizations" });
		
		// create the localization select
		var localizationSelect = $("<select>", {
			id: "localizationsSelect",
			change: localizationController.changeLanguage
		}).appendTo(localizationDiv);
		
		// add in the first option
		$("<option>", {
			text: localizationController.localizedUIString("Change Language")
		}).appendTo(localizationSelect);
		
		// add in an option for each localization
		$.each(supportedLanguages, function (index, isocode) {
			$("<option>", {
				val: isocode,
				text: localizationController.localizedUIString('localizedName', isocode)
			}).appendTo(localizationSelect);
		});
		
		// return the whole wrapper div
		return localizationDiv.get(0);
	};
	
	localizationController.changeLanguage = function() {
		controller.queryParams.lang = $("#localizationsSelect").val();
		
		location = "?" + $.param(controller.queryParams) + location.hash;
	};
	
	// localized UI elements
	uiElements = {
		'ar': { // Arabic, tier 3
			'folderName': 'ar.lproj',
			'localizedName': 'عربي',
			'Show': 'إظهار',
			'Hide': 'إخفاء',
			'Search': 'بحث',
			'Cancel': 'إلغاء',
			'Change Language': 'تغيير اللغة',
			'Downloading latest help...': 'تنزيل أحدث التعليمات…',
			'Page': 'صفحة',
			'Section': 'مقطع',
			'Book': 'كتاب',
			'%@ Search Results': '%@ نتيجة (نتائج) بحث',
			'Help for:': 'تعليمات لـ:',
			'Recent applications': 'أحدث التطبيقات',
			'Apple applications': 'تطبيقات Apple',
			'Other applications': 'تطبيقات أخرى',
			'Featured application help': 'تعليمات تطبيقات مميّزة',
			'Show all': 'إظهار الكل',
			'Show less': 'إظهار أقل',
			'Was this page helpful?': 'هل كانت هذه الصفحة مفيدة؟',
			'Send feedback.': 'أرسل تغذية مرتدّة.'
		},
		'cs': { // Czech, tier 3
			'folderName': 'cs.lproj',
			'localizedName': 'Čeština',
			'Show': 'Zobrazit',
			'Hide': 'Skrýt',
			'Search': 'Hledat',
			'Cancel': 'Zrušit',
			'Change Language': 'Změnit jazyk',
			'Downloading latest help...': 'Stahování nejnovější nápovědy…',
			'Page': 'Stránka',
			'Section': 'Oddíl',
			'Book': 'Kniha',
			'%@ Search Results': 'Výsledky hledání: %@',
			'Help for:': 'Nápověda pro:',
			'Recent applications': 'Poslední aplikace',
			'Apple applications': 'Aplikace Apple',
			'Other applications': 'Jiné aplikace',
			'Featured application help': 'Nápověda k doporučeným aplikacím',
			'Show all': 'Zobrazit vše',
			'Show less': 'Zobrazit méně',
			'Was this page helpful?': 'Pomohla vám tato stránka?',
			'Send feedback.': 'Sdělte nám svůj názor.'
		},
		'da': { // Danish, tier 2
			'folderName': 'da.lproj',
			'localizedName': 'Dansk',
			'Show': 'Vis',
			'Hide': 'Skjul',
			'Search': 'Søg',
			'Cancel': 'Annuller',
			'Change Language': 'Skift sprog',
			'Downloading latest help...': 'Henter den nyeste hjælp...',
			'Page': 'Side',
			'Section': 'Afsnit',
			'Book': 'Bog',
			'%@ Search Results': '%@ søgeresultater',
			'Help for:': 'Hjælp til:',
			'Recent applications': 'Seneste programmer',
			'Apple applications': 'Apple-programmer',
			'Other applications': 'Andre programmer',
			'Featured application help': 'Viste program',
			'Show all': 'Vis alle',
			'Show less': 'Vis færre',
			'Was this page helpful?': 'Var denne side nyttig?',
			'Send feedback.': 'Send feedback.'
		},
		'de': { // German, tier 0
			'folderName': 'German.lproj',
			'localizedName': 'Deutsch',
			'Show': 'Einblenden',
			'Hide': 'Ausblenden',
			'Search': 'Suchen',
			'Cancel': 'Abbrechen',
			'Change Language': 'Sprache wechseln',
			'Downloading latest help...': 'Neuste Hilfe laden ...',
			'Page': 'Seite',
			'Section': 'Abschnitt',
			'Book': 'Buch',
			'%@ Search Results': '%@ Suchergebnisse',
			'Help for:': 'Hilfe für:',
			'Recent applications': 'Benutzte Programme',
			'Apple applications': 'Apple-Programme',
			'Other applications': 'Andere Programme',
			'Featured application help': 'Empfohlenes Programm-Hilfe',
			'Show all': 'Alle einblenden',
			'Show less': 'Weniger einblenden',
			'Was this page helpful?': 'War diese Seite nützlich?',
			'Send feedback.': 'Feedback senden.'
		},
		'en': { // English, tier 0
			'folderName': 'English.lproj',
			'localizedName': 'English',
			'Show': 'Show', // show/expand topic
			'Hide': 'Hide', // hide/collapse topic
			'Search': 'Search',
			'Cancel': 'Cancel',
			'Change Language': 'Change Language',
			'Downloading latest help...': 'Downloading latest help...',
			'Page': 'Page',
			'Section': 'Section',
			'Book': 'Book',
			'%@ Search Results': '%@ Search Results', // %@ is a number
			'Help for:': 'Help for:',
			'Recent applications': 'Recent applications',
			'Apple applications': 'Apple applications',
			'Other applications': 'Other applications',
			'Featured application help': 'Featured application help', // i.e., help for featured applications. the application is featured, not the help.
			'Show all': 'Show all',
			'Show less': 'Show less',
			'Was this page helpful?': 'Was this page helpful?',
			'Send feedback.': 'Send feedback.'
		},
		'es': { // Spanish, tier 0
			'folderName': 'Spanish.lproj',
			'localizedName': 'Español',
			'Show': 'Mostrar',
			'Hide': 'Ocultar',
			'Search': 'Buscar',
			'Cancel': 'Cancelar',
			'Change Language': 'Cambiar idioma',
			'Downloading latest help...': 'Descargando la ayuda más reciente...',
			'Page': 'Página',
			'Section': 'Sección',
			'Book': 'Libro',
			'%@ Search Results': '%@ resultados',
			'Help for:': 'Ayuda de:',
			'Recent applications': 'Aplicaciones recientes',
			'Apple applications': 'Aplicaciones de Apple',
			'Other applications': 'Otras aplicaciones',
			'Featured application help': 'Ayuda de la aplicación destacada',
			'Show all': 'Mostrar todo',
			'Show less': 'Mostrar menos',
			'Was this page helpful?': '¿Le ha resultado útil esta página?',
			'Send feedback.': 'Enviar opinión.'
		},
		'fi': { // Finnish, tier 2
			'folderName': 'fi.lproj',
			'localizedName': 'Suomi',
			'Show': 'Näytä',
			'Hide': 'Kätke',
			'Search': 'Etsi',
			'Cancel': 'Kumoa',
			'Change Language': 'Vaihda kieltä',
			'Downloading latest help...': 'Ladataan uusinta ohjetta...',
			'Page': 'Sivu',
			'Section': 'Osio',
			'Book': 'Kirja',
			'%@ Search Results': '%@ - hakutulokset',
			'Help for:': 'Ohje:',
			'Recent applications': 'Äskeiset ohjelmat',
			'Apple applications': 'Applen ohjelmat',
			'Other applications': 'Muut ohjelmat',
			'Featured application help': 'Esittelyssä olevan ohjelman ohje',
			'Show all': 'Näytä kaikki',
			'Show less': 'Näytä vähemmän',
			'Was this page helpful?': 'Oliko tästä sivusta apua?',
			'Send feedback.': 'Lähetä palautetta.'
		},
		'fr': { // French, tier 0
			'folderName': 'French.lproj',
			'localizedName': 'Français',
			'Show': 'Afficher',
			'Hide': 'Masquer',
			'Search': 'Rechercher',
			'Cancel': 'Annuler',
			'Change Language': 'Changer de langue',
			'Downloading latest help...': 'Téléchargement de l’aide la plus récente...',
			'Page': 'Page',
			'Section': 'Section',
			'Book': 'Livre',
			'%@ Search Results': '%@ résultats',
			'Help for:': 'Aide pour :',
			'Recent applications': 'Applications récentes',
			'Apple applications': 'Applications Apple',
			'Other applications': 'Autres applications',
			'Featured application help': 'Aide de l’application actuelle',
			'Show all': 'Affichage total',
			'Show less': 'Affichage partiel',
			'Was this page helpful?': 'Avez-vous trouvé cette page utile ?',
			'Send feedback.': 'Envoyer des commentaires.'
		},
		'it': { // Italian, tier 1
			'folderName': 'Italian.lproj',
			'localizedName': 'Italiano',
			'Show': 'Mostra',
			'Hide': 'Nascondi',
			'Search': 'Ricerca',
			'Cancel': 'Annulla',
			'Change Language': 'Cambia lingua',
			'Downloading latest help...': 'Scarico aiuto più recente...',
			'Page': 'Pagina',
			'Section': 'Sezione',
			'Book': 'Libro',
			'%@ Search Results': '%@ risultati di ricerca',
			'Help for:': 'Aiuto per:',
			'Recent applications': 'Applicazioni recenti',
			'Apple applications': 'Applicazioni Apple',
			'Other applications': 'Altre applicazioni',
			'Featured application help': 'Aiuto applicazione in evidenza',
			'Show all': 'Mostra tutto',
			'Show less': 'Mostra meno',
 			'Was this page helpful?': 'Hai trovato utile questa pagina?',
			'Send feedback.': 'Invia commenti.'
		},
		'ja': { // Japanese, tier 0
			'folderName': 'Japanese.lproj',
			'localizedName': '日本語',
			'Show': '表示',
			'Hide': '隠す',
			'Search': '検索',
			'Cancel': 'キャンセル',
			'Change Language': '言語を変更',
			'Downloading latest help...': '最新のヘルプをダウンロード中...',
			'Page': 'ページ',
			'Section': 'セクション',
			'Book': 'ブック',
			'%@ Search Results': '%@ 件の検索結果',
			'Help for:': '表示中のヘルプ：',
			'Recent applications': '最近使ったアプリケーション',
			'Apple applications': 'Apple アプリケーション',
			'Other applications': 'ほかのアプリケーション',
			'Featured application help': 'お勧めのアプリケーションヘルプ',
			'Show all': 'すべてを表示',
			'Show less': '一部を表示',
			'Was this page helpful?': 'このページは役立ちましたか？',
			'Send feedback.': 'フィードバックを送信'
		},
		'ko': { // Korean, tier 2
			'folderName': 'ko.lproj',
			'localizedName': '한글',
			'Show': '보기',
			'Hide': '가리기',
			'Search': '검색',
			'Cancel': '취소',
			'Change Language': '언어 변경',
			'Downloading latest help...': '최신 도움말 다운로드 중...',
			'Page': '페이지',
			'Section': '섹션',
			'Book': '책',
			'%@ Search Results': '%@개의 검색 결과',
			'Help for:': '도움말:',
			'Recent applications': '최근 사용 응용 프로그램',
			'Apple applications': 'Apple 응용 프로그램',
			'Other applications': '기타 응용 프로그램',
			'Featured application help': '추천 응용 프로그램 도움말',
			'Show all': '모두 보기',
			'Show less': '간단히 보기',
			'Was this page helpful?': '이 페이지가 도움이 되셨습니까?',
			'Send feedback.': '피드백 보내기.'
		},
		'hu': { // Hungarian/Magyar, tier 3
			'folderName': 'hu.lproj',
			'localizedName': 'Magyar',
			'Show': 'Megjelenítés',
			'Hide': 'Elrejtés',
			'Search': 'Keresés',
			'Cancel': 'Mégsem',
			'Change Language': 'Nyelv módosítása',
			'Downloading latest help...': 'Legújabb súgó letöltése...',
			'Page': 'Oldal',
			'Section': 'Szakasz',
			'Book': 'Könyv',
			'%@ Search Results': '%@ keresési eredmény',
			'Help for:': 'Súgó a következőhöz:',
			'Recent applications': 'Legutóbbi alkalmazások',
			'Apple applications': 'Apple alkalmazások',
			'Other applications': 'Egyéb alkalmazások',
			'Featured application help': 'Kiemelt alkalmazássúgó',
			'Show all': 'Az összes megjelenítése',
			'Show less': 'Kevesebb megjelenítése',
			'Was this page helpful?': 'Hasznosnak találta ezt az oldalt?',
			'Send feedback.': 'Visszajelzés küldése'
		},
		'nl': { // Dutch, tier 1
			'folderName': 'Dutch.lproj',
			'localizedName': 'Nederlands',
			'Show': 'Toon',
			'Hide': 'Verberg',
			'Search': 'Zoek',
			'Cancel': 'Annuleer',
			'Change Language': 'Wijzig taal',
			'Downloading latest help...': 'Meest recente help downloaden...',
			'Page': 'Pagina',
			'Section': 'Sectie',
			'Book': 'Boek',
			'%@ Search Results': '%@ zoekresultaten',
			'Help for:': 'Help voor:',
			'Recent applications': "Recente programma's",
			'Apple applications': "Apple programma's",
			'Other applications': "Andere programma's",
			'Featured application help': 'Help bij uitgelicht programma',
			'Show all': 'Toon alles',
			'Show less': 'Toon minder',
			'Was this page helpful?': 'Bent u geholpen met de informatie op deze pagina?',
			'Send feedback.': 'Stuur commentaar.'
		},
		'no': { // Norwegian, tier 2
			'folderName': 'no.lproj',
			'localizedName': 'Norsk (bokmål)',
			'Show': 'Vis',
			'Hide': 'Skjul',
			'Search': 'Søk',
			'Cancel': 'Avbryt',
			'Change Language': 'Bytt språk',
			'Downloading latest help...': 'Laster ned oppdatert hjelpinnhold...',
			'Page': 'Side',
			'Section': 'Del',
			'Book': 'Bok',
			'%@ Search Results': '%@ treff',
			'Help for:': 'Hjelp for:',
			'Recent applications': 'Sist brukte programmer',
			'Apple applications': 'Apple-programmer',
			'Other applications': 'Andre programmer',
			'Featured application help': 'Aktuell programhjelp',
			'Show all': 'Vis alle',
			'Show less': 'Vis færre',
			'Was this page helpful?': 'Var denne siden nyttig?',
			'Send feedback.': 'Send tilbakemelding.'
		},
		'pl': { // Polish, tier 2
			'folderName': 'pl.lproj',
			'localizedName': 'Polski',
			'Show': 'Pokaż',
			'Hide': 'Ukryj',
			'Search': 'Szukaj',
			'Cancel': 'Anuluj',
			'Change Language': 'Zmień język',
			'Downloading latest help...': 'Pobieram najnowszą pomoc…',
			'Page': 'Strona',
			'Section': 'Rozdział',
			'Book': 'Książka',
			'%@ Search Results': 'Znaleziono: %@',
			'Help for:': 'Pomoc:',
			'Recent applications': 'Ostatnie programy',
			'Apple applications': 'Programy Apple',
			'Other applications': 'Pozostałe programy',
			'Featured application help': 'Pomoc do wybranych programów',
			'Show all': 'Pokaż wszystko',
			'Show less': 'Pokaż mniej',
			'Was this page helpful?': 'Czy ta strona była pomocna?',
			'Send feedback.': 'Wyślij opinię.'
		},
		'pt': { // Portuguese, tier 2
			'folderName': 'pt_PT.lproj',
			'localizedName': 'Português (Portugal)',
			'Show': 'Mostrar',
			'Hide': 'Ocultar',
			'Search': 'Pesquisar',
			'Cancel': 'Cancelar',
			'Change Language': 'Alterar idioma',
			'Downloading latest help...': 'A descarregar a ajuda mais recente...',
			'Page': 'Página',
			'Section': 'Secção',
			'Book': 'Livro',
			'%@ Search Results': 'A pesquisa devolveu %@ resultados',
			'Help for:': 'Ajuda sobre:',
			'Recent applications': 'Aplicações recentes',
			'Apple applications': 'Aplicações da Apple',
			'Other applications': 'Outras aplicações',
			'Featured application help': 'Ajuda da aplicação em destaque',
			'Show all': 'Mostrar tudo',
			'Show less': 'Mostrar menos',
			'Was this page helpful?': 'Esta página foi útil?',
			'Send feedback.': 'Enviar comentário.'
		},
		'pt_BR': { // Brazilian Portuguese, tier 2
			'folderName': 'pt.lproj',
			'localizedName': 'Português',
			'Show': 'Mostrar',
			'Hide': 'Ocultar',
			'Search': 'Buscar',
			'Cancel': 'Cancelar',
			'Change Language': 'Alterar Idioma',
			'Downloading latest help...': 'Transferindo a ajuda mais recente...',
			'Page': 'Página',
			'Section': 'Seção',
			'Book': 'Livro',
			'%@ Search Results': '%@ Resultados de Busca',
			'Help for:': 'Ajuda para:',
			'Recent applications': 'Aplicativos recentes',
			'Apple applications': 'Aplicativos da Apple',
			'Other applications': 'Outros aplicativos',
			'Featured application help': 'Ajuda do aplicativo apresentado',
			'Show all': 'Mostrar tudo',
			'Show less': 'Mostrar menos',
			'Was this page helpful?': 'Esta página foi útil?',
			'Send feedback.': 'Enviar comentários.'
		},
		'ru': { // Russian, tier 1
			'folderName': 'ru.lproj',
			'localizedName': 'Русский',
			'Show': 'Показать',
			'Hide': 'Скрыть',
			'Search': 'Найти',
			'Cancel': 'Отменить',
			'Change Language': 'Изменить язык',
			'Downloading latest help...': 'Загружаю новейшую версию справки...',
			'Page': 'Страница',
			'Section': 'Раздел',
			'Book': 'Книга',
			'%@ Search Results': 'Результатов поиска: %@',
			'Help for:': 'Справка:',
			'Recent applications': 'Недавние программы',
			'Apple applications': 'Программы Apple',
			'Other applications': 'Другие программы',
			'Featured application help': 'Справка текущей программы',
			'Show all': 'Показать все',
			'Show less': 'Показать часть',
			'Was this page helpful?': 'Была ли эта страница полезной?',
			'Send feedback.': 'Отправить отзыв.'
		},
		'sv': { // Swedish, tier 2
			'folderName': 'sv.lproj',
			'localizedName': 'Svenska',
			'Show': 'Visa',
			'Hide': 'Göm',
			'Search': 'Sök',
			'Cancel': 'Avbryt',
			'Change Language': 'Byt språk',
			'Downloading latest help...': 'Hämtar den senaste hjälpen...',
			'Page': 'Sida',
			'Section': 'Avsnitt',
			'Book': 'Bok',
			'%@ Search Results': '%@ sökresultat',
			'Help for:': 'Hjälp för:',
			'Recent applications': 'Senaste program',
			'Apple applications': 'Apple-program',
			'Other applications': 'Övriga program',
			'Featured application help': 'Aktuell programhjälp',
			'Show all': 'Visa alla',
			'Show less': 'Visa färre',
			'Was this page helpful?': 'Var den här sidan till hjälp?',
			'Send feedback.': 'Skicka synpunkter.'
		},
		'tr': { // Turkish, tier 3
			'folderName': 'tr.lproj',
			'localizedName': 'Türkçe',
			'Show': 'Göster',
			'Hide': 'Gizle',
			'Search': 'Ara',
			'Cancel': 'Vazgeç',
			'Change Language': 'Dili Değiştir',
			'Downloading latest help...': 'En son yardım indiriliyor…',
			'Page': 'Sayfa',
			'Section': 'Bölüm',
			'Book': 'Kitap',
			'%@ Search Results': '%@ Arama Sonuçları',
			'Help for:': 'Yardım:',
			'Recent applications': 'Son kullanılan uygulamalar',
			'Apple applications': 'Apple uygulamaları',
			'Other applications': 'Diğer uygulamalar',
			'Featured application help': 'Seçme uygulamalar için yardım',
			'Show all': 'Tümünü göster',
			'Show less': 'Daha azını göster',
			'Was this page helpful?': 'Bu sayfa faydalı oldu mu?',
			'Send feedback.': 'Geri bildirim gönder.'
		},
		'zh_CN': { // Simplified Chinese, tier 1
			'folderName': 'zh_CN.lproj',
			'localizedName': '简体中文',
			'Show': '显示',
			'Hide': '隐藏',
			'Search': '搜索',
			'Cancel': '取消',
			'Change Language': '更改语言',
			'Downloading latest help...': '正在下载最新的帮助…',
			'Page': '页面',
			'Section': '章节',
			'Book': '书籍',
			'%@ Search Results': '%@ 个搜索结果',
			'Help for:': '帮助：',
			'Recent applications': '最近更新的应用程序',
			'Apple applications': 'Apple 应用程序',
			'Other applications': '其他应用程序',
			'Featured application help': '精选应用程序帮助',
			'Show all': '显示全部',
			'Show less': '显示更少',
			'Was this page helpful?': '此页面是否有帮助？',
			'Send feedback.': '发送反馈。'
		},
		'zh_TW': { // Traditional Chinese, tier 2
			'folderName': 'zh_TW.lproj',
			'localizedName': '繁體中文',
			'Show': '顯示',
			'Hide': '隱藏',
			'Search': '搜尋',
			'Cancel': '取消',
			'Change Language': '更改語言',
			'Downloading latest help...': '正在下載最新輔助說明⋯',
			'Page': '頁面',
			'Section': '章節',
			'Book': '書籍',
			'%@ Search Results': '%@ 個搜尋結果',
			'Help for:': '輔助說明：',
			'Recent applications': '最近使用過的應用程式',
			'Apple applications': 'Apple 應用程式',
			'Other applications': '其他應用程式',
			'Featured application help': '特色應用程式輔助說明',
			'Show all': '顯示全部',
			'Show less': '顯示較少',
			'Was this page helpful?': '此頁面對您有幫忙嗎？',
			'Send feedback.': '傳送使用回饋。'
		}
   };
}());

/* ======== js/movielightboxcontroller.js ======== */
var movieLightboxController = {};

// LoL TODO this seems to be more of a view than a controller, albeit a singleton
// if it were not a singleton, it could possibly be an instance of lightboxcontroller

(function () { // closure
	var $lightbox = null,
	    $content = null;
	
	function createView () {
		// create wrapper div
		$lightbox = $("<div>", { id: "movieLightbox" }).appendTo("body");
		
		// create the background div
		$("<div>", { "class": "background" }).appendTo($lightbox);
		
		// create the numerous inner divs
		var innerDiv1 = $("<div>", { id: "centeringDiv" }).appendTo($lightbox);
		var innerDiv2 = $("<div>").appendTo(innerDiv1);
		var innerDiv3 = $("<div>").appendTo(innerDiv2);
		
		// create the close button
		$("<a>", { "class": "closeButton" })
			.click(movieLightboxController.hideLightbox)
			.appendTo(innerDiv3);
		
		// create a content div
		$content = $("<div>", {
			id: "movieLightboxContent",
			"class": "content"
		}).appendTo(innerDiv3);
	};
	
	// show the lightbox
	movieLightboxController.showLightbox = function() {
		$lightbox && $lightbox.show();
	};
	
	// hide the lightbox
	movieLightboxController.hideLightbox = function() {
		$lightbox && $lightbox.hide();
		
		// remove the content
		// TODO -- this is temporary
		$content && $content.html('');
	};
	
	movieLightboxController.showLightboxWithURL = function(movieURL) {
		// initialize the view if necessary
		$lightbox || createView();
		
		// show the lightbox
		$lightbox.show();
		
		// create a containing block
		var containingBlockDiv = $("<div>", { "class": "containingBlock" }).appendTo($content);
		
		// create a video wrapper
		var videoWrapperDiv = $("<div>", { "class": "videoWrapper" }).appendTo(containingBlockDiv);
		
		// add the new content
		var embedHTML = "";
		if ($.browser.msie || $.browser.mozilla || /chrome/.test(navigator.userAgent.toLowerCase()) || /opera/.test(navigator.userAgent.toLowerCase()) || "iTunes" in window) {
			// traditional quicktime embed
			embedHTML = '<object width="640" height="420" classid="clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B" codebase="http://www.apple.com/qtactivex/qtplugin.cab"><param name="src" value="'+ movieURL + '"> <param name="autoplay" value="true"> <param name="controller" value="true"><embed src="'+ movieURL + '" width="640" height="420" autoplay="true" controller="true" pluginspage="http://www.apple.com/quicktime/download/"></embed></object>';
		} else {
			// <video> tag
			embedHTML = '<video autoplay="true" scale="aspect" width="640" height="400" src="'+ movieURL + '" controls="controls">';
		}
		videoWrapperDiv.html(embedHTML);
	};
}());

/* ======== js/printcontroller.js ======== */
var printController = {};

(function () { // closure
	function getSectionIDForElementWithID (elementID) {
		// go through the navigation to find the parent
		var sectionNavID = $("#navigation-" + elementID).parents("li.hasChildren:last").attr("id");
		
		// return the ID
		if( sectionNavID ) {
			return sectionNavID.replace(/navigation-/, "");
		}
		
		return;
	};
	
	function hidePrintOptions () {
		// hide the options
		$("#printOptions").addClass("hidden");
		
		// set the image to not be pressed
		$("#printImageSpacer").removeClass("pressed");
		
		// stop watching for clicks
		$(document).unbind("click", printOrDismiss);
	};
	
	function printOrDismiss (event) {
		var $target = $(event.target);
		var printHash = "";
		var printURL = "print.html?lang=" + localizationController.language;
		
		if ($target.parents("#printOptionsPage").length) {
			printHash = location.hash;
		} else if ($target.parents("#printOptionsSection").length) {
			printHash = "#" + getSectionIDForElementWithID(location.hash.substring(1));
		} else if ($target.parents("#printOptionsBook").length) {
			printHash = "#printBook";
		}
		
		if (printHash) {
			printURL += printHash;
			if (event.metaKey) {
				// open in a separate window
				open(printURL);
				// hide the print menu
				hidePrintOptions();
			} else {
				// open in hidden iframe
				$("#printiFrame").attr("src", "about:blank");
				// load the URL in the iframe
				setTimeout(function () {
					$("#printiFrame").attr("src", printURL);
				}, 0);
			}
		}
		
		if ($target.parents("#printOptions").length) {
			// clicked somewhere else in the popup, don't hide it
			return;
		}
		
		hidePrintOptions();
	};
	
	printController.addInterfaceElements = function(container) {
		// don't add anything in Help Viewer or iOS
		if ($.browser.helpviewer || navigator.userAgent.match(/webkit.*mobile/i)) {
			// <rdar://problem/8639175> Jquery Flamingo doesn't print in Help Viewer when it does in Safari
			// the history iFrame is the culprit: remove it, since it isn't necessary in HV
			$("#historyiFrame").remove();
			
			// Help Viewer handles its own printing, so we can return
			return;
		}
		
		// create the print div
		var printDiv = $("<div>", { id: "print" }).appendTo(container);
		
		// create the print image spacer
		var printImageSpacerDiv = $("<a>", {
			id: "printImageSpacer",
			href: "javascript:printController.showPrintOptions();"
		}).appendTo(printDiv);
		
		// create the print options div
		var printOptionsDiv = $("<div>", { id: "printOptions" }).appendTo(printDiv);
		
		hidePrintOptions();
		
		// create the print options table
		var printOptionsTable = $("<table>", { cellpadding: 0, cellspacing: 0 }).appendTo(printOptionsDiv);
		
		// create the print options tbody
		var printOptionsTableBody = $("<tbody>").appendTo(printOptionsTable);
		
		// create print options
		$.each(["Page", "Section", "Book"], function (index, type) {
			// create the row
			var row = $("<tr>", { id: "printOptions"+type }).appendTo(printOptionsTableBody);
			
			// create the title cell
			var titleCell = $("<td>", {
				"class": "title",
				text: localizationController.localizedUIString(type)
			}).appendTo(row);
			
			// create the dash cell
			var dashCell = $("<td>", { "class": "dash", text: "-" }).appendTo(row);
			
			// create the dyanmic text cell
			var textCell = $("<td>").addClass("text").appendTo(row);
		});
	};
	
	printController.showPrintOptions = function() {
		// get the element
		var pageID = location.hash.substring(1);
		var sectionID = getSectionIDForElementWithID(pageID);
		
		if( pageID &&
			-1 == pageID.indexOf("button-") ) {
			var pageName = dataController.getNameForObjectWithID(pageID);
		}
		
		if( sectionID ) {
			var sectionName = dataController.getNameForObjectWithID(sectionID);
		}
		
		var bookName = dataController.settings["Title"];
		
		// add the names for each element, and show/hide the page and section as appropriate
		$("#printOptionsBook .text").text(bookName);
		$("#printOptionsSection").attr("class", sectionName ? "" : "hidden")
			.find(".text").text(sectionName);
		$("#printOptionsPage").attr("class", pageName ? "" : "hidden")
			.find(".text").text(pageName);
		
		// show the options
		$("#printOptions").removeClass("hidden");
		
		// set the image to be pressed
		$("#printImageSpacer").addClass("pressed");
		
		// watch for clicks outside of the options
		$(document).click(printOrDismiss);
	};
	
	// called from within the iframe
	printController.iFrameContentDidLoad = function () {
		// no content is loaded
		if ("about:blank" == $("printiFrame").src) {
			return;
		}
		
		// hide the print menu
		hidePrintOptions();
		
		// focus the iframe in internetexplorer
		if ($.browser.msie) {
			parent.printiFrame.focus();
		}
		
		// print the iframe
		setTimeout(function() {
			parent.printiFrame.print();
		}, 250);
	};
}());

/* ======== js/printpagecontroller.js ======== */
var printPageController = {
	"name": "browseController",
	currentID: null
};

(function () { // closure
	function contentForID (targetID) {
		var contentItem = dataController.getContentObjectForID(targetID);
		
		// if the navgation="false", then don't show this object or it's children
		if (contentItem && contentItem.navigation == "false") {
			return;
		}
		
		var $content = $("<div>").addClass("printElement");
		if (targetID == "COPYRIGHT_PAGE_CONTENT") {
			$content.addClass("copyright");
		}
		
		// get the item's children
		var targetChildren = dataController.getChildrenIDsForObjectWithID(targetID);
		
		// find out if we should print this content
		var printThisContent = true;
		// don't print the book or items with children
		if (targetID == "printBook" || targetChildren.length) {
			printThisContent = false;
		}
		
		// print the content
		if (printThisContent) {
			// create the breadcrumb item
			$("<div>", {
				"class": "contentBreadcrumbs",
				html: dataController.getBreadcrumbsForObjectWithID(targetID)
			}).appendTo($content);
			
			// create the name item
			if ("COPYRIGHT_PAGE_CONTENT" != targetID) {
				$("<div>", {
					"class": "contentName",
					text: dataController.getNameForObjectWithID(targetID)
				}).appendTo($content);
			}
		}
		
		// print entire book
		if (targetID == "printBook") {
			// look through each button, in order
			$.each(dataController.getTopHierearchyObjects(), function (index, hierarchyItem) {
				var contentItem = dataController.getContentObjectForID(hierarchyItem.id);
				
				// skip if not type="navigation"
				if (contentItem.type !== "navigation") {
					return;
				}
				
				// recursively call this function
				$content.append(contentForID(hierarchyItem.id));
			});
		} else if (targetChildren.length) {
			// recursively call the children
			$.each(targetChildren, function (index, childID) {
				$content.append(contentForID(childID));
			});
		} else {
			// this is a content page
			var targetIDContent = dataController.getContentForObjectWithID(targetID);
			
			// if this item only has one child, get it's content instead
			var itemChildren = dataController.getChildrenIDsForObjectWithID(targetID);
			if (1 == itemChildren.length) {
				targetIDContent = dataController.getContentForObjectWithID(itemChildren[0]);
			}
			
			// remove all links from the content
			targetIDContent = (targetIDContent || "").replace(/<a.*?>(.*?)<\/a>/g, "$1");
			
			// add the new content
			$content.append(targetIDContent);
		}
		
		return $content;
	};
	
	printPageController.createView = function() {
		return contentViewController.createView(printPageController);
	};
	
	printPageController.navigateToItemWithID = function(targetID) {
		$contentWrapper = $(".contentWrapper");
		
		// set the document title
		document.title = dataController.getNameForObjectWithID(targetID);
		
		// apple logo
		$("<img>", {
			"class": "logo",
			src: "images/logo.png",
			alt: "Apple logo",
			height: 27,
			width: 27
		}).appendTo($contentWrapper);
		
		// book title
		$("<div>", {
			"class": "title",
			text: dataController.settings["Title"]
		}).appendTo($contentWrapper);
		
		$contentWrapper
			.append(contentForID(targetID)) // content
			.append(contentForID("COPYRIGHT_PAGE_CONTENT")); // copyright
		
		// loop through all Tasks
		$contentWrapper.find(".Task").each(function () {
			var $task = $(this);
			
			// wrap the task in the taskwrapper
			$task.wrap($("<div>", { "class": "TaskWrapper" }));
			
			// add in an a tag at the top
			var closeLink = $("<a>").insertBefore($task);
			
			// add a span into the a tag
			$("<span>", { "class": "showHideSteps" }).appendTo(closeLink);
			
			// move the name into the a tag
			$task.find(".Name:first").appendTo(closeLink);
		});
		
		// loop through all LinkAppleWebMovies
		$(".content .LinkAppleWebMovie").remove();
		
		// if we are in an iframe
		if (window !== top && parent.printController) {
			// tell the parent frame that the iframe loaded
			parent.printController.iFrameContentDidLoad();
		}
	};
}());

/* ======== js/searchcontroller.js ======== */
var searchController = {};

(function () { // closure
	var $field, $results, $count;
	
	searchController.addInterfaceElements = function(container) {
		// don't add anything in Help Viewer
		if ($.browser.helpviewer) {
			return;
		}
		
		// create the search div
		var searchDiv = $("<div>", { "id": "search" }).appendTo(container);
		
		// create the search field div
		var searchFieldDiv = $("<div>", { "id": "searchField" }).appendTo(searchDiv);
		
		// create the search field
		$("<input>", {
			placeholder: localizationController.localizedUIString("Search"),
			type: ($.browser.webkit ? "search" : "text"),
			results: 0,
			keydown: searchController.performSearch
		}).appendTo(searchFieldDiv);
		
		// create a search results div
		var searchResultsDiv = $("<div>", { id: "searchResults" }).hide().appendTo(searchDiv);
		
		// create the search results top bar
		var searchResultsTopBar = $("<div>", { id: "searchResultsTopBar" }).appendTo(searchResultsDiv);
		
		// create a cancel button for the search results
		var searchResultsCancelButton = $("<a>", {
			text: localizationController.localizedUIString("Cancel"),
			click: searchController.hideSearchResults
		}).appendTo(searchResultsTopBar);
		
		// create the count label
		var searchResultsCountLabel = $("<span>", {
			id: "searchResultsCount",
			text: searchController.searchResultsStringWithNumber(0)
		}).appendTo(searchResultsTopBar);
		
		// create the search field div
		var searchResultsULContainerDiv = $("<div>", { id: "searchResultsListContainer" }).appendTo(searchResultsDiv);
		
		// create the search results UL
		var searchResultsList = $("<ul>", { id: "searchResultsList" }).appendTo(searchResultsULContainerDiv);
	};
	
	searchController.performSearch = function(event) {
		// only run this when enter is hit
		if (event.keyCode != 13) {
			return;
		}
		
		// get the query
		var query = $(this).val();
		
		// escape the query
		var specials = new RegExp("[.*+?|()\\[\\]{}\\\\]", "g"); // .*+?|()[]{}\
		query = query.replace(specials, "\\$&");
		
		// change the query to look for each word individually
		query = query.replace(/ /g, "|");
		
		// recursive function for searching
		function searchForContentInArray (query, array) {
			var searchResults = [];
			
			// create the regular expression
			var regularExpression = new RegExp(query, "i");
			
			// loop through the array
			for (var i=0; id = array[i++]; ) {
				var addItemToSearchResults = false;
				
				// get the name
				var name = dataController.getNameForObjectWithID(id);
				if (name) {
					// remove the HTML from the name
					name = name.replace(/<\/?[^>]+(>|$)/g, " ").replace(/\s+/g, " ");
					
					// see if the query is in the name
					if( regularExpression.exec( name ) ) {
						addItemToSearchResults = true;
					}
				}
				
				// get the alternative name
				var alternativeName = dataController.getAlternativeNameForObjectWithID(id);
				if (alternativeName) {
					// remove the HTML from the alternative name
					alternativeName = alternativeName.replace(/<\/?[^>]+(>|$)/g, " ").replace(/\s+/g, " ");
					
					// see if the query is in the alternative name
					if( regularExpression.exec( alternativeName ) ) {
						addItemToSearchResults = true;
					}
				}
				
				// get the keywords
				var keywords = dataController.getKeywordsForObjectWithID(id);
				if (keywords) {
					// keywords may be an array, but if a string split it on "," or ", "
					if (typeof keywords === "string") {
						keywords = keywords.split(/, ?/);
					}
					
					$.each(keywords, function (index, keyword) {
						// see if the query is in the keyword
						if( regularExpression.exec( keyword ) ) {
							addItemToSearchResults = true;
						}
					});
				}
				
				// get the content
				var content = dataController.getContentForObjectWithID(id);
				// there is content
				if (content) {
					// check the content's alt tags
					var altTagRegex = new RegExp("alt=\"(.*?)\"", "g");
					var altTagsArray = content.match(altTagRegex);
					
					if (altTagsArray) {
						// create one alt tag string
						var altTagsString = altTagsArray.join(" ");
						
						// see if the query is in the content
						if( regularExpression.exec( altTagsString ) ) {
							addItemToSearchResults = true;
						}
					}
					
					// remove the HTML from the content
					content = content.replace(/<\/?[^>]+(>|$)/g, " ").replace(/\s+/g, " ");
					
					// see if the query is in the content
					if (regularExpression.exec( content )) {
						addItemToSearchResults = true;
					}
				} else { // there isn't any content
					addItemToSearchResults = false;
				}
				
				// see if this item shouldn't be in the search results
				if (addItemToSearchResults) {
					var path = dataController.pathToID(id);
					$.each(path, function (index, hierarchy_item) {
						var content = dataController.getContentObjectForID(hierarchy_item.id);
						
						// the content or one of its parents is excluded from navigation
						if ("false" == content["navigation"]) {
							return addItemToSearchResults = false;
						}
						
						// the content or one of its parents is explicitly excluded from search
						if (1 == content["excludefromsearch"]) {
							return addItemToSearchResults = false;
						}
					});
				}
							
				// exclude this item if it is a duplicate id
				if( addItemToSearchResults ) {
					
					if( -1 != id.indexOf("_") ) {
						addItemToSearchResults = false;
					}
				}

				
				// we should add this to the search results
				if (addItemToSearchResults) {
					searchResults.push( id );
				}
				
				// recursively apply to the children
				var childrenIDs = dataController.getChildrenIDsForObjectWithID(id);
				var childrenSearchResults = searchForContentInArray(query, childrenIDs);
				
				searchResults = searchResults.concat(childrenSearchResults);
			}
			
			return searchResults;
		};
		
		// loop through all of the buttons, searching their content
		var searchResultsArray = [];
		
		var topHierarchyObjects = dataController.getTopHierearchyObjects();
		for (var i=0; hierarchyItem = topHierarchyObjects[i++]; ) {
			// get the children of this button
			var buttonChildren = dataController.getChildrenIDsForObjectWithID(hierarchyItem.id);
			
			// get the results for this topic ref
			var topicRefSearchResults = searchForContentInArray(query, buttonChildren);
			
			// append these results to the array
			searchResultsArray = searchResultsArray.concat(topicRefSearchResults);
		}
		
		// set the search results number
		$("#searchResultsCount").text(searchController.searchResultsStringWithNumber(searchResultsArray.length));
		
		// remove the existing li items
		$("#searchResultsList").children().remove();
		
		// add in the li items
		$.each(searchResultsArray, function (index, id) {
			// create the list item
			var searchResultsItem = $("<li>", { id: "searchresult-" + id }).appendTo("#searchResultsList");
			
			// create the link
			var searchResultsLink = $("<a>", {
				text: dataController.getNameForObjectWithID(id),
				click: function () { searchController.openSearchResult(id); }
			}).appendTo(searchResultsItem);
			
			// add in the breadcrumbs span
			var searchResultsBreadcrumbsSpan = $("<span>", {
				html: dataController.getBreadcrumbsForObjectWithID(id)
			}).appendTo(searchResultsLink);
		});
		
		// show the search results
		$("#searchResults").show();
		
		// make sure the selected item is updated
		var currentID = location.hash.substring(1);
		searchController.navigateToItemWithID(currentID);
		
		// notify the tracking controller
		trackingController.userSearchedForPhrase(query);
	};
	
	searchController.navigateToItemWithID = function(targetID) {
		// remove the hilighting from previously selected
		$("#search .selectedSearchResult").removeClass("selectedSearchResult");
		
		// add hilighting for this ID
		$("#searchresult-" + targetID).addClass("selectedSearchResult");
	};
	
	searchController.openSearchResult = function(id) {
		// close all navigation elements
		browseController.closeAllNavigationItems();
		
		// notify the tracking controller about this
		trackingController.userNavigatedFromIDToID("searchView", id);
		
		// go to this anchor
		location = "#" + id;
	};
	
	searchController.hideSearchResults = function() {
		// hide the search results
		$("#searchResults").hide();
	};
	
	searchController.searchResultsStringWithNumber = function(number) {
		// get the localized string
		var localizedString = localizationController.localizedUIString("%@ Search Results");
		
		// replace the %@ with the number
		localizedString = localizedString.replace(/%@/g, number);
		
		return localizedString;
	};
}());

/* ======== js/trackingcontroller.js ======== */
var trackingController = {};

(function () { // closure
	// editable defaults
	var cookieKey = "helpSession";
	var cookieValue = Math.round(Math.random() * 1000000) + "-" + new Date().getTime();
	
	var baseURL = (location.protocol.match(/^http/)
				? "/activity/"                      // 'online' URL
				: "http://help.apple.com/activity/" // 'offline' URL
	);
	// params can be passed as function handles, not return values,
	// allowing values to be determined when the tracking is sent
	var baseParams = {
		base: function () { return dataController.versionNumber; },
		when: function () { return new Date().getTime(); },
		session: getSessionIdentifier(),
		language: function () { return localizationController.language; }
	};
 
	var previouslySentToID = null;
	
	// exposed API
	
	trackingController.userNavigatedFromIDToID = function (fromID, toID) {
		// for the time being, only do this in Browser
		if ($.browser.helpviewer) {
			return;
		}
		
		// we've already sent this notification
		if (toID == previouslySentToID) {
			return;
		}
		
		// save this notification
		previouslySentToID = toID;
		
		sendTrackingToServer({
			action: 'navigate',
			src: fromID,
			target: toID
		});
	};
	
	trackingController.userSearchedForPhrase = function (phrase) {
		// for the time being, only do this in Browser
		if ($.browser.helpviewer) {
			return;
		}
		
		sendTrackingToServer({
			action: 'search',
			phrase: phrase
		});
	};
	
	// server interaction
	
	var request = new XMLHttpRequest();
	
	function sendTrackingToServer(params) {
		if (location.host == "" || location.host.match(/^localhost/)) {
			return;
		}
		
		var mergedParams = $.extend({}, baseParams, params);
		var url = baseURL + $.param(mergedParams);
		$.get(url);
	}
	
	// cookie functions
	
	// return existing or new cookie value
	function getSessionIdentifier() {
		return readCookie() || createCookie();
	}
	
	function readCookie() {
		var cookies = {};
		
		var cookieArray = document.cookie.split(/;\s+/);
		for (var i=0; i < cookieArray.length; i++) {
			var nameValArray = cookieArray[i].split(/\=/);
			cookies[nameValArray[0]] = nameValArray[1];
		}
		
		return cookies[cookieKey];
	}

	function createCookie() {
		var expires = new Date(new Date().getTime() + (1000 * 60 * 60 * 24 * 365 * 10)).toUTCString();
		var domain = (location.host.match(/apple.com$/) ? "; domain=apple.com" : "");
		var cookie = cookieKey + "=" + cookieValue + "; expires=" + expires + "; path=/" + domain;
		document.cookie = cookie;
		return readCookie();
	}
}());

/* ======== js/updatecontroller.js ======== */
/* ======== js/updatecontroller.js ======== */
var updateController = {
	update_status_file: "/tmp/apd" + (new Date()).getTime() + "-update-status.txt",
	update_interval: 0
};

// ========== initialize ==========
updateController.update = function () {
	// only run the updater if we're in Help Viewer
	if (!navigator.userAgent.match(/Help Viewer/)) {
		// show the help interface
		updateController.showHelpInterface();
		return;
	}
	
	// don't even attempt to update if the user wants to go directly to a specific help topic
	if (location.hash && location.hash !== "#") {
		// show the help interface
		updateController.showHelpInterface();
		return;
	}
	
	// show the update interface
	var updatingDiv = $("<div>", { id: "updating" }).hide().appendTo("body");
	
	// preload and show the progress image
	(new Image()).src = "images/activityindicator.png";
	var updatingImage = $("<img>", { src: "images/activityindicator.png" }).appendTo(updatingDiv);
	
	// add in the text
	var updatingText = $("<div>", {
		id: "updatingText",
		text: localizationController.localizedUIString("Downloading latest help...")
	}).appendTo(updatingDiv);
	
	// a short timeout to allow the activity image to load
	setTimeout(function () {
		// run the redirect script
		var script_url = "help:runscript=/scripts/updatefrontend.scpt";
		script_url += " string='" + location.href + ",,,";
		script_url += updateController.update_status_file + ",,,";
		script_url += dataController.settings["FolderName"] + ",,,";
		script_url += dataController.settings["FlamingoUpdateURL"];
		script_url += localizationController.language + "/" + "'";
		
		location = script_url;
		
		// set up an interval to check the update status
		updateController.update_interval = setInterval(updateController.checkUpdateStatus, 100);
	}, 100);
};

// ========== check the status of the update script ==========

updateController.checkUpdateStatus = function () {
	$.ajax({
		async: false,
		dataType: "text",
		url: "file://" + updateController.update_status_file,
		success: function (text) {
		
			if (text.match(/^\//)) {
				// we have a path to which to redirect!
				var url = "file://" + encodeURI(text);
				clearInterval(updateController.update_interval); // probably not necessary, given the replace()
				
				// it's a remote-to-remote update
				if( encodeURI(location.href).match(url) ) {
					location.reload();
				}
				
				// there is a different path
				else {
					location.replace(url + "#" + controller.idOfFirstSelectedItem());
				}
			}
			
			else if (text.match(/^CHECKING_FOR_UPDATE/)) {
				// the redirect failed, the script is now updating
				$("#updating").show();	
			}
			
			else if (text.match(/^NO_UPDATE_AVAILABLE/)) {
				// there was no update available, show the interface
				updateController.showHelpInterface();
			}
			
			else if (text.match(/^UPDATE_FAILURE/)) {
				// the update was attempted but failed for some reason, show the interface
				updateController.showHelpInterface();
			}
		},
		error: function (xhr, status, error) {
			// can't find the status file (AppleScript not working?), just show the interface
			updateController.showHelpInterface();
		}
	});
};

// ========== show the main help interface ==========

updateController.showHelpInterface = function () {
	// clear the repeating update-checker
	clearInterval(updateController.update_interval);
	
	// hide the progress indicator
	$("#updating").hide();
	
	// show the interface
	controller.showInterface();
};

