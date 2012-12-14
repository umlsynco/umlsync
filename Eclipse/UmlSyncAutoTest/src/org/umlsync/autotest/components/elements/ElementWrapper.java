package org.umlsync.autotest.components.elements;

import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.Point;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import com.thoughtworks.selenium.Selenium;

public class ElementWrapper {
	protected Selenium selenium;
	protected WebDriver driver;
	protected Element element;

	public ElementWrapper(Selenium sel, WebDriver drv,Element e) {
		selenium = sel;
		driver = drv;
		element = e;
	}
	
	public void DragAndDrop(String diff) {
		selenium.dragAndDrop("id="+element.euid, diff);		
	}

	/*
	 * drag and drop resize element
	 * @param item resizable corner of element: "n-u","se-u" etc
	 * @param diff movement string
	 */
	public void Resize(String item, String diff) {
		selenium.click("id="+element.euid);
		selenium.dragAndDrop("css=#"+element.GetBorderLocator() + " div.ui-resizable-"+item, diff);
	}

	/*
	 * Perform click on element
	 */
	public void Select() {
		selenium.click("id="+element.euid);		
	}
	
	/*
	 * Send mouse over event for element
	 */
	public void MouseOver() {
		selenium.mouseOver("css=#"+element.euid);
	}


	/*
	 * Send mouse out event for element
	 */
	public void MouseOut() {
		selenium.mouseOut("css=#"+element.euid);		
	}
	
	public boolean IsHightlighted() {
		WebElement elem = driver.findElement(By.id(element.GetBorderLocator()));
		if (elem.isDisplayed()) {
			String width = elem.getCssValue("border-width");
			if (width != null && !width.isEmpty() && !width.startsWith("0px")) {
				return true;
			}
		}
		return false;
	}
	
	public boolean IsSelected() {
		WebElement elem = driver.findElement(By.cssSelector("#"+element.GetBorderLocator()+" > div.ui-resizable-handle"));
		if (elem.isDisplayed()) {
			return true;
		}
		return false;
	}
	
	/*
	 * @return width of element
	 */
	public int Width() {
		//eturn selenium.getElementWidth("id="+element.GetEuid()).intValue();
		WebElement e = driver.findElement(By.id(element.GetEuid()));
		return e.getSize().getWidth();
	}

	/*
	 * @return height of element
	 */
	public int Height() {
//		return selenium.getElementHeight("id="+element.GetEuid()).intValue();
		WebElement e = driver.findElement(By.id(element.GetEuid()));
		return e.getSize().getHeight();
	}
	
	public Dimension Dimention() {
		WebElement e = driver.findElement(By.id(element.GetEuid()));
		return e.getSize();
	}
	
	public int Top() {
		WebElement e = driver.findElement(By.id(element.GetEuid()));
		return e.getLocation().y;
	}
	
	public int Left() {
		WebElement e = driver.findElement(By.id(element.euid));
		return e.getLocation().x;
	}
	
	public Point Position() {
		WebElement e = driver.findElement(By.id(element.euid));
		return e.getLocation();
	}
	
	public boolean isDisplayed() {
		WebElement e = driver.findElement(By.id(element.euid));
		return e != null ? e.isDisplayed():false;
	}
}
