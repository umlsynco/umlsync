package org.umlsync.autotest.filemenu;

import org.openqa.selenium.*;
import org.openqa.selenium.htmlunit.*;
import org.openqa.selenium.firefox.*;
import org.openqa.selenium.chrome.*;
import org.openqa.selenium.interactions.Actions;
import org.testng.annotations.*;
import org.umlsync.autotest.selenium.WebJQueryDriverBackedSelenium;

import org.openqa.selenium.Keys;




public class TestOperationManager {

	WebDriver driver;
	WebJQueryDriverBackedSelenium selenium;

	@BeforeMethod
	public void startSelenium() {
		driver = new FirefoxDriver();
		selenium = new WebJQueryDriverBackedSelenium(driver, "file:///C:/Users/aea301/Desktop/Diagrammer/GITHUB/umlsync/diagrammer/index2.html");
		selenium.open("file:///C:/Users/aea301/Desktop/Diagrammer/GITHUB/umlsync/diagrammer/index2.html#");
		selenium.click("xpath=(//button[@type='button'])[6]");
	}

	@AfterMethod
	public void stopSelenium() {
		driver.close();
	}

	/*
	 * 1. Create and move(DND) 5 elements. 
	 * 2. One Multipled DND 
	 * 3. Revert all Operations
	 * 4. Repeat all operations
	 *
	 */
	@Test
	public void testAddRemoveDndElement() {
		selenium.click("link=UML class diagram");
		selenium.click("xpath=(//button[@type='button'])[3]");
		selenium.click("link=Class");
		selenium.dragAndDrop("css=#class2 > div.us-class-header", "+250,-150");
		selenium.click("link=Interface");
		selenium.dragAndDrop("css=#class4 > div.us-class-header", "+250,0");
		selenium.click("link=Enumeration");
		selenium.dragAndDrop("css=#class6 > div.us-class-header", "0,-150");
		selenium.click("link=Template");
		selenium.dragAndDrop("css=#class8 > div.us-class-header", "+50,-50");
		selenium.click("link=Note");
		selenium.dragAndDrop("css=#note10", "+150,-150");
		
		selenium.keyPress("css=#class0", Keys.chord( Keys.CONTROL, "a"));
		selenium.dragAndDrop("css=#class8 > div.us-class-header", "+50,-50");
		selenium.keyPress("css=#class0", Keys.chord( Keys.CONTROL, "z"));

		selenium.keyPress("css=#class0", Keys.chord( Keys.CONTROL, "z"));
		selenium.keyPress("css=#class0", Keys.chord( Keys.CONTROL, "z"));
		selenium.keyPress("css=#class0", Keys.chord( Keys.CONTROL, "z"));
		selenium.keyPress("css=#class0", Keys.chord( Keys.CONTROL, "z"));
		selenium.keyPress("css=#class0", Keys.chord( Keys.CONTROL, "z"));
		selenium.keyPress("css=#class0", Keys.chord( Keys.CONTROL, "z"));
		selenium.keyPress("css=#class0", Keys.chord( Keys.CONTROL, "z"));
		selenium.keyPress("css=#class0", Keys.chord( Keys.CONTROL, "z"));
		selenium.keyPress("css=#class0", Keys.chord( Keys.CONTROL, "z"));
		selenium.keyPress("css=#class0", Keys.chord( Keys.CONTROL, "z"));
		
		selenium.keyPress("css=#class0", Keys.chord( Keys.CONTROL, "y"));
		selenium.keyPress("css=#class0", Keys.chord( Keys.CONTROL, "y"));
		selenium.keyPress("css=#class0", Keys.chord( Keys.CONTROL, "y"));
		selenium.keyPress("css=#class0", Keys.chord( Keys.CONTROL, "y"));
		selenium.keyPress("css=#class0", Keys.chord( Keys.CONTROL, "y"));
		selenium.keyPress("css=#class0", Keys.chord( Keys.CONTROL, "y"));
		selenium.keyPress("css=#class0", Keys.chord( Keys.CONTROL, "y"));
		selenium.keyPress("css=#class0", Keys.chord( Keys.CONTROL, "y"));
		selenium.keyPress("css=#class0", Keys.chord( Keys.CONTROL, "y"));
		selenium.keyPress("css=#class0", Keys.chord( Keys.CONTROL, "y"));
		selenium.keyPress("css=#class0", Keys.chord( Keys.CONTROL, "y"));
	}

	@Test
	public void testClassEditable() {
		selenium.click("link=UML class diagram");
		selenium.click("xpath=(//button[@type='button'])[3]");
		selenium.click("link=Class");

		selenium.click("css=#class2 > div.us-class-header > a");
		selenium.keyPress("css=#class2 > div.us-class-header > a > input", "TestEditable");
		selenium.keyDown("css=#name input", "13");

		selenium.keyPress("css=#class0", Keys.chord( Keys.CONTROL, "z"));
		selenium.keyPress("css=#class0", Keys.chord( Keys.CONTROL, "y"));
		
		
		selenium.click("css=#class2 > div.us-class-header > a");
		selenium.keyPress("css=#class2 > div.us-class-header > a > input", "TestEditableCancel");
		selenium.keyDown("css=#name input", "27");

		selenium.keyPress("css=#class0", Keys.chord( Keys.CONTROL, "z"));
		selenium.keyPress("css=#class0", Keys.chord( Keys.CONTROL, "y"));
		
		
		
		selenium.click("css=#class2 > div.us-class-header > a");
		selenium.keyPress("css=#class2 > div.us-class-header > a > input", "TestEditableTab");
		selenium.blur("css=#name input");
		
		selenium.keyPress("css=#class0", Keys.chord( Keys.CONTROL, "z"));
		selenium.keyPress("css=#class0", Keys.chord( Keys.CONTROL, "y"));
		
		selenium.contextMenu("css=#class2 > div.us-class-header");
		selenium.click("link=Add method");
		selenium.contextMenu("css=#class2 > div.us-class-header");
		selenium.click("link=Add method");

		selenium.keyPress("css=#class0", Keys.chord( Keys.CONTROL, "z"));
		selenium.keyPress("css=#class0", Keys.chord( Keys.CONTROL, "z"));
		selenium.keyPress("css=#class0", Keys.chord( Keys.CONTROL, "y"));
		selenium.keyPress("css=#class0", Keys.chord( Keys.CONTROL, "y"));

		selenium.contextMenu("css=#class2 > div.us-class-header");
		selenium.click("link=Add field");
		selenium.contextMenu("css=#class2 > div.us-class-header");
		selenium.click("link=Add field");
		selenium.keyPress("css=#class0", Keys.chord( Keys.CONTROL, "z"));
		selenium.keyPress("css=#class0", Keys.chord( Keys.CONTROL, "z"));
		selenium.keyPress("css=#class0", Keys.chord( Keys.CONTROL, "y"));
		selenium.keyPress("css=#class0", Keys.chord( Keys.CONTROL, "y"));
		
	}

	
	@Test
	public void testClassSortable() {
		selenium.click("link=UML class diagram");
		selenium.click("xpath=(//button[@type='button'])[3]");
		// Create class element
		selenium.click("link=Class");

		// Add two methods and edit them
		selenium.contextMenu("css=#class2 > div.us-class-header");
		selenium.click("link=Add method");

		selenium.click("css=#class2 a#operation0");
		selenium.keyPress("css=#class2 a#operation0 > input", "m1");
		selenium.keyDown("css=#operation0 input", "13");

		selenium.contextMenu("css=#class2 > div.us-class-header");
		selenium.click("link=Add method");
		selenium.click("css=#class2 a#operation1");
		selenium.keyPress("css=#class2 a#operation1 > input", "m2");
		selenium.keyDown("css=#operation1 input", "13");
		
		selenium.dragAndDrop("xpath=//li[@id=\"operation\"][1]", "+42,+62");
		selenium.dragAndDrop("xpath=//li[@id=\"operation\"][2]", "+22,-22");


		selenium.keyPress("css=#class0", Keys.chord( Keys.CONTROL, "z"));
		selenium.keyPress("css=#class0", Keys.chord( Keys.CONTROL, "z"));
		selenium.keyPress("css=#class0", Keys.chord( Keys.CONTROL, "y"));
		selenium.keyPress("css=#class0", Keys.chord( Keys.CONTROL, "y"));

		selenium.contextMenu("css=#class2 > div.us-class-header");
		selenium.click("link=Add field");
		selenium.contextMenu("css=#class2 > div.us-class-header");
		selenium.click("link=Add field");

		selenium.click("css=#class2 a#attribute0");
		selenium.keyPress("css=#class2 a#attribute0 > input", "f1");
		selenium.keyDown("css=#attribute0 input", "13");

		selenium.click("css=#class2 a#attribute1");
		selenium.keyPress("css=#class2 a#attribute1 > input", "f2");
		selenium.keyDown("css=#attribute1 input", "13");
		
		selenium.dragAndDrop("xpath=//li[@id=\"attribute\"][1]", "+22,+22");
		selenium.dragAndDrop("xpath=//li[@id=\"attribute\"][1]", "+22,+22");
		selenium.dragAndDrop("xpath=//li[@id=\"attribute\"][1]", "+22,+22");
		selenium.dragAndDrop("xpath=//li[@id=\"attribute\"][1]", "+22,+22");


		selenium.keyPress("css=#class0", Keys.chord( Keys.CONTROL, "z"));
		selenium.keyPress("css=#class0", Keys.chord( Keys.CONTROL, "z"));
		selenium.keyPress("css=#class0", Keys.chord( Keys.CONTROL, "y"));
		selenium.keyPress("css=#class0", Keys.chord( Keys.CONTROL, "y"));
		
		
		
	}

}
