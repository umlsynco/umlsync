package websync.http.interfaces.uri;

import java.util.ArrayList;
import java.util.List;

import websync.http.interfaces.uri.THttpCapability.ICapabilityHandler;

public class THttpCapabiliesFactory {
	// vm/%viewid%/getlist     - get list of resource
    // vm/%viewid%/save        - save diagram
	// vm/%viewid%/open        - open diagram or source code on client
	// vm/%viewid%/remove      - remove diagram or folder with diagrams only
	private final static List<THttpGetKey> GetPathArguments() {
	    List<THttpGetKey> result = new ArrayList<THttpGetKey>();
	    result.add(THttpKeysFactory.PathKey());
	    result.add(THttpKeysFactory.OptionalNameKey());
	    return result;
	}

	private final static List<THttpGetKey> GetClassArguments() {
	    List<THttpGetKey> result = new ArrayList<THttpGetKey>();
	    result.add(THttpKeysFactory.NameKey());
	    result.add(THttpKeysFactory.PathKey());
	    return result;
	}
	
	private final static List<THttpGetKey> GetClassNameArguments() {
	    List<THttpGetKey> result = new ArrayList<THttpGetKey>();
	    result.add(THttpKeysFactory.NameKey());
	    result.add(THttpKeysFactory.OptionalPathKey());
	    return result;
	}

	private final static List<THttpGetKey> GetDiagramArguments() {
	    List<THttpGetKey> result = new ArrayList<THttpGetKey>();
	    result.add(THttpKeysFactory.DescriptionKey());
	    result.add(THttpKeysFactory.PathKey());
	    result.add(THttpKeysFactory.DiagramKey());
	    return result;
	}

	public static final THttpCapability VIEW_CAPABILITIES() {return new THttpCapability("getcapabilities", GetPathArguments()); }
	public static final THttpCapability VIEW_TREE(ICapabilityHandler t) {
		  THttpCapability capability = new THttpCapability("getlist", GetPathArguments());
		  capability.SetHandler(t);
		  return capability;
	}
	public static final THttpCapability VIEW_OPEN_FILE(ICapabilityHandler t) {
		  THttpCapability capability = new THttpCapability("openfile", GetPathArguments());
		  capability.SetHandler(t);
		  return capability;
	}
	public static final THttpCapability VIEW_NEW_FOLDER(ICapabilityHandler t) {
		THttpCapability capability = new THttpCapability("newfolder", GetClassArguments());
		capability.SetHandler(t);
		return capability;
	}
	public static final THttpCapability VIEW_SAVE_DIAGRAM(ICapabilityHandler t) {
		THttpCapability capability = new THttpCapability("save", GetDiagramArguments());
		capability.SetHandler(t);
		return capability;
	}
	public static final THttpCapability VIEW_OPEN_DIAGRAM(ICapabilityHandler t) {
		THttpCapability capability = new THttpCapability("open", GetPathArguments());
		capability.SetHandler(t);
		return capability;
	}
	public static final THttpCapability VIEW_REMOVE_DIAGRAM(ICapabilityHandler t) {
		THttpCapability capability = new THttpCapability("remove", GetPathArguments());
		capability.SetHandler(t);
		return capability;
	}
	
	public static final THttpCapability CLASS_METHOD(ICapabilityHandler t) {
		THttpCapability capability = new THttpCapability("db/class/methods", GetClassNameArguments());
		capability.SetHandler(t);
		return capability;
	}

	public static final THttpCapability CLASS_BASE(ICapabilityHandler t) {
		THttpCapability capability =  new THttpCapability("db/class/base", GetClassArguments());
		capability.SetHandler(t);
		return capability;
	}
	public static final THttpCapability CLASS_NESTED(ICapabilityHandler t) {
		THttpCapability capability =  new THttpCapability("db/class/nested", GetClassArguments());
		capability.SetHandler(t);
		return capability;
	}
	
	public static final THttpCapability CLASS_GENERALIZATION() {return new THttpCapability("class/generalization", GetClassArguments()); }
	public static final THttpCapability CLASS_ASSOCIATION() {return new THttpCapability("class/association", GetClassArguments()); }
	public static final THttpCapability CLASS_AGGRAGATION() {return new THttpCapability("class/aggregation", GetClassArguments()); }
	public static final THttpCapability CLASS_COMPOSITION() {return new THttpCapability("class/composition", GetClassArguments()); }
	public static final THttpCapability CLASS_FRIEND() {return new THttpCapability("class/friend", GetClassArguments()); }
}
