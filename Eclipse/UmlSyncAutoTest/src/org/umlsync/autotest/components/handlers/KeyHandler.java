package org.umlsync.autotest.components.handlers;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.umlsync.autotest.components.elements.Diagram;

import com.thoughtworks.selenium.Selenium;

public class KeyHandler {

	private Selenium selenium;
	private WebDriver driver;
	private Diagram diagram;

	public KeyHandler(Selenium sel, WebDriver drv, Diagram d) {
		selenium = sel;
		driver = drv;
		diagram = d;
	}
	
	public void RemoveAll() {
		selenium.keyPress("css=#"+diagram.GetLocator(), Keys.chord( Keys.CONTROL, "a"));
		selenium.keyPress("css=#"+diagram.GetLocator(), Keys.chord(Keys.DELETE));
	}

	public void CtrlA() {
		selenium.keyPress("css=#"+diagram.GetLocator(), Keys.chord( Keys.CONTROL, "a"));
	}

	public void Revert() {
		selenium.keyPress("css=#"+diagram.GetLocator(), Keys.chord( Keys.CONTROL, "z"));		
	}
	
	public void Repeat() {
		selenium.keyPress("css=#"+diagram.GetLocator(), Keys.chord( Keys.CONTROL, "y"));		
	}

}
