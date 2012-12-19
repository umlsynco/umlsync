package org.umlsync.autotest.components;

import org.openqa.selenium.WebDriver;
import org.testng.Assert;
import org.umlsync.autotest.selenium.TSeleniumClient;

import com.thoughtworks.selenium.Selenium;

public class FileMenuHandler extends TSeleniumClient {
	String[][]  MenuPath = null;
	
	public FileMenuHandler() {
		MenuPath = new String[][] {{"Project", "Change repository","Change branch","New diagram", "New gist diagram"},
				{"Actions", "Post for review"},
				{"Edit","Un-do", "Re-do", "Cut", "Copy", "Past", "Delete", "Select All"},
				{"Views","Google code", "Sourceforege", "Github", "Eclipse"}};
	}

	public String GetLocator(String path) {
		String[] sPath = path.split("\\|");
		String locator = null;
		int pos = -1;

		// At least first item should be on place 
		for (int i=0; i<MenuPath.length; ++i) {
			if (MenuPath[i][0].equals(sPath[0])) {
				locator = "css=#file-menu_" + i;
				pos = i;
				break;
			}
		}
		
		boolean found = true;
		if (sPath.length == 2 && pos >=0) {
			found = false;
			for (int i=1; i<MenuPath[pos].length; ++i) {
				if (MenuPath[pos][i].equals(sPath[1])) {
					locator += "_"+(i-1) + " > a";
					found = true;
					break;
				}
			}
		}
		return found  ? locator : null;
	}
	
	public String MouseOver(String path) {
		String locator = GetLocator(path);
		if (locator != null) {
			selenium.mouseOver(locator);
		}
		
		return locator;
	}
	
	
	public String MouseOut(String path) {
		String locator = GetLocator(path);
		if (locator != null) {
			selenium.mouseOut(locator);
		}
		
		return locator;
	}
	
	public String Click(String path) {
		String[] sm = path.split("\\|");
		Assert.assertEquals(sm.length, 2);

		String locator = GetLocator(path);
		if (locator != null) {
			MouseOver(sm[0]);
			MouseOver(path);
			selenium.click(locator);
			MouseOut(path);
		}
		
		return locator;
	}
};