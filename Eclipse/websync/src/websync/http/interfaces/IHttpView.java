package websync.http.interfaces;

import java.util.List;

import websync.http.interfaces.uri.THttpCapability;
import websync.http.interfaces.uri.THttpGetKey;

public interface IHttpView {
	public List<THttpCapability> GetCapabilitis();
	public String ProcessRequest(THttpCapability capability, List<THttpGetKey> keys) throws Exception;
	public String getUid();
	public String getName();
}
