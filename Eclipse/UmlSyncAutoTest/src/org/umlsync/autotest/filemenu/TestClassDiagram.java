package org.umlsync.autotest.filemenu;

import java.util.ArrayList;
import java.util.List;

import org.openqa.selenium.Dimension;
import org.openqa.selenium.Keys;
import org.openqa.selenium.Point;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.testng.Assert;
import org.testng.annotations.AfterSuite;
import org.testng.annotations.BeforeSuite;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;
import org.umlsync.autotest.components.EditorFramework;
import org.umlsync.autotest.components.elements.Connector;
import org.umlsync.autotest.components.elements.Diagram;
import org.umlsync.autotest.components.elements.Element;
import org.umlsync.autotest.components.elements.wrappers.ClassWrapper;
import org.umlsync.autotest.selenium.WebJQueryDriverBackedSelenium;

import com.thoughtworks.selenium.Selenium;

public class TestClassDiagram {
	WebDriver driver;
	Selenium selenium;
	EditorFramework editor;
	Diagram classDiagram;

	@BeforeSuite
	public void startSelenium() {
		driver = new FirefoxDriver();
		selenium = new WebJQueryDriverBackedSelenium(driver, AutomatedTestConfiguration.EDITOR_BASE_URL);

		editor = new EditorFramework();
		editor.init(selenium, driver);
		editor.Maximize();

		// Open the page and skip first dialogs
		selenium.open(AutomatedTestConfiguration.EDITOR_URL);
		editor.GetDialogManager().CancelAll();
		classDiagram = editor.GetDiagramManager().CreateDiagram("UML class diagram", "TestClassDiagram");
		Assert.assertEquals(editor.GetDiagramManager().IsDiagramActive(classDiagram), true);
	}

	@AfterSuite
	public void stopSelenium() {
		driver.close();
	}

	@Test
	public void testClassDiagram_EditableTitle() {
		Element element = classDiagram.CreateElement("Class", "FirstClass");
		Assert.assertEquals(element != null, true);

		ClassWrapper classElement = (ClassWrapper) element.GetElementWrapper();

		classElement.setTitle("TestEditable");
		Assert.assertEquals(classElement.getTitle().equals("TestEditable"), true);

		classElement.setTitle("TestEditable2");
		Assert.assertEquals(classElement.getTitle().equals("TestEditable2"), true);

		Assert.assertTrue(classDiagram.GetOperationManager().RevertOperation(2));
		Assert.assertTrue(classDiagram.GetOperationManager().RepeatOperation(2));

	}

	@Test
	public void testClassDiagram_EditableFields() {

		classDiagram.GetKeyHandler().RemoveAll();

		Element element = classDiagram.CreateElement("Class", "FirstClass");
		Assert.assertEquals(element != null, true);

		ClassWrapper classElement = (ClassWrapper) element.GetElementWrapper();
		classElement.addField("(+) int field1");
		classElement.addField("(+) int field2");
		classElement.addField("(+) int field3");

		classElement.sortFields(1, 2);
		classElement.sortFields(2, 1);
		classElement.sortFields(2, 0);

		classElement.addMethod("(+) bool getField1()");
		classElement.addMethod("(+) bool getField2()");
		classElement.addMethod("(+) bool getField3()");

		classElement.sortMethods(1, 2);
		classElement.sortMethods(2, 1);
		classElement.sortMethods(2, 0);

		//		classElement.ResizeFieldsArea(40);
		//		classElement.ResizeFieldsArea(-40);

		Assert.assertTrue(classDiagram.GetOperationManager().RevertOperation(17));
		Assert.assertTrue(classDiagram.GetOperationManager().RepeatOperation(17));

	}

	/*
	 * Test:
	 * create class
	 * change name
	 * add field and rename X3
	 * sort fields x3
	 * add method and rename x3
	 * sort fields x3
	 * revert all items above
	 */
	@Test
	public void testClassDiagram_OperationManager_ClassInternalsWithRename() {
		classDiagram.GetKeyHandler().RemoveAll();

		Element element = classDiagram.CreateElement("Class", "FirstClass");
		Assert.assertEquals(element != null, true);

		ClassWrapper classElement = (ClassWrapper) element.GetElementWrapper();

		// Set title
		classElement.setTitle("TestEditable");
		Assert.assertEquals(classElement.getTitle().equals("TestEditable"), true);


		classElement.addField("(+) int field1"); // Keep fields area size (2 operations add and edit)
		classElement.addField("(+) int field2"); // Increase fields area size

		classElement.sortFields(0, 1); // Check both sort direction
		classElement.sortFields(1, 0);


		classElement.addMethod("(+) bool getField1()");
		classElement.addMethod("(+) bool getField2()");

		classElement.sortMethods(0, 1);
		classElement.sortMethods(1, 0);

		Assert.assertTrue(classDiagram.GetOperationManager().RevertOperation(13));
		Assert.assertTrue(classDiagram.GetOperationManager().RepeatOperation(13));
	}		

	/*
	 * Issue #65:
	 * 
	 * Class diagram:
	 * 1. create class 
	 * 2. AddField x2
	 * 3. AddMethod x2
	 * 4. AddField x1
	 * 5. Revert previous operations (2-4) 
	 */
	@Test
	public void testClassDiagram_OperationManager_ClassInternals() {
		classDiagram.GetKeyHandler().RemoveAll();

		Element element = classDiagram.CreateElement("Class", "FirstClass");
		Assert.assertEquals(element != null, true);

		ClassWrapper classElement = (ClassWrapper) element.GetElementWrapper();

		classElement.Select();

		classElement.addField(null);
		classElement.addField(null);

		classElement.addMethod(null);
		classElement.addMethod(null);

		classElement.addField(null);

		Assert.assertTrue(classDiagram.GetOperationManager().RevertOperation(5));
		Assert.assertTrue(classDiagram.GetOperationManager().RepeatOperation(5));
	}
	
	@Test
	public void testClassDiagram_OperationManager_DND() {
		classDiagram.GetKeyHandler().RemoveAll();

		Element element = classDiagram.CreateElement("Class", "FirstClass");
		Assert.assertEquals(element != null, true);

		ClassWrapper classElement = (ClassWrapper) element.GetElementWrapper();
		
		Point[] points = {new Point(100,100),new Point(100,-100),new Point(100,-100),
				          new Point(100,100),new Point(100,100),new Point(100,-100),
		                  new Point(100,0)};
		for (int h=0; h<points.length; ++h) {
			classElement.DragAndDrop(""+points[h].x + ","+points[h].y);
		}
		
		Assert.assertTrue(classDiagram.GetOperationManager().RevertOperation(points.length));
		Assert.assertTrue(classDiagram.GetOperationManager().RepeatOperation(points.length));
	}

	/*
	 * Issue #64: Multiple resize of class element lead to damage
	 * 
	 * 1. Create class on class diagram
	 * 2. Resize class via right-bottom selector
	 * 3. Resize fields area 
	 * 4. revert 2 operations
	 * 
	 */
	@Test
	public void testClassDiagram_OperationManager_ClassResizeSimple() {
		classDiagram.GetKeyHandler().RemoveAll();

		Element element = classDiagram.CreateElement("Class", "FirstClass");
		Assert.assertEquals(element != null, true);

		ClassWrapper classElement = (ClassWrapper) element.GetElementWrapper();

		classElement.Resize("se-u", "+100,+50");
		classElement.ResizeFieldsArea(+30);

		Assert.assertTrue(classDiagram.GetOperationManager().RevertOperation(2));
		Assert.assertTrue(classDiagram.GetOperationManager().RepeatOperation(2));
	}		


	/*
	 * 1. Create class on class diagram
	 * 2. Resize class via right-bottom selector
	 * 3. Resize fields area
	 * ...
	 * N. Revert all operations 
	 * 
	 */
	@Test
	public void testClassDiagram_OperationManager_ClassResizeComplex() {
		classDiagram.GetKeyHandler().RemoveAll();

		Element element = classDiagram.CreateElement("Class", "FirstClass");
		Assert.assertEquals(element != null, true);

		ClassWrapper classElement = (ClassWrapper) element.GetElementWrapper();

		classElement.Resize("se-u", "+100,+50");
		classElement.ResizeFieldsArea(+30);
		classElement.ResizeFieldsArea(-20);
		classElement.Resize("se-u", "-20,-20");
		classElement.ResizeFieldsArea(+10);

		Assert.assertTrue(classDiagram.GetOperationManager().RevertOperation(5));
		Assert.assertTrue(classDiagram.GetOperationManager().RepeatOperation(5));
	}

	/*
	 * 1. Create class on class diagram
	 * 2. Resize class via right-bottom selector
	 * 3. Resize fields area
	 * ...
	 * M. Some operations with add fields and methods
	 * ...
	 * N. Revert all operations 
	 * N+1. Repeat all operations 
	 * 
	 */
	@Test
	public void testClassDiagram_OperationManager_ClassResizeComplexWithAttributes() {
		classDiagram.GetKeyHandler().RemoveAll();

		Element element = classDiagram.CreateElement("Class", "FirstClass");
		Assert.assertEquals(element != null, true);

		ClassWrapper classElement = (ClassWrapper) element.GetElementWrapper();

		classElement.addField(null);
		classElement.addField(null);

		classElement.addMethod(null);
		classElement.addMethod(null);

		classElement.Resize("se-u", "+100,+20");
		classElement.ResizeFieldsArea(+10);

		classElement.addField(null);
		classElement.addField(null);

		classElement.addMethod(null);
		classElement.addMethod(null);

		classElement.ResizeFieldsArea(-20);
		classElement.Resize("se-u", "-20,+20");
		classElement.ResizeFieldsArea(+40);

		Assert.assertTrue(classDiagram.GetOperationManager().RevertOperation(13));
		Assert.assertTrue(classDiagram.GetOperationManager().RepeatOperation(13));
	}		

	/*
	 * Check that framework removes html instances of reverted elements
	 * on new operation repot. 
	 * 
	 * 1. Create two class elements
	 * 2. Revert adding
	 * 3. Create new element
	 * 4. Check that reverted elements disappeared from diagram at all !!!!
	 */
	@Test
	public void testClassDiagram_OperationManager_RemovedQueueClean() {
		classDiagram.GetKeyHandler().RemoveAll();

		Element element1 = classDiagram.CreateElement("Class", "FirstClass");
		Element element2 = classDiagram.CreateElement("Class", "2ndClass");

		Assert.assertTrue(classDiagram.GetOperationManager().RevertOperation(2));

		Assert.assertEquals(element1.GetElementWrapper().isPresent(), true);
		Assert.assertEquals(element1.GetElementWrapper().isDisplayed(), false);

		Assert.assertEquals(element2.GetElementWrapper().isPresent(), true);
		Assert.assertEquals(element2.GetElementWrapper().isDisplayed(), false);

		Element element3 = classDiagram.CreateElement("Class", "NewClass");
		Assert.assertEquals(element1.GetElementWrapper().isPresent(), false);
		Assert.assertEquals(element2.GetElementWrapper().isPresent(), false);

	}

	class IconElementDescription {
		Point point;
		int idx;
		boolean creator;
		IconElementDescription(int i, boolean c, Point p) {
			point = p;
			idx = i;
			creator = c;
		}
	}

	IconElementDescription[] iconSet1 =  {
		new IconElementDescription(0, true, new Point(300, 0)),
		new IconElementDescription(1, true, new Point(0, 200)),
		new IconElementDescription(2, false, new Point(-360, -130))
		};

	IconElementDescription[] iconSet2 =  {
			new IconElementDescription(0, true, new Point(300, -100)),
			new IconElementDescription(1, true, new Point(0, 200)),
			new IconElementDescription(2, true, new Point(200, -100)),
			new IconElementDescription(3, false, new Point(-300, -30))
			};

	
	@DataProvider(name = "CreateElementsViaIconMenu")
	public Object[][] CreateElementsViaIconMenu() {
		return new Object[][]{
				{iconSet1},
				{iconSet2}
				};
	}

	@Test(dataProvider = "CreateElementsViaIconMenu")	  
	public void testClassDiagram_OperationManager_IconMenu(IconElementDescription[] params) {
		classDiagram.GetKeyHandler().RemoveAll();

		Element element = classDiagram.CreateElement("Class", "FirstClass");
		Assert.assertEquals(element != null, true);
		List<Element> elements = new ArrayList<Element>();
		elements.add(element);


		for (int i=0; i<params.length; ++i) {

			element = elements.get(params[i].idx);
		    Assert.assertNotNull(element);

			ClassWrapper classElement = (ClassWrapper) element.GetElementWrapper();
			classElement.Select();
			classDiagram.GetIconMenuHandler().dragAndDrop(element, "aggregation", params[i].point.x, params[i].point.y);
			
			Element newElement = classDiagram.IdentifyNewElement("Class");
			Assert.assertEquals(newElement != null, params[i].creator);
			if (newElement != null) {
				elements.add(newElement);
			}
		}
	}

	@Test
	public void testClassDiagram_OperationManager_ConnectorsSimple() {

		classDiagram.GetKeyHandler().RemoveAll();
		Element element = classDiagram.CreateElement("Class", "FirstClass");
		Assert.assertEquals(element != null, true);

		ClassWrapper classElement = (ClassWrapper) element.GetElementWrapper();
		classElement.Select();
		classDiagram.GetIconMenuHandler().dragAndDrop(element, "aggregation", 310, 0);

		Element element2 = classDiagram.IdentifyNewElement("Class");

		Connector con1 = classDiagram.IdentifyNewConnector();

		con1.AddEpointByIndex(0, 100, 100);
		con1.AddEpointByIndex(1, 100, 100);
		con1.AddEpointByIndex(2, -100, 100);
		con1.AddEpointByIndex(1, +300, -200);
		con1.AddEpointByIndex(1, +100, +200);
		con1.AddEpointByIndex(1, -300, +200);
	}
}
