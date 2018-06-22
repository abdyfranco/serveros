var debugLogging = 0;

var kGraphAndServicesDisplayMode = 0;
var kNotificationsDisplayMode = 1;
var kDisplayMax = 1; 

var kHourTimeScale = 60 * 60;
var kDayTimeScale  = 60 * 60 * 24;
var kWeekTimeScale = 60 * 60 * 24 * 7;

var kGraphRefreshInterval = 15;
var kStateRefreshInterval = 60;

var displayMode = kGraphAndServicesDisplayMode;

var animator = 0;
var displayModeAnimation;
var timer;

var kThrobberMinOpacity = 0.20;
var kThrobberMaxOpacity = 0.65;
var throbber = 0;

var kCPUGraphIdentifier = "v1";
var kNetworkGraphIdentifier = "v16+v15";
var kDiskGraphIdentifier = "kDiskGraphIdentifier";

var lastStateRefreshDate = new Date();
var lastGraphRefreshDate = new Date();
var lastQuickDemoRefreshDate = new Date();

//
// SETUP
//

function setup()
{
	if(XSAdminSessionPlugIn) {
		if(debugLogging) { alert("XSAdminSessionPlugIn = " + XSAdminSessionPlugIn); }
		
		resetModel();
		updateHTMLWithLocalizedString();
		
		var infoButton = new AppleInfoButton(document.getElementById('flip'), document.getElementById('front'), "white", "white", flipToBack);
		
		var doneButton = new AppleGlassButton(document.getElementById('doneButton'), localizedStrings["Done"], selectDone);
		doneButton.setEnabled(true);
		doneButton.textElement.style.textAlign = "center";
		doneButton.textElement.style.width = "47px";
		
		model.selectedGraph = kCPUGraphIdentifier;
		model.timeScale = 3600;
		setTimeScale(model.timeScale);
		
		if(widget) {
			// setup hide/show handlers...
			widget.onshow=onshow;
			widget.onhide=onhide;
			
			getAuthCredentialsFromPrefs();
			authToServer();
			
			updateUI();
		}
		
		displayMode = kGraphAndServicesDisplayMode;	
	}
	else {
		alert("XSAdminSessionPlugIn could not be found.  Sever Status.wdgt will not function!");
	}
}

function updateHTMLWithLocalizedString()
{
	document.getElementById('fileSharingServiceName').innerText = localizedStrings["File Sharing"];
	document.getElementById('addressbookServiceName').innerText = localizedStrings["Address Book"];	
	document.getElementById('iCalServiceName').innerText = localizedStrings["iCal"];
	document.getElementById('iChatServiceName').innerText = localizedStrings["iChat"];
	document.getElementById('mailServiceName').innerText = localizedStrings["Mail"];
	document.getElementById('webServiceName').innerText = localizedStrings["Web"];
	document.getElementById('vpnServiceName').innerText = localizedStrings["VPN"];

	document.getElementById('graphTimeScale1H').innerText = localizedStrings["1h"];
	document.getElementById('graphTimeScale1D').innerText = localizedStrings["1d"];
	document.getElementById('graphTimeScale1W').innerText = localizedStrings["1w"];
	document.getElementById('networkGraphInLabel').innerText = localizedStrings["in"];
	document.getElementById('networkGraphOutLabel').innerText = localizedStrings["out"];
	
	document.getElementById('serverLabel').innerText = localizedStrings["Server:"];
	document.getElementById('userLabel').innerText = localizedStrings["User Name:"];
	document.getElementById('passwordLabel').innerText = localizedStrings["Password:"];
}

function keyPress(event) {
	var front = document.getElementById('front');
	if(event.which == 32) {
		// it is the space key...
		if(debugLogging) { alert("*** Space pressed -- calling doRefresh()"); }
		doRefresh();
	}
}


function startTimer()
{
	if (timer == null)
	{
		timer = setTimeout("tickTimer()", 1000);
	}		
}

function stopTimer()
{
	if (timer != null)
	{
		clearInterval (timer);
		timer = null;
	}	
}

function tickTimer()
{
	timer = setTimeout("tickTimer()", 1000);
	var date = new Date();
	var seconds = date.getTime() / 1000;

	var lastStateSeconds = lastStateRefreshDate.getTime() / 1000;
	var lastGraphSeconds = lastGraphRefreshDate.getTime() / 1000;

	if(seconds - lastGraphSeconds >= kGraphRefreshInterval) {
		doRefreshGraphs();
	}
	if(seconds - lastStateSeconds >= kStateRefreshInterval) {
		doRefreshState();		
	}
}

//
// GAINING AND LOSING FOCUS
//

function onshow()
{
	updateUI();
	doRefresh();
	startTimer();
}

function onhide()
{
	stopTimer();
}


//
// USER INTERACTION
//


function clickServiceItem(rowItem)
{
	var service = 0;

	if (rowItem.id == "sharingServiceRow") {
		service = "com.apple.ServerPreferences.FileSharingPlugin";
	}
	else if (rowItem.id == "addressbookServiceRow") {
		service = "com.apple.ServerPreferences.AddressBookPlugin";
	}
	else if (rowItem.id == "calendarServiceRow") {
		service = "com.apple.ServerPreferences.CalendarPlugin";
	}
	else if (rowItem.id == "chatServiceRow") {
		service = "com.apple.ServerPreferences.ChatPlugin";
	}
	else if (rowItem.id == "mailServiceRow") {
		service = "com.apple.ServerPreferences.MailPlugin";
	}
	else if (rowItem.id == "webServiceRow") {
		service = "com.apple.ServerPreferences.WebPlugin";
	}
	else if (rowItem.id == "vpnServiceRow") {
		service = "com.apple.ServerPreferences.VPNPlugin";
	}
    
	if (service) {
		var obj = widget.system("/usr/bin/osascript revealService.scpt " + model.hostname + " " + service);
		widget.openApplication("com.apple.ServerPreferences");
	} else {
		alert("clickServiceItem: Unable to determine which service to reveal");
	}
}


function createkey(key)
{
	return widget.identifier + "-" + key;
}



function clickGraphCPUButton(event)
{
	model.selectedGraph = kCPUGraphIdentifier;
	updateUI();
}

function clickGraphNetworkButton(event)
{
	model.selectedGraph = kNetworkGraphIdentifier;
	updateUI();
}

function clickGraphDiskButton(event)
{
	if(model.selectedGraph == kDiskGraphIdentifier) {
		cycleSelectedDiskGraph();
	}
	else {
		model.selectedGraph = kDiskGraphIdentifier;
		updateUI();
	}
}

function setTimeScale(timeScale)
{
	if(!(timeScale == kHourTimeScale || timeScale == kDayTimeScale || timeScale == kWeekTimeScale)) {
		timeScale = kHourTimeScale;
	}

	var hourButton = document.getElementById('graphTimeScale1H');
	var dayButton = document.getElementById('graphTimeScale1D');
	var weekButton = document.getElementById('graphTimeScale1W');

	hourButton.className = (timeScale == kHourTimeScale) ? 'selectedTimeScale' : 'regularTimeScale';
	dayButton.className  = (timeScale == kDayTimeScale) ? 'selectedTimeScale' : 'regularTimeScale';
	weekButton.className = (timeScale == kWeekTimeScale) ? 'selectedTimeScale' : 'regularTimeScale';
	
	var oldTimeScale = model.graphTimeScale;
	model.graphTimeScale = timeScale;

	updateGraphs();
}

function clickGraphFadeInArea(event)
{
	if(model.selectedGraph == kDiskGraphIdentifier) {
		cycleSelectedDiskGraph(event);
	}
}

function cycleSelectedDiskGraph(event)
{
	model.selectedDiskGraphIndex++;
	updateDiskGraph();
}
