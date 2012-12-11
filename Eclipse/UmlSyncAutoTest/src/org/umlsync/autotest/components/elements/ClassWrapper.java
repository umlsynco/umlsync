package org.umlsync.autotest.components.elements;

import java.util.Iterator;
import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.Point;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;

import com.thoughtworks.selenium.Selenium;

public class ClassWrapper extends ElementWrapper {
	public ClassWrapper(Selenium sel, WebDriver drv, Element e) {
		super(sel, drv, e);
	}
	
	/*
	 * @return class name
	 */
	public String getTitle() {
		WebElement name = driver.findElement(By.cssSelector("#" + element.euid + " DIV.us-class-header #name"));
		return (null != name) ? name.getText() : null;
	}

	/*
	 * @param title the name of class
	 */
	public void setTitle(String title) {
		selenium.click("css=#" + element.euid + " > div.us-class-header > a");
		selenium.type("css=#" + element.euid + " > div.us-class-header > a > input", title);
		//selenium.keyPress("css=#" + element.euid + " > div.us-class-header > a > input", title);
		selenium.keyDown("css=#" + element.euid + " #name input", "13");
	}

	/*
	 * Fill the class template area if available
	 * @param template value
	 */	
	public void setTemplate(String template) {
		
	}

	/*
	 * Add field to class
	 * @param field 
	 */
	public void addField(String field) {
		element.getParent().getContextMenu().Click(element, "Add field");
		List<WebElement> fields = driver.findElements(By.cssSelector("#" + element.euid + " div.us-class-attributes > ul > li > a"));
		if (fields != null && fields.size() > 0) {
			WebElement f = fields.get(fields.size()-1);
			f.click();
			WebElement input = f.findElement(By.tagName("input"));
			if (input != null) {
			  input.clear();
			  input.sendKeys(field);

			  // FORCE ENTER KEY PRESS !!!
			  selenium.keyDown("css=#"+ element.GetEuid() +" input", "13");
			}
		}
	}
	
	/*
	 * Update field of class
	 * @param index of class item
	 * @param field value to update
	 */
	public void updateField(int index, String field) {
		
	}

	/*
	 * Return the 
	 * @param index of class item
	 * @param field value to update
	 */
	public String getFieldByIndex(int index) {
		List<WebElement> fields = driver.findElements(By.cssSelector("#" + element.euid + " div.us-class-attributes > ul > li > a"));
		if (fields != null && fields.size() > 0 && fields.size() > index) {
			WebElement f = fields.get(index);
			return f.getText();
		}
		return null;
	}
	
	/*
	 * Update field of class
	 * @param index of class item
	 */
	public void removeField(int index) {
		
	}
	
	/*
	 * Sorting fields
	 * @param fromIdx index of from position 
	 * @param toIdx index of new position
	 */
	public void sortFields(int fromIdx, int toIdx) {
		List<WebElement> fields =
          driver.findElements(By.cssSelector("#" + element.euid + " div.us-class-attributes > ul > li"));
		//String locator = "css=#" + element.euid + " div.us-class-attributes > ul > li:nth(";
		//selenium.dragAndDropToObject(locator + fromIdx + ")", locator + toIdx + ")");
		if (fields != null
		  && fields.size() > 0
		  && fields.size() > fromIdx
		  && fields.size() > toIdx) {
			WebElement fe = fields.get(fromIdx);
			WebElement te = fields.get(toIdx);
			
			Point fel = fe.getLocation();
			Point tel = te.getLocation();

			int diff = tel.y - fel.y;
			
			Actions builder = (new Actions(driver))
			.clickAndHold(fe);

			for (int tmp=1; tmp<= 15; ++tmp) {
				builder.moveByOffset(1, diff/13);
			}
			
			if (diff > 0) {
				builder.moveByOffset(1, 6);
			}
			
			builder.build().perform();
			WebElement placeholder = driver.findElement(By.cssSelector("#" + element.euid + " div.us-class-attributes > ul > li.ui-sortable-placeholder"));
			builder.release(placeholder).build().perform();
		}
	}

	/*
	 * Get fields of class
	 * @return the list of available fields 
	 */
	public String[] getFields() {
		return null;
	}

	/*
	 * Add method to class
	 * @param method 
	 */
	public void addMethod(String method) {
		element.getParent().getContextMenu().Click(element, "Add method");
		List<WebElement> methods = driver.findElements(By.cssSelector("#" + element.euid + " div.us-class-operations > ul > li > a"));
		if (methods != null && methods.size() > 0) {
			WebElement m = methods.get(methods.size()-1);
			m.click();
			WebElement input = m.findElement(By.tagName("input"));
			if (input != null) {
			  input.clear();
			  input.sendKeys(method);

			  // FORCE ENTER KEY PRESS !!!
			  selenium.keyDown("css=#"+ element.GetEuid() +" input", "13");
			}
		}
	}
	
	/*
	 * Update method of class
	 * @param index of class item
	 * @param field value to update
	 */
	public void updateMethod(int index, String field) {
		
	}
	
	/*
	 * Update method of class
	 * @param index of class item
	 */
	public void removeMethod(int index) {
		
	}
	
	/*
	 * Get methods of class
	 * @return the list of available methods 
	 */
	public String[] getMethods() {
		return null;
	}
	
	/*
	 * Return the method on index
	 * @param index of class item
	 */
	public String getMethodByIndex(int index) {
		List<WebElement> fields = driver.findElements(By.cssSelector("#" + element.euid + " div.us-class-operations > ul > li > a"));
		if (fields != null && fields.size() > 0 && fields.size() > index) {
			WebElement f = fields.get(index);
			return f.getText();
		}
		return null;
	}


	/*
	 * Sorting fields
	 * @param fromIdx index of from position 
	 * @param toIdx index of new position
	 */
	public void sortMethods(int fromIdx, int toIdx) {
		List<WebElement> fields =
          driver.findElements(By.cssSelector("#" + element.euid + " div.us-class-operations > ul > li"));

		if (fields != null
		  && fields.size() > 0
		  && fields.size() > fromIdx
		  && fields.size() > toIdx) {
			WebElement fe = fields.get(fromIdx);
			WebElement te = fields.get(toIdx);
			
			Point fel = fe.getLocation();
			Point tel = te.getLocation();

			int diff = tel.y - fel.y;
			
			Actions builder = (new Actions(driver))
			.clickAndHold(fe);

			for (int tmp=1; tmp<= 15; ++tmp) {
				builder.moveByOffset(1, diff/13);
			}
			
			if (diff > 0) {
				builder.moveByOffset(1, 6);
			}
			
			builder.build().perform();
			WebElement placeholder = driver.findElement(By.cssSelector("#" + element.euid + " div.us-class-operations > ul > li.ui-sortable-placeholder"));
			builder.release(placeholder).build().perform();
		}
	}

	
	public void ResizeFieldsArea(int diff) {
		selenium.click("id="+element.euid);
		selenium.dragAndDrop("css=#"+element.GetBorderLocator() + " div.us-class-attributes div.ui-resizable-s-l", "0,"+diff);
	}
	
	public Number getFieldsAreaWidth() {
		return selenium.getElementWidth("css=#"+element.GetBorderLocator() + " div.us-class-attributes");
	}
	
	public Number  getFieldsAreaHeight() {
		return  selenium.getElementHeight("css=#"+element.GetBorderLocator() + " div.us-class-attributes");
	}

	public Number getMethodsAreaWidth() {
		return selenium.getElementWidth("css=#"+element.GetBorderLocator() + " div.us-class-operations");
	}
	
	public Number getMethodsAreaHeight() {
		return selenium.getElementHeight("css=#"+element.GetBorderLocator() + " div.us-class-operations");
	}

}
