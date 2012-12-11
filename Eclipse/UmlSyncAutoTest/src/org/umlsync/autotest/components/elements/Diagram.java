package org.umlsync.autotest.components.elements;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.umlsync.autotest.components.DiagramMenuHandler;
import org.umlsync.autotest.components.handlers.ContextMenuHandler;
import org.umlsync.autotest.components.handlers.IconMenuHandler;
import org.umlsync.autotest.components.handlers.KeyHandler;

import com.thoughtworks.selenium.Selenium;

public class Diagram {

	private Selenium selenium;
	private WebDriver driver;
	private String locator;
	private DiagramMenuHandler dmh;
	public org.umlsync.autotest.components.handlers.IconMenuHandler iconMenuHandler;
	public ContextMenuHandler contextMenuHandler;
	
	private List<Element> elements = new ArrayList<Element>();
	
	public KeyHandler keyHandler;
	
	public String headerId;
	public String type;
	

	public Diagram(Selenium sel, WebDriver drv, String loc, String header) {
		selenium = sel;
		driver = drv;
		locator = loc;
		headerId = header;
		for(int x = 4, length = loc.length(); x < length; x++) {  
			if(Character.isDigit(loc.charAt(x))) {
				type = loc.substring(0, x);
			}  
		}
		dmh = new DiagramMenuHandler(selenium, driver);
		keyHandler = new KeyHandler(selenium, driver, this);
		iconMenuHandler = new IconMenuHandler(selenium, driver, this);
		contextMenuHandler = new ContextMenuHandler(selenium, driver, this);
	}

	/*
	 * @return context menu handler
	 */
	public ContextMenuHandler getContextMenu() {
		return contextMenuHandler;
	}
	
	/*
	 * @return icon menu handler
	 */	
	public IconMenuHandler getIconMenu() {
		return iconMenuHandler;
	}
	
	/*
	 * @return input key handler
	 */
	public KeyHandler getKeyHandler() {
		return this.keyHandler;
	}
	
	public Element IdentifyNewElement() {
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

			// New element
			if (!found) {
				Element e = new Element(selenium, driver, id, this);
				elements.add(e);
				return e;
			}
		}
		return null;		
	}
	
	public Element CreateElement(String etype, String name) {
		if (!dmh.IsActive(type)) {
		  dmh.Activate(type);
		}
		dmh.Click(type, etype);

		return IdentifyNewElement();
	}
	
	public List<Element> GetElements() {
		return elements;
	}

	public String CreateConnector(String type) {
		return null;
	}

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

}
