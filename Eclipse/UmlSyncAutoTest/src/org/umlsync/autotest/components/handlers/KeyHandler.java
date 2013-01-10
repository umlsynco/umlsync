package org.umlsync.autotest.components.handlers;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.umlsync.autotest.components.elements.Diagram;
import org.umlsync.autotest.selenium.TSeleniumClient;

import com.thoughtworks.selenium.Selenium;

public class KeyHandler extends TSeleniumClient {
	private Diagram diagram;

	public KeyHandler(Diagram d) {
		diagram = d;
		d.addClient(this);
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

	public void SelectAll() {
		selenium.keyPress("css=#"+diagram.GetLocator(), Keys.chord( Keys.CONTROL, "a"));
	}

	public void Del() {
		selenium.keyPress("css=#"+diagram.GetLocator(), Keys.chord(Keys.DELETE));
	}

	public void Esc() {
		selenium.keyPress("css=#"+diagram.GetLocator(), Keys.chord(Keys.ESCAPE));
	}

	
}
