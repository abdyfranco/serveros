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

if (typeof apple_loc_strings == "undefined") {
	apple_loc_strings = {version:'1.0'};
}

var populateStrings = function(obj) {
	for (aProperty in obj) {
		apple_loc_strings[aProperty] = obj[aProperty];
	}
};

populateStrings({
	"_MenuItem.BigScreen": "Big Screen öffnen …",
	
	"_XC.BrowserTitle.BotSummary": "Xcode - Alle Bots",
	"_XC.BrowserTitle.BigScreen": "Xcode - Big Screen",
	"_XC.BrowserTitle.BotDetail": "Xcode - %@1 %@2",
	"_XC.ProductTitle": "Xcode",
	
	"_XC.Sources.AllBots.Title": "Alle Bots",
	"_XC.Sources.BigScreen.Title": "Big Screen",
	
	"_XC.Breadcrumb.Xcode": "Xcode",
	"_XC.Breadcrumb.Bots.Title": "Bots",
	"_XC.Breadcrumb.BigScreen.Title": "Big Screen",
	
	"_XC.Bot.Integration.Index": "Integrieren (%@)",
	"_XC.Bot.Default.Title": "Neuer Bot",
	"_XC.Bot.MenuItem.New.Title": "Neuer Bot …",
	"_XC.Bot.MenuItem.Delete.Title": "Bot löschen …",
    "_XC.Bot.MenuItem.DownloadLogs.Title": "Integrationsprotokolle laden ...",
	"_XC.Bot.MenuItem.CancelBotRun.Title": "Integration abbrechen",
	"_XC.Bot.MenuItem.CancelBotRun.Error": "Integration konnte nicht abgebrochen werden. Versuchen Sie es erneut.",
	"_XC.Bot.LatestIntegration.Title": "Letzte Integration",
	
	"_XC.Bot.Error.DisplayGeneric": "Bot konnte nicht angezeigt werden. Versuchen Sie, die Seite zu aktualisieren.",
	"_XC.BotRun.Error.DisplayGeneric": "Integration konnte nicht angezeigt werden. Möglicherweise wurde sie gelöscht.",
	"_XC.Bot.NotYetRun.Placeholder.Unauthenticated": "Melden Sie sich an, um eine Integration dieses Bots zu starten",
	"_XC.Bot.NotYetRun.Placeholder": "Auf „Integrieren“ klicken, um diesen Bot zu starten",
	"_XC.BotRun.NotYetCompleted.Placeholder": "Die Integration wurde noch nicht abgeschlossen",
	
	"_XC.Bot.Archive": "Archivieren",
	"_XC.Bot.Product": "Produkt",
	
	"_XC.Bot.LoadingMessage.Delete": "Bot wird gelöscht …",
	
	"_XC.Grouping.Header.Today": "Heute",
	"_XC.Grouping.Header.Yesterday": "Gestern",
	"_XC.Grouping.Header.ThisWeek": "Letzte 7 Tage",
	"_XC.Grouping.Header.LastWeek": "Letzte 14 Tage",
	"_XC.Grouping.Header.Other": "Andere",
	
	"_XC.FilterBarView.Filters.All.Title": "Alle",
	"_XC.FilterBarView.Filters.All.Tooltip": "Alle Testergebnisse einblenden …",
	"_XC.FilterBarView.Filters.Passed.Title": "Bestanden",
	"_XC.FilterBarView.Filters.Passed.Tooltip": "Bestandene Tests einblenden",
	"_XC.FilterBarView.Filters.Failed.Title": "Fehlgeschlagen",
	"_XC.FilterBarView.Filters.Failed.Tooltip": "Fehlgeschlagene Tests einblenden",
	
	"_XC.BotRunDetailFilterBarView.Filters.TargetDevice.ModelName.Title": "Gerät",
	"_XC.BotRunDetailFilterBarView.Filters.TargetDevice.ModelName.Tooltip": "Gerät",
	"_XC.BotRunDetailFilterBarView.Filters.TargetDevice.NativeArchitecture.Title": "Prozessor",
	"_XC.BotRunDetailFilterBarView.Filters.TargetDevice.NativeArchitecture.Tooltip": "Prozessor",
	"_XC.BotRunDetailFilterBarView.Filters.TargetDevice.OperatingSystemVersion.Title": "OS",
	"_XC.BotRunDetailFilterBarView.Filters.TargetDevice.OperatingSystemVersion.Tooltip": "OS",
	
	"_XC.BotRunDetailTable.Header.Title": "Testergebnisse",
	"_XC.BotRunDetailTable.NoTestsFound": "Keine Tests gefunden",
	"_XC.BotRunDetailTable.Title.TargetDevice.ModelName": "Gerät",
	"_XC.BotRunDetailTable.Title.TargetDevice.NativeArchitecture": "Prozessor",
	"_XC.BotRunDetailTable.Title.TargetDevice.OperatingSystemVersion": "OS",
	"_XC.BotRunDetailTable.Title.TargetDevice.Name": "Name",
	
	"_XC.BotList.Header.Title.Name": "Name",
	"_XC.BotList.Header.Title.Status": "Status",
	"_XC.BotList.Header.Title.LastIntegration": "Letzte",
	"_XC.BotList.Header.Title.NextIntegration": "Nächste",
	
	"_XC.BotList.StatusCard.Title.LatestIntegration": "Letzte Integration",
	"_XC.BotList.StatusCard.Title.NextIntegration": "Nächste Integration",
	"_XC.BotList.StatusCard.Title.Products": "Letzte Downloads",
	"_XC.BotList.StatusCard.Empty.LatestIntegration": "Keine abgeschlossenen Integrationen",
	"_XC.BotList.StatusCard.Empty.NextIntegration": "Keine geplanten Integrationen",
	"_XC.BotList.StatusCard.Empty.Products": "Keine Downloads verfügbar",
	"_XC.BotList.StatusCard.Action.LatestIntegration": "Details",
	"_XC.BotList.StatusCard.Action.NextIntegration": "Jetzt integrieren",
	"_XC.BotList.StatusCard.AlternateAction.NextIntegration": "Bereinigen und integrieren",
	"_XC.BotList.StatusCard.Action.Products": "Archive anzeigen",
	
	"_XC.BotList.StatusCard.Countdown.Integration.Label": "Integration %@",
	"_XC.BotList.StatusCard.Countdown.Days.Label": "Tage",
	"_XC.BotList.StatusCard.Countdown.Hours.Label": "Stunden",
	"_XC.BotList.StatusCard.Countdown.Minutes.Label": "Minuten",
	"_XC.BotList.StatusCard.Countdown.Interstitial.Queued": "Der Bot befindet sich in der Warteliste und wird in Kürze integriert.",
	"_XC.BotList.StatusCard.Countdown.Interstitial.Starting": "Integration starten …",
	
	"_XC.BotList.StatusCard.Products.Created.Label": "Erstellt %@",
	
	"_XC.BotRunSidebar.Empty.Placeholder": "Keine Bot-Aktionen gefunden",
	"_XC.BotRunSidebar.Scheme.Integrate": "Integrieren",
	
	"_XC.Bot.Header.Links.Summary.Title": "Zusammenfassung",
	"_XC.Bot.Header.Links.Tests.Title": "Tests",
	"_XC.Bot.Header.Links.Commits.Title": "Commits",
	"_XC.Bot.Header.Links.Archives.Title": "Archive",
	"_XC.Bot.Header.Links.Logs.Title": "Protokolle",

	"_XC.BotRun.Header.Links.Summary.Title": "(%@ integrieren) - Zusammenfassung",
	"_XC.BotRun.Header.Links.Tests.Title": "(%@ integrieren) - Tests",
	"_XC.BotRun.Header.Links.Commits.Title": "(%@ integrieren) - Commits",
	"_XC.BotRun.Header.Links.Archives.Title": "(%@ integrieren) - Archive",
	"_XC.BotRun.Header.Links.Logs.Title": "(%@ integrieren) - Protokolle",
	
	"_XC.Bot.Schedule.Description.Loading": "Zeitplan laden …",
	"_XC.Bot.Schedule.Description.Unscheduled": "Noch nicht geplant",
	"_XC.Bot.Schedule.Description.Unknown": "Unbekannter Zeitplan",
	"_XC.Bot.Schedule.Description.Hourly": "Wird stündlich ausgeführt (%@)",
	"_XC.Bot.Schedule.Description.Daily": "Wird täglich ausgeführt (%@)",
	"_XC.Bot.Schedule.Description.Weekly": "Wird wöchentlich ausgeführt (%@)",
	"_XC.Bot.Schedule.EditDialog.Title": "Zeitplan bearbeiten",
	"_XC.Bot.Schedule.EditDialog.Progress.Updating": "Zeitplan aktualisieren …",
	"_XC.Bot.Schedule.EditDialog.Progress.Failed": "Bot-Zeitplan konnte nicht aktualisiert werden. Versuchen Sie es erneut.",
	
	"_XC.BotRunScheduleEditorView.ScheduleType.Manual": "Manuell ausführen",
	"_XC.BotRunScheduleEditorView.ScheduleType.Periodic": "Periodisch ausführen",
	"_XC.BotRunScheduleEditorView.ScheduleType.Poll": "Poll-Umfrage nach neuen Commits",
	"_XC.BotRunScheduleEditorView.ScheduleType.Trigger": "Bei Commit eigenes Trigger-Skript verwenden",
	"_XC.BotRunScheduleEditorView.Schedule.RunThisBot": "%@1 <span class=\"day\">am %@2</span> <span class=\"time\">um %@3</span><span class=\"minutes\">um %@4 Minuten nach voller Stunde</span>",
	"_XC.BotRunScheduleEditorView.Schedule.Repeat.Hourly": "Stündlich",
	"_XC.BotRunScheduleEditorView.Schedule.Repeat.Daily": "Täglich",
	"_XC.BotRunScheduleEditorView.Schedule.Repeat.Weekly": "Wöchentlich",
	
	"_XC.BotRunCleanBuildScheduleEditorView.Select.Integrations": "Immer",
	"_XC.BotRunCleanBuildScheduleEditorView.Select.Day": "Einmal täglich",
	"_XC.BotRunCleanBuildScheduleEditorView.Select.Week": "Einmal wöchentlich",
	"_XC.BotRunCleanBuildScheduleEditorView.Select.Never": "Nie",
	"_XC.BotRunCleanBuildScheduleEditorView.Description": "Entfernt alle Quellcodes, Build-Produkte und Intermediates vor dem Ausführen einer Integration.",
	
	"_XC.BotRun.ArchiveProductDownloadView.Placeholder": "Keine Downloads",
	"_XC.BotRun.ArchiveProductDownloadView.Archive.Title": "Archivieren",
	"_XC.BotRun.ArchiveProductDownloadView.Product.Title": "Produkt",
	"_XC.BotRun.ArchiveProductDownloadView.Error.Message": "Download-Informationen für die Integration konnten nicht aus dem Archiv geladen werden. Versuchen Sie, die Seite erneut zu laden.",
	"_XC.BotRun.ArchiveProductDownloadView.UnknownFileSize": "Unbekannter Dateigröße",
	
	"_XC.Bot.Control.Run.Title": "Integrieren",
	"_XC.Bot.Control.CleanRun.Title": "Bereinigen und integrieren",
	"_XC.Bot.Control.Pause.Title": "Integration anhalten",
	"_XC.Bot.Control.Resume.Title": "Integration fortsetzen",
	"_XC.Bot.Control.Cancel.Title": "Integration abbrechen",
	"_XC.Bot.Control.Run.Error": "Integration konnte nicht gestartet werden. Versuchen Sie es erneut.",
	"_XC.Bot.Control.Cancel.Error": "Integration konnte nicht abgebrochen werden. Versuchen Sie es erneut.", 
	"_XC.Bot.Control.Pause.Error": "Integration konnte nicht angehalten werden. Versuchen Sie es erneut.",
	"_XC.Bot.Control.Resume.Error": "Integration konnte nicht fortgesetzt werden. Versuchen Sie es erneut.",
	
	"_XC.Bot.Status.": "Warten",
	"_XC.Bot.Status.Ready": "Warten",
	"_XC.Bot.Status.Running": "Ausführen …",
	"_XC.Bot.Status.Completed": "Abgeschlossen",
	"_XC.Bot.Status.Failed": "Fehlgeschlagen",
	"_XC.Bot.Status.Paused": "Angehalten",
	"_XC.Bot.Status.Canceled": "Abgebrochen",
	"_XC.Bot.SubStatus.Preparing": "Vorbereiten …",
	"_XC.Bot.SubStatus.Checkout": "Quellen laden …",
	"_XC.Bot.SubStatus.Building": "Integrieren …",
	"_XC.Bot.SubStatus.Uploading": "Fertigstellen …",
	"_XC.Bot.SubStatus.BuildErrors": "Beendet mit Fehlern",
	"_XC.Bot.SubStatus.TestFailures": "Beendet mit Testfehlern",
	"_XC.Bot.SubStatus.Warnings": "Beendet mit Warnungen",
	"_XC.Bot.SubStatus.AnalysisIssues": "Beendet mit Analyseproblemen",
	"_XC.Bot.SubStatus.BuildFailed": "Build fehlgeschlagen",
	"_XC.Bot.SubStatus.Succeeded": "Erfolgreich",
	"_XC.Bot.SubStatus.CheckoutError": "Fehlgeschlagen mit Checkout-Fehler",
	"_XC.Bot.SubStatus.CommitHistoryError": "Abrufen des Commit-Verlaufs fehlgeschlagen",
	"_XC.Bot.SubStatus.InternalError": "Serverfehler",
	"_XC.Bot.SubStatus.InternalCredentialServerError": "Fehlgeschlagen mit Anmeldefehler",
	"_XC.Bot.SubStatus.InternalCheckoutError": "Fehlgeschlagen mit Checkout-Fehler",
	"_XC.Bot.SubStatus.InternalBuildError": "Fehlgeschlagen mit Build-Fehler",
	"_XC.Bot.SubStatus.InternalUploadFilesError": "Hochladen von Dateien fehlgeschlagen",
	"_XC.Bot.SubStatus.InternalPostTimeseriesError": "Hochladen von Testergebnissen fehlgeschlagen",
	"_XC.Bot.SubStatus.InternalFinalizeBuildError": "Abschuss der Integration fehlgeschlagen",
	"_XC.Bot.SubStatus.InternalUpdateBotError": "Aktualisieren des Bot-Status fehlgeschlagen",
	
	"_XC.Bot.NewBotAssistant.NoRepositories.Error": "Auf diesem Server wurden keine Repositories konfiguriert. Ein Administrator kann neue Repositories mit der OS X Server-App hinzufügen.",
	"_XC.Bot.NewBotAssistant.Unknown.Error": "Entfernte Repositories konnten nicht vom Server geladen werden. Versuchen Sie es erneut.",
	
	"_XC.BotInfoView.Repository.Label": "Repository",
	"_XC.BotInfoView.Repository.Remote.Title": "%@1 - %@2",
	"_XC.BotInfoView.Repository.HostedLocally.Title": "%@1 - gehostet auf %@2",
	"_XC.BotInfoView.Repository.NoRepositories.Description": "Keine entfernten Repositories gefunden",
	"_XC.BotInfoView.Repository.Singular.ExtraRepository": "%@ weiteres Repository",
	"_XC.BotInfoView.Repository.Plural.ExtraRepository": "%@ weitere Repositories",
	"_XC.BotInfoView.Repository.Singular.ExtraBranch": "%@ weiterer Branch",
	"_XC.BotInfoView.Repository.Plural.ExtraBranch": "%@ weitere Branches",
	"_XC.BotInfoView.BranchName.Label": "Branch",
	"_XC.BotInfoView.BranchName.Placeholder": "Geben Sie einen Branch-Namen ein",
	"_XC.BotInfoView.SchemeName.Label": "Schema",
	"_XC.BotInfoView.SchemeName.Placeholder": "Geben Sie einen Schemanamen ein",
	"_XC.BotInfoView.SchemeName.Description": "Der Schemaname wird für den Build verwendet. Dieses Schema muss freigegeben sein.",
	"_XC.BotInfoView.WorkspaceOrProjectPath.Label": "Projektpfad",
	"_XC.BotInfoView.WorkspaceOrProjectPath.Placeholder": "Geben Sie den Pfad eines relativen Projekts oder Workspace ein",
	"_XC.BotInfoView.WorkspaceOrProjectPath.Description": "Relativer Pfad zur Datei „.xcodeproj“ oder „.xcworkspace“ in diesem Repository, z. B. „shared/Project.xcodeproj“.",
	"_XC.BotInfoView.Title.Label": "Bot-Name",
	"_XC.BotInfoView.Title.Placeholder": "Geben Sie den Namen für Ihren Bot ein",
	"_XC.BotInfoView.IntegrateImmediately.Label": "Sofort integrieren",
	
	"_XC.BotScheduleInfoView.Schedule.Label": "Zeitplan",
	"_XC.BotScheduleInfoView.Actions.Label": "Aktionen",
	"_XC.BotScheduleInfoView.IntegratePerformsAnalyze.Checkbox.Label": "Analyseaktion ausführen",
	"_XC.BotScheduleInfoView.IntegratePerformsTest.Checkbox.Label": "Testaktion ausführen",
	"_XC.BotScheduleInfoView.IntegratePerformsArchive.Checkbox.Label": "Archivaktion ausführen",
	"_XC.BotScheduleInfoView.BuildFromClean.Label": "Bereinigen",
	
	"_XC.BotTestingInfoView.Label": "Projekt testen für",
	"_XC.BotTestingInfoView.Type.Mac": "Mac",
	"_XC.BotTestingInfoView.Type.iOS": "iOS",
	"_XC.BotTestingInfoView.RunTestsOn": "Tests ausführen am",
	"_XC.BotTestingInfoView.RunTestsOn.AllDevices": "Alle Geräte",
	"_XC.BotTestingInfoView.RunTestsOn.AllSimulators": "Alle Simulatoren",
	"_XC.BotTestingInfoView.RunTestsOn.AllDevicesAndSimulators": "Alle Geräte und Simulatoren",
	"_XC.BotTestingInfoView.RunTestsOn.SpecificDevices": "Bestimmte Geräte",
	"_XC.BotTestingInfoView.Seperator.Devices": "Verbundene Geräte",
	"_XC.BotTestingInfoView.Seperator.Simulators": "Simulatoren",
	"_XC.BotTestingInfoView.NoDevices.Placeholder": "Keine Geräte oder Simulatoren gefunden",
	"_XC.BotTestingInfoView.UnknownDevice": "Unbekanntes Gerät",
	"_XC.BotTestingInfoView.UnknownSoftwareVersion": "Unbekannte Softwareversion",
	
	"_XC.BotNotificationsInfoView.OnSuccess.Label": "Bei Erfolg",
	"_XC.BotNotificationsInfoView.OnSuccess.Checkbox.Label": "Allen Committern mailen",
	"_XC.BotNotificationsInfoView.OnFailure.Label": "Bei Ausfall",
	"_XC.BotNotificationsInfoView.OnFailure.Checkbox.Label": "Allen Committern mailen",
	"_XC.BotNotificationsInfoView.AdditionalEmails.Label": "Weitere E-Mail-Adressen mit Komma getrennt hinzufügen:",
	"_XC.BotNotificationsInfoView.AdditionalEmails.Placeholder": "Geben Sie eine oder mehrere gültige E-Mail-Adressen ein",
	
	"_XC.NewBotAssistant.Title": "Neuen Bot erstellen",
	"_XC.NewBotAssistant.Title.Step.1": "(Schritt 1 von 4)",
	"_XC.NewBotAssistant.Title.Step.2": "(Schritt 2 von 4)",
	"_XC.NewBotAssistant.Title.Step.3": "(Schritt 3 von 4)",	
	"_XC.NewBotAssistant.Title.Step.4": "(Schritt 4 von 4)",
	"_XC.NewBotAssistant.Button.Next": "Weiter",
	"_XC.NewBotAssistant.Button.Previous": "Zurück",
	"_XC.NewBotAssistant.Button.Cancel": "Abbrechen",
	"_XC.NewBotAssistant.Button.Create": "Erstellen",
	"_XC.NewBotAssistant.Button.Done": "Bot anzeigen",
	"_XC.NewBotAssistant.Confirmation": "Der %@-Bot wurde erstellt und kann ausgeführt oder geplant werden. Weitere Konfigurationsoptionen für Ihren neuen Bot sind in der Darstellung „Einstellungen“ verfügbar.",
	"_XC.NewBotAssistant.Error": "Der neue Bot konnte nicht erstellt werden. Versuchen Sie es erneut.",
	
	"_XC.Bot.IssuesStack.Errors.Title": "Fehler",
	"_XC.Bot.IssuesStack.AnalysisIssues.Title": "Analyseprobleme",
	"_XC.Bot.IssuesStack.Warnings.Title": "Warnungen",
	"_XC.Bot.IssuesStack.Empty.Placeholder": "Keine Fehler, Analyseprobleme oder Warnungen",
	
	"_XC.Bot.Summary.IntegrationResults.Title": "Integrationsergebnisse",
	"_XC.Bot.Summary.LatestIntegration.Title": "Letzte Integration",
	"_XC.Bot.Summary.LatestIntegration.Status.Title": "Status:",
	"_XC.Bot.Summary.LatestIntegration.Start.Title": "Start:",
	"_XC.Bot.Summary.LatestIntegration.Duration.Title": "Dauer:",
	"_XC.Bot.Summary.LatestIntegration.Commits.None": "Keine neuen Commits",
	"_XC.Bot.Summary.LatestIntegration.Commits.Singular": "1 Commit",
	"_XC.Bot.Summary.LatestIntegration.Commits.Plural": "%@ Commits",
	"_XC.Bot.Summary.Downloads.Title": "Downloads",
	
	"_XC.Bot.Summary.Errors.Label": "Fehler",
	"_XC.Bot.Summary.Warnings.Label": "Warnungen",
	"_XC.Bot.Summary.AnalysisIssues.Label": "Analyse",
	"_XC.Bot.Summary.TestsTotal.Label": "Tests insgesamt",
	"_XC.Bot.Summary.TestsPassed.Label": "Bestandene Tests",
	"_XC.Bot.Summary.TestsFailed.Label": "Fehlgeschl. Tests",
	"_XC.Bot.Summary.LastRun.LastIntegrationResults.Title": "Letzte Integrationsergebnisse",
	"_XC.Bot.Summary.LastRun.Errors.Singular.Count": "1 Fehler",
	"_XC.Bot.Summary.LastRun.Errors.Plural.Count": "%@ Fehler",
	"_XC.Bot.Summary.LastRun.Errors.None.Count": "Keine Fehler",
	"_XC.Bot.Summary.LastRun.AnalysisIssues.Singular.Count": "1 Analyseproblem",
	"_XC.Bot.Summary.LastRun.AnalysisIssues.Plural.Count": "%@ Analyseprobleme",
	"_XC.Bot.Summary.LastRun.AnalysisIssues.None.Count": "Keine Analyseprobleme",
	"_XC.Bot.Summary.LastRun.Issues.Singular.Count": "1 Problem",
	"_XC.Bot.Summary.LastRun.Issues.Plural.Count": "%@ Probleme",
	"_XC.Bot.Summary.LastRun.Issues.None.Count": "Keine Probleme",
	"_XC.Bot.Summary.LastRun.Warnings.Singular.Count": "1 Warnung",
	"_XC.Bot.Summary.LastRun.Warnings.Plural.Count": "%@ Warnhinweise",
	"_XC.Bot.Summary.LastRun.Warnings.None.Count": "Keine Warnungen",
	"_XC.Bot.Summary.LastRun.Test.Passes.Count": "%@ Tests bestanden",
	"_XC.Bot.Summary.LastRun.Test.Failures.Count": "%@/%@ Tests fehlgeschlagen",
	"_XC.Bot.Summary.LastRun.Test.None.Count": "Keine Tests",
	"_XC.Bot.Summary.LastRun.Test.Summation.Count": "%@/%@ Tests",
	"_XC.Bot.Summary.Unexpected.Error": "Ein unerwarteter Fehler ist aufgetreten. Versuchen Sie, diese Seite nochmals zu laden.",
	
	"_XC.Bot.Summary.IntegrationHistory.Title": "Integrationsverlauf",
	"_XC.Bot.Summary.HistoryGraphs.ErrorsWarningsIssues.Title": "Build-Verlauf",
	"_XC.Bot.Summary.HistoryGraphs.ErrorsWarningsIssues.Legend.Errors": "Fehler",
	"_XC.Bot.Summary.HistoryGraphs.ErrorsWarningsIssues.Legend.Warnings": "Warnungen",
	"_XC.Bot.Summary.HistoryGraphs.ErrorsWarningsIssues.Legend.Issues": "Analyseprobleme",
	"_XC.Bot.Summary.HistoryGraphs.UnitTests.Title": "Testverlauf",
	"_XC.Bot.Summary.HistoryGraphs.UnitTests.Legend.Pass": "Bestandene Tests",
	"_XC.Bot.Summary.HistoryGraphs.UnitTests.Legend.Fail": "Fehlgeschlagene Tests",
	"_XC.Bot.Summary.HistoryGraphs.Unexpected.Error": "Beim Abrufen von Graphdaten ist ein unerwarteter Fehler aufgetreten. Versuchen Sie, diese Seite erneut zu laden.",
	"_XC.Bot.Summary.LastIntegrationDetails.Title": "Letzte Integrationsdetails",
	"_XC.Bot.Summary.IntegrationDetails.Title": "Integrationsdetails",
	
	"_XC.Bot.Tests.Results.Heading.Integration": "Integration",
	"_XC.Bot.Tests.Results.Heading.UnitTests": "Tests",
	"_XC.Bot.Tests.Results.Heading.TotalTests": "Gesamt",
	"_XC.Bot.Tests.Results.Heading.FailedTest": "Fehlgeschlagen",
	"_XC.Bot.Tests.Results.Pass.Title": "Bestanden",
	"_XC.Bot.Tests.Results.Fail.Title": "Fehlgeschlagen",
	"_XC.Bot.Tests.Results.NoResult.Title": "Kein Ergebnis",
	"_XC.Bot.Tests.Results.Unexpected.Error": "Beim Abrufen der Testdaten ist ein unerwarteter Fehler aufgetreten. Versuchen Sie, diese Seite erneut zu laden.",
	"_XC.Bot.Tests.NoFail": "Keine fehlgeschlagenen Tests",
	
	"_XC.Bot.CommitHistory.BotRun.Empty.Placeholder": "Keine neuen Commits in dieser Integration",
	"_XC.Bot.CommitHistory.Bot.Empty.Placeholder": "Keine neuen Commits in der letzten Integration",
	"_XC.Bot.CommitHistory.Files.Modified.Singular": "%@ Datei geändert",
	"_XC.Bot.CommitHistory.Files.Modified.Plural": "%@ Dateien geändert",
	"_XC.Bot.CommitHistory.Unexpected.Error": "Commits für diese Integration konnten nicht angezeigt werden",
	"_XC.Bot.CommitHistory.Commit.NoMessage": "Keine Commit-Meldung verfügbar.",
	
	"_XC.Bot.Logs.Title": "Protokolle",
	"_XC.Bot.Logs.IntegrationDetails.Title": "Fehler, Warnungen und Analyseprobleme",
	"_XC.Bot.Logs.BuildAgent.Title": "Build-Agent-Protokolle",
	"_XC.Bot.Logs.SCM.Title": "Versionsverwaltungsprotokolle",
	"_XC.Bot.Logs.SCM.Empty.Placeholder": "Keine Versionsverwaltungsprotokolle",
	"_XC.Bot.Logs.Build.Title": "Build-Protokolle",
	"_XC.Bot.Logs.Build.Empty.Placeholder": "Keine Build-Protokolle",
	"_XC.Bot.Logs.Empty.Placeholder": "Keine Protokolle gefunden",
	"_XC.Bot.Logs.Log.Bot.Empty.Placeholder": "Protokolle für diese Integration nicht verfügbar",
	"_XC.Bot.Logs.Log.BotRun.Empty.Placeholder": "Protokolle für diese Integration nicht verfügbar",
	"_XC.Bot.Logs.Log.Pruned": "Protokolle für diese Integration wurden bereinigt (Pruning)",
	"_XC.Bot.Logs.Unexpected.Error": "Protokolle konnten nicht angezeigt werden",
	
	"_XC.Bot.Archives.Unknown.Filename": "Unbekannt",
	"_XC.Bot.Archives.ListTitle": "Archive",
	"_XC.Bot.Archives.List.Archive": "Archivieren",
	"_XC.Bot.Archives.List.Archive.DeleteConfirmationMessage": "Möchten Sie dieses Archiv wirklich löschen? Dieser Vorgang kann nicht widerrufen werden.",
	"_XC.Bot.Archives.List.Archive.DeleteDialogTitle": "Archiv löschen",
	"_XC.Bot.Archives.List.Archive.DeleteFailedMessage": "Build-Archiv/Produkt konnte nicht gelöscht werden. Versuchen Sie es erneut.",
	"_XC.Bot.Archives.List.Product": "Produkt",
	"_XC.Bot.Archives.List.Product.DeleteConfirmationMessage": "Möchten Sie dieses Produkt wirklich löschen? Dieser Vorgang kann nicht widerrufen werden.",
	"_XC.Bot.Archives.List.Product.DeleteDialogTitle": "Produkt löschen",
	"_XC.Bot.Archives.List.DeleteButton": "Löschen",
	"_XC.Bot.Archives.List.Header.Filetype": "Typ",
	"_XC.Bot.Archives.List.Header.Filename": "Name",
	"_XC.Bot.Archives.List.Header.LastModified": "Datum",
	"_XC.Bot.Archives.List.Header.IntegrationNumber": "Integration",
	"_XC.Bot.Archives.List.Header.Filesize": "Größe",
	"_XC.Bot.Archives.List.Header.Filesize": "Größe",
	"_XC.Bot.Archives.Placeholder.NoArchivesFound": "Keine Archive gefunden",
	"_XC.Bot.Archives.Pruned": "Archive für diese Integration wurden bereinigt (Pruning)",
	
	"_XC.Bot.Settings.MenuItem.Title": "Bot-Einstellungen …",
	"_XC.Bot.Settings.Dialog.Title": "Bot-Einstellungen",
	"_XC.Bot.Settings.Fetch.Error.Title": "Bot-Einstellungen konnten nicht geladen werden. Versuchen Sie es erneut.",
	"_XC.Bot.Settings.Save.Button.Title": "Sichern",
	"_XC.Bot.Settings.Save.Error": "Bot-Einstellungen konnten nicht gesichert werden. Versuchen Sie es erneut.",
	"_XC.Bot.Settings.Unexpected.Error": "Ein unerwarteter Fehler ist aufgetreten. Versuchen Sie es erneut.",
	"_XC.Bot.Settings.Tabs.Server": "Server",
	"_XC.Bot.Settings.Tabs.Schedule": "Zeitplan",
	"_XC.Bot.Settings.Tabs.Testing": "Test",
	"_XC.Bot.Settings.Tabs.Notifications": "Benachrichtigungen",
	"_XC.Bot.Settings.BotSettingsUpdated": "_XC.Bot.Settings.BotSettingsUpdated",
    
    "_XC.Bot.DownloadLogs.Dialog.Title": "Integrationsprotokolle (%@) laden",
    "_XC.Bot.DownloadLogs.CancelButton.Title": "Abbrechen",
    "_XC.Bot.DownloadLogs.DownloadButton.Title": "Download",
    "_XC.Bot.DownloadLogs.Logs.Label": "Enthaltene Protokolle",
    "_XC.Bot.DownloadLogs.BuildLogs.Checkbox.Label": "Build-Protokolle",
    "_XC.Bot.DownloadLogs.SourceControlLogs.Checkbox.Label": "Versionsverwaltungsprotokolle",
    "_XC.Bot.DownloadLogs.XcodeServerLogs.Checkbox.Label": "Xcode Server-Build-Dienst-Ausgabe",
    "_XC.Bot.DownloadLogs.XcodeOutput.Checkbox.Label": "Raw \"xcodebuild\" build bundle",
    "_XC.Bot.DownloadLogs.BotConfigAndVersions.Checkbox.Label": "Bot-Konfigurations- und Versionsinformationen",
    "_XC.Bot.DownloadLogs.NoLogsAvailable.Alert": "Für die ausgewählte Integration sind keine Protokolle verfügbar. Vermutlich wurden sie vom Server automatisch bereinigt.",
    "_XC.Bot.DownloadLogs.NeverRun.Alert": "Dieser Bot wurde noch nicht ausgeführt, daher sind derzeit keine Protokolle verfügbar.",
    "_XC.Bot.DownloadLogs.Error.Alert": "Beim Abrufen von Informationen über die Protokolle dieser Integration ist ein Fehler aufgetreten. Versuchen Sie es später erneut oder wenden Sie sich an Ihren Serveradministrator.",
	
	"_XC.Bot.RunAudit.Empty.Placeholder": "Kein Audit-Verlauf gefunden",
	
	"_Dialogs.Delete.Notification.NotBotOwner.Error": "Nur der Eigentümer dieses Bots oder ein Administrator kann dieses Bot löschen.",
	"_Dialogs.Delete.Notification.NotBotOwner.Error": "Nur der Eigentümer dieses Bots oder ein Administrator kann dieses Bot löschen.",
	
	// Do not localize these help links.
	"_XC.Help.Desktop.URL": "https://help.apple.com/xcode/mac/1.0/",
	"_XC.Help.iPad.URL": "https://help.apple.com/xcode/ipad/1.0/",
	
	// WAI ARIA - Accessiblity
	"_XC.Accessibility.Button.Delete": "Löschen",
	"_XC.Accessibility.Navigation.IntegrationMenu": "Menü „Integration“",
	"_XC.Accessibility.Label.Devices": "Geräte",
	"_XC.Accessibility.Label.LastIntegration": "Letzte Integration",
	"_XC.Accessibility.Label.NextIntegration": "Nächste Integration",
	"_XC.Accessibility.Label.LatestDownloads": "Letzte Downloads",
	"_XC.Accessibility.Label.ListStatusView": "Statusanzeige auflisten",
	"_XC.Accessibility.Label.Downloads": "Downloads",
	"_XC.Accessibility.Label.IntegrateNumber": "Zahl integrieren",
	"_XC.Accessibility.Label.Header": "Überschrift",
	"_XC.Accessibility.Label.Details": "Details",
	"_XC.Accessibility.Label.DeviceInfo": "Geräteinfos",
	"_XC.Accessibility.Label.TestResultsList": "Testergebnisliste",
	"_XC.Accessibility.Label.TestSucceed": "Tests erfolgreich",
	"_XC.Accessibility.Label.Fail": "Fehler",
	"_XC.Accessibility.Label.Success": "Erfolgreich",
	"_XC.Accessibility.Label.TabNavigation": "Tab-Navigation",
	"_XC.Accessibility.Label.Content": "Inhalt",
	"_XC.Accessibility.Label.TestsResult": "Testergebnisse",
	"_XC.Accessibility.Label.ResultSummary": "Ergebniszusammenfassung",
	"_XC.Accessibility.Label.IntegrationResult": "Verlauf",
	"_XC.Accessibility.Label.IntegrationResult": "Verlauf",
	"_XC.Accessibility.Label.BotSummary": "Bot-Zusammenfassung"
});
