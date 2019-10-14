/** 
* Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
* 
* IMPORTANT NOTE: This file is licensed only for use on Apple-branded
* computers and is subject to the terms and conditions of the Apple Software
* License Agreement accompanying the package this file is a part of.
* You may not port this file to another platform without Apple's written consent.
* 
* IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
* of the Apple Software and is subject to the terms and conditions of the Apple
* Software License Agreement accompanying the package this file is part of.
**/

// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

CC.XcodeServer = CC.XcodeServer || new Object();
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.



CC.XcodeServer.ActivityQueueContext = Class.create({
	mQueue: null,
	mPopper: null,
	mDisarmed: false,
	initialize: function(inQueue, inPopper) {
		this.mQueue = inQueue;
		this.mPopper = inPopper;
	},
	ready: function() {
		if (this.mDisarmed)
			return;
		
		this.mDisarmed = true;
		this.mQueue.subscribe(this.mPopper);
	}
});

CC.XcodeServer.ActivityQueue = Class.create({
	mPendingMessages: null,
	mBlockedAt: null,
	mCoalesce: false,
	initialize: function(inOptCoalesce) {
		this.mPendingMessages = [];
		this.mBlockedAt = [];
		if (inOptCoalesce !== undefined)
			this.mCoalesce = inOptCoalesce;
	},
	push: function(inMessageOrObject, inObj, inOptExtras) {
		var message = (inMessageOrObject == CC.XcodeServer.NOTIFICATION_BOT_RUN_ACTIVITY_STREAM_UPDATE) ? inOptExtras.activity : inMessageOrObject;
		if (!Object.isArray(message))
			message = [message];
		
		for (var i = 0; i < message.length; i++)
		{
			if (this.mBlockedAt.length > 0)
				this._execute(this.mBlockedAt.shift(), message[i]);
			else
				this._coalesceAndAppend(message[i]);
		}
	},
	pop: function(inPopper) {
		if (this.mPendingMessages.length > 0)
			this._execute(inPopper, this.mPendingMessages.shift());
		else
			this.mBlockedAt.push(inPopper);
	},
	subscribe: function(inPopper) {
		var context = new CC.XcodeServer.ActivityQueueContext(this, inPopper);
		this.pop(function(inActivity){
			inPopper(inActivity, context);
		});
	},
	_execute: function(inPopper, inMessage) {
		CC.RunLoop.nextTick(function(){
			inPopper(inMessage);
		}, inMessage);
	},
	_coalesceAndAppend: function(inMessage) {
		if (!this.mCoalesce ||
			 CC.XcodeServer.ActivityQueue.COALESCING_ACTIVITY_TYPES.indexOf(inMessage.action) == -1)
		{
			this.mPendingMessages.push(inMessage);
			return;
		}
		
		for (var i = 0; i < this.mPendingMessages.length; i++)
		{
			if (this.mPendingMessages[i].action == inMessage.action &&
				this.mPendingMessages[i].entityGUID == inMessage.entityGUID)
				return;
		}
		
		this.mPendingMessages.push(inMessage);
	}
});

CC.XcodeServer.ActivityQueue.COALESCING_ACTIVITY_TYPES = ['com.apple.activity.EntityUpdated'];
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

CC.XcodeServer.getSelectedOption = function(inSelect) {
	if (inSelect == undefined) return;
	return inSelect.select('option')[inSelect.selectedIndex];
};

CC.XcodeServer.getNameAttributeForSelectedOption = function(inSelect) {
	if (inSelect == undefined) return;
	var option = CC.XcodeServer.getSelectedOption(inSelect);
	if (option) return option.getAttribute('name');
};

CC.XcodeServer.setSelectedOptionWithName = function(inSelect, inName) {
	if (inSelect == undefined || inName == undefined) return;
	var options = inSelect.select('option');
	var newOption = inSelect.down('option[name="%@"]'.fmt(inName));
	if (newOption) {
		inSelect.selectedIndex = options.indexOf(newOption);
	}
};

CC.XcodeServer.buttonElementWithAction = function(tabIndex, inTitle, inCallback) {	
	var el = Builder.node('div', {'tabindex': tabIndex, 'role': 'button', className: 'xc-translucent-button'}, inTitle);
	el.addEventListener('click', inCallback, false);
	return el;
};

CC.XcodeServer.getDeviceImageUrl = function(inUTI, inPlatformIdentifier, inSize) {
	var url = "/xcs/deviceimage";
	var queryParamArray = [];
	if (inUTI) queryParamArray.push("modelUTI=%@".fmt(inUTI));
	if (inPlatformIdentifier) queryParamArray.push("platformIdentifier=%@".fmt(inPlatformIdentifier));
	if (inSize) queryParamArray.push("size=%@".fmt(inSize));
	if (queryParamArray.length > 0) {
		url += ("?" + queryParamArray.join("&"));
	}
	return url;
};

CC.XcodeServer.getDeviceImageUrlRetinaAutoResize = function(inUTI, inPlatformIdentifier, inSize) {
	if (hidpi().isHiDPI()) {
		inSize *= 2;
	}
	return CC.XcodeServer.getDeviceImageUrl(inUTI, inPlatformIdentifier, inSize);
};

CC.XcodeServer.botEntityURLForTinyIDAndOptionalIntegrationNumberAndTabName = function(inTinyID, inOptIntegrationNumber, inOptTabName) {
	var tinyId = inTinyID;
	if (!inTinyID) {
		var botGUID = CC.meta('x-apple-entity-guid');
		if (botGUID === undefined) {
			return undefined;
		}
		else {
			tinyId = botGUID;
		}
	}
	var urlString = "/xcode/bots/%@".fmt(tinyId);
	if (inOptIntegrationNumber !== undefined && inOptIntegrationNumber !== null) {
		urlString += "/integration/%@".fmt(inOptIntegrationNumber);
	}
	if (inOptTabName !== undefined && inOptTabName !== null) {
		urlString += "/%@".fmt(inOptTabName);
	}
	return urlString;
};
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

CC.MenuItems.BigScreen = Class.create(CC.MenuItem, {
	mDisplayTitle: '_MenuItem.BigScreen'.loc(),
	mClassName: 'big-screen',
	mURL: '/xcode/bigscreen',
	itemShouldDisplay: function() {
		return (browser().isWebKit() && !browser().isMobileSafari());
	},
	getAccessibilityID: function() {
		return accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_NAV_SCOREBOARD);
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

CC.XcodeServer.BotInfoView = Class.create(CC.Mvc.View, {
	mClassName: 'xc-bot-info-view',
	mReadOnly: false,
	mHasOneRepo: false,
	initialize: function($super, inReadOnly) {
		$super();
		if (inReadOnly) {
			this.mReadOnly = true;
		}
	},
	render: function() {
		
		var tabIndex = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_INFO_VIEW);
				
		if (this.mReadOnly) {
			var repositoryNode = Builder.node('div', {'className': 'repository'} /* Built dynamically */);
			var branchNode = Builder.node('div', {'className': 'scmBranch'}, 'master');
		}
		else {
			var repositoryNode = Builder.node('select', {'tabindex': ++tabIndex, 'role': 'listbox', 'className': 'repository'} /* Built dynamically */);
			var branchNode = Builder.node('input', {'tabindex': ++tabIndex, 'role': 'textbox', 'type': 'text', 'placeholder': "_XC.BotInfoView.BranchName.Placeholder".loc(), 'className': 'scmBranch', 'value': 'master'});
			Event.observe(repositoryNode, 'change', this.handleSelectedRepositoryChanged.bind(this));
		}
		
		var projectPathNode = Builder.node('input', {'tabindex': ++tabIndex, 'role': 'textbox', 'type': 'text', 'placeholder': "_XC.BotInfoView.WorkspaceOrProjectPath.Placeholder".loc(), 'className': 'workspaceOrProjectPath'});
		var schemeNode = Builder.node('input', {'tabindex': ++tabIndex, 'role': 'textbox', 'type': 'text', 'placeholder': "_XC.BotInfoView.SchemeName.Placeholder".loc(), 'className': 'buildSchemeName'});
		var botNameNode = Builder.node('input', {'tabindex': ++tabIndex, 'role': 'textbox', 'type': 'text', 'placeholder': "_XC.BotInfoView.Title.Placeholder".loc(), 'className': 'botTitle'});
		
		var elem = Builder.node('div', {className: 'git'}, [
			Builder.node('div', {className: 'field'}, [
				Builder.node('span', "_XC.BotInfoView.Repository.Label".loc()),
				repositoryNode
			]),
			Builder.node('div', {className: 'field gitonly'}, [
				Builder.node('span', "_XC.BotInfoView.BranchName.Label".loc()),
				branchNode
			]),
			Builder.node('div', {className: 'field'}, [
				Builder.node('span', "_XC.BotInfoView.WorkspaceOrProjectPath.Label".loc()),
				projectPathNode,
				Builder.node('div', {className: 'label'}, "_XC.BotInfoView.WorkspaceOrProjectPath.Description".loc())
			]),
			Builder.node('div', {className: 'field'}, [
				Builder.node('span', "_XC.BotInfoView.SchemeName.Label".loc()),
				schemeNode,
				Builder.node('div', {className: 'label'}, "_XC.BotInfoView.SchemeName.Description".loc())
			]),
			Builder.node('div', {className: 'field'}, [
				Builder.node('span', "_XC.BotInfoView.Title.Label".loc()),
				botNameNode
			]),
			Builder.node('div', {className: 'checkbox'}, [
				Builder.node('label', [
					Builder.node('input', {'tabindex': ++tabIndex, 'role': 'checkbox', type: 'checkbox', 'className': 'integrateImmediately'}),
					"_XC.BotInfoView.IntegrateImmediately.Label".loc()
				])
			])
		]);
		return elem;
	},
	renderRemoteBranchDiv: function() {
		var branchNode = this.$('.field.gitonly');
		branchNode.removeChild(branchNode.querySelector('.scmBranch'));
		var branchInputNode = Builder.node('div', {'className': 'scmBranch'}, 'master');
		branchNode.appendChild(branchInputNode);
	},
	renderRemoteMultipleBranchesDiv: function(inFirstBranchName, inExtraBranchesCount) {
		var branchNode = this.$('.field.gitonly');
		branchNode.removeChild(branchNode.querySelector('.scmBranch'));
		var branchInputNode = Builder.node('div', {'className': 'scmBranch'});
		branchInputNode.appendChild(Builder.node('div', inFirstBranchName));
		
		if (inExtraBranchesCount > 0) {
			if (inExtraBranchesCount == 1) {
				branchInputNode.appendChild(Builder.node('div', "_XC.BotInfoView.Repository.Singular.ExtraBranch".loc(inExtraBranchesCount)));
			}
			else {
				branchInputNode.appendChild(Builder.node('div', "_XC.BotInfoView.Repository.Plural.ExtraBranch".loc(inExtraBranchesCount)));
			}
		}
		branchNode.appendChild(branchInputNode);
	},
	renderRemoteBranchInput: function() {
		var tabIndex = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_INFO_VIEW);
		
		var branchNode = this.$('.field.gitonly');
		branchNode.removeChild(branchNode.querySelector('.scmBranch'));
		var branchInputNode = Builder.node('input', {'tabindex': ++tabIndex, 'role': 'textbox', 'type': 'text', 'placeholder': "_XC.BotInfoView.BranchName.Placeholder".loc(), 'className': 'scmBranch', 'value': 'master'});
		branchNode.appendChild(branchInputNode);
	},
	renderRemoteRepositoryOption: function(inRemoteRepositoryDict) {
		if (inRemoteRepositoryDict.scmGUID && inRemoteRepositoryDict.scmRepoType && inRemoteRepositoryDict.scmRepoPath) {
			var displayName = inRemoteRepositoryDict.scmRepoPath;
			if (inRemoteRepositoryDict.isLocal) {
				displayName = "_XC.BotInfoView.Repository.HostedLocally.Title".loc(inRemoteRepositoryDict.displayName, window.location.hostname);
			} else if (inRemoteRepositoryDict.displayName && inRemoteRepositoryDict.displayName != inRemoteRepositoryDict.scmRepoPath) {
				displayName = "_XC.BotInfoView.Repository.Remote.Title".loc(inRemoteRepositoryDict.displayName, inRemoteRepositoryDict.scmRepoPath);
			}
			
			if (this.mReadOnly) {
				return Builder.node('div', {
					'name': inRemoteRepositoryDict.scmGUID,
					'data-guid': inRemoteRepositoryDict.scmGUID,
					'data-type': inRemoteRepositoryDict.scmRepoType,
					'data-uri': inRemoteRepositoryDict.scmRepoPath
				}, displayName);
			}
			else {
				return Builder.node('option', {
					'role': 'option',
					'name': inRemoteRepositoryDict.scmGUID,
					'data-guid': inRemoteRepositoryDict.scmGUID,
					'data-type': inRemoteRepositoryDict.scmRepoType,
					'data-uri': inRemoteRepositoryDict.scmRepoPath
				}, displayName);
			}
		}
	},
	configureRemoteRepositories: function(inSCMInfos) {
		if (this.mReadOnly) {
			var select = this.$().down('div.repository');
		}
		else {
			var select = this.$().down('select.repository');
		}
		
		var repositoriesFailingToRender = 0;
		if (inSCMInfos && inSCMInfos.length) {
			select.removeAttribute('disabled');
			for (var idx = 0; idx < inSCMInfos.length; idx++) {
				var renderedRepository = this.renderRemoteRepositoryOption(inSCMInfos[idx]);
				if (!renderedRepository) {
					repositoriesFailingToRender++;
					continue;
				}
				select.appendChild(renderedRepository);
			}
		}
		if (!inSCMInfos || inSCMInfos.length == 0 || (repositoriesFailingToRender == inSCMInfos.length)) {
			select.innerHTML = "";
			if (!this.mReadOnly) {
				select.appendChild(Builder.node('option', "_XC.BotInfoView.Repository.NoRepositories.Description".loc()));
				select.setAttribute('disabled', true);
			}
		}
		if (!this.mReadOnly) {
			this.handleSelectedRepositoryChanged();
		}
	},
	updateForBotEntity: function(inBotEntity) {
		if (!inBotEntity) return;
		var xattrs = inBotEntity.extendedAttributes;
		// var scmInfo = (xattrs && xattrs.scmInfo && xattrs.scmInfo["/"] || {});
		var scmInfo = (xattrs && xattrs.scmInfo || {});
		if (Object.keys(scmInfo).length == 1) {
			this.renderRemoteBranchInput();
			this.mHasOneRepo = true;
		}
		else {
			this.renderRemoteBranchDiv();
			this.mHasOneRepo = false;
		}
		
		var scmInfo = (scmInfo && scmInfo["/"] || {})
		if (scmInfo.scmBranch && this.mReadOnly && !this.mHasOneRepo) {
			this.$('.scmBranch').textContent = scmInfo.scmBranch;
		}
		else if (scmInfo.scmBranch && this.mReadOnly && this.mHasOneRepo) {
			this.$('.scmBranch').value = scmInfo.scmBranch;
		}
		else if (scmInfo.scmBranch === undefined && !this.mHasOneRepo) {
			scmInfo = xattrs.scmInfo;
			var isFirstRepo = true;
			var firstRepoBranchName = "";
			var extraBranchesCount = 0;
			for (var key in scmInfo) {
				if(isFirstRepo) {
					firstRepoBranchName = (scmInfo && scmInfo[key] && scmInfo[key].scmBranch);
					isFirstRepo = false;
				}
				else {
					extraBranchesCount++;
				}
			}
			
			this.renderRemoteMultipleBranchesDiv(firstRepoBranchName, extraBranchesCount);
		}
		
		
		if (xattrs.buildSchemeName) this.$('input.buildSchemeName').setValue(xattrs.buildSchemeName);
		var workspaceOrProjectPath = (xattrs.buildWorkspacePath || xattrs.buildProjectPath);
		this.$('input.workspaceOrProjectPath').setValue(workspaceOrProjectPath);
		var scmInfoGUID = (xattrs && xattrs.scmInfoGUIDMap);
		var scmInfoGUIDArray = [];
		for (var key in scmInfoGUID) {
			scmInfoGUIDArray.push(scmInfoGUID[key]);
		}
		
		if (scmInfoGUIDArray && scmInfoGUIDArray.length && this.mReadOnly) {
			var selects = this.$().querySelectorAll('div.repository div');
			var firstRepoFound = false;
			var extraRepoCount = 0;
			
			for (var i = 0; i < selects.length; i++) {
				var selectName = selects[i].getAttribute('name');
				if (scmInfoGUIDArray.indexOf(selectName) == -1 && this.mReadOnly) {
					selects[i].remove();
				}
				else {
					if (firstRepoFound) {
						extraRepoCount++;
						selects[i].remove();
					}
					else {
						firstRepoFound = true;
					}
				}
			}
			
			if (extraRepoCount > 0) {
				if (extraRepoCount == 1) {
					var extraRepoNode = Builder.node('div', "_XC.BotInfoView.Repository.Singular.ExtraRepository".loc(extraRepoCount));
				}
				else {
					var extraRepoNode = Builder.node('div', "_XC.BotInfoView.Repository.Plural.ExtraRepository".loc(extraRepoCount));
				}
				this.$().querySelector('div.repository').appendChild(extraRepoNode);
			}
		}
		var longName = inBotEntity.longName;
		if (longName) this.$('input.botTitle').setValue(longName);
		if (!this.mReadOnly) {
			this.handleSelectedRepositoryChanged();
		}
	},
	handleSelectedRepositoryChanged: function(inEvent) {
		var select = this.$().down('select.repository');
		var selectedOption = CC.XcodeServer.getSelectedOption(select);
		var scmType = selectedOption.getAttribute('data-type');
		this.$().removeClassName('svn').removeClassName('git');
		this.$().addClassName(scmType);
	},
	getExtendedAttributesFromState: function() {
		var extendedAttributes = {};
		var scmInfoDict = {};
		
		if (!this.mReadOnly) {
			var select = this.$().down('select.repository');
			var selectedOption = CC.XcodeServer.getSelectedOption(select);
			var scmType = selectedOption.getAttribute('data-type');
			if (scmType == "git") {
				var scmBranch = this.$().down('input.scmBranch').getValue();
				scmInfoDict['scmBranch'] = scmBranch;
			}
			extendedAttributes['scmInfo'] = {
				'/': scmInfoDict
			}
			var scmGUID = selectedOption.getAttribute('name');
			extendedAttributes['scmInfoGUIDMap'] = {
				'/': scmGUID
			}
		}
		else if (this.mReadOnly && this.mHasOneRepo) {
			var scmRepoNode = this.$('.repository div');
			var scmType = scmRepoNode.getAttribute('data-type');
			if (scmType == "git") {
				var scmBranch = this.$().down('input.scmBranch').getValue();
				scmInfoDict['scmBranch'] = scmBranch;
				extendedAttributes['scmInfo'] = {
					'/': scmInfoDict
				}
			}
		}
		var workspaceOrProjectPath = this.$('input.workspaceOrProjectPath').getValue();
		if (workspaceOrProjectPath.match(/workspace/)) {
			extendedAttributes['buildWorkspacePath'] = workspaceOrProjectPath;
		} else {
			extendedAttributes['buildProjectPath'] = workspaceOrProjectPath;
		}
		var buildSchemeName = this.$('input.buildSchemeName').getValue();
		extendedAttributes['buildSchemeName'] = buildSchemeName;			
		return extendedAttributes;
	},
	getBotTitleFromState: function() {
		return this.$().down('input.botTitle').getValue();
	}
});

CC.XcodeServer.BotScheduleInfoView = Class.create(CC.Mvc.View, {
	mClassName: 'xc-bot-schedule-view',
	mScheduleEditorView: null,
	mCleanBuildScheduleEditorView: null,
	render: function() {
		
		var tabIndex = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_SCHEDULE_VIEW);
		
		// Create a bot schedule view we can include in this view.
		this.mScheduleEditorView = new CC.XcodeServer.BotRunScheduleEditorView();
		this.mCleanBuildScheduleEditorView = new CC.XcodeServer.BotRunCleanBuildScheduleEditorView();
		return Builder.node('div', [
			Builder.node('div', {className: 'field'}, [
				Builder.node('span', "_XC.BotScheduleInfoView.Schedule.Label".loc()),
				this.mScheduleEditorView._render()
			]),
			Builder.node('div', {className: 'field'}, [
				Builder.node('span', "_XC.BotScheduleInfoView.Actions.Label".loc()),
				Builder.node('div', {className: 'checkbox'}, [
					Builder.node('label', [
						Builder.node('input', {'tabindex': ++tabIndex, 'role': 'checkbox', type: 'checkbox', 'checked': true, 'className': 'integratePerformsAnalyze'}),
						"_XC.BotScheduleInfoView.IntegratePerformsAnalyze.Checkbox.Label".loc()
					])
				]),
				Builder.node('div', {className: 'checkbox'}, [
					Builder.node('label', [
						Builder.node('input', {'tabindex': ++tabIndex, 'role': 'checkbox', type: 'checkbox', 'checked': true, 'className': 'integratePerformsTest'}),
						"_XC.BotScheduleInfoView.IntegratePerformsTest.Checkbox.Label".loc()
					])
				]),
				Builder.node('div', {className: 'checkbox'}, [
					Builder.node('label', [
						Builder.node('input', {'tabindex': ++tabIndex, 'role': 'checkbox', type: 'checkbox', 'checked': true, 'className': 'integratePerformsArchive'}),
						"_XC.BotScheduleInfoView.IntegratePerformsArchive.Checkbox.Label".loc()
					])
				])
			]),
			Builder.node('div', {className: 'field'}, [
				Builder.node('span', "_XC.BotScheduleInfoView.BuildFromClean.Label".loc()),
				this.mCleanBuildScheduleEditorView._render()
			])
		]);
	},
	updateForBotEntity: function(inBotEntity, inWorkScheduleEntity) {
		var scheduleEditorView = this.mScheduleEditorView;
		var recurrence = (inWorkScheduleEntity && inWorkScheduleEntity.recurrences && inWorkScheduleEntity.recurrences[0]);
		scheduleEditorView.setScheduleRecurrence(recurrence);
		// Update schedule type.
		var scheduleType = 'manual';
		if (recurrence) scheduleType = "periodic";
		if (inBotEntity.extendedAttributes && inBotEntity.extendedAttributes['pollForSCMChanges']) scheduleType = "poll";
		if (inBotEntity.extendedAttributes && inBotEntity.extendedAttributes['buildOnTrigger']) scheduleType = "trigger";
		this.mScheduleEditorView.setScheduleType(scheduleType);
		
		// Clean preference.
		var buildFromClean = (inBotEntity.extendedAttributes && inBotEntity.extendedAttributes['buildFromClean']);
		this.mCleanBuildScheduleEditorView.setCleanBuildSchedule(buildFromClean);
		
		// Integration preferences.
		var integratePerformsAnalyze = (inBotEntity.extendedAttributes && inBotEntity.extendedAttributes['integratePerformsAnalyze']);
		this.$('input.integratePerformsAnalyze').checked = (integratePerformsAnalyze == true);
		var integratePerformsTest = (inBotEntity.extendedAttributes && inBotEntity.extendedAttributes['integratePerformsTest']);
		this.$('input.integratePerformsTest').checked = (integratePerformsTest == true);
		var integratePerformsArchive = (inBotEntity.extendedAttributes && inBotEntity.extendedAttributes['integratePerformsArchive']);
		this.$('input.integratePerformsArchive').checked = (integratePerformsArchive == true);
	},
	getExtendedAttributesFromState: function() {
		var extendedAttributes = {};
		// Sniff the trigger/poll settings.
		var scheduleTypeSelect = this.$('select.scheduletype');
		var selectedScheduleTypeOption = scheduleTypeSelect.select('option')[scheduleTypeSelect.selectedIndex];
		var selectedScheduleType = selectedScheduleTypeOption.getAttribute('name');
		// Merge in extended attributes not covered by the bot info view.
		extendedAttributes['pollForSCMChanges'] = (selectedScheduleType == "poll");
		extendedAttributes['buildOnTrigger'] = (selectedScheduleType == "trigger");
		extendedAttributes['buildFromClean'] = this.mCleanBuildScheduleEditorView.getCleanBuildSchedule();
		extendedAttributes['integratePerformsAnalyze'] = this.$('input.integratePerformsAnalyze').checked;
		extendedAttributes['integratePerformsTest'] = this.$('input.integratePerformsTest').checked;
		extendedAttributes['integratePerformsArchive'] = this.$('input.integratePerformsArchive').checked;
		return extendedAttributes;
	}
});

CC.XcodeServer.BotTestingInfoView = Class.create(CC.Mvc.View, {
	mClassName: 'xc-bot-testing-info-view',
	render: function() {
		
		var tabIndex = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_TESTING_VIEW);
		
		var elem = Builder.node('div', [
			Builder.node('div', {className: 'field'}, [
				Builder.node('span', "_XC.BotTestingInfoView.Label".loc()),
				Builder.node('div', {className: 'details'}, [
					Builder.node('div', [
						Builder.node('label', [
							Builder.node('input', {'tabindex': ++tabIndex, 'role': 'radio', className: 'mac', 'type': 'radio', 'name': 'platform', 'value': 'mac', 'checked': true}),
							"_XC.BotTestingInfoView.Type.Mac".loc()
						]),
						Builder.node('label', [
							Builder.node('input', {'tabindex': ++tabIndex, 'role': 'radio', className: 'ios', 'type': 'radio', 'name': 'platform', 'value': 'ios'}),
							"_XC.BotTestingInfoView.Type.iOS".loc()
						])
					]),
					Builder.node('label', [
						"_XC.BotTestingInfoView.RunTestsOn".loc(),
						Builder.node('select', {'tabindex': ++tabIndex, 'role': 'listbox', className: 'deviceSpecification'}, [
							//Builder.node('option', {'tabindex': ++tabIndex, 'role': 'option', 'name': 'allDevicesAndSimulators'}, "_XC.BotTestingInfoView.RunTestsOn.AllDevicesAndSimulators".loc()),
							Builder.node('option', {'tabindex': ++tabIndex, 'role': 'option', 'name': 'allDevices'}, "_XC.BotTestingInfoView.RunTestsOn.AllDevices".loc()),
							Builder.node('option', {'tabindex': ++tabIndex, 'role': 'option', 'name': 'allSimulators'}, "_XC.BotTestingInfoView.RunTestsOn.AllSimulators".loc()),
							Builder.node('option', {'tabindex': ++tabIndex, 'role': 'option', 'name': 'specificDevices'}, "_XC.BotTestingInfoView.RunTestsOn.SpecificDevices".loc())
						])
					]),
					Builder.node('div', {'tabindex': ++tabIndex, 'aria-label': "_XC.Accessibility.Label.Devices".loc(), className: 'devices'})
				])
			])
		]);
		Event.observe(elem.down('input.mac'), 'change', this.handleRadioButtonChanged.bind(this));
		Event.observe(elem.down('input.ios'), 'change', this.handleRadioButtonChanged.bind(this));
		Event.observe(elem.down('select'), 'change', this.handleDeviceSpecificationPopupChanged.bind(this));
		return elem;
	},
	__getSelectedRadioButtonValue: function() {
		var radioButtons = this.$().select('input[type="radio"]');
		var radioButton;
		for (var rdx = 0; rdx < radioButtons.length; rdx++) {
			radioButton = radioButtons[rdx];
			if (radioButton && radioButton.checked) break;
		}
		var selectedRadioValue = radioButton.getValue();
		return selectedRadioValue;
	},
	handleRadioButtonChanged: function(inEvent) {
		var selectedRadioValue = this.__getSelectedRadioButtonValue();
		this.$().removeClassName('mac').removeClassName('ios');
		this.$().addClassName(selectedRadioValue);
	},
	handleDeviceSpecificationPopupChanged: function(inEvent) {
		var select = this.$().down('select.deviceSpecification');
		var selectedValue = CC.XcodeServer.getNameAttributeForSelectedOption(select);
		this.$().removeClassName('specific');
		if (selectedValue == "specificDevices") {
			this.$().addClassName('specific');
		}
	},
	configureDevices: function(inDevices) {
		if (!inDevices || inDevices.length == 0) {
			return;
		}
		// Bucket devices into simulators and physical devices.
		var simulators = [];
		var realDevices = [];
		$(inDevices).each(function(device) {
			if (!device || !device.guid || !device.adcDeviceIsConnected || !device.adcDeviceIsSupported) {
				return;
			}
			if (device.adcDeviceType == "com.apple.mac") {
				return;
			}
			(device.adcDeviceType == "com.apple.iphone-simulator") ? simulators.push(device) : realDevices.push(device);
		});
		var sortedRealDevices = $A(realDevices).sortBy(function(x) {
			return x.adcDeviceName;
		});
		var sortedSimulators = [];
		// Bucket the simulators by name first, then software version.
		var bucketedSimulators = {};
		var bucketedSimulatorNames = [];
		for (var sdx = 0; sdx < simulators.length; sdx++) {
			var simulatorDeviceName = simulators[sdx].adcDeviceName;
			if (!bucketedSimulators[simulatorDeviceName]) {
				bucketedSimulators[simulatorDeviceName] = [];
				bucketedSimulatorNames.push(simulatorDeviceName);
			}
			bucketedSimulators[simulatorDeviceName].push(simulators[sdx]);
		}
		var sortedSimulatorNames = $(bucketedSimulatorNames).uniq().sort();
		for (var idx = 0; idx < sortedSimulatorNames.length; idx++) {
			var simulatorsForName = bucketedSimulators[sortedSimulatorNames[idx]];
			var sortedSimulatorsBySoftwareVersion = $A(simulatorsForName).sortBy(function(x) {
				return parseFloat(x.adcDeviceSoftwareVersion);
			});
			sortedSimulators = sortedSimulators.concat(sortedSimulatorsBySoftwareVersion);
		}
		// Draw the device list.
		var drawDeviceCheckbox = function(device) {
			var guid = device.guid;
			var deviceName = (device.adcDeviceName || "_XC.BotTestingInfoView.UnknownDevice".loc());
			var deviceSoftwareVersion = (device.adcDeviceSoftwareVersion || "_XC.BotTestingInfoView.UnknownSoftwareVersion".loc());
			var tabIndex = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_TESTING_VIEW_DEVICES);
			var checkbox = Builder.node('label', {'className': "ellipsis"}, [
				Builder.node('input', {'tabindex': tabIndex, 'role': 'checkbox', 'type': 'checkbox', 'className': 'device', 'data-guid': guid}),
				Builder.node('span', {'className': 'name'}, deviceName),
				Builder.node('span', {'className': 'version'}, deviceSoftwareVersion)
			]);
			return checkbox;
		}
		var fragment = document.createDocumentFragment();
		if (sortedRealDevices.length > 0) {
			fragment.appendChild(Builder.node('div', {'className': 'seperator'}, "_XC.BotTestingInfoView.Seperator.Devices".loc()));
			sortedRealDevices.each(function(x) {
				fragment.appendChild(drawDeviceCheckbox(x));
			});
		}
		if (sortedSimulators.length > 0) {
			fragment.appendChild(Builder.node('div', {'className': 'seperator'}, "_XC.BotTestingInfoView.Seperator.Simulators".loc()));
			sortedSimulators.each(function(x) {
				fragment.appendChild(drawDeviceCheckbox(x));
			});
		}
		if (sortedRealDevices.length == 0 && sortedSimulators.length == 0) {
			fragment.appendChild(Builder.node('div', {'className': 'placeholder'}, "_XC.BotTestingInfoView.NoDevices.Placeholder".loc()));
		}
		var devicesElement = this.$().down('div.devices');
		devicesElement.innerHTML = "";
		devicesElement.appendChild(fragment);
	},
	updateForBotEntity: function(inBotEntity) {
		var extendedAttributes = ((inBotEntity || {}).extendedAttributes || {});
		var deviceSpecification = extendedAttributes['deviceSpecification'];
		// Update the device specification popup to reflect the selected option.
		var specificationSelect = this.$().down('select.deviceSpecification');
		CC.XcodeServer.setSelectedOptionWithName(specificationSelect, deviceSpecification);
		// If the bot device specification is configured to specific devices, go through and
		// check whatever devices are included in extendedAttributes.deviceInfo.
		if (deviceSpecification == 'specificDevices') {
			this.$().addClassName('specific');
			var deviceInfo = (extendedAttributes.deviceInfo || []);
			var checkboxes = this.$().select('input[type="checkbox"]');
			for (var checkboxIdx = 0; checkboxIdx < checkboxes.length; checkboxIdx++) {
				var checkbox = checkboxes[checkboxIdx];
				checkbox.removeAttribute('checked');
				var checkboxDeviceGUID = checkbox.getAttribute('data-guid');
				if (deviceInfo.indexOf(checkboxDeviceGUID) != -1) {
					checkbox.setAttribute('checked', true);
				}
			}
		} else {
			this.$().removeClassName('specific');
		}
		// If the device specification key is not set, assume this is a Mac project.
		this.$().removeClassName('mac').removeClassName('ios');
		this.$().select('input[type="radio"]').invoke('removeAttribute', 'checked');
		if (!deviceSpecification) {
			this.$().addClassName('mac');
			this.$().down('input.mac').setAttribute('checked', true);
		} else {
			this.$().addClassName('ios');
			this.$().down('input.ios').setAttribute('checked', true);
		}
	},
	getExtendedAttributesFromState: function() {
		var extendedAttributes = {
			'deviceSpecification': null,
			'deviceInfo': []
		};
		var selectedRadioButtonName = this.__getSelectedRadioButtonValue();
		if (selectedRadioButtonName == 'mac') {
			return extendedAttributes;
		}
		var specificationSelect = this.$().down('select.deviceSpecification');
		var selectedSpecificationName = CC.XcodeServer.getNameAttributeForSelectedOption(specificationSelect);
		extendedAttributes['deviceSpecification'] = selectedSpecificationName;
		if (selectedSpecificationName == 'specificDevices') {
			var deviceInfoArray = [];
			var checkboxes = this.$().select('input[type="checkbox"]');
			for (var checkboxIdx = 0; checkboxIdx < checkboxes.length; checkboxIdx++) {
				var checkbox = checkboxes[checkboxIdx];
				if (checkbox.checked == true) {
					var deviceGUID = checkbox.getAttribute('data-guid');
					if (deviceGUID) deviceInfoArray.push(deviceGUID);
				}
			}
			extendedAttributes['deviceInfo'] = deviceInfoArray;
		}
		return extendedAttributes;
	}	
});

CC.XcodeServer.BotNotificationsInfoView = Class.create(CC.Mvc.View, {
	mClassName: 'xc-bot-notifications-info-view',
	render: function() {
		
		var tabIndex = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_NOTIFICATION_VIEW);
		
		return Builder.node('div', [
			Builder.node('div', {className: 'field'}, [
				Builder.node('span', "_XC.BotNotificationsInfoView.OnSuccess.Label".loc()),
				Builder.node('div', {className: 'checkbox'}, [
					Builder.node('label', [
						Builder.node('input', {'tabindex': ++tabIndex, 'role': 'checkbox', type: 'checkbox', 'className': 'emailCommittersOnSuccess'}),
						"_XC.BotNotificationsInfoView.OnSuccess.Checkbox.Label".loc()
					])
				]),
				Builder.node('div', {className: 'additionalRecipients label'}, "_XC.BotNotificationsInfoView.AdditionalEmails.Label".loc()),
				Builder.node('textarea', {'tabindex': ++tabIndex, 'role': 'textbox', className: 'additionalRecipients success', placeholder: "_XC.BotNotificationsInfoView.AdditionalEmails.Placeholder".loc()})
			]),
			Builder.node('div', {className: 'field'}, [
				Builder.node('span', "_XC.BotNotificationsInfoView.OnFailure.Label".loc()),
				Builder.node('div', {className: 'checkbox'}, [
					Builder.node('label', [
						Builder.node('input', {'tabindex': ++tabIndex, 'role': 'checkbox', type: 'checkbox', 'className': 'emailCommittersOnFailure', 'checked': true}),
						"_XC.BotNotificationsInfoView.OnFailure.Checkbox.Label".loc()
					])
				]),
				Builder.node('div', {className: 'additionalRecipients label'}, "_XC.BotNotificationsInfoView.AdditionalEmails.Label".loc()),
				Builder.node('textarea', {'tabindex': ++tabIndex, 'role': 'textbox', className: 'additionalRecipients failure', placeholder: "_XC.BotNotificationsInfoView.AdditionalEmails.Placeholder".loc()})
			])
		]);
	},
	getNotifyCommitterOnSuccessValue: function() {
		return this.$('input.emailCommittersOnSuccess').checked;
	},
	getNotifyCommitterOnFailureValue: function() {
		return this.$('input.emailCommittersOnFailure').checked;
	},
	getExtraSuccessStateRecipients: function() {
		var successTextarea = this.$().down('textarea.success');
		return this.__getEmailAddressesFromTextarea(successTextarea);
	},
	getExtraFailureStateRecipients: function() {
		var failureTextarea = this.$().down('textarea.failure');
		return this.__getEmailAddressesFromTextarea(failureTextarea);
	},
	__getEmailAddressesFromTextarea: function(inTextarea) {
		var value = $(inTextarea).getValue();
		// First split on whitespace.
		var split = value.split(/\s+/);
		var result = [], splitItem;
		for (var idx = 0; idx < split.length; idx++) {
			// Remove any trailing commas.
			splitItem = split[idx];
			splitItem = splitItem.replace(/[\s,]+$/g, "");
			if (splitItem && splitItem.match(/@/)) result.push(splitItem);
			
		}
		return result;
	},
	updateForBotEntity: function(inBotEntity, inEmailSubscriptionSuccessList, inEmailSubscriptionFailureList) {
		var notifyCommitterOnFailure = (inBotEntity && inBotEntity.notifyCommitterOnFailure);
		var notifyCommitterOnSuccess = (inBotEntity && inBotEntity.notifyCommitterOnSuccess);
		var emailCommittersOnFailureInput = this.$('input.emailCommittersOnFailure');
		var emailCommittersOnSuccessInput = this.$('input.emailCommittersOnSuccess');
		var emailCommittersOnFailureTextArea = this.$('textarea.additionalRecipients.failure');
		var emailCommittersOnSuccessTextArea = this.$('textarea.additionalRecipients.success');
		emailCommittersOnFailureInput.removeAttribute('checked');
		emailCommittersOnSuccessInput.removeAttribute('checked');
		
		if (notifyCommitterOnFailure) {
			emailCommittersOnFailureInput.setAttribute('checked', notifyCommitterOnFailure);
		}
			
		if (notifyCommitterOnSuccess) {
			emailCommittersOnSuccessInput.setAttribute('checked', notifyCommitterOnSuccess);
		}
		
		if ( inEmailSubscriptionFailureList ) {
			emailCommittersOnFailureTextArea.textContent = inEmailSubscriptionFailureList.join(" ");
		}
		if ( inEmailSubscriptionSuccessList ) {
			emailCommittersOnSuccessTextArea.textContent = inEmailSubscriptionSuccessList.join(" ");
		}
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

CC.XcodeServer.DefaultScheduleMapping = $H({
	'60 minutes': 'Hourly',
	'1 day': 'Daily',
	'1 week': 'Weekly'
});

CC.XcodeServer.localizedNextScheduleString = function(inBotSchedule, inOptTimestampOnly) {
	if (inBotSchedule) {
		if (inBotSchedule.recurrences) {
			var recurrence = inBotSchedule.recurrences[0];
			if (recurrence) {
				var repeatInterval = recurrence.repeatInterval;
				if (repeatInterval) {
					var scheduleKey = CC.XcodeServer.DefaultScheduleMapping.get(repeatInterval);
					if (scheduleKey) {
						var startTime = recurrence.startTime;
						if (startTime) {
							var day = startTime.getDay();
							var hours = startTime.getHours();
							var minutes = startTime.getMinutes();
							var nextSchedule = CC.XcodeServer.nextScheduleTimestampForOptions(scheduleKey.toLowerCase(), day, hours, minutes);
							var localizedTimestamp = globalLocalizationManager().localizedDateTime(nextSchedule);
							if (inOptTimestampOnly) {
								return localizedTimestamp;
							} else {
								return "_XC.Bot.Schedule.Description.%@".fmt(scheduleKey).loc(localizedTimestamp);
							}
						}
					}
				}
			}
			if (!inOptTimestampOnly) return "_XC.Bot.Schedule.Description.Unknown".loc();
		}
	}
	if (!inOptTimestampOnly) return "_XC.Bot.Schedule.Description.Unscheduled".loc();
	return "";
};

// Returns the timestamp as the next point in the future that matches the specified interval. For hourly pick the next
// hour from now, for daily pick tomorrow at the chosen time, and for weekly, pick the upcoming matching day at the
// specified time.

CC.XcodeServer.nextScheduleTimestampForOptions = function(inIntervalName, inDay, inHours, inMinutes) {
	var now = new Date();
	var date = new Date();
	date.setHours(inHours);
	date.setMinutes(inMinutes);
	var nextSchedule;
	if (inIntervalName == "hourly") {
		date.setHours(now.getHours());
		if (date < now) {
			now.setHours(now.getHours() + 1, inMinutes, 0, 0);
		} else {
			now.setHours(now.getHours(), inMinutes, 0, 0);
		}
		nextSchedule = now;
	} else if (inIntervalName == "daily") {
		// If the time has already passed today, adjust to the next day.
		if (date < now) {
			date.setDate(date.getDate() + 1);
		}
		nextSchedule = date;
	} else if (inIntervalName == "weekly") {
		var delta = inDay - now.getDay();
		date.setDate(date.getDate() + delta);
		// If the time has already passed today, adjust to the next week.
		if (date < now) {
			date.setDate(date.getDate() + 7);
		}
		nextSchedule = date;
	} else {
		nextSchedule = new Date();
	}
	// Clear out the millisecond value.
	nextSchedule.setMilliseconds(0);
	return nextSchedule;
};
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.



// Bot schedule view.

CC.XcodeServer.BotRunScheduleEditorView = Class.create(CC.Mvc.View, {
	render: function() {
		var tabIndex = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_SCHEDULE_VIEW_SELECT_BOX);
		var elem = Builder.node('div', {className: 'xc-bot-run-schedule-editor hourly'}, [
			Builder.node('div', {className: 'popup'}, [
				Builder.node('select', {'tabindex': tabIndex, 'role': 'listbox', 'aria-haspopup': 'false', className: 'scheduletype'}, [
					Builder.node('option', {'role': 'option', className: 'manual', 'name': 'manual'}, "_XC.BotRunScheduleEditorView.ScheduleType.Manual".loc()),
					Builder.node('option', {'role': 'option', className: 'periodic', 'name': 'periodic'}, "_XC.BotRunScheduleEditorView.ScheduleType.Periodic".loc()),
					Builder.node('option', {'role': 'option', className: 'poll', 'name': 'poll'}, "_XC.BotRunScheduleEditorView.ScheduleType.Poll".loc()),
					Builder.node('option', {'role': 'option', className: 'trigger', 'name': 'trigger'}, "_XC.BotRunScheduleEditorView.ScheduleType.Trigger".loc())
				])
			]),
			Builder.node('div', {className: 'scheduledetails'})
		]);
		var repeatOptionsString = "";
		CC.XcodeServer.DefaultScheduleMapping.each(function(pair) {
			repeatOptionsString += "<option name=\"%@\" data-schedule=\"%@\">%@</option>".fmt(pair.value.toLowerCase(), pair.key, "_XC.BotRunScheduleEditorView.Schedule.Repeat.%@".fmt(pair.value).loc());
		});
		var repeatSelectHTML = "<select class=\"repeat\">%@</select>".fmt(repeatOptionsString);
		// Also build out a day popup from Monday through Sunday.
		var dayOptionsString = "";
		for (var idx = 0; idx < 7; idx++) {
			var date = new Date();
			date.setDate((idx + 7 - date.getDay()) % 7);
			var localizedDay = globalLocalizationManager().localizedDay(date);
			dayOptionsString += "<option name=\"%@\">%@</option>".fmt(date.getDay(), localizedDay);
		}
		var daySelectHTML = "<select class=\"day\">%@</select>".fmt(dayOptionsString);
		// Also build out a time popup from 12am through to 11.45pm in 15 minute increments.
		var timeOptionsString = "";
		for (var idx = 0; idx < 24; idx++) {
			var am = (idx < 12);
			for (var jdx = 0; jdx < 4; jdx++) {
				var ts = new Date();
				// Adjust the now timestamp with the corect hour and minute value.
				ts.setHours(idx);
				ts.setMinutes(jdx * 15);
				ts.setSeconds(0);
				// Localize the time.
				var localizedTime = globalLocalizationManager().localizedTime(ts);
				timeOptionsString += "<option name=\"%@-%@\">%@</option>".fmt(ts.getHours(), ts.getMinutes(), localizedTime);
			}
		}
		var timeSelectHTML = "<select class=\"time\">%@</select>".fmt(timeOptionsString);
		// Also build out an minutes popup
		var minutesOptionsString = "";
		minutesOptionsString += "<option name=\"%@\">%@</option>".fmt("0", "0");
		minutesOptionsString += "<option name=\"%@\">%@</option>".fmt("15", "15");
		minutesOptionsString += "<option name=\"%@\">%@</option>".fmt("30", "30");
		minutesOptionsString += "<option name=\"%@\">%@</option>".fmt("45", "45");
		var minutesSelectedHTML = "<select class=\"minutes\">%@</select>".fmt(minutesOptionsString);
		
		elem.down('div.scheduledetails').innerHTML = "_XC.BotRunScheduleEditorView.Schedule.RunThisBot".loc(repeatSelectHTML, daySelectHTML, timeSelectHTML, minutesSelectedHTML);
		// Hook up the scheduling preference checkbox behavior.
		elem.down('select.scheduletype').observe('change', this.handleScheduleTypeChanged.bind(this));
		// Update the UI when the schedule type changes.
		elem.down('select.repeat').observe('change', this.handleScheduleRepeatChanged.bind(this));		
		
		return elem;
	},
	handleScheduleTypeChanged: function(inEvent) {
		var typePopup = this.$().down('select.scheduletype');
		this.setScheduleType(CC.XcodeServer.getNameAttributeForSelectedOption(typePopup), false);
	},
	handleScheduleRepeatChanged: function(inEvent) {
		var schedulePopup = this.$().down('select.repeat');
		this.$().removeClassName('hourly').removeClassName('daily').removeClassName('weekly');
		this.$().addClassName(CC.XcodeServer.getNameAttributeForSelectedOption(schedulePopup));
	},
	// Sets the schedule type.
	setScheduleType: function(inScheduleType, inOptDoNotUpdateSchedulingPopup) {
		this.$().removeClassName('manual').removeClassName('periodic').removeClassName('poll').removeClassName('trigger');
		this.$().addClassName(inScheduleType);
		if (inOptDoNotUpdateSchedulingPopup != false) {
			var scheduleTypePopup = this.$().down('select.scheduletype');
			CC.XcodeServer.setSelectedOptionWithName(scheduleTypePopup, inScheduleType);
		}
	},
	// Sets the schedule for this view given a work schedule recurrence.
	setScheduleRecurrence: function(inRecurrence) {
		if (inRecurrence) {
			var repeatInterval = inRecurrence.repeatInterval;
			var scheduleKey = CC.XcodeServer.DefaultScheduleMapping.get(repeatInterval);
			if (scheduleKey) {
				var scheduleTypeSelect = this.$().down('select.scheduletype');
				CC.XcodeServer.setSelectedOptionWithName(scheduleTypeSelect, 'periodic');
				this.$().removeClassName('hourly').removeClassName('daily').removeClassName('weekly');
				this.$().addClassName(scheduleKey.toLowerCase());
				var scheduleSelect = this.$().down('select.repeat');
				CC.XcodeServer.setSelectedOptionWithName(scheduleSelect, scheduleKey.toLowerCase());
				var startTime = inRecurrence.startTime;
				var daySelect = this.$().down('select.day');
				CC.XcodeServer.setSelectedOptionWithName(daySelect, startTime.getDay());
				var closestFiftenMinutes = (Math.round(startTime.getMinutes() / 15) * 15) % 60;
				var timeString = "%@-%@".fmt(startTime.getHours(), closestFiftenMinutes);
				var timeSelect = this.$().down('select.time');
				var minutesSelect = this.$('select.minutes');
				CC.XcodeServer.setSelectedOptionWithName(timeSelect, timeString);
				CC.XcodeServer.setSelectedOptionWithName(minutesSelect, closestFiftenMinutes);
			}
		} else {
			// Reset each of the select elements in the view
			var selects = this.$().select('.scheduledetails select');
			selects.each(function(select) {
				select.selectedIndex = 0;
			});
		}
		this.handleScheduleRepeatChanged();
	},
	// Returns the currently selected schedule type.
	getScheduleType: function() {
		var scheduleTypePopup = this.$().down('select.scheduletype');
		return CC.XcodeServer.getNameAttributeForSelectedOption(scheduleTypePopup);
	},
	// Returns a schedule recurrence instance 
	getScheduleRecurrence: function() {
		var scheduleTypePopup = this.$().down('select.scheduletype');
		var scheduled = CC.XcodeServer.getNameAttributeForSelectedOption(scheduleTypePopup) == 'periodic';
		if (scheduled) {
			var intervalPopup = this.$().down('select.repeat');
			var selectedInterval = intervalPopup.select('option')[intervalPopup.selectedIndex];
			var selectedIntervalServerInterval = selectedInterval.getAttribute('data-schedule');
			var selectedIntervalName = selectedInterval.getAttribute('name');
			var dayPopup = this.$().down('select.day');
			var selectedDay = dayPopup.select('option')[dayPopup.selectedIndex].getAttribute('name');
			var timePopup = this.$().down('select.time');
			var selectedTime = timePopup.select('option')[timePopup.selectedIndex].getAttribute('name');
			var minutesPopup = this.$('select.minutes');
			var selectedMinutes = minutesPopup.select('option')[minutesPopup.selectedIndex].getAttribute('name');
			var selectedTimeHours = selectedTime.split('-')[0];
			var selectedTimeMinutes = selectedTime.split('-')[1];
			var recurrenceDate;
			// If the schedule type doesn't specify a time, default to right now.
			if (selectedIntervalName == 'hourly') {
				recurrenceDate = new Date();
				recurrenceDate.setHours(recurrenceDate.getHours() + 1);
				recurrenceDate.setMinutes(selectedMinutes);
				recurrenceDate.setSeconds(0);
				recurrenceDate.setMilliseconds(0);
			} else {
				recurrenceDate = CC.XcodeServer.nextScheduleTimestampForOptions(selectedIntervalName, selectedDay, selectedTimeHours, selectedTimeMinutes);
			}
			// Create a new CC.EntityTypes.XCWorkScheduleRecurrence instance.
			return new CC.EntityTypes.XCWorkScheduleRecurrence({
				'startTime': csDateTimeFromDate(recurrenceDate),
				'repeatInterval': selectedIntervalServerInterval
			});
		}
		// Undefined means the bot has no schedule.
		return undefined;
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

// Bot clean build editor view.

CC.XcodeServer.BotRunCleanBuildScheduleEditorView = Class.create(CC.Mvc.View, {
	render: function() {
		var tabIndex = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_SCHEDULE_VIEW_SELECT_BOX);
		var elem = Builder.node('div', {className: 'xc-bot-run-clean-build-schedule-editor integrations'}, [
			Builder.node('select', {'tabindex': tabIndex, 'role': 'listbox', 'aria-haspopup': 'false', className: 'clean-build-schedule'}, [
				Builder.node('option', {'role': 'option', className: 'integrations', 'name': 1}, "_XC.BotRunCleanBuildScheduleEditorView.Select.Integrations".loc()),
				Builder.node('option', {'role': 'option', className: 'day', 'name': 2}, "_XC.BotRunCleanBuildScheduleEditorView.Select.Day".loc()),
				Builder.node('option', {'role': 'option', className: 'week', 'name': 3}, "_XC.BotRunCleanBuildScheduleEditorView.Select.Week".loc()),
				Builder.node('option', {'role': 'option', className: 'never', 'name': 0}, "_XC.BotRunCleanBuildScheduleEditorView.Select.Never".loc())
			]),
			Builder.node('div', {className: 'clean-build-description'}, "_XC.BotRunCleanBuildScheduleEditorView.Description".loc())
		]);
		return elem;
	},
	setCleanBuildSchedule: function(inSchedule) {
		CC.XcodeServer.setSelectedOptionWithName(this.$('select.clean-build-schedule'), Number(inSchedule));
	},
	getCleanBuildSchedule: function() {
		var scheduleTypePopup = this.$('select.clean-build-schedule');
		return Number(CC.XcodeServer.getNameAttributeForSelectedOption(scheduleTypePopup));
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.





CC.XcodeServer.NewBotAssistantPanel = Class.create(CC.PanelView, {
	mDetailView: null
});

CC.XcodeServer.BotInfoPanelView = Class.create(CC.XcodeServer.NewBotAssistantPanel, {
	render: function() {
		var tabIndexCancel = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_BUTTON_CANCEL);
		var tabIndexNext = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_BUTTON_NEXT);	
		
		this.mDetailView = new CC.XcodeServer.BotInfoView();
		return Builder.node('div', {className: 'panel info'}, [
			Builder.node('h3', {className: 'title'}, [
				"_XC.NewBotAssistant.Title".loc(),
				Builder.node('span', "_XC.NewBotAssistant.Title.Step.1".loc())
			]),
			Builder.node('div', {className: 'content'}, [
				Builder.node('div', {className: 'section selected'}, [
					this.mDetailView._render()
				])
			]),
			Builder.node('div', {className: 'controls'}, [
				Builder.node('input', {'role': 'button', 'tabindex': tabIndexCancel, className: 'button cancel', 'type': 'button', 'value': "_XC.NewBotAssistant.Button.Cancel".loc()}),
				Builder.node('input', {'role': 'button', 'tabindex': tabIndexNext, className: 'button next', 'type': 'button', 'value': "_XC.NewBotAssistant.Button.Next".loc()})
			])
		]);
	},
	configureRemoteRepositories: function(inSCMInfos) {
		this.mDetailView.configureRemoteRepositories(inSCMInfos);
	},
	getExtendedAttributesFromState: function() {
		return this.mDetailView.getExtendedAttributesFromState();
	},
	getBotTitleFromState: function() {
		return this.mDetailView.getBotTitleFromState();
	},
	updateForBotEntity: function(inBotEntity) {
		if(inBotEntity)
			this.mDetailView.updateForBotEntity(inBotEntity);
	}
});

CC.XcodeServer.BotSchedulePanelView = Class.create(CC.XcodeServer.NewBotAssistantPanel, {
	render: function() {		
		var tabIndexCancel = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_BUTTON_CANCEL);
		var tabIndexPrevious = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_BUTTON_PREVIOUS);
		var tabIndexNext = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_BUTTON_NEXT);				
		
		this.mDetailView = new CC.XcodeServer.BotScheduleInfoView();
		// Render the panel.
		return Builder.node('div', {className: 'panel schedule'}, [
			Builder.node('h3', {className: 'title'}, [
				"_XC.NewBotAssistant.Title".loc(),
				Builder.node('span', "_XC.NewBotAssistant.Title.Step.2".loc())
			]),
			Builder.node('div', {className: 'content'}, [
				Builder.node('div', {className: 'section selected'}, [
					this.mDetailView._render()
				])
			]),
			Builder.node('div', {className: 'controls'}, [
				Builder.node('input', {'role': 'button', 'tabindex': tabIndexCancel, className: 'button cancel', 'type': 'button', 'value': "_XC.NewBotAssistant.Button.Cancel".loc()}),
				Builder.node('input', {'role': 'button', 'tabindex': tabIndexPrevious, className: 'button prev', 'type': 'button', 'value': "_XC.NewBotAssistant.Button.Previous".loc()}),
				Builder.node('input', {'role': 'button', 'tabindex': tabIndexNext, className: 'button next', 'type': 'button', 'value': "_XC.NewBotAssistant.Button.Next".loc()})
			])
		]);
	},
	updateForBotEntity: function(inBotEntity, inWorkScheduleEntity) {
		if(inBotEntity) {
			this.mDetailView.updateForBotEntity(inBotEntity, inWorkScheduleEntity);
		}	
	},
	getExtendedAttributesFromState: function() {
		return this.mDetailView.getExtendedAttributesFromState();
	}
});

CC.XcodeServer.BotTestingPanelView = Class.create(CC.XcodeServer.NewBotAssistantPanel, {
	render: function() {
		var tabIndexCancel = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_BUTTON_CANCEL);
		var tabIndexPrevious = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_BUTTON_PREVIOUS);
		var tabIndexNext = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_BUTTON_NEXT);		
		
		this.mDetailView = new CC.XcodeServer.BotTestingInfoView();
		return Builder.node('div', {className: 'panel devices'}, [
			Builder.node('h3', {className: 'title'}, [
				"_XC.NewBotAssistant.Title".loc(),
				Builder.node('span', "_XC.NewBotAssistant.Title.Step.3".loc())
			]),
			Builder.node('div', {className: 'content'}, [
				Builder.node('div', {className: 'section selected'}, [
					this.mDetailView._render()
				])
			]),
			Builder.node('div', {className: 'controls'}, [
				Builder.node('input', {'role': 'button', 'tabindex': tabIndexCancel, className: 'button cancel', 'type': 'button', 'value': "_XC.NewBotAssistant.Button.Cancel".loc()}),
				Builder.node('input', {'role': 'button', 'tabindex': tabIndexPrevious, className: 'button prev', 'type': 'button', 'value': "_XC.NewBotAssistant.Button.Previous".loc()}),
				Builder.node('input', {'role': 'button', 'tabindex': tabIndexNext, className: 'button next', 'type': 'button', 'value': "_XC.NewBotAssistant.Button.Next".loc()})
			])
		]);
	},
	configureDevices: function(inDevices) {
		this.mDetailView.configureDevices(inDevices);
	},
	getExtendedAttributesFromState: function() {
		return this.mDetailView.getExtendedAttributesFromState();
	},
	updateForBotEntity: function(inBotEntity) {
		if(inBotEntity)
			this.mDetailView.updateForBotEntity(inBotEntity);
	}
});

CC.XcodeServer.BotNotificationPanelView = Class.create(CC.XcodeServer.NewBotAssistantPanel, {
	render: function() {
		var tabIndexCancel = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_BUTTON_CANCEL);
		var tabIndexPrevious = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_BUTTON_PREVIOUS);
		var tabIndexNext = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_BUTTON_NEXT);	
		
		this.mDetailView = new CC.XcodeServer.BotNotificationsInfoView();
		return Builder.node('div', {className: 'panel notifications'}, [
			Builder.node('h3', {className: 'title'}, [
				"_XC.NewBotAssistant.Title".loc(),
				Builder.node('span', "_XC.NewBotAssistant.Title.Step.4".loc())
			]),
			Builder.node('div', {className: 'content'}, [
				Builder.node('div', {className: 'section selected'}, [
					this.mDetailView._render()
				])
			]),
			Builder.node('div', {className: 'controls'}, [
				Builder.node('input', {'role': 'button', 'tabindex': tabIndexCancel, className: 'button cancel', 'type': 'button', 'value': "_XC.NewBotAssistant.Button.Cancel".loc()}),
				Builder.node('input', {'role': 'button', 'tabindex': tabIndexPrevious, className: 'button prev', 'type': 'button', 'value': "_XC.NewBotAssistant.Button.Previous".loc()}),
				Builder.node('input', {'role': 'button', 'tabindex': tabIndexNext, className: 'button create', 'type': 'button', 'value': "_XC.NewBotAssistant.Button.Create".loc()})
			])
		]);
	},
	updateForBotEntity: function(inBotEntity, inEmailSubscriptionSuccessList, inEmailSubscriptionFailureList) {
		if(inBotEntity && inEmailSubscriptionSuccessList && inEmailSubscriptionFailureList)
			this.mDetailView.updateForBotEntity(inBotEntity, inEmailSubscriptionSuccessList, inEmailSubscriptionFailureList);
	}
});

CC.XcodeServer.BotCreatedPanelView = Class.create(CC.XcodeServer.NewBotAssistantPanel, {
	render: function() {
		var tabIndexNext = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_BUTTON_NEXT);
		
		return Builder.node('div', {className: 'panel done'}, [
			Builder.node('h3', {className: 'title'}),
			Builder.node('div', {className: 'content'}, [
				Builder.node('div', {className: 'section selected'}, [
					Builder.node('div', {className: 'confirmation'})
				]),
			]),
			Builder.node('div', {className: 'controls'}, [
				Builder.node('input', {'role': 'button', 'tabindex': tabIndexNext, className: 'button done', 'type': 'button', 'value': "_XC.NewBotAssistant.Button.Done".loc()})
			])
		])
	}
});

// Bot Assistant
CC.XcodeServer.BotAssistant = Class.create(CC.Mvc.View, {
	mHasDevices: false,
	mInfoPanel: null,
	mTestingPanel: null,
	mSchedulePanel: null,
	mNotificationPanel: null,
	showAssistant: function() {
		// Fetch the list of remote repositories and devices from the server.
		dialogManager().showProgressMessage("_Loading".loc());
		
		var batch = [
			['XCBotService', 'findAllSCMInfos', undefined],
			['XCBotService', 'allDevices', undefined]
		];
		
		if (this.mBotEntity) {
			batch.push(['XCWorkSchedulerService', 'workScheduleForEntityGUID:', this.mBotEntity.guid]);
			batch.push(['ContentService', 'emailSubscriptionListForEntityGUID:withNotificationType:', [this.mBotEntity.guid, 'com.apple.notifications.BotSucceeded']]);
			batch.push(['ContentService', 'emailSubscriptionListForEntityGUID:withNotificationType:', [this.mBotEntity.guid, 'com.apple.notifications.BotFailed']]);
		}
		
		var callback = function(inBatchResponses) {
			var scmInfos = ( inBatchResponses && inBatchResponses.responses && inBatchResponses.responses[0] && inBatchResponses.responses[0].response);
			var devices = ( inBatchResponses && inBatchResponses.responses && inBatchResponses.responses[1] && inBatchResponses.responses[1].response);
			var botWorkSchedule = ( inBatchResponses && inBatchResponses.responses && inBatchResponses.responses[2] && inBatchResponses.responses[2].response);
			var emailSubscriptionSuccessList = ( inBatchResponses && inBatchResponses.responses && inBatchResponses.responses[3] && inBatchResponses.responses[3].response);
			var emailSubscriptionFailureList = ( inBatchResponses && inBatchResponses.responses && inBatchResponses.responses[4] && inBatchResponses.responses[4].response);
			
			dialogManager().hideProgressMessage();
			if (!scmInfos || scmInfos.length == 0) {
				alert("_XC.Bot.NewBotAssistant.NoRepositories.Error".loc());
				return;
			}
			this.mInfoPanel.configureRemoteRepositories(scmInfos);
			this.mTestingPanel.configureDevices(devices);
			if (devices && devices.length) {
				this.mHasDevices = true;
			}
			
			if(this.mBotEntity) {
				this.mInfoPanel.updateForBotEntity(this.mBotEntity);
				this.mTestingPanel.updateForBotEntity(this.mBotEntity);
				this.mSchedulePanel.updateForBotEntity(this.mBotEntity, botWorkSchedule);
				this.mNotificationPanel.updateForBotEntity(this.mBotEntity, emailSubscriptionSuccessList, emailSubscriptionFailureList);
			}
			
			this.becomeFirstResponder();
			this.setVisible(true);
			var firstPanel = this.mPanelSet.first();
			firstPanel.select();
		};
		
		var errorBack = function() {
			dialogManager().hideProgressMessage();
			notifier().printErrorMessage("_XC.Bot.NewBotAssistant.Unknown.Error".loc());
		};
		
		service_client().batchExecuteAsynchronously(batch, {}, callback.bind(this), errorBack);
		
		// Temporary disabling background items when modal dialog is open in order to avoid bad tabindex-ing
		accessibility().setRootViewsAriaHidden(true, true);		
	},
	// Shared event handlers for each of the control buttons on the panels.
	onCancelButtonClick: function() {
		this.hideAssistant();
	},
	hideAssistant: function() {
		this.setVisible(false);
		this.loseFirstResponder();
		
		// Bring background items back to foreground when closing modal dialog to bring back original tabindex-ing
		accessibility().setRootViewsAriaHidden(false, false);
	},
	disableAllButtons: function() {
		this.mPanelSet.all().each(function(panel) {
			panel.$().select('.controls .button').invoke('disable');
		});
	},
	enableAllButtons: function() {
		this.mPanelSet.all().each(function(panel) {
			panel.$().select('.controls .button').invoke('enable');
		});
	},
	handleKeyboardNotification: function(inMessage, inObject, inOptExtras) {
		if (inMessage == CC.Keyboard.NOTIFICATION_DID_KEYBOARD_ESC) {
			this.hideAssistant();
		} else if (inMessage == CC.Keyboard.NOTIFICATION_DID_KEYBOARD_RETURN) {
			if (this.mPanelSet.selected().$().hasClassName('done')) {
				this.onDoneButtonClick();
			}
		}
		return true;
	}
});

// New bot assistant.
CC.XcodeServer.NewBotAssistant = Class.create(CC.XcodeServer.BotAssistant, {
	mHasClickedNext: false,
	initialize: function($super) {
		$super();
		// Render this view.
		this.forceRender();
		// Add each of the panel views we need.
		this.mInfoPanel = new CC.XcodeServer.BotInfoPanelView();
		this.addSubview(this.mInfoPanel, 'div.dialog form');
		this.mSchedulePanel = new CC.XcodeServer.BotSchedulePanelView();
		this.addSubview(this.mSchedulePanel, 'div.dialog form');
		this.mTestingPanel = new CC.XcodeServer.BotTestingPanelView();
		this.addSubview(this.mTestingPanel, 'div.dialog form');
		this.mNotificationPanel = new CC.XcodeServer.BotNotificationPanelView();
		this.addSubview(this.mNotificationPanel, 'div.dialog form');
		this.mDonePanel = new CC.XcodeServer.BotCreatedPanelView();
		this.addSubview(this.mDonePanel, 'div.dialog form');
		// Create a panel set and push each of our panel views.
		this.mPanelSet = new CC.PanelSet();
		this.mPanelSet.add(this.mInfoPanel);
		this.mPanelSet.add(this.mSchedulePanel);
		this.mPanelSet.add(this.mTestingPanel);
		this.mPanelSet.add(this.mNotificationPanel);
		this.mPanelSet.add(this.mDonePanel);
		// Register event handlers.
		var element = this.mParentElement;
		element.select('input[type="text"], input[type="password"], textarea').invoke('observe', 'keyup', this.onValidatedFieldKeyUp.bind(this));
		element.select('.button.cancel').invoke('observe', 'click', this.onCancelButtonClick.bind(this));
		element.select('.button.prev').invoke('observe', 'click', this.onPrevButtonClick.bind(this));
		element.select('.button.next').invoke('observe', 'click', this.onNextButtonClick.bind(this));
		element.select('.button.create').invoke('observe', 'click', this.onCreateButtonClick.bind(this));
		element.select('.button.done').invoke('observe', 'click', this.onDoneButtonClick.bind(this));
	},
	render: function() {
		return element = Builder.node('div', {className: 'xc-new-bot-assistant'}, [
			Builder.node('div', {className: 'mask'}),
			Builder.node('div', {'role': 'dialog', 'aria-label': "_XC.Bot.Settings.Dialog.Title".loc(), className: 'dialog'}, [
				Builder.node('div', {className: 'dialog_contents'}, [
					Builder.node('form')
				])
			])
		]);
	},
	onValidatedFieldKeyUp: function(inEvent) {
		this.validateFields(this.mHasClickedNext);
	},
	// Validates fields. Highlights any invalid fields and returns false if the fields are invalid, and true otherwise.
	validateFields: function(inShouldHighlightInvalidFields, inShouldEnableDisableNextButton) {
		var selectedPanel = this.mPanelSet.selected();
		selectedPanel.$().select('.invalid').invoke('removeClassName', 'invalid');
		var nextButton = selectedPanel.$().down('.button.next');
		var valid = true;
		if (selectedPanel == this.mInfoPanel) {
			var validatingInputClassNames = ['workspaceOrProjectPath', 'scmBranch', 'buildSchemeName', 'botTitle'];
			for (var idx = 0; idx < validatingInputClassNames.length; idx++) {
				var input = this.$().down('input.' + validatingInputClassNames[idx]);
				var value = input.getValue();
				if (!value) {
					if (inShouldHighlightInvalidFields) input.addClassName('invalid');
					valid = false;
				}
			}
		}
		valid ? nextButton.enable() : nextButton.disable();
		return valid;
	},
	onPrevButtonClick: function() {
		var selectedPanel = this.mPanelSet.selected();
		if (selectedPanel == this.mNotificationPanel && this.mSkippedDevicesPanel) {
			this.mPanelSet.previous().select();
			this.mSkippedDevicesPanel = false;
		}
		this.mPanelSet.previous().select();
	},
	onNextButtonClick: function(inEvent) {
		this.mHasClickedNext = true;
		var isValid = this.validateFields(true, true);
		if (!isValid) return;
		var selectedPanel = this.mPanelSet.selected();
		// If we're on the schedule panel, check if we need to show the devices panel.
		if (selectedPanel == this.mSchedulePanel) {
			var runTests = this.$('input.integratePerformsTest').checked;
			if (runTests == false) {
				// Skip the next panel.
				this.mPanelSet.next().select();
				// Remember we skipped the next panel.
				this.mSkippedDevicesPanel = true;
			}
			else {
				this.mSkippedDevicesPanel = false;
			}
		}
		this.mPanelSet.next().select();
	},
	onCreateButtonClick: function() {
		// Disable the panel to prevent duplicate submissions
		this.disableAllButtons();
		// Sniff the bot name and info panel extendedAttributes.
		var botName = this.mInfoPanel.getBotTitleFromState();
		var extendedAttributes = this.mInfoPanel.getExtendedAttributesFromState();
		// Sniff the trigger/poll settings.
		var scheduleTypeSelect = this.$('select.scheduletype');
		var selectedScheduleTypeOption = scheduleTypeSelect.select('option')[scheduleTypeSelect.selectedIndex];
		var selectedScheduleType = selectedScheduleTypeOption.getAttribute('name');
		// Merge in extended attributes not covered by the bot info view.
		extendedAttributes['pollForSCMChanges'] = (selectedScheduleType == "poll");
		extendedAttributes['buildOnTrigger'] = (selectedScheduleType == "trigger");
		var buildFromCleanSetting = this.mSchedulePanel.mDetailView.mCleanBuildScheduleEditorView.getCleanBuildSchedule();
		extendedAttributes['buildFromClean'] = buildFromCleanSetting;
		extendedAttributes['integratePerformsAnalyze'] = this.$('input.integratePerformsAnalyze').checked;
		extendedAttributes['integratePerformsTest'] = this.$('input.integratePerformsTest').checked;
		extendedAttributes['integratePerformsArchive'] = this.$('input.integratePerformsArchive').checked;
		// Sniff the device testing settings.
		var _extendedAttributes = this.mTestingPanel.getExtendedAttributesFromState();
		Object.extend(extendedAttributes, _extendedAttributes);
		var options = {
			'longName': botName,
			'extendedAttributes': extendedAttributes,
			'notifyCommitterOnSuccess': this.$('input.emailCommittersOnSuccess').checked,
			'notifyCommitterOnFailure': this.$('input.emailCommittersOnFailure').checked,
			'integrateImmediately': this.$('input.integrateImmediately').checked
		};
		// Pluck out the notification recipients.
		var notificationsView = this.mNotificationPanel.mDetailView;
		var successEmailList = notificationsView.getExtraSuccessStateRecipients();
		var failureEmailList = notificationsView.getExtraFailureStateRecipients();
		if (successEmailList) options['successEmailList'] = successEmailList;
		if (failureEmailList) options['failureEmailList'] = failureEmailList;
		var errback = function() {
			this.enableAllButtons();
			notifier().printErrorMessage("_XC.NewBotAssistant.Error".loc());
		};
		var innerCallback = function() {
			this.enableAllButtons();
			if (this.botEntity && (this.botEntity.longName || this.botEntity.shortName)) {
				var wrappedName = "<b>%@</b>".fmt((this.botEntity.longName || this.botEntity.shortName).escapeHTML());
				this.mDonePanel.$().down('.confirmation').innerHTML = "_XC.NewBotAssistant.Confirmation".loc(wrappedName);
				this.mDonePanel.select();
			} else {
				notifier().printErrorMessage("_XC.NewBotAssistant.Error".loc());
			}
		};
		// Actually create the bot.
		var callback = function(botEntity) {
			this.botEntity = botEntity;
			// If we need to, schedule the bot.
			var scheduleEditorView = this.mSchedulePanel.mDetailView.mScheduleEditorView;
			var schedule = scheduleEditorView.getScheduleRecurrence();
			if (schedule) {
				xcservice().scheduleBotWithGUID(this.botEntity.guid, [schedule], innerCallback.bind(this), errback.bind(this));
			} else {
				innerCallback.bind(this)();
			}
		};
		xcservice().createBotWithOptions(options, callback.bind(this), errback.bind(this));
	},
	onDoneButtonClick: function() {
		if ((this.botEntity && this.botEntity.tinyID) || ((this.botEntity && this.botEntity.guid))) {
			if (this.botEntity.tinyID === undefined) {
				var botID = this.botEntity.guid;
			}
			else {
				var botID = this.botEntity.tinyID;
			}
			var url = CC.entityURLForTypeAndTinyID('com.apple.entity.Bot', botID, this.botEntity.longName);
			this.hideAssistant();
			window.location.href = url;
		}
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.






// Bot settings assistant.
CC.XcodeServer.BotSettingsAssistant = Class.create(CC.XcodeServer.BotAssistant, {
	mClassName: 'xc-new-bot-assistant xc-bot-settings-assistant',
	mTabsContainer: null,
	mPanelsByTabNames: {},
	mBotEntity: null,
	initialize: function($super, inBotEntity) {
		$super();		
		
		this.mBotEntity = inBotEntity;
		// Render this view.
		this.forceRender();
		// Add each of the panel views we need.
		this.mInfoPanel = new CC.XcodeServer.BotSettingsInfoPanelView();
		this.addPanelToView(this.mInfoPanel, 'div.dialog form', 'Server', true, accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_INFO_VIEW));
		this.mSchedulePanel = new CC.XcodeServer.BotSettingsSchedulePanelView();
		this.addPanelToView(this.mSchedulePanel, 'div.dialog form', 'Schedule', false, accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_SCHEDULE_VIEW));
		this.mTestingPanel = new CC.XcodeServer.BotSettingsTestingPanelView();
		this.addPanelToView(this.mTestingPanel, 'div.dialog form', 'Testing', false, accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_TESTING_VIEW));
		this.mNotificationPanel = new CC.XcodeServer.BotSettingsNotificationPanelView();
		this.addPanelToView(this.mNotificationPanel, 'div.dialog form', 'Notifications', false, accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_NOTIFICATION_VIEW));
		
		// Create a panel set and push each of our panel views.
		this.mPanelSet = new CC.PanelSet();
		this.mPanelSet.add(this.mInfoPanel);
		this.mPanelSet.add(this.mSchedulePanel);
		this.mPanelSet.add(this.mTestingPanel);
		this.mPanelSet.add(this.mNotificationPanel);
		
		this.mTabsContainer.select('.bot-settings-tab').invoke('observe', 'click', this.onTabItemClick.bind(this));
		element.select('input[type="text"], input[type="password"], textarea').invoke('observe', 'keyup', this.onValidatedFieldKeyUp.bind(this));
		element.select('.button.cancel').invoke('observe', 'click', this.onCancelButtonClick.bind(this));
		element.select('.button.save').invoke('observe', 'click', this.onSaveButtonClick.bind(this));
	},
	render: function() {
		var tabIndex = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_BOT_SETTINGS_TABS);
		this.mTabsContainer = Builder.node('div', {'tabindex': tabIndex, 'aria-label': "_XC.Accessibility.Label.TabNavigation".loc(), className: 'bot-settings-tabs-container'});
		var tabIndexCancel = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_BUTTON_CANCEL);
		var tabIndexNext = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_CREATE_NEW_BOT_BUTTON_NEXT);	
		
		return element = Builder.node('div', {className: 'xc-new-bot-assistant'}, [
			Builder.node('div', {className: 'mask'}),
			Builder.node('div', {'role': 'dialog', 'aria-label': "_XC.Bot.Settings.Dialog.Title".loc(), className: 'dialog'}, [
				Builder.node('div', {className: 'dialog_contents'}, [
					Builder.node('h3', {'tabindex': '-1', className: 'title'}, "_XC.Bot.Settings.Dialog.Title".loc()),
					this.mTabsContainer,
					Builder.node('form'),
					Builder.node('div', {className: 'bot-settings-buttons-container'}, [
						Builder.node('input', {'role': 'menuitem', 'tabindex': tabIndexCancel, className: 'button cancel', 'type': 'button', 'value': "_XC.NewBotAssistant.Button.Cancel".loc()}),
						Builder.node('input', {'role': 'menuitem', 'tabindex': tabIndexNext, className: 'button save', 'type': 'button', 'value': "_XC.Bot.Settings.Save.Button.Title".loc()})
					])
				])
			])
		]);
	},
	addPanelToView: function(inPanel, inSelector, inTitle, inSelected, tabIndex) {
		this.addSubview(inPanel, inSelector);
		this.mPanelsByTabNames[inTitle] = inPanel;
		this.addNewPanelTab(inTitle, inSelected, tabIndex);
	},
	addNewPanelTab: function(inTitle, inSelected, tabIndex) {
		var tab = Builder.node('div', {'tabindex': tabIndex, 'role': 'menuitem', className: "bot-settings-tab"+((inSelected != undefined && inSelected)? " selected":""), "data-tab-title": inTitle}, "_XC.Bot.Settings.Tabs.%@".fmt(inTitle).loc());
		this.mTabsContainer.appendChild(tab);
	},
	onTabItemClick: function(inEvent) {
		if (inEvent && inEvent.target) {
			var selectedTab = inEvent.target;
			var selectedTabTitle = selectedTab.getAttribute('data-tab-title');
			
			var tabs = this.$().querySelectorAll('.bot-settings-tab');
			for (var a = 0; a < tabs.length; a++) {
				tabs[a].removeClassName('selected');
			}
			
			selectedTab.addClassName('selected');
			if( this.mPanelsByTabNames && this.mPanelsByTabNames[selectedTabTitle] ) {
				var selectedPanel = this.mPanelsByTabNames[selectedTabTitle];
				selectedPanel.select();
			}
		}
	},
	onValidatedFieldKeyUp: function(inEvent) {
		this.validateFields();
	},
	// Validates fields. Highlights any invalid fields and returns false if the fields are invalid, and true otherwise.
	validateFields: function() {
		this.$().select('.invalid').invoke('removeClassName', 'invalid');
		var saveButton = this.$('.button.save');
		var valid = true;

		var validatingInputClassNames = ['workspaceOrProjectPath', 'scmBranch', 'buildSchemeName', 'botTitle'];
		for (var idx = 0; idx < validatingInputClassNames.length; idx++) {
			var input = this.$().down('input.' + validatingInputClassNames[idx]);
			var value = input.getValue();
			if (!value) {
				input.addClassName('invalid');
				valid = false;
			}
		}
		
		if (valid) {
			saveButton.enable();
		}
		else {
			saveButton.disable();
			this.mInfoPanel.select();
		}
		return valid;
	},
	onSaveButtonClick: function() {
		// Disable the panel to prevent duplicate submissions
		this.disableAllButtons();
		
		if (!this.mBotEntity) {
			this.enableAllButtons();
			return
		}
		
		if (!this.validateFields) {
			this.enableAllButtons();
			return
		}

		// Actually create the bot.
		var callback = function(botEntity) {
			this.mBotEntity = botEntity;
			
			// Sniff the bot name and info panel extendedAttributes.
			var botName = this.mInfoPanel.getBotTitleFromState();
			var extendedAttributes = this.mBotEntity.extendedAttributes;
			
			// Sniff the bot name and info panel extendedAttributes.
			var extendedInfoAttributes = this.mInfoPanel.getExtendedAttributesFromState();
			Object.extend(extendedAttributes, extendedInfoAttributes);
			// Need to clean up the path is the project has changed from an xcode project to a workspace, and reverse.
			if (extendedInfoAttributes.buildWorkspacePath === undefined) {
				delete extendedAttributes.buildWorkspacePath;
			}
			if (extendedInfoAttributes.buildProjectPath === undefined) {
				delete extendedAttributes.buildProjectPath;
			}
			
			// Sniff the bot schedule testing settings.
			var extendedScheduleAttribute = this.mSchedulePanel.getExtendedAttributesFromState();
			Object.extend(extendedAttributes, extendedScheduleAttribute);
			// Sniff the device testing settings.
			var extendedDeviceAttributes = this.mTestingPanel.getExtendedAttributesFromState();
			Object.extend(extendedAttributes, extendedDeviceAttributes);
			
			// Pluck out the notification recipients.
			var notificationsView = this.mNotificationPanel.mDetailView;
			var notifyCommitterOnSuccessValue = notificationsView.getNotifyCommitterOnSuccessValue();
			var notifyCommitterOnFailureValue = notificationsView.getNotifyCommitterOnFailureValue();
			var successEmailList = notificationsView.getExtraSuccessStateRecipients();
			var failureEmailList = notificationsView.getExtraFailureStateRecipients();
			
			var cs = new CC.EntityTypes.EntityChangeSet({
				'changeAction': "UPDATE",
				'entityGUID': this.mBotEntity.guid,
				'entityRevision': this.mBotEntity.revision,
				'entityType': this.mBotEntity.type,
				'changes': [
					['longName', botName],
					['extendedAttributes', extendedAttributes],
					['notifyCommitterOnSuccess', notifyCommitterOnSuccessValue],
					['notifyCommitterOnFailure', notifyCommitterOnFailureValue]
				],
				'force': false
			});
			
			server_proxy().updateEntity(cs, updateBotScheduleCallback.bind(this), function(){
				dialogManager().hide();
				notifier().printErrorMessage("_XC.Bot.Settings.Save.Error".loc());
			});
		};
		
		var errback = function() {
			this.enableAllButtons();
			notifier().printErrorMessage("_XC.NewBotAssistant.Error".loc());
		};
		
		var botUpdateWorkScheduleSuccessCallback = function(inResponse) {
			if (this.mBotEntity && this.mBotEntity.tinyID) {
				globalRouteHandler().routeURL('/xcode/bots/%@'.fmt(this.mBotEntity.tinyID));
			}
			else {
				globalRouteHandler().routeURL('/xcode/bots');
			}
		};
		
		var updateBotScheduleCallback = function(inBotEntity) {
			// If we need to, schedule the bot.
			var scheduleEditorView = this.mSchedulePanel.mDetailView.mScheduleEditorView;
			var schedule = scheduleEditorView.getScheduleRecurrence();
			
			var notificationsView = this.mNotificationPanel.mDetailView;
			var successEmailList = notificationsView.getExtraSuccessStateRecipients();
			var failureEmailList = notificationsView.getExtraFailureStateRecipients();
			
			var batch = [
				['ContentService', 'updateEmailSubscriptionList:forEntityGUID:withNotificationType:', [successEmailList, inBotEntity.guid, "com.apple.notifications.BotSucceeded"]],
				['ContentService', 'updateEmailSubscriptionList:forEntityGUID:withNotificationType:', [failureEmailList, inBotEntity.guid, "com.apple.notifications.BotFailed"]]
			];
			
			if (schedule) {
				batch.push(['XCWorkSchedulerService', 'deleteWorkScheduleWithEntityGUID:', this.mBotEntity.guid]);
				batch.push(['XCBotService', 'scheduleBotWithGUID:atRecurrences:', [this.mBotEntity.guid, [schedule]]]);
			} else {
				batch.push(['XCWorkSchedulerService', 'deleteWorkScheduleWithEntityGUID:', this.mBotEntity.guid]);
			}
			
			// Start integration immediatly
			var integrateNowCheckboxNode = this.$('input.integrateImmediately');
			if(integrateNowCheckboxNode && integrateNowCheckboxNode.checked) {
				batch.push(['XCBotService', 'startBotRunForBotGUID:', inBotEntity.guid]);
			}
				
			service_client().batchExecuteAsynchronously(batch, {}, botUpdateWorkScheduleSuccessCallback.bind(this), errback.bind(this));
		}
		
		server_proxy().entityForGUID(this.mBotEntity.guid, callback.bind(this), errback.bind(this));
	},
	updateScheduleString: function(inSchedule) {
		var scheduleString = CC.XcodeServer.localizedNextScheduleString(inSchedule);
		document.querySelector('.xc-bot-header-view.cc-view.xc-list-header-view div.info div.description').textContent = scheduleString;
	}
});

CC.XcodeServer.BotSettingsInfoPanelView = Class.create(CC.XcodeServer.BotInfoPanelView, {
	render: function() {
		this.mDetailView = new CC.XcodeServer.BotInfoView(true);
		var infoPanelNode = Builder.node('div', {className: 'panel info'}, [
			Builder.node('div', {'aria-label': "_XC.Accessibility.Label.Content".loc(), className: 'content'}, [
				Builder.node('div', {className: 'section selected'}, [
					this.mDetailView._render()
				])
			])
		]);
		var integrateImmediatlyCheckboxDiv = infoPanelNode.querySelector('.checkbox');
		var integrateImmediatlyCheckbox = integrateImmediatlyCheckboxDiv.querySelector('input.integrateImmediately');
		integrateImmediatlyCheckbox.removeAttribute('checked');
		integrateImmediatlyCheckboxDiv.hide();
		return infoPanelNode;
	}
});

CC.XcodeServer.BotSettingsSchedulePanelView = Class.create(CC.XcodeServer.BotSchedulePanelView, {
	render: function() {
		this.mDetailView = new CC.XcodeServer.BotScheduleInfoView();
		// Render the panel.
		return Builder.node('div', {className: 'panel schedule'}, [
			Builder.node('div', {'aria-label': "_XC.Accessibility.Label.Content".loc(), className: 'content'}, [
				Builder.node('div', {className: 'section selected'}, [
					this.mDetailView._render()
				])
			])
		]);
	}
});

CC.XcodeServer.BotSettingsTestingPanelView = Class.create(CC.XcodeServer.BotTestingPanelView, {
	render: function() {
		this.mDetailView = new CC.XcodeServer.BotTestingInfoView();
		return Builder.node('div', {className: 'panel devices'}, [
			Builder.node('div', {'aria-label': "_XC.Accessibility.Label.Content".loc(), className: 'content'}, [
				Builder.node('div', {className: 'section selected'}, [
					this.mDetailView._render()
				])
			])
		]);
	}
});

CC.XcodeServer.BotSettingsNotificationPanelView = Class.create(CC.XcodeServer.BotNotificationPanelView, {
	render: function() {
		this.mDetailView = new CC.XcodeServer.BotNotificationsInfoView();
		return Builder.node('div', {className: 'panel notifications'}, [
			Builder.node('div', {'aria-label': "_XC.Accessibility.Label.Content".loc(), className: 'content'}, [
				Builder.node('div', {className: 'section selected'}, [
					this.mDetailView._render()
				])
			])
		]);
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.




// Bot settings menu item.

CC.XcodeServer.BotSettingsMenuItem = Class.create(CC.MenuItem, {
	mDisplayTitle: "_XC.Bot.Settings.MenuItem.Title".loc(),
	itemShouldDisplay: function() {
		var entityType = CC.meta('x-apple-entity-type');
		var canWrite = (CC.meta('x-apple-user-can-write') == "true");
		return ((entityType == 'com.apple.entity.Bot') && canWrite);
	},
	action: function(inEvent) {
		dialogManager().showProgressMessage("_Loading".loc());
		var botGUID = CC.meta('x-apple-entity-guid');
		server_proxy().entityForGUID(botGUID, this.createBotSettingsAssistant.bind(this), this.createBotSettingsAssistantError.bind(this));
	},
	createBotSettingsAssistant: function(inBotEntity) {
		var assistant = new CC.XcodeServer.BotSettingsAssistant(inBotEntity);
		assistant.setVisible(false);
        rootView.addSubview(assistant);
		assistant.showAssistant();
	},
	createBotSettingsAssistantError: function() {
		notifier().printErrorMessage("_XC.Bot.Settings.Fetch.Error.Title".loc());
	},
	getAccessibilityID: function() {
		return accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_BOT_SETTINGS);
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

// Cancel bot run menu item.

CC.XcodeServer.CancelBotRunMenuItem = Class.create(CC.MenuItem, {
	mDisplayTitle: "_XC.Bot.MenuItem.CancelBotRun.Title".loc(),
	updateDisplayState: function() {
		// Copy the code from CC.MenuItems.Delete superclass.
		var shouldDisplay = this.itemShouldDisplay();
		shouldDisplay ? this.mElement.show() : this.mElement.hide();
		return shouldDisplay;
	},
	itemShouldDisplay: function() {
		// Do we have a running bot in the sidebar?
		var canCreateBots = (CC.meta('x-apple-user-can-create-bots') == "true");
		var botCurrentlyRunning = ($$('.xc-bot-run-sidebar .xc-bot-status.running').length > 0);
		return (canCreateBots && botCurrentlyRunning);
	},
	action: function(inEvent) {
		var runningSidebarStatusElements = $$('.xc-bot-run-sidebar .xc-bot-status.running');
		var firstSidebarStatusElement = runningSidebarStatusElements.first();
		if (firstSidebarStatusElement) {
			var sidebarItemElement = firstSidebarStatusElement.up('.xc-bot-run-sidebar-item');
			var botRunGUID = sidebarItemElement.getAttribute('data-guid');
			xcservice().cancelBotRunWithGUID(botRunGUID, Prototype.emptyFunction, function() {
				notifier().printErrorMessage("_XC.Bot.MenuItem.CancelBotRun.Error".loc());
			});
		}
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
//
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

// Delete bot menu item.

CC.XcodeServer.DeleteBotMenuItem = Class.create(CC.MenuItems.Delete, {
	mDisplayTitle: "_XC.Bot.MenuItem.Delete.Title".loc(),
	updateDisplayState: function() {
		// Copy the code from CC.MenuItems.Delete superclass.
		var shouldDisplay = this.itemShouldDisplay();
		shouldDisplay ? this.mElement.show() : this.mElement.hide();
		return shouldDisplay;
	},
	itemShouldDisplay: function() {
		var entityType = CC.meta('x-apple-entity-type');
		return ((entityType == 'com.apple.entity.Bot') && (CC.meta('x-apple-user-can-delete') == 'true'));
	},	
	action: function($super, e) {
		$super(e);
		$$('#delete_entity_dialog #delete_entity_dialog_permanent_delete').each(function(element){
			element.hide()
		});
		$$("#delete_entity_dialog label[for='delete_entity_dialog_permanent_delete']").each(function(element){
			element.hide()
		});
	},
	onDeleteConfirm: function() {
		dialogManager().showProgressMessage("_XC.Bot.LoadingMessage.Delete".loc());
		var entityGUID = CC.meta('x-apple-entity-guid');
		xcservice().deleteBotWithGUID(entityGUID, this.onDeleteSuccess.bind(this), this.onDeleteFailure.bind(this));
	},
	onDeleteSuccess: function(response) {
		dialogManager().hideProgressMessage();
		globalRouteHandler().routeURL('/xcode/bots');
	},
	onDeleteFailure: function($super, response) {
		$super();
		dialogManager().hideProgressMessage();
	},
	getAccessibilityID: function() {
		return accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_NAV_GEAR_BOT_DELETE);
	}
});
// Copyright (c) 2014 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

// Log constants
CC.XcodeServer.BotRunOutputLogsNone                         = 0;
CC.XcodeServer.BotRunOutputLogsBuildLogs                    = 1 << 0;
CC.XcodeServer.BotRunOutputLogsSCMLogs                      = 1 << 1;
CC.XcodeServer.BotRunOutputLogsBuildServiceOutput           = 1 << 2;
CC.XcodeServer.BotRunOutputLogsBuildBundle                  = 1 << 3;
CC.XcodeServer.BotRunOutputLogsConfigurationAndVersions     = 1 << 4;

CC.XcodeServer.BotLogDownloadAssistantPanel = Class.create(CC.PanelView, {
	render: function() {
		var tabIndexCancel = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_DIALOG_CANCEL_BUTTON);
		var tabIndexNext = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_POPUP_DIALOG_OK_BUTTON);	
		var tabIndex = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_LIST_ITEMS);
        
		return Builder.node('div', {className: 'panel info'}, [
			Builder.node('h3', {className: 'title'}),
			Builder.node('div', {className: 'content'}, [
				Builder.node('div', {className: 'section selected'}, [
                    Builder.node('div', {className: 'xc-bot-info-view'}, [
            			Builder.node('div', {className: 'field'}, [
            				Builder.node('span', "_XC.Bot.DownloadLogs.Logs.Label".loc()),
            				Builder.node('div', {className: 'checkbox'}, [
            					Builder.node('label', [
            						Builder.node('input', {'tabindex': ++tabIndex, 'role': 'checkbox', type: 'checkbox', 'checked': true, 'className': 'includeBuildLogs'}),
            						"_XC.Bot.DownloadLogs.BuildLogs.Checkbox.Label".loc()
            					])
            				]),
            				Builder.node('div', {className: 'checkbox'}, [
            					Builder.node('label', [
            						Builder.node('input', {'tabindex': ++tabIndex, 'role': 'checkbox', type: 'checkbox', 'checked': true, 'className': 'includeSCMLogs'}),
            						"_XC.Bot.DownloadLogs.SourceControlLogs.Checkbox.Label".loc()
            					])
            				]),
            				Builder.node('div', {className: 'checkbox'}, [
            					Builder.node('label', [
            						Builder.node('input', {'tabindex': ++tabIndex, 'role': 'checkbox', type: 'checkbox', 'checked': true, 'className': 'includeBuildServiceOutput'}),
            						"_XC.Bot.DownloadLogs.XcodeServerLogs.Checkbox.Label".loc()
            					])
            				]),
            				Builder.node('div', {className: 'checkbox'}, [
            					Builder.node('label', [
            						Builder.node('input', {'tabindex': ++tabIndex, 'role': 'checkbox', type: 'checkbox', 'checked': true, 'className': 'includeBuildBundle'}),
            						"_XC.Bot.DownloadLogs.XcodeOutput.Checkbox.Label".loc()
            					])
            				]),
            				Builder.node('div', {className: 'checkbox'}, [
            					Builder.node('label', [
            						Builder.node('input', {'tabindex': ++tabIndex, 'role': 'checkbox', type: 'checkbox', 'checked': true, 'className': 'includeConfigAndVersions'}),
            						"_XC.Bot.DownloadLogs.BotConfigAndVersions.Checkbox.Label".loc()
            					])
            				])
            			])
                    ])
				])
			]),
			Builder.node('div', {className: 'controls'}, [
				Builder.node('input', {'role': 'button', 'tabindex': tabIndexCancel, className: 'button cancel', 'type': 'button', 'value': "_XC.Bot.DownloadLogs.CancelButton.Title".loc()}),
				Builder.node('input', {'role': 'button', 'tabindex': tabIndexNext, className: 'button done', 'type': 'button', 'value': "_XC.Bot.DownloadLogs.DownloadButton.Title".loc()})
			])
		]);
	}
});

CC.XcodeServer.BotLogDownloadAssistant = Class.create(CC.Mvc.View, {
    mAssistantPanel: null,
    mBotRunGUID: null,
	initialize: function($super) {
		$super();
		// Render this view.
		this.forceRender();
		// Add each of the panel views we need.
		this.mAssistantPanel = new CC.XcodeServer.BotLogDownloadAssistantPanel();
		this.addSubview(this.mAssistantPanel, 'div.dialog form');
		// Register event handlers.
		var element = this.mParentElement;
        element.select('.button.cancel').invoke('observe', 'click', this.onCancelButtonClick.bind(this));
        element.select('.button.done').invoke('observe', 'click', this.onDownloadButtonClick.bind(this));
	},
	render: function() {
		return element = Builder.node('div', {className: 'xc-new-bot-assistant xc-download-logs-panel'}, [
			Builder.node('div', {className: 'mask'}),
			Builder.node('div', {'role': 'dialog', 'aria-label': "_XC.Bot.Settings.Dialog.Title".loc(), className: 'dialog'}, [
				Builder.node('div', {className: 'dialog_contents'}, [
					Builder.node('form')
				])
			])
		]);
	},
	showAssistant: function() {
        rootView.addSubview(this);
        dialogManager().showProgressMessage("_Loading".loc());
        
        var botRunGUID = null;
        
        // pick up here after we get the bot run GUID
        var continuation = function(){
            xcservice().checkOutputLogsAvailableForBotRunGUID(botRunGUID, function(logsAvailable){
                dialogManager().hideProgressMessage();
            	
                if (logsAvailable == CC.XcodeServer.BotRunOutputLogsNone)
                {
                    rootView.removeSubviews([this]);
                    alert("_XC.Bot.DownloadLogs.NoLogsAvailable.Alert".loc());
                    return;
                }
                else
                {
                    if ((logsAvailable & CC.XcodeServer.BotRunOutputLogsBuildLogs) == 0)
                    {
                        this.mParentElement.down('.includeBuildLogs').checked = false;
                        this.mParentElement.down('.includeBuildLogs').disabled = true;
                    }
                
                    if ((logsAvailable & CC.XcodeServer.BotRunOutputLogsSCMLogs) == 0)
                    {
                        this.mParentElement.down('.includeSCMLogs').checked = false;
                        this.mParentElement.down('.includeSCMLogs').disabled = true;
                    }
                
                    if ((logsAvailable & CC.XcodeServer.BotRunOutputLogsBuildServiceOutput) == 0)
                    {
                        this.mParentElement.down('.includeBuildServiceOutput').checked = false;
                        this.mParentElement.down('.includeBuildServiceOutput').disabled = true;
                    }
                
                    if ((logsAvailable & CC.XcodeServer.BotRunOutputLogsBuildBundle) == 0)
                    {
                        this.mParentElement.down('.includeBuildBundle').checked = false;
                        this.mParentElement.down('.includeBuildBundle').disabled = true;
                    }
                
                    if ((logsAvailable & CC.XcodeServer.BotRunOutputLogsConfigurationAndVersions) == 0)
                    {
                        this.mParentElement.down('.includeConfigAndVersions').checked = false;
                        this.mParentElement.down('.includeConfigAndVersions').disabled = true;
                    }
                }
            
                this.mBotRunGUID = botRunGUID;
        		this.becomeFirstResponder();
        		this.setVisible(true);
        
        		// Temporary disabling background items when modal dialog is open in order to avoid bad tabindex-ing
        		accessibility().setRootViewsAriaHidden(true, true);
            }.bind(this), function(){
                dialogManager().hideProgressMessage();
                rootView.removeSubviews([this]);
                alert("_XC.Bot.DownloadLogs.Error.Alert".loc());
            }.bind(this));
        }.bind(this);
        
        // fetch the appropriate bot run GUID
        var botRunInfo = sharedBotDetailView.mBotRunSidebarView.getSelectedSidebarItemInfo();
        if (botRunInfo.type == 'com.apple.entity.BotRun')
        {
            botRunGUID = botRunInfo.guid;
            continuation();
        }
        else if (botRunInfo.type == 'com.apple.entity.Bot')
        {
    		var botGUID = CC.meta('x-apple-entity-guid');
    		var batch = [
    			['XCBotService', 'botForGUID:', botGUID],
    			['XCBotService', 'latestBotRunForBotGUID:', botGUID],
    			['XCBotService', 'latestTerminalBotRunForBotGUID:', botGUID]
    		];
    		var batchErrback = function(){
                dialogManager().hideProgressMessage();
                rootView.removeSubviews([this]);
                alert("_XC.Bot.DownloadLogs.Error.Alert".loc());
            }.bind(this);
            
    		var batchCallback = function(inBatchedResponse) {
    			if (inBatchedResponse && inBatchedResponse.responses && inBatchedResponse.responses.length == 3) {
    				var botEntity = inBatchedResponse.responses[0].response;
    				var latestBotRunEntity = inBatchedResponse.responses[1].response;
    				var latestTerminalBotRunEntity = inBatchedResponse.responses[2].response;
                    
                    // if we don't have a latest run, this bot has never run before
    				if (!latestBotRunEntity)
                    {
                        alert("_XC.Bot.DownloadLogs.NeverRun.Alert".loc());
    					return;
    				}
                    
					var assistantTitleNode = this.$().down('h3.title');
					var integrationNumber = (latestTerminalBotRunEntity.integration ? latestTerminalBotRunEntity.integration : "");
					assistantTitleNode.innerHTML = ("_XC.Bot.DownloadLogs.Dialog.Title".loc(integrationNumber)).escapeHTML();
					
    				botRunGUID = latestTerminalBotRunEntity.guid;
                    continuation();
    			}
    			else
    				batchErrback();
    		}.bind(this);
    		service_client().batchExecuteAsynchronously(batch, {}, batchCallback, batchErrback);
        }
	},
	// Shared event handlers for each of the control buttons on the panels.
	onCancelButtonClick: function() {
		this.hideAssistant();
        this.mBotRunGUID = null;
	},
    onDownloadButtonClick: function() {
        // build the appropriate bitmask
        var bitmask = CC.XcodeServer.BotRunOutputLogsNone;
        
        if (this.mParentElement.down('.includeBuildLogs').checked)
            bitmask |= CC.XcodeServer.BotRunOutputLogsBuildLogs;
        if (this.mParentElement.down('.includeSCMLogs').checked)
            bitmask |= CC.XcodeServer.BotRunOutputLogsSCMLogs;
        if (this.mParentElement.down('.includeBuildServiceOutput').checked)
            bitmask |= CC.XcodeServer.BotRunOutputLogsBuildServiceOutput;
        if (this.mParentElement.down('.includeBuildBundle').checked)
            bitmask |= CC.XcodeServer.BotRunOutputLogsBuildBundle;
        if (this.mParentElement.down('.includeConfigAndVersions').checked)
            bitmask |= CC.XcodeServer.BotRunOutputLogsConfigurationAndVersions;
        
        this.hideAssistant();
        
        var botRunGUID = this.mBotRunGUID;
        this.mBotRunGUID = null;
        
        // construct a URL, and redirect
        var theURL = '/xcs/logbundle/%@/%@'.fmt(botRunGUID, bitmask);
        window.location.href = theURL;
    },
	hideAssistant: function() {
		this.setVisible(false);
		this.loseFirstResponder();
		
		// Bring background items back to foreground when closing modal dialog to bring back original tabindex-ing
		accessibility().setRootViewsAriaHidden(false, false);
        rootView.removeSubviews([this]);
	},
	handleKeyboardNotification: function(inMessage, inObject, inOptExtras) {
		if (inMessage == CC.Keyboard.NOTIFICATION_DID_KEYBOARD_ESC) {
			this.hideAssistant();
		} else if (inMessage == CC.Keyboard.NOTIFICATION_DID_KEYBOARD_RETURN) {
			if (this.mPanelSet.selected().$().hasClassName('done')) {
				this.onDoneButtonClick();
			}
		}
		return true;
	}
});
// Copyright (c) 2014 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.



// Download logs menu item.

CC.XcodeServer.DownloadIntegrationLogsMenuItem = Class.create(CC.MenuItem, {
    mDisplayTitle: "_XC.Bot.MenuItem.DownloadLogs.Title".loc(),
	itemShouldDisplay: function() {
		var entityType = CC.meta('x-apple-entity-type');
		var route = CC.meta('x-apple-route');
		return (entityType == 'com.apple.entity.Bot');
	},
    action: function(inEvent) {
        var assistant = new CC.XcodeServer.BotLogDownloadAssistant();
		assistant.setVisible(false);
        assistant.showAssistant();
    }
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.



// New bot menu item.

CC.XcodeServer.NewBotMenuItem = Class.create(CC.MenuItem, {
	mDisplayTitleLocKey: "_XC.Bot.MenuItem.New.Title",
	action: function(inEvent) {
		var assistant = new CC.XcodeServer.NewBotAssistant();
		rootView.addSubview(assistant);
		assistant.setVisible(false);
		assistant.showAssistant();
	},
	itemShouldDisplay: function() {
		return (CC.meta('x-apple-user-can-create-bots') == "true");
	},
	getAccessibilityID: function() {
		return accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_NAV_PLUS_NEW_BOT);
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

// Base header view.  Mostly for shared styling.

CC.XcodeServer.ListHeaderView = Class.create(CC.Mvc.View, {
	mClassName: 'xc-list-header-view'
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
//
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.





// Notifications.

CC.XcodeServer.NOTIFICATION_BOT_RUN_DID_START = 'BOT_RUN_DID_START';
CC.XcodeServer.NOTIFICATION_BOT_RUN_DID_SUCCEED = 'BOT_RUN_DID_SUCCEED';
CC.XcodeServer.NOTIFICATION_BOT_RUN_DID_FAIL = 'BOT_RUN_DID_FAIL';
CC.XcodeServer.NOTIFICATION_BOT_HEADER_LINK_CLICKED = 'BOT_HEADER_LINK_CLICKED';

// Header link items.

CC.XcodeServer.BotHeaderBaseLink = Class.create(CC.MenuItem, {
	mLinkGUID: 'links/unknown',
	mLabelledBy: null,
	mTabName: null,
	mIntegrationNumber: null,
	initialize: function($super, inIntegrationNumber) {
		var entityTinyID = CC.meta('x-apple-entity-tinyID');
		this.mTabName = this.mLinkGUID.replace('links/', '');
		this.mIntegrationNumber = inIntegrationNumber;
		var urlRegex = new RegExp("/xcode/bots/" + entityTinyID + "/integration/(.*)/");
		
		this.mURL = CC.XcodeServer.botEntityURLForTinyIDAndOptionalIntegrationNumberAndTabName(entityTinyID, this.mIntegrationNumber, this.mTabName);
		
		$super();
		this.mElement.setAttribute('data-guid', this.mLinkGUID);
		this.mElement.setAttribute('role', 'tab');
		this.mElement.setAttribute('aria-labelledby', this.mLabelledBy);
		var aTag = this.mElement.querySelector('a');
		aTag.classList.add('cc-routable');
		aTag.setAttribute('data-push-state', "true");
		aTag.setAttribute('data-tab-name', this.mTabName);
	},
	action: function() {
		globalNotificationCenter().publish(CC.XcodeServer.NOTIFICATION_BOT_HEADER_LINK_CLICKED, this, {'guid': this.mLinkGUID});
	}
});

CC.XcodeServer.BotHeaderSummaryLink = Class.create(CC.XcodeServer.BotHeaderBaseLink, {
	mLinkGUID: 'links/summary',
	mDisplayTitle: "_XC.Bot.Header.Links.Summary.Title".loc(),
	mLabelledBy: 'tabSummary',
	getAccessibilityID: function() {
		return accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_SUMMARY);
	},	
	getElementID: function() {
		return 'tabSummary';
	}
});

CC.XcodeServer.BotHeaderTestsLink = Class.create(CC.XcodeServer.BotHeaderBaseLink, {
	mLinkGUID: 'links/tests',
	mDisplayTitle: "_XC.Bot.Header.Links.Tests.Title".loc(),
	mLabelledBy: 'tabTests',	
	getAccessibilityID: function() {
		return accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_TESTS);
	},	
	getElementID: function() {
		return 'tabTests';
	}
});

CC.XcodeServer.BotHeaderCommitHistoryLink = Class.create(CC.XcodeServer.BotHeaderBaseLink, {
	mLinkGUID: 'links/commits',
	mDisplayTitle: "_XC.Bot.Header.Links.Commits.Title".loc(),
	mLabelledBy: 'tabCommits',	
	getAccessibilityID: function() {
		return accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_COMMITS);
	},	
	getElementID: function() {
		return 'tabCommits';
	}	
});

CC.XcodeServer.BotHeaderLogsLink  = Class.create(CC.XcodeServer.BotHeaderBaseLink, {
	mLinkGUID: 'links/logs',
	mDisplayTitle: "_XC.Bot.Header.Links.Logs.Title".loc(),
	mLabelledBy: 'tabLogs',	
	getAccessibilityID: function() {
		return accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_LOGS);
	},	
	getElementID: function() {
		return 'tabLogs';
	}	
});

CC.XcodeServer.BotHeaderArchivesLink = Class.create(CC.XcodeServer.BotHeaderBaseLink, {
	mLinkGUID: 'links/archives',
	mDisplayTitle: "_XC.Bot.Header.Links.Archives.Title".loc(),
	mLabelledBy: 'tabArchives',	
	getAccessibilityID: function() {
		return accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_ARCHIVES);
	},	
	getElementID: function() {
		return 'tabArchives';
	}
});

// Bot header view which displays a title and schedule summary.

CC.XcodeServer.BotHeaderView = Class.create(CC.XcodeServer.ListHeaderView, {
	mBotEntity: null,
	mPreviousWorkSchedule: null,
	mMarginLeft: null,
	mScheduleEditorOpen: false,
	mLinkItems: [
		new CC.XcodeServer.BotHeaderSummaryLink(this.mIntegrationNumber),
		new CC.XcodeServer.BotHeaderTestsLink(this.mIntegrationNumber),
		new CC.XcodeServer.BotHeaderCommitHistoryLink(this.mIntegrationNumber),
		new CC.XcodeServer.BotHeaderLogsLink(this.mIntegrationNumber),
		new CC.XcodeServer.BotHeaderArchivesLink(this.mIntegrationNumber)
	],
	mIntegrationNumber: null,
	mTabName: null,
	mIntegrateButton: null,
	mEntityGUID: null,
	initialize: function($super, inBotRun, inIntegrationNumber, inTabName) {
		$super(inBotRun);
		this.mIntegrationNumber = inIntegrationNumber;
		this.mTabName = inTabName;
		globalNotificationCenter().subscribe(CC.XcodeServer.NOTIFICATION_BOT_HEADER_LINK_CLICKED, this.handleLinkItemClickedNotification.bind(this));
		globalNotificationCenter().subscribe(CC.Routes.NOTIFICATION_UPDATE_ROUTES_INTEGRATION_NUMBER, this.handleUpdateRoutesIntegrationNumber.bind(this));
		this.mEntityGUID = CC.meta('x-apple-entity-guid');
	},
	render: function() {
		var canCreateBots = (CC.meta("x-apple-user-can-create-bots") == "true");
		var elem = Builder.node('div', {'role': 'navigation', 'aria-label': "_XC.Accessibility.Navigation.IntegrationMenu".loc(), className: 'xc-bot-header-view'});
		var fragment = document.createDocumentFragment();
		var tabIndex = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_INTEGRATE);
		if (canCreateBots) {
			this.mIntegrateButton = new CC.XcodeServer.IntegrateButtonView("_XC.Bot.Control.Run.Title".loc(), "_XC.Bot.Control.CleanRun.Title".loc(), this.handleStartBotClicked.bind(this), this.handleCleanStartBotClicked.bind(this), this.mEntityGUID, tabIndex);
			this.mIntegrateButton.forceRender();
			fragment.appendChild(Builder.node('div', {className: 'controls'}, [
				this.mIntegrateButton.$()
			]));
		}
		fragment.appendChild(Builder.node('div', {className: 'links'}, [
			Builder.node('ul', {'role': 'tablist'}, [this.mLinkItems.collect(function(item) { return item.mElement; })])
		]));
		fragment.appendChild(Builder.node('div', {className: 'header'}));
		elem.appendChild(fragment);
		return elem;
	},
	handleDidRenderView: function($super, inOptInfo) {
		$super(inOptInfo);
		// Append a new entity title view for this bot.
		var objectController = new CC.Mvc.ObjectController({'mRecord': this.mBotEntity});
		var entityTitleView = new CC.EntityTitle.EntityTitleView({'mContent': objectController});
		this.addSubview(entityTitleView, 'div.header', true);
		entityTitleView.updateDisplay(undefined, objectController, undefined);
	},
	handleGotSchedule: function(inResponse) {
		var schedule, firstRecurrence;
		if (inResponse && inResponse.response) {
			this.mPreviousWorkSchedule = this.__mapResponseToWorkSchedule(inResponse.response);
		}
		// If we have a recurrence, build a user-friendly description string from it.
		var scheduleString = CC.XcodeServer.localizedNextScheduleString(this.mPreviousWorkSchedule);
		var scheduleElement = this.$().down('span.schedule');
		scheduleElement.down('div.description').textContent = scheduleString;
	},
	handleEditScheduleButtonClicked: function() {
		if ( this.mScheduleEditorOpen ) return;
		this.mScheduleEditorOpen = true;
		if ($('xc_bot_schedule_edit_dialog')) Element.remove('xc_bot_schedule_edit_dialog');
		dialogManager().drawDialog('xc_bot_schedule_edit_dialog', [""], "_Dialogs.OK".loc(), false, "_XC.Bot.Schedule.EditDialog.Title".loc(), "_Dialogs.Cancel".loc());
		// Fetch the bot so we have its extendedAttributes.
		var botEntityGUID = this.mBotEntity.guid;
		server_proxy().entityForGUID(botEntityGUID, function(botEntity) {
			var scheduleInfoView = this.mScheduleInfoView = new CC.XcodeServer.BotScheduleInfoView();
			scheduleInfoView._render();
			var scheduleEditorView = this.mScheduleEditorView = this.mScheduleInfoView.mScheduleEditorView;
			var recurrence = (this.mPreviousWorkSchedule && this.mPreviousWorkSchedule.recurrences && this.mPreviousWorkSchedule.recurrences[0]);
			scheduleEditorView.setScheduleRecurrence(recurrence);
			// Update schedule type.
			var scheduleType = 'manual';
			if (recurrence) scheduleType = "periodic";
			if (botEntity.extendedAttributes && botEntity.extendedAttributes['pollForSCMChanges']) scheduleType = "poll";
			if (botEntity.extendedAttributes && botEntity.extendedAttributes['buildOnTrigger']) scheduleType = "trigger";
			this.mScheduleEditorView.setScheduleType(scheduleType);
			// Clean preference.
			var buildFromClean = (botEntity.extendedAttributes && botEntity.extendedAttributes['buildFromClean']);
			scheduleInfoView.$('input.buildFromClean').checked = (buildFromClean == true);
			// Integration preferences.
			var integratePerformsAnalyze = (botEntity.extendedAttributes && botEntity.extendedAttributes['integratePerformsAnalyze']);
			scheduleInfoView.$('input.integratePerformsAnalyze').checked = (integratePerformsAnalyze == true);
			var integratePerformsTest = (botEntity.extendedAttributes && botEntity.extendedAttributes['integratePerformsTest']);
			scheduleInfoView.$('input.integratePerformsTest').checked = (integratePerformsTest == true);
			var integratePerformsArchive = (botEntity.extendedAttributes && botEntity.extendedAttributes['integratePerformsArchive']);
			scheduleInfoView.$('input.integratePerformsArchive').checked = (integratePerformsArchive == true);
			// Show the dialog.
			$("xc_bot_schedule_edit_dialog").down(".dialog_description").insert(scheduleInfoView.$());
			dialogManager().show('xc_bot_schedule_edit_dialog', null, this.onEditScheduleDialogOKClicked.bind(this));
			this.mScheduleEditorOpen = false;
		}.bind(this), Prototype.emptyFunction);
	},
	onEditScheduleDialogOKClicked: function(inEvent) {
		dialogManager().showProgressMessage("_XC.Bot.Schedule.EditDialog.Progress.Updating".loc());
		var recurrence = this.mScheduleEditorView.getScheduleRecurrence();
		var scheduleCallback = function() {
			xcservice().scheduleBotWithGUID(this.mBotEntity.guid, [recurrence], function(inResponse) {
				this.mPreviousWorkSchedule = this.__mapResponseToWorkSchedule(inResponse.response);
				var scheduleString = CC.XcodeServer.localizedNextScheduleString(this.mPreviousWorkSchedule);
				this.$().down('div.info span.description').textContent = scheduleString;
				this.afterDidUpdateScheduleForBot();
			}.bind(this), function() {
				dialogManager().hide();
				notifier().printErrorMessage("_XC.Bot.Schedule.EditDialog.Progress.Failed".loc());
			});
		}.bind(this);
		// If the schedule is disabled and we have a previous schedule, delete it and return.
		// Otherwise if we have a previous schedule, update it. Otherwise set a new schedule.
		var boundDidUpdateScheduleForBot = this.didUpdateScheduleForBot.bind(this);
		if (this.mPreviousWorkSchedule) {
			if (!recurrence) {
				xcservice().deleteWorkScheduleWithScheduleGUID(this.mPreviousWorkSchedule.guid, function() {
					delete this.mPreviousWorkSchedule;
					this.updateScheduleString();
					this.mScheduleEditorView.setScheduleRecurrence();
					this.afterDidUpdateScheduleForBot();
				}.bind(this), function() {
					dialogManager().hide();
					notifier().printErrorMessage("_XC.Bot.Schedule.EditDialog.Progress.Failed".loc());
				});
				return;
			} else {
				this.mPreviousWorkSchedule.recurrences = [recurrence];
				xcservice().updateWorkSchedule(this.mPreviousWorkSchedule, boundDidUpdateScheduleForBot, boundDidUpdateScheduleForBot);
			}
		} else {
			xcservice().scheduleBotWithGUID(this.mBotEntity.guid, [recurrence], boundDidUpdateScheduleForBot, boundDidUpdateScheduleForBot);
		}
	},
	didUpdateScheduleForBot: function(inResponse) {
		if (inResponse && inResponse.response) {
			this.mPreviousWorkSchedule = this.__mapResponseToWorkSchedule(inResponse && inResponse.response);
			this.updateScheduleString(this.mPreviousWorkSchedule);
			this.afterDidUpdateScheduleForBot();
		} else {
			notifier().printErrorMessage("_XC.Bot.Schedule.EditDialog.Progress.Failed".loc());
		}
	},
	afterDidUpdateScheduleForBot: function() {
		var botEntityGUID = this.mBotEntity.guid;
		if (botEntityGUID) {
			server_proxy().entityForGUID(botEntityGUID, function(botEntity) {
				// Build a changeset for the extendedAttributes for this bot.
				var xattrs = botEntity.extendedAttributes;
				var scheduleType = this.mScheduleEditorView.getScheduleType();
				xattrs['pollForSCMChanges'] = (scheduleType == "poll");
				xattrs['buildOnTrigger'] = (scheduleType == "trigger");
				xattrs['buildFromClean'] = (this.mScheduleInfoView.$('input.buildFromClean').checked == true);
				xattrs['integratePerformsAnalyze'] = (this.mScheduleInfoView.$('input.integratePerformsAnalyze').checked == true);
				xattrs['integratePerformsTest'] = (this.mScheduleInfoView.$('input.integratePerformsTest').checked == true);
				xattrs['integratePerformsArchive'] = (this.mScheduleInfoView.$('input.integratePerformsArchive').checked == true);
				var cs = new CC.EntityTypes.EntityChangeSet({
					'changeAction': "UPDATE",
					'entityGUID': botEntity.guid,
					'entityRevision': botEntity.revision,
					'entityType': botEntity.type,
					'changes': [['extendedAttributes', xattrs]],
					'force': false
				});
				server_proxy().updateEntity(cs, function() {
					dialogManager().hide();
				}.bind(this), function(){
					dialogManager().hide();
					notifier().printErrorMessage("_XC.Bot.Schedule.EditDialog.Progress.Failed".loc());
				});
			}.bind(this), function() {
				dialogManager().hide();
				notifier().printErrorMessage("_XC.Bot.Schedule.EditDialog.Progress.Failed".loc());
			});
		}
	},
	updateScheduleString: function(inSchedule) {
		var scheduleString = CC.XcodeServer.localizedNextScheduleString(inSchedule);
		this.$().down('div.info div.description').textContent = scheduleString;
	},
	__mapResponseToWorkSchedule: function(inResponse) {
		if (!inResponse || inResponse.type != "com.apple.XCWorkSchedule") return undefined;
		// Unpack the response.
		var schedule = new CC.EntityTypes.XCWorkSchedule(inResponse);
		// Make each of the recurrences proper XCWorkScheduleRecurrence instances.
		var recurrences = [];
		if (schedule.recurrences) {
			for (var idx = 0; idx < schedule.recurrences.length; idx++) {
				recurrences.push(new CC.EntityTypes.XCWorkScheduleRecurrence(schedule.recurrences[idx]));
			}
		}
		schedule.recurrences = recurrences;
		return schedule;
	},
	handleLinkItemClickedNotification: function(inMessage, inObject, inOptExtras) {
		var tabGuid = inOptExtras.guid;
		this.markLinkItemAsSelectedWithGUID(tabGuid);
	},
	markLinkItemAsSelectedWithGUID: function(inGUID) {
		var linkItems = this.mLinkItems, linkItem;
		for (var idx = 0; idx < linkItems.length; idx++) {
			linkItem = linkItems[idx];
			linkItem.markAsSelected(linkItem.mLinkGUID == inGUID);
		}
	},
	handleStartBotClicked: function() {
		var botGUID = CC.meta('x-apple-entity-guid');
		var botTinyID = CC.meta('x-apple-entity-tinyID');
		dialogManager().showProgressMessage("_Loading".loc());
		xcservice().startBotWithGUID(botGUID, function() {
			dialogManager().hide();
			globalNotificationCenter().publish(CC.XcodeServer.NOTIFICATION_BOT_RUN_DID_START, this, {'guid': botGUID});
			var routeURL = CC.XcodeServer.botEntityURLForTinyIDAndOptionalIntegrationNumberAndTabName(botTinyID);
			if (sharedBotDetailView && sharedBotDetailView.mCurrentlyFocusedBotRunEntityGUID) {
				// Deliberately don't route if we have navigated away.
				return;
			}
			globalRouteHandler().routeURL(routeURL, undefined, true, false, true);
		}.bind(this), function() {
			notifier().printErrorMessage("_XC.Bot.Control.Run.Error".loc());
		});
	},
	handleActivityStreamUpdate: function(inBotRunEntity) {
		if (inBotRunEntity && this.mIntegrateButton.getGuid() == inBotRunEntity.ownerGUID) {
			this.mIntegrateButton.updateStatus(inBotRunEntity.status);
		}
	},
	handleLatestBotRunServiceResponse: function(service_response) {
		if (service_response && service_response.responses) {
			var responses = service_response.responses;
			for (var i = 0; i < responses.length; i++) {
				var latestBotRunEntity = (responses[i] && responses[i].response);
				if (latestBotRunEntity) {
					this.handleActivityStreamUpdate(latestBotRunEntity);
				}
			}
		}
	},
	handleCleanStartBotClicked: function(inEvent) {
		var botGUID = CC.meta('x-apple-entity-guid');
		dialogManager().showProgressMessage("_Loading".loc());
		xcservice().cleanAndStartBotWithGUID(botGUID, function() {
			dialogManager().hide();
			globalNotificationCenter().publish(CC.XcodeServer.NOTIFICATION_BOT_RUN_DID_START, this, {'guid': botGUID});
		}.bind(this), function() {
			notifier().printErrorMessage("_XC.Bot.Control.Run.Error".loc());
		});
	},
	handleUpdateRoutesIntegrationNumber: function(inMessage, inObject, inOptExtras) {
		var nodes = this.$().querySelectorAll('a.cc-menu-item');
		this.mIntegrationNumber = (inOptExtras && inOptExtras.integrationNumber);
		for (var i = 0; i < nodes.length; i++) {
			var node = nodes[i];
			var tabName = (node && node.getAttribute('data-tab-name'));
			var entityTinyID = CC.meta('x-apple-entity-tinyID');
			var routeURL = CC.XcodeServer.botEntityURLForTinyIDAndOptionalIntegrationNumberAndTabName(entityTinyID, this.mIntegrationNumber, tabName);
			node.setAttribute('href', routeURL);
		};
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

CC.XcodeServer.BOT_RUN_STATUS_READY = 'ready';
CC.XcodeServer.BOT_RUN_STATUS_RUNNING = 'running';
CC.XcodeServer.BOT_RUN_STATUS_COMPLETED = 'completed';
CC.XcodeServer.BOT_RUN_STATUS_FAILED = 'failed';
CC.XcodeServer.BOT_RUN_STATUS_PAUSED = 'paused';
CC.XcodeServer.BOT_RUN_STATUS_CANCELED = 'canceled';
CC.XcodeServer.BOT_RUN_SUBSTATUS_CHECKOUT = "checkout";
CC.XcodeServer.BOT_RUN_SUBSTATUS_BUILDING = "building";
CC.XcodeServer.BOT_RUN_SUBSTATUS_UPLOADING = "uploading";
CC.XcodeServer.BOT_RUN_SUBSTATUS_BUILD_ERRORS = "build-errors";
CC.XcodeServer.BOT_RUN_SUBSTATUS_BUILD_FAILED = "build-failed";
CC.XcodeServer.BOT_RUN_SUBSTATUS_CHECKOUT_ERROR = "checkout-error";
CC.XcodeServer.BOT_RUN_SUBSTATUS_COMMIT_HISTORY_ERROR = "commit-history-error";
CC.XcodeServer.BOT_RUN_SUBSTATUS_INTERNAL_ERROR = "internal-error";
CC.XcodeServer.BOT_RUN_SUBSTATUS_INTERNAL_ERRORS = "internal-";
CC.XcodeServer.BOT_RUN_SUBSTATUS_TEST_FAILURES = "test-failures";
CC.XcodeServer.BOT_RUN_SUBSTATUS_WARNINGS = "warnings";
CC.XcodeServer.BOT_RUN_SUBSTATUS_ANALYSIS_ISSUES = "analysis-issues";
CC.XcodeServer.BOT_RUN_SUBSTATUS_SUCCEEDED = "succeeded";

// Bot run status element helpers.

CC.XcodeServer.BOT_RUN_STATUS_STYLE_TEXT = "BOT_RUN_STATUS_STYLE_TEXT";
CC.XcodeServer.BOT_RUN_STATUS_STYLE_ICON = "BOT_RUN_STATUS_STYLE_ICON";

CC.XcodeServer.statusElementForBotRunEntity = function(inBotRunEntity, inOptUseIconStyle, inOptDisabled) {
	return CC.XcodeServer.statusElementForBotRunStatus(inBotRunEntity.status, inBotRunEntity.subStatus, inOptUseIconStyle, inOptDisabled);
};

CC.XcodeServer.statusElementForBotRunStatus = function(inStatus, inSubStatus, inOptUseIconStyle, inOptDisabled) {
	var style = (inOptUseIconStyle ? CC.XcodeServer.BOT_RUN_STATUS_STYLE_ICON : CC.XcodeServer.BOT_RUN_STATUS_STYLE_TEXT);
	var tabIndex = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_INTEGRATE);
	var elem = Builder.node('span', {'tabindex': tabIndex, 'role': 'presentation', className: 'xc-bot-status'});
	if (style == CC.XcodeServer.BOT_RUN_STATUS_STYLE_ICON) elem.addClassName('icon-only');
	if (inOptDisabled) elem.addClassName('disabled');
	CC.XcodeServer.updateStatusElementWithStatus(elem, inStatus, inSubStatus);
	return elem;
};

CC.XcodeServer.updateStatusElementWithStatus = function(inElement, inStatus, inSubStatus) {
	var elem = $(inElement);
	if (!elem) return;
	var displayedStatusString = CC.XcodeServer.statusStringForStatus(inStatus, inSubStatus);
	var iconOnly = false, disabled = false;
	if (elem.hasClassName('icon-only')) iconOnly = true;
	if (elem.hasClassName('disabled')) disabled = true;
	elem.className = "xc-bot-status";
	var normalizedStatus = CC.XcodeServer.normalizedStatusForBot(inStatus);
	var normalizedSubStatus = CC.XcodeServer.normalizedStatusForBot(inSubStatus);
	var statusClassName = normalizedStatus;
	if (normalizedSubStatus) statusClassName += " " + normalizedSubStatus;
	elem.addClassName(statusClassName);
	if (iconOnly) elem.addClassName('icon-only');
	if (disabled) elem.addClassName('disabled');
	elem.setAttribute('data-status', normalizedStatus);
	elem.setAttribute('data-sub-status', normalizedSubStatus);
	elem.update(displayedStatusString);
};

CC.XcodeServer.statusStringForStatus = function(inStatus, inSubStatus) {
	var displayedStatusString = "";
	var normalizedStatus = CC.XcodeServer.normalizedStatusForBot(inStatus);
	var normalizedSubStatus = CC.XcodeServer.normalizedStatusForBot(inSubStatus);
	var localizedStatus = "_XC.Bot.Status.%@".fmt(CC.XcodeServer.localizationStringSubstringForStatus(inStatus)).loc();
	var localizedSubStatus = "_XC.Bot.SubStatus.%@".fmt(CC.XcodeServer.localizationStringSubstringForStatus(inSubStatus)).loc();
	if (normalizedStatus == CC.XcodeServer.BOT_RUN_STATUS_RUNNING || normalizedStatus == CC.XcodeServer.BOT_RUN_STATUS_COMPLETED) {
		if (normalizedSubStatus) {
			displayedStatusString = localizedSubStatus;
		} else {
			displayedStatusString = localizedStatus;
		}
	} else {
		displayedStatusString = localizedStatus;
	}
	return displayedStatusString;
};

// Bot run summary element helpers

CC.XcodeServer.summaryElementForBotRunEntity = function(inBotRunEntity, inOptPreviousBotRunEntity) {
	var info = CC.XcodeServer.errorsAnalysisIssuesWarningsTestsDictForBotRun(inBotRunEntity);
	var pastInfo = inOptPreviousBotRunEntity && CC.XcodeServer.errorsAnalysisIssuesWarningsTestsDictForBotRun(inOptPreviousBotRunEntity);
	var el = CC.XcodeServer.summaryElementForBotRunSummary(
		info.error.count,
		info.warning.count,
		info.analysis.count,
		undefined,
		undefined,
		pastInfo && pastInfo.error.count,
		pastInfo && pastInfo.warning.count,
		pastInfo && pastInfo.analysis.count,
		undefined,
		undefined
	);
	return el;
};

CC.XcodeServer.summaryElementWithTestsForBotRunEntity = function(inBotRunEntity, inOptPreviousBotRunEntity, inOptCallback) {
	var info = CC.XcodeServer.errorsAnalysisIssuesWarningsTestsDictForBotRun(inBotRunEntity);
	var pastInfo = inOptPreviousBotRunEntity && CC.XcodeServer.errorsAnalysisIssuesWarningsTestsDictForBotRun(inOptPreviousBotRunEntity);
	var el = CC.XcodeServer.summaryElementForBotRunSummary(
		info.error.count,
		info.warning.count,
		info.analysis.count,
		info.tests.passed,
		info.tests.failed,
		pastInfo && pastInfo.error.count,
		pastInfo && pastInfo.warning.count,
		pastInfo && pastInfo.analysis.count,
		pastInfo && pastInfo.tests.passed,
		pastInfo && pastInfo.tests.failed
	);
	return el;
};

CC.XcodeServer.summaryElementForBotRunSummary = function(inErrorCount, inWarningCount, inIssueCount, inOptTestsPassed, inOptTestsFailed, inOptPastErrorCount, inOptPastWarningCount, inOptPastIssueCount, inOptPastTestsPassed, inOptPastTestsFailed) {
	
	var tabindexResultsErrors = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_SUMMARY_RESULTS_ERRORS);
	var tabindexResultsWarnings = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_SUMMARY_RESULTS_WARNINGS);
	var tabindexResultsIssues = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_SUMMARY_RESULTS_ISSUES);
	var tabindexResultsSummary = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_SUMMARY_RESULTS_TESTS_SUMMARY);	
	
	var el = Builder.node('div', {'role': 'presentation', className: 'xc-bot-run-summary'}, [
		Builder.node('div', {'tabindex': tabindexResultsErrors, 'aria-readonly': 'true', className: 'status errors'}, [
			Builder.node('div', {className: 'count ellipsis reltext'}),
			Builder.node('div', {className: 'label ellipsis reltext'}, '_XC.Bot.Summary.Errors.Label'.loc())
		]),
		Builder.node('div', {'tabindex': tabindexResultsWarnings, 'aria-readonly': 'true', className: 'status warnings'}, [
			Builder.node('div', {className: 'count ellipsis reltext'}),
			Builder.node('div', {className: 'label ellipsis reltext'}, '_XC.Bot.Summary.Warnings.Label'.loc())
		]),
		Builder.node('div', {'tabindex': tabindexResultsIssues, 'aria-readonly': 'true', className: 'status issues'}, [
			Builder.node('div', {className: 'count ellipsis reltext'}),
			Builder.node('div', {className: 'label ellipsis reltext'}, '_XC.Bot.Summary.AnalysisIssues.Label'.loc())
		]),
		Builder.node('div', {'tabindex': tabindexResultsSummary, 'aria-readonly': 'true', className: 'status test-summary'}, [
			Builder.node('div', {className: 'count ellipsis reltext'}),
			Builder.node('div', {className: 'label passed ellipsis reltext'}, '_XC.Bot.Summary.TestsPassed.Label'.loc()),
			Builder.node('div', {className: 'label failed ellipsis reltext'}, '_XC.Bot.Summary.TestsFailed.Label'.loc())
		])
	]);
	CC.XcodeServer.updateSummaryElementWithSummary(el, inErrorCount, inWarningCount, inIssueCount, inOptTestsPassed, inOptTestsFailed, inOptPastErrorCount, inOptPastWarningCount, inOptPastIssueCount, inOptPastTestsPassed, inOptPastTestsFailed);
	return el;
};

CC.XcodeServer.summaryElementForTestsOnlyForBotRunSummary = function(inOptTestsPassed, inOptTestsFailed, inOptPastTestsPassed, inOptPastTestsFailed) {
	
	var tabindexResultsTotal = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_TESTS_RESULTS_TOTAL);
	var tabindexResultsFailed = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_TESTS_RESULTS_TESTS_FAILED);
	var tabindexResultsPassed = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_TESTS_RESULTS_TESTS_PASSED);
	
	var el = Builder.node('div', {'role': 'presentation', 'aria-label': "_XC.Accessibility.Label.ResultSummary".loc(), className: 'xc-bot-run-summary'}, [
		Builder.node('div', {'tabindex': tabindexResultsTotal, 'aria-readonly': 'true', className: 'status total-tests'}, [
			Builder.node('div', {className: 'count ellipsis'}),
			Builder.node('div', {className: 'label ellipsis'}, '_XC.Bot.Summary.TestsTotal.Label'.loc())
		]),
		Builder.node('div', {'tabindex': tabindexResultsPassed, 'aria-readonly': 'true', className: 'status passed-tests'}, [
			Builder.node('div', {className: 'count ellipsis'}),
			Builder.node('div', {className: 'label ellipsis'}, '_XC.Bot.Summary.TestsPassed.Label'.loc())
		]),
		Builder.node('div', {'tabindex': tabindexResultsFailed, 'aria-readonly': 'true', className: 'status failed-tests'}, [
			Builder.node('div', {className: 'count ellipsis'}),
			Builder.node('div', {className: 'label ellipsis'}, '_XC.Bot.Summary.TestsFailed.Label'.loc())
		])
	]);
	CC.XcodeServer.updateSummaryElementWithSummary(el, undefined, undefined, undefined, inOptTestsPassed, inOptTestsFailed, undefined, undefined, undefined, inOptPastTestsPassed, inOptPastTestsFailed);
	return el;
};


CC.XcodeServer.updateSummaryElementWithBotRuns = function(inElement, inBotRunEntity, inOptPreviousBotRunEntity) {
	var info = CC.XcodeServer.errorsAnalysisIssuesWarningsTestsDictForBotRun(inBotRunEntity);
	var pastInfo = inOptPreviousBotRunEntity && CC.XcodeServer.errorsAnalysisIssuesWarningsTestsDictForBotRun(inOptPreviousBotRunEntity);
	CC.XcodeServer.updateSummaryElementWithSummary(
		inElement,
		info.error.count,
		info.warning.count,
		info.analysis.count,
		undefined,
		undefined,
		pastInfo && pastInfo.error.count,
		pastInfo && pastInfo.warning.count,
		pastInfo && pastInfo.analysis.count,
		undefined,
		undefined
	);
};

CC.XcodeServer.updateSummaryElementWithTestsWithBotRuns = function(inElement, inBotRunEntity, inOptPreviousBotRunEntity) {
	var info = CC.XcodeServer.errorsAnalysisIssuesWarningsTestsDictForBotRun(inBotRunEntity);
	var pastInfo = inOptPreviousBotRunEntity && CC.XcodeServer.errorsAnalysisIssuesWarningsTestsDictForBotRun(inOptPreviousBotRunEntity);
	CC.XcodeServer.updateSummaryElementWithSummary(
		inElement,
		info.error.count,
		info.warning.count,
		info.analysis.count,
		info.tests.passed,
		info.tests.failed,
		pastInfo && pastInfo.error.count,
		pastInfo && pastInfo.warning.count,
		pastInfo && pastInfo.analysis.count,
		pastInfo && pastInfo.tests.passed,
		pastInfo && pastInfo.tests.failed
	);
};

CC.XcodeServer.updateSummaryElementWithSummary = function(inElement, inErrorCount, inWarningCount, inIssueCount, inOptTestsPassed, inOptTestsFailed, inOptPastErrorCount, inOptPastWarningCount, inOptPastIssueCount, inOptPastTestsPassed, inOptPastTestsFailed) {
	if (!inElement) return;
	
	var errorsElement = inElement.down('.status.errors');
	if (errorsElement) {
		var errorsCountElement = errorsElement.down('.count');
		
		if (errorsCountElement) {
			errorsCountElement.innerHTML = "";
			errorsElement.addClassName('none');
			errorsElement.removeClassName('delta-increase');
			errorsElement.removeClassName('delta-decrease');
			
			if (inErrorCount !== undefined && inErrorCount == inErrorCount) {
				CC.XcodeServer.printBotStatusCount(inErrorCount, errorsCountElement);
				if (inErrorCount == 0) {
					errorsElement.addClassName('none');
				} else {
					errorsElement.removeClassName('none');
				}
			}
		}

		if (inOptPastErrorCount !== undefined && inOptPastErrorCount !== null && inErrorCount != inOptPastErrorCount)
		{
			if (inErrorCount > inOptPastErrorCount) {
				errorsElement.addClassName('delta-increase');
			} else {
				errorsElement.addClassName('delta-decrease');
			}
		}
	}
	
	var warningsElement = inElement.down('.status.warnings');
	if (warningsElement) {
		var warningsCountElement = warningsElement.down('.count');
		if (warningsCountElement) {
			warningsCountElement.innerHTML = "";
			warningsElement.addClassName('none');
			warningsElement.removeClassName('delta-increase');
			warningsElement.removeClassName('delta-decrease');
			
			if (inWarningCount !== undefined && inWarningCount == inWarningCount) {
				CC.XcodeServer.printBotStatusCount(inWarningCount, warningsCountElement);
				if (inWarningCount == 0) {
					warningsElement.addClassName('none');
				} else {
					warningsElement.removeClassName('none');
				}
			}
		}

		
		if (inOptPastWarningCount !== undefined && inOptPastWarningCount !== null && inWarningCount != inOptPastWarningCount)
		{
			if (inWarningCount > inOptPastWarningCount) {
				warningsElement.addClassName('delta-increase');
			} else {
				warningsElement.addClassName('delta-decrease');
			}
		}
	}
	
	var issuesElement = inElement.down('.status.issues');
	if (issuesElement) {
		var issueCountElement = issuesElement.down('.count');
		if (issueCountElement) {
			issueCountElement.innerHTML = "";
			issuesElement.addClassName('none');
			issuesElement.removeClassName('delta-increase');
			issuesElement.removeClassName('delta-decrease');
			
			if (inIssueCount !== undefined && inIssueCount == inIssueCount) {
				CC.XcodeServer.printBotStatusCount(inIssueCount, issueCountElement);
				if (inIssueCount == 0) {
					issuesElement.addClassName('none');
				} else {
					issuesElement.removeClassName('none');
				}
			}
		}
		
		if (inOptPastIssueCount !== undefined && inOptPastIssueCount !== null && inIssueCount != inOptPastIssueCount)
		{
			if (inIssueCount > inOptPastIssueCount) {
				issuesElement.addClassName('delta-increase');
			} else {
				issuesElement.addClassName('delta-decrease');
			}
		}
	}

	// If we have any failing tests, show fail/total text, otherwise show the total failing or passing.

	var failedTests = (inOptTestsFailed || 0);
	var passedTests = (inOptTestsPassed || 0);
	var totalTests = (failedTests + passedTests);
	
	var testSummaryElement =  inElement.down('.status.test-summary');
	if (testSummaryElement) {
		testSummaryElement.removeClassName('passed').removeClassName('failed').addClassName('none');
		var testSummaryCountElement = testSummaryElement.down('.count');
		if (testSummaryCountElement) {
			testSummaryCountElement.innerHTML = "";
		}
		if (inOptTestsFailed && inOptTestsFailed > 0) {
			CC.XcodeServer.printBotStatusCount(failedTests, testSummaryCountElement);
			testSummaryElement.removeClassName('none');
			testSummaryElement.addClassName('failed');
		}
		else if (inOptTestsPassed && inOptTestsPassed > 0) {
			CC.XcodeServer.printBotStatusCount(inOptTestsPassed, testSummaryCountElement);
			testSummaryElement.removeClassName('none');
			testSummaryElement.addClassName('passed');
		} else {
			testSummaryElement.addClassName('none');
		}
	}
	
	var totalTestsElement = inElement.down('.status.total-tests');
	if (totalTestsElement) {
		totalTestsElement.removeClassName('passed').removeClassName('failed').addClassName('none');
		var totalTestsCountElement = totalTestsElement.down('.count');
		if (totalTestsCountElement) {
			totalTestsCountElement.innerHTML = "";
		}
		if (totalTests != undefined && totalTests == totalTests) { // "working" version of isNaN; this works, don't touch
			CC.XcodeServer.printBotStatusCount(totalTests, totalTestsCountElement);
			(totalTests > 0) ? totalTestsElement.removeClassName('none') : totalTestsElement.addClassName('none');
		}
	}

	var passedTestsElement = inElement.down('.status.passed-tests');
	var failedTestsElement = inElement.down('.status.failed-tests');
	if (passedTestsElement && failedTestsElement) {
		var passedTestsCountElement = passedTestsElement.down('.count');
		var failedTestsCountElement = failedTestsElement.down('.count');
		
		passedTestsElement.removeClassName('passed').addClassName('none');
		failedTestsElement.removeClassName('failed').addClassName('none');
		
		if (passedTestsCountElement) {
			passedTestsCountElement.innerHTML = "";
		}
		if (failedTestsCountElement) {
			failedTestsCountElement.innerHTML = "";
		}
		
		if (passedTests != undefined && passedTests == passedTests) {  // "working" version of isNaN; this works, don't touch
			CC.XcodeServer.printBotStatusCount(passedTests, passedTestsCountElement);
			if (passedTests > 0) {
				passedTestsElement.removeClassName('none');
				passedTestsElement.addClassName('passed');
			}
			else {
				passedTestsElement.addClassName('none');
			}
		}
		
		if (failedTests != undefined && failedTests == failedTests) {  // "working" version of isNaN; this works, don't touch
			CC.XcodeServer.printBotStatusCount(failedTests, failedTestsCountElement);
			if (failedTests > 0) {
				failedTestsElement.removeClassName('none');
				failedTestsElement.addClassName('failed');
			}
			else {
				failedTestsElement.addClassName('none');
			}
		}
	}
	
	if (testSummaryElement) {
		testSummaryElement.removeClassName('delta-increase');
		testSummaryElement.removeClassName('delta-decrease');
	}
	if (totalTestsElement) {
		totalTestsElement.removeClassName('delta-increase');
		totalTestsElement.removeClassName('delta-decrease');
	}
	if (passedTestsElement && failedTestsElement) {
		passedTestsElement.removeClassName('delta-increase');
		passedTestsElement.removeClassName('delta-decrease');
		failedTestsElement.removeClassName('delta-increase');
		failedTestsElement.removeClassName('delta-decrease');
	}
	
	var passingTestsDidIncrease = (inOptTestsPassed !== undefined && inOptPastTestsPassed !== undefined && inOptTestsPassed > inOptPastTestsPassed);
	var passingTestsDidDecrease = (inOptTestsPassed !== undefined && inOptPastTestsPassed !== undefined && inOptTestsPassed < inOptPastTestsPassed);
	var failingTestsDidIncrease = (inOptTestsFailed !== undefined && inOptPastTestsFailed !== undefined && inOptTestsFailed > inOptPastTestsFailed);
	var failingTestsDidDecrease = (inOptTestsFailed !== undefined && inOptPastTestsFailed !== undefined && inOptTestsFailed < inOptPastTestsFailed);
	var totalTestsDidIncrease = ((inOptTestsPassed !== undefined && inOptPastTestsPassed !== undefined) &&
		(inOptTestsFailed !== undefined && inOptPastTestsFailed !== undefined) &&
		((inOptTestsPassed + inOptTestsFailed) > (inOptPastTestsPassed + inOptPastTestsFailed)));
	var totalTestsDidDecrease = ((inOptTestsPassed !== undefined && inOptPastTestsPassed !== undefined) &&
		(inOptTestsFailed !== undefined && inOptPastTestsFailed !== undefined) &&
		((inOptTestsPassed + inOptTestsFailed) < (inOptPastTestsPassed + inOptPastTestsFailed)));
		
	if (passingTestsDidIncrease) {
		if (passedTestsElement) {
			passedTestsElement.addClassName('delta-increase');
		}
	}
	if (passingTestsDidDecrease) {
		if (passedTestsElement) {
			passedTestsElement.addClassName('delta-decrease');
		}
	}
	if (failingTestsDidIncrease) {
		if (failedTestsElement) {
			failedTestsElement.addClassName('delta-increase');
		}
	}
	if (failingTestsDidDecrease) {
		if (failedTestsElement) {
			failedTestsElement.addClassName('delta-decrease');
		}
	}
	if (totalTestsDidIncrease) {
		if (totalTestsElement) {
			totalTestsElement.addClassName('delta-increase');
		}
	}
	if (totalTestsDidDecrease) {
		if (totalTestsElement) {
			totalTestsElement.addClassName('delta-decrease');
		}
	}
};

// Bot run status helpers.

CC.XcodeServer.normalizedStatusForBot = function(inBotStatus) {
	return (inBotStatus || "").toLowerCase();
};

CC.XcodeServer.localizationStringSubstringForStatus = function(normalizedStatus) {
	var parts = (normalizedStatus || "").split("-");
	var localizationStringSubstring = "";
	for (var idx = 0; idx < parts.length; idx++) {
		localizationStringSubstring += (parts[idx]).capitalizeFirstCharacter();
	}
	return localizationStringSubstring;
};

// Returns true if a bot has a terminal status.

CC.XcodeServer.isTerminalBotStatus = function(inStatus) {
	var normalizedStatus = CC.XcodeServer.normalizedStatusForBot(inStatus);
	return (normalizedStatus && (normalizedStatus == CC.XcodeServer.BOT_RUN_STATUS_COMPLETED || normalizedStatus == CC.XcodeServer.BOT_RUN_STATUS_FAILED || normalizedStatus == CC.XcodeServer.BOT_RUN_STATUS_CANCELED));
};
CC.XcodeServer.isRunningBotStatus = function(inStatus) {
	var normalizedStatus = CC.XcodeServer.normalizedStatusForBot(inStatus);
	return (normalizedStatus && (normalizedStatus == CC.XcodeServer.BOT_RUN_STATUS_RUNNING || normalizedStatus == CC.XcodeServer.BOT_RUN_STATUS_PAUSED));
};

// Returns a normalized status class for use in (e.g.) Big Screen.

CC.XcodeServer.normalizedStatusClassForStatus = function(inStatus, inSubStatus) {
	if (inStatus == CC.XcodeServer.BOT_RUN_STATUS_COMPLETED) {
		if (inSubStatus == CC.XcodeServer.BOT_RUN_SUBSTATUS_BUILD_ERRORS)
			return 'error';
		else if (inSubStatus == CC.XcodeServer.BOT_RUN_SUBSTATUS_BUILD_FAILED)
			return 'error';
		else if (inSubStatus == CC.XcodeServer.BOT_RUN_SUBSTATUS_TEST_FAILURES)
			return 'test-fail';
		else if (inSubStatus == CC.XcodeServer.BOT_RUN_SUBSTATUS_WARNINGS)
			return 'warning';
		else if (inSubStatus == CC.XcodeServer.BOT_RUN_SUBSTATUS_ANALYSIS_ISSUES)
			return 'issue';
		else
			return 'success';
	} else if (inStatus == CC.XcodeServer.BOT_RUN_STATUS_FAILED || inStatus == CC.XcodeServer.BOT_RUN_STATUS_CANCELED) {
		return 'fail';
	} else if (inStatus == CC.XcodeServer.BOT_RUN_STATUS_RUNNING || inStatus == CC.XcodeServer.BOT_RUN_STATUS_READY) {
		return 'running';
	} else {
		return 'success';
	}
};

CC.XcodeServer.printBotStatusCount = function(inCount, inNode) {
	var digits = inCount.toString().length;
	if (digits == 3 ) {
		inNode.addClassName('three-digits');
	}
	else if (digits == 4 ) {
		inNode.addClassName('four-digits');
	}
	else if (digits >= 5 ) {
		inNode.addClassName('five-digits');
		inNode.setAttribute('title', 'inCount');
	}
	else {
		inNode.removeClassName('three-digits');
		inNode.removeClassName('four-digits');
		inNode.removeClassName('five-digits');
	}
	inNode.textContent = inCount;
}
;
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
//
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.



// Helpers.

CC.XcodeServer.getBotEntityGUIDFromMetaTags = function() {
	var entityType = CC.meta('x-apple-entity-type');
	if (entityType == "com.apple.entity.Bot") {
		return CC.meta('x-apple-entity-guid');
	} else if (entityType == "com.apple.entity.BotRun") {
		return CC.meta('x-apple-owner-guid');
	}
};

CC.XcodeServer.getBotEntityDisplayNameFromMetaTags = function() {
	var entityType = CC.meta('x-apple-entity-type');
	if (entityType == "com.apple.entity.Bot") {
		return (CC.meta('x-apple-entity-longName') || CC.meta('x-apple-entity-shortName'));
	} else if (entityType == "com.apple.entity.BotRun") {
		return (CC.meta('x-apple-owner-longName') || CC.meta('x-apple-owner-shortName'));
	}
};

CC.XcodeServer.getBotTinyIDFromMetaTags = function() {
	var entityType = CC.meta('x-apple-entity-type');
	if (entityType == "com.apple.entity.Bot") {
		return CC.meta('x-apple-entity-tinyID');
	} else if (entityType == "com.apple.entity.BotRun") {
		return CC.meta('x-apple-owner-tinyID');
	}
};

// Bot run sidebar view grouped by date.

CC.XcodeServer.BotRunSidebarView = Class.create(CC.PaginatingContainerListView, {
	mEntityTypes: ['com.apple.entity.BotRun'],
	mOwnerGUID: null,
	mSearchFields: ['tinyID', 'longName', 'shortName', 'type', 'createTime', 'startTime', 'endTime', 'status', 'subStatus', 'integration'],
	mSubFields: {},
	mOwnerGUID: CC.XcodeServer.getBotEntityGUIDFromMetaTags(),
	mPlaceholderString: "_XC.BotRunSidebar.Empty.Placeholder".loc(),
	mIntegrationNumber: null,
	mTabName: null,
	mGroupHeaderTimer: null,
	initialize: function($super, inIntegrationNumber, inTabName) {
		$super();
		globalNotificationCenter().subscribe(CC.Routes.NOTIFICATION_UPDATE_ROUTES_TAB_NAME, this.handleUpdateRoutesTabName.bind(this));
		this.mIntegrationNumber = inIntegrationNumber;
		this.mTabName = inTabName;
		this.udpateGroupHeaderTimer();
	},
	render: function($super) {
		var elem = $super();
		elem.addClassName('xc-bot-run-sidebar');
		// Draw a header first.
		var headerElement = this.renderFirstSidebarItem();
		Element.insert(elem.down('.cc-paginating-list-view-content'), {'top': headerElement});
		return elem;
	},
	renderFirstSidebarItem: function() {
		var botGUID = CC.XcodeServer.getBotEntityGUIDFromMetaTags();
		var botTinyID = CC.XcodeServer.getBotTinyIDFromMetaTags();
		var botName = CC.XcodeServer.getBotEntityDisplayNameFromMetaTags();
		var tabIndex = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_BOT_LIST);
		var entityTinyID = CC.meta('x-apple-entity-tinyID');
		var routeURL = CC.XcodeServer.botEntityURLForTinyIDAndOptionalIntegrationNumberAndTabName(entityTinyID, undefined, this.mTabName);
		if (routeURL === undefined)
			routeURL = "";
		var headerElementLink = Builder.node('a', {className: 'xc-bot-run-sidebar-header-link cc-routable', 'href': routeURL, 'data-push-state': 'true'}, [
			Builder.node('div', {'role': 'presentation', className: 'xc-bot-run-sidebar-header-icon'}),
			Builder.node('h1', botName),
			Builder.node('h2', window.location.hostname)
		]);
		var headerElement = Builder.node('div', {'tabindex': tabIndex, 'role': 'menuitem', className: 'xc-bot-run-sidebar-header selected', 'data-tinyID': botTinyID, 'data-guid': botGUID, 'data-type': 'com.apple.entity.Bot'}, [
			headerElementLink
		]);
		Event.observe(headerElementLink, 'click', this.handleSidebarItemClicked.bind(this));
		return headerElement;
	},
	// Override the reset function since
	reset: function($super) {
		$super();
		var headerElement = this.renderFirstSidebarItem();
		Element.insert(this.$().down('.cc-paginating-list-view-content'), {'top': headerElement});
	},
	buildQuery: function($super, inStartIndex, inHowMany) {
		var query = $super(inStartIndex, inHowMany);
		return server_proxy().searchQueryUpdateSort(query, '-createTime');
	},
	renderResultItem: function(inResultItem) {
		if (!inResultItem) return;
		return this.createFragmentForSidebarForBotRun(inResultItem);
	},
	getSelectedSidebarItemInfo: function() {
		var selected = this.$().down('.xc-bot-run-sidebar-item.selected, .xc-bot-run-sidebar-header.selected');
		if (selected) {
			return this.getSidebarItemInfo(selected);
		}
	},
	getSidebarItemInfo: function(inNode) {
		var guid = inNode.getAttribute('data-guid');
		var tinyID = inNode.getAttribute('data-tinyID');
		var type = inNode.getAttribute('data-type');
		var integrationNumber = inNode.getAttribute('data-integration');
		return {'guid': guid, 'tinyID': tinyID, 'type': type, 'integrationNumber': integrationNumber};
	},
	handleSidebarItemClicked: function(inEvent) {
		if (!isCommandClickEvent(inEvent)) {
			this.$().select('.selected').invoke('removeClassName', 'selected');
			var closestSidebarItem = Event.findElement(inEvent, '.xc-bot-run-sidebar-item, .xc-bot-run-sidebar-header');
			if (closestSidebarItem) {
				closestSidebarItem.addClassName('selected');
			}
		}
	},
	markItemAsSelected: function(inIntegrationNumber) {
		this.$().select('.selected').invoke('removeClassName', 'selected');
		if (inIntegrationNumber) {
			var selectedItem = this.$().querySelector(".xc-bot-run-sidebar-item[data-integration='%@']".fmt(inIntegrationNumber));
			if (selectedItem) {
				selectedItem.addClassName('selected');
			}
		}
		else {
			var selectedItem = this.$().querySelector(".xc-bot-run-sidebar-header");
			if (selectedItem) {
				selectedItem.addClassName('selected');
			}
		}
	},
	handleUpdatedBotRunEntity: function(inBotRun) {
		if (!inBotRun || !inBotRun.type == "com.apple.entity.BotRun") return;
		this.updateSidebarForBotRun(inBotRun);
		// The sidebar is no longer empty.
		this.setIsEmpty(false);
	},
	findExistingGroupHeaderForBotRun: function(inBotRun) {
		var botRunHeaderElement = this.renderBotRunItemHeader(inBotRun);
		var proposedHeaderText = botRunHeaderElement.down('h3').innerHTML;
		var existingHeaders = this.$().select('.xc-bot-run-sidebar-group-header');
		return existingHeaders.find(function(header) {
			return (header.down('h3').innerHTML == proposedHeaderText);
		});
	},
	createFragmentForSidebarForBotRun: function(inBotRun) {
		var botRunElement = this.renderBotRunItem(inBotRun);
		var existingHeader = this.findExistingGroupHeaderForBotRun(inBotRun);
		var fragment = document.createDocumentFragment();
		if (existingHeader) {
			fragment.appendChild(botRunElement);
		} else {
			var sidebarHeaderElement = this.$().down('.xc-bot-run-sidebar-header');
			var botRunHeaderElement = this.renderBotRunItemHeader(inBotRun);
			fragment.appendChild(botRunHeaderElement);
			fragment.appendChild(botRunElement);
		}
		return fragment;
	},
	updateSidebarForBotRun: function(inBotRun, inOptReturn) {
		var botRunGUID = inBotRun.guid;
		var botRunElement = this.$().down('.xc-bot-run-sidebar-item[data-guid="%@"]'.fmt(botRunGUID));
		var botRunExists = (botRunElement != undefined);
		// If we have the run, just update it. Otherwise add it to the sidebar.
		if (botRunExists) {
			this.updateBotRunStatusForBotRunElement(botRunElement, inBotRun.status, inBotRun.subStatus, inBotRun.createTime, inBotRun.startTime, inBotRun.endTime);
		} else {
			this.insertBeforePreviousBotRunIntegration(inBotRun);
		}
	},
	insertBeforePreviousBotRunIntegration: function(inBotRun){
		var fragment = this.createFragmentForSidebarForBotRun(inBotRun);
		var botRuns = this.$().querySelectorAll('.xc-bot-run-sidebar-item');
		var botRunsByIntegrations = {};
		for ( var i = 0; i < botRuns.length; i++ ) {
			botRunsByIntegrations[botRuns[i].getAttribute('data-integration')] = botRuns[i];
		}

		var closestBotRun = null;
		var minDisplayedIntegration = null;
		var currentIntegration = inBotRun.integration - 1;
		
		for (var key in botRunsByIntegrations) {
			if (key < minDisplayedIntegration || minDisplayedIntegration == null) {
				minDisplayedIntegration = key;
			}
		}
		
		if (inBotRun.integration >= minDisplayedIntegration) {		
			var existingHeader = this.findExistingGroupHeaderForBotRun(inBotRun);
			if ( existingHeader ) {
				while ( closestBotRun == null ) {
					if ( currentIntegration == 0 ) {
						closestBotRun = false;
					}

					if ( botRunsByIntegrations[currentIntegration] ) {
						closestBotRun = botRunsByIntegrations[currentIntegration];
					}
					else {
						currentIntegration--;
					}
				}

				if ( closestBotRun ) {
					 insertBefore(fragment, closestBotRun);
				}
				else {
					insertAfter(fragment, existingHeader);
				}
			}
			else {
				var sidebarHeaderElement = this.$().down('.xc-bot-run-sidebar-header');
				insertAfter(fragment, sidebarHeaderElement);
			}
		}
	},
	renderBotRunItemHeader: function(inBotRun) {
		if (!inBotRun) return;
		
		var groupingHeaderText = this.getGroupingHeaderText(inBotRun.createTime);
		return this.renderGroupingHeaderNode(groupingHeaderText);
	},
	getGroupingHeaderText: function(inTimestamp) {
		var dayDelta = globalLocalizationManager().calculateDayDeltaForDateFromToday(inTimestamp);
		var groupingHeaderText = "_XC.Grouping.Header.Other".loc();
		if (dayDelta == 0) {
			groupingHeaderText = "_XC.Grouping.Header.Today".loc();
		} else if (dayDelta == -1) {
			groupingHeaderText = "_XC.Grouping.Header.Yesterday".loc();
		} else if (dayDelta > -7) {
			groupingHeaderText = "_XC.Grouping.Header.ThisWeek".loc();
		} else if (dayDelta > -14) {
			groupingHeaderText = "_XC.Grouping.Header.LastWeek".loc();
		}
		return groupingHeaderText;
	},
	renderGroupingHeaderNode: function(inGroupingHeaderText) {
		var tabIndex = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_BOT_LIST);	
		return Builder.node('div', {className: 'xc-bot-run-sidebar-group-header'}, [
			Builder.node('h3', {'tabindex': tabIndex, 'role': 'heading', 'aria-level': '2'}, inGroupingHeaderText)
		]);
	},
	// Returns a tuple of (fragment, fragmentContainsHeader).
	renderBotRunItem: function(inBotRun) {
		var tabIndex = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_BOT_LIST);
		if (!inBotRun) return;
		
		var entityTinyID = CC.meta('x-apple-entity-tinyID');
		
		var routeURL = CC.XcodeServer.botEntityURLForTinyIDAndOptionalIntegrationNumberAndTabName(entityTinyID, inBotRun.integration, this.mTabName);
		if (routeURL === undefined)
			routeURL = "";
		var sideBarItemContent = Builder.node('a', {'tabindex': tabIndex, 'role': 'link', 'className': 'title ellipsis cc-routable', 'href': routeURL, 'data-push-state': 'true', 'data-integration-number': inBotRun.integration}, [
			Builder.node('span', {'role': 'presentation', className: 'scheme ellipsis'}, "_XC.Bot.Integration.Index".loc(inBotRun.integration)),
			Builder.node('span', {'role': 'presentation', className: 'timestamp ellipsis'}),
			CC.XcodeServer.statusElementForBotRunEntity(inBotRun, true)
		]);
		var sidebarItem = Builder.node('div', {'role': 'presentation', className: 'xc-bot-run-sidebar-item', 'data-tinyID': inBotRun.tinyID, 'data-timestamp': inBotRun.createTime, 'data-guid': inBotRun.guid, 'data-type': inBotRun.type, 'data-integration': inBotRun.integration}, [
			sideBarItemContent
		]);
		this.updateBotRunStatusForBotRunElement(sidebarItem, inBotRun.status, inBotRun.subStatus, inBotRun.createTime, inBotRun.startTime, inBotRun.endTime);
		Event.observe(sideBarItemContent, 'click', this.handleSidebarItemClicked.bind(this));
		return sidebarItem;
	},
	updateBotRunStatusForBotRunElement: function(inSidebarElement, inStatus, inSubStatus, inCreateTime, inStartTime, inEndTime) {
		var dayDelta = globalLocalizationManager().calculateDayDeltaForDateFromToday(inCreateTime);
		var localizedStartDate = globalLocalizationManager().shortLocalizedDateWithMonthAsString(inCreateTime);
		var terminalStatus = CC.XcodeServer.isTerminalBotStatus(inStatus);
		// If the status is non-terminal, show the status.  If the bot has yet to run
		if (!terminalStatus && terminalStatus != CC.XcodeServer.BOT_RUN_STATUS_READY) {
			var status = CC.XcodeServer.statusStringForStatus(inStatus, inSubStatus);
			inSidebarElement.down('span.timestamp').update(status);
		} else if (terminalStatus == CC.XcodeServer.BOT_RUN_STATUS_READY) {
			var timeToShow = (inStartTime ? inStartTime : inCreateTime);
			var localizedTimeToShow = globalLocalizationManager().shortLocalizedDateWithMonthAsStringWithTodaysTime(timeToShow);
			inSidebarElement.down('span.timestamp').update(localizedTimeToShow);
			globalNotificationCenter().publish(CC.Routes.NOTIFICATION_ROUTES_SHOULD_UPDATE);
		} else {
			var localizedTime = "";
			if (inStartTime) {
				localizedTime = globalLocalizationManager().shortLocalizedDateWithMonthAsStringWithTodaysTime(inStartTime);
			} else if (inEndTime && inEndTime != "") {
				localizedTime = globalLocalizationManager().shortLocalizedDateWithMonthAsStringWithTodaysTime(inEndTime);
			}
			inSidebarElement.down('span.timestamp').update(localizedTime);
		}
		CC.XcodeServer.updateStatusElementWithStatus(inSidebarElement.down('.xc-bot-status'), inStatus, inSubStatus);
	},
	// Update bot run item link with the current tab selected
	handleUpdateRoutesTabName: function(inMessage, inObject, inOptExtras) {
		var nodes = this.$().querySelectorAll('a.title, a.xc-bot-run-sidebar-header-link');
		this.mTabName = (inOptExtras && inOptExtras.tabName);
		for (var i = 0; i < nodes.length; i++) {
			var node = nodes[i];
			var integrationNumber = (node && node.getAttribute('data-integration-number'));
			var entityTinyID = CC.meta('x-apple-entity-tinyID');
			var routeURL = CC.XcodeServer.botEntityURLForTinyIDAndOptionalIntegrationNumberAndTabName(entityTinyID, integrationNumber, this.mTabName);
			node.setAttribute('href', routeURL);
		};
	},
	updateGroupHeaders: function() {
		var hours = new Date().getHours();
		var groupHeaderTextAlreadyUsed = [];
		// Update group header between 11pm and 12.59am
		if ( hours == 0 || hours == 23 ) {
			var headers = this.$().querySelectorAll('.xc-bot-run-sidebar-group-header');
			for (var i = 0; i < headers.length; i++) {
				var header = headers[i];
				header.parentNode.removeChild(header);
			}
			
			var botRuns = this.$().querySelectorAll('.xc-bot-run-sidebar-item');
			for (var j = 0; j < botRuns.length; j++) {
				var botRun = botRuns[j];
				var botTime = new Date(botRun.getAttribute('data-timestamp'));
				headerText = this.getGroupingHeaderText(botTime);
				if (groupHeaderTextAlreadyUsed.indexOf(headerText) == -1) {
					groupHeaderTextAlreadyUsed.push(headerText);
					var headerNode = this.renderGroupingHeaderNode(headerText);
					botRun.parentNode.insertBefore(headerNode, botRun);
				}
			}
		}
	},
	udpateGroupHeaderTimer: function() {
		if (this.mGroupHeaderTimer === null) {
			this.mGroupHeaderTimer = setInterval(this.updateGroupHeaders.bind(this), 60000);
		}
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

// Placeholder content view.

CC.XcodeServer.PLACEHOLDER_VIEW_STYLE_SMALL = 'small';
CC.XcodeServer.PLACEHOLDER_VIEW_STYLE_DEFAULT = 'default';

CC.XcodeServer.PlaceholderView = Class.create(CC.Mvc.View, {
	mPlaceholderText: "Placeholder view",
	mClassName: 'xc-placeholder-content-view',
	mStyle: CC.XcodeServer.PLACEHOLDER_VIEW_STYLE_DEFAULT,
	render: function() {
		return Builder.node('div', this.mPlaceholderText);
	},
	setStyle: function(inStyle) {
		if (!this.mRendered) this.forceRender();
		this.$().removeClassName(CC.XcodeServer.PLACEHOLDER_VIEW_STYLE_SMALL);
		this.$().removeClassName(CC.XcodeServer.PLACEHOLDER_VIEW_STYLE_DEFAULT);
		this.$().addClassName(inStyle);
	},
	updatePlaceholderText: function(inText) {
		this.forceRender();
		this.$().innerText = inText;
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

// Base bot detail content view which handles reacting to notifications where
// the currently selected bot or bot run changes.

CC.XcodeServer.BotDetailContentView = Class.create(CC.Mvc.View, {
	mClassName: 'xc-bot-detail-content-view',
	mIsBotEntityView: null,
	// Called when this detail view should be configured for a given bot or bot run
	// entity. Your subclass should override and implement these methods.
	configureForFocusedBotEntityAndLatestTerminalBotRunEntity: function(inBotEntity, inOptLatestTerminalBotRunEntity) { /* Interface */ },
	configureForFocusedBotRunEntity: function(inBotRunEntity) { /* Interface */ },
	handleUpdatedBotRunEntity: function(inBotRunEntity) { /* Interface */ },
	showPlaceholderMessage: function(inMessage) {
		this.markAsLoading(false);
		this.removeAllSubviews();
		this.$().innerHTML = "";
		this.addSubview(new CC.XcodeServer.PlaceholderView({
			mPlaceholderText: inMessage
		}));
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

// Detail view latest integration header view.

CC.XcodeServer.DetailViewLatestIntegrationHeaderView = Class.create(CC.Mvc.View, {
	mClassName: 'xc-detail-view-latest-integration-header-view',
	mHeaderText: "_XC.Bot.LatestIntegration.Title".loc(),
	mBotRunEntity: null,
	tabIndex: null,
	render: function() {
		var botRunEntity = this.mBotRunEntity;
		var localizedStartTime = globalLocalizationManager().localizedDayAndTime(botRunEntity.startTime);
		var localizedDuration = globalLocalizationManager().localizedDuration(botRunEntity.startTime, botRunEntity.endTime);
		var localizedCommitDescription = "";
		var scmCommitGUIDs = (botRunEntity.scmCommitGUIDs || []);
		var commitCount = (scmCommitGUIDs.length);		
		
		if (commitCount == 0) {
			localizedCommitDescription = "_XC.Bot.Summary.LatestIntegration.Commits.None".loc();
		} else if (commitCount == 1) {
			localizedCommitDescription = "_XC.Bot.Summary.LatestIntegration.Commits.Singular".loc();
		} else {
			localizedCommitDescription = "_XC.Bot.Summary.LatestIntegration.Commits.Plural".loc(commitCount);
		}
		var localizedStatus = CC.XcodeServer.statusStringForStatus(botRunEntity.status, botRunEntity.subStatus);
		return Builder.node('div', {'tabindex': this.tabIndex, 'aria-label': this.mHeaderText, 'aria-readonly': 'true'}, [
			Builder.node('h1', (this.mHeaderText || "")),
			Builder.node('div', [
				Builder.node('div', {'tabindex': ++this.tabIndex, 'aria-readonly': 'true'}, [
					Builder.node('span', "_XC.Bot.Summary.LatestIntegration.Status.Title".loc()),
					Builder.node('span', {'className': 'ellipsis'}, (localizedStatus || "--"))
				]),
				Builder.node('div', {'tabindex': ++this.tabIndex, 'aria-readonly': 'true'}, [
					Builder.node('span', "_XC.Bot.Summary.LatestIntegration.Start.Title".loc()),
					Builder.node('span', {'className': 'ellipsis'}, (localizedStartTime || "--"))
				]),
				Builder.node('div', {'tabindex': ++this.tabIndex, 'aria-readonly': 'true'}, [
					Builder.node('span', "_XC.Bot.Summary.LatestIntegration.Duration.Title".loc()),
					Builder.node('span', {'className': 'ellipsis'}, (localizedDuration || "--"))
				]),
				Builder.node('div', {'tabindex': ++this.tabIndex, 'aria-readonly': 'true'}, [
					Builder.node('span', {'className': 'ellipsis'}, localizedCommitDescription)
				])
			])
		]);
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
//
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

// Bot run archive/product download view.

CC.XcodeServer.BotRunArchiveProductDownloadView = Class.create(CC.Mvc.View, {
	mClassNames: ['xc-bot-run-archive-product-download-view'],
	initialize: function($super, inBotRunEntity) {
		$super();
		this.forceRender();
		if (inBotRunEntity) {
			this.configureForBotRunEntity(inBotRunEntity);
		}
	},
	render: function() {
		var tabIndex = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_SUMMARY_DOWNLOADS);
		return Builder.node('div', {'tabindex': tabIndex, 'aria-label': "_XC.Accessibility.Label.Downloads".loc(), 'className': 'right'}, [
			Builder.node('h1', "_XC.Bot.Summary.Downloads.Title".loc()),
			Builder.node('div', [
				Builder.node('div', {'className': 'empty placeholder'}, "_XC.BotRun.ArchiveProductDownloadView.Placeholder".loc()),
				Builder.node('div', {'className': 'links'})
			])
		]);
	},
	configureForBotRunEntity: function(inBotRunEntity) {
		if (!inBotRunEntity) return;
		var archiveGUID = inBotRunEntity.archiveGUID;
		var productGUID = inBotRunEntity.productGUID;
		// If we don't have a product/archive GUID, display an empty placeholder.
		if (!archiveGUID && !productGUID) {
			this.$().addClassName('empty');
			return;
		}
		// We ALWAYS have an archive GUID if we have a product guid.
		var guids = [archiveGUID];
		if (productGUID) guids.push(productGUID);
		this.markAsLoading(true);
		server_proxy().entitiesForGUIDs(guids, this.handleGotArchiveAndProductEntities.bind(this), function() {
			notifier().printErrorMessage("_XC.BotRun.ArchiveProductDownloadView.Error.Message".loc());
			this.$().addClassName('empty');
			this.markAsLoading(false);
		});
	},
	configureForFileEntities: function(inArchiveFileEntity, inProductFileEntity) {
		if (!inArchiveFileEntity && !inProductFileEntity) {
			this.$().addClassName('empty');
			this.$().querySelector('h1').remove();
			return;
		}
		this.handleGotArchiveAndProductEntities([inArchiveFileEntity, inProductFileEntity]);
	},
	handleGotArchiveAndProductEntities: function(inEntities) {
		var linksElement = this.$().down('.links');
		linksElement.innerHTML = "";
		var tabIndex = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_SUMMARY_DOWNLOADS);
		var drawDownloadLink = function(inClassName, inLinkText, inDownloadSize, inTargetFileGUID) {
			var hrefBase = (inClassName == 'product') ? "/xcs/install/%@" : "/xcode/files/download/%@";
			var href = hrefBase.fmt(inTargetFileGUID);
			var localizedFileSize = (globalLocalizationManager().localizedFileSize(inDownloadSize) || "_XC.BotRun.ArchiveProductDownloadView.UnknownFileSize".loc());
			return Builder.node('div', {'tabindex': '-1', 'className': 'link %@ ellipsis'.fmt(inClassName)}, [
				Builder.node('a', {'tabindex': ++tabIndex, 'href': href}, inLinkText),
				Builder.node('span', {'tabindex': '-1', 'className': 'size'}, localizedFileSize)
			]);
		}
		var fragment = document.createDocumentFragment();
		// do these backwards so they appear on the page in the right order
		if (inEntities && inEntities[1]) {
			fragment.appendChild(drawDownloadLink('product', "_XC.BotRun.ArchiveProductDownloadView.Product.Title".loc(), inEntities[1].size, inEntities[1].guid));
		}
		if (inEntities && inEntities[0]) {
			fragment.appendChild(drawDownloadLink('archive', "_XC.BotRun.ArchiveProductDownloadView.Archive.Title".loc(), inEntities[0].size, inEntities[0].guid));
		}
		linksElement.appendChild(fragment);
		this.markAsLoading(false);
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

// Gradient stroke header view.

CC.XcodeServer.GradientStrokeHeaderView = Class.create(CC.Mvc.View, {
	mClassName: 'xc-gradient-stroke-header-view',
	mHeaderText: null,
	render: function() {
		return Builder.node('div', [
			Builder.node('h1', (this.mHeaderText || "")),
			Builder.node('div', {className: 'stroke'})
		]);
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

// Mini header view.

CC.XcodeServer.MiniHeaderView = Class.create(CC.Mvc.View, {
	mClassName: 'xc-mini-header-view',
	mHeaderText: null,
	render: function() {
		return Builder.node('div', [
			Builder.node('h2', (this.mHeaderText || ""))
		]);
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

// Returns a dictionary of error/issue/warning counts and messages given a bot run.

CC.XcodeServer.errorsAnalysisIssuesWarningsTestsDictForBotRun = function(inBotRunEntity) {
	var xattrs = ((inBotRunEntity && inBotRunEntity.extendedAttributes) || {});
	var outputDictionary = (xattrs.output || {});
	var outputBuildDictionary = (outputDictionary.build || {});
	
	var analysisCount = outputBuildDictionary["AnalyzerWarningCount"];
	var warningCount = outputBuildDictionary["WarningCount"];
	var errorCount = outputBuildDictionary["ErrorCount"];
	
	var analysisMessageList = outputBuildDictionary["AnalyzerWarningSummaries"];
	var warningMessageList = outputBuildDictionary["WarningSummaries"];
	var errorMessageList = outputBuildDictionary["ErrorSummaries"];
	
	var analysisMessages = [], warningMessages = [], errorMessages = [];
	
	if (analysisMessageList) {
		for (var i = 0; i < analysisMessageList.length; i++)
			analysisMessages.push(analysisMessageList[i]["Message"]);
	}
	
	if (warningMessageList) {
		for (var i = 0; i < warningMessageList.length; i++)
			warningMessages.push(warningMessageList[i]["Message"]);
	}
	
	if (errorMessageList) {
		for (var i = 0; i < errorMessageList.length; i++)
			errorMessages.push(errorMessageList[i]["Message"]);
	}
	
	return {
		'error': {'count': errorCount, 'messages': errorMessages},
		'analysis': {'count': analysisCount, 'messages': analysisMessages},
		'warning': {'count': warningCount, 'messages': warningMessages},
		'tests': {'passed': outputBuildDictionary["TestsCount"] - outputBuildDictionary["TestsFailedCount"], 'failed': outputBuildDictionary["TestsFailedCount"]}
	};
};

CC.XcodeServer.deviceTestInformationForTimeseriesData = function(inTimeseriesData) {
	var botRunTests = inTimeseriesData;
	
	// Build a structure of tests per device keyed by an identifier we will form, with a results dictionary
	// and passCount, failCount and integrationNumber keys. Results contains each of the test results we see
	// for a given device identifier.  We compute running totals for pass/fail for each device identifier.
	var devices = {};
	
	// For n devices and m test cases we will get nxm items of data (m tests in n columns).  We need to walk
	// over each of the test results, and each of the tags/results for each test result.
	if (botRunTests && botRunTests.length > 0) {
		for (var a = 0; a < botRunTests.length; a++ ) {
			var testResultForSomeDevice = botRunTests[a];
			if (testResultForSomeDevice.tags.length == 0)
				continue;
			
			// Pluck out the tags we care about.
			var deviceName = "";
			var family = "";
			var os = "";
			var processor = "";
			var platformIdentifier = "";
			var modelName = "";
			var modelCode = "";
			var modelUTI = "";
			
			// Tags are returned in a single string as head:value, so we need to split them up.  For each test
			// result we see, we build an identifier from all the tags we care about.  If we haven't seen that
			// identifier before, assume we're looking at a new column of test results for an unseen device. If
			// we have seen that identifier, append the results to the running mDevices hash.
			for (var b = 0; b < testResultForSomeDevice.tags.length; b++) {
				var tag = testResultForSomeDevice.tags[b];
				var headTag = tag.split(":").length && tag.split(":")[0];
				var tagValue = tag.split(":").length && tag.split(":")[1];
				switch (headTag) {
					case CC.XcodeServer.BOT_RUN_TEST_DETAIL_OS_TAG:
						os = tagValue;
						break;
					case CC.XcodeServer.BOT_RUN_TEST_DETAIL_PROCESSOR_TAG:
						processor = tagValue;
						break;
					case CC.XcodeServer.BOT_RUN_TEST_DETAIL_NAME_TAG:
						deviceName = tagValue;
						break;
					case CC.XcodeServer.BOT_RUN_TEST_DETAIL_MODEL_UTI:
						modelUTI = tagValue;
						break;
					case CC.XcodeServer.BOT_RUN_TEST_DETAIL_MODEL_NAME:
						modelName = tagValue;
						family = tagValue;  // TODO: for now, family and model name tags are the same
						break;
					case CC.XcodeServer.BOT_RUN_TEST_DETAIL_MODEL_CODE:
						modelCode = tagValue;
						break;
					case CC.XcodeServer.BOT_RUN_TEST_DETAIL_PLATFORM_IDENTIFIER_TAG:
						platformIdentifier = tagValue;
						break;
				}
			}
			
			var synthesizedDeviceIdentifier = "%@%@%@%@%@".fmt(family, os, processor, deviceName, platformIdentifier);
			if (!devices[synthesizedDeviceIdentifier]) {
				devices[synthesizedDeviceIdentifier] = {
					Success: 0,
					Fail: 0,
					Tests: []
				};
				devices[synthesizedDeviceIdentifier][CC.XcodeServer.BOT_RUN_TEST_DETAIL_FAMILY_TAG] = family;
				devices[synthesizedDeviceIdentifier][CC.XcodeServer.BOT_RUN_TEST_DETAIL_OS_TAG] = os;
				devices[synthesizedDeviceIdentifier][CC.XcodeServer.BOT_RUN_TEST_DETAIL_PROCESSOR_TAG] = processor;
				devices[synthesizedDeviceIdentifier][CC.XcodeServer.BOT_RUN_TEST_DETAIL_NAME_TAG] = deviceName;
				devices[synthesizedDeviceIdentifier][CC.XcodeServer.BOT_RUN_TEST_DETAIL_MODEL_UTI] = modelUTI;
				devices[synthesizedDeviceIdentifier][CC.XcodeServer.BOT_RUN_TEST_DETAIL_MODEL_NAME] = modelName;
				devices[synthesizedDeviceIdentifier][CC.XcodeServer.BOT_RUN_TEST_DETAIL_MODEL_CODE] = modelCode;
				devices[synthesizedDeviceIdentifier][CC.XcodeServer.BOT_RUN_TEST_DETAIL_PLATFORM_IDENTIFIER_TAG] = platformIdentifier;
			}
			
			// Ignore bookend tests
			if (testResultForSomeDevice.key == 'IDESchemeActionDummyTestSummary')
				continue;
			
			// Increment the running total of passes/failures for the current device.
			if (testResultForSomeDevice.category == 'test-summary' && testResultForSomeDevice.key == 'fail-count') {
				devices[synthesizedDeviceIdentifier].Fail += testResultForSomeDevice.value;
			} else if (testResultForSomeDevice.category == 'test-summary' && testResultForSomeDevice.key == 'pass-count') {
				devices[synthesizedDeviceIdentifier].Success += testResultForSomeDevice.value;
			} else if (testResultForSomeDevice.category == 'test-run') {
				devices[synthesizedDeviceIdentifier][(testResultForSomeDevice.value) ? 'Success' : 'Fail'] += 1;
			}
			
			// Push this test result into the array of tests for the current device.
			devices[synthesizedDeviceIdentifier].Tests.push(testResultForSomeDevice)
		}
	}
	
	return devices;
};

CC.XcodeServer.getDeviceFamily = function(inDeviceInfo) {
	var platformIdentifier = inDeviceInfo[CC.XcodeServer.BOT_RUN_TEST_DETAIL_PLATFORM_IDENTIFIER_TAG];
	var modelUTI = inDeviceInfo[CC.XcodeServer.BOT_RUN_TEST_DETAIL_MODEL_UTI];
	var deviceFamily = 'unknown';
	
	// If the platform contains osx, always display a Mac icon.  Otherwise look at the model UTI which we will get for
	// "real" devices, otherwise look at the platform identifier for a device reference e.g. com.apple.iphone-simulator,
	// otherwise look for just simulator (for the generic simulators like com.apple.ios-simulator), and finally fall back
	// to unknown.
	
	if (platformIdentifier && platformIdentifier.toLowerCase().indexOf('osx') > -1)
		deviceFamily = 'mac';
	else if (modelUTI && modelUTI.toLowerCase().indexOf('ipad') > -1)
		deviceFamily = 'ipad';
	else if (modelUTI && modelUTI.toLowerCase().indexOf('ipod') > -1)
		deviceFamily = 'ipod';
	else if (modelUTI && modelUTI.toLowerCase().indexOf('iphone') > -1)
		deviceFamily = 'iphone';
	else if (platformIdentifier && platformIdentifier.toLowerCase().indexOf('ipad') > -1)
		deviceFamily = 'ipad';
	else if (platformIdentifier && platformIdentifier.toLowerCase().indexOf('ipod') > -1)
		deviceFamily = 'ipod';
	else if (platformIdentifier && platformIdentifier.toLowerCase().indexOf('iphone') > -1)
		deviceFamily = 'iphone';
	else if (platformIdentifier && platformIdentifier.toLowerCase().indexOf('simulator') > -1)
		deviceFamily = 'iphone';
	else
		deviceFamily = 'unknown';
		
	return deviceFamily;
};
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.



CC.XcodeServer.IssuesStackView = Class.create(CC.StackedView, {
	mBotRunEntity: null,
	mClassNames: ['cc-stacked-view', 'xc-issues-stack-view'],
	initialize: function($super) {
		$super.apply(null, Array.prototype.slice.call(arguments, 1));
		var errorsAnalysisWarnings = CC.XcodeServer.errorsAnalysisIssuesWarningsTestsDictForBotRun(this.mBotRunEntity);
		var contentViews = [], contentView, disclosureView;
		var headers = [["error", "_XC.Bot.IssuesStack.Errors.Title"], ["analysis", "_XC.Bot.IssuesStack.AnalysisIssues.Title"], ["warning", "_XC.Bot.IssuesStack.Warnings.Title"]];
		for (var idx = 0; idx < 3; idx++) {
			var tuple = errorsAnalysisWarnings[headers[idx][0]];
			if (tuple.count) {
				contentView = new CC.Mvc.View();
				contentView._render();
				var hasMessage = false;
				for (var jdx = 0; jdx < tuple.count; jdx++) {
					if (tuple.messages[jdx]) {
						contentView.$().appendChild(Builder.node('p', tuple.messages[jdx]));
						hasMessage = true;
					}
				}
				if (!hasMessage) continue;
				disclosureView = new CC.DisclosureView({
					'mClassNames': ['cc-disclosure-view', headers[idx][0]],
					'mTitleRowText': headers[idx][1].loc(),
					'mContentView': contentView
				});
				contentViews.push(disclosureView);
			}
		}
		if (contentViews.length == 0) {
			var placeholder = new CC.XcodeServer.PlaceholderView({
				mPlaceholderText: "_XC.Bot.IssuesStack.Empty.Placeholder".loc()
			});
			placeholder.setStyle(CC.XcodeServer.PLACEHOLDER_VIEW_STYLE_SMALL);
			contentViews.push(placeholder);
		}
		this.setContentViews(contentViews);
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

CC.XcodeServer.TIMESERIES_CATEGORY_TEST_RUN = 'test-run';
CC.XcodeServer.TIMESERIES_CATEGORY_TEST_SUMMARY = 'test-summary';
CC.XcodeServer.TIMESERIES_CATEGORY_BUILD_RESULT = 'build-result';
CC.XcodeServer.TIMESERIES_CATEGORY_AGG_TEST_SUMMARY = 'agg-test-summary';

CC.XcodeServer.TimeseriesHelpers = CC.XcodeServer.TimeseriesHelpers || new Object();

// Returns a tuple of ordered bot run GUIDs, sorted timeseries keys, and corresponding timeseries
// value dictionaries keyed by timeseries key.

CC.XcodeServer.TimeseriesHelpers.resultsAsTimeseriesTuple = function(inTimeseriesResults) {
	var timeseriesResults = (inTimeseriesResults || []);
	var orderedRunGUIDs = [], resultsKeyedByRunGUID = {};
	var runGUIDReverseIndex = {}, timeseriesKeyReverseIndex = {};
	// Track the last seen run GUID so we know when we're breaking into a new run.
	var lastSeenRunGUID;
	// Track a hash of seen timeseries keys so we can build a unique set.
	var seenTimeseriesKeys = new Hash();
	var runItem, runGUID, runValue, runKey, runTime, oldHashValue;
	for (idx = 0; idx < timeseriesResults.length; idx++) {
		runItem = timeseriesResults[idx];
		runGUID = runItem.run, runValue = runItem.value, runKey = runItem.key, runTime = runItem.time;
		if (lastSeenRunGUID != runGUID) {
			orderedRunGUIDs.push(runGUID);
			runGUIDReverseIndex[runGUID] = Math.max(orderedRunGUIDs.length - 1, 0);
			lastSeenRunGUID = runGUID;
			resultsKeyedByRunGUID[runGUID] = {};
		}
		resultsKeyedByRunGUID[runGUID][runKey] = runValue;
		seenTimeseriesKeys.set(runKey, true);
	}
	// Finally alphabetically sort the timeseries keys.
	var orderedTimeseriesKeys = seenTimeseriesKeys.keys().sort();
	for (var kdx = 0; kdx < orderedTimeseriesKeys.length; kdx++) {
		timeseriesKeyReverseIndex[orderedTimeseriesKeys[kdx]] = kdx;
	}
	return [orderedRunGUIDs, orderedTimeseriesKeys, resultsKeyedByRunGUID, runGUIDReverseIndex, timeseriesKeyReverseIndex];
};

// Special-purpose timeseries interpreter for unit tests, intended to be used with the
// CC.XcodeServer.TIMESERIES_CATEGORY_AGG_TEST_SUMMARY timeseries category. Returns an array
// of objects, each object having the keys "runGUID" (the GUID of the bot run) and "tests"
// (an array of test objects, each object having keys "name" and "succeeded"). If the optional
// "normalize test arrays" parameter is set to true, the test arrays will be normalized to have
// the same length, with nulls taking the place of tests that did not exist for a given run.

// In other words, if inOptNormalizeTestArrays is true, the entries in the "tests" array for
// each run will have a one-to-one correspondence with the results of sortedTestNames (below).

CC.XcodeServer.TimeseriesHelpers.testsGroupedAndSortedByRun = function(inTimeseriesResults, inOptNormalizeTestArrays) {
	var timeseriesResults = (inTimeseriesResults || []);
	// Track the last seen run GUID so we know when we're breaking into a new run.
	var lastSeenRunGUID;
	var runs = [];
	// Loop over the timeseries data
	var runItem, runGUID, runValue, runKey;
	for (var i = 0; i < timeseriesResults.length; i++)
	{
		runItem = timeseriesResults[i];
		runGUID = runItem.run, runValue = runItem.value, runKey = runItem.key;
		if (lastSeenRunGUID != runGUID)
		{
			runs.push({runGUID: runGUID, tests: []});
			lastSeenRunGUID = runGUID;
		}
		
		if (runKey != 'IDESchemeActionDummyTestSummary')
			runs[runs.length - 1].tests.push({name: runKey, value: runValue});
	}
	// Sort each tests array
	for (var i = 0; i < runs.length; i++)
	{
		runs[i].tests.sort(function(a, b){
			if (a.name < b.name)
				return -1;
			else if (a.name > b.name)
				return 1;
			return 0;
		});
	}
	// If we need to normalize, do that extra work now
	if (inOptNormalizeTestArrays)
	{
		var testNames = CC.XcodeServer.TimeseriesHelpers.sortedTestNames(inTimeseriesResults);
		var run;
		for (var i = 0; i < runs.length; i++)
		{
			run = runs[i];
			for (var j = 0; j < run.tests.length; j++)
			{
				if (run.tests[j].name != testNames[j])
					run.tests.splice(j, 0, null);
			}
			
			// pad out with nulls
			while (run.tests.length < testNames.length)
				run.tests.push(null);
		}
	}
	return runs;
};

// Returns a sorted list of all test names, adjusted properly so tests with the same name
// don't clobber one another.

CC.XcodeServer.TimeseriesHelpers.sortedTestNames = function(inTimeseriesResults, inNotAllTestNames) {
	var timeseriesResults = (inTimeseriesResults || []);
	var testNames = {};
	var testNamesInThisRun = {};
	// Track the last seen run GUID so we know when we're breaking into a new run.
	var lastSeenRunGUID;
	// Loop over the timeseries data
	var runItem, runGUID, runKey;
	for (var i = 0; i < timeseriesResults.length; i++)
	{
		runItem = timeseriesResults[i];
		runGUID = runItem.run, runKey = runItem.key;
		if (lastSeenRunGUID != runGUID)
		{
			for (var k in testNamesInThisRun)
			{
				if (testNamesInThisRun.hasOwnProperty(k))
				{
					if (testNames.hasOwnProperty(k))
						testNames[k] = Math.max(testNamesInThisRun[k], testNames[k]);
					else
						testNames[k] = testNamesInThisRun[k];
				}
			}
			
			lastSeenRunGUID = runGUID;
			testNamesInThisRun = {};
		}
		
		if (testNamesInThisRun.hasOwnProperty(runKey))
			testNamesInThisRun[runKey]++;
		else
			testNamesInThisRun[runKey] = 1;
	}
	// Merge over last run's keys
	for (var k in testNamesInThisRun)
	{
		if (testNamesInThisRun.hasOwnProperty(k))
		{
			if (testNames.hasOwnProperty(k))
				testNames[k] = Math.max(testNamesInThisRun[k], testNames[k]);
			else
				testNames[k] = testNamesInThisRun[k];
		}
	}
	// Make sure we don't have any dummy tests
	delete testNames['IDESchemeActionDummyTestSummary'];
	// Build a sorted list
	var sortedNames = Object.keys(testNames).sort();
	
	if (inNotAllTestNames === undefined) {
		for (var i = 0; i < sortedNames.length; i++)
		{
			var extras = testNames[sortedNames[i]] - 1;
			for (var j = 0; j < extras; j++)
				sortedNames.splice(i, 0, sortedNames[i]);	// note: this is correct, I mean i, not j
			i += extras;
		}
	}
	return sortedNames;
};

// Given the results of the above testsGroupedAndSortedByRun, and a timeseries response from the
// CC.XcodeServer.TIMESERIES_CATEGORY_TEST_SUMMARY timeseries category, this method will modify
// the test run array (in-place) to remove any extraneous test data not present in the summary response,
// and add in blank test arrays (properly null-padded if inOptNormalizeTestArrays is true) for runs
// not already included in the array. This is because the TIMESERIES_CATEGORY_TEST_SUMMARY category contains
// pass-count and fail-count values of "-1" for integrations for which tests did not run, but the
// TIMESERIES_CATEGORY_AGG_TEST_SUMMARY simply omits all test information (which is not desirable in some cases).

CC.XcodeServer.TimeseriesHelpers.pruneTestsAgainstSummaryData = function(inTestRuns, inTimeseriesResults, inOptNormalizeTestArrays) {
	var testRuns = (inTestRuns || []);
	var timeseriesResults = (inTimeseriesResults || []);
	var testRunGuids = [];
	var finalTestRuns = [];
	
	// check what length to pad test arrays to
	var testArrayPadLength = 0;
	if (inOptNormalizeTestArrays && testRuns.length > 0)
		testArrayPadLength = testRuns[0].tests.length;
	
	// step through our timeseries data to obtain a list of unique bot runs
	var desiredGUIDs = [];
	var lastSeenGUID, runGUID;
	for (var i = 0; i < timeseriesResults.length; i++)
	{
		runGUID = timeseriesResults[i].run;
		if (lastSeenGUID != runGUID)
		{
			lastSeenGUID = runGUID;
			desiredGUIDs.push(runGUID);
		}
	}
	
	// build array of test run Guids
	for (var k = 0; k < inTestRuns.length; k++) {
		var testRun = inTestRuns[k];
		if (testRun && testRun.runGUID) {
			testRunGuids.push(testRun.runGUID);
		}
	}
	
	// loop through our provided test runs, and pad appropriately
	for (var g = 0; g < desiredGUIDs.length; g++) {
		var runGUID = desiredGUIDs[g];
		var testRunItemIndex = testRunGuids.indexOf(runGUID);
		
		if (testRunItemIndex == -1) {
			var newTest = {runGUID: runGUID, tests: []};
			finalTestRuns.push(newTest);
		}
		else {
			finalTestRuns.push(inTestRuns[testRunItemIndex]);
		}
	}
	
	return finalTestRuns;
};
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

// Stacked graph legend view.

CC.XcodeServer.StackedGraphLegendView = Class.create(CC.Mvc.View, {
	mClassName: 'xc-stacked-graph-legend-view',
	// An array of class name/localization string tuples
	mItems: [],
	render: function() {
		var elem = Builder.node('div');
		var fragment = document.createDocumentFragment();
		for (var idx = 0; idx < this.mItems.length; idx++) {
			fragment.appendChild(Builder.node('div', {className: 'xc-graph-legend-item %@'.fmt(this.mItems[idx][0])}, [
				Builder.node('span', {className: 'glyph'}),
				this.mItems[idx][1]
			]));
		}
		elem.appendChild(fragment);
		return elem;
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.










CC.XcodeServer.IssueHistoryGraphLegendView = Class.create(CC.XcodeServer.StackedGraphLegendView, {
	mItems: [
		['analysis', "_XC.Bot.Summary.HistoryGraphs.ErrorsWarningsIssues.Legend.Issues".loc()],
		['warnings', "_XC.Bot.Summary.HistoryGraphs.ErrorsWarningsIssues.Legend.Warnings".loc()],
		['errors', "_XC.Bot.Summary.HistoryGraphs.ErrorsWarningsIssues.Legend.Errors".loc()]
	]
});

CC.XcodeServer.TestResultHistoryGraphLegendView = Class.create(CC.XcodeServer.StackedGraphLegendView, {
	mItems: [
		['passed', "_XC.Bot.Summary.HistoryGraphs.UnitTests.Legend.Pass".loc()],
		['failed', "_XC.Bot.Summary.HistoryGraphs.UnitTests.Legend.Fail".loc()]
	]
});

CC.XcodeServer.BotSummaryContentView = Class.create(CC.XcodeServer.BotDetailContentView, {
	mClassNames: ['xc-bot-detail-content-view', 'xc-bot-summary-content-view'],
	mDefaultHowMany: 24,
	resetInnerHTML: function() {
		this.$().innerHTML = "<div class='top' aria-label='" + "_XC.Accessibility.Label.IntegrationResult".loc() + "'></div><div class='middle' aria-label='" + "_XC.Accessibility.Label.History".loc() + "'></div><div class='bottom' aria-label='" + "_XC.Accessibility.Label.IntegrationResult".loc() + "'></div>";
	},
	makeAccessible: function() {
		// Set Navigation landmark (Actions/Nav)
		var botSummaryContent = this.mParentElement;
		//botSummaryContent.writeAttribute('role', 'navigation');
		botSummaryContent.writeAttribute('aria-label', "_XC.Accessibility.Label.BotSummary".loc());
	},
	configureForFocusedBotEntityAndLatestTerminalBotRunEntity: function(inBotEntity, inOptLatestTerminalBotRunEntity) {
		this.resetInnerHTML();
		this.$('div.middle').show();
		this.markAsLoading(true);
		this.handleUpdatedBotRunEntity(inOptLatestTerminalBotRunEntity, true);
	},
	configureForFocusedBotRunEntity: function(inBotRunEntity) {
		this.resetInnerHTML();
		this.$('div.middle').hide();
		this.markAsLoading(true);
		this.handleUpdatedBotRunEntity(inBotRunEntity, true);
	},
	handleUpdatedBotRunEntity: function(inBotRunEntity, inForceUpdate) {
		if (!inBotRunEntity) return;
		
		// If the bot run is not in a terminal state, bail.
		if (CC.XcodeServer.isTerminalBotStatus(inBotRunEntity.status) == false) {
			if (!inForceUpdate) {
				return;
			}
		}
		
		// Fetch timeseries data for this bot run entity so we can update the counts.
		var botRunEntityGUID = inBotRunEntity.guid;
		var ownerBotEntityGUID = inBotRunEntity.ownerGUID;
		var errback = function() {
			notifier().printErrorMessage("_XC.Bot.Summary.Unexpected.Error".loc());
			this.markAsLoading(false);
		};
		var callback = function(inBatchedResponse) {
			// Rebuild the top page banner.
			var topFragment = document.createDocumentFragment();
			var archiveProductDownloadView = new CC.XcodeServer.BotRunArchiveProductDownloadView();
			archiveProductDownloadView.forceRender();
			archiveProductDownloadView.setVisible(false);		
			topFragment.appendChild(archiveProductDownloadView.$());
			var latestIntegrationHeaderView = new CC.XcodeServer.DetailViewLatestIntegrationHeaderView({
				mHeaderText: "_XC.Bot.Summary.IntegrationResults.Title".loc(),
				mBotRunEntity: inBotRunEntity,
				tabIndex: accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_SUMMARY_INFO)
			});
			var left = Builder.node('div', {'className': 'left'}, [
				latestIntegrationHeaderView.forceRender()
			]);
			topFragment.appendChild(left);
			var summaryElement = CC.XcodeServer.summaryElementForBotRunSummary(0, 0, 0, 0, 0);
			topFragment.appendChild(summaryElement);
			topFragment.appendChild(Builder.node('div', {'style': 'display: block; clear: both;'}));
			var top = this.$('.top');
			top.innerHTML = "";
			top.appendChild(topFragment);
		
			// Initialize the issues summary.
			this.loadIssuesSummaryForBotRun(inBotRunEntity);
			
			if (inBatchedResponse && inBatchedResponse.responses) {
				var responses = inBatchedResponse && inBatchedResponse.responses;
				// Handle the bot run specific timeseries data first.
				var botRunBuildResults = (responses[0] && responses[0].response);
				var botRunTestSummary = (responses[1] && responses[1].response);
				var errorCount, analysisCount, warningCount, passingTestsCount, totalTestsCount;
				if (botRunBuildResults) {
					var buildResultTimeseriesTuple = CC.XcodeServer.TimeseriesHelpers.resultsAsTimeseriesTuple(botRunBuildResults);
					var buildResultHash = buildResultTimeseriesTuple[2];
					if (buildResultHash && buildResultHash[botRunEntityGUID]) {
						errorCount = (buildResultHash[botRunEntityGUID]["error"] || 0);
						analysisCount = (buildResultHash[botRunEntityGUID]["analysis"] || 0);
						warningCount = (buildResultHash[botRunEntityGUID]["warning"] || 0);
					}
				}
				if (botRunTestSummary) {
					var unitTestResultTimeseriesTuple = CC.XcodeServer.TimeseriesHelpers.resultsAsTimeseriesTuple(botRunTestSummary);
					var testResultHash = unitTestResultTimeseriesTuple[2];
					if (testResultHash && testResultHash[botRunEntityGUID]) {
						passingTestsCount = (testResultHash[botRunEntityGUID]["pass-count"] || 0);
						var failCount = (testResultHash[botRunEntityGUID]["fail-count"] || 0);
						totalTestsCount = passingTestsCount + failCount;
					}
				}
				this.updateLastIntegrationInfoForTimeseriesValues(errorCount, warningCount, analysisCount, passingTestsCount, totalTestsCount);
				// Handle the bot specific timeseries data.
				var botBuildResults = (responses && responses.length > 2 && responses[2] && responses[2].response);
				var botTestSummary = (responses && responses.length > 3 && responses[3] && responses[3].response);
				this.updateGraphsForTimeseriesData(botBuildResults, botTestSummary);
				// Handle the archive/product second (if we have them).
				var archiveEntity = (responses && responses.length > 4 && responses[4].response);
				var productEntity = (responses && responses.length > 5 && responses[5].response);
				archiveProductDownloadView.configureForFileEntities(archiveEntity, productEntity);
				archiveProductDownloadView.setVisible(true);		
			}
			
			this.markAsLoading(false);
		};
		var batch = [
			['XCGraphService', 'timeseriesDataForBotRunGUID:andCategory:', [botRunEntityGUID, CC.XcodeServer.TIMESERIES_CATEGORY_BUILD_RESULT]],
			['XCGraphService', 'timeseriesDataForBotRunGUID:andCategory:', [botRunEntityGUID, CC.XcodeServer.TIMESERIES_CATEGORY_TEST_SUMMARY]],
			['XCGraphService', 'timeseriesDataForEntityGUID:andCategory:inRange:', [ownerBotEntityGUID, CC.XcodeServer.TIMESERIES_CATEGORY_BUILD_RESULT, [0, this.mDefaultHowMany]]],
			['XCGraphService', 'timeseriesDataForEntityGUID:andCategory:inRange:', [ownerBotEntityGUID, CC.XcodeServer.TIMESERIES_CATEGORY_TEST_SUMMARY, [0, this.mDefaultHowMany]]]
		];
		if (inBotRunEntity.archiveGUID) {
			batch.push(['ContentService', 'entityForGUID:', inBotRunEntity.archiveGUID]);
		}
		if (inBotRunEntity.productGUID) {
			batch.push(['ContentService', 'entityForGUID:', inBotRunEntity.productGUID]);
		}
		service_client().batchExecuteAsynchronously(batch, undefined, callback.bind(this), errback.bind(this));
	},
	updateGraphsForTimeseriesData: function(inBuildResults, inTestSummary) {
		if (inBuildResults && inTestSummary) {
			var integrationNumberByBotEntityGuids = {};
			// Create a hash of integration numbers for graph.
			for (var a = 0; a < inBuildResults.length; a++) {
				var buildResult = inBuildResults[a];
				integrationNumberByBotEntityGuids[buildResult.run] = buildResult.integration;
			}
			// Convert each of the time series data we got into something we can feed the graph view.  We deliberately use the bot run GUIDs we
			// got from the build result data, since we're guaranteed to always have run GUIDs for each entry.  Tests results may/may not be posted
			// as timeseries data.
			var buildResultTimeseriesTuple = CC.XcodeServer.TimeseriesHelpers.resultsAsTimeseriesTuple(inBuildResults);
			var buildResultData = [];
			var buildResultRunGUIDs = buildResultTimeseriesTuple[0], buildResultHash = buildResultTimeseriesTuple[2], buildResult;
			for (idx = 0; idx < buildResultRunGUIDs.length; idx++) {
				buildResult = buildResultHash[buildResultRunGUIDs[idx]];
				var integrationNumber = integrationNumberByBotEntityGuids[buildResultRunGUIDs[idx]];
				buildResultData.push({'integration': (integrationNumber ? integrationNumber : ''), 'values': [buildResult['error'], buildResult['warning'], buildResult['analysis']]});
			}
			var unitTestResultTimeseriesTuple = CC.XcodeServer.TimeseriesHelpers.resultsAsTimeseriesTuple(inTestSummary);
			var unitTestResultData = [];
			var unitTestResultHash = unitTestResultTimeseriesTuple[2], unitTestResult;
			for (idx = 0; idx < buildResultRunGUIDs.length; idx++) {
				unitTestResult = unitTestResultHash[buildResultRunGUIDs[idx]];
				var integrationNumber = integrationNumberByBotEntityGuids[buildResultRunGUIDs[idx]];
				var unitTestResultValues = [0, 0];
				if (unitTestResult) unitTestResultValues = [unitTestResult['fail-count'], unitTestResult['pass-count']];
				unitTestResultData.push({'integration': (integrationNumber ? integrationNumber : ''), 'values': unitTestResultValues});
			}
			// Build the graph.
			var graphsFragment = document.createDocumentFragment();
			var issueGraphWrapper = Builder.node('div', {className: 'graph'}, [
				Builder.node('div', {'className': 'left'}, [
					Builder.node('h1', "_XC.Bot.Summary.HistoryGraphs.ErrorsWarningsIssues.Title".loc()),
					(new CC.XcodeServer.IssueHistoryGraphLegendView()).forceRender()
				])
			]);
			var issuesGraph = new CC.XcodeServer.GraphView({'data': buildResultData}, CC.XcodeServer.Graphs.GRAPH_TYPE_BAR_CHART, undefined, 600, 110, CC.XcodeServer.Graphs.ISSUES_OPTIONS, CC.XcodeServer.Graphs.ISSUES_STYLE);
			issueGraphWrapper.appendChild(issuesGraph.mParentElement);
			graphsFragment.appendChild(issueGraphWrapper);
			var testGraphWrapper = Builder.node('div', {className: 'graph'}, [
				Builder.node('div', {'className': 'left'}, [
					Builder.node('h1', "_XC.Bot.Summary.HistoryGraphs.UnitTests.Title".loc()),
					(new CC.XcodeServer.TestResultHistoryGraphLegendView()).forceRender()
				])
			]);
			var testsGraph = new CC.XcodeServer.GraphView({'data': unitTestResultData}, CC.XcodeServer.Graphs.GRAPH_TYPE_BAR_CHART, undefined, 600, 110, CC.XcodeServer.Graphs.UNIT_TEST_OPTIONS, CC.XcodeServer.Graphs.UNIT_TEST_STYLE);
			testGraphWrapper.appendChild(testsGraph.mParentElement);
			graphsFragment.appendChild(testGraphWrapper);
			// Draw a title and append our working document fragment.
			var middle = this.$('div.middle');
			middle.innerHTML = "";
			middle.appendChild(graphsFragment);
		}
	},
	handleTimeseriesError: function(inResponse) {
		notifier().printErrorMessage("_XC.Bot.Summary.HistoryGraphs.Unexpected.Error".loc());
		if (inResponse) logger().error("Error occurred fetching timeseries information: %@", inResponse);
	},
	updateLastIntegrationInfoForTimeseriesValues: function(inErrorCount, inWarningCount, inAnalysisCount, inPassingTestsCount, inTotalTestsCount) {
		var summaryElement = this.$('div.top .xc-bot-run-summary');
		var errorCount = Math.max(inErrorCount, 0);
		var warningCount = Math.max(inWarningCount, 0);
		var analysisCount = Math.max(inAnalysisCount, 0);
		var totalTestsCount = Math.max(inTotalTestsCount, 0);
		var passingTestsCount = Math.max(inPassingTestsCount, 0);
		var testFailureCount = Math.max((totalTestsCount - passingTestsCount), 0);
		CC.XcodeServer.updateSummaryElementWithSummary(summaryElement, errorCount, warningCount, analysisCount, passingTestsCount, testFailureCount);
	},
	createAndRenderMiniHeaderView: function(inHeaderText) {
		var header = new CC.XcodeServer.MiniHeaderView({
			mHeaderText: inHeaderText
		});
		return header.forceRender();
	},
	loadIssuesSummaryForBotRun: function(inBotRunEntity) {
		// Create a last integration details stacked disclosure view.
		var left = Builder.node('div', {'className': 'left'}, [
			Builder.node('h1', "_XC.Bot.Summary.IntegrationDetails.Title".loc())
		]);
		var fragment = document.createDocumentFragment();
		fragment.appendChild(left);
		var issueStackView = new CC.XcodeServer.IssuesStackView({
			mBotRunEntity: inBotRunEntity
		});
		issueStackView.forceRender();
		fragment.appendChild(issueStackView.$());
		this.$('div.bottom').innerHTML = "";
		this.$('div.bottom').appendChild(fragment);
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

// Base filter bar view class.

CC.XcodeServer.FilterBarView = Class.create(CC.FilterBarView, {
	mClassName: 'xc-filter-bar-view',
	mFilterTitleFormatString: "_XC.FilterBarView.Filters.%@.Title",
	mFilterTooltipFormatString: "_XC.FilterBarView.Filters.%@.Tooltip",
	mAllowedFilters: ['all', 'failed', 'passed'],
	mAllowedSortKeys: null,
	mFilter: 'all'
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
//
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

CC.XcodeServer.GraphScrubberView = Class.create(CC.Mvc.View, {
	mClassName: 'xc-graph-scrubber-view-loupe',
	mLoupe: null,
	mLoupeId: null,
	mMovePositionStartX: 0,
	mLoupeMinRightPosition: 0,
	mLoupeMaxRightPosition: 0,
	mGraphScrubberWidth: 0,
	mGraphScrubberMaxWidth: 0,
	mGraphWidth: 0,
	mGraphMinRightPosition: 0,
	mGraphMaxRightPosition: 0,
	mLoupeWidth: 32,
	mTimer: null,
	mGraph: null,
	mGraphScrubber: null,
	mPanZone: 150,
	mPanMaxSpeed: 10,
	mPanSpeed: 0,
	mGUID: null,
	mIntegrations: [],
	mEarliestIntegrationUnderLoupe: 0,
	mLatestIntegrationUnderLoupe: 0,
	mLatestIntegrationDate: 0,
	mGraphDatesContainer: 0,
	mRightShadow: null,
	mLeftShadow: null,
	initialize: function($super, inEntityGUID) {
		$super();
		bindEventListeners(this, [
			'handleWindowMouseDown',
			'handleWindowMouseMove',
			'handleWindowMouseUp',
			'moveBackgroundRight',
			'moveBackgroundLeft',
			'handleWindowResize'
		]);
		
		var entityGUID = ( inEntityGUID || "" );
		this.mGUID = entityGUID;
	},
	render: function() {
		this.mLoupe = this.renderLoupe(this.mGUID);

		var graphScrubberContainer = Builder.node('div');
		this.mGraph.addClassName('xc-graph-scrubber-view-graph');
		this.mGraphScrubber = Builder.node('div', {className: 'xc-graph-scrubber-view-container'}, [
			Builder.node('div', {className: 'xc-graph-scrubber-view'}, [
				this.mGraph
			]),
			Builder.node('div', {className: 'xc-graph-scrubber-view-loupe-container'}, [
				this.mLoupe
			])
		]);
		this.mGraphScrubber.style.maxWidth = this.mGraphScrubberMaxWidth+"px";

		var graphShadow = Builder.node('div', {className: 'xc-graph-scrubber-view-graph-shadow'});
		this.mGraphDatesContainer = Builder.node('div', {'tabindex': '-1', className: 'xc-graph-scrubber-view-graph-date'}, [
			Builder.node('span', {'tabindex': '-1', className: 'xc-graph-scrubber-view-graph-date-earliest'}),
			Builder.node('span', {'tabindex': '-1', className: 'xc-graph-scrubber-view-graph-date-latest'}),
			Builder.node('div', {'tabindex': '-1', className: 'xc-graph-scrubber-view-graph-shadow-right', style: 'display: none;'}),
			Builder.node('div', {'tabindex': '-1', className: 'xc-graph-scrubber-view-graph-shadow-left'})
		]);

		this.mRightShadow = Builder.node('div', {className: 'xc-graph-scrubber-view-graph-right-shadow'});
		this.mLeftShadow = Builder.node('div', {className: 'xc-graph-scrubber-view-graph-left-shadow'});

		this.setLatestIntegrationDateUI(true);
		this.setGraphSideShadows();
		graphScrubberContainer.appendChild(this.mGraphScrubber);
		graphScrubberContainer.appendChild(graphShadow);
		graphScrubberContainer.appendChild(this.mGraphDatesContainer);
		graphScrubberContainer.appendChild(this.mRightShadow);
		graphScrubberContainer.appendChild(this.mLeftShadow);
		
		// Hides the loupe if there are 10 or less integrations for this bot.
		if (this.mIntegrations.length < 11) {
			this.mLoupe.hide();
		}
		
		return graphScrubberContainer;
	},
	renderLoupe: function(inBotGUID) {
		this.mLoupeId = 'xc-graph-scrubber-view-scrubber-%@'.fmt(inBotGUID);
		var loupe = Builder.node('div', {id: this.mLoupeId, className: 'xc-graph-scrubber-view-loupe-scrubber', style: 'width: '+(this.mLoupeWidth-2)+"px;"}, [
			Builder.node('span', {className: 'xc-graph-scrubber-view-loupe-earliest-integration'}),
			Builder.node('span', {className: 'xc-graph-scrubber-view-loupe-latest-integration'}),
			Builder.node('span', {className: 'xc-graph-scrubber-view-loupe-earliest-integration-date'}),
			Builder.node('span', {className: 'xc-graph-scrubber-view-loupe-latest-integration-date'})

		]);
		globalEventDelegate().registerDomResponderForEventByIdentifer('mousedown', this.mLoupeId, this.handleWindowMouseDown);
		return loupe;
	},
	handleWindowMouseDown: function(inEvent) {
		Event.observe(window, 'mousemove', this.handleWindowMouseMove);
		Event.observe(window, 'mouseup', this.handleWindowMouseUp);
		this.mMovePositionStartX = inEvent.pointerX();

		this.refreshIntegrationDatesUI(false);
		this.setLatestIntegrationNumberUnderLoupe();
		this.setLoupeIntegrationAndDateOverlays(true);
	},
	handleWindowMouseUp: function(inEvent) {
		Event.stopObserving(window, 'mousemove', this.handleWindowMouseMove);
		Event.stopObserving(window, 'mouseup', this.handleWindowMouseUp);
		this.stopMoveBackground();

		this.setLoupeIntegrationAndDateOverlays(false);
		this.refreshIntegrationDatesUI(true);
		globalNotificationCenter().publish('LOUPE_MOUSE_UP');
	},
	handleWindowMouseMove: function(inEvent) {
		if ( this.mMovePositionStartX == this.mMovePositionStartX ) {
			var loupe = this.mLoupe;
			var loupeRight = parseInt(loupe.style.right);
			loupeRight = ( loupeRight == loupeRight ? loupeRight : 0 );
			var xPosition = inEvent.pointerX();
			var visibleGraphCumulativeLeftOffset = this.mGraphScrubber.down('.xc-graph-scrubber-view').cumulativeOffset().left || 0;

			if ( xPosition >= visibleGraphCumulativeLeftOffset && xPosition <= visibleGraphCumulativeLeftOffset+this.mGraphScrubberWidth ) {
				var delta = (xPosition - this.mMovePositionStartX);
				if ( loupeRight >= this.mLoupeMinRightPosition && loupeRight <= this.mLoupeMaxRightPosition ) {
					var move = loupeRight - delta;
					if ( move < this.mLoupeMinRightPosition ) {
						loupe.style.right = this.mLoupeMinRightPosition+"px";
					}
					else if ( move > this.mLoupeMaxRightPosition ) {
						loupe.style.right = this.mLoupeMaxRightPosition+"px";
					}
					else {
						loupe.style.right = move+"px";
					}

					this.moveBackgroundCheck();
				}
				this.mMovePositionStartX += delta;
			}

			this.setLatestIntegrationNumberUnderLoupe();
			this.setLoupeIntegrationAndDateOverlays(true);
		}
	},
	moveBackgroundCheck: function(){
		var loupe = this.mLoupe;
		var loupeRightEnd = parseInt(loupe.style.right);
		var loupePanningZoneWidth = ((this.mPanZone > 0 && this.mPanZone < 1) ? (this.mGraphScrubberWidth*this.mPanZone) :  this.mPanZone );

		if ( loupeRightEnd < (this.mLoupeMinRightPosition + loupePanningZoneWidth) ) {
			var lengthInPanningZone = loupePanningZoneWidth - loupeRightEnd;
			this.mPanSpeed = this.mPanMaxSpeed * (lengthInPanningZone/loupePanningZoneWidth);
			this.moveBackgroundTrigger('right');
		}
		else if ( loupeRightEnd > (this.mLoupeMaxRightPosition - loupePanningZoneWidth)) {
			var lengthInPanningZone = loupePanningZoneWidth - (this.mLoupeMaxRightPosition - loupeRightEnd);
			this.mPanSpeed = this.mPanMaxSpeed * (lengthInPanningZone/loupePanningZoneWidth);
			this.moveBackgroundTrigger('left');
		}
		else {
			this.stopMoveBackground();
		}
	},
	moveBackgroundTrigger: function(inDirection){
		if( this.mTimer == null ) {
			if( inDirection == 'left' ){
				this.mTimer = window.setInterval(this.moveBackgroundLeft, 10);
			}
			else if( inDirection == 'right' ){
				this.mTimer = window.setInterval(this.moveBackgroundRight, 10);
			}
		}
	},
	moveBackgroundLeft: function(){
		var offsetRight = -(this.mGraphWidth - ( this.mGraphScrubberWidth - this.mGraph.offsetLeft ));
		if ( this.mTimer != null && offsetRight > this.mGraphMinRightPosition ) {
			var move = offsetRight - this.mPanSpeed;
			if( move < this.mGraphMinRightPosition ) {
				this.mGraph.style.right = this.mGraphMinRightPosition+"px";
			}
			else {
				this.mGraph.style.right = move+"px";
			}
			this.setGraphSideShadows();
		}
	},
	moveBackgroundRight: function(){
		var offsetRight = -(this.mGraphWidth - ( this.mGraphScrubberWidth -this.mGraph.offsetLeft ));
		if ( this.mTimer != null && offsetRight < this.mGraphMaxRightPosition ) {
			var move = offsetRight + this.mPanSpeed;
			if( move > this.mGraphMaxRightPosition ) {
				this.mGraph.style.right = this.mGraphMaxRightPosition+"px";
			}
			else {
				this.mGraph.style.right = move+"px";
			}
			this.setGraphSideShadows();
		}
	},
	stopMoveBackground: function(){
		if( this.mTimer != null ){
			window.clearInterval(this.mTimer);
			this.mTimer = null;
		}
	},
	getIntegrationNumberUnderLoupe: function() {
		var loupe = this.mLoupe;
		var loupeRight = parseInt(loupe.style.right);
		loupeRight = ( (loupeRight == loupeRight) ? loupeRight : 0 );
		var offsetRight = (Math.abs(this.mGraphWidth) - ( Math.abs(this.mGraphScrubberWidth) + Math.abs(this.mGraph.offsetLeft) ));
		var movePositionX = ( loupeRight + offsetRight );

		movePositionX += ((movePositionX%3 != 0) ? (3 - movePositionX%3) : 0);
		return movePositionX / 3;
	},
	setLatestIntegrationNumberUnderLoupe: function() {
		if ( this.mIntegrations.length ) {
			var earliestIntegrationUnderLoupeFound = false;
			var integrationNumberUnderLoupe = this.getIntegrationNumberUnderLoupe();
			this.mLatestIntegrationUnderLoupe = this.mIntegrations[integrationNumberUnderLoupe];

			for ( var i = 9; i>=0; i-- ) {
				if ( !earliestIntegrationUnderLoupeFound && this.mIntegrations[integrationNumberUnderLoupe +i] !== undefined) {
					this.mEarliestIntegrationUnderLoupe = this.mIntegrations[integrationNumberUnderLoupe +i];
					earliestIntegrationUnderLoupeFound = true;
				}
			}
		}
	},
	setGraphViewWidth: function(inGraphWidth){
		// Substract the padding
		this.mGraphWidth = inGraphWidth;
		this.mGraph.style.width = this.mGraphWidth+"px";
		this.mGraphScrubberMaxWidth = this.mGraphWidth;
	},
	setGraph: function(inGraph) {
		if ( inGraph ) {
			this.mGraph = inGraph.mParentElement;
		}
		else {
			this.mGraph = Builder.node('div');
		}
	},
	handleWindowResize: function(inEvent){
		var loupe = this.mLoupe;
		var loupeLeftOffset = loupe.cumulativeOffset().left;
		var graphWidthDelta = this.mGraphScrubberWidth - this.mGraphScrubber.getWidth();
		var delta = this.mGraphScrubber.cumulativeOffset().left - loupeLeftOffset;
		this.refreshProperties();
		var graphRight = parseInt(this.mGraph.style.right);
		graphRight = ( graphRight == graphRight ? graphRight : 0 );
		var loupeRight = parseInt(loupe.style.right);
		loupeRight = ( loupeRight == loupeRight ? loupeRight : 0 );

		if ( (graphWidthDelta < 0 && graphRight < 0) || (loupeLeftOffset <= this.mGraphScrubber.cumulativeOffset().left) ) {
			this.mGraph.style.right = (graphRight - graphWidthDelta)+"px";
			loupe.style.right = (loupeRight - graphWidthDelta)+"px";
			this.setGraphSideShadows();
		}
	},
	observeWindowResize: function(){
		Event.observe(window, 'resize', this.handleWindowResize);
	},
	stopObservingWindowResize: function(){
		Event.stopObserving(window, 'resize', this.handleWindowResize);
	},
	refreshProperties: function(){
		this.mGraphScrubberWidth = this.mGraphScrubber.down('.xc-graph-scrubber-view').getWidth();
		this.mLoupeMaxRightPosition = this.mGraphScrubberWidth - this.mLoupeWidth;
		this.mGraphMinRightPosition = -(this.mGraphWidth - this.mGraphScrubberWidth);
	},
	getGuid: function() {
		return this.mGUID;
	},
	buildGraph: function(inIntegrations) {
		this.mIntegrations = ( inIntegrations ? inIntegrations : []);
		var data = [], metadata = {};
		var graphWidth = 3 * this.mIntegrations.length;

		for ( var i = this.mIntegrations.length-1; i >= 0; i-- ) {
			var failCount = ( this.mIntegrations[i] && this.mIntegrations[i]['fail-count'] );
			var passCount = ( this.mIntegrations[i] && this.mIntegrations[i]['pass-count'] );
			var integrationNumber = ( this.mIntegrations[i] && this.mIntegrations[i]['integrationNumber'] );

			if ( i == 0 ) {
				this.mLatestIntegrationDate = this.mIntegrations[i]['integrationDateTime'];
			}

			data.push({'date': new Date(), 'values': [failCount, passCount], 'integration': integrationNumber});
		}

		var view = new CC.XcodeServer.GraphView({'data': data, 'metadata': metadata}, CC.XcodeServer.Graphs.GRAPH_TYPE_BAR_CHART, document.body, undefined, 200, CC.XcodeServer.Graphs.TEST_RESULTS_NAVIGATION_OPTIONS, CC.XcodeServer.Graphs.TEST_RESULTS_NAVIGATION_STYLE, false);

		this.setGraph(view);
		this.setGraphViewWidth(graphWidth);
	},
	setLoupeIntegrationAndDateOverlays: function(inShow) {
		var loupe = this.mLoupe;
		if ( inShow && this.mEarliestIntegrationUnderLoupe && this.mLatestIntegrationUnderLoupe ) {
			loupe.down('.xc-graph-scrubber-view-loupe-latest-integration').textContent = (this.mLatestIntegrationUnderLoupe.integrationNumber || "");
			loupe.down('.xc-graph-scrubber-view-loupe-earliest-integration').textContent = (this.mEarliestIntegrationUnderLoupe.integrationNumber || "");
			// Show the time if the day delta between the two integrations is < 1 day.
			var dayDelta = globalLocalizationManager().calculateDayDeltaForDateFromDate(this.mEarliestIntegrationUnderLoupe.integrationDateTime, this.mLatestIntegrationUnderLoupe.integrationDateTime);
			if (dayDelta <= 1) {
				loupe.down('.xc-graph-scrubber-view-loupe-earliest-integration-date').textContent = globalLocalizationManager().localizedDateWithTime(this.mEarliestIntegrationUnderLoupe.integrationDateTime, true);
				loupe.down('.xc-graph-scrubber-view-loupe-latest-integration-date').textContent = globalLocalizationManager().localizedDateWithTime(this.mLatestIntegrationUnderLoupe.integrationDateTime, true);
			} else {
				loupe.down('.xc-graph-scrubber-view-loupe-earliest-integration-date').textContent = globalLocalizationManager().localizedDate(this.mEarliestIntegrationUnderLoupe.integrationDateTime);
				loupe.down('.xc-graph-scrubber-view-loupe-latest-integration-date').textContent = globalLocalizationManager().localizedDate(this.mLatestIntegrationUnderLoupe.integrationDateTime);
			}
		}
		else {
			loupe.down('.xc-graph-scrubber-view-loupe-latest-integration').textContent = "";
			loupe.down('.xc-graph-scrubber-view-loupe-earliest-integration').textContent = "";
			loupe.down('.xc-graph-scrubber-view-loupe-earliest-integration-date').textContent = "";
			loupe.down('.xc-graph-scrubber-view-loupe-latest-integration-date').textContent = "";
		}
	},
	setLatestIntegrationDateUI: function(inShow) {
		if ( inShow ) {
			this.mGraphDatesContainer.down('.xc-graph-scrubber-view-graph-date-latest').textContent = globalLocalizationManager().localizedDateWithTime(this.mLatestIntegrationDate, true);
		}
		else {
			this.mGraphDatesContainer.down('.xc-graph-scrubber-view-graph-date-latest').textContent = "";
		}
	},
	setEarliestIntegrationDateUI: function(inShow) {
		if ( inShow ) {
			this.mGraphDatesContainer.down('.xc-graph-scrubber-view-graph-date-earliest').textContent = globalLocalizationManager().localizedDateWithTime(this.mEarliestIntegrationDate, true);
		}
		else {
			this.mGraphDatesContainer.down('.xc-graph-scrubber-view-graph-date-earliest').textContent = "";
		}
	},
	refreshIntegrationDatesUI: function(inShow) {
		this.refreshProperties();
		var offsetRight = (Math.abs(this.mGraphWidth) - ( Math.abs(this.mGraphScrubberWidth) + Math.abs(this.mGraph.offsetLeft) ));
		var offsetLeft = this.mGraphScrubberWidth + offsetRight;

		offsetRight += ((offsetRight%3 != 0) ? (3 - offsetRight%3) : 0);
		offsetRight = offsetRight / 3 ;
		this.mLatestIntegrationDate = this.mIntegrations[offsetRight]['integrationDateTime'];
		this.setLatestIntegrationDateUI(inShow);

		offsetLeft -= ((offsetLeft%3 != 0) ? (offsetLeft%3) : 0);
		offsetLeft = offsetLeft/3;
		this.mEarliestIntegrationDate = this.mIntegrations[offsetLeft-1]['integrationDateTime'];
		this.setEarliestIntegrationDateUI(inShow);
	},
	setGraphSideShadows: function() {
		this.refreshProperties();
		var offsetRight = (this.mGraphWidth - ( this.mGraphScrubberWidth - this.mGraph.offsetLeft ));
		var offsetLeft = this.mGraph.offsetLeft;

		if ( offsetRight > 0 && offsetRight != this.mGraphWidth ) {
			this.mRightShadow.show();
		}
		else {
			this.mRightShadow.hide();
		}

		if ( offsetLeft < 0 ) {
			this.mLeftShadow.show();
		}
		else {
			this.mLeftShadow.hide();
		}
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
//
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.
//


//
CC.XcodeServer.BOT_TEST_RESULT_CLASS_PASSED = 'pass';
CC.XcodeServer.BOT_TEST_RESULT_CLASS_FAILED = 'fail';
CC.XcodeServer.BOT_TEST_RESULT_CLASS_MIXTED = 'mixed';

CC.XcodeServer.BotTestDetailView = Class.create(CC.Mvc.View, {
	mClassName: 'xc-bot-test-detail-view-container',
	mGraphScrubberView: null,
	initialize: function($super) {
		$super();
		
		// Force a render so we can add the graph scrubber above a filter bar subview, and the results table below.
		this.forceRender();
		this.$().appendChild(Builder.node('div', {'tabindex': '-1', className: 'graph-results'}));
		this.mFilterBarView = new CC.XcodeServer.FilterBarView();
		this.addSubview(this.mFilterBarView);
		this.$().appendChild(Builder.node('div', {className: 'results selectable'}));
		
		globalNotificationCenter().subscribe(CC.XcodeServer.NOTIFICATION_BOT_DETAIL_VIEW_DID_SHOW_CONTENT_VIEW, this.handleBotDetailViewDidShowContentViewNotification.bind(this), this);
		globalNotificationCenter().subscribe(CC.XcodeServer.NOTIFICATION_BOT_DETAIL_VIEW_DID_HIDE_CONTENT_VIEW, this.handleBotDetailViewDidHideContentViewNotification.bind(this), this);
		globalNotificationCenter().subscribe(CC.FILTER_BAR_DID_CHANGE_FILTER, this.filterTestResults.bind(this), this.mFilterBarView);
		globalNotificationCenter().subscribe(CC.FILTER_BAR_DID_CHANGE_KEYWORD, this.filterTestResults.bind(this), this.mFilterBarView);
		
		globalNotificationCenter().subscribe('LOUPE_MOUSE_UP', function(){
			var integrationNumberUnderLoupe = this.mGraphScrubberView.getIntegrationNumberUnderLoupe();
			this.fetchTestResultsHistoryForBotEntityGUIDInRange(this.mGraphScrubberView.getGuid(), [integrationNumberUnderLoupe, 10]);
		}.bind(this));
	},
	handleBotDetailViewDidShowContentViewNotification: function(inMessage, inObject, inOptExtras) {
		this.mGraphScrubberView.observeWindowResize();
	},
	handleBotDetailViewDidHideContentViewNotification: function(inMessage, inObject, inOptExtras) {
		this.mGraphScrubberView.stopObservingWindowResize();
	},
	fetchInitialTestResultsHistoryForBotEntityGUIDInRange: function(inGUID, inRange) {
		this.markAsLoading(true);
		var entityGUID = CC.meta('x-apple-entity-guid');
		var batch = [
			['XCGraphService', 'timeseriesDataForEntityGUID:andCategory:inRange:', [inGUID, CC.XcodeServer.TIMESERIES_CATEGORY_TEST_SUMMARY, inRange]],
			['XCGraphService', 'timeseriesSummaryForEntityGUID:andCategory:', [inGUID, CC.XcodeServer.TIMESERIES_CATEGORY_TEST_SUMMARY]]
		];
		var callback = function(batchedResponse) {
			if (batchedResponse && batchedResponse.responses && batchedResponse.responses.length) {
				this.mGraphScrubberView = new CC.XcodeServer.GraphScrubberView(inGUID);
				this.handleTimeseriesDataForGraphScrubberView(batchedResponse);
				this.handleTimeseriesSummaryForTestResultTable(batchedResponse);
			} else {
				this.handleUnexpectedError(batchedResponse);
			}
		};
		service_client().batchExecuteAsynchronously(batch, {}, callback.bind(this), this.handleUnexpectedError.bind(this));
	},
	handleTimeseriesDataForGraphScrubberView: function(inBatchedResponse) {
		var response = ( inBatchedResponse.responses[1] && inBatchedResponse.responses[1].response );
		var integrations = ( response && response.integrations );

		if ( integrations ) {
			this.mGraphScrubberView.buildGraph(integrations);
		}
		this.$('div.graph-results').innerHTML = "";
		this.mGraphScrubberView.forceRender();
		this.$('div.graph-results').appendChild(this.mGraphScrubberView.$());
		this.markAsLoading(false);
	},
	handleTimeseriesSummaryForTestResultTable: function(inBatchedResponse) {
		if (inBatchedResponse) {
			var firstResponse = (inBatchedResponse.responses && inBatchedResponse.responses[0] && inBatchedResponse.responses[0].response);
			var batch = [];
			var previousRunGUID = null;
			
			var callback = function(batchedResponse) {
				if (batchedResponse && batchedResponse.responses && batchedResponse.responses.length && firstResponse !== undefined && firstResponse !== null && firstResponse.length) {
					this.handleTimeseriesDataForTestResultsTable(firstResponse, batchedResponse);
				} else {
					this.handleUnexpectedError(batchedResponse);
				}
			}
			
			if (firstResponse !== undefined && firstResponse !== null) {
				for (var i = 0; i < firstResponse.length; i++) {
					if (firstResponse[i] !== undefined) {
						var entityRunGUID = firstResponse[i].run;
						if (entityRunGUID !== undefined && previousRunGUID != entityRunGUID) {
							batch.push(['XCGraphService', 'timeseriesDataForBotRunGUID:andCategory:', [entityRunGUID, CC.XcodeServer.TIMESERIES_CATEGORY_AGG_TEST_SUMMARY]]);
							previousRunGUID = entityRunGUID;
						}
					}
				}
				service_client().batchExecuteAsynchronously(batch, {}, callback.bind(this), this.handleUnexpectedError.bind(this));
			}
		}
	},
	handleTimeseriesDataForTestResultsTable: function(inTimeSeriesSummary, inBatchedResponse) {
		if (inBatchedResponse) {
			var firstResponse = [];
			var secondResponse = inTimeSeriesSummary;
			
			if (inBatchedResponse.responses !== undefined) {
				for (var i = 0; i < inBatchedResponse.responses.length; i++) {
					if (inBatchedResponse.responses[i] !== undefined) {
						var responseObject = inBatchedResponse.responses[i];
						if (responseObject.response !== undefined && responseObject.response.length) {
							for (var j = 0; j < responseObject.response.length; j++) {
								if (responseObject.response[j] !== undefined) {
									var testResponse = responseObject.response[j];
									firstResponse.push(testResponse);
								}
							}
						}
					}
				}
			}
			
			// Unpack the response into timeseries tuples.
			var testResults = CC.XcodeServer.TimeseriesHelpers.testsGroupedAndSortedByRun(firstResponse, true);
			var testSummaryTimeseriesTuple = CC.XcodeServer.TimeseriesHelpers.resultsAsTimeseriesTuple(secondResponse);
			// Test-aggregate-summary information can contain more runs than test-summary information, so we need to prune
			testResults = CC.XcodeServer.TimeseriesHelpers.pruneTestsAgainstSummaryData(testResults, secondResponse, true);
			// Build a structure of test results that we can use to render.
			var orderedBotRunGUIDs = testResults.pluck('runGUID');
			var sortedTestNames = CC.XcodeServer.TimeseriesHelpers.sortedTestNames(firstResponse);
			var numberOfTests = sortedTestNames.length;
			var numberOfRuns = testResults.length;
			// Build a null-padded array equal to the grid matrix size we will draw.  This allows us to know
			// when tests have been included/excluded from particular runs.
			var unitTestResultData = new Array(numberOfTests * numberOfRuns);
			var run, resultsForRun;
			// Loop through each table column.
			for (var idx = 0; idx < numberOfRuns; idx++) {
				run = testResults[idx];
				resultsForRun = run.tests;
				// Loop through each of the test results we have for this column.
				for (var j = 0; j < resultsForRun.length; j++) {
					if (resultsForRun[j]) {
						// We're at row j, column idx
						var loc = (j * numberOfRuns) + idx;
						unitTestResultData[loc] = resultsForRun[j].value;
					}
				}
			}
			// Fetch integration numbers for all the runs we're about to render.
			var gotIntegrationNumbersCallback = function(integrationNumbers) {
				// Build out the floating header row.
				var top = Builder.node('div', {className: 'top'}, [
					Builder.node('table', [
						Builder.node('tr', {className: 'ids'}, [
							Builder.node('td', {className: 'cell'}, "_XC.Bot.Tests.Results.Heading.Integration".loc()),
							this.__buildTableCells(numberOfRuns, "result")
						]),
						Builder.node('tr', {className: 'charts'}, [
							Builder.node('td', {className: 'cell'}, [
								Builder.node('div', {className: 'title'}, "_XC.Bot.Tests.Results.Heading.UnitTests".loc())
							]),
							this.__buildTableCells(numberOfRuns, "result")
						]),
						Builder.node('tr', {className: 'totalcount'}, [
							Builder.node('td', {className: 'cell'}, "_XC.Bot.Tests.Results.Heading.TotalTests".loc()),
							this.__buildTableCells(numberOfRuns, "result")
						]),
						Builder.node('tr', {className: 'failcount'}, [
							Builder.node('td', {className: 'cell'}, "_XC.Bot.Tests.Results.Heading.FailedTest".loc()),
							this.__buildTableCells(numberOfRuns, "result")
						])
					])
				]);
				var idCells = top.select('tr.ids td.result');
				for (var idx = 0; idx < idCells.length; idx++) {
					if (integrationNumbers && integrationNumbers.length) {
						idCells[idx].textContent = integrationNumbers[idx];
					}
				}
				var chartCells = top.select('tr.charts td.result');
				var totalCountCells = top.select('tr.totalcount td.result');
				var failCountCells = top.select('tr.failcount td.result');
				// Update the run column headers with total test information and a pie chart.
				var testSummaryResults = testSummaryTimeseriesTuple[2], testSummaryResultsRunGUID, testSummaryResultsForRunGUID;
				var totalPassingTestsCount, totalFailingTestsCount, totalTestsCount;
				var pieView;
				for (var idx = 0; idx < numberOfRuns; idx++) {
					testSummaryResultsRunGUID = orderedBotRunGUIDs[idx];
					if (testSummaryResults[testSummaryResultsRunGUID]) {
						totalPassingTestsCount = testSummaryResults[testSummaryResultsRunGUID]['pass-count'];
						totalFailingTestsCount = testSummaryResults[testSummaryResultsRunGUID]['fail-count'];
						
						if (totalPassingTestsCount !== undefined && totalFailingTestsCount !== undefined) {
							totalTestsCount = totalPassingTestsCount + totalFailingTestsCount;
							// Draw a pie chart and update the header values for the column.
							pieView = new CC.XcodeServer.UnitTestPieView(totalTestsCount, totalFailingTestsCount, 28, 28);
							chartCells[idx].appendChild(pieView.mParentElement);
						
							if (totalPassingTestsCount > -1 && totalFailingTestsCount > -1) {
								totalCountCells[idx].textContent = totalTestsCount;
								failCountCells[idx].textContent = totalFailingTestsCount;
							}
						}
					}
				}
				// Build out each individual test result row.
				var bottom = Builder.node('div', {className: 'bottom'}, [
					Builder.node('table', this.__buildTableRowsWithTableCells(numberOfTests, numberOfRuns, "result"))
				]);
				var titleCells = bottom.select('td:not(.result)');
				var resultCells = bottom.select('td.result');
				var workingCellIdx = 0, workingTitlCell, workingCell;
				var localizedPassString = "_XC.Bot.Tests.Results.Pass.Title".loc();
				var localizedFailString = "_XC.Bot.Tests.Results.Fail.Title".loc();
				var localizedNoResultString = "_XC.Bot.Tests.Results.NoResult.Title".loc();
				
				// Append the rendered result to the view and remove the loading flag.
				var fragment = document.createDocumentFragment();
				var resultsElement = this.$('div.results');
				
				if (numberOfTests) {
					for (var idx = 0; idx < numberOfTests; idx++) {
						var hasFailedTests = false;
						workingTitleCell = titleCells[idx];
						workingTitleCell.textContent = sortedTestNames[idx];
						workingTitleCell.setAttribute('title', sortedTestNames[idx]);
					
						for (var jdx = 0; jdx < numberOfRuns; jdx++) {
							workingCell = resultCells[workingCellIdx];
							if (unitTestResultData[workingCellIdx] != null) {
								if (unitTestResultData[workingCellIdx] == 1) {
									workingCell.addClassName(CC.XcodeServer.BOT_TEST_RESULT_CLASS_PASSED);
								}
								else if (unitTestResultData[workingCellIdx] == 0) {
									workingCell.addClassName(CC.XcodeServer.BOT_TEST_RESULT_CLASS_FAILED);
									hasFailedTests = true;
									if(workingCell.parentElement && !workingCell.parentElement.hasClassName('has-failed')) {
										workingCell.parentElement.addClassName('has-failed');
									}
								}
								else if (unitTestResultData[workingCellIdx] == 2) {
									workingCell.addClassName(CC.XcodeServer.BOT_TEST_RESULT_CLASS_MIXTED);
								}

								var workingCellString = "<span class='cell_result_msg'>";
								workingCellString += (unitTestResultData[workingCellIdx]) ? localizedPassString : localizedFailString;
								workingCellString += "</span>";
								workingCell.innerHTML = workingCellString;
							} else {
								workingCell.addClassName("noresult");
								var workingCellString = "<span class='cell_result_msg'>"+localizedNoResultString+"</span>";
								workingCell.innerHTML = workingCellString;
							}
							workingCellIdx += 1;
						}
					
						if (hasFailedTests && workingTitleCell && workingTitleCell.parentElement) {
							workingTitleCell.parentElement.addClassName('has-failed');
						}
					}
				
					var integrationDatesString = globalLocalizationManager().shortLocalizedDateWithMonthAsString(secondResponse[0].time) +" - "+globalLocalizationManager().shortLocalizedDateWithMonthAsString(secondResponse[secondResponse.length-1].time);
					var integrationDates = Builder.node('div', {className: 'xc-bot-test-detail-view-integration-dates'}, integrationDatesString);
					var shadowLineNode = Builder.node('div', {className: 'shadowline'});
					var shadowNode = Builder.node('div', {className: 'shadow'});
				
					fragment.appendChild(integrationDates);
					fragment.appendChild(top);
					fragment.appendChild(shadowLineNode);
					fragment.appendChild(shadowNode);
					fragment.appendChild(bottom);
				
					resultsElement.innerHTML = "";
					resultsElement.appendChild(fragment);
				}
				else {
					var placeHolder = new CC.XcodeServer.PlaceholderView({
						mPlaceholderText: "_XC.BotRunDetailTable.NoTestsFound".loc()
					});
					placeHolder.forceRender();
					resultsElement.appendChild(placeHolder.$());
				}
				
				// Observe scroll events on the bottom area.
				this.markAsLoading(false);
				resultsElement.removeClassName('loading');
			}
			return xcservice().getIntegrationNumbersForBotRunGUIDs(orderedBotRunGUIDs, gotIntegrationNumbersCallback.bind(this), this.handleUnexpectedError.bind(this));
		} else {
			return this.handleUnexpectedError(inBatchedResponse);
		}
	},
	fetchTestResultsHistoryForBotEntityGUIDInRange: function(inGUID, inRange) {
		this.$('div.results').addClassName('loading');
		var entityGUID = CC.meta('x-apple-entity-guid');
		var batch = [
			['XCGraphService', 'timeseriesDataForEntityGUID:andCategory:inRange:', [inGUID, CC.XcodeServer.TIMESERIES_CATEGORY_TEST_SUMMARY, inRange]]
		];
		var callback = function(batchedResponse) {
			if (batchedResponse && batchedResponse.responses && batchedResponse.responses.length == 1) {
				this.handleTimeseriesSummaryForTestResultTable(batchedResponse);
			} else {
				this.handleUnexpectedError(batchedResponse);
			}
		};
		service_client().batchExecuteAsynchronously(batch, {}, callback.bind(this), this.handleUnexpectedError.bind(this));
	},
	handleUnexpectedError: function(inBatchedResponse) {
		this.markAsLoading(false);
		notifier().printErrorMessage("_XC.Bot.Tests.Results.Unexpected.Error".loc());
		if (inResponse) logger().error("Error occurred fetching timeseries information: %@", inBatchedResponse);
	},
	// Helper function that returns an array of n table cell DOM nodes.
	__buildTableCells: function(inCellCount, inOptExtraCellClassName) {
		var results = [];
		for (var idx = 0; idx < inCellCount; idx++) {
			results.push(Builder.node('td', {className: 'cell' + (inOptExtraCellClassName ? " " + inOptExtraCellClassName : "")}));
		}
		return results;
	},
	// Helper function that returns an array of n table rows with m table cell DOM nodes inside.
	__buildTableRowsWithTableCells: function(inRowCount, inCellsPerRowCount, inOptExtraCellClassName) {
		var results = [];
		for (var idx = 0; idx < inRowCount; idx++) {
			results.push(Builder.node('tr', {className: 'row'}, [
				this.__buildTableCells(1),
				this.__buildTableCells(inCellsPerRowCount, inOptExtraCellClassName)
			]));
		}
		return results;
	},
	filterTestResults: function(inMessage, inFilterObj, inKeyword) {
		var filter = ((inKeyword && inKeyword.filter ) || (inKeyword && inKeyword.keyword));
		var cells = this.$().querySelectorAll('tr.row');
		
		for (var i = 0; i < cells.length; i++) {
			var cell = cells[i];
			
			if( inKeyword && filter ) {
				if ( filter == 'passed' ) {
					if( !cell.hasClassName('has-failed') ) {
						cell.show();
					}
					else {
						cell.hide();
					}
				}
				else if ( filter == 'failed' ) {
					if( cell.hasClassName('has-failed') ) {
						cell.show();
					}
					else {
						cell.hide();
					}
				}
				else if ( filter == 'all' ) {
					cell.show();
				}
				else {
					if (cell.querySelector('.cell:not(.result)') && cell.querySelector('.cell:not(.result)').innerHTML != "" && cell.querySelector('.cell:not(.result)').innerHTML.toLowerCase().replace(/\s/g, '').indexOf(filter) != -1) {
						cell.show();
					}
					else {
						cell.hide();
					}
				}
			}
			else {
				cell.show();
			}
		}
		
		if (cells.length > 0 && this.$().querySelectorAll('tr.row .cell.fail').length == 0 && filter == "failed") {
			var previousPLaceholder = this.$().querySelectorAll(".xc-placeholder-content-view");
			if (!previousPLaceholder.length) {
				var placeholder = new CC.XcodeServer.PlaceholderView({
					mPlaceholderText: "_XC.Bot.Tests.NoFail".loc()
				});
				placeholder.forceRender();
				this.$('.bottom').appendChild(placeholder.$());
			}
		}
		else {
			if (this.$().querySelector(".xc-placeholder-content-view")) {
				this.$().querySelector(".xc-placeholder-content-view").remove();
			}
		}
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

// Base filter bar view class.

CC.XcodeServer.BotRunDetailFilterBarView = Class.create(CC.FilterBarView, {
	mClassName: 'xc-filter-bar-view xc-bot-run-detail-filter-bar-view',
	mFilterTitleFormatString: "_XC.BotRunDetailFilterBarView.Filters.%@.Title",
	mFilterTooltipFormatString: "_XC.BotRunDetailFilterBarView.Filters.%@.Tooltip",
	mAllowedFilters: [],
	mAllowedSortKeys: null,
	mFilter: 'all',
	initialize: function($super, inBotRunTags) {
		if ( inBotRunTags && inBotRunTags.length ) {
			this.mAllowedFilters = inBotRunTags;
		}
		$super();
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
//
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.
//



// Bot run test detail view

CC.XcodeServer.BOT_RUN_TEST_DETAIL_FAMILY_TAG = 'TargetDevice.ModelName';
CC.XcodeServer.BOT_RUN_TEST_DETAIL_OS_TAG = 'TargetDevice.OperatingSystemVersion';
CC.XcodeServer.BOT_RUN_TEST_DETAIL_PROCESSOR_TAG = 'TargetDevice.NativeArchitecture';
CC.XcodeServer.BOT_RUN_TEST_DETAIL_NAME_TAG = 'TargetDevice.Name';
CC.XcodeServer.BOT_RUN_TEST_DETAIL_MODEL_UTI = 'TargetDevice.ModelUTI';
CC.XcodeServer.BOT_RUN_TEST_DETAIL_MODEL_NAME = 'TargetDevice.ModelName';
CC.XcodeServer.BOT_RUN_TEST_DETAIL_MODEL_CODE = 'TargetDevice.ModelCode';
CC.XcodeServer.BOT_RUN_TEST_DETAIL_PLATFORM_IDENTIFIER_TAG = 'TargetDevice.Platform.Identifier';

CC.XcodeServer.BotRunTestDetailView = Class.create(CC.Mvc.View, {
	mClassName: 'xc-bot-run-test-detail-view-container',
	mDevices: {},
	mSortedTestNames: [],
	mFilterTags: [CC.XcodeServer.BOT_RUN_TEST_DETAIL_FAMILY_TAG, CC.XcodeServer.BOT_RUN_TEST_DETAIL_OS_TAG, CC.XcodeServer.BOT_RUN_TEST_DETAIL_PROCESSOR_TAG],
	mDevicesLength: 0,
	mBotRunEntity: null,
	mBotRunCommits: null,
	render: function() {
		
		var tabIndexHeader = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_TESTS_HEADER);
		var tabIndexDetails = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_TESTS_DETAILS);
		
		return Builder.node('div', [
			Builder.node('div', {'tabindex': tabIndexHeader, 'aria-label': "_XC.Accessibility.Label.Header".loc(), className: 'xc-bot-run-tests-detail-header'}),
			Builder.node('div', {'tabindex': tabIndexDetails, 'aria-label': "_XC.Accessibility.Label.Details".loc(), className: 'xc-bot-run-tests-detail-table-container'})
		]);
	},
	fetchTestResultsForBotRunEntityGUID: function(inBotRunEntity) {
		this.markAsLoading(true);
		this.mBotRunEntity = inBotRunEntity;
		var botRunGUID = (this.mBotRunEntity && this.mBotRunEntity.guid);
		var batch = [
			['XCGraphService', 'timeseriesDataForBotRunGUID:andCategory:', [botRunGUID, CC.XcodeServer.TIMESERIES_CATEGORY_TEST_SUMMARY]],
			['XCGraphService', 'timeseriesDataForBotRunGUID:andCategory:', [botRunGUID, CC.XcodeServer.TIMESERIES_CATEGORY_TEST_RUN]]
		];
		var callback = function(batchedResponse) {
			if (batchedResponse && batchedResponse.responses && batchedResponse.responses.length) {
				this.handleBotRunTestsResponse(batchedResponse);
			} else {
				this.handleUnexpectedError(batchedResponse);
			}
		};
		service_client().batchExecuteAsynchronously(batch, {}, callback.bind(this), this.handleUnexpectedError.bind(this));
	},
	handleBotRunTestsResponse: function(inBatchedResponse) {
		if (inBatchedResponse) {
			
			// Given the set of bot run test data, we need to group it by device.
			var summaryCounts = (inBatchedResponse.responses[0] && inBatchedResponse.responses[0].response);
			var botRunTests = (inBatchedResponse.responses[1] && inBatchedResponse.responses[1].response);
			
			// Build a structure of tests per device keyed by an identifier we will form, with a results dictionary
			// and passCount, failCount and integrationNumber keys. Results contains each of the test results we see
			// for a given device identifier.  We compute running totals for pass/fail for each device identifier.
			this.mDevices = CC.XcodeServer.deviceTestInformationForTimeseriesData(botRunTests);
			this.mDevicesLength = Object.keys(this.mDevices).length;
			this.mSortedTestNames = CC.XcodeServer.TimeseriesHelpers.sortedTestNames(botRunTests, true);
			
			// Draw the header for the test results we are drawing.
			var headerFragment = document.createDocumentFragment();
			var latestIntegrationHeaderView = new CC.XcodeServer.DetailViewLatestIntegrationHeaderView({
				mHeaderText: "_XC.BotRunDetailTable.Header.Title".loc(),
				mBotRunEntity: this.mBotRunEntity,
				tabIndex: accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_TESTS_INFO)
			});
			var left = Builder.node('div', {'className': 'left'}, [
				latestIntegrationHeaderView.forceRender()
			]);
			headerFragment.appendChild(left);
			
			// Update the test count summary banner.
			var passingTests = 0, failingTests = 0;
			var dictForBotRun = CC.XcodeServer.errorsAnalysisIssuesWarningsTestsDictForBotRun(this.mBotRunEntity);
			passingTests = (dictForBotRun && dictForBotRun.tests && dictForBotRun.tests.passed);
			failingTests = (dictForBotRun && dictForBotRun.tests && dictForBotRun.tests.failed);

			headerFragment.appendChild(CC.XcodeServer.summaryElementForTestsOnlyForBotRunSummary(passingTests, failingTests, undefined, undefined));
			headerFragment.appendChild(Builder.node('div', {'style': 'display: block; clear: both;'}));
			var headerElement = this.$('.xc-bot-run-tests-detail-header');
			headerElement.innerHTML = "";
			headerElement.appendChild(headerFragment);
			
			// XXX
			// TODO - put back the per-device overview UI (e.g. 2/2 iPhones Failed)
			
			// Draw a filter bar view below the header.
			var filterBarView = new CC.XcodeServer.BotRunDetailFilterBarView(this.mFilterTags);
			filterBarView.forceRender();
			globalNotificationCenter().subscribe(CC.FILTER_BAR_DID_CHANGE_FILTER, this.buildBotTestResultTableFromTagFilter.bind(this), filterBarView);
			globalNotificationCenter().subscribe(CC.FILTER_BAR_DID_CHANGE_KEYWORD, this.filterTestResults.bind(this), filterBarView);
			
			// Draw the test results table.
			var resultsElement = this.$('.xc-bot-run-tests-detail-table-container');
			var tabindexDeviceInfo = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_TESTS_DEVICE);
			var tableHeaderElement = Builder.node('div', {'tabindex': tabindexDeviceInfo, 'aria-label': "_XC.Accessibility.Label.DeviceInfo".loc(), className: 'top'}, [
				Builder.node('table', {'role': 'presentation', className: 'xc-bot-run-tests-detail-table'})
			]);
			var tabIndexBottom = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_TESTS_BOTTOM);
			var testResultsTableElement = Builder.node('div', {'tabindex': tabIndexBottom, 'aria-label': "_XC.Accessibility.Label.TestResultsList".loc(), className: 'xc-bot-run-tests-detail-table-bottom-container bottom'});
			var shadowLineNode = Builder.node('div', {className: 'shadowline'});
			var shadowNode = Builder.node('div', {className: 'shadow'});
			resultsElement.innerHTML = "";
			var fragment = document.createDocumentFragment();
			fragment.appendChild(filterBarView.$());
			fragment.appendChild(tableHeaderElement);
			fragment.appendChild(shadowLineNode);
			fragment.appendChild(shadowNode);
			fragment.appendChild(testResultsTableElement);
			resultsElement.appendChild(fragment);
			
			// Trigger a load of the data.
			filterBarView.setFilter(this.mFilterTags[0]);
			this.markAsLoading(false);
		}
		else {
			this.handleUnexpectedError(inBatchedResponse);
		}
	},
	getDeviceNameFromTag: function(inTag) {
		var deviceName = inTag.split(":").length && inTag.split(":")[1];
		deviceName.replace(/[^\w\s.-]/g,'');
		return deviceName;
	},
	buildBotTestResultTableFromTagFilter: function(inMessage, inFilterObj) {
		var selectedFilter = ( inFilterObj && inFilterObj.mFilter );
		var columns = this.mDevicesLength;
		var headerFirstRowHtml = "";
		var headerSecondRowHtml = "";
		var headerThirdRowHtml = "";
		var headerFourthRowHtml = "";
		var finalHeaderHtml = "";
		var tableBottomHtml = "";
		var maxTestsLength = 0;
		var devicesByTag = this.getDevicesByTag(selectedFilter);
		
		var tabIndexDevice = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_TESTS_DEVICE);
		
		// Table Header 
		headerFirstRowHtml += "<tr class='first-row' role='row'><td role='gridcell' class='cell' tabindex="+ tabIndexDevice +">"+"_XC.BotRunDetailTable.Title.%@".fmt(selectedFilter).loc()+"</td>"
		headerSecondRowHtml += "<tr class='models-row' role='row'><td role='gridcell' class='cell' tabindex="+ tabIndexDevice +">Model</td>";
		headerThirdRowHtml += "<tr class='tests-row' role='row'><td role='gridcell' class='cell'><div class='title' tabindex="+ tabIndexDevice +">Tests</div></td>";
		headerFourthRowHtml += "<tr class='failed-row' role='row'><td role='gridcell' class='cell' tabindex="+ tabIndexDevice +">Failed</td>";
		
		// Let's print
		for (var key in devicesByTag ) {			
			headerFirstRowHtml += "<td class='cell result' role='gridcell'  tabindex="+ tabIndexDevice +" colspan='"+devicesByTag[key].length+"'>"+key.escapeHTML()+"</td>";
			
			for (var e = 0; e < devicesByTag[key].length; e++ ) {
				var synthesizedDeviceIdentifier = devicesByTag[key][e];
				
				if ( this.mDevices[synthesizedDeviceIdentifier] ) {
					var device = this.mDevices[synthesizedDeviceIdentifier];
					
					if ( device.Tests.length > maxTestsLength ) {
						maxTestsLength = device.Tests.length;
					}
					
					var pieView = new CC.XcodeServer.UnitTestPieView(device.Success + device.Fail, device.Fail, 28, 28);
					var pieViewCanvasDataUrl = pieView.toDataUrl();
					
					headerSecondRowHtml += "<td role='gridcell' class='cell result'>";
					headerSecondRowHtml += "<div class='xc-bot-test-detail-view-device-detail-container'>";
					
					if (CC.XcodeServer.getDeviceFamily(device) != 'unknown') {
						var deviceIconUTI = device[CC.XcodeServer.BOT_RUN_TEST_DETAIL_MODEL_UTI];
						var deviceIconPlatformIdentifier = device[CC.XcodeServer.BOT_RUN_TEST_DETAIL_PLATFORM_IDENTIFIER_TAG];
						var deviceIconURL = CC.XcodeServer.getDeviceImageUrlRetinaAutoResize(deviceIconUTI, deviceIconPlatformIdentifier, 30);
						headerSecondRowHtml += "<img role='presentation' class='xc-bot-test-detail-view-device-image' src='" + deviceIconURL + "'>";
					}
					else {
						headerSecondRowHtml += "<img role='presentation' class='xc-bot-test-detail-view-device-image' src=''>";
					}
					var deviceName = (device[CC.XcodeServer.BOT_RUN_TEST_DETAIL_NAME_TAG].escapeHTML() || '');
					var deviceOs = (device[CC.XcodeServer.BOT_RUN_TEST_DETAIL_OS_TAG].escapeHTML() || '');
					var deviceProc = (device[CC.XcodeServer.BOT_RUN_TEST_DETAIL_PROCESSOR_TAG].escapeHTML() || '');
					
					headerSecondRowHtml += "<div class='device-name' tabindex="+ tabIndexDevice +">"+deviceName+"</div></br>";
					headerSecondRowHtml += "<div class='device-details' tabindex="+ tabIndexDevice +">"+deviceOs+" / "+deviceProc+"</div>";
					headerSecondRowHtml += "</div>";
					headerSecondRowHtml += "</td>";
					headerThirdRowHtml += "<td class='header-test-results cell result'>";
					headerThirdRowHtml += "<div role='presentation' class='xc-unit-test-pie-view'><img role='presentation' src='"+pieViewCanvasDataUrl+"'/></div>";
					headerThirdRowHtml += "<div class='header-test-results-count' tabindex="+ tabIndexDevice +" aria-label='" + (device.Success+device.Fail) + " " + "_XC.Accessibility.Label.TestSucceed".loc() +"'>"+(device.Success+device.Fail)+"</div>";
					headerThirdRowHtml += "</td>";
					headerFourthRowHtml += "<td class='cell result' tabindex="+ tabIndexDevice +" aria-label='" + "_XC.Accessibility.Label.Fail".loc() + "'>"+device.Fail+"</td>";
				}
			}
		}
		headerFirstRowHtml += "</tr>";
		headerSecondRowHtml += "</tr>";
		headerThirdRowHtml += "</tr>";
		headerFourthRowHtml += "</tr>";
		
		// Table 
		tableBottomHtml += "<table role='presentation' class='xc-bot-run-tests-detail-table bottom-table'>";
		var tabIndexTestResultsList = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_TESTS_BOTTOM);
				
		if ( maxTestsLength > 0 ) { 
			for (var f = 0; f < maxTestsLength; f++ ) {
				var hasTestTitle = false;
				tableBottomHtml += "<tr>";
				for ( var key in this.mDevices ) {
					if ( this.mDevices[key] && this.mDevices[key].Tests ) {
						var test = this.mDevices[key].Tests[f];
						if (!hasTestTitle) {
							var sortedTestName = ((this.mSortedTestNames[f] && this.mSortedTestNames[f].escapeHTML()) || '');
							tableBottomHtml += "<td class='cell' role='gridcell' tabindex="+ tabIndexTestResultsList +">"+sortedTestName+"</td>";
							hasTestTitle = true;
						}
						if (test) {
							tableBottomHtml += "<td class='cell result' role='gridcell' tabindex="+ tabIndexTestResultsList +" title="+( test.value ? "_XC.Accessibility.Label.Success".loc() : "_XC.Accessibility.Label.Fail".loc() )+"><div class='test_result "+( test.value ? 'success' : 'fail' )+"'></div></td>";
						} else {
							tableBottomHtml += "<td class='cell result' role='gridcell' tabindex="+ tabIndexTestResultsList +"><div class='test_result'></div></td>";
						}
					}
				}
							
				tableBottomHtml += "</tr>";
			}
			
			tableBottomHtml += "</table>";
		}
		else {
			headerFirstRowHtml = headerSecondRowHtml = headerThirdRowHtml = headerFourthRowHtml = tableBottomHtml = "";
			headerFirstRowHtml = "<tr><td class='no-test-found'>"+"_XC.BotRunDetailTable.NoTestsFound".loc()+"</td></tr>";
		}
		
		
		finalHeaderHtml = headerFirstRowHtml + headerSecondRowHtml + headerThirdRowHtml + headerFourthRowHtml;
		var resultsElement = this.$('table.xc-bot-run-tests-detail-table').parentNode;
		resultsElement.innerHTML = "";
		resultsElement.innerHTML = "<table class='xc-bot-run-tests-detail-table'>"+finalHeaderHtml+"</table>";
		
		var testResultsTableElement = this.$('div.xc-bot-run-tests-detail-table-bottom-container');
		testResultsTableElement.innerHTML = "";
		testResultsTableElement.innerHTML = tableBottomHtml;
	},
	getDevicesByTag: function(inSelectedFilter) {
		var devicesByTag = {};
		for ( var key in this.mDevices ) {
			var device = this.mDevices[key];
			
			if ( devicesByTag[device[inSelectedFilter]] == undefined ) {
				devicesByTag[device[inSelectedFilter]] = [];
			}
			
			devicesByTag[device[inSelectedFilter]].push(key);
		}
		return devicesByTag;
	},
	_buildTestSummaryByDeviceFamily: function() {
		var devicesByFamily = this.getDevicesByTag(CC.XcodeServer.BOT_RUN_TEST_DETAIL_FAMILY_TAG);
		var fragment = document.createDocumentFragment();
		
		for ( var family in devicesByFamily ) {
			var deviceNames = devicesByFamily[family];
			var devicesLength = deviceNames.length;
			var successfulDevices = 0;
			
			for ( var g = 0; g < devicesLength; g++ ) {
				var deviceName = deviceNames[g];
				var device = this.mDevices[deviceName];
				
				if ( device ) {
					var total = device.Success + device.Fail;
					if ( device.Success == total ) {
						successfulDevices++;
					}
				}
			}
			
			if ( successfulDevices == devicesLength ) {
				if ( devicesLength == 1 ) {
					var deviceStatusString = "_XC.BotRunHeaderView.TestStatus.Succeeded.%@.Singular.Count".fmt(family).loc();
				}
				else {
					var deviceStatusString = "_XC.BotRunHeaderView.TestStatus.Succeeded.%@.Plural.Count".fmt(family).loc();
				}
				
				var newRow = Builder.node('div', {className: 'devices-tested'}, successfulDevices+"/"+devicesLength+" "+deviceStatusString);
			}
			else {
				var failedDevices = devicesLength - successfulDevices;
				if ( devicesLength == 1 ) {
					var deviceStatusString = "_XC.BotRunHeaderView.TestStatus.Failed.%@.Singular.Count".fmt(family).loc();
				}
				else {
					var deviceStatusString = "_XC.BotRunHeaderView.TestStatus.Failed.%@.Plural.Count".fmt(family).loc();
				}
				var newRow = Builder.node('div', {className: 'devices-tested'}, failedDevices+"/"+devicesLength+" "+deviceStatusString);
			}
			fragment.appendChild(newRow);
		}
		return fragment;
	},
	handleUnexpectedError: function(inBatchedResponse) {
		this.markAsLoading(false);
		notifier().printErrorMessage("_XC.Bot.Tests.Results.Unexpected.Error".loc());
		if (inBatchedResponse) logger().error("Error occurred fetching timeseries information: %@", inBatchedResponse);
	},
	filterTestResults: function(inMessage, inFilterObj, inKeyword) {
		var filter = ( inKeyword.keyword || '' );
		var rows = this.$().querySelectorAll('.xc-bot-run-tests-detail-table.bottom-table .cell:not(.result)');
		
		if ( filter && filter != "" ) {
			filter = filter.toLowerCase().replace(/\s/g, '');

			for ( var h = 0; h < rows.length; h++ ) {
				var row = rows[h];
				var testName = row.innerHTML;
				if( testName.toLowerCase().replace(/\s/g, '').indexOf(filter) != -1 ) {
					row.parentNode.show();
				}
				else {
					row.parentNode.hide();
				}
			}
		}
		else {
			for ( var h = 0; h < rows.length; h++ ) {
				var row = rows[h];
				row.parentNode.show();
			}
		}
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
//
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.





CC.XcodeServer.BotTestsContentView = Class.create(CC.XcodeServer.BotDetailContentView, {
	mClassNames: ['xc-bot-detail-content-view', 'xc-bot-tests-content-view'],
	mFilterBarView: null,
	mBotTestDetailView: null,
	mBotRunTestDetailView: null,
	initialize: function($super) {
		$super();
		this.mBotTestDetailView = new CC.XcodeServer.BotTestDetailView();
		this.addSubview(this.mBotTestDetailView);
		this.mBotRunTestDetailView = new CC.XcodeServer.BotRunTestDetailView();
		this.addSubview(this.mBotRunTestDetailView);
	},
	configureForFocusedBotEntityAndLatestTerminalBotRunEntity: function(inBotEntity, inOptLatestTerminalBotRunEntity) {
		this.mBotTestDetailView.setVisible(true);
		this.mBotRunTestDetailView.setVisible(false);
		var entityGUID = (inBotEntity && inBotEntity.guid);
		this.mBotTestDetailView.fetchInitialTestResultsHistoryForBotEntityGUIDInRange(entityGUID, [0, 10]);
	},
	configureForFocusedBotRunEntity: function(inBotRunEntity) {
		this.mBotTestDetailView.setVisible(false);
		this.mBotRunTestDetailView.setVisible(true);
		this.mBotRunTestDetailView.fetchTestResultsForBotRunEntityGUID(inBotRunEntity);
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
//
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

// Bot commit history content view.

CC.XcodeServer.BotCommitHistoryContentView = Class.create(CC.XcodeServer.BotDetailContentView, {
	mClassNames: ['xc-bot-detail-content-view', 'xc-bot-commit-history-content-view', 'selectable'],
	configureForFocusedBotEntityAndLatestTerminalBotRunEntity: function(inBotEntity, inOptLatestTerminalBotRunEntity) {
		this.handleGotBotRunEntity(inOptLatestTerminalBotRunEntity);
		this.mIsBotEntityView = true;
	},
	configureForFocusedBotRunEntity: function(inBotRunEntity) {
		this.handleGotBotRunEntity(inBotRunEntity);
		this.mIsBotEntityView = false;
	},
	handleGotBotRunEntity: function(inEntity) {
		if (!inEntity) return;
		this.markAsLoading(true);
		this.getCommitHistoryForBotRunGUID(inEntity.guid);
	},
	getCommitHistoryForBotRunGUID: function(inBotRunGUID) {
		xcservice().commitHistoryForBotRunGUID(inBotRunGUID, this.handleGotCommitHistoryForBotRunGUID.bind(this), this.handleGotCommitHistoryForBotRunGUID.bind(this));
	},
	handleGotCommitHistoryForBotRunGUID: function(inCommitHistory) {
		var collapsedCommits = this.__collapseCommitsAndOrderByTime(inCommitHistory);
		if (!collapsedCommits || collapsedCommits.length == 0) {
			this.showEmptyMessage();
			return;
		}
		var lastSeenGroupingHeaderText;
		var fragment = document.createDocumentFragment();
		for (var idx = 0; idx < collapsedCommits.length; idx++) {
			var commit = collapsedCommits[idx];
			var currentCommitDayDelta = globalLocalizationManager().calculateDayDeltaForDateFromToday(commit.time);
			var groupingHeaderText;
			if (currentCommitDayDelta == 0) {
				groupingHeaderText = "_XC.Grouping.Header.Today".loc();
			} else if (currentCommitDayDelta == -1) {
				groupingHeaderText = "_XC.Grouping.Header.Yesterday".loc();
			} else if (currentCommitDayDelta > -7) {
				groupingHeaderText = "_XC.Grouping.Header.ThisWeek".loc();
			} else if (currentCommitDayDelta > -14) {
				groupingHeaderText = "_XC.Grouping.Header.LastWeek".loc();
			} else {
				groupingHeaderText = "_XC.Grouping.Header.Other".loc();
			}
			if (groupingHeaderText && (!lastSeenGroupingHeaderText || groupingHeaderText != lastSeenGroupingHeaderText)) {
				fragment.appendChild(Builder.node('div', {className: 'xc-bot-commit-history-group-header'}, [
					Builder.node('h1', groupingHeaderText)
				]));
			}
			lastSeenGroupingHeaderText = groupingHeaderText;
			var commitElement = this.__renderCommit(commit);
			if (commitElement) fragment.appendChild(commitElement);
		}
		this.removeAllSubviews();
		this.$().innerHTML = "";
		this.$().appendChild(fragment);
		this.markAsLoading(false);
	},
	// Renders and returns an individual commit element.
	__renderCommit: function(inCommit) {
		if (!inCommit) return;
		var commitExtendedAttributes = (inCommit.extendedAttributes || {});
		var modifiedFiles = $H(commitExtendedAttributes.changedFiles || {});
		var modifiedFilesLength = modifiedFiles.keys().length;
		var modifiedFilesString = (modifiedFilesLength == 1) ? "_XC.Bot.CommitHistory.Files.Modified.Singular".loc(modifiedFilesLength) : "_XC.Bot.CommitHistory.Files.Modified.Plural".loc(modifiedFilesLength);
		var elem = Builder.node('div', {className: 'xc-bot-commit-history-item'}, [
			Builder.node('div', {className: 'right'}, [
				Builder.node('span', {className: 'revision'}, inCommit.shortName),
				Builder.node('span', {className: 'modified'}, modifiedFilesString),
			]),
			Builder.node('div', {className: 'left'}, [
				Builder.node('div', {className: 'firstcolumn'}, [
					Builder.node('div', {className: 'icon none'}, [
						Builder.node('img')
					])
				]),
				Builder.node('div', {className: 'secondcolumn'}, [
					Builder.node('h2', {className: 'committer'}, inCommit.authorName || inCommit.authorEmail),
					Builder.node('h3', {className: 'timestamp'}, globalLocalizationManager().shortLocalizedDateTime(inCommit.time)),
					Builder.node('div', {className: 'message'})
				])
			])
		]);
		
		var commitMessage = inCommit.message.escapeHTML();
		commitMessage = commitMessage.replace(/\n/g, "<br/>");
		elem.querySelector(".message").innerHTML = commitMessage;
		
		if (modifiedFilesLength == 0) {
			elem.down('span.modified').hide();
		}
		
		if (inCommit.authorEmail) {
			var authorImageURL = '/xcs/avatar/' + inCommit.authorEmail;
			var imgEl = elem.down('.icon img');
			imgEl.addEventListener('load', function(){
				this.parentNode.removeClassName('none');
			}, false);
			imgEl.src = authorImageURL;
		}
		
		return elem;
	},
	__renderGroupingHeaderForTimestamp: function(inTimestamp) {
		var dayDelta = globalLocalizationManager().calculateDayDeltaForDateFromToday(inTimestamp);
		var groupingHeaderText = "_XC.Grouping.Header.Other".loc();
		if (dayDelta == 0) {
			groupingHeaderText = "_XC.Grouping.Header.Today".loc();
		} else if (dayDelta == -1) {
			groupingHeaderText = "_XC.Grouping.Header.Yesterday".loc();
		} else if (dayDelta > -7) {
			groupingHeaderText = "_XC.Grouping.Header.ThisWeek".loc();
		} else if (dayDelta > -14) {
			groupingHeaderText = "_XC.Grouping.Header.LastWeek".loc();
		}
		return Builder.node('div', {className: 'xc-bot-commit-history-group-header'}, [
			Builder.node('h1', groupingHeaderText)
		]);
	},
	// Collapses a set of multi-repo commits into a single array of commits ordered by time desc.  Accepts a hash of commit arrays
	// keyed by repository URI, and returns a flattened array of commit objects.
	__collapseCommitsAndOrderByTime: function(inCommitsKeyedByURI) {
		var commitHistory = $H(inCommitsKeyedByURI || {});
		var result = new Array();
		// Concat each of the commit lists together into a single array.
		commitHistory.each(function(pair) {
			if (pair.value != undefined) {
				result = result.concat(pair.value);
			}
		});
		// Sort and return the array.
		result.sort(function(first, second) {
			return (first.time > second.time ? -1 : (first.time < second.time ? 1 : 0));
		});
		return result;
	},
	showEmptyMessage: function() {
		if (this.mIsBotEntityView) {
			this.showPlaceholderMessage("_XC.Bot.CommitHistory.Bot.Empty.Placeholder".loc());
		}
		else {
			this.showPlaceholderMessage("_XC.Bot.CommitHistory.BotRun.Empty.Placeholder".loc());
		}
	},
	showErrorMessage: function() {
		this.showPlaceholderMessage("_XC.Bot.CommitHistory.Unexpected.Error".loc());
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.






CC.XcodeServer.BotLogsContentView = Class.create(CC.XcodeServer.BotDetailContentView, {
	mClassNames: ['xc-bot-detail-content-view', 'xc-bot-logs-content-view'],
	mDisplayedEntityGUID: null,
	initialize: function($super) {
		$super.apply(null, Array.prototype.slice.call(arguments, 1));
		// Start with a no logs found placeholder (which will be hidden while this view is loading).
		this.addSubview(new CC.XcodeServer.PlaceholderView({
			mPlaceholderText: "_XC.Bot.Logs.Empty.Placeholder".loc()
		}));
	},
	configureForFocusedBotEntityAndLatestTerminalBotRunEntity: function(inBotEntity, inOptLatestTerminalBotRunEntity) {
		this.handleUpdatedBotRunEntity(inOptLatestTerminalBotRunEntity);
		this.mIsBotEntityView = true;
	},
	configureForFocusedBotRunEntity: function(inBotRunEntity) {
		this.handleUpdatedBotRunEntity(inBotRunEntity);
		this.mIsBotEntityView = false;
	},
	handleGotFirstBotRunEntity: function(inEntity) {
		if (!inEntity) return;
		return this.handleUpdatedBotRunEntity(inEntity);
	},
	handleUpdatedBotRunEntity: function(inEntity) {
		if (!inEntity) return this.showLogFilePlaceholder();
		var buildOutputGUID = inEntity.buildOutputGUID;
		var xcsbuilddOutputGUID = inEntity.xcsbuilddOutputGUID;
		var scmOutputLogMap = $H(inEntity.scmOutputLogMap || {});
		// The scm output GUID hash is keyed by scm GUID.
		var scmOutputGUIDs = scmOutputLogMap.values();
		if (!(buildOutputGUID || xcsbuilddOutputGUID || (scmOutputGUIDs && scmOutputGUIDs.length > 0))) {
			if (inEntity.logsPruned) {
				this.showPrunedLogFilePlaceholder();
			} else {
				this.showLogFilePlaceholder();
			}
			return;
		}
		// Flush out the current state of the view.
		this.removeAllSubviews();
		this.$().innerHTML = "";

		// Show a stacked view of issues for this run.
		this.addSubview(new CC.XcodeServer.MiniHeaderView({
			mHeaderText:"_XC.Bot.Logs.IntegrationDetails.Title".loc()
		}));
		this.addSubview(new CC.XcodeServer.IssuesStackView({
			mBotRunEntity: inEntity
		}));
		
		// Show scm logs for this run.
		this.addSubview(new CC.XcodeServer.MiniHeaderView({
			mHeaderText:"_XC.Bot.Logs.SCM.Title".loc()
		}));
		if (scmOutputGUIDs && scmOutputGUIDs.length > 0) {
			$A(scmOutputGUIDs).each(function(scmLogFileGUID) {
				if (scmLogFileGUID) {
					var logFileElement = Builder.node('div', {className: 'log selectable', title: ""});
					this.$().appendChild(logFileElement);
					this.showLogFileForEntityGUID(scmLogFileGUID, logFileElement);
				}
			}, this);
		} else {
			var placeholder = new CC.XcodeServer.PlaceholderView({
				mPlaceholderText: "_XC.Bot.Logs.SCM.Empty.Placeholder".loc()
			});
			placeholder.setStyle(CC.XcodeServer.PLACEHOLDER_VIEW_STYLE_SMALL);
			this.addSubview(placeholder);
		}
		// Show build logs for this run.
		this.addSubview(new CC.XcodeServer.MiniHeaderView({
			mHeaderText:"_XC.Bot.Logs.Build.Title".loc()
		}));
		if (buildOutputGUID) {
			var logFileElement = Builder.node('div', {className: 'log selectable', title: ""});
			this.$().appendChild(logFileElement);
			this.showLogFileForEntityGUID(buildOutputGUID, logFileElement);
		} else {
			var placeholder = new CC.XcodeServer.PlaceholderView({
				mPlaceholderText: "_XC.Bot.Logs.Build.Empty.Placeholder".loc()
			});
			placeholder.setStyle(CC.XcodeServer.PLACEHOLDER_VIEW_STYLE_SMALL);
			this.addSubview(placeholder);
		}
		// Show the raw xcsbuildd log for this run.
		if (xcsbuilddOutputGUID) {
			this.addSubview(new CC.XcodeServer.MiniHeaderView({
				mHeaderText:"_XC.Bot.Logs.BuildAgent.Title".loc()
			}));
			var logFileElement = Builder.node('div', {className: 'log selectable', title: ""});
			this.$().appendChild(logFileElement);
			this.showLogFileForEntityGUID(xcsbuilddOutputGUID, logFileElement);
		}
	},
	// Fetches the text content of a log file for a specified log file GUID.
	showLogFileForEntityGUID: function(inLogFileGUID, inElementToUpdate) {
		return new Ajax.Request('/xcs/fileview/%@'.fmt(inLogFileGUID), {
			method: 'GET',
			onSuccess: function(transport) {
				inElementToUpdate.innerHTML = (transport.responseText || "").escapeHTML();
				inElementToUpdate.title = "";
			}.bind(this),
			onFailure: this.showLogFilePlaceholder.bind(this)
		});
	},
	showLogFilePlaceholder: function() {
		var placeholderString;
		if (this.mIsBotEntityView) {
			placeholderString = "_XC.Bot.Logs.Log.Bot.Empty.Placeholder".loc();
		} else {
			placeholderString = "_XC.Bot.Logs.Log.BotRun.Empty.Placeholder".loc();
		}
		this.showPlaceholderMessage(placeholderString);
	},
	showPrunedLogFilePlaceholder: function() {
		this.showPlaceholderMessage("_XC.Bot.Logs.Log.Pruned".loc());
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

CC.XcodeServer.XCS_RELEASED_BUILD_TAG = "_internal:xcs-build-released";

CC.XcodeServer.ReleasedBuildToggle = Class.create(CC.BaseEntityToggle, {
	mOwnerGUID: null,
	initialize: function($super, inOwnerGUID, inTags) {
		var tabIndexArchive = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_ARCHIVES);
		var element = document.createElement('div');
		element.className = 'xc-released-build-toggle';
		element.writeAttribute('tabindex', tabIndexArchive);
		element.writeAttribute('role', 'checkbox');
		this.mOwnerGUID = inOwnerGUID;
		$super(element);
		if ( inTags && inTags.indexOf(CC.XcodeServer.XCS_RELEASED_BUILD_TAG) > -1 ){
			this.setIsSelected(true, false);
		}
	},
	persistIsSelected: function() {
		if (this.getIsSelected()) {
			server_proxy().addTagForOwner(CC.XcodeServer.XCS_RELEASED_BUILD_TAG, this.mOwnerGUID);
		} else {
			server_proxy().deleteTagForOwner(CC.XcodeServer.XCS_RELEASED_BUILD_TAG, this.mOwnerGUID);
		}
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
//
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.




CC.XcodeServer.PaginatingArchivesListView = Class.create(CC.PaginatingSearchQueryListView, {
	mEntityTypes: ['com.apple.entity.BotRun'],
	mSearchFields: ['guid', 'tinyID', 'archiveGUID', 'productGUID', 'productsPruned', 'createTime', 'updateTime', 'tags', 'integration'],
	mOwnerGUID: CC.meta('x-apple-entity-guid'),
	mClassNames: ['xc-paginating-archives-list-view'],
	mPlaceholderString: "_XC.Bot.Archives.Placeholder.NoArchivesFound".loc(),
	// Use create time as the default sort.
	buildQuery: function($super, inStartIndex, inHowMany) {
		var query = $super(inStartIndex, inHowMany);
		query = server_proxy().searchQueryUpdateSort(query, '-createTime');
		return query;
	},
	reset: function($super) {
		$super();
		this.showPaginationLink(false);
	},
	// We override the renderResults methods so we can fetch the file information for each archive. We
	// can't do this using subFields on the original query because archiveGUID is not a field for the
	// base entity type. This is a fairly big hack of our paginating list view.
	renderResults: function($super, inResults, inOptAppendAtTop) {
	    if (!inResults || inResults.length == 0) {
			return $super(inResults, inOptAppendAtTop);
		}
		// Because we load the archives list in two requests, we need to force the paginating list view
		// superclass to hide the pagination link until we're ready to show it.
		var hasExistingItems = this.$().down('.xc-paginating-archives-list-view-item');
		if (!hasExistingItems) {
			this.showPaginationLink(false);
			this.$().down('.cc-paginating-list-view-content').addClassName('loading');
			this.setIsPaginating(true);
		}
		// Fetch the file entities backing the archive GUIDs for each of the bot runs we found.
		var callback = function(results) {			
			var fragment = document.createDocumentFragment();

			for (var resultIdx = 0; resultIdx < results.length; resultIdx++) {
				var result = results[resultIdx];
				var entity = entitiesByGUIDs[getOwnerGuidFromEntityParentGuids(result, 2)];
				if ( entity && entity['archive'] == result.guid ) {
					entity['archive'] = result;
				}
				if ( entity && entity['product'] == result.guid ) {
					entity['product'] = result;
				}
			}

			for (var idx = 0; idx < inResults.length; idx++) {
				var result = inResults[idx];
				var botRunGuid = result.guid;
				if ( entitiesByGUIDs[botRunGuid] ){
					var archiveRow = entitiesByGUIDs[botRunGuid];
					if (archiveRow) fragment.appendChild(this.renderResultItem(botRunGuid, archiveRow));
				}
			}

			var rootElement = this.$().down('.cc-paginating-list-view-content');
			rootElement.appendChild(fragment);

			// Not all integration entities will have a product/archive so rely on the pagination state
			// to decide if we should show the pagination link or the empty list placeholder text.
			if (this.mPaginationState && this.mPaginationState.hasMoreResults) {
				this.showPaginationLink(true);
			} else if (this.mPaginationState && this.mPaginationState.total == 0) {
				this.setIsEmpty(true);
			}
			this.setIsPaginating(false);
			globalNotificationCenter().publish(CC.Routes.NOTIFICATION_ROUTES_SHOULD_UPDATE);
		}
		var archiveGUIDs = [], result;
		var entitiesByGUIDs = {};

		for (var idx = 0; idx < inResults.length; idx++) {
			result = inResults[idx];
			if (result && (result.archiveGUID || result.productGUID) ) {
				entitiesByGUIDs[result.guid] = {
					archive: result.archiveGUID || undefined,
					product: result.productGUID || undefined,
					tags: $A(result.tags),
					integration: result.integration
				};

				if ( result.archiveGUID ) {
					archiveGUIDs.push(result.archiveGUID);
				}
				if ( result.productGUID ) {
					archiveGUIDs.push(result.productGUID);
				}
			}
		}

		if ( archiveGUIDs.length == 0 ) {
			this.showNoArchivesPlaceholder((inResults.length == 1 && inResults[0].productsPruned));
		}
		else {
			this.hideNoArchivesPlaceholder();
		}

		server_proxy().entitiesForGUIDs(archiveGUIDs, callback.bind(this), this.defaultPaginationErrback.bind(this));
	},
	renderResultItem: function(inBotRunGUID, inArchiveRow) {
		var toggle = new CC.XcodeServer.ReleasedBuildToggle(inBotRunGUID, inArchiveRow.tags);
		var blessedToggle = toggle.element;

		var responderId = 'xc-paginating-archives-list-view-item-%@'.fmt(inBotRunGUID);
		globalEventDelegate().registerDomResponderForEventByIdentifer('click', responderId, this.deleteResultItem.bind(this));

		var tabIndexArchive = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_ARCHIVES);
		var resultItem = Builder.node('div', {className: 'xc-paginating-archives-list-view-item', 'data-bot-run-guid': inBotRunGUID}, [
			blessedToggle,
			Builder.node('span', {className: 'delete-icon', 'id': responderId}),
			Builder.node('span', {'tabindex': tabIndexArchive, 'role': 'gridcell', className: 'integration absolute selectable'}, inArchiveRow.integration),
		]);

		if (inArchiveRow.product) {
			resultItem.appendChild(this.renderResultItemRow(inArchiveRow.product, 'product'));
		}
		if (inArchiveRow.archive) {
			resultItem.appendChild(this.renderResultItemRow(inArchiveRow.archive, 'archive'));
		}

		return resultItem;
	},
	renderResultItemRow: function(inResultItem, inKind){
		var validKinds = ['archive', 'product'];
		if ( inKind && validKinds.indexOf(inKind) === -1 ) return;

		var filename = ((inResultItem && inResultItem.longName || inResultItem.shortName) || "_XC.Bot.Archives.Unknown.Filename".loc());
		var timestamp = globalLocalizationManager().shortLocalizedDate(inResultItem.updateTime);
		var filesize = globalLocalizationManager().localizedFileSize((inResultItem && inResultItem.size) || 0);
		var hrefBase = (inKind == 'product') ? "/xcs/install/%@" : "/xcode/files/download/%@";
		var href = hrefBase.fmt(inResultItem.guid);

		var rowDictionary = {
			product: {
				className: 'product',
				downloadTitle: "_XC.Bot.Archives.List.Product".loc()
			},
			archive: {
				className: 'archive',
				downloadTitle: "_XC.Bot.Archives.List.Archive".loc()
			}
		}
		
		var tabIndexArchive = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_ARCHIVES);
		
		var downloadLinkNode = Builder.node('a', {'tabindex': tabIndexArchive, 'role': 'link', 'href': href, 'className': 'download'}, rowDictionary[inKind].downloadTitle);
		Event.observe(downloadLinkNode, 'click', function(){
			globalNotificationCenter().publish(CC.ActivityStream.NOTIFICATION_ACTIVITY_STREAM_SHOULD_RECONNECT);
		});
		
		return Builder.node('div', {'role': 'presentation', className: 'xc-paginating-archives-list-view-item-row ' + rowDictionary[inKind].className}, [
			Builder.node('div', {'role': 'presentation', className: 'blessed'}),
			Builder.node('span', {'role': 'presentation', className: 'type'}, [
				Builder.node('div', {'role': 'presentation', className: 'archive-icon'}),
				downloadLinkNode,
			]),
			Builder.node('span', {'tabindex': tabIndexArchive, 'role': 'gridcell', className: 'integration'}),
			Builder.node('span', {'tabindex': tabIndexArchive, 'role': 'gridcell', className: 'modified selectable'}, timestamp),
			Builder.node('span', {'tabindex': tabIndexArchive, 'role': 'gridcell', className: 'name selectable'}, filename),
			Builder.node('span', {'tabindex': tabIndexArchive, 'role': 'button', 'aria-label': "_XC.Accessibility.Button.Delete".loc(), className: 'delete'}),
			Builder.node('span', {'tabindex': tabIndexArchive, 'role': 'gridcell', className: 'filesize selectable'}, filesize)
		]);
	},
	deleteResultItem: function(inEvent) {
		var resultItem = Event.findElement(inEvent, ".xc-paginating-archives-list-view-item");
		// Get the GUID of the bot run GUID we will prune product/archive data for.
		var botRunGUID = resultItem.getAttribute('data-bot-run-guid');
		// Draw a confirmation dialog.
		dialogManager().drawDialog('delete_bot_run_archive_dialog', ["_XC.Bot.Archives.List.Archive.DeleteConfirmationMessage".loc()], "_XC.Bot.Archives.List.DeleteButton".loc(), false, "_XC.Bot.Archives.List.Archive.DeleteDialogTitle".loc());
		dialogManager().show('delete_bot_run_archive_dialog', null, function() {
			smokey().showOverElement(resultItem);
			resultItem.hide();
			// Actually prune the archive and product.
			xcservice().pruneArchiveAndProductForBotRunWithGUID(botRunGUID, function() {
				resultItem.remove();
			}, function() {
				notifier().printErrorMessage("_XC.Bot.Archives.List.Archive.DeleteFailedMessage".loc());
				resultItem.show();
			});
		});
	},
	showNoArchivesPlaceholder: function(inOptPruned) {
		var fragment = document.createDocumentFragment();
		var rootElement = this.$().down('.cc-paginating-list-view-content');
		var placeHolder = new CC.XcodeServer.PlaceholderView({
			mPlaceholderText: (inOptPruned) ? '_XC.Bot.Archives.Pruned'.loc() : this.mPlaceholderString
		});
		placeHolder = placeHolder.forceRender();
		fragment.appendChild(placeHolder);
		rootElement.appendChild(fragment);
		var controls = $$('.archive-list-wrapper');
		for ( var i = 0; i < controls.length; i++ ) {
			controls[i].addClassName('no-archive');
		}
	},
	hideNoArchivesPlaceholder: function() {
		var placeHolder = this.$().down('.cc-paginating-list-view-content .xc-placeholder-content-view');
		if (placeHolder) { placeHolder.remove(); }
		var controls = $$('.archive-list-wrapper');
		for ( var i = 0; i < controls.length; i++ ) {
			controls[i].removeClassName('no-archive');
		}
	}
});

CC.XcodeServer.BotArchivesContentView = Class.create(CC.XcodeServer.BotDetailContentView, {
	mClassName: 'xc-bot-detail-content-view xc-bot-archives-content-view',
	mPaginatingArchivesListView: null,
	render: function() {
		return Builder.node('div', [
			Builder.node('div', {className: "archive-list-wrapper"}, [
				Builder.node('div', {className: 'controls'}, [
					Builder.node('span', {'tabindex': '-1', className: 'blessed'}),
					Builder.node('span', {'tabindex': '-1', className: 'type'}, "_XC.Bot.Archives.List.Header.Filetype".loc()),
					Builder.node('span', {'tabindex': '-1', className: 'integration'}, "_XC.Bot.Archives.List.Header.IntegrationNumber".loc()),
					Builder.node('span', {'tabindex': '-1', className: 'modified'}, "_XC.Bot.Archives.List.Header.LastModified".loc()),
					Builder.node('span', {'tabindex': '-1', className: 'name'}, "_XC.Bot.Archives.List.Header.Filename".loc()),
					Builder.node('span', {'tabindex': '-1', className: 'delete'}),
					Builder.node('span', {'tabindex': '-1', className: 'filesize'}, "_XC.Bot.Archives.List.Header.Filesize".loc())
				])
			])
		]);
	},
	// We load the paginating archives list view on-demand since it will paginate as soon as it is added
	// to the DOM.  We only want to paginate if the view is actually visible.
	initializePaginatingArchivesListView: function() {
		this.mPaginatingArchivesListView = new CC.XcodeServer.PaginatingArchivesListView();
		this.addSubview(this.mPaginatingArchivesListView, '.archive-list-wrapper');
	},
	__configure: function() {
		if (!this.mPaginatingArchivesListView) {
			this.initializePaginatingArchivesListView();
		} 
		this.mPaginatingArchivesListView.reset();
	},
	configureForFocusedBotEntityAndLatestTerminalBotRunEntity: function(inBotEntity, inOptLatestTerminalBotRunEntity) {
		this.__configure();
	},
	configureForFocusedBotRunEntity: function(inBotRunEntity) {
		this.__configure();
	},
	handleUpdatedBotRunEntity: function(inBotRunEntity) {
		if ( CC.XcodeServer.isTerminalBotStatus(inBotRunEntity.status) ) {
			var archiveItems = this.$().querySelectorAll('div.xc-paginating-archives-list-view-item');
			var inBotRunEntityGUID = (inBotRunEntity && inBotRunEntity.guid);
			var archiveFound = false;
			for (var i = 0; i < archiveItems.length; i++) {
				var archiveItem = archiveItems[i];
				if( archiveItem.getAttribute('data-bot-run-guid') == inBotRunEntityGUID ) {
					archiveFound = true;
				}
			}
			
			if (!archiveFound) {
				this.mPaginatingArchivesListView.reset();
			}
		}
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
//
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.












CC.XcodeServer.NOTIFICATION_BOT_DETAIL_VIEW_DID_SHOW_CONTENT_VIEW = 'BOT_DETAIL_VIEW_DID_SHOW_CONTENT_VIEW';
CC.XcodeServer.NOTIFICATION_BOT_DETAIL_VIEW_DID_HIDE_CONTENT_VIEW = 'BOT_DETAIL_VIEW_DID_HIDE_CONTENT_VIEW';

CC.XcodeServer.BotDetailPlaceholderContentView = Class.create(CC.XcodeServer.BotDetailContentView, {
	mClassName: 'xc-bot-detail-content-view xc-bot-detail-placeholder-content-view'
});

// Bot detail view.

CC.XcodeServer.BotDetailView = Class.create(CC.Mvc.View, {
	mBotRunSidebarView: null,
	mSummaryContentView: null,
	mTestsContentView: null,
	mLogsContentView: null,
	mArchivesContentView: null,
	mContentView: null,
	mActivityFetchEntityTimer: null,
	mClassName: 'xc-bot-detail-view',
	// Keep track of whether we are displaying a bot and the active bot/run GUIDs so we know if we need to
	// react to activity updates for a bot.
	mBotEntityIsFocused: null,
	mCurrentlyFocusedBotRunEntityGUID: null,
	initialize: function($super, inIntegrationNumber, inTabName) {
		$super.apply(null, Array.prototype.slice.call(arguments, 1));
		// Build out the header view.
		this.createHeaderView(inIntegrationNumber, inTabName);
		// Build out the sidebar view.
		this.createSidebarView(inIntegrationNumber, inTabName);
		this.mBotRunSidebarView.paginate();
		// Build out each of the content views we will display.
		this.createContentViews();
		// Listen for notifications on the bot run activity stream.
		globalNotificationCenter().subscribe(CC.XcodeServer.NOTIFICATION_BOT_RUN_ACTIVITY_STREAM_UPDATE, this.handleBotRunActivityStreamUpdate.bind(this));
	},
	handleBotRunActivityStreamUpdate: function(inMessage, inObject, inOptExtras) {
		// If this view is currently hidden, ignore the notification.
		if (!this.mIsVisible) return;
		var botRunGUID = (inOptExtras && inOptExtras.activity && inOptExtras.activity.entityGUID);
		if (!botRunGUID) return;
		var parentGUIDs = (inOptExtras && inOptExtras.activity && inOptExtras.activity.parentGUIDs);
		var entityGUID = CC.meta('x-apple-entity-guid');
		if (parentGUIDs.indexOf(entityGUID) == -1) return;
		server_proxy().entityForGUIDWithOptions(botRunGUID, undefined, this.handleUpdatedBotRunEntity.bind(this), Prototype.emptyFunction);
	},
	// Private function acting as a callback for the activity stream callback.  Update the sidebar before
	// updating the active sub-detail view.
	handleUpdatedBotRunEntity: function(inBotRunEntity) {
		if (!inBotRunEntity) return;
		// Notify the bot run sidebar.
		this.mBotRunSidebarView.handleUpdatedBotRunEntity(inBotRunEntity);
		// Notify the active content view too if the bot run is in a terminal state (13907037). Bot detail
		// views don't show live bot status, so avoid any overhead notifying them until a bot run is done.
		if (this.mActiveContentView) {
			// Only notify the active content view if we are displaying the bot entity itself, or the bot
			// run for which we received the activity notification.
			if (CC.XcodeServer.isTerminalBotStatus(inBotRunEntity.status)) {
				this.mPlaceholderContentView.setVisible(false);
				if (this.mBotEntityIsFocused || (inBotRunEntity.guid == this.mCurrentlyFocusedBotRunEntityGUID)) {
					this.mActiveContentView.handleUpdatedBotRunEntity(inBotRunEntity);
				}
			}
		}
		// If we don't have an active content view, we must be displaying the placeholder view (14700024). Retrigger the
		// route to force a redraw since it's likely that the first bot run entity was not available when the callback to
		// the start integration button was clicked.  This shouldn't get us in an infinite loop because when we trigger
		// the route, we're sure that at least one bot run entity exists for that route (we're currently handling an activity
		// stream update to a bot run for that bot).
		else {
			var currentURL = window.location.pathname;
			globalRouteHandler().routeURL(currentURL, undefined, true, false, true, undefined);
			return;
		}
		// Notify the header bar.
		this.mBotHeaderView.handleActivityStreamUpdate(inBotRunEntity);
	},
	// Called by the route to configure the view for a bot or a bot run.
	showBot: function(inBotEntity, inOptLatestTerminalBotRunEntity) {
		this.mBotEntityIsFocused = true;
		this.mCurrentlyFocusedBotRunEntityGUID = (inOptLatestTerminalBotRunEntity && inOptLatestTerminalBotRunEntity.guid);
		if (this.mActiveContentView) {
			this.mActiveContentView.configureForFocusedBotEntityAndLatestTerminalBotRunEntity(inBotEntity, inOptLatestTerminalBotRunEntity);
			if (!inOptLatestTerminalBotRunEntity || (inOptLatestTerminalBotRunEntity && CC.XcodeServer.isTerminalBotStatus(inOptLatestTerminalBotRunEntity.status) == false)) {
				this.showNotYetFinishedPlaceholderView();
			}
		}
	},
	showBotRun: function(inBotRunEntity) {
		this.mBotEntityIsFocused = false;
		this.mCurrentlyFocusedBotRunEntityGUID = (inBotRunEntity && inBotRunEntity.guid);
		if (this.mActiveContentView) {
			this.mActiveContentView.configureForFocusedBotRunEntity(inBotRunEntity);
			if (CC.XcodeServer.isTerminalBotStatus(inBotRunEntity.status) == false) {
				this.showNotYetFinishedPlaceholderView();
			}
		}
	},
	showErrorMessage: function() {
		this.markAsLoading(false);
		this.addSubview(new CC.XcodeServer.PlaceholderView({
			mPlaceholderText: "_XC.Bot.Error.DisplayGeneric".loc()
		}));
		return false;
	},
	showRunSidebar: function(inShouldShow) {
		this.mBotRunSidebarView.setVisible(inShouldShow);
	},
	getContentViews: function() {
		return [this.mPlaceholderContentView, this.mSummaryContentView, this.mTestsContentView, this.mCommitHistoryContentView, this.mLogsContentView, this.mArchivesContentView];
	},
	showContentView: function(inContentView) {
		var contentViews = this.getContentViews();
		var contentView;
		for (var idx = 0; idx < contentViews.length; idx++) {
			contentView = contentViews[idx];
			var shouldBeVisible = (inContentView == contentView);
			contentView.setVisible(shouldBeVisible);
			if (shouldBeVisible) {
				globalNotificationCenter().publish(CC.XcodeServer.NOTIFICATION_BOT_DETAIL_VIEW_DID_SHOW_CONTENT_VIEW, contentView);
			} else if (this.mActiveContentView == contentView) {
				globalNotificationCenter().publish(CC.XcodeServer.NOTIFICATION_BOT_DETAIL_VIEW_DID_HIDE_CONTENT_VIEW, contentView);
			}
			if (inContentView == contentView) this.mActiveContentView = contentView;
		}
		this.mPlaceholderContentView.setVisible(false);
	},
	createHeaderView: function(inIntegrationNumber, inTabName) {
		// Create the header.
		var metaTagType = ((CC.meta('x-apple-entity-type') == "com.apple.entity.Bot") ? 'entity' : 'owner');
		var fakeBotEntity = new CC.EntityTypes.BotEntity({
			'type': 'com.apple.entity.Bot',
			'tinyID': CC.meta('x-apple-%@-tinyID'.fmt(metaTagType)),
			'guid': CC.meta('x-apple-%@-guid'.fmt(metaTagType)),
			'shortName': CC.meta('x-apple-%@-shortName'.fmt(metaTagType)),
			'longName': CC.meta('x-apple-%@-longName'.fmt(metaTagType))
		});
		// Create a header view.
		this.mBotHeaderView = new CC.XcodeServer.BotHeaderView(
			{
				mBotEntity: fakeBotEntity
			},
			inIntegrationNumber, 
			inTabName
		);
		this.addSubview(this.mBotHeaderView, '#content-primary', true);
		CC.XcodeServer.setSelectedBotHeaderLinkByGUID('links/summary');
	},
	createSidebarView: function(inIntegrationNumber, inTabName) {
		// Add a paginating run sidebar we can hide and show selectively.
		this.mBotRunSidebarView = new CC.XcodeServer.BotRunSidebarView(inIntegrationNumber, inTabName);
		this.addSubview(this.mBotRunSidebarView, '#content-primary', true);
		this.mBotRunSidebarView.setVisible(false);
	},
	createContentViews: function() {
		// Build out the content panes.
		this.mPlaceholderContentView = new CC.XcodeServer.BotDetailPlaceholderContentView();
		var loggedIn = (CC.meta('x-apple-user-logged-in') == "true");
		this.mPlaceholderView = new CC.XcodeServer.PlaceholderView();
		this.mPlaceholderContentView.addSubview(this.mPlaceholderView);
		this.addSubview(this.mPlaceholderContentView);
		this.mPlaceholderContentView.setVisible(false);
		// Deliberately leave the placeholder view visible (since it will be hidden behind the loading spinner).
		this.mSummaryContentView = new CC.XcodeServer.BotSummaryContentView();
		this.addSubview(this.mSummaryContentView);
		this.mSummaryContentView.setVisible(false);
		this.mTestsContentView = new CC.XcodeServer.BotTestsContentView();
		this.addSubview(this.mTestsContentView);
		this.mTestsContentView.setVisible(false);
		this.mCommitHistoryContentView = new CC.XcodeServer.BotCommitHistoryContentView();
		this.addSubview(this.mCommitHistoryContentView);
		this.mCommitHistoryContentView.setVisible(false);
		this.mLogsContentView = new CC.XcodeServer.BotLogsContentView();
		this.addSubview(this.mLogsContentView);
		this.mLogsContentView.setVisible(false);
		this.mArchivesContentView = new CC.XcodeServer.BotArchivesContentView();
		this.addSubview(this.mArchivesContentView);
		this.mArchivesContentView.setVisible(false);
	},
	// Placeholder views appear ABOVE the current content view (so we can prepare the actual content view in the
	// background and hide the placeholder when it is ready, or when we receive activity updates for a terminal
	// integration).
	showPlaceholderViewWithString: function(inString) {
		this.showRunSidebar(true);
		this.mPlaceholderView.updatePlaceholderText(inString || "");
		this.mPlaceholderContentView.setVisible(true);
	},
	showNotYetFinishedPlaceholderView: function() {
		this.showPlaceholderViewWithString("_XC.BotRun.NotYetCompleted.Placeholder".loc());
	},
	showNeverRunPlaceholderView: function() {
		this.showRunSidebar(false);
		var loggedIn = (CC.meta('x-apple-user-logged-in') == "true");
		this.mPlaceholderView.updatePlaceholderText(loggedIn ? "_XC.Bot.NotYetRun.Placeholder".loc() : "_XC.Bot.NotYetRun.Placeholder.Unauthenticated".loc());
		this.mPlaceholderContentView.setVisible(true);
	},
	// Sets the actively displayed content view by name, e.g. commits.
	showContentViewWithName: function(inName, inIntegrationNumber) {
		var tabName = inName;
		if (!tabName) tabName = 'summary';
		this.showRunSidebar(true);
		switch (tabName) {
			case 'summary':
				this.showContentView(this.mSummaryContentView);
				break;
			case 'tests':
				this.showContentView(this.mTestsContentView);
				break;
			case 'commits':
				this.showContentView(this.mCommitHistoryContentView);
				break;
			case 'logs':
				this.showContentView(this.mLogsContentView);
				break;
			case 'archives':
				this.showContentView(this.mArchivesContentView);
				break;
			default:
				this.showRunSidebar(false);
				break;
		}
		this.mBotHeaderView.markLinkItemAsSelectedWithGUID('links/%@'.fmt(tabName));
		// Select the sidebar entry if we got passed an integration number.
		if (inIntegrationNumber != undefined) {
			this.mBotRunSidebarView.markItemAsSelected(inIntegrationNumber);
		}
		else {
			this.mBotRunSidebarView.markItemAsSelected();
		}
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

CC.XcodeServer.BotListStatusCardView = Class.create(CC.Mvc.View, {
	mClassNames: ['xc-bot-list-status-card-view'],
	mTitle: '',
	mEmptyLabel: '',
	mActionLabel: '',
	mAlternateActionLabel: null,
	mContentTitle: '',
	mContentSubtitle: '',
	tabIndex: null,
	render: function() {
		var integrateButtonNode = CC.XcodeServer.buttonElementWithAction(this.tabIndex, this.mActionLabel, this.handleActionButtonClick.bind(this));
		
		return Builder.node('div', [
			Builder.node('div', {'role': 'presentation', className: 'header'}, [
				Builder.node('div', {'role': 'presentation', className: 'title'}, this.mTitle)
			]),
			Builder.node('div', {className: 'emptyDisplay'}, [
				Builder.node('div', {className: 'statusLabel'}, this.mEmptyLabel)
			]),
			Builder.node('div', {className: 'normalDisplay'}, [
				Builder.node('div', {className: 'info'}, [
					Builder.node('h1', {className: 'contentTitle'}, this.mContentTitle),
					Builder.node('h2', {className: 'contentSubtitle'}, this.mContentSubtitle),
					integrateButtonNode
				])
			])
		]);
	},
	handleActionButtonClick: function(e) {
		// overridden by subclasses
	},
	setTitle: function(theTitle) {
		this.mContentTitle = theTitle;
		if (this.rendered())
			this.mParentElement.down('.contentTitle').textContent = this.mContentTitle;
	},
	setSubtitle: function(theSubtitle) {
		this.mContentSubtitle = theSubtitle;
		if (this.rendered())
			this.mParentElement.down('.contentSubtitle').textContent = this.mContentSubtitle;
	}
});

CC.XcodeServer.BotListLastIntegrationStatusCardView = Class.create(CC.XcodeServer.BotListStatusCardView, {
	mClassNames: ['xc-bot-list-status-card-view', 'xc-bot-list-last-integration-status-card-view'],
	mTitle: '_XC.BotList.StatusCard.Title.LatestIntegration'.loc(),
	mEmptyLabel: '_XC.BotList.StatusCard.Empty.LatestIntegration'.loc(),
	mActionLabel: '_XC.BotList.StatusCard.Action.LatestIntegration'.loc(),
	mBotRunEntity: null,
	mPreviousBotRunEntity: null,
	mSummaryElement: null,
	mLoaded: false,
	tabIndex: accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_BOT_SUMMARY_TOP_LAST_INTEGRATION_VIEW_SUMMARY),
	render: function($super) {
		var el = $super();
		
		var summary = null;
		if (!this.mLoaded)
			el.addClassName('loading');
		
		if (this.mBotRunEntity == null)
		{
			if (this.mLoaded)
				el.addClassName('empty');
			summary = CC.XcodeServer.summaryElementForBotRunSummary(0, 0, 0);
		}
		else
			summary = CC.XcodeServer.summaryElementForBotRunEntity(this.mBotRunEntity, this.mPreviousBotRunEntity);
		
		this.mSummaryElement = summary;
		el.down('.normalDisplay').appendChild(summary);
		
		return el;
	},
	initialize: function($super) {
		$super();
		
		// react to status changes for bot runs we are displaying.
		globalNotificationCenter().subscribe(CC.XcodeServer.NOTIFICATION_BOT_RUN_ACTIVITY_STREAM_UPDATE, this.handleBotRunActivityStreamUpdate.bind(this));
		
		// fetch the last integration that completed
		this.reconfigure();
	},
	makeAccessible: function() {
		var tabIndex = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_BOT_SUMMARY_TOP_LAST_INTEGRATION);
		var lastIntegration = this.mParentElement;		
		lastIntegration.writeAttribute('aria-label', "_XC.Accessibility.Label.LastIntegration".loc());
		lastIntegration.writeAttribute('tabindex', tabIndex);
	},
	reconfigure: function() {
		xcservice().getLatestTerminalBotRunAndPredecessor(function(runs){
			if (!runs || runs.length == 0) {
				this.mParentElement.removeClassName('loading').addClassName('empty');
				return;
			}
			
			if (this.mBotRunEntity && this.mBotRunEntity.guid == runs[0].guid)
				return;
			
			this.setTitle(runs[0].extendedAttributes.botSnapshot.longName);
			this.setSubtitle('_XC.BotList.StatusCard.Countdown.Integration.Label'.loc(runs[0].integration));
			this.configure(runs[0], (runs.length == 2) ? runs[1] : null);
		}.bind(this));
	},
	configure: function(botRun, previousBotRun) {
		// update state
		this.mBotRunEntity = botRun;
		this.mPreviousBotRunEntity = previousBotRun;
		this.mLoaded = true;
		
		// perform changes if necessary
		if (this.rendered())
		{
			this.mParentElement.removeClassName('loading');
			
			if (this.mBotRunEntity == null)
			{
				this.mParentElement.addClassName('empty');
				return;
			}
			else
				this.mParentElement.removeClassName('empty');
			
			CC.XcodeServer.updateSummaryElementWithBotRuns(this.mSummaryElement, this.mBotRunEntity, this.mPreviousBotRunEntity);
		}
	},
	handleActionButtonClick: function(e) {
		globalRouteHandler().routeURL('/xcode/bots/' + this.mBotRunEntity.extendedAttributes.botSnapshot.tinyID + '/summary');
	},
	handleBotRunActivityStreamUpdate: function(inMessage, inObject, inOptExtras) {
		var activity = inOptExtras.activity;
		if (activity.action == 'com.apple.activity.EntityUpdated' && activity.entityType == 'com.apple.entity.BotRun')
			this.reconfigure();
	}
});

CC.XcodeServer.BotListNextIntegrationStatusCardView = Class.create(CC.XcodeServer.BotListStatusCardView, {
	mClassNames: ['xc-bot-list-status-card-view', 'xc-bot-list-next-integration-status-card-view'],
	mTitle: '_XC.BotList.StatusCard.Title.NextIntegration'.loc(),
	mEmptyLabel: '_XC.BotList.StatusCard.Empty.NextIntegration'.loc(),
	mActionLabel: '_XC.BotList.StatusCard.Action.NextIntegration'.loc(),
	mAlternateActionLabel: '_XC.BotList.StatusCard.AlternateAction.NextIntegration'.loc(),
	mBotGUID: null,
	mFireDate: null,
	mLoaded: false,
	mUpdateTimer: null,
	mServerTimeShift: 0,
	mTimeSyncTimer: null,
	mActivityQueue: null,
	tabIndex: accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_BOT_SUMMARY_TOP_NEXT_INTEGRATION_INTEGRATE_NOW),
	render: function($super) {
		var el = $super();
		
		if (!this.mLoaded)
			el.addClassName('loading');
		else if (this.mBotGUID == null)
			el.addClassName('empty');
		
		// build the clock
		var days = '00';
		var hours = '00';
		var minutes = '00';
		if (this.mFireDate)
		{
			var timeToGo = this.mFireDate.getTime() - Date.now() - this.mServerTimeShift;
			if (timeToGo < 0)
				timeToGo = 0;
			
			var dayCount = Math.floor(timeToGo / (1000 * 60 * 60 * 24));
			timeToGo -= dayCount * (1000 * 60 * 60 * 24);
			
			var hourCount = Math.floor(timeToGo / (1000 * 60 * 60));
			timeToGo -= hourCount * (1000 * 60 * 60);
			
			var minuteCount = Math.floor(timeToGo / (1000 * 60));
			timeToGo -= minuteCount * (1000 * 60);
			
			if (Math.floor(timeToGo / 1000) > 0)
			{
				if (++minuteCount == 60)
				{
					minuteCount = 0;
					if (++hourCount == 24)
					{
						hourCount = 0;
						dayCount++;
					}
				}
			}
			
			days = ((dayCount < 10) ? '0' : '') + dayCount;
			hours = ((hourCount < 10) ? '0' : '') + hourCount;
			minutes = ((minuteCount < 10) ? '0' : '') + minuteCount;
		}
		
		var clock = Builder.node('div', {className: 'clock'}, [
			Builder.node('div', {className: 'digits days'}, [
				Builder.node('div', {className: 'number'}, days),
				Builder.node('div', {className: 'label'}, '_XC.BotList.StatusCard.Countdown.Days.Label'.loc())
			]),
			Builder.node('div', {className: 'digits hours'}, [
				Builder.node('div', {className: 'number'}, hours),
				Builder.node('div', {className: 'label'}, '_XC.BotList.StatusCard.Countdown.Hours.Label'.loc())
			]),
			Builder.node('div', {className: 'digits minutes'}, [
				Builder.node('div', {className: 'number'}, minutes),
				Builder.node('div', {className: 'label'}, '_XC.BotList.StatusCard.Countdown.Minutes.Label'.loc())
			])
		]);
		
		el.down('.normalDisplay').appendChild(clock);
		
		// build our status views
		var pending = Builder.node('div', {className: 'pending'}, [
			Builder.node('div', {className: 'spinner'}),
			Builder.node('div', {className: 'message'})
		]);
		
		el.down('.normalDisplay').appendChild(pending);
		
		return el;
	},
	initialize: function($super) {
		$super();
		
		// react to status changes for bot runs we are displaying.
		this.mActivityQueue = new CC.XcodeServer.ActivityQueue(true);
		this.mActivityQueue.subscribe(this.handleBotRunActivityStreamUpdate.bind(this));
		globalNotificationCenter().subscribe(CC.XcodeServer.NOTIFICATION_BOT_RUN_ACTIVITY_STREAM_UPDATE, this.mActivityQueue.push.bind(this.mActivityQueue));
		
		// check clock drift from server
		this.timeSync(function(){
			// load the next scheduled run
			this.reconfigure();
		}.bind(this));
	},
	makeAccessible: function() {
		var tabIndex = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_BOT_SUMMARY_TOP_NEXT_INTEGRATION);
		var nextIntegration = this.mParentElement;		
		nextIntegration.writeAttribute('aria-label', "_XC.Accessibility.Label.NextIntegration".loc());
		nextIntegration.writeAttribute('tabindex', tabIndex);
	},	
	reconfigure: function(inOptContinuation) {
		this.mBotGUID = null;
		this.mFireDate = null;
		
		xcservice().nextScheduledBotRun(function(nextRun){
			if (nextRun){
				this.setTitle(nextRun.botName);
				this.setSubtitle('_XC.BotList.StatusCard.Countdown.Integration.Label'.loc(nextRun.integration));
				this.configure(nextRun.botGUID, nextRun.scheduledTime);
			}
			else {
				this.mParentElement.removeClassName('loading').removeClassName('interstitial').addClassName('empty');
			}
			
			if (inOptContinuation)
				inOptContinuation.ready();
		}.bind(this));
	},
	configure: function(botGUID, integrationDate) {
		// update state
		this.mBotGUID = botGUID;
		this.mFireDate = integrationDate;
		this.mLoaded = true;
		
		// perform changes if necessary
		if (this.rendered())
		{
			this.mParentElement.removeClassName('loading');
			this.mParentElement.removeClassName('interstitial');
			
			if (this.mBotGUID == null)
			{
				this.mParentElement.addClassName('empty');
				return;
			}
			else {
				var tabIndex = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_INTEGRATE);
				var integrateButton = new CC.XcodeServer.IntegrateButtonView(this.mActionLabel, this.mAlternateActionLabel, this.handleActionButtonClick.bind(this), this.handleActionButtonAlternateClick.bind(this), this.mBotGUID, true, tabIndex);
				integrateButton.forceRender();
				var integrateButtonNode = integrateButton.$();

				this.mParentElement.querySelector('.xc-translucent-button').remove();
				this.mParentElement.querySelector('.info').appendChild(integrateButtonNode);
				this.mParentElement.removeClassName('empty');
			}
			
			// update the clock
			this.updateClock();
		}
	},
	handleActionButtonClick: function() {
		var botGUID = this.mBotGUID;
		xcservice().startBotWithGUID(botGUID, function() {
			globalNotificationCenter().publish(CC.XcodeServer.NOTIFICATION_BOT_RUN_DID_START, this, {'guid': botGUID});
		}.bind(this), function() {
			notifier().printErrorMessage("_XC.Bot.Control.Run.Error".loc());
		});
	},
	handleActionButtonAlternateClick: function() {
		var botGUID = this.mBotGUID;
		xcservice().cleanAndStartBotWithGUID(botGUID, function() {
			globalNotificationCenter().publish(CC.XcodeServer.NOTIFICATION_BOT_RUN_DID_START, this, {'guid': botGUID});
		}.bind(this), function() {
			notifier().printErrorMessage("_XC.Bot.Control.Run.Error".loc());
		});
	},
	handleBotRunActivityStreamUpdate: function(inActivity, inContinuation) {
		if (inActivity.entityType == 'com.apple.entity.BotRun')
			this.reconfigure(inContinuation);
	},
	updateClock: function() {
		if (this.mUpdateTimer)
		{
			clearTimeout(this.mUpdateTimer);
			this.mUpdateTimer = null;
		}
		
		if (this.mFireDate)
		{
			var days = '00';
			var hours = '00';
			var minutes = '00';
			
			var nextTick = 0;
			var timeToGo = this.mFireDate.getTime() - Date.now() - this.mServerTimeShift;
			if (timeToGo < 0)
				timeToGo = 0;
			
			var dayCount = Math.floor(timeToGo / (1000 * 60 * 60 * 24));
			timeToGo -= dayCount * (1000 * 60 * 60 * 24);
		
			var hourCount = Math.floor(timeToGo / (1000 * 60 * 60));
			timeToGo -= hourCount * (1000 * 60 * 60);
		
			var minuteCount = Math.floor(timeToGo / (1000 * 60));
			timeToGo -= minuteCount * (1000 * 60);
			
			if (Math.floor(timeToGo / 1000) > 0)
			{
				if (++minuteCount == 60)
				{
					minuteCount = 0;
					if (++hourCount == 24)
					{
						hourCount = 0;
						dayCount++;
					}
				}
			}
			
			nextTick = (timeToGo > 0) ? timeToGo : 1000 * 60;
		
			days = ((dayCount < 10) ? '0' : '') + dayCount;
			hours = ((hourCount < 10) ? '0' : '') + hourCount;
			minutes = ((minuteCount < 10) ? '0' : '') + minuteCount;
			
			if (timeToGo == 0)
				this.enterInterstitialMode('_XC.BotList.StatusCard.Countdown.Interstitial.Queued'.loc());
			else
			{
				// schedule a clock update
				this.mUpdateTimer = setTimeout(function(){
					this.mUpdateTimer = null;
					this.updateClock();
				}.bind(this), nextTick);
			}
			
			this.mParentElement.down('.clock .days .number').textContent = days;
			this.mParentElement.down('.clock .hours .number').textContent = hours;
			this.mParentElement.down('.clock .minutes .number').textContent = minutes;
		}
		else
		{
			this.enterInterstitialMode('_XC.BotList.StatusCard.Countdown.Interstitial.Queued'.loc());
		}
	},
	enterInterstitialMode: function(message) {
		if (this.rendered())
		{
			this.mParentElement.addClassName('interstitial');
			this.mParentElement.down('.pending .message').textContent = message;
		}
	},
	timeSync: function(inOptCallback) {
		server_proxy().currentServerTime(function(result){
			if (!result)
				this.mServerTimeShift = 0;
			else
				this.mServerTimeShift = Date.now() - result.getTime();
			
			if (inOptCallback)
				inOptCallback(result);
			
			// schedule another sync in 5 minutes
			if (this.mTimeSyncTimer)
				clearTimeout(this.mTimeSyncTimer);
			this.mTimeSyncTimer = setTimeout(this.timeSync.bind(this), 5 * 60 * 1000);
		}.bind(this));
	}
});

CC.XcodeServer.BotListProductsStatusCardView = Class.create(CC.XcodeServer.BotListStatusCardView, {
	mClassNames: ['xc-bot-list-status-card-view', 'xc-bot-list-products-status-card-view'],
	mTitle: '_XC.BotList.StatusCard.Title.Products'.loc(),
	mEmptyLabel: '_XC.BotList.StatusCard.Empty.Products'.loc(),
	mActionLabel: '_XC.BotList.StatusCard.Action.Products'.loc(),
	mLoaded: false,
	mTinyID: null,
	mArchiveEntity: null,
	mProductEntity: null,
	tabIndex: accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_BOT_SUMMARY_TOP_DOWNLOADS_VIEW_ARCHIVES),
	render: function($super) {
		var el = $super();
		
		if (!this.mLoaded)
			el.addClassName('loading');
		else if (this.mTinyID == null)
			el.addClassName('empty');
		
		var tabIndexArchiveLink = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_BOT_SUMMARY_TOP_DOWNLOADS_ARCHIVE_LINK);
		
		var products = Builder.node('div', {'tabindex': '-1', className: 'products'}, [
			Builder.node('div', {'tabindex': '-1', className: 'download product' + ((this.mProductEntity) ? '' : ' none')}, [
				Builder.node('div', {'tabindex': '-1', className: 'link'}, [
					Builder.node('a', {'tabindex': tabIndexArchiveLink, 'role': 'menuitem', href: this.productLink()}, '_XC.Bot.Product'.loc())
				]),
				Builder.node('div', {'tabindex': '-1', className: 'details'}, [
					Builder.node('div', {'tabindex': '-1', className: 'createdDate'},
						(this.mProductEntity) ?
						'_XC.BotList.StatusCard.Products.Created.Label'.loc(globalLocalizationManager().shortLocalizedDate(this.mProductEntity.createTime)) :
						''
					),
					Builder.node('div', {className: 'filesize'},
						(this.mProductEntity) ?
						globalLocalizationManager().localizedFileSize(this.mProductEntity.size) :
						''
					)
				])
			]),
			Builder.node('div', {'tabindex': '-1', className: 'download archive' + ((this.mArchiveEntity) ? '' : ' none')}, [
				Builder.node('div', {'tabindex': '-1', className: 'link'}, [
					Builder.node('a', {'tabindex': tabIndexArchiveLink, 'role': 'menuitem', href: this.archiveLink()}, '_XC.Bot.Archive'.loc())
				]),
				Builder.node('div', {'tabindex': '-1', className: 'details'}, [
					Builder.node('div', {'tabindex': '-1', className: 'createdDate'},
						(this.mArchiveEntity) ?
						'_XC.BotList.StatusCard.Products.Created.Label'.loc(globalLocalizationManager().shortLocalizedDate(this.mArchiveEntity.createTime)) :
						''
					),
					Builder.node('div', {'tabindex': '-1', className: 'filesize'},
						(this.mArchiveEntity) ?
						globalLocalizationManager().localizedFileSize(this.mArchiveEntity.size) :
						''
					)
				])
			])
		]);
		
		el.down('.normalDisplay').appendChild(products);
		
		return el;
	},
	initialize: function($super) {
		$super();
		
		// react to status changes for bot runs we are displaying.
		globalNotificationCenter().subscribe(CC.XcodeServer.NOTIFICATION_BOT_RUN_ACTIVITY_STREAM_UPDATE, this.handleBotRunActivityStreamUpdate.bind(this));
		
		// load the latest product-bearing run
		this.reconfigure();
	},
	makeAccessible: function() {
		var tabIndex = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_BOT_SUMMARY_TOP_DOWNLOADS);
		var downloadIntegration = this.mParentElement;		
		downloadIntegration.writeAttribute('aria-label', "_XC.Accessibility.Label.LatestDownloads".loc());
		downloadIntegration.writeAttribute('tabindex', tabIndex);
	},
	reconfigure: function() {
		xcservice().getLatestBotRunWithArchive(function(run){
			if (!run || !run.archiveGUID)
				this.configure(null);
			
			if (run && run.archiveGUID) {
				var guids = [run.archiveGUID];
				if (run.productGUID)
					guids.push(run.productGUID);
			
				server_proxy().entitiesForGUIDs(guids, function(results){
					this.setTitle(run.extendedAttributes.botSnapshot.longName);
					this.setSubtitle('_XC.BotList.StatusCard.Countdown.Integration.Label'.loc(run.integration));
					this.configure(run.extendedAttributes.botSnapshot.tinyID, (results.length > 0) ? results[0] : null, (results.length > 1) ? results[1] : null);
				}.bind(this));
			}
		}.bind(this));
	},
	configure: function(tinyID, archiveEntity, productEntity) {
		// update state
		this.mTinyID = tinyID;
		this.mArchiveEntity = archiveEntity;
		this.mProductEntity = productEntity;
		this.mLoaded = true;
		
		// perform changes if necessary
		if (this.rendered())
		{
			this.mParentElement.removeClassName('loading');
			
			if (this.mTinyID == null)
			{
				this.mParentElement.addClassName('empty');
				return;
			}
			else
				this.mParentElement.removeClassName('empty');
			
			// update the links/sizes
			this.mParentElement.down('.download.archive .link a').href = this.archiveLink();
			this.mParentElement.down('.download.product .link a').href = this.productLink();
			
			if (this.mArchiveEntity)
			{
				this.mParentElement.down('.download.archive').removeClassName('none');
				this.mParentElement.down('.download.archive .details .createdDate').textContent = '_XC.BotList.StatusCard.Products.Created.Label'.loc(globalLocalizationManager().shortLocalizedDate(this.mArchiveEntity.createTime));
				this.mParentElement.down('.download.archive .details .filesize').textContent = globalLocalizationManager().localizedFileSize(this.mArchiveEntity.size);
			}
			else
				this.mParentElement.down('.download.archive').addClassName('none');
			
			if (this.mProductEntity)
			{
				this.mParentElement.down('.download.product').removeClassName('none');
				this.mParentElement.down('.download.product .details .createdDate').textContent = '_XC.BotList.StatusCard.Products.Created.Label'.loc(globalLocalizationManager().shortLocalizedDate(this.mProductEntity.createTime));
				this.mParentElement.down('.download.product .details .filesize').textContent = globalLocalizationManager().localizedFileSize(this.mProductEntity.size);
			}
			else
				this.mParentElement.down('.download.product').addClassName('none');
		}
	},
	handleActionButtonClick: function(e) {
		if (this.mTinyID)
			globalRouteHandler().routeURL('/xcode/bots/' + this.mTinyID + '/archives');
	},
	handleBotRunActivityStreamUpdate: function(inMessage, inObject, inOptExtras) {
		var activity = inOptExtras.activity;
		if (activity.action == 'com.apple.activity.EntityUpdated' && activity.entityType == 'com.apple.entity.BotRun')
			this.reconfigure();
	},
	archiveLink: function() {
		if (this.mArchiveEntity)
			return '/xcode/files/download/' + this.mArchiveEntity.guid;
		return '#';
	},
	productLink: function() {
		if (this.mProductEntity)
			return '/xcs/install/' + this.mProductEntity.guid;
		return '#';
	}
});

CC.XcodeServer.BotListStatusView = Class.create(CC.Mvc.View, {
	mClassName: 'xc-bot-list-status-view',
	initialize: function($super) {
		$super();
		this.addSubview(new CC.XcodeServer.BotListLastIntegrationStatusCardView());
		this.addSubview(new CC.XcodeServer.BotListNextIntegrationStatusCardView());
		this.addSubview(new CC.XcodeServer.BotListProductsStatusCardView());
	},
	makeAccessible: function() {
		var tabIndex = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_BOT_SUMMARY_TOP);
		var listStatusView = this.mParentElement;		
		listStatusView.writeAttribute('aria-label', "_XC.Accessibility.Label.ListStatusView".loc());
		listStatusView.writeAttribute('tabindex', tabIndex);
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

// A base class for our paginating scoped sortable table view. Displays a set of scope
// toggles top-left, with a keyword filter bot top-right, and a sortable table view below.
// Paginates results.

CC.XcodeServer.PaginatingScopedSortableTableView = Class.create(CC.PaginatingSearchQueryListView, {
	mClassName: 'xc-paginating-scoped-sortable-table-view',
	mEntityTypes: ['com.apple.entity.Bot'],
	// Table header keys used by this view. Expects a dictionary of identifiers (which will be
	// camel-cased and used in localization and associated sort key. If the sort key is null, the
	// column is assumed to not be sortable.
	mTableHeaderKeys: null,
	mTableHeaderTitleFormatString: "",
	// Override the render method so we can insert column headers.
	render: function($super) {
		var tableHeaderTitleFormat = this.mTableHeaderTitleFormatString;
		var headerElement = Builder.node('div', {'aria-hidden': 'true','tabindex': '-1', className: 'xc-paginating-scoped-sortable-table-view-headers'}, this.mTableHeaderKeys.collect(function(value, index) {
			var locKey = value[0];
			var capitalizedLocKey = locKey.capitalizeFirstCharacter();
			var lowercasedLocKey = capitalizedLocKey.toLowerCase();
			var headerSpan = Builder.node('span', {'tabindex': '-1', className: 'cell ' + lowercasedLocKey, 'data-key': lowercasedLocKey}, tableHeaderTitleFormat.fmt(capitalizedLocKey).loc());
			Event.observe(headerSpan, 'click', this.handleTableHeaderClicked.bind(this));
			return headerSpan;
		}, this).concat(Builder.node('div', {'style': 'clear: both; display: block;'})));
		var elem = $super();
		elem.insertBefore(headerElement, elem.down('.cc-paginating-list-view-content'));
		return elem;
	},
	handleTableHeaderClicked: function(inEvent) {
		// XXX
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.









// Paginating bot list view.

CC.XcodeServer.BOT_LIST_TABLE_HEADERS = $H({
	'name': 'title',
	'status': null,
	'nextIntegration': null,
	'lastIntegration': 'updateTime'
});

CC.XcodeServer.NOTIFICATION_BOT_RUN_ACTIVITY_STREAM_UPDATE_COMPLETED = 'BOT_RUN_ACTIVITY_STREAM_UPDATE_COMPLETED';

CC.XcodeServer.PaginatingBotListView = Class.create(CC.XcodeServer.PaginatingScopedSortableTableView, {
	mClassNames: ['xc-paginating-scoped-sortable-table-view', 'xc-paginating-bot-list-view'],
	mTableHeaderKeys: CC.XcodeServer.BOT_LIST_TABLE_HEADERS,
	mTableHeaderTitleFormatString: "_XC.BotList.Header.Title.%@",
	mFilterBarViewClass: 'CC.XcodeServer.FilterBarView',
	// Since activity comes in to the paginating bot list view for multiple bots, we need to keep a cache
	// of what timers we have in play to fetch bot information from the server. Batch service_client calls
	// are exempt from the auto-batching behavior, so we need to coalesce rapid fetches of bot information
	// triggered by a activity notifications together.
	mBotRunActivityFetchTimerQueueHash: {},
	mBotRunActivityFetchWindow: 1500,
	initialize: function($super) {
		$super.apply(null, Array.prototype.slice.call(arguments, 1));
		this.addSubview(new CC.XcodeServer.BotListStatusView(), undefined, true);
		// React to status changes for bot runs we are displaying.
		globalNotificationCenter().subscribe(CC.XcodeServer.NOTIFICATION_BOT_RUN_ACTIVITY_STREAM_UPDATE, this.handleBotRunActivityStreamUpdate.bind(this));
	},
	buildQuery: function($super, inStartIndex, inHowMany) {
		var query = $super(inStartIndex, inHowMany);
		var keyword = this.mFilterBarView.mFilter;
		if (keyword == 'passed') {
			var filterNodes = [];
			filterNodes.push(server_proxy().searchQueryCreateNode('latestRunSubStatus', CC.XcodeServer.BOT_RUN_SUBSTATUS_WARNINGS, true));
			filterNodes.push(server_proxy().searchQueryCreateNode('latestRunSubStatus', CC.XcodeServer.BOT_RUN_SUBSTATUS_SUCCEEDED, true));
			filterNodes.push(server_proxy().searchQueryCreateNode('latestRunSubStatus', CC.XcodeServer.BOT_RUN_SUBSTATUS_ANALYSIS_ISSUES, true));
			var orNode = server_proxy().searchQueryCreateOrArray(filterNodes);
			
			query = server_proxy().searchQueryAddToAndNode(query, server_proxy().searchQueryCreateNode('latestRunStatus', CC.XcodeServer.BOT_RUN_STATUS_COMPLETED, true));
			query = server_proxy().searchQueryAddToAndNode(query, orNode);
		} else if (keyword == 'failed') {
			var failCompletedSubStatutesArray = [];
			failCompletedSubStatutesArray.push(server_proxy().searchQueryCreateNode('latestRunSubStatus', CC.XcodeServer.BOT_RUN_SUBSTATUS_BUILD_FAILED, true));
			failCompletedSubStatutesArray.push(server_proxy().searchQueryCreateNode('latestRunSubStatus', CC.XcodeServer.BOT_RUN_SUBSTATUS_CHECKOUT_ERROR, true));
			failCompletedSubStatutesArray.push(server_proxy().searchQueryCreateNode('latestRunSubStatus', CC.XcodeServer.BOT_RUN_SUBSTATUS_COMMIT_HISTORY_ERROR, true));
			failCompletedSubStatutesArray.push(server_proxy().searchQueryCreateNode('latestRunSubStatus', CC.XcodeServer.BOT_RUN_SUBSTATUS_BUILD_ERRORS, true));
			failCompletedSubStatutesArray.push(server_proxy().searchQueryCreateNode('latestRunSubStatus', CC.XcodeServer.BOT_RUN_SUBSTATUS_TEST_FAILURES, true));
			failCompletedSubStatutesArray.push(server_proxy().searchQueryCreateNode('latestRunSubStatus', CC.XcodeServer.BOT_RUN_SUBSTATUS_INTERNAL_ERRORS, false));
			var failCompletedSubStatutesNode = server_proxy().searchQueryCreateOrArray(failCompletedSubStatutesArray);
			
			var failCompletedArray = [];
			failCompletedArray.push(server_proxy().searchQueryCreateNode('latestRunStatus', CC.XcodeServer.BOT_RUN_STATUS_COMPLETED, true));
			failCompletedArray.push(failCompletedSubStatutesNode);
			var failCompletedAndNode = server_proxy().searchQueryCreateAndArray(failCompletedArray);
			
			query = server_proxy().searchQueryAddToOrNode(query, server_proxy().searchQueryCreateNode('latestRunStatus', CC.XcodeServer.BOT_RUN_STATUS_FAILED, true));
			query = server_proxy().searchQueryAddToOrNode(query, server_proxy().searchQueryCreateNode('latestRunStatus', CC.XcodeServer.BOT_RUN_STATUS_CANCELED, true));
			query = server_proxy().searchQueryAddToOrNode(query, failCompletedAndNode);
		}
		return query;
	},
	handleBotRunActivityStreamUpdate: function(inMessage, inObject, inOptExtras) {
		var botRunGUID = (inOptExtras && inOptExtras.activity && inOptExtras.activity.entityGUID);
		var botGuid = (inOptExtras && inOptExtras.activity && inOptExtras.activity.ownerGUID);
		// Do we have a timer queued for this bot run already?
		if (this.mBotRunActivityFetchTimerQueueHash[botRunGUID]) {
			logger().debug("We got an activity stream update for a bot but a request is already queued, ignoring");
			return;
		}
		var timerFunction = function() {
			this.mBotRunActivityFetchTimerQueueHash[botRunGUID] = false;
			// We always fetch the bot run (since it may be a newer bot run for a bot we're displaying).
			var callback = function(response) {
				var responses = (response.responses || []);
				if (responses.length == 2) {
					var botRunEntity = responses[0].response;
					logger().debug("Got batch response, bot entity: %@".fmt(Object.toJSON(botRunEntity)));
					var workSchedule = responses[1].response;
					var ownerGUID = botRunEntity.ownerGUID;
					var matchingListViewItem = this.$().down('.xc-paginating-bot-list-view-item[data-guid="%@"]'.fmt(ownerGUID));
					if (botRunEntity) this.__updateListItemForBotRunEntity(matchingListViewItem, botRunEntity);
					if (workSchedule && CC.XcodeServer.isTerminalBotStatus(botRunEntity.status)) this.__updateListItemForWorkSchedule(matchingListViewItem, workSchedule);
					
					globalNotificationCenter().publish(CC.XcodeServer.NOTIFICATION_BOT_RUN_ACTIVITY_STREAM_UPDATE_COMPLETED, botRunEntity);
				}
			};
			var batch = [
				['ContentService', 'entityForGUID:', botRunGUID],
				['XCWorkSchedulerService', 'workScheduleForEntityGUID:', botGuid]
			];
			return service_client().batchExecuteAsynchronously(batch, null, callback.bind(this), this.defaultPaginationErrback.bind(this));
		}
		// Queue up a timer to fetch updated information for this bot.
		this.mBotRunActivityFetchTimerQueueHash[botRunGUID] = setTimeout(timerFunction.bind(this), this.mBotRunActivityFetchWindow);
	},
	renderResultItem: function(inResultItem) {		
		var tabIndexBottomList = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_BOT_SUMMARY_BOTTOM_LIST);
		var href = CC.entityURL(inResultItem);
		var element = Builder.node('div', {className: 'xc-paginating-bot-list-view-item row', 'data-guid': inResultItem.guid}, [
			Builder.node('span', {className: 'cell name selectable'}, [
				Builder.node('a', {'tabindex': tabIndexBottomList, 'role': 'link', 'href': href}, (inResultItem.longName || inResultItem.shortName || inResultItem.guid))
			]),
			Builder.node('span', {className: 'cell status selectable'}),
			Builder.node('span', {className: 'cell nextintegration selectable'}, "--"),
			Builder.node('span', {className: 'cell lastintegration selectable'}),
			Builder.node('div', {style: 'display: block; clear: both;'})
		]);
		if (CC.meta('x-apple-user-logged-in') == "true") {
			var botGUID = inResultItem.guid;
			var tabIndex = accessibility().requestTabIndex(CC.Accessibility.TAB_INDEX_NAME_BOT_HEADER_VIEW_INTEGRATE);
			var canCreateBots = (CC.meta('x-apple-user-can-create-bots') == "true");
			if (botGUID && canCreateBots) {
				var integrateButton = new CC.XcodeServer.IntegrateButtonView(
					"_XC.Bot.Control.Run.Title".loc(), 
					"_XC.Bot.Control.CleanRun.Title".loc(), 
					function() {
						xcservice().startBotWithGUID(botGUID, Prototype.emptyFunction, function() {
							notifier().printErrorMessage("_XC.Bot.Control.Run.Error".loc());
						})
					},
					function() {
						xcservice().cleanAndStartBotWithGUID(botGUID, Prototype.emptyFunction, function() {
							notifier().printErrorMessage("_XC.Bot.Control.Run.Error".loc());
						});
					},
					botGUID,
					tabIndex
				);
				integrateButton.forceRender();
				
				Element.insert(element, {
					'top': integrateButton.$()
				});
			}
		}
		return element;
	},
	renderResults: function($super, inResults, inOptAppendAtTop) {
	    if (!inResults || inResults.length == 0) {
			return $super(inResults, inOptAppendAtTop);
		}
		// Delay showing anything until we have fetched the latest run for a bot.
		var hasExistingItems = this.$().down('.xc-paginating-bot-list-view-item');
		if (!hasExistingItems) {
			this.showPaginationLink(false);
			this.$().down('.cc-paginating-list-view-content').addClassName('loading');
		}
		// Start a batch request for the run and scheduling information for each bot. We
		// deliberately hold the entire list render here to avoid flickering as things load
		// out-of-band.
		var callback = function(service_response) {
			if (service_response && service_response.responses) {
				var responses = service_response.responses;
				var responseCount = responses.length;
				var fragment = document.createDocumentFragment();
				// The first response is the latest bot run, the second is the total run count for the
				// bot and the third is the work schedule associated with a bot.
				var resultItem, latestInterestingBotRunEntity, latestBotRunEntity, workSchedule, renderedResultItem;
				var idx = 0;
				for (var jdx = 0; jdx < responseCount; jdx += 3) {
					resultItem = inResults[idx];
					latestInterestingBotRunEntity = (responses[jdx] && responses[jdx].response);
					workSchedule = (responses[jdx + 1] && responses[jdx + 1].response);
					latestBotRunEntity = (responses[jdx + 2] && responses[jdx + 2].response);
					renderedResultItem = this.renderResultItem(resultItem);
					if (latestInterestingBotRunEntity) this.__updateListItemForBotRunEntity(renderedResultItem, latestInterestingBotRunEntity);
					if (workSchedule) this.__updateListItemForWorkSchedule(renderedResultItem, workSchedule);
					fragment.appendChild(renderedResultItem);
					idx += 1;
				}
				// Append the fragment to the list and update the loading/pagination state
				// based on what we just fetched.
				var rootElement = this.$().down('.cc-paginating-list-view-content');
				rootElement.appendChild(fragment);
				if (!rootElement.down('.xc-paginating-bot-list-view-item')) {
					this.setIsEmpty(true);
				} else {
					if (this.mPaginationState && this.mPaginationState.hasMoreResults) {
						this.showPaginationLink(true);
					}
				}
				this.$().down('.cc-paginating-list-view-content').removeClassName('loading');
				globalNotificationCenter().publish(CC.Routes.NOTIFICATION_ROUTES_SHOULD_UPDATE);
			}
		}
		var botGUIDs = [], result, batch = [];
		for (var idx = 0; idx < inResults.length; idx++) {
			result = inResults[idx];
			if (result && result.guid) {
				botGUIDs.push(result.guid);
				batch.push(['XCBotService', 'latestInterestingBotRunForBotGUID:includeExtendedAttributes:', [result.guid, false]]);
				batch.push(['XCWorkSchedulerService', 'workScheduleForEntityGUID:', result.guid]);
				batch.push(['XCBotService', 'latestBotRunForBotGUID:includeExtendedAttributes:', [result.guid, false]]);
			}
		}
		service_client().batchExecuteAsynchronously(batch, null, callback.bind(this), this.defaultPaginationErrback.bind(this));
	},
	__updateListItemForBotRunEntity: function(inListItem, inBotRunEntity) {
		if (!inListItem || !inBotRunEntity) return;
		
		if (CC.XcodeServer.isTerminalBotStatus(inBotRunEntity.status)) {
			var element = inListItem.down('.status');
			inListItem.down('.nextintegration').innerHTML = "--";
			inListItem.down('.lastintegration').innerHTML = "";
			inListItem.down('.lastintegration').textContent = globalLocalizationManager().localizedDateTime(inBotRunEntity.startTime || "");
		}
		else {
			var element = inListItem.down('.nextintegration');
		}
		element.innerHTML = "";
		element.appendChild(CC.XcodeServer.statusElementForBotRunEntity(inBotRunEntity, true));
		element.appendChild(CC.XcodeServer.statusElementForBotRunEntity(inBotRunEntity, false));
	},
	__updateListItemForWorkSchedule: function(inListItem, inWorkSchedule) {
		if (!inListItem) return;
		
		var nextIntegrationElement = inListItem.down('.nextintegration');
		if (!inWorkSchedule) {
			nextIntegrationElement.innerHTML = "--";
		}
		else {
			nextIntegrationElement.innerHTML = "";
			nextIntegrationElement.update(CC.XcodeServer.localizedNextScheduleString(inWorkSchedule, true) || "");
		}
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.

// Integrate Button content view.

CC.XcodeServer.IntegrateButtonView = Class.create(CC.Mvc.View, {
	mTitle: "",
	mCallback: null,
	mGuid: "",
	mButtonStatus: 'enabled',
	initialize: function($super, inTitle, inCleanTitle, inCallback, inCleanCallback, inGuid, tabIndex){
		$super();
		this.mTitle = inTitle;
		this.mCleanTitle = inCleanTitle;
		this.mCallback = inCallback;
		this.mCleanCallback = inCleanCallback;
		this.mGuid = inGuid;
		this.tabIndex = tabIndex;

		globalNotificationCenter().subscribe(CC.XcodeServer.NOTIFICATION_BOT_RUN_ACTIVITY_STREAM_UPDATE_COMPLETED, this._updateIntegrateButtonStatusFromBotRunEntity.bind(this));
	},
	render: function() {
		var el = Builder.node('div', {'role': 'button', 'tabindex': this.tabIndex, className: 'xc-translucent-button'}, this.mTitle);
		el.addEventListener('click', this.handleClickEvent.bind(this), false);
		
		if (this.mCleanTitle) {
			globalNotificationCenter().subscribe(CC.Keyboard.NOTIFICATION_DID_KEYBOARD_MODIFIER, function(inMessage, inObject, inOptExtras){
				if (inOptExtras.event.keyCode == Event.KEY_OPTION)
				{
					el.addClassName('alternate');
					el.innerHTML = this.mCleanTitle;
				}
			}.bind(this));
	
			globalNotificationCenter().subscribe(CC.Keyboard.NOTIFICATION_DID_KEYBOARD_MODIFIER_UP, function(inMessage, inObject, inOptExtras){
				if (inOptExtras.event.keyCode == Event.KEY_OPTION)
				{
					el.removeClassName('alternate');
					el.innerHTML = this.mTitle;
				}
			}.bind(this));
		}
		
		return el;
	},
	disable: function() {
		this.$().addClassName('disabled');
	},
	enable: function() {
		this.$().removeClassName('disabled');
	},
	updateStatus: function(inStatus){
		if (inStatus == 'running' || inStatus == 'ready') {
			this.disable();
		}
		else {
			this.enable();
		}
	},
	handleClickEvent: function(inEvent){
		var el = this.$();
		if (!el.hasClassName('disabled')) {
			if (el.hasClassName('alternate')) {
				this.mCleanCallback(inEvent);
			}
			else {
				this.mCallback(inEvent);
			}
			this.disable();
		}
	},
	getGuid: function(){
		return this.mGuid;
	},
	_updateIntegrateButtonStatusFromBotRunEntity: function(inMessage, inObject, inOptExtras) {
		if (inObject && inObject.ownerGUID == this.mGuid && inObject.status) {
			this.updateStatus(inObject.status);
		}
	}
});
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.








var sharedBotDetailView;

CC.XcodeServer.setSelectedBotHeaderLinkByGUID = function(inBotHeaderView, inLinkGUID) {
	var links = (inBotHeaderView.mLinkItems || []), link, linkGUID;
	for (var idx = 0; idx < links.length; idx++) {
		link = links[idx];
		linkGUID = link.mLinkGUID;
		link.markAsSelected(inLinkGUID == linkGUID);
	}
};

// Builds a bot detail view for the current app context bot.

var allBotsRoute = function(inRouteInvocation) {
	CC.RouteHelpers.setBodyClassName('bots');
	CC.RouteHelpers.setTopLevelClassNames(true);
	CC.RouteHelpers.setContentPrimaryFullWidth(true, false);
	CC.RouteHelpers.setBrowserWindowTitle("_XC.BrowserTitle.BotSummary".loc());
	var crumbs = [];
	crumbs.push(new CC.BreadcrumbItem({'mDisplayTitle': "_XC.Breadcrumb.Xcode".loc(), 'mURL': '/xcode'}));
	crumbs.push(new CC.BreadcrumbItem({'mDisplayTitle': "_XC.Breadcrumb.Bots.Title".loc(), 'mURL': '/xcode/bots'}));
	sharedHeaderView.setBreadcrumbItems(crumbs);
	sharedHeaderView.updateDisplayStateForMenuItems();
	var listView = new CC.XcodeServer.PaginatingBotListView();
	mainView.addSubview(listView, '#content-primary', true);
	listView.paginate();
	inRouteInvocation.routeDidComplete();
};

var botTinyIDRoute = function(inRouteInvocation) {
	CC.RouteHelpers.setBodyClassName('bot');
	CC.RouteHelpers.setTopLevelClassNames(false);
	CC.RouteHelpers.setContentPrimaryFullWidth(true, false);
	var crumbs = [];
	crumbs.push(new CC.BreadcrumbItem({'mDisplayTitle': "_XC.Breadcrumb.Xcode".loc(), 'mURL': '/xcode'}));
	crumbs.push(new CC.BreadcrumbItem({'mDisplayTitle': "_XC.Breadcrumb.Bots.Title".loc(), 'mURL': '/xcode/bots'}));
	var entityTitle = (CC.meta('x-apple-entity-longName') || CC.meta('x-apple-entity-shortName'));
	var entityType = CC.meta('x-apple-entity-type');
	var entityTinyID = CC.meta('x-apple-entity-tinyID');
	var entityURL = CC.entityURLForTypeAndTinyID(entityType, entityTinyID);
	crumbs.push(new CC.BreadcrumbItem({'mDisplayTitle': entityTitle, 'mURL': entityURL}));
	sharedHeaderView.setBreadcrumbItems(crumbs);
	sharedHeaderView.updateDisplayStateForMenuItems();

	// Figure out how to set up the view based on the route.
	var url = inRouteInvocation.url;
	var urlMatchesArray = [
		/xcode\/[^\/]*\/[^\/]*\/(summary|tests|commits|logs|archives)/,
		/xcode\/bots\/[^\/]*\/integration\/[^\/]*\/(summary|tests|commits|logs|archives)/
	];
	var urlMatches = null;
	for (var a = 0; a < urlMatchesArray.length; a++){
		if (urlMatches == null) {
			urlMatches = url.match(urlMatchesArray[a]);
		}
	}
	var tabName = "summary";
	if (urlMatches && urlMatches.length > 0) {
		tabName = urlMatches[1];
	}
	var integrationNumber;
	if (inRouteInvocation && inRouteInvocation.namedMatches && inRouteInvocation.namedMatches.integrationNumber && inRouteInvocation.namedMatches.integrationNumber && parseInt(inRouteInvocation.namedMatches.integrationNumber, 10)) {
		integrationNumber = inRouteInvocation.namedMatches.integrationNumber;
	}
	
	// Initialize a shared bot detail view if we don't have one already.
	if (!sharedBotDetailView) {
		sharedBotDetailView = new CC.XcodeServer.BotDetailView(integrationNumber, tabName);
		mainView.addSubview(sharedBotDetailView, '#content-primary');
		sharedBotDetailView.markAsLoading(true);
	}
	
	// Update the browser window title appropiately.
	switch (tabName) {
		case 'summary':
			if (integrationNumber != undefined) {
				CC.RouteHelpers.setBrowserWindowTitle("_XC.BrowserTitle.BotDetail".loc(entityTitle, "_XC.BotRun.Header.Links.Summary.Title".loc(integrationNumber)));
			} else {
				CC.RouteHelpers.setBrowserWindowTitle("_XC.BrowserTitle.BotDetail".loc(entityTitle, "_XC.Bot.Header.Links.Summary.Title".loc()));
			}
			break;
		case 'tests':
			if (integrationNumber != undefined) {
				CC.RouteHelpers.setBrowserWindowTitle("_XC.BrowserTitle.BotDetail".loc(entityTitle, "_XC.BotRun.Header.Links.Tests.Title".loc(integrationNumber)));
			} else {
				CC.RouteHelpers.setBrowserWindowTitle("_XC.BrowserTitle.BotDetail".loc(entityTitle, "_XC.Bot.Header.Links.Tests.Title".loc()));
			}
			break;
		case 'commits':
			if (integrationNumber != undefined) {
				CC.RouteHelpers.setBrowserWindowTitle("_XC.BrowserTitle.BotDetail".loc(entityTitle, "_XC.BotRun.Header.Links.Commits.Title".loc(integrationNumber)));
			} else {
				CC.RouteHelpers.setBrowserWindowTitle("_XC.BrowserTitle.BotDetail".loc(entityTitle, "_XC.Bot.Header.Links.Commits.Title".loc()));
			}
			break;
		case 'logs':
			if (integrationNumber != undefined) {
				CC.RouteHelpers.setBrowserWindowTitle("_XC.BrowserTitle.BotDetail".loc(entityTitle, "_XC.BotRun.Header.Links.Logs.Title".loc(integrationNumber)));
			} else {
				CC.RouteHelpers.setBrowserWindowTitle("_XC.BrowserTitle.BotDetail".loc(entityTitle, "_XC.Bot.Header.Links.Logs.Title".loc()));
			}
			break;
		case 'archives':
			if (integrationNumber != undefined) {
				CC.RouteHelpers.setBrowserWindowTitle("_XC.BrowserTitle.BotDetail".loc(entityTitle, "_XC.BotRun.Header.Links.Archives.Title".loc(integrationNumber)));
			} else {
				CC.RouteHelpers.setBrowserWindowTitle("_XC.BrowserTitle.BotDetail".loc(entityTitle, "_XC.Bot.Header.Links.Archives.Title".loc()));
			}
			break;
	}
	
	// If we got an integration number in the route invocation named matches, we know we are displaying a bot run.  Otherwise display the bot.
	if (integrationNumber == undefined) {
		var botGUID = CC.meta('x-apple-entity-guid');
		var batch = [
			['XCBotService', 'botForGUID:', botGUID],
			['XCBotService', 'latestBotRunForBotGUID:', botGUID],
			['XCBotService', 'latestTerminalBotRunForBotGUID:', botGUID]
		];
		var batchErrback = function() {
			sharedBotDetailView.markAsLoading(false);
			sharedBotDetailView.showPlaceholderViewWithString("_XC.Bot.Error.DisplayGeneric".loc());
		}
		var batchCallback = function(inBatchedResponse) {
			sharedBotDetailView.markAsLoading(false);
			if (inBatchedResponse && inBatchedResponse.responses && inBatchedResponse.responses.length == 3) {
				var botEntity = inBatchedResponse.responses[0].response;
				var latestBotRunEntity = inBatchedResponse.responses[1].response;
				var latestTerminalBotRunEntity = inBatchedResponse.responses[2].response;
				// If we didn't get a latest bot run entity for the specified bot, we know the bot has never run.
				// Running the bot will trigger the route again so it is safe to return here.
				if (!latestBotRunEntity) {
					sharedBotDetailView.showNeverRunPlaceholderView();
					return;
				}
				sharedBotDetailView.showContentViewWithName(tabName);
				sharedBotDetailView.showBot(botEntity, latestTerminalBotRunEntity);
			}
			else {
				batchErrback();
			}
		}
		service_client().batchExecuteAsynchronously(batch, {}, batchCallback, batchErrback);
	}
	else {
		var botGUID = CC.meta('x-apple-entity-guid');
		var botRunErrback = function() {
			sharedBotDetailView.markAsLoading(false);
			sharedBotDetailView.showPlaceholderViewWithString("_XC.BotRun.Error.DisplayGeneric".loc());
		}
		var botRunCallback = function(inEntity) {
			sharedBotDetailView.markAsLoading(false);
			if (inEntity) {
				sharedBotDetailView.showContentViewWithName(tabName, integrationNumber);
				sharedBotDetailView.showBotRun(inEntity);
				return;
			}
			botRunErrback();
		}
		xcservice().botRunForBotGUIDAndIntegrationNumber(botGUID, integrationNumber, botRunCallback, botRunErrback);
	}
	
	inRouteInvocation.routeDidComplete();
};

var bigscreenRoute = function(inRouteInvocation) {
	CC.RouteHelpers.setBodyClassName('big-screen');
	CC.RouteHelpers.setTopLevelClassNames(true);
	CC.RouteHelpers.setContentPrimaryFullWidth(true, false);
	CC.RouteHelpers.setBrowserWindowTitle("_XC.BrowserTitle.BigScreen".loc());
	var crumbs = [];
	crumbs.push(new CC.BreadcrumbItem({'mDisplayTitle': "_XC.Breadcrumb.Xcode".loc(), 'mURL': '/xcode'}));
	crumbs.push(new CC.BreadcrumbItem({'mDisplayTitle': "_XC.Breadcrumb.BigScreen.Title".loc(), 'mURL': '/xcode/bigscreen'}));
	sharedHeaderView.setBreadcrumbItems(crumbs);
	sharedHeaderView.updateDisplayStateForMenuItems();
	var bigscreen = new CC.XcodeServer.BigScreen();
	mainView.addSubview(bigscreen.view(), '#content-primary', true);
	inRouteInvocation.routeDidComplete();
};
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.



CC.XcodeServer.Service = Class.createWithSharedInstance('xcservice'); 
CC.XcodeServer.Service.prototype = {
	initialize: function() {},
	findAllSCMInfos: function(inCallback, inErrback) {
		var callback = function(response) {
			return inCallback(response && response.response);
		};
		return service_client().executeAsynchronously('XCBotService', 'findAllSCMInfos', undefined, {}, callback, inErrback);
	},
	allDevices: function(inCallback, inErrback) {
		var callback = function(response) {
			return inCallback(response && response.response);
		};
		return service_client().executeAsynchronously('XCBotService', 'allDevices', undefined, {}, callback, inErrback);
	},
	findAllSCMInfosAndDevices: function(inCallback, inErrback) {
		var batch = [
			['XCBotService', 'findAllSCMInfos', undefined],
			['XCBotService', 'allDevices', undefined]
		];
		var __callback = function(inner_service_response) {
			if (inner_service_response && inner_service_response.responses) {
				var responses = inner_service_response.responses;
				// Check each request in the batch succeeded.
				var failed = $A(responses).detect(function(n) { return n.succeeded == false; });
				if (failed) {
					return inErrback(responses[0], responses[1]);
				}
				return inCallback(responses[0].response, responses[1].response);
			};
			logger().error("Got an error getting scm info or devices %@", inner_service_response);
			return inErrback(inner_service_response);
		}
		return service_client().batchExecuteAsynchronously(batch, {}, __callback.bind(this), inErrback);
	},
	createBotWithOptions: function(inOptions, inCallback, inErrback) {
		var botGUID = (new CC.GuidBuilder()).toString();
		var longName = (inOptions.longName || "_XC.Bot.Default.Title".loc());
		var shortName = longName.strip().gsub(/[^\w]/, "").toLowerCase();
		var extendedAttributes = (inOptions.extendedAttributes || {});
		var _bot = {
			'guid': botGUID,
			'shortName': shortName,
			'longName': longName,
			'extendedAttributes': extendedAttributes,
			'notifyCommitterOnSuccess': (inOptions.notifyCommitterOnSuccess == true),
			'notifyCommitterOnFailure': (inOptions.notifyCommitterOnFailure == true)
		}
		var successEmailList = (inOptions.successEmailList || []);
		var failureEmailList = (inOptions.failureEmailList || []);
		var bot = new CC.EntityTypes.BotEntity(_bot);
		var _callback = function(service_response) {
			if (service_response && service_response.response) {
				var model = service_response.response;
				var entity = entity_types().entityForHash(model);
				// Build out a batch request.
				var batch = [
					['ContentService', 'updateEmailSubscriptionList:forEntityGUID:withNotificationType:', [successEmailList, entity.guid, "com.apple.notifications.BotSucceeded"]],
					['ContentService', 'updateEmailSubscriptionList:forEntityGUID:withNotificationType:', [failureEmailList, entity.guid, "com.apple.notifications.BotFailed"]]
				];
				var __callback = function(inner_service_response) {
					if (inner_service_response && inner_service_response.responses) {
						// Check each request in the batch succeeded.
						var failed = $A(inner_service_response.responses).detect(function(n) { return n.succeeded == false; });
						if (!failed) {
							// Do we want to schedule an integration immediately?
							if (inOptions.integrateImmediately) {
								xcservice().startBotWithGUID(botGUID);
							}
							return inCallback(entity);
						}
					};
					logger().error("Got an error updating notifications %@", inner_service_response);
					return inErrback(inner_service_response);
				}
				return service_client().batchExecuteAsynchronously(batch, {}, __callback.bind(this), inErrback);
			}
			return inErrback(service_response);
		};
		// Create the bot.
		return service_client().executeAsynchronously('XCBotService', 'createBotWithProperties:', bot, {}, _callback.bind(this), inErrback);
	},
	scheduleBotWithGUID: function(inGUID, inRecurrenceTuples, inCallback, inErrback) {
		return service_client().executeAsynchronously('XCBotService', 'scheduleBotWithGUID:atRecurrences:', [inGUID, inRecurrenceTuples], {}, inCallback, inErrback);
	},
	botRunForBotGUIDAndIntegrationNumber: function(inGUID, inIntegrationNumber, inCallback, inErrback) {
		var callback = function(response) {
			return inCallback(response && response.response);
		};
		return service_client().executeAsynchronously('XCBotService', 'botRunForBotGUID:andIntegrationNumber:', [inGUID, inIntegrationNumber], {}, callback, inErrback);
	},
	updateWorkSchedule: function(inWorkSchedule, inCallback, inErrback) {
		return service_client().executeAsynchronously('XCWorkSchedulerService', 'updateWorkSchedule:', inWorkSchedule, {}, inCallback, inErrback);
	},
	deleteWorkScheduleWithScheduleGUID: function(inGUID, inCallback, inErrback) {
		return service_client().executeAsynchronously('XCWorkSchedulerService', 'deleteWorkScheduleWithGUID:', inGUID, {}, inCallback, inErrback);
	},
	deleteWorkScheduleWithEntityGUID: function(inGUID, inCallback, inErrback) {
		return service_client().executeAsynchronously('XCWorkSchedulerService', 'deleteWorkScheduleWithEntityGUID:', inGUID, {}, inCallback, inErrback);
	},
	workScheduleForEntityGUID: function(inGUID, inCallback, inErrback) {
		return service_client().executeAsynchronously('XCWorkSchedulerService', 'workScheduleForEntityGUID:', inGUID, {}, inCallback, inErrback);
	},
	nextScheduledBotRun: function(inCallback, inErrback) {
		var callback = function(response) {
			return inCallback(response && response.response);
		};
		return service_client().executeAsynchronously('XCBotService', 'nextScheduledBotRun', null, {}, callback, inErrback);
	},
	startBotWithGUID: function(inGUID, inCallback, inErrback) {
		return service_client().executeAsynchronously('XCBotService', 'startBotRunForBotGUID:', inGUID, {}, inCallback, inErrback);
	},
	cleanAndStartBotWithGUID: function(inGUID, inCallback, inErrback) {
		return service_client().executeAsynchronously('XCBotService', 'cleanAndStartBotRunForBotGUID:', inGUID, {}, inCallback, inErrback);
	},
	cancelBotRunWithGUID: function(inGUID, inCallback, inErrback) {
		return service_client().executeAsynchronously('XCBotService', 'cancelBotRunWithGUID:', inGUID, {}, inCallback, inErrback);
	},
	pauseBotRunWithGUID: function(inGUID, inCallback, inErrback) {
		return service_client().executeAsynchronously('XCBotService', 'pauseBotRunWithGUID:', inGUID, {}, inCallback, inErrback);
	},
	resumeBotRunWithGUID: function(inGUID, inCallback, inErrback) {
		return service_client().executeAsynchronously('XCBotService', 'resumeBotRunWithGUID:', inGUID, {}, inCallback, inErrback);
	},
	latestBotRunForBotsWithGUIDs: function(inGUIDs, inCallback, inErrback) {
		var callback = function(response) {
			return inCallback(response && response.response);
		};
		return service_client().executeAsynchronously('XCBotService', 'latestBotRunForBotsWithGUIDs:', [inGUIDs], {}, callback, inErrback);
	},
	latestBotRunForBotGUID: function(inGUID, inCallback, inErrback) {
		var callback = function(response) {
			return inCallback(response && response.response);
		};
		return service_client().executeAsynchronously('XCBotService', 'latestBotRunForBotGUID:', inGUID, {}, callback, inErrback);
	},
	latestInterestingBotRunForBotsWithGUIDs: function(inGUIDs, inCallback, inErrback) {
		var callback = function(response) {
			return inCallback(response && response.response);
		};
		return service_client().executeAsynchronously('XCBotService', 'latestInterestingBotRunForBotsWithGUIDs:', [inGUIDs], {}, callback, inErrback);
	},
	latestTerminalBotRunForBotsWithGUIDs: function(inGUIDs, inCallback, inErrback) {
		var callback = function(response) {
			return inCallback(response && response.response);
		};
		return service_client().executeAsynchronously('XCBotService', 'latestTerminalBotRunForBotsWithGUIDs:', [inGUIDs], {}, callback, inErrback);
	},
	getLatestBotRunForBotGUID: function(inGUID, inCallback, inErrback) {
		var callback = function(result) {
			return inCallback(result && result[0]);
		};
		return this.__botHistoryForBotGUIDWithStartIndexAndHowMany(inGUID, 0, 1, callback, inErrback);
	},
	getLatestTerminalBotRun: function(inCallback, inErrback) {
		var callback = function(response) {
			return inCallback(response && response.response);
		};
		return service_client().executeAsynchronously('XCBotService', 'latestTerminalBotRun', null, {}, callback, inErrback);
	},
	getLatestTerminalBotRunAndPredecessor: function(inCallback, inErrback) {
		var callback = function(response) {
			return inCallback(response && response.response);
		};
		return service_client().executeAsynchronously('XCBotService', 'latestTerminalBotRunAndPredecessor', null, {}, callback, inErrback);
	},
	getLatestBotRunWithArchive: function(inCallback, inErrback) {
		var callback = function(response) {
			return inCallback(response && response.response);
		};
		return service_client().executeAsynchronously('XCBotService', 'latestBotRunWithArchive', null, {}, callback, inErrback);
	},
	latestTerminalBotRunForBotGUID: function(inBotGUID, inCallback, inErrback) {
		var callback = function(response) {
			return inCallback(response && response.response);
		};
		return service_client().executeAsynchronously('XCBotService', 'latestTerminalBotRunForBotGUID:', inBotGUID, {}, callback, inErrback);
	},
	getBotRunHistoryForBotGUID: function(inGUID, inCallback, inErrback) {
		return this.__botHistoryForBotGUIDWithStartIndexAndHowMany(inGUID, undefined, undefined, inCallback, inErrback);
	},
	__botHistoryForBotGUIDWithStartIndexAndHowMany: function(inGUID, inOptStartIndex, inOptHowMany, inCallback, inErrback) {
		var range = [inOptStartIndex || 0, (inOptHowMany || 25)];
		var callback = function(response) {
			return inCallback(response && response.response);
		};
		return service_client().executeAsynchronously('XCBotService', 'botRunsForBotGUID:inRange:', [inGUID, range], {}, callback, inErrback);
	},
	pollForUpdatedBotRevision: function(inGUID, inCurrentRevision, inPollInterval, inCallback, inErrback) {
		var callback = function(botRevision) {
			if (botRevision > inCurrentRevision) {
				return inCallback(inCurrentRevision, botRevision);
			}
			return setTimeout(function() {
				server_proxy().revisionForEntityGUID(inGUID, callback, inErrback);
			}, inPollInterval);
		}.bind(this);
		return server_proxy().revisionForEntityGUID(inGUID, callback, inErrback);
	},
	auditLogForEntityGUID: function(inGUID, inCallback, inErrback) {
		var callback = function(response) {
			return inCallback(response && response.response);
		};
		return service_client().executeAsynchronously('AuditLogService', 'auditLogForEntityGUID:', inGUID, {}, callback, inErrback);
	},
    checkOutputLogsAvailableForBotRunGUID: function(inBotRunGUID, inCallback, inErrback) {
		var callback = function(response) {
			return inCallback(response && response.response);
		};
        return service_client().executeAsynchronously('XCBotService', 'outputLogsAvailableForBotRunGUID:', [inBotRunGUID], {}, callback, inErrback);
    },
	getIntegrationNumbersForBotRunGUIDs: function(inBotRunGUIDs, inCallback, inErrback) {
		var callback = function(response) {
			return inCallback(response && response.response);
		};
		return service_client().executeAsynchronously('XCBotService', 'integrationNumbersForBotRunGUIDs:', [inBotRunGUIDs], {}, callback, inErrback);
	},
	scmInfoForURI: function(inURI, inCallback, inErrback) {
		var callback = function(response) {
			return inCallback(response && response.response);
		};
		return service_client().executeAsynchronously('XCBotService', 'scmInfoForURI:', inURI, {}, callback, inErrback);
	},
	commitHistoryForBotRunGUID: function(inGUID, inCallback, inErrback) {
		var callback = function(response) {
			return inCallback(response && response.response);
		};
		return service_client().executeAsynchronously('XCBotService', 'scmCommitsForBotRunGUID:', inGUID, {}, callback, inErrback);
	},
	deleteBotWithGUID: function(inGUID, inCallback, inErrback) {
		var callback = function(response) {
			return inCallback(response && response.response);
		};
		return service_client().executeAsynchronously('XCBotService', 'deleteBotWithGUID:', inGUID, {}, callback, inErrback);
	},
	deleteBotRunWithGUID: function(inGUID, inCallback, inErrback) {
		var callback = function(response) {
			return inCallback(response && response.response);
		};
		return service_client().executeAsynchronously('XCBotService', 'deleteBotRunWithGUID:', inGUID, {}, callback, inErrback);
	},
	pruneArchiveAndProductForBotRunWithGUID: function(inGUID, inCallback, inErrback) {
		var callback = function(response) {
			return inCallback(response && response.response);
		};
		return service_client().executeAsynchronously('XCBotService', 'pruneArchiveAndProductForBotRunWithGUID:', inGUID, {}, callback, inErrback);
	}
};
(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['template_example'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div role=\"presentation\" class=\"xc-bot-run-sidebar-item\" data-tinyid=\"";
  if (stack1 = helpers.tiny_id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.tiny_id); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" data-guid=\"";
  if (stack1 = helpers.guid) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.guid); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" data-type=\"";
  if (stack1 = helpers.type) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.type); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" data-integration=\"";
  if (stack1 = helpers.integration) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.integration); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\">\n	<a tabindex=\"3000\" role=\"link\" class=\"title ellipsis\">\n		<span role=\"presentation\" class=\"scheme ellipsis\">Integrate (";
  if (stack1 = helpers.integration) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.integration); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + ")</span>\n		<span role=\"presentation\" class=\"timestamp ellipsis\">";
  if (stack1 = helpers.date) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.date); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</span>\n		<span tabindex=\"4100\" role=\"presentation\" class=\"xc-bot-status ";
  if (stack1 = helpers.status) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.status); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + " ";
  if (stack1 = helpers['sub-status']) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0['sub-status']); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + " icon-only\" data-status=\"";
  if (stack1 = helpers.status) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.status); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" data-sub-status=\"";
  if (stack1 = helpers['sub-status']) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0['sub-status']); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\">";
  if (stack1 = helpers['sub-status']) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0['sub-status']); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</span>\n	</a>\n</div>";
  return buffer;
  });
})();
// Copyright (c) 2009-2013 Apple Inc. All Rights Reserved.
// 
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//
// IMPORTANT NOTE: This file is licensed only for use with the Wiki Server feature
// of the Apple Software and is subject to the terms and conditions of the Apple
// Software License Agreement accompanying the package this file is part of.










// Global activity stream shared instance.

CC.XcodeServer.NOTIFICATION_BOT_RUN_ACTIVITY_STREAM_UPDATE = 'BOT_RUN_ACTIVITY_STREAM_UPDATE';

var GlobalBotRunActivityStreamSharedInstance = Class.createWithSharedInstance('globalBotRunActivityStreamSharedInstance', true);
GlobalBotRunActivityStreamSharedInstance.prototype = {
	initialize: function() {
		var entityGUID = CC.meta('x-apple-entity-guid');
		var encodedEntityTypes = encodeURIComponent(JSON.stringify(['com.apple.entity.BotRun']));
		var url = "/xcs/streams/activity?format=js&entityTypes=%@%@".fmt(encodedEntityTypes, (entityGUID ? '&ownerGUID=%@'.fmt(entityGUID) : ''));
		this.mActivityStream = new CC.ActivityStream.ChunkFrame({mURL: url, mCallback: this.activityStreamCallback.bind(this)});
	},
	activityStreamCallback: function(inObject) {
		// Are we dealing with an array?
		var results = inObject;
		if (!Object.isArray(results)) results = [results];
		// Iterate through each of the results, and pass the change on with a notification.
		for (var idx = 0; idx < results.length; idx++) {
			var result = results[idx];
			if (result && result.entityType != "com.apple.entity.BotRun") continue;
			globalNotificationCenter().publish(CC.XcodeServer.NOTIFICATION_BOT_RUN_ACTIVITY_STREAM_UPDATE, this, {'activity': result});
		}
	}
};

// Main application definition.

CC.XcodeServer.HeaderView = Class.create(CC.HeaderView, {
	mTopLevelMenuItems: [
		new CC.MenuItems.BigScreen(),
		new CC.MenuItems.PlusMenu(),
		new CC.MenuItems.GearMenu(),
		new CC.MenuItems.Login(),
		new CC.MenuItems.Logout()
	],
	mTopLevelPlusMenuIndex: 1,
	mTopLevelGearMenuIndex: 2,
	mPlusMenuItems: [
		new CC.XcodeServer.NewBotMenuItem()
	],
	mGearMenuItems: [
		new CC.XcodeServer.CancelBotRunMenuItem(),
		new CC.XcodeServer.DeleteBotMenuItem(),
		new CC.XcodeServer.BotSettingsMenuItem(),
        new CC.XcodeServer.DownloadIntegrationLogsMenuItem(),
		new CC.MenuItems.About(),
		new CC.MenuItems.Help.Xcs()
	]
});

CC.XcodeServer.Application = Class.create(CC.Application, {
	mApplicationIdentifier: "xcs",
	createApplication: function($super) {
		$super();
		// Add a header to the root view, since we'll always need one.
		sharedHeaderView = new CC.XcodeServer.HeaderView();
		rootView.addSubview(sharedHeaderView);
		// Build the nav global popover.
		var navigationItems = [
			["/xcode/bots", "allbots", "_XC.Sources.AllBots.Title".loc(), undefined]
		];
		
		// only show Big Screen if we're on a WebKit browser
		if (browser().isWebKit())
			navigationItems.push(["/xcode/bigscreen", "big-screen", "_XC.Sources.BigScreen.Title".loc(), undefined]);
		
		sharedNavPopover = new CC.NavPopover(navigationItems, CC.NAV_POPOVER_DEFAULT_APPLICATION_XCODE_IDENTIFIER);
		// Create a scrollable main content view we can use.
		mainView = new CC.MainView();
		rootView.addSubview(mainView);
		// Route the initial request.
		this.routeInitialRequestAfterRender();
	},
	computeRoutes: function() {
		return [
			[CC.Routes.SLASH_ROUTE, allBotsRoute],
			[CC.Routes.XCODE_INDEX_ROUTE, allBotsRoute],
			[CC.Routes.XCODE_BOTS_ROUTE, allBotsRoute],
			[CC.Routes.XCODE_BOT_TINYID_ROUTE, botTinyIDRoute],
			[CC.Routes.XCODE_BOT_TINYID_TITLE_ROUTE, botTinyIDRoute],
			[CC.Routes.XCODE_BOT_TINYID_SUMMARY_ROUTE, botTinyIDRoute],
			[CC.Routes.XCODE_BOT_TINYID_COMMITS_ROUTE, botTinyIDRoute],
			[CC.Routes.XCODE_BOT_TINYID_LOGS_ROUTE, botTinyIDRoute],
			[CC.Routes.XCODE_BOT_TINYID_ARCHIVES_ROUTE, botTinyIDRoute],
			[CC.Routes.XCODE_BIG_SCREEN_ROUTE, bigscreenRoute],
			[CC.Routes.XCODE_BOT_TINYID_INTEGRATION_ROUTE, botTinyIDRoute],
			[CC.Routes.XCODE_BOT_TINYID_INTEGRATION_SUMMARY_ROUTE, botTinyIDRoute],
			[CC.Routes.XCODE_BOT_TINYID_INTEGRATION_TESTS_ROUTE, botTinyIDRoute],
			[CC.Routes.XCODE_BOT_TINYID_INTEGRATION_COMMITS_ROUTE, botTinyIDRoute],
			[CC.Routes.XCODE_BOT_TINYID_INTEGRATION_LOGS_ROUTE, botTinyIDRoute],
			[CC.Routes.XCODE_BOT_TINYID_INTEGRATION_ARCHIVES_ROUTE, botTinyIDRoute]
		];
	}
});

// Warn about disabled cookies.
if (!navigator.cookieEnabled) {
	alert("_Cookies.NoCookiesUnsupported".loc());
}

// Called once the document object is available.

var d;
document.observe("dom:loaded", function() {
	d = document;
	// Signal any shared instances and delegates to be created.
	globalNotificationCenter().publish('PAGE_INITIALIZE_FINISHED', document);
});

new CC.XcodeServer.Application();

