package org.umlsync.autotest.filemenu;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxDriver;

import org.testng.Assert;
import org.testng.annotations.AfterSuite;
import org.testng.annotations.BeforeSuite;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

import org.umlsync.autotest.components.DialogManager;
import org.umlsync.autotest.components.FileMenuHandler;
import org.umlsync.autotest.selenium.WebJQueryDriverBackedSelenium;

import com.thoughtworks.selenium.Selenium;

public class TestFileMenuHandler {
	WebDriver driver;
	Selenium selenium;
	private DialogManager dialogManager;
	FileMenuHandler fileMenuHandler = null;

	@BeforeSuite
	public void startSelenium() {
		driver = new FirefoxDriver();
		selenium = new WebJQueryDriverBackedSelenium(driver, AutomatedTestConfiguration.EDITOR_BASE_URL);

		dialogManager = new DialogManager();
		dialogManager.init(selenium, driver);

		fileMenuHandler = new FileMenuHandler();
		fileMenuHandler.init(selenium, driver);

		// Open the page and skip first dialogs
		selenium.open(AutomatedTestConfiguration.EDITOR_URL);
		dialogManager.CancelAll();
	}

	@AfterSuite
	public void stopSelenium() {
		driver.close();
	}

	@DataProvider(name = "MouseOverData")
	public Object[][] MouseOverData() {
		return new Object[][]{
				{"Project", "css=#file-menu_0"},
				{"Actions", "css=#file-menu_1"},
				{"Edit", "css=#file-menu_2"},
				{"Views", "css=#file-menu_3"},
				{"Project|Change repository", "css=#file-menu_0_0 > a"},
				{"Project|Change branch", "css=#file-menu_0_1 > a"},
				{"Project|New diagram", "css=#file-menu_0_2 > a"},
				{"Project|New gist diagram", "css=#file-menu_0_3 > a"}};
	}

	@Test(dataProvider = "MouseOverData")	  
	public void testFileMenu_MenuHover(String menu, String id) {
		Assert.assertEquals(fileMenuHandler.MouseOver(menu), id);
		Assert.assertEquals(fileMenuHandler.MouseOut(menu), id);
	}

	@DataProvider(name = "ProjectMenusData")
	public Object[][] ProjectMenusData() {
		return new Object[][]{
				{"Project|Change repository", "RepoSelection"},
				{"Project|Change branch", "NewProject"},
				{"Project|New diagram", "NewDiagram"},
				{"Project|New gist diagram", "NewGist"}};
	}
	

	@Test(dataProvider = "ProjectMenusData")	  
	public void testFileMenu_ProjectDialogs(String menuPath, String dialogId) {

		fileMenuHandler.Click(menuPath);

		Assert.assertEquals(dialogManager.IsDialogActive(dialogId), true);

		dialogManager.Cancel(dialogId);

		Assert.assertEquals(dialogManager.IsDialogActive(dialogId), false);
	}
	
	@DataProvider(name = "NewDiagramSelectorsData")
	public Object[][] NewDiagramSelectorsData() {
		return new Object[][]{
				{"Project|New diagram",
				 "NewDiagram",
				 "UML class diagram|UML component diagram|UML package diagram|UML sequence diagram|Common objects diagram"}};

	}
	
	@Test(dataProvider = "NewDiagramSelectorsData")	  
	public void testFileMenu_ProjectDialogsSelectors(String menuPath, String dialogId, String itemList) {
		String[] items = itemList.split("\\|");

		fileMenuHandler.Click(menuPath);

		Assert.assertEquals(dialogManager.IsDialogActive(dialogId), true);

		for (int i=0; i<items.length;++i) {
			dialogManager.Select(dialogId, items[i]);
			dialogManager.Input(dialogId, items[i]+"_1");
			String input = dialogManager.GetInput(dialogId);
			Assert.assertEquals((input!=null && input.contains(items[i]+"_1")), true);
		  
		}

		dialogManager.Cancel(dialogId);

		Assert.assertEquals(dialogManager.IsDialogActive(dialogId), false);
	}
}
