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

CC.ThemeChooserView = Class.create(CC.Mvc.View, {
	render: function() {
		var tabIndex = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_SETTINGS_APPEARANCE_PARAMS);
		
		// Create all the divs for swatches.
		var chooser = Builder.node('div', {'class': 'setting settings_theme_chooser'}, [
			Builder.node('input', {id: 'settings_theme_name', type: 'hidden', value: 'blue'})
		]);
		var ul = chooser.appendChild(Builder.node('ul', {'role': 'presentation', 'class': 'theme_swatches input'}));
		"blue scarlet orange green royal purple steel carbon".split(" ").forEach(function(color) {
			var swatch = Builder.node('li', {'tabindex': tabIndex, 'role': 'listitem', 'aria-label': color + ' ' + "_Accessibility.Label.Color".loc(), className : 'theme_swatch ' + color, 'data-color': color}, 
				Builder.node('div', {'role': 'presentation', className: 'theme_swatch_container'}, [
					Builder.node('div', {'role': 'presentation', className: 'theme_main_swatch'}),
					Builder.node('div', {'role': 'presentation', className: 'theme_sidebar_swatch'})
				])
			);
			ul.appendChild(swatch);
		}, this);
		return chooser;
	}
});