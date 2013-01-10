package org.umlsync.autotest.components.elements;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.umlsync.autotest.components.DiagramMenuHandler;
import org.umlsync.autotest.components.elements.wrappers.ElementWrapper;
import org.umlsync.autotest.components.handlers.ContextMenuHandler;
import org.umlsync.autotest.components.handlers.IconMenuHandler;
import org.umlsync.autotest.components.handlers.KeyHandler;
import org.umlsync.autotest.components.handlers.OperationManager;
import org.umlsync.autotest.selenium.TSeleniumClient;

import com.thoughtworks.selenium.Selenium;

public class Diagram extends TSeleniumClient  {
	private String locator;
	private DiagramMenuHandler diagramMenuHandler;
	public org.umlsync.autotest.components.handlers.IconMenuHandler iconMenuHandler;
	public ContextMenuHandler contextMenuHandler;
	
	private List<Element> elements = new ArrayList<Element>();
	private List<Element> removedElements = new ArrayList<Element>();
	private List<Connector> connectors = new ArrayList<Connector>();
	
	public KeyHandler keyHandler;
	
	public String headerId;
	public String type;
	private OperationManager operationManager;
	

	public Diagram(String loc, String header) {
		locator = loc;
		headerId = header;
		for(int x = 4, length = loc.length(); x < length; x++) {  
			if(Character.isDigit(loc.charAt(x))) {
				type = loc.substring(0, x);
			}  
		}
		diagramMenuHandler = new DiagramMenuHandler();
		this.addClient(diagramMenuHandler);

		keyHandler = new KeyHandler(this);
		iconMenuHandler = new IconMenuHandler(this);
		contextMenuHandler = new ContextMenuHandler(this);
		operationManager = new OperationManager(this);
	}

	/*
	 * @return operation manager
	 */
	public OperationManager GetOperationManager() {
		return operationManager;
	}
	
	/*
	 * @return context menu handler
	 */
	public ContextMenuHandler GetContextMenuHandler() {
		return contextMenuHandler;
	}
	
	/*
	 * @return icon menu handler
	 */	
	public IconMenuHandler GetIconMenuHandler() {
		return iconMenuHandler;
	}
	
	/*
	 * @return input key handler
	 */
	public KeyHandler GetKeyHandler() {
		return this.keyHandler;
	}
	
	public Element IdentifyNewElement(String type) {
		Iterator<WebElement> iter = driver.findElements(By.cssSelector("#"+locator + " .us-element-border")).iterator();
		while (iter.hasNext()) {
			WebElement elem = iter.next();
			String id = elem.getAttribute("id");
			Iterator<Element> i = elements.iterator();
			boolean found = false;
			while (i.hasNext()) {
				if (i.next().GetBorderLocator().equals(id)) {
					found = true;
					break;
				}
			}
			
			if (!found) {
				i = removedElements.iterator();
				while (i.hasNext()) {
					if (i.next().GetBorderLocator().equals(id)) {
						found = true;
						break;
					}
				}
			}

			// New element
			if (!found) {
				Element e = null;
				if (type.equals("Class")) {
					e = new ClassElement(id, this);
				}
				else {
					e = new Element(id, this);
				}
				e.GetElementWrapper().GetStatus("create");
				elements.add(e);
				return e;
			}
		}
		return null;		
	}
	
	public Element CreateElement(String etype, String name) {
		if (!diagramMenuHandler.IsActive(type)) {
		  diagramMenuHandler.Activate(type);
		}
		diagramMenuHandler.Click(type, etype);

		return IdentifyNewElement(etype);
	}
	

	public List<Element> GetElements() {
		return elements;
	}

/*	public Connector CreateConnector(String euid, Element from, Element to) {
		Connector con =  new Connector(selenium, driver, euid, this, from, to);
		connectors.add(con);
		return con;
	}
*/
	public boolean IsActive() {

		return false;		
	}
	
	public String GetType() {
		return type;
	}


	public String GetLocator() {
		return this.locator;
	}


	public void SelectNone() {
		selenium.click("id="+this.locator);
		
	}
	
	public Element GetElementByEuid(String euid) {
		Iterator<Element> iter = this.elements.iterator();
		while (iter.hasNext()) {
			Element next = iter.next();
			if (next.GetEuid().equals(euid)) {
				return next;
			}
		}
		return null;
	}

	public boolean IsMouseOver() {
		
		return false;
	}
	
	public Connector IdentifyNewConnector() {
		String res = selenium.getEval("dm.at.cs.created;");
		if (res == null)
			return null;

		String[] splitted = res.split(",");
		String conEuid = (splitted[2].split("="))[1];
		String fromEuid = (splitted[1].split("="))[1];
		String toEuid = (splitted[0].split("="))[1];
		
		conEuid = conEuid.substring(0,conEuid.length()-1);
		
		return new Connector(conEuid,
				 			 this,
				 			 GetElementByEuid(fromEuid).GetElementWrapper(),
				 			 GetElementByEuid(toEuid).GetElementWrapper());
	}

	public int Left() {
		WebElement e = driver.findElement(By.id(this.locator));
		return e.getLocation().x;
	}

	public int Top() {
		WebElement e = driver.findElement(By.id(this.locator));
		return e.getLocation().y;
	}

	private boolean IsMultipleSelection() {
		List<WebElement> elem = driver.findElements(By.cssSelector("#"+this.locator+" > div.us-element-border > div.ui-resizable-se-u"));
		if (elem == null || elem.size() ==1 ) {
			return false;
		}
		
		int visible = 0;
		Iterator<WebElement> iter = elem.iterator();
		while (iter.hasNext()) {
			if(iter.next().isDisplayed())
				visible++;
		}
		
		return (visible > 1);
	}

	public void StartMultipleDragAndDrop(Element element) {
		if (IsMultipleSelection()) {
			operationManager.StartTransaction();
			Iterator<Element> iter = elements.iterator();
			while (iter.hasNext()) {
				Element next = iter.next();
				if(element != next && next.GetElementWrapper().IsSelected() )
					next.GetElementWrapper().DragStart();
			}
		}
	}

	public void StopMultipleDragAndDrop(Element element) {
		if (IsMultipleSelection()) {
				Iterator<Element> iter = elements.iterator();
			while (iter.hasNext()) {
				Element next = iter.next();
				if(element != next && next.GetElementWrapper().IsSelected() )
					next.GetElementWrapper().DragStop();
			}
			operationManager.StopTransaction();
		}
	}

	public void RemoveSelected() {
		operationManager.StartTransaction();

		Iterator<Element> iter = elements.iterator();
		while (iter.hasNext()) {
			Element next = iter.next();

			if (next.GetElementWrapper().IsSelected()) {
				next.GetElementWrapper().GetStatus("remove");
				iter = elements.iterator();
			}
		}
		keyHandler.Del();
		operationManager.StopTransaction();
	}
	
	public void RemoveAll() {
		operationManager.StartTransaction();

		try {
		keyHandler.SelectAll();
		while (elements.get(0) != null) {
			Element next = elements.get(0);
			next.GetElementWrapper().GetStatus("remove");
		}
		
		} catch (IndexOutOfBoundsException e) {
		}

		keyHandler.RemoveAll();
		operationManager.StopTransaction();
	}

	
	public void ElementsListChange(Element e, boolean remove) {
		if (remove) {
			if (elements.contains(e)) {
				removedElements.add(e);
				elements.remove(e);
			}
			else if (removedElements.contains(e)) {
				removedElements.remove(e);	
			}
		} else {
			if (removedElements.contains(e)) {
				elements.add(e);
				removedElements.remove(e);
			}
		}
	}

}
