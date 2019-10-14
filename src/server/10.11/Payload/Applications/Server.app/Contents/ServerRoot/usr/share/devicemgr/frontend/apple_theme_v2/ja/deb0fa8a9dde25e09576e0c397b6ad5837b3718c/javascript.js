/* >>>>>>>>>> BEGIN source/resources/english.lproj/layout.js */
// Copyright (c) 2016 Apple Inc. All rights reserved.
//
// IMPORTANT NOTE: This file is licensed only for use with the Profile Manager
// server feature of the Apple Software and is subject to the terms and conditions
// of the Apple Software License Agreement accompanying the package this file is part of.

// ==========================================================================
// Project:   Me
// ==========================================================================
/*globals Me Layout */

/** @namespace

  This file contains layout constants for the standard MobileMe controls when
  you are using the “apple-theme-v2” theme.
  
  This file will override SproutCore values when possible, and will also
  supplement with new values that are MobileMe-specific.
*/

/// -------------------------------------------------------------------------
///  BUTTONS
/// -------------------------------------------------------------------------

// Added this code to remove apple_theme from requiring shared
if(!window.Me) Me = SC.Object.create();
///

SC.REGULAR_BUTTON_HEIGHT=27;

Me.CANVAS_BUTTON_HEIGHT = 26;
Me.TOOLBAR_BUTTON_HEIGHT = 26;

Me.SQUARE_BUTTON_REGULAR_HEIGHT   = 27;
Me.CAPSULE_BUTTON_REGULAR_HEIGHT  = 27;
Me.SELECT_BUTTON_REGULAR_HEIGHT   = 27;
Me.POPUP_BUTTON_REGULAR_HEIGHT    = 27;

Me.SQUARE_BUTTON_REGULAR_MIN_WIDTH   = 68;
Me.SQUARE_BUTTON_SMALL_MIN_WIDTH     = 56;
Me.SQUARE_BUTTON_TINY_MIN_WIDTH      = 52;

Me.CAPSULE_BUTTON_REGULAR_MIN_WIDTH  = 72;
Me.CAPSULE_BUTTON_SMALL_MIN_WIDTH    = 60;
Me.CAPSULE_BUTTON_TINY_MIN_WIDTH     = 52;

Me.HELP_BUTTON_REGULAR_MIN_WIDTH     = 26;
Me.HELP_BUTTON_SMALL_MIN_WIDTH       = 22;
Me.HELP_BUTTON_TINY_MIN_WIDTH        = 18;

/// -------------------------------------------------------------------------
///  MENUS
/// -------------------------------------------------------------------------


SC.MenuPane.REGULAR_MENU_ITEM_HEIGHT           = 22;
SC.MenuPane.REGULAR_MENU_ITEM_SEPARATOR_HEIGHT = 7;
SC.MenuPane.REGULAR_MENU_HEIGHT_PADDING        = 6;

SC.MenuPane.SMALL_MENU_ITEM_HEIGHT           = 18;
SC.MenuPane.SMALL_MENU_ITEM_SEPARATOR_HEIGHT = 7;
SC.MenuPane.SMALL_MENU_HEIGHT_PADDING        = 6;

SC.MenuPane.LARGE_MENU_ITEM_HEIGHT           = 31;
SC.MenuPane.LARGE_MENU_ITEM_SEPARATOR_HEIGHT = 9;
SC.MenuPane.LARGE_MENU_HEIGHT_PADDING        = 8;

Me.SQUARE_MENU_ITEM_HEIGHT           = 31;
Me.SQUARE_MENU_ITEM_SEPARATOR_HEIGHT = 7;
Me.SQUARE_MENU_HEIGHT_PADDING        = 6;

