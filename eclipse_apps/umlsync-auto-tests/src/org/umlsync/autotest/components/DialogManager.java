package org.umlsync.autotest.components;

import org.umlsync.autotest.selenium.TSeleniumClient;

public class DialogManager extends TSeleniumClient {

	public DialogManager() {
	}
	
	public boolean IsDialogActive(String name) {
		if (name == "NewDiagram") {
			return selenium.isVisible("id=new-diagram-dialog");
		}
		else if (name == "NewProject") {
			return selenium.isVisible("id=new-project-dialog");
		} 
		else if (name == "RepoSelection") {
			return selenium.isVisible("id=repo-selection-dialog");
		} 
		else if (name == "NewGist") {
			return selenium.isVisible("id=new-diagram-dialog");
		} 
		
		return false;
	}

	public void Cancel(String name) {
		if (name == "NewDiagram") {
			selenium.click("xpath=(//button[@type='button'])[4]");
		}
		else if (name == "NewProject") {
			selenium.click("xpath=(//button[@type='button'])[2]");
		} 
		else if (name == "RepoSelection") {
			selenium.click("xpath=(//button[@type='button'])[6]");
		} 
		else if (name == "NewGist") {
			selenium.click("xpath=(//button[@type='button'])[4]");
		}		
	}
	
	public void CancelAll() {
		if (selenium.isVisible("id=new-diagram-dialog")) {
			selenium.click("xpath=(//button[@type='button'])[4]");
		}
		
		if (selenium.isVisible("id=new-project-dialog")) {
			selenium.click("xpath=(//button[@type='button'])[2]");
		}
		
		if (selenium.isElementPresent("id=repo-selection-dialog") && selenium.isVisible("id=repo-selection-dialog")) {
			selenium.click("xpath=(//button[@type='button'])[6]");
		}
		
		if (selenium.isVisible("id=new-diagram-dialog")) {
			selenium.click("xpath=(//button[@type='button'])[4]");
		}
	}
	
	public void Select(String name, String item) {
		if (!IsDialogActive(name)) {
			return;
		}
		selenium.click("link=" + item);
	}
	
	public void Input(String name, String item) {
		if (!IsDialogActive(name)) {
			return;
		}
		if (name == "NewDiagram") {
			selenium.keyPress("css=input#VP_inputselector", item);
		}
		else if (name == "NewProject") {
			selenium.keyPress("css=input#name", item);
		} 
		else if (name == "RepoSelection") {
		} 
		else if (name == "NewGist") {
			selenium.keyPress("css=input#VP_inputselector", item);
		}		
	}
	
	public String GetInput(String name) {
		if (!IsDialogActive(name)) {
			return null;
		}
		
		if (name == "NewDiagram" || name == "NewGist") { 
			String tmp = selenium.getValue("css=input#VP_inputselector");
			return tmp;
		}
		if (name == "NewProject") {
			return selenium.getText("css=input#name");
		}
		return null;
	}

	public void Ok(String name) {
		if (name == "NewDiagram") {
			selenium.click("xpath=(//button[@type='button'])[3]");
		}
		else if (name == "NewProject") {
			selenium.click("xpath=(//button[@type='button'])[1]");
		} 
		else if (name == "RepoSelection") {
			selenium.click("xpath=(//button[@type='button'])[5]");
		} 
		else if (name == "NewGist") {
			selenium.click("xpath=(//button[@type='button'])[3]");
		}
	}
}
