package org.umlsync.autotest.components.handlers;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.umlsync.autotest.components.elements.Diagram;
import org.umlsync.autotest.components.elements.Element;
import org.umlsync.autotest.selenium.TSeleniumClient;

import com.thoughtworks.selenium.Selenium;

public class ContextMenuHandler extends TSeleniumClient {
	private Diagram diagram;

	public ContextMenuHandler(Diagram d) {
		diagram = d;
		d.addClient(this);
	}
	
	/*
	 * Activate element and click context menu item
	 */
	public void Click(Element e, String item) {
		selenium.contextMenu("css=#"+e.GetEuid()+" > div.us-class-header");
		selenium.click("link="+item);
	}
}
