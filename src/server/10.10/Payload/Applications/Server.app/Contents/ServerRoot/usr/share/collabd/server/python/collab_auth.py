from collabclient import ServiceClient

class Authentication:
	def __init__(self, baseURL="http://localhost:4444/svc"):
		self.svc = ServiceClient(baseURL)
		self.authToken = ""
	
	def login(username, password):
		self.authToken = self.svc.blockingExecute("AuthService", "sessionForUsername:andPassword:", [username, password])
		return self.authToken
	
def main():
	auth = Authentication()
	print auth.login("khorne", "apple")
