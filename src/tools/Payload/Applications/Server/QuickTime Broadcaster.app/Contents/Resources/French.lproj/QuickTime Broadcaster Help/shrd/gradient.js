/*************************

Cross Browser Gradient Backgrounds
v1.0
Last Revision: 11.03.2005
steve@slayeroffice.com

please leave this notice in tact.

should you improve upon this code, please
let me know so that I may update the version
hosted on slayeroffice

--- to use --
reference this file (on your own server) as a javascript src
in the head of your document. give the elements
you want a gradient background applied to a class as such:

class="gradient 000000 ffffff horizontal"

See http://slayeroffice.com/code/gradient/ for more examples.


*************************/

window.addEventListener?window.addEventListener("load",createGradient,false):window.attachEvent("onload",createGradient);

function createGradient() {
	if(!document.getElementById)return;
	
	objArray = getGradientObjects();
	if(!objArray.length) return;
	
	for(i=0;i<objArray.length;i++) {
		params = objArray[i].className.split(" ");
		if(document.all && !window.opera) {
			objArray[i].style.width = objArray[i].offsetWidth + "px";
			params[3] == "horizontal"?gType = 1:gType = 0;
			objArray[i].style.filter = "progid:DXImageTransform.Microsoft.Gradient(GradientType="+gType+",StartColorStr=\"#" + params[1] + "\",EndColorStr=\"#" + params[2] + "\")";
	} else {
			colorArray = createColorPath(params[1],params[2]);
			x=0;y=0;
			if(params[3] == "horizontal") {
				w=Math.round(objArray[i].offsetWidth/colorArray.length);
				if(!w)w=1;
				h = objArray[i].offsetHeight;
			} else {
				h = Math.round(objArray[i].offsetHeight/colorArray.length);
				if(!h) h =1;
				w = objArray[i].offsetWidth;
			}
			makeGrandParent(objArray[i]);
			tmpDOM = document.createDocumentFragment();
			for(p=0;p<colorArray.length;p++) {
				g = document.createElement("div");
				g.setAttribute("style","position:absolute;z-index:0;top:" + y + "px;left:" + x + "px;height:" + h + "px;width:100%;" + "background-color:rgb(" + colorArray[p][0] + "," + colorArray[p][1] + "," + colorArray[p][2] + ");");
				params[3] == "horizontal"?x+=w:y+=h;
				tmpDOM.appendChild(g);
				if(y>=objArray[i].offsetHeight || x >= objArray[i].offsetWidth) break;
			}
			objArray[i].appendChild(tmpDOM);
			tmpDOM = null;
		}
	}
}

function getGradientObjects() {
	a = document.getElementsByTagName("*");
	objs = new Array();
	for(i=0;i<a.length;i++) {
		c = a[i].className;
		if(c != "") if(c.indexOf("gradient") == 0) objs[objs.length] = a[i];
	} 
	return objs;
}
	
function createColorPath(color1,color2) {
	colorPath = new Array();
	colorPercent = 1.0;
	do {
		colorPath[colorPath.length]=setColorHue(longHexToDec(color1),colorPercent,longHexToDec(color2));
		colorPercent-=.01;
	} while(colorPercent>0);
	return colorPath;
}
		
function setColorHue(originColor,opacityPercent,maskRGB) {
	returnColor=new Array();
	for(w=0;w<originColor.length;w++) returnColor[w] = Math.round(originColor[w]*opacityPercent) + Math.round(maskRGB[w]*(1.0-opacityPercent));
	return returnColor;
}

function longHexToDec(longHex) {
	return new Array(toDec(longHex.substring(0,2)),toDec(longHex.substring(2,4)),toDec(longHex.substring(4,6)));	
}

function toDec(hex) {	
	return parseInt(hex,16);
}
	
function makeGrandParent(obj) {
	disp = document.defaultView.getComputedStyle(obj,'').display;
	disp == "block"?nSpan = document.createElement("div"):	nSpan = document.createElement("span");
	mHTML = obj.innerHTML;
	obj.innerHTML = "";
	nSpan.innerHTML = mHTML;
	nSpan.setAttribute("style","position:relative;z-index:10;");
	obj.appendChild(nSpan);
}