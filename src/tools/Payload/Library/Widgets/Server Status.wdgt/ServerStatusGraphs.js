//
// OverviewGraphs.js
// Draws the actual graphs, using data already present in the global model.
// 

// TODO: should prune or average out data that we won't see (eg: detail in the 1+ graph)
// TODO: not yet accounting for 'gaps' in the graph... (need to add padding?)

function updateCPUGraph() {
	var canvas = document.getElementById('cpuGraphCanvas');
	var context = canvas.getContext('2d');
	var width = canvas.width;
	var height = canvas.height;

	var cpuGraphTopLabel = document.getElementById('cpuGraphTopLabel');
	
	context.clearRect(0, 0, width, height);

	var cpuKey = 'v1';
	
	var samplesAndMinMaxValues = samplesAndMinMaxInTimescaleForKeys([ cpuKey ]);
	var samples = samplesAndMinMaxValues[0];
	var minMaxValues = samplesAndMinMaxValues[1];

	var count = samples ? samples.length : 0;
	if(count <= 0) {
		if(debugLogging) {
			alert("updateCPUGraph(): No samples to draw, returning");
		}
		cpuGraphTopLabel.innerText = localizedStrings["CPU Utilization: Unknown"];
		return;
	}

	cpuGraphTopLabel.innerText = localizedStrings["CPU Utilization: "] + roundNumber((samples[0][cpuKey] / 100), 0)  + localizedStrings["%"];

	
	context.save();

	// flip the context, so that (0,0) is the bottom-left
	context.translate(0, height); context.scale(1,-1);
	
	context.save();
	{
		// translate by two so we can draw the bottom of graph without affecting the data
		context.translate(0, 2);
		height = height - 2;
		
		if(count > 2) {
			var minY = 0;
			var maxY = 10000;
			var maxT = samples[0].t;
			var minT = maxT - model.graphTimeScale;
			
			var points = createXYList(minT, maxT, width, minY, maxY, height, samples, cpuKey);
			var length = points.length;

			// create our blue gradient
			var cpuGradient = context.createLinearGradient(0, 0, 0, height);
			cpuGradient.addColorStop(0, "rgb(62, 101, 158)");
			cpuGradient.addColorStop(1, "rgb(180, 215, 255)");
			
			context.fillStyle = cpuGradient;
			context.lineWidth = 2.0;
			context.strokeStyle = "rgb(200, 240, 255)";

			context.save();
			
			// cpu path: fill
			context.beginPath();
			context.moveTo(0,0);
			for(var i = 0 ; i < length ; i++ ) {
				var point = points[i];
				context.lineTo(point[0], point[1]);
			}
			context.lineTo(width, 0);
			context.closePath();
			context.fill();

			// cpu path: stroke
			context.beginPath();
			context.moveTo(points[0][0],points[0][1]);
			for(var i = 1 ; i < length ; i++ ) {
				var point = points[i];
				context.lineTo(point[0], point[1]);
			}		
			context.stroke();
			context.restore();
		}
		
		height = height + 2;
	}
	context.restore();
	
	drawGridlines(context, width, height, 4, true);
	
	context.restore();
}


function updateNetworkGraph() {
	var canvas = document.getElementById('networkGraphCanvas');
	var context = canvas.getContext('2d');
	var width = canvas.width;
	var height = canvas.height;
	
	var networkGraphTopLabel = document.getElementById('networkGraphTopLabel');
	
	context.clearRect(0, 0, width, height);
	
	var inKey = 'v15';
	var outKey = 'v16';
	
	var samplesAndMinMaxValues = samplesAndMinMaxInTimescaleForKeys([ inKey, outKey ]);
	var samples = samplesAndMinMaxValues[0];
	var minMaxValues = samplesAndMinMaxValues[1];
	
	var count = samples ? samples.length : 0;
	if(count <= 0) {
		if(debugLogging) {
			alert("updateNetworkGraph(): No samples to draw, returning");
		}
		networkGraphTopLabel.innerText = localizedStrings["Network Load: Unknown"];
		return;
	}
	
	var latestIn = samples[0][inKey];
	var latestOut = samples[0][outKey];
	var latestTotal = latestIn + latestOut;
	var kilobytesPerSecond = roundNumber(latestTotal / 1024, 0)
	if(isNaN(kilobytesPerSecond)) {
		 kilobytesPerSecond = 0; 
	}
	networkGraphTopLabel.innerText = localizedStrings["Network Load: "] + kilobytesPerSecond + localizedStrings["KB/s"]
		
	// create our gradients
	var networkInGradient = context.createLinearGradient(0, 0, 0, height / 2.0);
	networkInGradient.addColorStop(0, "rgb(62, 101, 158)");
	networkInGradient.addColorStop(1, "rgb(180, 215, 255)");
	var networkOutGradient = context.createLinearGradient(0, 0, 0, height / 2.0);
	networkOutGradient.addColorStop(0, "rgb(62, 101, 158)");
	networkOutGradient.addColorStop(1, "rgb(180, 215, 255)");
	
	
	context.save();
	// flip the context, so that (0,0) is the bottom-left
	context.translate(0,height);
	context.scale(1,-1);
		
	if(count > 2) {
		context.lineWidth = 1.0;
		context.strokeStyle = "rgb(200, 240, 255)";
			
		var inMax = minMaxValues[inKey]['max'];
		var outMax = minMaxValues[outKey]['max'];

		var minY = 0;
		var maxY = outMax; if(inMax > maxY) { maxY = inMax };
		var maxY = maxY * 1.05; // give a 5% buffer...
		var maxT = samples[0].t;
		var minT = maxT - model.graphTimeScale;
		
		var inPoints = createXYList(minT, maxT, width, minY, maxY, height / 2.0, samples, inKey);
		var outPoints = createXYList(minT, maxT, width, minY, maxY, height / 2.0, samples, outKey);
		var inLength = inPoints.length;
		var outLength = inPoints.length;
		
		context.save();
		{
			// scale by half height, translate to upper portion of graph
			context.translate(0, (height / 2.0) + 0.0);
			context.scale(1.0, 1.0);
			
			// network in: fill path
			context.beginPath();
			context.moveTo(0,0);
			for(var i = 0 ; i < inLength ; i++ ) {
				var point = inPoints[i];
				context.lineTo(point[0], point[1]);
			}
			context.lineTo(width, 0);
			context.closePath();
			context.fillStyle = networkInGradient;
			context.fill();
			
			// network in: stroke path
			context.beginPath();
			context.moveTo(inPoints[0][0],inPoints[0][1]);
			for(var i = 1 ; i < inLength ; i++ ) {
				var point = inPoints[i];
				context.lineTo(point[0], point[1]);
			}		
			context.stroke();
		}
		context.restore();

		
		
		context.save();
		{
			// scale by half height, flip upside down
			context.translate(0, (height / 2.0) - 1.0);
			context.scale(1.0, -1);
			
			// network out: fill path
			context.beginPath();
			context.moveTo(0,0);
			for(var i = 0 ; i < outLength ; i++ ) {
				var point = outPoints[i];
				context.lineTo(point[0], point[1]);
			}
			context.lineTo(width, 0);
			context.closePath();
			context.fillStyle = networkOutGradient;
			context.fill();

			// network out: stroke path
			context.beginPath();
			context.moveTo(outPoints[0][0],outPoints[0][1]);
			for(var i = 1 ; i < outLength ; i++ ) {
				var point = outPoints[i];
				context.lineTo(point[0], point[1]);
			}		
			context.stroke();
		}
		context.restore();
	}
	
	drawGridlines(context, width, height, 4, true);

	// draw middle dividing line...
	context.fillStyle = "rgba(45, 45, 45, 1.0)";
	context.fillRect(0, (height / 2.0) - 1.0, width, 1);

	
	context.restore();
}

function drawGridlines(context, width, height, sections, drawBottom)
{
	context.save();
	
	for(var i = 0; i <= sections ; i++) {
		var x = width * (i * (1 / sections));
		if(i == sections)
			x = x - 1.00;

		context.fillStyle = "rgba(255, 255, 255, 0.2)";
		context.fillRect(x , 0, 1, height);
	}
	
	if(drawBottom) {
		context.fillStyle = "rgba(35, 35, 35, 1.0)";
		context.fillRect(1, 1, width - 2, 1);
		context.fillStyle = "rgba(97, 97, 97, 1.0)";
		context.fillRect(0, 0, width, 1);
	}
	
	context.restore();
}


function updateDiskGraph() {
	var canvas = document.getElementById('diskGraphCanvas');
	var context = canvas.getContext('2d');
	var width = canvas.width;
	var height = canvas.height;
	var pi = 3.1415926;
	
	context.clearRect(0, 0, width, height);

	var diskNameLabel = document.getElementById('diskGraphTopLabel');
	var usedLabel = document.getElementById('diskGraphAmountUsedLabel');
	var freeLabel = document.getElementById('diskGraphAmountFreeLabel');
	
	if(model.selectedDiskGraphIndex >= model.diskGraphData.length) {
		model.selectedDiskGraphIndex = 0;
	}

	var selectedDisk = model.diskGraphData[model.selectedDiskGraphIndex];
	if(!selectedDisk) {
		if(debugLogging) {
			alert("updateDiskGraph(): No disk information yet, returning");
		}
		return;
	}

	var diskName = selectedDisk['name'];
	var freeBytes = selectedDisk['freeBytes'];
	var totalBytes = selectedDisk['totalBytes'];
	var usedBytes = totalBytes - freeBytes;
	var percentFull = usedBytes / totalBytes;
	
	diskNameLabel.innerText = localizedStrings["Disk Usage: "] + diskName;
	var usedGB = usedBytes / 1000 / 1000 / 1000;
	usedLabel.innerText =  roundNumber(usedGB, 1) + localizedStrings[" GB used"]
	var freeGB = freeBytes / 1000 / 1000 / 1000;
	freeLabel.innerText =  roundNumber(freeGB, 1) + localizedStrings[" GB free"]
	
	
	context.save();
	{
		var radius = width / 2.0 * .90;
		var depth = 8;
		var centerX = 0;
		var centerY = 0;
		
		var diskGradient = context.createLinearGradient(0, -radius, 0, radius);
		diskGradient.addColorStop(0, "rgb(227, 255, 227)");
		diskGradient.addColorStop(1, "rgb(59, 155, 60)");

		var usedDiskGradient = context.createLinearGradient(0, -radius, 0, radius);
		usedDiskGradient.addColorStop(0, "rgb(132, 190, 229)");
		usedDiskGradient.addColorStop(1, "rgb(59, 98, 155)");
		
		var bgGradient = context.createLinearGradient(0, 0, 0, -radius);
		bgGradient.addColorStop(0, "rgba(19, 30, 46, 1.0)");
		bgGradient.addColorStop(1, "rgba(66, 85, 100, 1.0)");
		
		context.translate(0, height);
		context.scale(1,-1);
		context.translate(width / 2.0, height / 2.0);
		context.translate(0, depth / 2.0);
		
		context.scale(1, 0.25);

		// draw the 3d disk layer...
        context.save();
        {
            context.strokeStyle = "rgba(0, 0, 0, 0.75)";
            context.fillStyle = bgGradient;
            context.beginPath();
            context.moveTo(0,0);
            context.lineTo(radius, 0);
            context.arc(0, -depth * 4, radius, 0, pi, 1);
            context.lineTo(-radius, 0);
            context.closePath();
            context.fill();
            context.stroke();
        }
        context.restore();

		// draw whole disk
		context.fillStyle = diskGradient;
		context.beginPath();
		context.arc(centerX, centerY, radius, 0, (2 * pi), 0);
		context.fill();
		context.stroke();

		// draw "used" area
		var startRadians = pi / 2;
		var endRadians = startRadians - (2 * pi * percentFull);
		context.fillStyle = usedDiskGradient;
		context.strokeStyle = "rgba(0, 0, 0, 0.50)";
		context.beginPath();
		context.arc(centerX, centerY, radius, startRadians, endRadians, 1);
		context.lineTo(centerX, centerY);
		context.closePath();
		context.fill();
		context.stroke();
	}
	context.restore();
}




function samplesAndMinMaxInTimescaleForKeys(keysArray)
{
	// TODO: when timeScale gets very large, we should average samples to return a certain maximum
	// this will keep drawing performance good, and improve the look of the graph 'stroke'
	
	// model.graphData is an ordered array with newest (hightest t) first
	var samples = model.graphData;
	var timeScale = model.graphTimeScale;
	var matchingSamples = [];
	var minMaxValues = {};
	
	// since we have to iterate through all the samples here anyway, we're also
	// going to gather the min/max values for all of the keys (keysArray) we're interested in...
	for(var i = 0; i < keysArray.length ; i++) {
		var key = keysArray[i];
		minMaxValues[key] = { 'min' : 0, 'max' : 0 };
	}
	
	if(samples.length < 2)
		return [matchingSamples, minMaxValues];
	
	var firstSample = samples[0];
	var newestT = firstSample.t;
		
	for(var i = 0; i < samples.length ; i++) {
		var sample = samples[i];
		if(newestT - sample.t <= timeScale) {
			matchingSamples[i] = samples[i];
			for(var j = 0; j < keysArray.length ; j++) {
				// check for min/max values of each key
				var key = keysArray[j];
				var value = samples[i][key];
				if(value) {
					if(value > minMaxValues[key]['max'])
						minMaxValues[key]['max'] = value;
					if(value < minMaxValues[key]['min'])
						minMaxValues[key]['min'] = value;
				}
			}
		}
		else {
			break;
		}
	}
	
	return [ matchingSamples, minMaxValues ];
}

function createXYList(minX, maxX, width, minY, maxY, height, samples, id)
{
	// return an array of points to graph
	// the first point in our array will correspond to the left-most sample in the graph
	// (which is reversed from the 'samples' we get from servermgrd)
	
	var count = samples.length;
	var points = new Array(count);
	
	var deltaX = maxX - minX;
	var deltaY = maxY - minY;
	
	
	for(var i = count-1; i >= 0 ; i--) {
		sample = samples[i];
		value = samples[i][id];
		var x = (sample['t'] - minX) / deltaX * width;
		var y = (sample[id] - minY) / deltaY * height;
		points[count-1-i] = [x, y];
	}
	
	return points;
}

function roundNumber(float, dec) {
	return Math.round(float*Math.pow(10,dec))/Math.pow(10,dec)
}

