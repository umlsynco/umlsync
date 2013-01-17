import java.util.Map;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown=true)
public class DiagramJSON {

	@JsonIgnoreProperties({"z-index"})
	public static class Element {
		public String type;
		public int width, height;
		public float pageX, pageY, left, top, height_a, height_o;
		public int id;
		public String ctx_menu, menu, icon, title, viewid, name, filepath;
		public String[] operations, attributes;
	}

	public static class Connector {
		public String type;
		public int fromId, toId;
		public String[] lables;
		public  java.util.HashMap<String,Float>[] epoints;

	}
	public Connector[] connectors;
	public Element[] elements;
	public String type;
	public String name;
	public String base_type;
	public String viewid, fullname, multicanvas; 
}
