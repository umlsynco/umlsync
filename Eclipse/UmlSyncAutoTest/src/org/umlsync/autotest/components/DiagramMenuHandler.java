package org.umlsync.autotest.components;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import com.thoughtworks.selenium.Selenium;

public class DiagramMenuHandler {
	private Selenium selenium;
	private WebDriver driver;

	public DiagramMenuHandler(Selenium sel, WebDriver drv) {
		selenium = sel;
		driver = drv;
	}

	public boolean IsActive() {
		WebElement elem = driver.findElement(By.id("diagram-menu"));
		return elem != null;
	}

	public boolean IsActive(String type) {
		WebElement activeHeader = driver.findElement(By.cssSelector("#accordion > h3.ui-state-active > a"));
		if (activeHeader.getText().indexOf(type) == 0) {
			return true;
		}
		return false;
	}

	public void Activate(String type) {
		Iterator<WebElement> headers = driver.findElements(By.cssSelector("#accordion > h3.ui-accordion-header > a")).iterator();
		while (headers.hasNext()) {
			WebElement h = headers.next();
			if (h.getText().contains(type)) {
				h.click();

				// Accordion takes some time to complete action
				try {
					Thread.sleep(300);
				} catch (InterruptedException e) {
				}
				break;
			}
		}
	}

	public List<String> GetElements(String type) {
		if (!IsActive(type)) {
			Activate(type);
		}

		List<String> result = new ArrayList<String>();
		Iterator<WebElement> iter = driver.findElements(By.cssSelector("#accordion li.element-selector > a")).iterator();
		while (iter.hasNext()) {
			WebElement n = iter.next();
			String text = n.getText();
			if (text != null && !text.isEmpty()) {
				result.add(text);
			}
		}

		return result.isEmpty() ? null: result;
	}

	public void Click(String dtype, String etype) {
		if (!IsActive(dtype)) {
			Activate(dtype);
		}

		Iterator<WebElement> iter = driver.findElements(By.cssSelector("#accordion li.element-selector > a")).iterator();
		while (iter.hasNext()) {
			WebElement n = iter.next();
			String text = n.getText();
			if (text != null && !text.isEmpty() && text.equals(etype)) {
				n.click();
				selenium.mouseOut("css=#accordion li.element-selector");
			}
		}		
	}
}
