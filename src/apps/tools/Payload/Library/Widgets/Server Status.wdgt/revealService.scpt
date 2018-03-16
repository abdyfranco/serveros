property target_hostname : ""
property target_pane : ""

on run argv
	set target_hostname to item 1 of argv
	set target_pane to item 2 of argv
	
	tell application "Server Preferences"
		activate
		set matchingDocuments to (documents whose hostname is target_hostname)
		if ((count of matchingDocuments) is not 0) then
			tell (first pane of (first document whose hostname is target_hostname) whose bundle identifier is target_pane)
				reveal
			end tell
		else
			-- TODO: create a document with the appropriate host / user / password...
		end if
	end tell
end run
