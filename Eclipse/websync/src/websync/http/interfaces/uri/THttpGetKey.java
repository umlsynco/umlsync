package websync.http.interfaces.uri;

public class THttpGetKey {
	public final static int KEY_STRING = 0;
	public final static int KEY_INT = 1;

	public final static int KEY_REQUIRED = 0;
	public final static int KEY_OPTIONAL = 1;

	public String Name = "";
	public int Type = KEY_STRING;
	public int Min = 0;
	public int Max = 256;
	public String RegExp = "";
	public boolean IsRequired = true;
	public boolean IsInitialized = false;
	public String Value = "";

	public  THttpGetKey(String name, int type, int min, int max, String regexp, int isRequired) {};
	public  THttpGetKey(String name) { Name = name;}
	public THttpGetKey(String name, boolean isRequired) {
		Name = name;
		IsRequired = isRequired;
	}
	public THttpGetKey(THttpGetKey arg) {
		Name = arg.Name;
		Type = arg.Type;
		Min = arg.Min;
		Max = arg.Max;
		RegExp = arg.RegExp;
		IsRequired = arg.IsRequired;
		IsInitialized = arg.IsInitialized;
		Value = arg.Value;
	};
}
