function addElementToArrays(keyArray, valueArray, key, value)
{
	if (typeof(value) == "object")
	{
		if (value.constructor == Array)
		{
			keyArray.push(key);
			valueArray.push("__begin_array__");
			addArrayToArrays(keyArray, valueArray, value);
			keyArray.push("__end__");
			valueArray.push("__end__");
		}
		else
		{
			keyArray.push(key);
			valueArray.push("__begin_dictionary__");
			addStructToArrays(keyArray, valueArray, value);
			keyArray.push("__end__");
			valueArray.push("__end__");
		}
	}
	else
	{
		keyArray.push(key);
		valueArray.push(value);
	}
}

function addArrayToArrays(keyArray, valueArray, array)
{
	var count = array.length;
	for (index=0; index<count; index++)
		addElementToArrays(keyArray, valueArray, "__array_value__", array[index]);
}

function addStructToArrays(keyArray, valueArray, object)
{
	for (i in object)
		addElementToArrays(keyArray, valueArray, i, object[i]);
}

function convertObjectToObjC(object, helper)
{
	var keyArray = new Array();
	var valueArray = new Array();

	addStructToArrays(keyArray, valueArray, object);
	
	result = helper.convertArraysToDictionary(keyArray, valueArray);
	return result;
}

function convertArraysToObject(keyArray, valueArray)
{	
	var containerStack = new Array();
	var currentContainer = new Object();
	
	var count = keyArray.length;
	
	for (index=0; index<count; index++ )
	{
		var isContainer;
		var key = keyArray[index];
		var object = valueArray [index];
		
		if (object == "__begin_dictionary__")
		{
			object = new Object();
			isContainer = true;
		}
		else if (object == "__begin_array__")
		{
			object = new Array();
			isContainer = true;
		}
		else if (object == "__end__")
		{
			currentContainer = containerStack.pop();
			object = null;
			isContainer = false;
		}
		else isContainer = false;
		
		if (object != null)
		{
			if (currentContainer.constructor == Array)
				currentContainer.push(object);
			else
				currentContainer[key] = object;
		}
			
		if (isContainer == true)
		{
			containerStack.push(currentContainer);
			currentContainer = object;
		}
	}
	
	return currentContainer;
}
