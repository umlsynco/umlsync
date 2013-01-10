package org.umlsync.autotest.components.elements;

import java.util.ArrayList;
import java.util.List;
import java.util.Vector;

import org.openqa.selenium.By;
import org.openqa.selenium.HasInputDevices;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Keyboard;
import org.openqa.selenium.Mouse;
import org.openqa.selenium.Point;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.interactions.ContextClickAction;
import org.openqa.selenium.interactions.internal.Coordinates;
import org.openqa.selenium.internal.Locatable;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.umlsync.autotest.components.elements.wrappers.ElementWrapper;
import org.umlsync.autotest.components.elements.wrappers.TCommonOperation;
import org.umlsync.autotest.selenium.ActionsWrapper;
import org.umlsync.autotest.selenium.FirefoxDriverWrapper;
import org.umlsync.autotest.selenium.MouseWrapper;
import org.umlsync.autotest.selenium.TSeleniumClient;

import com.thoughtworks.selenium.Selenium;

public class Connector extends TSeleniumClient {
	public String euid;
	private Diagram parent;
	private ElementWrapper fromElement, toElement;
	
	
	public class Label extends  TSeleniumClient {
		public Label(String labelEuid) {
			euid = labelEuid;
		}
		int top, left;
		String text;
		String euid;
		
		/*
		 * DND Label by offset
		 * param x - offset x
		 * param y - offset y
		 */
		public void DragAndDrop(int x, int y) {
			selenium.dragAndDrop("id="+euid, x + "," +y);
		}
		
		/*
		 * Change the default text of label
		 * param text - new text 
		 */
		public void Editable(String text) {
			selenium.click("css=#" + euid);
			selenium.type("css=#" + euid + " input", text);
			selenium.keyDown("css=#" + euid + " input", "13");
		}
		
		/*
		 * return true if element's HTML instance exists and false otherwise
		 */
		public boolean IsPresent() {
			return selenium.isElementPresent("id="+euid);
		}
		
		/*
		 * return the coordinates of label HTML instance on the screen
		 */
		public Point GetCoordinates() {
			WebElement e = driver.findElement(By.id(euid));
			return e.getLocation();
		}

		/*
		 * return the text field value of label
		 */
		public String  GetText() {
			WebElement name = driver.findElement(By.cssSelector("#" + euid));
			return (null != name) ? name.getText() : null;
		}

		
		/*
		 * Highlight the label
		 */
		public void MouseOver() {
			selenium.mouseOver("id=#"+euid);
		}
	}

	private Vector<Point> epoints = new Vector<Point>();
	private int labelCount = 0;
	private List<Label> labels = new ArrayList<Label>();

	public Connector(
			String id,
			Diagram diagram,
			ElementWrapper from,
			ElementWrapper to) {
		euid=id;
		parent = diagram;
		toElement = to;
		fromElement = from;

		diagram.addClient(this);
	}


	private int getRValue (int x1, int x2, int w) {
		int diffx = x2-x1;
		if (diffx>0) {
			if (diffx > w)
				return x1 + w;
			return x2;
		}
		return x1;
	}

	public boolean IsMouseOver() {
		String res = selenium.getEval("dm.at.cs.mouseover;");
		if (res == null)
			return false;
		return res.contains(this.euid);
	}

	public int IsMouseOverEpoint() {
		String res = selenium.getEval("dm.at.cs.mouseover;"); // {euid:aggregationX,idx:0}

		if (res == null || !res.contains(this.euid))
			return -1;

		return 0;
	}

	public boolean IsSelected() {
		String res = selenium.getEval("dm.at.cs.selected;"); // return the list of selected connectors
		if (res == null)
			return false;
		return res.contains(this.euid);
	}

	private void updateConnectionPoints() {
		if (epoints.size() == 0) {
			int x1 = getRValue(fromElement.Left(), toElement.Left(), fromElement.Width()) ;
			int  y1 = getRValue(fromElement.Top(), toElement.Top(), fromElement.Height()) ;

			int x2 = getRValue(toElement.Left(), fromElement.Left(), toElement.Width());
			int y2 = getRValue(toElement.Top(), fromElement.Top(), toElement.Height());
		}
	}

	public void AddEpointByIndex(int idx, int offsetX, int offsetY) {

		int x1 = 0,x2 =0 ,x3,y1=0,y2=0,y3;

		if (idx < 0) {
			return;
		}

		if (epoints.size() == 0) {
			idx = 0;
			x1 = getRValue(fromElement.Left(), toElement.Left(), fromElement.Width()) ;
			y1 = getRValue(fromElement.Top(), toElement.Top(), fromElement.Height()) ;

			x2 = getRValue(toElement.Left(), fromElement.Left(), toElement.Width());
			y2 = getRValue(toElement.Top(), fromElement.Top(), toElement.Height());
		}
		else if (idx == 0) {
			x1 = getRValue(fromElement.Left(), toElement.Left(), fromElement.Width()) ;
			y1 = getRValue(fromElement.Top(), toElement.Top(), fromElement.Height()) ;

			x2 = this.epoints.get(0).x;
			y2 = this.epoints.get(0).y;
		}
		else if (idx >= epoints.size()) {
			idx = epoints.size();
			x1 = this.epoints.get(idx - 1).x;
			y1 = this.epoints.get(idx - 1).y;

			x2 = getRValue(toElement.Left(), x1, toElement.Width());
			y2 = getRValue(toElement.Top(), y1, toElement.Height());
		} else {
			x1 = this.epoints.get(idx-1).x;
			y1 = this.epoints.get(idx-1).y;

			x2 = this.epoints.get(idx).x;
			y2 = this.epoints.get(idx).y;
		}


		x3 = (x1 + x2) / 2;
		y3 = (y1 + y2) / 2;

		Actions builder = new Actions(driver);
		WebElement diagram = driver.findElement(By.id(parent.GetLocator()));

		x3 -= parent.Left();
		y3 -= parent.Top();

		x1 -= parent.Left();
		y1 -= parent.Top();

		builder.moveToElement(diagram, x1, y1).build().perform();
		IsMouseOverEpoint();
		builder.moveToElement(diagram, x3, y3).build().perform();
		builder.moveToElement(diagram, x3, y3).clickAndHold().build().perform();

		int diffX = offsetX /20;
		int diffY = offsetY /20;
		for (int t=0; t<20; ++t) {
			x3 += diffX;
			y3 += diffY;
			builder.moveToElement(diagram, x3, y3);
		}

		builder.build().perform();
		x3+=parent.Left();
		y3+=parent.Top();
		selenium.mouseUpAt("id="+parent.GetLocator(), x3 + "," + y3);
		builder.release().perform();

		epoints.add(idx, new Point(x3,y3));
	}


	/*
	 * return index of added label
	 */
	public int AddLabel(int idx,String string) {
		int x1 = 0,x2 =0 ,x3,y1=0,y2=0,y3;

		if (idx < 0) {
			return -1;
		}

		if (epoints.size() == 0) {
			idx = 0;
			x1 = getRValue(fromElement.Left(), toElement.Left(), fromElement.Width()) ;
			y1 = getRValue(fromElement.Top(), toElement.Top(), fromElement.Height()) ;

			x2 = getRValue(toElement.Left(), fromElement.Left(), toElement.Width());
			y2 = getRValue(toElement.Top(), fromElement.Top(), toElement.Height());
		}
		else if (idx == 0) {
			x1 = getRValue(fromElement.Left(), toElement.Left(), fromElement.Width()) ;
			y1 = getRValue(fromElement.Top(), toElement.Top(), fromElement.Height()) ;

			x2 = this.epoints.get(0).x;
			y2 = this.epoints.get(0).y;
		}
		else if (idx >= epoints.size()) {
			idx = epoints.size();
			x1 = this.epoints.get(idx - 1).x;
			y1 = this.epoints.get(idx - 1).y;

			x2 = getRValue(toElement.Left(), x1, toElement.Width());
			y2 = getRValue(toElement.Top(), y1, toElement.Height());
		} else {
			x1 = this.epoints.get(idx-1).x;
			y1 = this.epoints.get(idx-1).y;

			x2 = this.epoints.get(idx).x;
			y2 = this.epoints.get(idx).y;
		}


		x3 = (x1 + x2) / 2;
		y3 = (y1 + y2) / 2;


		Actions builder = new Actions(driver);
		WebElement diagram = driver.findElement(By.id(parent.GetLocator()));

		x3 -= parent.Left();
		y3 -= parent.Top();

		builder.moveToElement(diagram, x3, y3)
		.moveByOffset(x3, y3)
		.build()
		.perform();

		x3 += parent.Left();
		y3 += parent.Top();

		
		//selenium.contextMenuAt("id="+parent.GetLocator(), x3+ ","+y3);
		String command = "var ctxEvent=jQuery.Event(\"contextmenu\",{pageX:" +
		                 x3+",pageY:"+
				         y3+"});jQuery('#"+(parent.GetLocator())+"').trigger(ctxEvent);$.log('trigger');";
		((JavascriptExecutor)driver).executeScript(command);

		parent.GetContextMenuHandler().Click(this, "Add \"Text\"");
		String labelEuid = euid + "_l"+labelCount;
		WebElement label = driver.findElement(By.id(labelEuid));
		if (label != null) {
			Label l = new Label(labelEuid);
			labels.add(l);
			
			addClient(l); // get driver and selenium

			++labelCount;
		}
		return labelCount-1;
	}
	
	public Label GetLabel(int idx) {
		return labels.get(idx);
	}


	public Diagram getParent() {
		return this.parent;
	}
}
