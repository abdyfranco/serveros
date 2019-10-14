//--------------------------------------------------------------------------
// Cookie Support
//--------------------------------------------------------------------------

var DMCookies = {
  deleteCookie: function(name) { DMCookies.writeCookie(name, '', -1); },

  readCookie: function(name) {
    var ca = document.cookie.split(";"),
    len = ca.length,
    nameEQ = name+"=",
    i, val;

    for (i=0; !val && i < len; i++) {
      var c = ca[i].trim;
      if (c.indexOf(nameEQ) === 0) val = c.substring(nameEQ.length, c.length);
    }
    return val;
  }, // readCookie

  writeCookie: function (name, value, days) {
    var expires = "";
    if (days) {
      var date = new Date();
      date.setTime(date.getTime()+(days*24*60*60*1000));
      expires = "; expires="+date.toGMTString();
    }
    document.cookie = name+"="+value+expires+"; path=/";
  } // writeCookie
}; // DMCookies
