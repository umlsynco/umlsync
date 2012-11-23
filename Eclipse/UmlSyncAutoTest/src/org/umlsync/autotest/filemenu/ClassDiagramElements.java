package org.umlsync.autotest.filemenu;

import java.awt.event.KeyEvent;

import com.thoughtworks.selenium.Selenium;
import org.openqa.selenium.*;
import org.openqa.selenium.htmlunit.*;
import org.openqa.selenium.firefox.*;
import org.openqa.selenium.chrome.*;
import org.openqa.selenium.ie.*;
import org.openqa.selenium.interactions.Actions;
import org.testng.annotations.*;
import org.umlsync.autotest.selenium.WebJQueryDriverBackedSelenium;

import static org.testng.Assert.*;

import org.openqa.selenium.Keys;




public class ClassDiagramElements {

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

	@Test
	public void testClassElementsCreation() {
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

		selenium.click("css=#class2 >div.us-class-header");
		selenium.click("css=#class4 >div.us-class-header");
		selenium.click("css=#class6 >div.us-class-header");
		selenium.click("css=#class8 >div.us-class-header");
		selenium.click("css=#note10");
		
	}
	
	@Test
	public void testClassEditable() {
		selenium.click("link=UML class diagram");
		selenium.click("xpath=(//button[@type='button'])[3]");
		selenium.click("link=Class");

		selenium.click("css=#class2 > div.us-class-header > a");
		selenium.keyPress("css=#class2 > div.us-class-header > a > input", "TestEditable");
		selenium.keyDown("css=#name input", "13");

		selenium.click("css=#class2 > div.us-class-header > a");
		selenium.keyPress("css=#class2 > div.us-class-header > a > input", "TestEditable");
		selenium.keyDown("css=#name input", "13");

		selenium.click("css=#class2 > div.us-class-header > a");
		selenium.keyPress("css=#class2 > div.us-class-header > a > input", "TestEditable");
		selenium.keyDown("css=#name input", "13");
		
		
		selenium.click("css=#class2 > div.us-class-header > a");
		selenium.keyPress("css=#class2 > div.us-class-header > a > input", "TestEditableCancel");
		selenium.keyDown("css=#name input", "27");
		
		selenium.click("css=#class2 > div.us-class-header > a");
		selenium.keyPress("css=#class2 > div.us-class-header > a > input", "TestEditableCancel");
		selenium.keyDown("css=#name input", "27");

		selenium.click("css=#class2 > div.us-class-header > a");
		selenium.keyPress("css=#class2 > div.us-class-header > a > input", "TestEditableCancel");
		selenium.keyDown("css=#name input", "27");
		
		
		selenium.click("css=#class2 > div.us-class-header > a");
		selenium.keyPress("css=#class2 > div.us-class-header > a > input", "TestEditableTab");
		selenium.blur("css=#name input");
		
		selenium.click("css=#class2 > div.us-class-header > a");
		selenium.keyPress("css=#class2 > div.us-class-header > a > input", "TestEditableByTab");
		selenium.blur("css=#name input");
		
		selenium.click("css=#class2 > div.us-class-header > a");
		selenium.keyPress("css=#class2 > div.us-class-header > a > input", "TestEditableByTab");
		selenium.blur("css=#name input");		
		
		selenium.click("link=Class");
	}

}
