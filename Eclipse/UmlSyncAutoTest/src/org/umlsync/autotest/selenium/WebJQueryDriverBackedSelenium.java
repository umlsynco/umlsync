package org.umlsync.autotest.selenium;

import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverBackedSelenium;


public class WebJQueryDriverBackedSelenium extends WebDriverBackedSelenium {

	private WebDriver BaseDriver;

	public WebJQueryDriverBackedSelenium(WebDriver baseDriver, String baseUrl) {
		super(baseDriver, baseUrl);
		BaseDriver = baseDriver;
	}

	public void mouseOver(String locator) {
		if (locator.contains("css=")) {
			((JavascriptExecutor)BaseDriver).executeScript("$('"+(locator.substring(4))+"').trigger('mouseenter');");
		}
	}

	public void mouseOut(String locator) {
		if (locator.contains("css=")) {
			((JavascriptExecutor)BaseDriver).executeScript("$('"+(locator.substring(4))+"').trigger('mouseleave');");
		}
	}

	public void blur(String locator) {
		if (locator.contains("css=")) {
			((JavascriptExecutor)BaseDriver).executeScript("$('"+(locator.substring(4))+"').trigger('blur');");
		}
	}
}