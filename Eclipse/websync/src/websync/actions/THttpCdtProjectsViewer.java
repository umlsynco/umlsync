package websync.actions;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

import org.eclipse.cdt.core.CCorePlugin;
import org.eclipse.cdt.core.dom.ast.DOMException;
import org.eclipse.cdt.core.dom.ast.IBinding;
import org.eclipse.cdt.core.dom.ast.cpp.ICPPClassType;
import org.eclipse.cdt.core.dom.ast.cpp.ICPPNamespace;
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
import org.eclipse.cdt.core.parser.ast.ASTAccessVisibility;
import org.eclipse.cdt.internal.core.model.Enumeration;
import org.eclipse.cdt.internal.core.model.Namespace;
import org.eclipse.cdt.internal.core.model.Parent;
import org.eclipse.cdt.internal.core.model.Structure;
import org.eclipse.core.resources.IFile;
import org.eclipse.core.resources.IFolder;
import org.eclipse.core.resources.IProject;
import org.eclipse.core.resources.IResource;
import org.eclipse.core.resources.IResourceVisitor;
import org.eclipse.core.resources.ResourcesPlugin;
import org.eclipse.core.runtime.CoreException;
import org.eclipse.core.runtime.IPath;

import websync.http.interfaces.IHttpView;
import websync.http.interfaces.IHttpViewManager;
import websync.http.interfaces.uri.THttpCapabiliesFactory;
import websync.http.interfaces.uri.THttpCapability;
import websync.http.interfaces.uri.THttpGetKey;
import websync.http.interfaces.uri.THttpCapability.ICapabilityHandler;

public class THttpCdtProjectsViewer implements IHttpView {
	public static final int REQUEST_CLASS_INFO = 0; // extra filters could be added to this method
	// like public only, or methods only etc ... 
	public static final int REQUEST_CLASS_BASE = 1; // Name based limitations could be added to this method 
	public static final int REQUEST_CLASS_GENERALIZATION = 2;
	public static final int REQUEST_CLASS_NESTED = 3;

	private IHttpViewManager ViewManager = null;
	public THttpCdtProjectsViewer(IHttpViewManager vm) {
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
				if (view instanceof THttpCdtProjectsViewer) {
					THttpCdtProjectsViewer v = (THttpCdtProjectsViewer)view;
					return v.GetList(keys);
				}
				return "";
			}
		}));

		result.add(THttpCapabiliesFactory.VIEW_NEW_FOLDER(new ICapabilityHandler() {
			@Override
			public String handle(IHttpView view, List<THttpGetKey> keys) throws Exception {
				if (view instanceof THttpCdtProjectsViewer) {
					THttpCdtProjectsViewer v = (THttpCdtProjectsViewer)view;
					return v.NewFolder(keys);
				}
				return "";
			}
		}));
		result.add(THttpCapabiliesFactory.VIEW_OPEN_DIAGRAM(new ICapabilityHandler() {
			@Override
			public String handle(IHttpView view, List<THttpGetKey> keys) throws Exception {
				if (view instanceof THttpCdtProjectsViewer) {
					THttpCdtProjectsViewer v = (THttpCdtProjectsViewer)view;
					return v.OpenDiagram(keys);
				}
				return "";
			}
		}));
		result.add(THttpCapabiliesFactory.VIEW_SAVE_DIAGRAM(new ICapabilityHandler() {
			@Override
			public String handle(IHttpView view, List<THttpGetKey> keys) throws Exception {
				if (view instanceof THttpCdtProjectsViewer) {
					THttpCdtProjectsViewer v = (THttpCdtProjectsViewer)view;
					return v.SaveDiagram(keys);
				}
				return "";
			}
		}));
		result.add(THttpCapabiliesFactory.VIEW_REMOVE_DIAGRAM(new ICapabilityHandler() {
			@Override
			public String handle(IHttpView view, List<THttpGetKey> keys) throws Exception {
				if (view instanceof THttpCdtProjectsViewer) {
					THttpCdtProjectsViewer v = (THttpCdtProjectsViewer)view;
					return v.RemoveDiagram(keys);
				}
				return "";
			}
		}));

		// Translation Unit based
		result.add(THttpCapabiliesFactory.CLASS_METHOD(new ICapabilityHandler() {
			@Override
			public String handle(IHttpView view, List<THttpGetKey> keys) {
				if (view instanceof THttpCdtProjectsViewer) {
					THttpCdtProjectsViewer v = (THttpCdtProjectsViewer)view;
					return v.GetClassInfo(keys, REQUEST_CLASS_INFO);
				}
				return "";
			}
		}));
		result.add(THttpCapabiliesFactory.CLASS_BASE(new ICapabilityHandler() {
			@Override
			public String handle(IHttpView view, List<THttpGetKey> keys) {
				if (view instanceof THttpCdtProjectsViewer) {
					THttpCdtProjectsViewer v = (THttpCdtProjectsViewer)view;
					return v.GetClassInfo(keys, REQUEST_CLASS_BASE);
				}
				return "";
			}
		}));
		result.add(THttpCapabiliesFactory.CLASS_NESTED(new ICapabilityHandler() {
			@Override
			public String handle(IHttpView view, List<THttpGetKey> keys) {
				if (view instanceof THttpCdtProjectsViewer) {
					THttpCdtProjectsViewer v = (THttpCdtProjectsViewer)view;
					return v.GetClassInfo(keys, REQUEST_CLASS_NESTED);
				}
				return "";
			}
		}));

		// Index DB based
		result.add(THttpCapabiliesFactory.CLASS_GENERALIZATION());

		return result;
	}

	protected String NewFolder(List<THttpGetKey> keys) throws Exception {
		return ViewManager.newfolder(keys);
	}

	protected String RemoveDiagram(List<THttpGetKey> keys) throws Exception {
		return ViewManager.remove(keys);
	}

	protected String SaveDiagram(List<THttpGetKey> keys) throws Exception {
		String path = GetValue("path", keys);
		String key = GetValue("key", keys);
		String diagram = GetValue("diagram", keys);

		// 1. Get path and check resource
		// 2. Get resource path
		// 3. Call ViewManager SaveDiagram for resource
		// 4. ViewManager should call the common view interface to save diagram
		return ViewManager.save(keys);
	}

	protected String OpenDiagram(List<THttpGetKey> keys) throws Exception {
		return ViewManager.open(keys);
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
		return "cp";
	}

	@Override
	public String getName() {
		return "C/C++";
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
			result += comma + "{'isLazy': true, 'isFs': true, 'title': '" +  projects[i].getName() + "', 'addClass':'cproject'}";
			comma = ",";
		}		
		return result;
	}

	private String GetResourceList(String path, String key) {
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
			return GetFileResourcesList((IFile) res, key);
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
			// 'isFolder' : " + isFolder + 
			result += comma + "{'isLazy': " + isLazy + ", 'isFs':true, 'title': '" +  resource.getName() + "'"+extraInfo+"}";
			comma = ",";

		}

		return result;
	}
	private String GetFileResourcesList(IFile res, String key) {
		String result = "";
		ICModel cModel= CoreModel.getDefault().getCModel();
		ICElement[] components = null;
		final ICProject proj = CoreModel.getDefault().getCModel().getCProject(res.getProject().getName());
		try {
			ICElement elem = proj.findElement(res.getLocation());
			if (key != null && !key.isEmpty()) {
				for (String g : key.split("::")) {
					if (g.isEmpty()) {
						continue;
					}

					if (elem instanceof Parent) {
						for (ICElement e :  ((Parent)elem).getChildren()) {
							if (g.equals(e.getElementName())) {
								elem = e;
								break;
							}		
						}
					}
				}
			}
			if (elem instanceof Parent) {
				components = ((Parent)elem).getChildren();
			}
		} catch (CoreException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		String name = "";
		String comma = "";
		for (ICElement c: components) {
			if (c instanceof Structure) {
				Structure s = (Structure)c;
				boolean isAbstract = false;

				try {
					isAbstract = s.isAbstract();
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
				if (isAbstract) {
					name += comma + "{'isLazy': false, 'isFs' : false, 'title': '" +  c.getElementName() + "', 'addClass': 'iconinterface'}";
				} else {
					name += comma + "{'isLazy': false, 'isFs' : false, 'title': '" +  c.getElementName() + "', 'addClass': 'iconclass'}";
				}
				comma = ",";
			} else if (c instanceof Namespace) {
				//Namespace s = (Namespace)c;
				name += comma + "{'isLazy': true, 'isFs' : false, 'title': '" +  c.getElementName() + "', 'addClass': 'namespace'}";
				comma = ",";
			}
		}
		return name;
	}

	public String GetList(List<THttpGetKey> keys) {
		String path = GetValue("path", keys);
		String key = GetValue("key", keys);
		String result = "[";

		if (path.isEmpty() || path.equals("/")) {
			result += GetProjectsList();
		}
		else {
			result += GetResourceList(path, key);
		}

		result += "]";
		return result;
	}

	@SuppressWarnings("restriction")
	public String GetClassFiles(String className)
	{
		ICModel cModel= CoreModel.getDefault().getCModel();
		IIndexManager manager = CCorePlugin.getIndexManager();
		IProject[] projects = ResourcesPlugin.getWorkspace().getRoot().getProjects();

		String name = ""; //result
		String comma = "";

		for (IProject p : projects) {
			ICProject cProject = cModel.getCProject(p.getName());

			if (cProject == null) {
				continue;
			}

			try {
				IIndex indexDb = manager.getIndex(cProject);
				if (indexDb == null)
					continue;
				IIndexBinding[] bindings = indexDb.findBindings(Pattern.compile(className), false, IndexFilter.ALL_DECLARED, null);

				if ((bindings != null) && bindings.length > 0) 
				{
					ICPPClassType iClassType = null;
					for (IIndexBinding binding : bindings)  
					{
						if  (binding instanceof ICPPClassType)
						{						
							iClassType = (ICPPClassType)  indexDb.adaptBinding(binding);
							String qualifiedName = "";
							try {
								String[] names = iClassType.getQualifiedName();
								String separator = ""; 
								for (String s: names) {
									qualifiedName += (separator + s);
									separator = "::";									
								}
								IIndexName[] refs = indexDb.findNames(iClassType, indexDb.FIND_DEFINITIONS);
								for (IIndexName r: refs) {
									if (r.isDefinition()) {
										name += comma + "{'title':'"+qualifiedName+"', 'filepath':'"+r.getFile().getLocation().getFullPath()+"'}";
										comma = ",";
									}

								}

							} catch (DOMException e) {
								// TODO Auto-generated catch block
								e.printStackTrace();
							}
						}
					}
				}
				else {
					continue;
				}
			} catch (CoreException e1) {
				continue; // No index support for the selected project
			}
		}
		return name;
	}

	protected String GetClassInfo(List<THttpGetKey> keys, int requestedType) {
		String path = GetValue("path", keys);
		String key = GetValue("key", keys);

		if (path.isEmpty()) {
			return this.GetClassFiles(key);
		}

		String result = "";
		if (!path.isEmpty() && path.charAt(0) == '/') {
			path = path.substring(1);
		}
		final String projectName = path.contains("/") ? path.split("/")[0] : path;
		String subpath = (path == projectName) ? "" : path.substring(projectName.length() + 1);

		IProject project = ResourcesPlugin.getWorkspace().getRoot().getProject(projectName);
		IResource res = project;
		if (!subpath.isEmpty()) {
			res = project.findMember(subpath);
		}
		else {
			return "";
		}

		ICModel cModel= CoreModel.getDefault().getCModel();
		ICElement[] components = null;
		final ICProject proj = CoreModel.getDefault().getCModel().getCProject(projectName);
		ICElement elem = null;
		try {
			elem = proj.findElement(res.getLocation());
			if (key != null && !key.isEmpty()) {
				for (String g : key.split("::")) {
					if (g.isEmpty()) {
						continue;
					}

					if (elem instanceof Parent) {
						for (ICElement e :  ((Parent)elem).getChildren()) {
							if (g.equals(e.getElementName())) {
								elem = e;
								break;
							}		
						}
					}
				}
			}
		} catch (CoreException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		String name = "[";
		String comma = "";
		{

			if (elem instanceof Structure) {
				Structure s = (Structure)elem;
				{
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
								int methodVisibility = 0;
								methodVisibility |= m.isPureVirtual() ? ViewManager.PAF_ABSTRACT : 0;
								methodVisibility |= m.isConstructor() ? ViewManager.PAF_CONSTRUCTOR : 0;
								methodVisibility |= m.isDestructor() ? ViewManager.PAF_DESTRUCTOR : 0;
								methodVisibility |= m.isStatic() ? ViewManager.PAF_STATIC : 0;
								methodVisibility |= m.getVisibility().equals(ASTAccessVisibility.PRIVATE)? ViewManager.PAF_PRIVATE : 0;
								methodVisibility |= m.getVisibility().equals(ASTAccessVisibility.PROTECTED)? ViewManager.PAF_PROTECTED : 0;
								methodVisibility |= m.getVisibility().equals(ASTAccessVisibility.PUBLIC)? ViewManager.PAF_PUBLIC : 0;
								name += comma + "{'md':'"+ m.getElementName()+ 
										"', 'attr':'"+ methodVisibility +
										"', 'ret':'"+ m.getReturnType()+
										"', 'args':'"+allparams+"'}";
								comma = ",";
							}
							//break;
						}

						if (requestedType == REQUEST_CLASS_BASE) {
							String[] hhh = s.getSuperClassesNames();
							for (String n : s.getSuperClassesNames()) {

								name += comma + "{'title':'" + n + "'}";
								comma = ",";
							}

						}

						if (requestedType == REQUEST_CLASS_NESTED) {
							for (ICElement n : s.getChildren()) {
								if (n instanceof Structure) {
									name += comma + "{'title':'" + n.getElementName() + "'}";
									comma = ",";
								}
							}						
						}
					} catch (CModelException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
				}
			}
		}
		return name + "]";
	}

}
