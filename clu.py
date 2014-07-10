import os
import json
import tornado.httpserver
import tornado.ioloop
import tornado.options
import tornado.web
import tornado.escape
from tornado.options import define, options

db = None
define("port", default=8888, help="run on the given port", type=int)
homepath = '.'

class JsonHandler(tornado.web.RequestHandler):
	
	def post(self, uri, **kwargs): 
		global db		
		body = tornado.escape.url_unescape(self.request.body)
		(key, value) = body.split('=')
		item = json.loads(value)
		path = uri.split('/')
		for p in [ p for p in path if len(p) > 0]: 
			db[p].append(item)
		response = {'success': True, 'data': item, 'total': 1}
		self.write(response)	
	
	def put(self, uri, **kwargs):
		global db
		body = tornado.escape.url_unescape(self.request.body)	
		(key, value) = body.split('=')
		item = json.loads(value)
		path = uri.split('/')
		ident = path.pop()
		record = db 
		for p in [p for p in path if len(p) > 0]: 
			record = record.get(p)
			if record is None: 
				#fail
				break
		if isinstance(record, list):
			for i, r in enumerate(record):
				if ident is r['_id_']:
					record[ident] = item
					break
		if isinstance(record, dict):
			pass
		else: 
			pass
			
		
		record = {'success': True, 'data': item, 'total': 1}	
		self.write(record)	

	def delete(self, uri, **kwargs):
		global db
		body = tornado.escape.url_unescape(self.request.body)	
		(key, value) = body.split('=')
		item = json.loads(value)
		path = uri.split('/')
		ident = path.pop()
		record = db
		for p in [p for p in path if len(p) > 0]: 
			record = record.get(p)
			if record is None: 
				#fail
				break
		if isinstance(record, list):
			for i, r in enumerate(record):
				if ident is r['_id_']:
					
					break
		if isinstance(record, dict):
			pass
		else: 
			pass
		
		self.write({'success': True, 'data': []})	

	def get(self, uri, **kwargs):

		global db
		response = db
		path = uri.split('/')	
		ident = None

		if len(path) > 1: 
			ident = path.pop()		
		for p in [ p for p in path if len(p) > 0]: 
			response = response.get(p, {})
			if response is {}:
				# fail
				break
		if isinstance(response, list):
			if ident is None:
				item = [r for r in response if r.get('_id_') == ident]
				if len(item) > 0:
					response = item[0]
			response = {'success': True,  'data': response}
		
		print(">> uri: %s path: %s resp: %s ident: %s" % (uri, path, response, ident))
		self.write(response)	

class MainHandler(tornado.web.RequestHandler):
	
	routes = {	
		'': './index.html'	
	}
	
	def post(self, request, **kwargs): 
		print(">> post %s" % (data))	
	
	def put(self, *args, **kwargs): 
		print(">> put")

	def delete(self, *args, **kwargs):
		print(">> delete")

	def get(self, request, **kwargs):
  		
		data, prefix = None, None
		exploded = request.split('/')
		prefix = self.routes.get(exploded[0]) or './'
		path = "%s%s" % (prefix, request) 
	
		#if len(exploded[-1]):
		#	path = '%s%s' % (path, 'index.html')
	
		with open(path, 'r') as f:
			data = f.read()

		if '.json' in request: 
			self.set_header('Content-Type', 'application/json')	
		if '.xml' in request: 
			self.set_header('Content-Type', 'application/xml')
		if '.js' in request:
			self.set_header('Content-Type', 'text/javascript')
		if '.css' in request:
			self.set_header('Content-Type', 'text/css')		
		if '.png' in request: 
			self.set_header('Content-Type', 'image/png')
		if '.gif' in request:
			self.set_header('Content-Type', 'image/gif')

		self.write(data)


def main():
	
	global db
	
	with open('store.json', 'r') as f:
		db = json.loads(f.read());

	os.chdir(homepath)

	tornado.options.parse_command_line()
	application = tornado.web.Application([
		(r"/api/?(.*)", JsonHandler),
		(r"/(.*)", MainHandler),
	])
	http_server = tornado.httpserver.HTTPServer(application)
	http_server.listen(options.port)
	tornado.ioloop.IOLoop.instance().start()


if __name__ == "__main__":
	main()
