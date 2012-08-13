package websync.http.interfaces;

import java.util.List;

import org.eclipse.core.resources.IFile;

import websync.http.interfaces.uri.THttpGetKey;

public interface IHttpViewManager {
 	/* put_symbol attributums. */
 	public final static int PAF_PRIVATE = 0x000001;
 	public final static int PAF_PROTECTED = 0x000002;
 	public final static int PAF_PUBLIC = 0x000004;
 	public final static int PAF_STATIC = 0x000008;
 	public final static int PAF_VIRTUAL = 0x001000;
 	
 	public final static int PAF_ABSTRACT = 0x000010;
 	public final static int PAF_FINAL = 0x000020;
 	public final static int PAF_NATIVE = 0x000040;
 	public final static int PAF_SYNCHRONIZED = 0x000080;
 	public final static int PAF_VOLATILE = 0x000100;
 	public final static int PAF_TRANSIENT = 0x000200;
 	public final static int PAF_INTERFACE = 0x000400;
 	public final static int PAF_IMPLEMENTS = 0x000800;
 	public final static int PAF_INLINE = 0x002000;
 	public final static int PAF_CONSTRUCTOR = 0x004000;
 	public final static int PAF_DESTRUCTOR = PAF_CONSTRUCTOR;
 	public final static int PAF_PUREVIRTUAL = (0x008000 | PAF_VIRTUAL);
 	public final static int PAF_STRUCT_DEF = 0x010000;
 	
 	public final static int PAF_OVERRIDE = 0x20000;
 	public final static int PAF_OVERLOADED = 0x40000;

	public void registerView(IHttpView v);
	public String getDiagramFileExtension();
	public String save(List<THttpGetKey> keys) throws Exception;
	public String open(List<THttpGetKey> keys) throws Exception;
	public String remove(List<THttpGetKey> keys) throws Exception;
	public String newfolder(List<THttpGetKey> keys) throws Exception;
	String open(IFile file) throws Exception;
}
