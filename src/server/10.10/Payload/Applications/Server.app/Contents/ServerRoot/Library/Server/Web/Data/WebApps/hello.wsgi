import sys, os
import glob, re

def application(environ, start_response):
    status = '200 OK'
    output = '<html>'
    output += '<head>'
    output += '<title>mod_wsgi webapp</title>'
    output += '</head>'
    output += '<body>'
    output += '<h2>This text is displayed by a Python script, executed via the webapp.plist(8) mechanism.<h2>'
    output += "<h3>Python version %d.%d.%d running %s.</h3>" % (sys.version_info[:3] + (sys.argv[0],))
    output += '</body>'
    output += '</html>'
    response_headers = [('Content-type', 'text/html'),
                        ('Content-Length', str(len(output)))]
    start_response(status, response_headers)
    return [output]
