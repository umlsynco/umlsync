import java.awt.Font;
import java.awt.Rectangle;
import java.awt.Graphics2D;
import java.awt.Color;
import java.io.File;
import java.io.Writer;
import java.io.OutputStreamWriter;
import java.io.IOException;
import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.Iterator;

import org.apache.batik.svggen.SVGGraphics2D;
import org.apache.batik.dom.GenericDOMImplementation;

import org.w3c.dom.Document;
import org.w3c.dom.DOMImplementation;

import com.fasterxml.jackson.annotation.JsonTypeInfo.Id;
import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;


public class TestSVGGen {

	public static int FONT_INDENTATION = 17;
	
	private float _getRValue(float x1, float x2, int w) {
        float diffx = x2-x1;
        if (diffx>0) {
            if (diffx > w)
                return x1 + w;
            return x2;
        }
        return x1;
    }
	
	private DiagramJSON.Element getElementById(int id, DiagramJSON d) {
		for (int i=0; i<d.elements.length; ++i) {
			if (d.elements[i].id == id) {
				return d.elements[i];
			}
		}
		return null;
	}
	
	public class Point {
		public float x,y;
		public Point(float x1, float y1) {x=x1;y=y1;}
	}
	
	private void drawGeneralization(Graphics2D g2d, ArrayList<Point> points) {
		int ep = points.size()-1;
        float x2 = points.get(ep).x,
        x1 = points.get(ep-1).x,
        y2 = points.get(ep).y,
        y1 = points.get(ep-1).y;

        float x = 10,
            dx = x2 -x1,
            dy = y2 -y1,
            gip = (float) Math.sqrt((double)(dx*dx + dy*dy));

        if (gip<x)
           return;

        float sina = dy/gip,
        cosa = dx/gip,
        x3 = (float) (x2 - Math.sqrt(x*x*3/4)*cosa),
        y3 = (float) (y2 - Math.sqrt(x*x*3/4)*sina),
        x6 = (float) (x1 - Math.sqrt(x*x*3)*cosa),
        y6 = (float) (y1 - Math.sqrt(x*x*3)*sina),
        x4 = x3 + x * sina/2,
        y4 = y3 - x * cosa/2,
        x5 = x3 - x * sina/2,
        y5 = y3 + x * cosa/2;
		for (int i=0; i < points.size() -2; ++i) {
			g2d.drawLine(Math.round((float)(points.get(i).x*1.2)),
				       Math.round((float)(points.get(i).y*1.2)),
				       Math.round((float)(points.get(i+1).x*1.2)),
				       Math.round((float)(points.get(i+1).y*1.2)));
		}
		
		g2d.drawLine(Math.round((float)(x1*1.2)),
			       Math.round((float)(y1*1.2)),
			       Math.round((float)(x3*1.2)),
			       Math.round((float)(y3*1.2)));

		g2d.drawLine(Math.round((float)(x3*1.2)),
			       Math.round((float)(y3*1.2)),
			       Math.round((float)(x4*1.2)),
			       Math.round((float)(y4*1.2)));

		g2d.drawLine(Math.round((float)(x4*1.2)),
			       Math.round((float)(y4*1.2)),
			       Math.round((float)(x2*1.2)),
			       Math.round((float)(y2*1.2)));
		
		g2d.drawLine(Math.round((float)(x2*1.2)),
			       Math.round((float)(y2*1.2)),
			       Math.round((float)(x5*1.2)),
			       Math.round((float)(y5*1.2)));

		
		g2d.drawLine(Math.round((float)(x5*1.2)),
			       Math.round((float)(y5*1.2)),
			       Math.round((float)(x3*1.2)),
			       Math.round((float)(y3*1.2)));
		
	}
	
	public void drawConnector(Graphics2D g2d, DiagramJSON.Connector c, DiagramJSON d) {
		if (!c.type.equals("generalization"))
			return;

		DiagramJSON.Element e1 = getElementById(c.fromId, d), e2 = getElementById(c.toId, d);
		if (e1 == null || e2 == null)
			return;
		
        ArrayList<Point> newpoints = new ArrayList<Point>();
		if ((c.epoints == null) || (c.epoints.length == 0)) {
            float x1 = _getRValue(e1.left, e2.left, e1.width) ;
            float y1 = _getRValue(e1.top, e2.top, e1.height) ;

            float x2 = _getRValue(e2.left, e1.left, e2.width);
            float y2 = _getRValue(e2.top, e1.top,  e2.height);

            newpoints.add(new Point(x1,y1));
            newpoints.add(new Point(x2,y2));
        }
        else {
            int lln = c.epoints.length -1;
            
            float x1 = _getRValue(e1.left, c.epoints[0].get("0"), e1.width) ;
            float y1 = _getRValue(e1.top, c.epoints[0].get("1"), e1.height) ;

            float x2 = _getRValue(e2.left, c.epoints[lln].get("0"), e2.width);
            float y2 = _getRValue(e2.top, c.epoints[lln].get("1"),  e2.height);

            newpoints.add(new Point(x1,y1));

            for (int i=0;i<=lln;++i) {
                newpoints.add(new Point(c.epoints[i].get("0"),c.epoints[i].get("1")));
            }
            newpoints.add(new Point(x2,y2));
        }
		
		this.drawGeneralization(g2d, newpoints);
		
		
	}
	
	public void drawClass(Graphics2D g2d, DiagramJSON.Element e) {
		if (!e.type.equals("class")) {
			return;
		}
		g2d.setPaint(Color.BLACK);
		int pageX = Math.round((float) (e.pageX * 1.2));
		int pageY = Math.round((float) (e.pageY * 1.2));
		int width = Math.round((float) (e.width * 1.2));
		int height = Math.round((float) (e.height * 1.2));
		int head = Math.round((float)((e.height - e.height_a - e.height_o)*1.2));
		g2d.draw(new Rectangle(pageX, pageY, width, height));
		g2d.draw(new Rectangle(pageX, pageY, width, Math.round((float)(e.height_a * 1.2))));
		g2d.draw(new Rectangle(pageX, pageY, width, head));
		g2d.setFont(new Font("Helvetica,arial,freesans,clean,sans-serif", Font.PLAIN, 11));
		
		int delta = (width - e.name.length()*8)/2;		
		g2d.drawString(e.name, pageX + delta, pageY + FONT_INDENTATION );
		
		head += FONT_INDENTATION ;
		for (int i=0; i<e.attributes.length; ++i) {
		    g2d.drawString(e.attributes[i], pageX + 4, pageY + head + i * FONT_INDENTATION  );
		}

		head += e.attributes.length*FONT_INDENTATION ;
		for (int i=0; i<e.operations.length; ++i) {
		    g2d.drawString(e.operations[i], pageX + 4, pageY + head + i * FONT_INDENTATION  );
		}
		
		
	}
	
	public void paint(Graphics2D g2d) {
    	ObjectMapper mapper = new ObjectMapper(); // can reuse, share globally
    	try {
			DiagramJSON diagram = mapper.readValue(new File("c:/Users/aea301/workspace/BBBB/bin/diagram.json"), DiagramJSON.class);
			for (int e =0; e<diagram.elements.length; ++e) {
				drawClass(g2d, diagram.elements[e]);
			}
			for (int e =0; e<diagram.connectors.length; ++e) {
				this.drawConnector(g2d, diagram.connectors[e], diagram);
			}
		} catch (IOException e) {
			e.printStackTrace();
		}
        
        
    }

    public static void main(String[] args) throws IOException {

        // Get a DOMImplementation.
        DOMImplementation domImpl =
            GenericDOMImplementation.getDOMImplementation();

        // Create an instance of org.w3c.dom.Document.
        String svgNS = "http://www.w3.org/2000/svg";
        Document document = domImpl.createDocument(svgNS, "svg", null);

        // Create an instance of the SVG Generator.
        SVGGraphics2D svgGenerator = new SVGGraphics2D(document);

        // Ask the test to render into the SVG Graphics2D implementation.
        TestSVGGen test = new TestSVGGen();
        test.paint(svgGenerator);

        // Finally, stream out SVG to the standard output using
        // UTF-8 encoding.
        boolean useCSS = true; // we want to use CSS style attributes
        Writer out = new OutputStreamWriter(System.out, "UTF-8");
        svgGenerator.stream(out, useCSS);
    }
}