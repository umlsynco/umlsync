package org.umlsync.autotest.components.elements.wrappers;

import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.Point;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.umlsync.autotest.components.elements.Element;
import org.umlsync.autotest.components.handlers.IOperation;
import org.umlsync.autotest.selenium.TSeleniumClient;

import com.thoughtworks.selenium.Selenium;

public class ElementWrapper  extends TSeleniumClient implements IStatusProvider{
	public class TPositionStatus extends IStatus {
		protected int top,left;			

		public TPositionStatus(Element e) {
			top = e.GetElementWrapper().Top();
			left = e.GetElementWrapper().Left();
		}

		public boolean Check(Element e) {
			return ((top == e.GetElementWrapper().Top()) && (left == e.GetElementWrapper().Left())); 
		}
	};

	public class TResizeStatus extends TPositionStatus {
		private Dimension dimention;

		public TResizeStatus(Element e) { 
			super(e);
		    dimention = e.GetElementWrapper().Dimention();
		}

		public boolean Check(Element e) {
			return super.Check(element) && e.GetElementWrapper().Dimention().equals(dimention); 
		}
	};	

	
	@Override
	public IStatus GetStatus(String name) {
		if (name.equals("position")) {
			return new TPositionStatus(this.element);
		} else if (name.equals("resize")) {
			return new TResizeStatus(this.element);
		} else if (name.equals("create")) {
			element.getParent().GetOperationManager().ReportOperation(new TCreateOperation(element));
		}
		return null;
	}

	
	protected Element element;
	protected TCommonOperation tempOperation = null;

	public ElementWrapper(Element e) {
		element = e;
		e.addClient(this);
	}
	
	public void DragAndDrop(String diff) {
		element.GetDiagram().StartMultipleDragAndDrop(element);

		DragStart();
		
		selenium.dragAndDrop("id="+element.euid, diff);

		DragStop();

		element.GetDiagram().StopMultipleDragAndDrop(element);	
	}

	/*
	 * drag and drop resize element
	 * @param item resizable corner of element: "n-u","se-u" etc
	 * @param diff movement string
	 */
	public void Resize(String item, String diff) {
		TCommonOperation op = new TCommonOperation("resize", element);
		selenium.click("id="+element.euid);
		selenium.dragAndDrop("css=#"+element.GetBorderLocator() + " div.ui-resizable-"+item, diff);

		op.Complete();		
		element.getParent().GetOperationManager().ReportOperation(op);
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
		WebElement e = driver.findElement(By.id(element.GetEuid()));
		return e.getSize().getWidth();
	}

	/*
	 * @return height of element
	 */
	public int Height() {
		WebElement e = driver.findElement(By.id(element.GetEuid()));
		return e.getSize().getHeight();
	}
	
	public Dimension Dimention() {
		WebElement e = driver.findElement(By.id(element.GetEuid()));
		return e.getSize();
	}
	
	public int Top() {
		WebElement e = driver.findElement(By.id(element.GetBorderLocator()));
		return e.getLocation().y;
	}
	
	public int Left() {
		WebElement e = driver.findElement(By.id(element.GetBorderLocator()));
		return e.getLocation().x;
	}
	
	public Point Position() {
		WebElement e = driver.findElement(By.id(element.euid));
		return e.getLocation();
	}

	public boolean isPresent() {
	  return selenium.isElementPresent("id=" + element.GetBorderLocator());
	}

	public boolean isDisplayed() {
		if (selenium.isElementPresent("id=" + element.GetBorderLocator())) {
		  WebElement e = driver.findElement(By.id(element.euid));
		  return e != null ? e.isDisplayed():false;
		}
		return false;
	}

	public void DragStart() {
		tempOperation  = new TCommonOperation("position", element);
	}
	
	public void DragStop() {
		tempOperation.Complete();

		element.getParent().GetOperationManager().ReportOperation(tempOperation);

		tempOperation = null;
	}

}
