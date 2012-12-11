package org.umlsync.autotest.components.handlers;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.HasInputDevices;
import org.openqa.selenium.Mouse;
import org.openqa.selenium.Point;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.interactions.internal.Coordinates;
import org.umlsync.autotest.components.elements.Diagram;
import org.umlsync.autotest.components.elements.Element;

import com.thoughtworks.selenium.Selenium;

public class IconMenuHandler {
	private Selenium selenium;
	private WebDriver driver;
	private Diagram diagram;

	public IconMenuHandler(Selenium sel, WebDriver drv, Diagram d) {
		selenium = sel;
		driver = drv;
		diagram = d;
	}


	public boolean IsIconMenuVisisble(Element element) {
		WebElement e = driver.findElement(By.id(element.GetBorderLocator()));
		String menu = e.getAttribute("menu");
		if (menu == null) {
			return true;
		}

		WebElement m = driver.findElement(By.cssSelector("#"+ diagram.GetLocator()+" .elmenu-"+ menu));
		if (m != null) {
			return m.isDisplayed();
		}

		return false;
	}
	
	public List<String> GetAvailableItems(Element element) {
		WebElement e = driver.findElement(By.id(element.GetBorderLocator()));
		String menu = e.getAttribute("menu");
		if (menu == null) {
			return null;
		}

		WebElement m = driver.findElement(By.cssSelector("#"+ diagram.GetLocator()+" .elmenu-"+ menu));
		if (m != null) {
			List<WebElement> imgs = m.findElements(By.tagName("img"));
			if (imgs != null) {
				Iterator<WebElement> i = imgs.iterator();
				ArrayList<String> arrays = new ArrayList<String>();
				while (i.hasNext()) {
					String title =i.next().getAttribute("title"); 
					if (!title.equals("Self Association"))
					  arrays.add(title);
				}
				return arrays;
			}
			
			return null;
		}
		return null;
	}


	public void dragAndDrop(Element diagramElement, String next, int x, int y) {
		WebElement e = driver.findElement(By.id(diagramElement.GetBorderLocator()));
		String menu = e.getAttribute("menu");
		if (menu == null) {
			return;
		}

		WebElement m = driver.findElement(By.cssSelector("#"+ diagram.GetLocator()+" .elmenu-"+ menu));
		WebElement onElement = driver.findElement(By.cssSelector("#"+ diagram.GetLocator()));
		if (m != null) {
			List<WebElement> imgs = m.findElements(By.tagName("img"));
			if (imgs != null) {
				Iterator<WebElement> i = imgs.iterator();
				ArrayList<String> arrays = new ArrayList<String>();
				while (i.hasNext()) {
					WebElement n = i.next();
					if (n.getAttribute("title").equals(next)) {
						Actions builder = (new Actions(driver))
						.clickAndHold(n);
						
						int max = (x>y)?x:y;
						int step = (max / 20) + 1; 
						
						int x1 = 0,y1 = 0;
						for (int h =0; h <max; h+=step) {
						    if (h < x) {
						    	x1 = h;
						    }
						    
						    if (h < y) {
						    	y1 = h;
						    }
							builder.moveByOffset(x1, y1);
						}
						builder.build().perform();
						
						WebElement helper = driver.findElement(By.cssSelector("#"+ diagram.GetLocator()+ " #ConnectionHelper_Border"));
						builder.release(helper).build().perform();
						
						
						break;
					}
				}
			}
			
			return;
		}
		
	}

}
