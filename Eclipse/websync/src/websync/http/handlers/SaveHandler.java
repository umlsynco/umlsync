package websync.http.handlers;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URI;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import org.eclipse.core.resources.IFile;
import org.eclipse.core.resources.IProject;
import org.eclipse.core.resources.ResourcesPlugin;
import org.eclipse.core.runtime.CoreException;

import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

public class SaveHandler implements HttpHandler {

	@Override
	public void handle(HttpExchange t) throws IOException {
		String response = "";
		Headers responseHeaders = t.getResponseHeaders();

		URI uri = t.getRequestURI();

		// Check that request if JSONP
		String method = t.getRequestMethod();
		if (t.getRequestMethod().equals("GET")) {
			String uq  = t.getRequestURI().getQuery();
			int idiag = uq.indexOf("diagram=");
			int iname = uq.indexOf("&path=");
			int idesc = uq.indexOf("&description=");
			int magicnum = uq.indexOf("&_=");
			String diagram = uq.substring(idiag+8, iname);
			String name = uq.substring(iname+6,idesc);
			String desc = (magicnum == -1) ? uq.substring(idesc + 13) :uq.substring(idesc + 13, magicnum);
			if (!name.isEmpty() && (name.charAt(0) == '/')) {
				name = name.substring(1);
				}
			try {
			  saveDiagram(name + ".umlsync", desc, diagram);
			}
			catch (IOException ex) {
				// response alert !!!
			}

		}

	//	com.sun.net.httpserver.Headers responseHeaders = t.getResponseHeaders();
		responseHeaders.set("Content-Type", "text/javascript");
		t.sendResponseHeaders(200, response.length());

		OutputStream os = t.getResponseBody();
		os.write(response.getBytes());
		os.close();
	}

	private void saveDiagram(String path, String desc, String diagram) throws IOException  {
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
				file.delete(true, null);
			}
     		file.create(new ByteArrayInputStream(diagram.getBytes()), 0, null);	
			
		} catch (CoreException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		project.getName();
	}

}
