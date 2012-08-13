package websync.http.interfaces.uri;

public class THttpKeysFactory {
	public final static THttpGetKey NameKey() {return new THttpGetKey("key");}
	public final static THttpGetKey PathKey() {return new THttpGetKey("path");}
	public final static THttpGetKey OptionalPathKey() {return new THttpGetKey("path", false);}
	public final static THttpGetKey DiagramKey() {return new THttpGetKey("diagram");}
	public final static THttpGetKey DescriptionKey() {return new THttpGetKey("description");}

	public final static THttpGetKey CallbackKey() {return new THttpGetKey("callback");}
	public final static THttpGetKey SessionIdKey() {return new THttpGetKey("_");}
	public static THttpGetKey OptionalNameKey() {return new THttpGetKey("key", false);}
}
