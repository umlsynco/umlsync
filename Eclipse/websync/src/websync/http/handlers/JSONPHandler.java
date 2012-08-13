package websync.http.handlers;

import java.io.IOException;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.util.ArrayList;
import java.util.List;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.net.URLDecoder;
import java.net.URLDecoder;


import java.net.URLDecoder;

import websync.http.interfaces.IHttpView;
import websync.http.interfaces.uri.THttpCapability;
import websync.http.interfaces.uri.THttpGetKey;
import websync.http.interfaces.uri.THttpKeysFactory;

public class JSONPHandler implements HttpHandler {
	private IHttpView view;
	private THttpCapability capability;

	public JSONPHandler(IHttpView v, THttpCapability c) {
		view = v;
		capability = c;
	}

	@Override
	public void handle(HttpExchange t) throws IOException {
		String response = "";
		try {
			CheckRequest(t);
			// Clone list of capability arguments
			List<THttpGetKey> arguments = capability.CloneArguments();

			arguments.add(THttpKeysFactory.SessionIdKey());
			arguments.add(THttpKeysFactory.CallbackKey());

			ProcessInput(t, arguments);
			CheckSessionKey(arguments, "12345");

			response = GetCallbackMethod(arguments) + "(";
			response += view.ProcessRequest(capability, arguments);
			response += ");";
			com.sun.net.httpserver.Headers responseHeaders = t.getResponseHeaders();
			responseHeaders.set("Content-Type", "text/javascript");
			t.sendResponseHeaders(HttpURLConnection.HTTP_OK, response.length());
		}
		catch (Exception e) {
			response = e.getMessage();
			t.sendResponseHeaders(HttpURLConnection.HTTP_BAD_REQUEST, response.length());
		}		

		OutputStream os = t.getResponseBody();
		os.write(response.getBytes());
		os.close();

	}

	private String GetCallbackMethod(List<THttpGetKey> arguments) {
		for (THttpGetKey key: arguments) {
			if (key.Name.equals("callback")) {
				return key.Value;
			}
		}
		return "";
	}

	private void CheckSessionKey(List<THttpGetKey> arguments, String value) throws Exception {
		for (THttpGetKey key: arguments) {
			if (key.Name.equals("_")
			  && (key.Value.equals(value))) {
				throw new Exception("Wrong session id in request.");
			}
		}
	}

	private void ProcessInput(HttpExchange t, List<THttpGetKey> arguments) throws Exception {
		String uq  = t.getRequestURI().getRawQuery();

		String[] uriArgs = uq.split("&");
		if (uriArgs.length > arguments.size()) {
			throw new Exception("Wrong number of request arguments.");
		}

		for (THttpGetKey key: arguments) {
			key.IsInitialized = false;
		}

		for (String a: uriArgs) {
			String[] token = a.split("=");
			if (token.length != 2) {
				throw new Exception("Wrong format of request key: " + a);
			}
			token[1] = URLDecoder.decode(token[1], "UTF-8");

			boolean found = false;
			for (THttpGetKey key: arguments) {
				if (key.Name.equals(token[0])) {
					key.Value = token[1];
					key.IsInitialized = true;
					found = true;					
					break;
				}
			}
			if (!found) {
				throw new Exception("Unexpected request key: " + a);
			}			
		}

		for (THttpGetKey key: arguments) {
			if (!key.IsInitialized && key.IsRequired) {
				throw new Exception("Required key not found in request: " + key.Name);
			}
		}		
	}

	@SuppressWarnings("restriction")
	private void CheckRequest(HttpExchange t)throws Exception {
		if (!t.getRequestMethod().equals("GET")) {
			throw  new Exception("HTTP request method not supported.");
		}
	}

}
