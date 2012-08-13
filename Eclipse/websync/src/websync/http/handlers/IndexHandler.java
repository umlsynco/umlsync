package websync.http.handlers;

import java.io.IOException;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;

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

public class IndexHandler implements HttpHandler {

	public static final int REQUEST_CLASS_INFO = 0; // extra filters could be added to this method
	// like public only, or methods only etc ... 
	public static final int REQUEST_CLASS_BASE = 1; // Name based limitations could be added to this method 
	public static final int REQUEST_CLASS_GENERALIZATION = 2;
	public static final int REQUEST_CLASS_NESTED = 3;

	private int requestedType = REQUEST_CLASS_INFO;
	public IndexHandler(int requestClassInfo) {
		requestedType = requestClassInfo;
	}

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
					if (requestedType == REQUEST_CLASS_INFO) {
						IMethodDeclaration[] methods = s.getMethods();
						for (IMethodDeclaration m : methods) {
							String sig = m.getSignature();
							sig += m.getReturnType();
							String ret = sig;
							String allparams="";
							String pcomma ="";
							for (String param: m.getParameterTypes()) {
								allparams += pcomma + param;
								pcomma = ",";
							}
							name += comma + "{'md':'"+ m.getElementName()+ 
									"', 'attr':'"+ m.getVisibility() +
									"', 'ret':'"+ m.getReturnType()+
									"', 'args':'"+allparams+"'}";
							comma = ",";
						}
						break;
					}
					
					if (requestedType == REQUEST_CLASS_BASE) {
						for (String n : s.getSuperClassesNames()) {
							name += comma + "{'title':'" + n + "'}";
							comma = ",";
						}						
					}
					
					if (requestedType == REQUEST_CLASS_NESTED) {
						for (ICElement n : s.getChildrenOfType(s.getElementType())) {
							name += comma + "{'title':'" + n.getElementName() + "'}";
							comma = ",";
						}						
					}
				} catch (CModelException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}

			}
		}
		return name;
	}

}
