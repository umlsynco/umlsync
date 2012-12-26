package org.umlsync.autotest.components.elements.wrappers;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.Keys;
import org.openqa.selenium.Point;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.umlsync.autotest.components.elements.Element;
import org.umlsync.autotest.components.elements.wrappers.ElementWrapper.TPositionStatus;
import org.umlsync.autotest.components.elements.wrappers.ElementWrapper.TResizeStatus;

import com.thoughtworks.selenium.Selenium;

public class ClassWrapper extends ElementWrapper {

	public class TTitleStatus extends IStatus {
		protected String title;			

		public TTitleStatus(Element e) {
			title = ((ClassWrapper)e.GetElementWrapper()).getTitle();
		}

		public boolean Check(Element e) {
			return title.equals(((ClassWrapper)e.GetElementWrapper()).getTitle()); 
		}
	};

	public class TClassSizeStatus extends TResizeStatus {

		private Number fheight,fwidth;
		private Number mheight,mwidth;
		public TClassSizeStatus(Element e) {
			super(e);
			fheight = ((ClassWrapper)e.GetElementWrapper()).getFieldsAreaHeight();
			fwidth = ((ClassWrapper)e.GetElementWrapper()).getFieldsAreaWidth();
			mheight = ((ClassWrapper)e.GetElementWrapper()).getMethodsAreaHeight();
			mwidth = ((ClassWrapper)e.GetElementWrapper()).getMethodsAreaWidth();
		}
		public boolean Check(Element e) {
			return super.Check(element)
					&& (fheight.equals(((ClassWrapper)e.GetElementWrapper()).getFieldsAreaHeight()))
					&& (fwidth.equals(((ClassWrapper)e.GetElementWrapper()).getFieldsAreaWidth()))
					&& (mheight.equals(((ClassWrapper)e.GetElementWrapper()).getMethodsAreaHeight()))
					&& (mwidth.equals(((ClassWrapper)e.GetElementWrapper()).getMethodsAreaWidth()));
		}
	};

	public class TFieldsStatus extends TClassSizeStatus {

		private List<String> fields = null;
		public TFieldsStatus(Element e) {
			super(e);
			fields  = ((ClassWrapper)e.GetElementWrapper()).getFields();
		}

		public boolean Check(Element e) {
			return super.Check(element) && (fields.equals(((ClassWrapper)e.GetElementWrapper()).getFields()));
		}
	};

	public class TMethodsStatus extends TClassSizeStatus {

		private List<String> methods = null;
		public TMethodsStatus(Element e) {
			super(e);
			methods  = ((ClassWrapper)e.GetElementWrapper()).getMethods();
		}
		public boolean Check(Element e) {
			return super.Check(element) && (methods.equals(((ClassWrapper)e.GetElementWrapper()).getMethods()));
		}
	};

	public class TFullStatus extends TFieldsStatus {

		private List<String> methods = null;
		public TFullStatus(Element e) {
			super(e);
			methods  = ((ClassWrapper)e.GetElementWrapper()).getMethods();
		}

		public boolean Check(Element e) {
			return super.Check(element) && (methods.equals(((ClassWrapper)e.GetElementWrapper()).getMethods()));
		}
	};	

	public ClassWrapper(Element e) {
		super(e);
	}


	@Override
	public IStatus GetStatus(String name) {
		if (name.equals("class-title")) {
			return new TTitleStatus(element);
		} else if (name.equals("class-size")) {
			return new TClassSizeStatus(element);
		} else if (name.equals("class-fields")) {
			return new TFieldsStatus(element);
		} else if (name.equals("class-methods")) {
			return new TMethodsStatus(element);
		} else if (name.equals("class-full")) {
			return new TFullStatus(element);
		}
		return super.GetStatus(name);
	}

	/*
	 * drag and drop resize element
	 * @param item resizable corner of element: "n-u","se-u" etc
	 * @param diff movement string
	 */
	public void Resize(String item, String diff) {
		TCommonOperation op = new TCommonOperation("class-size", element);
		selenium.click("id="+element.euid);
		selenium.dragAndDrop("css=#"+element.GetBorderLocator() + " div.ui-resizable-"+item, diff);

		op.Complete();
		element.getParent().GetOperationManager().ReportOperation(op);
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
		TCommonOperation op = new TCommonOperation("class-title", element);

		selenium.click("css=#" + element.euid + " > div.us-class-header > a");
		selenium.type("css=#" + element.euid + " > div.us-class-header > a > input", title);
		//selenium.keyPress("css=#" + element.euid + " > div.us-class-header > a > input", title);
		selenium.keyDown("css=#" + element.euid + " #name input", "13");

		op.Complete();
		element.getParent().GetOperationManager().ReportOperation(op);
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

		// There are two operation perform:  Add  + rename field
		TCommonOperation op = new TCommonOperation("class-fields", element);

		element.getParent().GetContextMenuHandler().Click(element, "Add field");
		element.GetElementWrapper().Select();

		op.Complete();
		element.getParent().GetOperationManager().ReportOperation(op);

		if (field != null) {
			op = new TCommonOperation("class-fields", element);
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

			op.Complete();
			element.getParent().GetOperationManager().ReportOperation(op);
		}
	}

	/*
	 * Update field of class
	 * @param index of class item
	 * @param field value to update
	 */
	public void updateField(int index, String field) {
		TCommonOperation op = new TCommonOperation("class-fields", element);

		op.Complete();
		element.getParent().GetOperationManager().ReportOperation(op);
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
		TCommonOperation op = new TCommonOperation("class-fields", element);

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
		op.Complete();
		element.getParent().GetOperationManager().ReportOperation(op);
	}

	/*
	 * Get fields of class
	 * @return the list of available fields 
	 */
	public List<String> getFields() {
		List<String> result = new ArrayList<String>();
		List<WebElement> fields = driver.findElements(By.cssSelector("#" + element.euid + " div.us-class-attributes > ul > li > a"));
		if (fields != null && fields.size() > 0) {
			Iterator<WebElement> iter = fields.iterator();
			while (iter.hasNext()) {
				WebElement f = iter.next();
				result.add(f.getText());
			}
		}
		return result;
	}

	/*
	 * Add method to class
	 * And rename it
	 * @param method method description if null then keep the default value 
	 */
	public void addMethod(String method) {

		// There are two operation perform:  Add method + rename method
		TCommonOperation op = new TCommonOperation("class-methods", element);

		element.getParent().GetContextMenuHandler().Click(element, "Add method");
		element.GetElementWrapper().Select();

		op.Complete();
		element.getParent().GetOperationManager().ReportOperation(op);

		if (method != null) {
			op = new TCommonOperation("class-methods", element);
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
			op.Complete();
			element.getParent().GetOperationManager().ReportOperation(op);
		}
	}

	/*
	 * Update method of class
	 * @param index of class item
	 * @param field value to update
	 */
	public void updateMethod(int index, String field) {
		TCommonOperation op = new TCommonOperation("class-methods", element);
		op.Complete();
		element.getParent().GetOperationManager().ReportOperation(op);
	}

	/*
	 * Update method of class
	 * @param index of class item
	 */
	public void removeMethod(int index) {
		TCommonOperation op = new TCommonOperation("class-methods", element);
	}

	/*
	 * Get methods of class
	 * @return the list of available methods 
	 */
	public List<String> getMethods() {
		List<String> result = new ArrayList<String>();
		List<WebElement> methods = driver.findElements(By.cssSelector("#" + element.euid + " div.us-class-operations > ul > li > a"));
		if (methods != null && methods.size() > 0) {
			Iterator<WebElement> iter = methods.iterator();
			while (iter.hasNext()) {
				WebElement f = iter.next();
				result.add(f.getText());
			}
		}
		return result;
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
		TCommonOperation op = new TCommonOperation("class-methods", element);

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
		op.Complete();
		element.getParent().GetOperationManager().ReportOperation(op);
	}


	public void ResizeFieldsArea(int diff) {
		TCommonOperation op = new TCommonOperation("class-size", element);

		selenium.click("id="+element.euid);
		selenium.dragAndDrop("css=#"+element.GetBorderLocator() + " div.us-class-attributes div.ui-resizable-s-l", "0,"+diff);

		op.Complete();
		element.getParent().GetOperationManager().ReportOperation(op);
	}

	public Number getFieldsAreaWidth() {
		Number result = selenium.getElementWidth("css=#"+element.GetBorderLocator() + " div.us-class-attributes");
		return result;
	}

	public Number  getFieldsAreaHeight() {
		Number result = selenium.getElementHeight("css=#"+element.GetBorderLocator() + " div.us-class-attributes"); 
		return  result;
	}

	public Number getMethodsAreaWidth() {
		Number result = selenium.getElementWidth("css=#"+element.GetBorderLocator() + " div.us-class-operations");
		return result;
	}

	public Number getMethodsAreaHeight() {
		Number result = selenium.getElementHeight("css=#"+element.GetBorderLocator() + " div.us-class-operations");
		return result;
	}

}
