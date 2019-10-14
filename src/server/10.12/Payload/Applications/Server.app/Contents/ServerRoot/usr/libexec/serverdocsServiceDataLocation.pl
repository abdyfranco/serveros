#!/usr/bin/perl

if (-f "/Library/Preferences/com.apple.ServerDocs/ServerDocs.plist") {
    $SERVICE_DATA_LOCATION=`defaults read /Library/Preferences/com.apple.ServerDocs/ServerDocs.plist ServiceDataLocation`;
}
if ($SERVICE_DATA_LOCATION ne "") {
    print $SERVICE_DATA_LOCATION;
    exit(0);
}

if (!defined($SERVERADMIN)) {
    $SERVERADMIN="/Applications/Server.app/Contents/ServerRoot/usr/sbin/serveradmin";
}

$CALENDAR_DATA_ROOT=`$SERVERADMIN settings calendar:DataRoot`;
$COLLABD_DATA_LOCATION=`$SERVERADMIN settings collabd:DataLocation:FileDataPath`;
$SWUPD_UPDATES_DOC_ROOT=`$SERVERADMIN settings swupdate:updatesDocRoot`;

@PATHS = ($CALENDAR_DATA_ROOT, $COLLABD_DATA_LOCATION, $SWUPD_UPDATES_DOC_ROOT);

foreach $PATH (@PATHS) {
    if ($PATH =~ "/Library/Server/") {
        chop($PATH);
        $PATH =~ s#.*= "##;
        $PATH =~ s#/Library/Server/.*#/#;

        if (!defined($COUNTS{$PATH})) {
            $COUNTS{$PATH} = 1;
        }
        else {
            $COUNTS{$PATH} = ($COUNTS{$PATH} + 1);
        }
    }
}

$MAX = -1;
$WINNER = "/";
foreach $PATH (keys %COUNTS) {
    $COUNT = $COUNTS{$PATH};

    if ($COUNT > $MAX && $COUNT > 1) {
        $WINNER = $PATH;
        $MAX = $COUNT;
    }
}

print $WINNER . "\n";

