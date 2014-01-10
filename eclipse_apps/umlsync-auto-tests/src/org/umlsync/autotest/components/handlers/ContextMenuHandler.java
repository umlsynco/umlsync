package org.umlsync.autotest.components.handlers;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.umlsync.autotest.components.elements.Connector;
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
		WebElement d = driver.findElement(By.id(e.getParent().GetLocator()));
		WebElement ctxMenu = d.findElement(By.id("classECtx"));
		if (ctxMenu != null) {
			WebElement link = ctxMenu.findElement(By.linkText(item));
			if (link != null) {
				link.click();
			}
		}
	}

	public void Click(Connector e, String item) {
		selenium.contextMenu("css=#"+e.getParent().GetLocator());
		WebElement d = driver.findElement(By.id(e.getParent().GetLocator()));
		WebElement ctxMenu = d.findElement(By.id("connectorEUI"));
		if (ctxMenu != null) {
			WebElement link = ctxMenu.findElement(By.linkText(item));
			if (link != null) {
				link.click();
			}
		}
		
	}

}
