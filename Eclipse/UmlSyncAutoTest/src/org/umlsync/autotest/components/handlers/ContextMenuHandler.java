package org.umlsync.autotest.components.handlers;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.umlsync.autotest.components.elements.Diagram;
import org.umlsync.autotest.components.elements.Element;

import com.thoughtworks.selenium.Selenium;

public class ContextMenuHandler {
	private Selenium selenium;
	private WebDriver driver;
	private Diagram diagram;

	public ContextMenuHandler(Selenium sel, WebDriver drv, Diagram d) {
		selenium = sel;
		driver = drv;
		diagram = d;
	}
	
	/*
	 * Activate element and click context menu item
	 */
	public void Click(Element e, String item) {
		selenium.contextMenu("css=#"+e.GetEuid()+" > div.us-class-header");
		selenium.click("link="+item);
	}
}
