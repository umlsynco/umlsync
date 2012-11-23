package org.umlsync.autotest.components;

import org.openqa.selenium.WebDriver;

import com.thoughtworks.selenium.Selenium;

public class DialogManager {

	private Selenium Selenium;
	private WebDriver BaseDriver;

	public DialogManager(Selenium selenium, WebDriver driver) {
		Selenium = selenium;
		BaseDriver = driver;	
	}
	
	public boolean IsDialogActive(String name) {
		if (name == "NewDiagram") {
			return Selenium.isVisible("id=new-diagram-dialog");
		}
		else if (name == "NewProject") {
			return Selenium.isVisible("id=new-project-dialog");
		} 
		else if (name == "RepoSelection") {
			return Selenium.isVisible("id=repo-selection-dialog");
		} 
		else if (name == "NewGist") {
			return Selenium.isVisible("id=new-diagram-dialog");
		} 
		
		return false;
	}

	public void Cancel(String name) {
		if (name == "NewDiagram") {
			Selenium.click("xpath=(//button[@type='button'])[4]");
		}
		else if (name == "NewProject") {
			Selenium.click("xpath=(//button[@type='button'])[2]");
		} 
		else if (name == "RepoSelection") {
			Selenium.click("xpath=(//button[@type='button'])[6]");
		} 
		else if (name == "NewGist") {
			Selenium.click("xpath=(//button[@type='button'])[4]");
		}		
	}

}
