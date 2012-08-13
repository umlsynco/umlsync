package websync.http.handlers;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URI;

import org.eclipse.core.resources.IFile;
import org.eclipse.core.resources.IProject;
import org.eclipse.core.resources.ResourcesPlugin;
import org.eclipse.core.runtime.CoreException;

import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

public class RestoreHandler implements HttpHandler {

	@Override
	public void handle(HttpExchange t) throws IOException {
		String response = "";
		Headers responseHeaders = t.getResponseHeaders();

		URI uri = t.getRequestURI();

		// Check that request if JSONP
		String method = t.getRequestMethod();
		if (t.getRequestMethod().equals("GET")) {
			String uq  = t.getRequestURI().getQuery();
			String[] splited = uq.split("&");
			String key = "";
			for (int i=0; i< splited.length; ++i) {
				String[] attrs =splited[i].split("=");
				if ((attrs.length == 2)
						&& (attrs[0].equalsIgnoreCase("path"))) {
					key = attrs[1];
				}
			}
			if (!key.isEmpty() && (key.charAt(0) == '/')) {
				  key = key.substring(1);
			}
			for (int i=0; i< splited.length; ++i) {
				String[] attrs =splited[i].split("=");
				if ((attrs.length == 2)
						&& (attrs[0].equalsIgnoreCase("callback"))) {
					try {
						response = attrs[1] + "(" + restoreDiagram(key) + ");";
					}
					catch (IOException ex) {
						// response alert !!!
					}
				}
			}
		}

		//	com.sun.net.httpserver.Headers responseHeaders = t.getResponseHeaders();
		responseHeaders.set("Content-Type", "text/javascript");
		t.sendResponseHeaders(200, response.length());

		OutputStream os = t.getResponseBody();
		os.write(response.getBytes());
		os.close();
	}

	private String restoreDiagram(String path) throws IOException  {
		String[] splitedPath = path.split("/");
		if (splitedPath.length < 2) {
			throw new IOException("Wrong path to diagram.");

		}

		IProject project = ResourcesPlugin.getWorkspace().getRoot().getProject(splitedPath[0]);
		if (project == null) {
			throw new IOException("Project " + splitedPath[0] + " not found.");
		}

		IFile file = project.getFile(path.substring(splitedPath[0].length() +1));

		try {
			if (file.exists()) {
				if (file.getFileExtension().equals("umlsync")) {
					//file.create(new ByteArrayInputStream(diagram.getBytes("UTF-8")), 0, null);
					InputStream content = file.getContents();
					byte[] buffer = new byte[content.available()];
					content.read(buffer, 0, content.available());
					return new String(buffer);
				}
			}
		} catch (CoreException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return "";
	}
}
