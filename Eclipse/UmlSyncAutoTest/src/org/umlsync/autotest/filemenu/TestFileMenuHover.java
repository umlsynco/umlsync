package org.umlsync.autotest.filemenu;

import java.util.List;

import com.thoughtworks.selenium.Selenium;
import org.openqa.selenium.*;
import org.openqa.selenium.htmlunit.*;
import org.openqa.selenium.firefox.*;
import org.openqa.selenium.chrome.*;
import org.openqa.selenium.ie.*;
import org.testng.annotations.*;
import org.umlsync.autotest.components.DialogManager;
import org.umlsync.autotest.selenium.WebJQueryDriverBackedSelenium;

import static org.testng.Assert.*;

public class TestFileMenuHover {

	WebDriver driver;
	Selenium selenium;
	DialogManager dialogManager;
	
	public TestFileMenuHover() {
		
	}

	public TestFileMenuHover(Selenium Selenium, WebDriver Driver) {
		driver = Driver;
		selenium = Selenium;
	}
	
	public void OpenMenu(int menu, int submenu) {
		List<WebElement> elem = driver.findElements(By.cssSelector("ul#header-menu > li"));
		
		if (elem.get(menu) == null) {
			// TODO: FAIL
			return;
		}
		
   		String id = elem.get(menu).getAttribute("id");
   		selenium.mouseOver("css=ul#header-menu > li#"+id);	
    	List<WebElement> sub = elem.get(menu).findElements(By.cssSelector("#"+id+" ul> li"));
    	
    	if (sub.get(submenu) == null) {
    		return;
    	}
 		
    	String subid = sub.get(submenu).getAttribute("id");
    	selenium.mouseOver("css=li#"+subid + " > a");
    	selenium.click("css=li#"+subid + " > a");
		selenium.mouseOut("css=ul#header-menu > li#"+id + " > ul > li#"+subid+ "> a");
   		selenium.mouseOut("css=ul#header-menu > li#"+id);
	}
	
	@BeforeMethod
	public void startSelenium() {
		driver = new FirefoxDriver();
		selenium = new WebJQueryDriverBackedSelenium(driver, "https://mail.google.com/");
		dialogManager = new DialogManager();
		dialogManager.init(selenium, driver);

		// Open the page and skip first dilogs
		selenium.open("file:///C:/Users/aea301/Desktop/Diagrammer/GITHUB/umlsync/diagrammer/index2.html");
		selenium.click("xpath=(//button[@type='button'])[6]");
		selenium.click("xpath=(//button[@type='button'])[4]");
	}

	@AfterMethod
	public void stopSelenium() {
		driver.close();
	}

	@Test
	public void testFileMenuHover() {
		List<WebElement> elem = driver.findElements(By.cssSelector("ul#header-menu > li"));

		// Test TOP MENU HOVER
    	for (int i=0; i<elem.size(); ++i) {
    		String id = elem.get(i).getAttribute("id");
    		selenium.mouseOver("css=ul#header-menu > li#"+id);	
    		try {
				Thread.sleep(300);
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
    		selenium.mouseOut("css=ul#header-menu > li#"+id);
    	}
    	
    	// Test sub-menu hovers
    	for (int i=0; i<elem.size(); ++i) {
    		String id = elem.get(i).getAttribute("id");
    		selenium.mouseOver("css=ul#header-menu > li#"+id);	
    		List<WebElement> sub = elem.get(i).findElements(By.cssSelector("#"+id+" ul> li"));
    		for (int j=0; j<sub.size(); ++j) {
    			String subid = sub.get(j).getAttribute("id");
    			selenium.mouseOver("css=li#"+subid + " > a");
        		try {
    				Thread.sleep(400);
    			} catch (InterruptedException e) {
    				e.printStackTrace();
    			}
        		selenium.mouseOut("css=ul#header-menu > li#"+id + " > ul > li#"+subid+ "> a");
    		}
    		selenium.mouseOut("css=ul#header-menu > li#"+id);
    	}
	}

	@Test
	public void testProjectMenuDialogs() {
		List<WebElement> elem = driver.findElements(By.cssSelector("ul#header-menu > li"));

		
    	// Test sub-menu hovers
    	for (int i=0; i<=0; ++i) { // First item only
    		String id = elem.get(i).getAttribute("id");
    		selenium.mouseOver("css=ul#header-menu > li#"+id);	
    		List<WebElement> sub = elem.get(i).findElements(By.cssSelector("#"+id+" ul> li"));
    		for (int j=0; j<sub.size(); ++j) {
    			String subid = sub.get(j).getAttribute("id");
    			selenium.mouseOver("css=li#"+subid + " > a");
    			selenium.click("css=li#"+subid + " > a");

    			try {
    				Thread.sleep(400);
    			} catch (InterruptedException e) {
    				e.printStackTrace();
    			}

    			switch (j)
    			{
				case 0:
					if (dialogManager.IsDialogActive("RepoSelection")) {
						dialogManager.Cancel("RepoSelection");
					}
					break;
				case 1:
					if (dialogManager.IsDialogActive("NewProject")) {
						dialogManager.Cancel("NewProject");
					}
					break;
				case 2:
					if (dialogManager.IsDialogActive("NewDiagram")) {
						dialogManager.Cancel("NewDiagram");
					}
					break;
				case 3:
					if (dialogManager.IsDialogActive("NewGist")) {
						dialogManager.Cancel("NewGist");
					}
					break;
    					
    				default:
    					break;
    			}
        		
    			selenium.mouseOut("css=ul#header-menu > li#"+id + " > ul > li#"+subid+ "> a");
    		}
    		selenium.mouseOut("css=ul#header-menu > li#"+id);
    	}		
		
	}

}
