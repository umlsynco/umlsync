package websync.actions;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
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
import org.eclipse.core.resources.IProjectNature;
import org.eclipse.core.resources.IResource;
import org.eclipse.core.resources.IResourceVisitor;
import org.eclipse.core.resources.ResourcesPlugin;
import org.eclipse.core.runtime.CoreException;

import websync.http.interfaces.IHttpView;
import websync.http.interfaces.IHttpViewManager;
import websync.http.interfaces.uri.THttpCapabiliesFactory;
import websync.http.interfaces.uri.THttpCapability;
import websync.http.interfaces.uri.THttpGetKey;
import websync.http.interfaces.uri.THttpCapability.ICapabilityHandler;

public class THttpProjectExplorerView implements IHttpView {

	private IHttpViewManager ViewManager = null;
	public THttpProjectExplorerView(IHttpViewManager vm) {
		ViewManager = vm;
		ViewManager.registerView(this);
	}

	@Override
	public List<THttpCapability> GetCapabilitis() {
		List<THttpCapability> result = new ArrayList<THttpCapability>();

		// Tree hierarchy support
		result.add(THttpCapabiliesFactory.VIEW_TREE(new ICapabilityHandler() {
			@Override
			public String handle(IHttpView view, List<THttpGetKey> keys) {
				if (view instanceof THttpProjectExplorerView) {
					THttpProjectExplorerView v = (THttpProjectExplorerView)view;
					return v.GetList(keys);
				}
				return "";
			}
		}));

		// Tree hierarchy support
		result.add(THttpCapabiliesFactory.VIEW_OPEN_FILE(new ICapabilityHandler() {
			@Override
			public String handle(IHttpView view, List<THttpGetKey> keys) throws Exception {
				if (view instanceof THttpProjectExplorerView) {
					THttpProjectExplorerView v = (THttpProjectExplorerView)view;
					return v.OpenFile(keys);
				}
				return "";
			}
		}));

		
		result.add(THttpCapabiliesFactory.VIEW_OPEN_DIAGRAM(new ICapabilityHandler() {
			@Override
			public String handle(IHttpView view, List<THttpGetKey> keys) throws Exception {
				if (view instanceof THttpProjectExplorerView) {
					THttpProjectExplorerView v = (THttpProjectExplorerView)view;
					return v.OpenDiagram(keys);
				}
				return "";
			}
		}));

		result.add(THttpCapabiliesFactory.VIEW_SAVE_DIAGRAM(new ICapabilityHandler() {
			@Override
			public String handle(IHttpView view, List<THttpGetKey> keys) throws Exception {
				if (view instanceof THttpProjectExplorerView) {
					THttpProjectExplorerView v = (THttpProjectExplorerView)view;
					return v.SaveDiagram(keys);
				}
				return "";
			}
		}));
		result.add(THttpCapabiliesFactory.VIEW_REMOVE_DIAGRAM(new ICapabilityHandler() {
			@Override
			public String handle(IHttpView view, List<THttpGetKey> keys) throws Exception {
				if (view instanceof THttpProjectExplorerView) {
					THttpProjectExplorerView v = (THttpProjectExplorerView)view;
					return v.RemoveDiagram(keys);
				}
				return "";
			}
		}));

		return result;
	}

	protected String OpenFile(List<THttpGetKey> keys) throws Exception {
		String path = GetValue("path", keys);
		String result = "";

		if (path.isEmpty() || path.equals("/")) {
			return result;
		}
		else {
			
			if (path.charAt(0) == '/') {
				path = path.substring(1);
			}
			final String projectName = path.contains("/") ? path.split("/")[0] : path;
			String subpath = (path == projectName) ? "" : path.substring(projectName.length() + 1);
			IProject project = ResourcesPlugin.getWorkspace().getRoot().getProject(projectName);
			IResource res = project;
			if (!subpath.isEmpty()) {
				res = project.findMember(subpath);
			}

			if (res instanceof IFile) {
				this.ViewManager.open((IFile)res);
	
			} else {
				return "";
			}
		}

		return result;
	}

	protected String RemoveDiagram(List<THttpGetKey> keys) throws Exception {
		String path = GetValue("path", keys);

		// Cut first "/"
		if (path.charAt(0) == '/') {
			path = path.substring(1);
		}
		
		String[] splitedPath = path.split("/");
		if (splitedPath.length < 2) {
			throw new Exception("Wrong path to diagram.");

		}

		IProject project = ResourcesPlugin.getWorkspace().getRoot().getProject(splitedPath[0]);
		if (project == null) {
			throw new Exception("Project " + splitedPath[0] + " not found.");
		}

		IFile file = project.getFile(path.substring(splitedPath[0].length() +1));

		try {
			if (file.exists()) {
				if (file.getFileExtension().equals("umlsync")) {
					file.delete(true, null);
				}
			}
		} catch (CoreException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return "";
	}

	protected String SaveDiagram(List<THttpGetKey> keys) throws Exception {
		String path = GetValue("path", keys);
		String key = GetValue("key", keys);
		String diagram = GetValue("diagram", keys);

		// Cut first "/"
		if (path.charAt(0) == '/') {
			path = path.substring(1);
		}

		final String projectName = path.contains("/") ? path.split("/")[0] : path;
		String[] splitedPath = path.split("/");
		if (splitedPath.length < 2) {
			throw new Exception("Wrong path to diagram.");

		}

		IProject project = ResourcesPlugin.getWorkspace().getRoot().getProject(splitedPath[0]);
		if (project == null) {
			throw new Exception("Project " + splitedPath[0] + " not found.");
		}
		
		String subpath = path.substring(splitedPath[0].length() +1);
		if (!subpath.endsWith(ViewManager.getDiagramFileExtension())) {
			subpath += ViewManager.getDiagramFileExtension();
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

		return "";
	}

	protected String OpenDiagram(List<THttpGetKey> keys) throws Exception {
		String path = GetValue("path", keys);

		// Cut first "/"
		if (path.charAt(0) == '/') {
			path = path.substring(1);
		}
		
		String[] splitedPath = path.split("/");
		if (splitedPath.length < 2) {
			throw new Exception("Wrong path to diagram.");

		}

		IProject project = ResourcesPlugin.getWorkspace().getRoot().getProject(splitedPath[0]);
		if (project == null) {
			throw new Exception("Project " + splitedPath[0] + " not found.");
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

	@Override
	public String ProcessRequest(THttpCapability capability,
			List<THttpGetKey> keys) throws Exception {
		if (capability.Handler == null) {
			return "{}";
		}
		return capability.Handler.handle(this, keys);
	}

	@Override
	public String getUid() {
		return "un"; // universal/default view
	}

	@Override
	public String getName() {
		return "Common";
	}

	private String GetValue(String key, List<THttpGetKey> keys) {
		for (THttpGetKey k : keys) {
			if (k.Name.equals(key)) {
				return k.Value;
			}
		}
		return "";
	}

	private String GetProjectsList() {
		String result = "";
		String comma = "";
		IProject[] projects = ResourcesPlugin.getWorkspace().getRoot().getProjects();
		for (int i=0; i<projects.length; ++i) {
			IProjectNature nature;
			try {
				String projectNature = "'addClass':'project'";
				if (projects[i].getNature("org.eclipse.jdt.core.javanature") != null) {
					projectNature = "'addClass':'jproject'";
				} else if (projects[i].getNature("org.eclipse.cdt.core.cnature") != null) {
					projectNature = "'addClass':'cproject'";
				}
				result += comma + "{'isLazy': true, 'isFolder': true, 'title': '" +  projects[i].getName() + "',"+ projectNature+"}";
			} catch (CoreException e) {
				result += comma + "{'isLazy': true, 'isFolder': true, 'title': '" +  projects[i].getName() + "', 'addClass':'project'}";
			}

			comma = ",";
		}		
		return result;
	}

	private String GetResourceList(String path) {
		String result = "";
		String comma = "";
		if (path.charAt(0) == '/') {
			path = path.substring(1);
		}
		final String projectName = path.contains("/") ? path.split("/")[0] : path;
		String subpath = (path == projectName) ? "" : path.substring(projectName.length() + 1);
		IProject project = ResourcesPlugin.getWorkspace().getRoot().getProject(projectName);
		IResource res = project;
		if (!subpath.isEmpty()) {
			res = project.findMember(subpath);
		}

		if (res instanceof IFile) {
			return GetFileResourcesList((IFile) res);
		}

		final IResource searchRes = res;
		final List<IResource> resources = new ArrayList<IResource>();
		try {
			searchRes.accept(new IResourceVisitor() {
				public boolean visit(IResource resource) throws CoreException {

					if (resource.equals(searchRes)) {
						return true;
					}

					//exclude hidden resources
					if ((resource.getType() == IResource.HIDDEN)
							|| (resource.getName().indexOf('.') == 0))
						return false;

					if (resource instanceof IFolder) {
						resources.add(resource);
					}

					if (resource instanceof IFile) {
						resources.add(resource);
					}

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
				extraInfo = ", 'addClass' : 'cfolder'";
			}

			if ((resource instanceof IFile)
					&& resource.getFileExtension() != null) {

				if (resource.getFileExtension().equals("umlsync")) {
					extraInfo = ", 'addClass' : 'diagramclass'";
				} else {
					isLazy = "true"; // File could provide more information about classes
					extraInfo = ", 'addClass' : 'cfile'";
				}
			}
			result += comma + "{'isLazy': " + isLazy + ", 'isFolder' : " + isFolder + ", 'title': '" +  resource.getName() + "'"+extraInfo+"}";
			comma = ",";

		}

		return result;
	}
	private String GetFileResourcesList(IFile res) {
		String result = "";
		ICModel cModel= CoreModel.getDefault().getCModel();
		final List<ICElement> components = new ArrayList<ICElement>();
		final ICProject proj = CoreModel.getDefault().getCModel().getCProject(res.getProject().getName());
		try {
			final ICElement elem = proj.findElement(res.getLocation());
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

	public String GetList(List<THttpGetKey> keys) {
		String path = GetValue("path", keys);
		String result = "[";

		if (path.isEmpty() || path.equals("/")) {
			result += GetProjectsList();
		}
		else {
			result += GetResourceList(path);
		}

		result += "]";
		return result;
	}

	public String NewFolder(List<THttpGetKey> keys) throws Exception {
		String path = GetValue("path", keys);
		String key = GetValue("key", keys);

		// Cut first "/"
		if (path.charAt(0) == '/') {
			path = path.substring(1);
		}

		final String projectName = path.contains("/") ? path.split("/")[0] : path;
		String[] splitedPath = path.split("/");
		IProject project = null;
		String subpath = "";
		if (splitedPath.length == 0) {
			project = ResourcesPlugin.getWorkspace().getRoot().getProject(path);

		} else {
			project = ResourcesPlugin.getWorkspace().getRoot().getProject(splitedPath[0]);
			subpath = path.substring(splitedPath[0].length() +1);
		}

		if (project == null) {
			throw new Exception("Project " + path + " not found.");
		}
		
		 
		IResource file = project.findMember(path.substring(splitedPath[0].length() +1));
		
		try {
			if (file instanceof IFolder) {
				IFolder folder = (IFolder) file;
				if (folder.exists()) {
					IFolder fff = project.getFolder(subpath + key);
					if (!fff.exists()) {
						fff.create(true, true, null);
					}
				}
			}
				
			
		} catch (CoreException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		return "";
	}

}
