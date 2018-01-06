var model = null;
var graphTimeScaleFader;
var diskGraphFader;

function resetModel()
{
	var defaultModel = {
		"hostname"					: localizedStrings["Not Connected"],
		"selectedGraph"				: kCPUGraphIdentifier,
		"graphTimeScale"			: 3600,
		"graphData"					: [],
		"diskGraphData"				: [],
		"selectedDiskGraphIndex"	: 0,
		"services" :
		{
			"sharing" :
			{
				"state" : 0,
				"status" : "-",
			},
			"addressbook" :
			{
				"state" : 0,
				"status" : "-",
			},
			"calendar" :
			{
				"state" : 0,
				"status" : "-",
			},
			"ichat" :
			{
				"state" : 0,
				"status" : "-",
			},
			"mail" :
			{
				"state" : 0,
				"status" : "-",
			},
			"web" :
			{
				"state" : 0,
				"status" : "-",
			},
			"vpn" :
			{
				"state" : 0,
				"status" : "-",
			},
		},
	}
	
	model = defaultModel;
}

//
// UPDATE UI FROM MODEL
//
function updateUI()
{
	if(debugLogging) { alert("doing updateUI()"); }

	element = document.getElementById("titleText");
	element.innerText = model.hostname;

	updateServices();
	updateGraphMouseOvers();
}

function updateGraphMouseOvers()
{
	if(graphTimeScaleFader) { graphTimeScaleFader.remove(); }
	if(diskGraphFader) { diskGraphFader.remove(); }
	
	if(model.selectedGraph == kCPUGraphIdentifier) {
		graphTimeScaleFader = new FadeInOutNode(document.getElementById('graphFadeInArea'), document.getElementById('cpuGraphTopLabel'), document.getElementById('graphArea'), null);
	}
	else if(model.selectedGraph == kNetworkGraphIdentifier) {
		graphTimeScaleFader = new FadeInOutNode(document.getElementById('graphFadeInArea'), document.getElementById('networkGraphTopLabel'), document.getElementById('graphArea'), null);
	}
	else if (model.selectedGraph == kDiskGraphIdentifier) {
		diskGraphFader = new FadeInOutNode(document.getElementById('diskGraphShowOnMouseOver'), null, document.getElementById('graphArea'), null);		
	}	
}

function updateGraphs()
{
	if(debugLogging) { alert("*** updateGraphs starting"); }
	
	updateCPUGraph();
	updateNetworkGraph();
	updateDiskGraph();
	
	if(debugLogging) { alert("*** updateGraphs done"); }
}

function updateServices()
{
	var element;
	
	var serviceRows = ["sharingServiceRow", "addressbookServiceRow", "calendarServiceRow", "chatServiceRow", "mailServiceRow", "webServiceRow", "vpnServiceRow"];
	var serviceKeys = ["sharing", "addressbook", "calendar", "ichat", "mail", "web", "vpn"];
	var row;
	for ( var i=0; i < serviceRows.length ; i++)
	{
		var state = model.services[serviceKeys[i]].state;
		
		row = document.getElementById(serviceRows[i]);	
		if(row) {
			columns = row.getElementsByTagName("td");
			
			switch(state) {
			case 0:
				columns[1].getElementsByTagName("img")[0].src = "Images/BeadWhite.tiff";
				columns[3].innerText = localizedStrings["Off"];
				break;
			case 1:
				columns[1].getElementsByTagName("img")[0].src = "Images/BeadGreen.tiff";
				columns[3].innerText = model.services[serviceKeys[i]].status;
				break;
			default:
				columns[1].getElementsByTagName("img")[0].src = "Images/BeadRed.tiff";				
				columns[3].innerText = localizedStrings["Error"];
				break;
			}
		}
	}
	
	// update the selected button...
	var cpuButton = document.getElementById("graphCPUButton");
	var networkButton = document.getElementById("graphNetworkButton");
	var diskButton = document.getElementById("graphDiskButton");
	var cpuGraphArea = document.getElementById("cpuGraphArea");
	var networkGraphArea = document.getElementById("networkGraphArea");
	var diskGraphArea = document.getElementById("diskGraphArea");
	
	if(model.selectedGraph == kCPUGraphIdentifier) {
		cpuButton.className = "graphButton selected";
		cpuGraphArea.style.display="block";
		networkButton.className = "graphButton";
		networkGraphArea.style.display="none";
		diskButton.className = "graphButton";
		diskGraphArea.style.display="none";		
	}
	else if(model.selectedGraph == kNetworkGraphIdentifier) {
		cpuButton.className = "graphButton";
		cpuGraphArea.style.display="none";
		networkButton.className = "graphButton selected";
		networkGraphArea.style.display="block";
		diskButton.className = "graphButton";
		diskGraphArea.style.display="none";				
	}
	else if(model.selectedGraph == kDiskGraphIdentifier) {
		cpuButton.className = "graphButton";
		cpuGraphArea.style.display="none";
		networkButton.className = "graphButton";
		networkGraphArea.style.display="none";
		diskButton.className = "graphButton selected";
		diskGraphArea.style.display="block";				
	}
	else {
		alert("updateServices(): Unknown model.selectedGraph: " + model.selectedGraph);
		cpuButton.className = "graphButton";
		cpuGraphArea.style.display="none";		
		networkButton.className = "graphButton";
		networkGraphArea.style.display="none";
		diskButton.className = "graphButton";
		diskGraphArea.style.display="none";
	}	
}
