package websync.http.handlers;

import java.io.IOException;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;

import org.eclipse.cdt.core.CCorePlugin;
import org.eclipse.cdt.core.dom.ast.cpp.ICPPClassType;
import org.eclipse.cdt.core.index.IIndex;
import org.eclipse.cdt.core.index.IIndexBinding;
import org.eclipse.cdt.core.index.IIndexManager;
import org.eclipse.cdt.core.index.IIndexName;
import org.eclipse.cdt.core.index.IndexFilter;
import org.eclipse.cdt.core.model.CModelException;
import org.eclipse.cdt.core.model.CoreModel;
import org.eclipse.cdt.core.model.ICElement;
import org.eclipse.cdt.core.model.ICElementVisitor;
import org.eclipse.cdt.core.model.ICModel;
import org.eclipse.cdt.core.model.ICProject;
import org.eclipse.cdt.core.model.IMethodDeclaration;
import org.eclipse.cdt.internal.core.model.Structure;
import org.eclipse.core.resources.IFile;
import org.eclipse.core.resources.IFolder;
import org.eclipse.core.resources.IProject;
import org.eclipse.core.resources.IResource;
import org.eclipse.core.resources.IResourceVisitor;
import org.eclipse.core.resources.ResourcesPlugin;
import org.eclipse.core.runtime.CoreException;
import org.eclipse.core.runtime.IPath;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

public class IndexDatabaseHandler implements HttpHandler {
	@Override
	public void handle(HttpExchange t) throws IOException {
		// Empty response for a while 
		String response = "";
		String addr = t.getRemoteAddress().getHostName();

		// Check that request if JSONP
		if (t.getRequestMethod().equals("GET")) {
			String uq  = t.getRequestURI().getQuery();
			String[] splited = uq.split("&");
			String key = "";
			String path = "";
			for (int i=0; i< splited.length; ++i) {
				String[] attrs =splited[i].split("=");
				if ((attrs.length == 2)
						&& (attrs[0].equalsIgnoreCase("key"))) {
					key = attrs[1];
				}
				if ((attrs.length == 2)
						&& (attrs[0].equalsIgnoreCase("path"))) {
					path = attrs[1];
				}
			}

			if (!path.isEmpty() && (path.charAt(0) == '/')) {
				path = path.substring(1);
			}

			if (!key.isEmpty() && (key.charAt(0) == '/')) {
				key = key.substring(1);
			}

			for (int i=0; i< splited.length; ++i) {
				String[] attrs =splited[i].split("=");
				if ((attrs.length == 2)
						&& (attrs[0].equalsIgnoreCase("callback"))) {
					response = attrs[1] + "(" + getProjects(path, key) + ");"; 
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

	// {'md':s_key[1], 'attr':m1[1], 'ret':m1[2], 'args':m1[3]}
	public String getProjects(String path, String name) {
		if (path.isEmpty()) {
			return "";
		}

		String result = "[";
		String comma = "";
		final String projectName = path.contains("/") ? path.split("/")[0] : path;
		String subpath = (path == projectName) ? "" : path.substring(projectName.length() + 1);
		IProject project = ResourcesPlugin.getWorkspace().getRoot().getProject(projectName);
		if (project == null)
			return "";

		IResource res = project; 
		if (subpath.isEmpty())
			return "";
		IResource folder = project.findMember(subpath);

		if (folder instanceof IFolder)
			return "";

		if (folder.exists() &&
				folder instanceof IFile)
			res = folder;

		final String searchPath = path;
		final String nnn = name;
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
							ss.add(GetClassFile(resource.getLocation(), projectName, nnn));
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
	public String GetClassFile(IPath path, String project, String className)
	{
		ICModel cModel= CoreModel.getDefault().getCModel();
		IIndexManager manager = CCorePlugin.getIndexManager();

		ICProject cProject = cModel.getCProject(project);
		String name = ""; //result
		String comma = "";
		
		if (cProject == null) {
			return ""; // Throw; no index support for the project
		}
		
		try {
			IIndex indexDb = manager.getIndex(cProject);
			if (indexDb == null)
				return "";
			IIndexBinding[] bindings = indexDb.findBindings(className.toCharArray(), IndexFilter.ALL_DECLARED_OR_IMPLICIT, null);
			if ((bindings != null) && bindings.length > 0) 
			{
				ICPPClassType iClassType = null;
				for (IIndexBinding binding : bindings)  
				{
					if  (binding instanceof ICPPClassType)
					{						
						iClassType = (ICPPClassType)  indexDb.adaptBinding(binding);
					}
				}
				if (iClassType != null) {
					IIndexName[] refs = indexDb.findNames(iClassType, indexDb.FIND_ALL_OCCURRENCES);
					for (IIndexName r: refs) {
						if (r.isBaseSpecifier()) {
							IIndexName def = r.getEnclosingDefinition();
							
							IIndexBinding bind = indexDb.findBinding(def);
							if (bind instanceof ICPPClassType) {

								String file = def.getFileLocation().getFileName();
								String path2 = 
									file.substring(file.indexOf(project) + 
											project.length() + 1, file.length()); 

								name += comma + "{'title':'"+bind.getName()+"', 'filepath':'"+path2+"'}";
								comma = ",";
							}
												
						}
					}
				}
				else {
					return "";
				}
			} else {
				return "";
			}
		} catch (CoreException e1) {
			
			return ""; // No index support
		}
		
		return name;
	}

}
