var authenticated = false;
var loginCredentialsChanged = false;

var hostname = null;
var username = null;
var password = null;

var showingBack = false;

var kInvalidOSErrorCode = -105;

//
// FLIPPING FRONT AND BACK
//

function flipToBack(event) {
	if(showingBack == true)
		return;
	
	var front = document.getElementById("front");
	var back = document.getElementById("back");
	
	if (window.widget)
	{
		widget.prepareForTransition("ToBack");
	}
	
	stopTimer();
	updateAuthInputFields();
	showingBack = true;

	front.style.display="none";
	back.style.display="block";
	
	if (window.widget)
		setTimeout ('widget.performTransition();', 0);
	
	loginCredentialsChanged = false;

	if(event) {
		event.stopPropagation();
		event.preventDefault();
	}
}


function flipToFront(event)
{
	if(showingBack == false)
		return;
	
	var front = document.getElementById("front");
	var back = document.getElementById("back");
	
	if (window.widget)
		widget.prepareForTransition("ToFront");
	
	front.style.display="block";
	back.style.display="none";

	showingBack = false;
	doRefresh();
	startTimer();
	
	if (window.widget)
		setTimeout ('widget.performTransition();', 0);	
}

//
// AUTH CREDENTIAL STUFF
//


function updateAuthInputFields()
{
	document.getElementById('serverInput').value = hostname;
	document.getElementById('userInput').value = username;
	document.getElementById('passwordInput').value = password;	
}

function saveAuthCredentialsToPrefs()
{
	widget.setPreferenceForKey(hostname, createkey("hostname"));
	widget.setPreferenceForKey(username, createkey("username"));
	savePasswordToKeychain();
}

function getAuthCredentialsFromPrefs()
{
	hostname = widget.preferenceForKey(createkey("hostname"));
	username = widget.preferenceForKey(createkey("username"));
	
	var keychainPassword = getPasswordFromKeychain();
	if(keychainPassword && keychainPassword.length) {
		password = keychainPassword;
	}
	else {
		password = "";
	}
	
	// if we're running locally on a server, and there isn't a
	// hostname or username defined, fill in the defaults with the local server
	if(hostname == undefined && username == undefined && XSAdminSessionPlugIn.localMachineIsServer) {
		hostname = XSAdminSessionPlugIn.defaultHostName;
		username = XSAdminSessionPlugIn.defaultUserName;
	}
}

function getPasswordFromKeychain()
{
	var keychainPassword = XSAdminSessionPlugIn.getPasswordFromKeychain(hostname, username);
	return keychainPassword;
}

function savePasswordToKeychain()
{
	XSAdminSessionPlugIn.archivePasswordToKeychain(password, hostname, username);
}

//
// AUTHENTICATION AND HANDLING ERRORS
//

function authToServer()
{
	var statusLabel = document.getElementById('statusLabel');

	if(hostname && username && password) {
		alert("Connecting to server...");
		statusLabel.innerText = localizedStrings["Connecting..."];
		
		authenticated = false;
		XSAdminSessionPlugIn.initializeSessionForServer(hostname, username, password, "handleAuthResponse");		
	}
	else {
		if(!hostname)
			hostname = "";
		if(!username)
			username = "";
		if(!password)
			password = "";
		
		statusLabel.innerText = localizedStrings["Not connected"];

		flipToBack();
	}
}

function handleAuthResponse(responseCode)
{
	resetModel();
	
	if (responseCode == 200) {
		// we also need to make sure we're on a 10.5+ server...
		sendGetStateToCheckOSVersion();
	}
	else {
		authError(responseCode);
	}
}

function authSuccess()
{
	authenticated = true;

	var statusLabel = document.getElementById('statusLabel');
	statusLabel.innerText = localizedStrings["Connected"];

	saveAuthCredentialsToPrefs();
	
	if(showingBack)
		flipToFront();
	else 
		doRefresh();
}

function authError(code)
{
	var statusLabel = document.getElementById('statusLabel');
	
	if(code == 0) {
		statusLabel.innerText = localizedStrings["Network error"];
	} else if (code == 401) {
		statusLabel.innerText = localizedStrings["Authentication failed"];
	} else if (code == kInvalidOSErrorCode) {
		statusLabel.innerText = localizedStrings["Requires Mac OS X Server 10.5"];
	} else {
		statusLabel.innerText = localizedStrings["Connection failed"];
	}

	alert("Authentication failed: " + code);	
	flipToBack();
}

function sendGetStateToCheckOSVersion()
{
	var requestInObjC = convertObjectToObjC( { "command" : "getState" }, XSAdminSessionPlugIn);
	XSAdminSessionPlugIn.sendRequest(requestInObjC, 'servermgr_info', 'handleGetStateToCheckOSVersionResponse');
}

function handleGetStateToCheckOSVersionResponse(response)
{
	var isValidOS = false;
	if(response != undefined) {
		var version = response['serverVersion'];
		if(version != undefined && version.indexOf("10.5") >= 0) {
			isValidOS = true;
		}
	}
	
	if(isValidOS == false) {
		authError(kInvalidOSErrorCode);
	}
		
	authSuccess();	
}


//
// 
//

function selectDone(event)
{
	authToServer();
}



function serverInput(event)
{
	loginCredentialsChanged = true;
	hostname = document.getElementById('serverInput').value;
}

function serverKeypress(event)
{
    if(event.keyIdentifier == 'Enter') {
        document.getElementById('userInput').focus();
	}
}

function userInput(event)
{
	loginCredentialsChanged = true;
	username = document.getElementById('userInput').value;
}

function userKeypress(event)
{
    if(event.keyIdentifier == 'Enter') {
        document.getElementById('passwordInput').focus();
	}
}

function passwordInput(event)
{	
	loginCredentialsChanged = true;
	password = document.getElementById('passwordInput').value;
}

function passwordKeypress(event)
{
    if(event.keyIdentifier == 'Enter') {
		authToServer();
	}
}
