package websync.http.handlers;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URI;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.eclipse.osgi.framework.util.Headers;
import org.eclipse.ui.PlatformUI;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import org.eclipse.core.resources.*;
import org.eclipse.core.runtime.CoreException;

import org.eclipse.cdt.core.CCorePlugin;
import org.eclipse.cdt.core.model.CModelException;
import org.eclipse.cdt.core.model.CoreModel;
import org.eclipse.cdt.core.model.ICElement;
import org.eclipse.cdt.core.model.ICElementVisitor;
import org.eclipse.cdt.core.model.ICModel;
import org.eclipse.cdt.core.model.ICProject;
import org.eclipse.cdt.core.model.IIncludeEntry;
import org.eclipse.cdt.core.model.IMethodDeclaration;
import org.eclipse.core.runtime.IPath;

import org.eclipse.cdt.internal.core.model.Structure;

public class ProjectsHandler implements HttpHandler {

	@Override
	public void handle(HttpExchange t) throws IOException {
		// Empty response for a while 
		String response = "";

		// TODO: think about secure requests ??? SSL etc ...  
		String addr = t.getRemoteAddress().getHostName();

		// Check that request if JSONP
		if (t.getRequestMethod().equals("GET")) {
			String uq  = t.getRequestURI().getQuery();
			String[] splited = uq.split("&");
			String key = "";
			for (int i=0; i< splited.length; ++i) {
				String[] attrs =splited[i].split("=");
				if ((attrs.length == 2)
						&& (attrs[0].equalsIgnoreCase("key"))) {
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
					response = attrs[1] + "(" + getProjects(key) + ");"; 
				}
			}

		} else {
			// Handle the simple JSON        	
			// responseHeaders.set("Content-Type", "application/json");
		}

		com.sun.net.httpserver.Headers responseHeaders = t.getResponseHeaders();
		responseHeaders.set("Content-Type", "text/javascript");
		t.sendResponseHeaders(200, response.length());

		OutputStream os = t.getResponseBody();
		os.write(response.getBytes());
		os.close();

	}

	public String getProjects(String path) {
		if (path.isEmpty()) {
			String result = "[";
			String comma = "";
			IProject[] projects = ResourcesPlugin.getWorkspace().getRoot().getProjects();
			for (int i=0; i<projects.length; ++i) {
				result += comma + "{'isLazy': true, 'isFolder': true, 'title': '" +  projects[i].getName() + "'}";
				comma = ",";
			}
			result += "]";
			return result;
		}

		String result = "[";
		String comma = "";
		final String projectName = path.contains("/") ? path.split("/")[0] : path;
		String subpath = (path == projectName) ? "" : path.substring(projectName.length() + 1);
		IProject project = ResourcesPlugin.getWorkspace().getRoot().getProject(projectName);
		IResource res = project; 
		if (!subpath.isEmpty()) {
		  IResource folder = project.getFolder(subpath);
		  if (folder.exists())
			res = folder;
		
		IFile fff = project.getFile(subpath);
		if (fff.exists())
			res = fff;
		}
		final String searchPath = path;
		final List<IResource> resources = new ArrayList<IResource>();
		final List<String> ss = new ArrayList<String>();
		try {
			res.accept(new IResourceVisitor() {
				public boolean visit(IResource resource) throws CoreException {

					//exclude hidden resources
					if ((resource.getType() == IResource.HIDDEN)
					  || (resource.getName().indexOf('.') == 0))
						return false;
					
					String resourceName = resource.getFullPath().toString().substring(1);
					if (resourceName.equals(searchPath)) {
						if (resource instanceof IFile) {
							ss.add(GetClassFile(resource.getLocation(), projectName));
						}
						return true;
					}


					if (resource instanceof IFolder) {
						resources.add(resource);
					}

					if (resource instanceof IFile) {
						resources.add(resource);
					}
					
					String rr = resource.getClass().getName();

					return false;				
				}
			});
		} catch (CoreException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}


		for (IResource resource : resources) {
			String isFolder = "false";
			String isLazy = "false";
			String extraInfo = "";
			if (resource instanceof IFolder) {
				isFolder = "true";
				isLazy = "true";
			}

			if ((resource instanceof IFile)
					&& resource.getFileExtension() != null) {
				 
			   if (resource.getFileExtension().equals("umlsync")) {
  				  extraInfo = ", 'addClass' : 'diagramclass'";
			   } else {
				  isLazy = "true"; // File could provide more information about classes
			   }
			}
			result += comma + "{'isLazy': " + isLazy + ", 'isFolder' : " + isFolder + ", 'title': '" +  resource.getName() + "'"+extraInfo+"}";
			comma = ",";

		}
		if (!ss.isEmpty()) {
			result += ss.get(0);
		}
		result += "]";
		return result;
	}
	
	@SuppressWarnings("restriction")
	public String GetClassFile(IPath path, String project)
	{
		ICModel cModel= CoreModel.getDefault().getCModel();
		final List<ICElement> components = new ArrayList<ICElement>();
		final ICProject proj = CoreModel.getDefault().getCModel().getCProject(project);
		try {
			final ICElement elem = proj.findElement(path);
			elem.accept(new ICElementVisitor() {

				@Override
				public boolean visit(ICElement element) throws CoreException {
					if (element != elem) {
						components.add(element);
						return false;
					}					
					return true;
				}} );
		} catch (CoreException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		String name = "";
		String comma = "";
		for (ICElement c: components) {
			if (c instanceof Structure) {
				Structure s = (Structure)c;
				try {
					IMethodDeclaration[] methods = s.getMethods();
					for (IMethodDeclaration m : methods) {
						String sig = m.getSignature();
						sig += m.getReturnType();
						String ret = sig;
					}
				} catch (CModelException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
			  name += comma + "{'isLazy': false, 'isFolder' : false, 'title': '" +  c.getElementName() + "', 'addClass': 'iconclass'}";
			  comma = ",";
			}
		}
		return name;
	}

}
