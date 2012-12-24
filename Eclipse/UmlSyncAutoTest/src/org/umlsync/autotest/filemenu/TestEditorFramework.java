package org.umlsync.autotest.filemenu;

import java.util.Iterator;
import java.util.List;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.testng.Assert;
import org.testng.annotations.AfterSuite;
import org.testng.annotations.BeforeSuite;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;
import org.umlsync.autotest.components.EditorFramework;
import org.umlsync.autotest.components.elements.Diagram;
import org.umlsync.autotest.components.elements.Element;
import org.umlsync.autotest.components.elements.wrappers.ElementWrapper;
import org.umlsync.autotest.selenium.WebJQueryDriverBackedSelenium;

import com.thoughtworks.selenium.Selenium;



public class TestEditorFramework {
	private static final int IterationCount = 3;
	WebDriver driver;
	Selenium selenium;
	EditorFramework editor;

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
	}

	@AfterSuite
	public void stopSelenium() {
		driver.close();
	}

	@DataProvider(name = "NewDiagramSelectorsData")
	public Object[][] NewDiagramSelectorsData() {
		return new Object[][]{
				{"UML class diagram", true},
				{"UML component diagram", true},
				{"UML package diagram", true},
				{"UML sequence diagram", true}};
				//{"Common objects diagram", true}};
	}

	@Test(dataProvider = "NewDiagramSelectorsData")	
	public void testEditor_CreateAllTypeOfDiagrams(String did, boolean status) {
		Diagram d = editor.GetDiagramManager().CreateDiagram(did, "Test");
		Assert.assertEquals(editor.GetDiagramManager().IsDiagramActive(d), status);
	}

	@Test(dependsOnMethods={"testEditor_CreateAllTypeOfDiagrams"}, enabled = true)	
	public void testEditor_ActivateOpenedDiagrams() {
		for (int i=0; i<IterationCount; ++i) {
			Iterator<Diagram> ds = editor.GetDiagramManager().GetAllDiagrams().iterator();
			Diagram d;
			for (; ds.hasNext();) {
				d = ds.next();
				editor.GetDiagramManager().ActivateDiagram(d);
				Assert.assertEquals(editor.GetDiagramManager().IsDiagramActive(d), true);
				Assert.assertEquals(editor.GetDiagramMenuHandler().IsActive(d.GetType()), true);
			}
		}
	}

	@Test(dependsOnMethods={"testEditor_ActivateOpenedDiagrams"}, enabled = true)	
	public void testEditor_ActivateOpenedDiagramMenus() {
		for (int i=0; i<IterationCount; ++i) {
			Iterator<Diagram> ds = editor.GetDiagramManager().GetAllDiagrams().iterator();
			Diagram d;
			for (; ds.hasNext();) {
				d = ds.next();
				editor.GetDiagramMenuHandler().Activate(d.GetType());
				Assert.assertEquals(editor.GetDiagramMenuHandler().IsActive(d.GetType()), true);
			}
		}
	}

	@Test(dependsOnMethods={"testEditor_CreateAllTypeOfDiagrams"}, enabled = true)	
	public void testEditor_CreateAllElements() {
		int x=100,y=100;
		Iterator<Diagram> ds = editor.GetDiagramManager().GetAllDiagrams().iterator();
		Diagram d;
		for (; ds.hasNext();) {
			d = ds.next();
			editor.GetDiagramManager().ActivateDiagram(d);
			Assert.assertEquals(editor.GetDiagramMenuHandler().IsActive(d.GetType()), true);
			d.keyHandler.RemoveAll();            // Remove all previous elements

			Iterator<String> types = editor.GetDiagramMenuHandler().GetElements(d.GetType()).iterator();
			while (types.hasNext()) {
				String t = types.next();
				Element diagramElement = d.CreateElement(t, null);
				Assert.assertNotNull(diagramElement);
			}

		}
	}
	
	@Test(dependsOnMethods={"testEditor_CreateAllTypeOfDiagrams"}, enabled = true)	
	public void testEditor_CreateAndDndAllElements() {
		int x=100,y=100;
		Iterator<Diagram> ds = editor.GetDiagramManager().GetAllDiagrams().iterator();
		Diagram d;
		for (; ds.hasNext();) {
			int x1=x, y1=y;

			d = ds.next();
			editor.GetDiagramManager().ActivateDiagram(d);
			Assert.assertEquals(editor.GetDiagramMenuHandler().IsActive(d.GetType()), true);
			d.keyHandler.RemoveAll();            // Remove all previous elements

			Iterator<String> types = editor.GetDiagramMenuHandler().GetElements(d.GetType()).iterator();
			while (types.hasNext()) {
				String t = types.next();
				Element diagramElement = d.CreateElement(t, null);
				Assert.assertNotNull(diagramElement);
				ElementWrapper diagramElementWrapper = new ElementWrapper(diagramElement);
				diagramElementWrapper.DragAndDrop("+"+x1+",-"+y1);
				x1+=10;
				y1-=10;
			}

		}
	}

	@Test(dependsOnMethods={"testEditor_CreateAllTypeOfDiagrams"}, enabled = true)	
	public void testEditor_CreateAndResizellElements() {
		int x=100,y=100;
		Iterator<Diagram> ds = editor.GetDiagramManager().GetAllDiagrams().iterator();
		Diagram d;
		for (; ds.hasNext();) {
			int x1=x, y1=y;
			d = ds.next();
			
			editor.GetDiagramManager().ActivateDiagram(d);
			Assert.assertEquals(editor.GetDiagramMenuHandler().IsActive(d.GetType()), true);
			d.keyHandler.RemoveAll();            // Remove all previous elements

			Iterator<String> types = editor.GetDiagramMenuHandler().GetElements(d.GetType()).iterator();
			while (types.hasNext()) {
				String t = types.next();
				Element diagramElement = d.CreateElement(t, null);
				Assert.assertNotNull(diagramElement);
				ElementWrapper diagramElementWrapper = new ElementWrapper(diagramElement);
				diagramElementWrapper.Resize("se-u", "+50,+50");
				x1+=10;
				y1-=10;
			}
		}
	}
	
	@Test(dependsOnMethods={"testEditor_CreateAllTypeOfDiagrams"}, enabled = true)
	public void testEditor_CreateAndDndAndResizeAllElements() {
		int x=100,y=100;
		Iterator<Diagram> ds = editor.GetDiagramManager().GetAllDiagrams().iterator();
		Diagram d;
		for (; ds.hasNext();) {
			int x1=x, y1=y;
			d = ds.next();

			editor.GetDiagramManager().ActivateDiagram(d);
			Assert.assertEquals(editor.GetDiagramMenuHandler().IsActive(d.GetType()), true);
			d.keyHandler.RemoveAll();            // Remove all previous elements

			Iterator<String> types = editor.GetDiagramMenuHandler().GetElements(d.GetType()).iterator();
			while (types.hasNext()) {
				String t = types.next();
				Element diagramElement = d.CreateElement(t, null);
				Assert.assertNotNull(diagramElement);
				ElementWrapper diagramElementWrapper = new ElementWrapper(diagramElement);
				diagramElementWrapper.DragAndDrop("+"+x1+",-"+y1);
				diagramElementWrapper.Resize("se-u", "+50,+50");
				x1+=10;
				y1-=10;
			}

		}
	}

	
	@Test(dependsOnMethods={"testEditor_CreateAllTypeOfDiagrams"}, enabled = true)	
	public void testEditor_CreateAndDndAndMultipleDndAllElements() {
		int x=100,y=100;
		Iterator<Diagram> ds = editor.GetDiagramManager().GetAllDiagrams().iterator();
		Diagram d;
		for (; ds.hasNext();) {
			int x1=x, y1=y;

			d = ds.next();
			editor.GetDiagramManager().ActivateDiagram(d);
			Assert.assertEquals(editor.GetDiagramMenuHandler().IsActive(d.GetType()), true);
			d.keyHandler.RemoveAll();            // Remove all previous elements

			Iterator<String> types = editor.GetDiagramMenuHandler().GetElements(d.GetType()).iterator();
			ElementWrapper diagramElementWrapper = null;
			while (types.hasNext()) {
				String t = types.next();
				Element diagramElement = d.CreateElement(t, null);
				Assert.assertNotNull(diagramElement);
				diagramElementWrapper = new ElementWrapper(diagramElement);
				diagramElementWrapper.DragAndDrop("+"+x1+",-"+y1);
				x1+=10;
				y1-=10;
			}
			d.keyHandler.CtrlA();
			diagramElementWrapper.DragAndDrop("+"+x1+",-"+y1);
		}
	}
	
	/*
	 * 1. Check mouse over/out
	 * 2. Check mouse click (selection)
	 * 3. Check icon menu availability for each element
	 * Sequence: Create -> Select -> Un-Select-> MouseOver -> Mouse Out 
	 */
	@Test(dependsOnMethods={"testEditor_CreateAllTypeOfDiagrams"}, enabled = true)
	public void testEditor_CreateAllElementsAndCheckSelection() {
		Iterator<Diagram> ds = editor.GetDiagramManager().GetAllDiagrams().iterator();
		Diagram d;
		for (; ds.hasNext();) {

			d = ds.next();
			editor.GetDiagramManager().ActivateDiagram(d);
			Assert.assertEquals(editor.GetDiagramMenuHandler().IsActive(d.GetType()), true);
			d.keyHandler.RemoveAll();            // Remove all previous elements

			Iterator<String> types = editor.GetDiagramMenuHandler().GetElements(d.GetType()).iterator();
			ElementWrapper diagramElementWrapper = null;
			while (types.hasNext()) {
				String t = types.next();
				Element diagramElement = d.CreateElement(t, null);
				Assert.assertNotNull(diagramElement);
				diagramElementWrapper = new ElementWrapper(diagramElement);
				diagramElementWrapper.Select();
				Assert.assertEquals(diagramElementWrapper.IsHightlighted(), true);
				Assert.assertEquals(diagramElementWrapper.IsSelected(), true);
				Assert.assertEquals(d.iconMenuHandler.IsIconMenuVisisble(diagramElement), true);
				d.SelectNone();
				diagramElementWrapper.MouseOver();
				Assert.assertEquals(diagramElementWrapper.IsHightlighted(), true);
				diagramElementWrapper.MouseOut();
				Assert.assertEquals(diagramElementWrapper.IsHightlighted(), false);
			}
		}
	}

	//(dependsOnMethods={"testEditor_CreateAllElementsAndCheckSelection"})
	@Test(dependsOnMethods={"testEditor_CreateAllTypeOfDiagrams"}, enabled = true)
	public void testEditor_ElementsIconMenus() {
		Iterator<Diagram> ds = editor.GetDiagramManager().GetAllDiagrams().iterator();
		Diagram d;
		for (; ds.hasNext();) {

			d = ds.next();
			editor.GetDiagramManager().ActivateDiagram(d);
			Assert.assertEquals(editor.GetDiagramMenuHandler().IsActive(d.GetType()), true);
			d.keyHandler.RemoveAll();            // Remove all previous elements

			Iterator<String> types = editor.GetDiagramMenuHandler().GetElements(d.GetType()).iterator();
			ElementWrapper diagramElementWrapper = null;
			while (types.hasNext()) {
				String t = types.next();
				Element diagramElement = d.CreateElement(t, null);
				Assert.assertNotNull(diagramElement);
				diagramElementWrapper = new ElementWrapper(diagramElement);
				diagramElementWrapper.Select();
				Assert.assertEquals(diagramElementWrapper.IsHightlighted(), true);
				Assert.assertEquals(diagramElementWrapper.IsSelected(), true);
				Assert.assertEquals(d.iconMenuHandler.IsIconMenuVisisble(diagramElement), true);
				
				d.SelectNone();
			}
		}
	}
	
	@Test(dependsOnMethods={"testEditor_CreateAllTypeOfDiagrams"})
	public void testEditor_ElementsIconMenusDND() {
		Iterator<Diagram> ds = editor.GetDiagramManager().GetAllDiagrams().iterator();
		Diagram d;
		for (; ds.hasNext();) {

			d = ds.next();
			if (d.GetType().contains("seq")) {
				// Sequence diagram could create several
				// elements on icon menu DND.
				// Therefore it is not in scope of simple auto tests
				continue;
			}
			editor.GetDiagramManager().ActivateDiagram(d);
			Assert.assertEquals(editor.GetDiagramMenuHandler().IsActive(d.GetType()), true);
			d.keyHandler.RemoveAll();            // Remove all previous elements

			Iterator<String> types = editor.GetDiagramMenuHandler().GetElements(d.GetType()).iterator();
			ElementWrapper diagramElementWrapper = null;
			while (types.hasNext()) {
				String t = types.next();
				Element diagramElement = d.CreateElement(t, null);
				
				Assert.assertNotNull(diagramElement);
				diagramElementWrapper = new ElementWrapper(diagramElement);
				diagramElementWrapper.Select();
				
				Assert.assertEquals(diagramElementWrapper.IsHightlighted(), true);
				Assert.assertEquals(diagramElementWrapper.IsSelected(), true);
				
				
				Assert.assertEquals(d.iconMenuHandler.IsIconMenuVisisble(diagramElement), true);

				List<String> its = d.iconMenuHandler.GetAvailableItems(diagramElement);
				if (its == null || its.size() == 0) {
					continue; // no icon menu available for element
				}
				double step = Math.PI/(2*its.size());
				
				Iterator<String> items = its.iterator();
				int angle = 0;
				while (items.hasNext()) {
					String icon = items.next();
					diagramElementWrapper.Select();
					d.iconMenuHandler.dragAndDrop(diagramElement,
						icon,
						200 + (int)(350*Math.sin(angle*step)),
						(int)(350*Math.cos(angle*step)));
					angle++;
					Element newElement = d.IdentifyNewElement("Class");
					Assert.assertEquals(newElement != null, true);
				}
				d.keyHandler.RemoveAll();
				d.SelectNone();
			}
		}
	}
}
