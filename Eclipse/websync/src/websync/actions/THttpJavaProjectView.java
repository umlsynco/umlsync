package websync.actions;

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

import org.eclipse.jdt.core.ICompilationUnit;
import org.eclipse.jdt.core.IJavaElement;
import org.eclipse.jdt.core.IJavaProject;
import org.eclipse.jdt.core.IPackageFragment;
import org.eclipse.jdt.core.IPackageFragmentRoot;
import org.eclipse.jdt.core.IParent;
import org.eclipse.jdt.core.IType;
import org.eclipse.jdt.core.JavaCore;
import org.eclipse.jdt.core.JavaModelException;
import org.eclipse.jdt.core.SourceRange;

import websync.http.interfaces.IHttpView;
import websync.http.interfaces.IHttpViewManager;
import websync.http.interfaces.uri.THttpCapabiliesFactory;
import websync.http.interfaces.uri.THttpCapability;
import websync.http.interfaces.uri.THttpGetKey;
import websync.http.interfaces.uri.THttpCapability.ICapabilityHandler;

public class THttpJavaProjectView implements IHttpView {
	public static final int REQUEST_CLASS_INFO = 0; // extra filters could be added to this method
	// like public only, or methods only etc ... 
	public static final int REQUEST_CLASS_BASE = 1; // Name based limitations could be added to this method 
	public static final int REQUEST_CLASS_GENERALIZATION = 2;
	public static final int REQUEST_CLASS_NESTED = 3;

	private IHttpViewManager ViewManager = null;
	public THttpJavaProjectView(IHttpViewManager vm) {
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
				if (view instanceof THttpJavaProjectView) {
					THttpJavaProjectView v = (THttpJavaProjectView)view;
					return v.GetList(keys);
				}
				return "";
			}
		}));

		result.add(THttpCapabiliesFactory.VIEW_OPEN_DIAGRAM(new ICapabilityHandler() {
			@Override
			public String handle(IHttpView view, List<THttpGetKey> keys) {
				if (view instanceof THttpJavaProjectView) {
					THttpJavaProjectView v = (THttpJavaProjectView)view;
					return v.GetList(keys);
				}
				return "";
			}
		}));
		result.add(THttpCapabiliesFactory.VIEW_SAVE_DIAGRAM(new ICapabilityHandler() {
			@Override
			public String handle(IHttpView view, List<THttpGetKey> keys) {
				if (view instanceof THttpJavaProjectView) {
					THttpJavaProjectView v = (THttpJavaProjectView)view;
					return v.GetList(keys);
				}
				return "";
			}
		}));
		result.add(THttpCapabiliesFactory.VIEW_REMOVE_DIAGRAM(new ICapabilityHandler() {
			@Override
			public String handle(IHttpView view, List<THttpGetKey> keys) {
				if (view instanceof THttpJavaProjectView) {
					THttpJavaProjectView v = (THttpJavaProjectView)view;
					return v.GetList(keys);
				}
				return "";
			}
		}));

		// Translation Unit based
		result.add(THttpCapabiliesFactory.CLASS_METHOD(new ICapabilityHandler() {
			@Override
			public String handle(IHttpView view, List<THttpGetKey> keys) {
				if (view instanceof THttpJavaProjectView) {
					THttpJavaProjectView v = (THttpJavaProjectView)view;
					return v.GetClassInfo(keys, REQUEST_CLASS_INFO);
				}
				return "";
			}
		}));
		result.add(THttpCapabiliesFactory.CLASS_BASE(new ICapabilityHandler() {
			@Override
			public String handle(IHttpView view, List<THttpGetKey> keys) {
				if (view instanceof THttpJavaProjectView) {
					THttpJavaProjectView v = (THttpJavaProjectView)view;
					return v.GetClassInfo(keys, REQUEST_CLASS_BASE);
				}
				return "";
			}
		}));
		result.add(THttpCapabiliesFactory.CLASS_NESTED(new ICapabilityHandler() {
			@Override
			public String handle(IHttpView view, List<THttpGetKey> keys) {
				if (view instanceof THttpJavaProjectView) {
					THttpJavaProjectView v = (THttpJavaProjectView)view;
					return v.GetClassInfo(keys, REQUEST_CLASS_NESTED);
				}
				return "";
			}
		}));

		// Index DB based
		result.add(THttpCapabiliesFactory.CLASS_GENERALIZATION());

		return result;
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
		return "java";
	}

	@Override
	public String getName() {
		return "Java";
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
			if (JavaCore.create(projects[i]) != null) {
			   result += comma + "{'isLazy': true, 'isFolder': true, 'title': '" +  projects[i].getName() + "', 'addClass':'jproject'}";
			   comma = ",";
			}
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
		if (JavaCore.create(project) == null) {
			return ""; // Not Java Project
		}

		IResource res = project;
		IJavaElement tmp = JavaCore.create(res);
		if (!subpath.isEmpty()) {
			String[] ps = subpath.split("/");
			for (int i =0; i< ps.length; ++i) {
				if (tmp instanceof IParent) {
					IParent pr = (IParent)tmp;
					try {
						for (IJavaElement p: pr.getChildren()) {
							if (p.getElementName().equals(ps[i])) {
								tmp = p;
								break;
							}
						}
					} catch (JavaModelException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
				}
				else if (tmp instanceof IPackageFragmentRoot) {
					IPackageFragmentRoot root = (IPackageFragmentRoot)tmp;
				}
				
			}
		}

//		IJavaElement tmp = JavaCore.create(res);
		if (tmp instanceof ICompilationUnit) {
			ICompilationUnit icu = (ICompilationUnit)tmp;
			try {
				for (IType p: icu.getAllTypes()) {
					result += comma + "{'isLazy': false, 'isFolder': false, 'title': '" + p.getElementName() + "', 'addClass':'iconclass'}";
					comma = ",";
				}
			} catch (JavaModelException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
		else if (tmp instanceof IParent) {
			IParent javaProject = (IParent)tmp;
			if (tmp instanceof ICompilationUnit) {
				ICompilationUnit icu = (ICompilationUnit)tmp;
			}

			try {
				//IPackageFragmentRoot[] packages = javaProject.getAllPackageFragmentRoots();
				//for (IPackageFragmentRoot p : packages) {
				IJavaElement[] packages = javaProject.getChildren();
				for (IJavaElement p : packages) {
					if (p instanceof ICompilationUnit) {
						result += comma + "{'isLazy': true, 'isFolder': false, 'title': '" + p.getElementName() + "', 'addClass':'javafile'}";
					}
					else if (p instanceof IPackageFragmentRoot) {
						if (p.getElementName().endsWith(".jar")) {
							result += comma + "{'isLazy': true, 'isFolder': true, 'title': '" + p.getElementName() + "', 'addClass':'packageroot'}";
						} else {
							result += comma + "{'isLazy': true, 'isFolder': true, 'title': '" + p.getElementName() + "', 'addClass':'cfolder'}";
						}
					}
					else if (p instanceof IPackageFragment) {
						result += comma + "{'isLazy': true, 'isFolder': true, 'title': '" + p.getElementName() + "', 'addClass':'package'}";
					}
					comma = ",";
				}
			} catch (JavaModelException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
		
		return result;
	}
	private String GetFileResourcesList(IFile res) {
		String result = "";
		IJavaElement elem = JavaCore.create(res);

		return "";
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

	protected String GetClassInfo(List<THttpGetKey> keys, int requestedType) {
		String path = GetValue("path", keys);
		String key = GetValue("key", keys);

		String result = "";
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
		else {
			return "";
		}

		ICModel cModel= CoreModel.getDefault().getCModel();
		final List<ICElement> components = new ArrayList<ICElement>();
		final ICProject proj = CoreModel.getDefault().getCModel().getCProject(projectName);
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

		String name = "[";
		String comma = "";
		for (ICElement c: components) {

			if (c instanceof Structure) {
				Structure s = (Structure)c;
				if (s.getElementName().equals(key)) {
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
		}
		return name + "]";
	}

}
