var authenticated = false;

var refreshStatePayload = {
	"command": "batchRequest",
	"sendResponsesAsDictionary": true,
	"requestsArray": [
			{
				"name": "servermgr_info",
				"request": { "command": "getState", "variant": "withDetails" }
			},
			{
				"name": "servermgr_addressbook",
				"request": { "command": "getState", "variant": "withDetails" }
			},
			{
				"name": "servermgr_calendar",
				"request": { "command": "getState", "variant": "withDetails" }
			},
			{
				"name": "servermgr_jabber",
				"request": { "command": "getState", "variant": "withDetails" }
			},
			{
				"name": "servermgr_afp",
				"request": { "command": "getState", "variant": "withDetails" }
			},
			{
				"name": "servermgr_mail",
				"request": { "command": "getState", "variant": "withDetails" }
			},
			{
				"name": "servermgr_teams",
				"request": { "command": "getState", "variant": "withDetails" }
			},
			{
				"name": "servermgr_web",
				"request": { "command": "getState", "variant": "withDetails" }
			},
			{
				"name": "servermgr_vpn",
				"request": { "command": "getState", "variant": "withDetails" }
			}
		]
	};

var refreshAllGraphsPayload = {
	"command": "batchRequest",
	"sendResponsesAsDictionary": true,
	"requestsArray": [
			{
				"name": "servermgr_info",
				"request": { "command": "getHistory", "timeScale": kWeekTimeScale, "variant": "v1+v15+v16" }
			},
			{
				"name": "servermgr_info",
				"request": { "command": "getHardwareInfo" }
			}
	]
};

function doRefresh()
{
	doRefreshGraphs();
	doRefreshState();
}

function doRefreshGraphs()
{
	var secSinceLastGraphRefresh = ((new Date()) - lastStateRefreshDate) / 1000;
	
	// only allow the refresh to occur if its our first time
	// or if its been > 60 seconds since the last refresh
	if(model.graphData.length == 0 || secSinceLastGraphRefresh >= 60) {
		var payload = refreshAllGraphsPayload;
		if(model.graphData.length == 0) {
			payload.requestsArray[0].request.timeScale = kWeekTimeScale;
			if(debugLogging) { alert("doRefreshGraphs: full refresh") };
		}
		else {
			payload.requestsArray[0].request.timeScale = secSinceLastGraphRefresh + 60;
			if(debugLogging) { alert("doRefreshGraphs: partial refresh: " + payload.requestsArray[0].request.timeScale); }
		}
	}
	
	if(payload != undefined) {
		lastGraphRefreshDate = new Date();
		var requestInObjC = convertObjectToObjC(payload, XSAdminSessionPlugIn);
		XSAdminSessionPlugIn.sendRequest(requestInObjC, 'servermgr_info', 'finishedGraphsBatchRequest');
	}
}

function doRefreshState()
{
	lastStateRefreshDate = new Date();

	var requestInObjC = convertObjectToObjC(refreshStatePayload, XSAdminSessionPlugIn);
	XSAdminSessionPlugIn.sendRequest(requestInObjC, 'servermgr_info', 'finishedServicesBatchRequest');
}


function finishedGraphsBatchRequest(response)
{
	if(response != undefined) {
		if (response.command == 'batchRequest') {
			if(debugLogging) { alert("batchRequest for graphs returned"); }
			var plugin;
			var command;
			plugin = response['servermgr_info']; if(plugin != undefined) {
				command = plugin['getHistory']; if(command != undefined) {
					handleGetHistoryResponse(command);
				}
				command = plugin['getHardwareInfo']; if(command != undefined) {
					handleGetHardwareInfoResponse(command);
				}
			}
		}
	}
	
	updateGraphs();
}

function finishedServicesBatchRequest(response)
{
	if(response != undefined) {
		if (response.command == 'batchRequest') {
			if(debugLogging) { alert("batchRequest for services returned"); }
			var plugin;
			var command;
			plugin = response['servermgr_info']; if(plugin != undefined) {
				command = plugin['getState']; if(command != undefined) {
					// get the hostname...
					model.hostname = command.hostName;
				}
				command = plugin['getHistory']; if(command != undefined) {
					handleGetHistoryResponse(command);
				}
				command = plugin['getHardwareInfo']; if(command != undefined) {
					handleGetHardwareInfoResponse(command);
				}
			}
			plugin = response['servermgr_addressbook']; if(plugin != undefined) {
				command = plugin['getState']; if(command != undefined) {
					model.services.addressbook.state = (command.state == 'RUNNING') ? 1 : 0;
                    
					requests = command['requestsPerHour']; if(requests == undefined) { requests = "0"; }
					model.services.addressbook.status = requests + localizedStrings[" hits/hr"];
				}
			}
			plugin = response['servermgr_calendar']; if(plugin != undefined) {
				command = plugin['getState']; if(command != undefined) {
					model.services.calendar.state = (command.state == 'RUNNING') ? 1 : 0;

					stats = command['stats'];
					events = 0; if(stats != undefined) { events = stats['eventCount']; } // 10.5
					requests = command['requestsPerHour']; // 10.6
					if(requests != undefined) {
						model.services.calendar.status = requests + localizedStrings[" hits/hr"];
					}
					else {
						model.services.calendar.status = events + localizedStrings[" events"];
					}
				}
			}	
			plugin = response['servermgr_jabber']; if(plugin != undefined) {
				command = plugin['getState']; if(command != undefined) {
					model.services.ichat.state = (command.state == 'RUNNING') ? 1 : 0;
					model.services.ichat.status = command.currentConnections + localizedStrings[" connections"];
				}
			}	
			plugin = response['servermgr_afp']; if(plugin != undefined) {
				command = plugin['getState']; if(command != undefined) {
					model.services.sharing.state = (command.state == 'RUNNING') ? 1 : 0;
					model.services.sharing.status = command.currentConnections + localizedStrings[" connections"];
				}
			}	
			plugin = response['servermgr_mail']; if(plugin != undefined) {
				command = plugin['getState']; if(command != undefined) {
					model.services.mail.state = (command.state == 'RUNNING') ? 1 : 0;

					var connections = 0;
					var protocols = command['protocolsArray'];
					for (var i=0; i<protocols.length; i++) {
						var p = protocols[i];
						connections = connections + p['active'];
					}
					model.services.mail.status = connections + localizedStrings[" connections"];
				}
			}	
			plugin = response['servermgr_web']; if(plugin != undefined) {
				command = plugin['getState']; if(command != undefined) {
					model.services.web.state = (command.state == 'RUNNING') ? 1 : 0;

					hitsToday = command['totalRequestsToday'];
					hitsTotal = command['totalRequests'];
					if(hitsToday != undefined) {
						model.services.web.status = hitsToday + localizedStrings[" hits today"];
					}
					else {
						model.services.web.status = hitsTotal + localizedStrings[" total hits"];
					}
				}
			}
			plugin = response['servermgr_vpn']; if(plugin != undefined) {
				command = plugin['getState']; if(command != undefined) {
					model.services.vpn.state = (command.state == 'RUNNING') ? 1 : 0;

					var connections = command['servers']['com.apple.ppp.l2tp']['CurrentConnections'];
					model.services.vpn.status = connections + localizedStrings[" connections"];
				}
			}
		}
	}
	
	updateUI();
}

function handleGetHistoryResponse(response)
{
	if(debugLogging) { alert("handleGetHistoryResponse: " + response); }
	
	if(response.samplesArray.length > 0) {
		if(model.graphData.length == 0) {
			// we have no graphData, replace it with the new stuff...
			model.graphData = response.samplesArray;
		}
		else {
			// we have existing graphData, try to merge in the new stuff...
			var currentData = model.graphData;

			var reversedNewSamplesArray = response.samplesArray;
			reversedNewSamplesArray.reverse();
			
			currentData.reverse();
			var lastCurrentSample = currentData[currentData.length - 1];
			var lastCurrentSampleT = lastCurrentSample.t;
			for(var i in reversedNewSamplesArray) {
				if(reversedNewSamplesArray[i].t > lastCurrentSampleT) {
					currentData.push(reversedNewSamplesArray[i]);
				}
			}
			
			currentData.reverse();
			model.graphData = currentData;
		}

	}
	else {
		response.samplesArray = [];
	}
}

function handleGetHardwareInfoResponse(response)
{
	model.diskGraphData = response.volumeInfosArray;
}
