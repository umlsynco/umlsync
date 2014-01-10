package org.umlsync.autotest.selenium;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Mouse;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverBackedSelenium;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;


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

	public void contextMenu(String locator) {
		if (locator.contains("css=")) {
			WebElement elem = BaseDriver.findElement(By.cssSelector(locator.substring(4)));
			(new Actions(BaseDriver)).contextClick(elem).build().perform();
		}
	}

}