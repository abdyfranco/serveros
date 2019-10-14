// Copyright (c) 2009-2014 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

//= require "./sidebar_section.js"

CC.TagsSidebarSection = Class.create(CC.SidebarSection, {
	mClassName: 'tags',
	mDisplayTitle: "_Sidebars.Tags.Title".loc(),
	mSidebarSectionGUID: 'sidebars/tags',
	mAutocompleteTagPath: '/tags/autocomplete',
	initialize: function($super) {
		$super();
		var taggerElement = this.element.down('.cc-tagger');
		if (CC.meta('x-apple-user-can-write') != 'true') {
			taggerElement.down('.cc-sidebar-actions').hide();
		}
	},
	render: function($super) {
		var elem = $super();
		var tagItemSidebar = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_SIDEBAR_TAGS);
		var taggerElement = Builder.node('div', {className: 'cc-tagger'}, [
			Builder.node('div', {className: 'cc-tag-editor'}, [
				Builder.node('div', {className: 'cc-sidebar-actions'}, [
					Builder.node('a', {'tabindex': ++tagItemSidebar, 'role': 'button', className: 'button add'}, "_Sidebars.Tags.Add.Tag".loc()),
					Builder.node('a', {'tabindex': '-1', 'role': 'button', className: 'button cancel'}, "_General.Cancel".loc()),
					Builder.node('a', {'tabindex': '-1', 'role': 'button', className: 'button save'}, "_General.Save".loc())
				]),
				Builder.node('div', {className: 'cc-tag-entryfield', 'data-autocompleteurl': this.mAutocompleteTagPath}, [
					Builder.node('input', {'tabindex': '-1', 'role': 'textbox', 'type': 'text', 'maxlength': '100'})
				]),
				Builder.node('h2', {className: 'cc-tag-empty-message placeholder'}, "_Sidebars.Tags.Empty.Placeholder".loc()),
				Builder.node('ul', {className: 'cc-tag-collection'})
			])
		]);
		elem.down('div.content').appendChild(taggerElement);
		return elem;
	},
	open: function($super) {
		$super();
		if (!this.mDidLoadTags) {
			this.mDidLoadTags = true;
			this.loadTags();
		}
	},
	loadTags: function() {
		this.element.addClassName('loading');
		var entityGUID = CC.meta('x-apple-entity-guid');
		server_proxy().tagsForEntityGUID(entityGUID, function(tags) {
			this.element.removeClassName('loading');
			var tagCollectionElement = this.element.down('.cc-tag-collection');
			$A(tags).each(function(tagName) {
				var t = CC.Tag.create({'name': tagName});
				tagCollectionElement.appendChild(t.element);
			});
			var taggerElement = this.element.down('.cc-tagger');
			new CC.Tagger(taggerElement);
		}.bind(this), function() {
			this.element.removeClassName('loading');
		}.bind(this));
	}
});
