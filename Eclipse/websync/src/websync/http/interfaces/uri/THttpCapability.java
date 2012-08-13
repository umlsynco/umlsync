package websync.http.interfaces.uri;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import websync.http.interfaces.IHttpView;
import websync.http.interfaces.uri.THttpCapability.ICapabilityHandler;

public class THttpCapability {
	public interface ICapabilityHandler {
		String handle(IHttpView view, List<THttpGetKey> keys) throws Exception;
	}
	public String Uri;
	List<THttpGetKey> Arguments;
	public ICapabilityHandler Handler;
	public THttpCapability(String uri, List<THttpGetKey> arguments) { Uri = uri; Arguments= arguments;}
	public void SetHandler(ICapabilityHandler t) {
		Handler = t;		
	}

	public List<THttpGetKey> CloneArguments() { 
		List<THttpGetKey> arguments = new ArrayList<THttpGetKey>(this.Arguments.size());
		for (THttpGetKey arg : this.Arguments) {
			arguments.add(new THttpGetKey(arg));
		}
		return arguments;
	}
}

