package org.umlsync.autotest.components;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.umlsync.autotest.components.elements.Diagram;
import org.umlsync.autotest.selenium.TSeleniumClient;

import com.thoughtworks.selenium.Selenium;

public class EditorFramework extends TSeleniumClient {
	private FileMenuHandler fileMenuHandler;
	private DialogManager dialogManager;
	private DiagramMenuHandler diagramMenuHandler;
	private DiagramManager diagramManager;

	public EditorFramework() {
		dialogManager = new DialogManager();
		fileMenuHandler = new FileMenuHandler();
		diagramMenuHandler = new DiagramMenuHandler();
		diagramManager = new DiagramManager(this);

		this.addClient(dialogManager);
		this.addClient(fileMenuHandler);
		this.addClient(diagramMenuHandler);
		this.addClient(diagramManager);
	}

	public FileMenuHandler GetFileMenuHandler() {
		return fileMenuHandler;
	}
	
	public  DiagramMenuHandler GetDiagramMenuHandler() {
		return diagramMenuHandler;
	}
	
	public DialogManager GetDialogManager() {
		return dialogManager;
	}
	
	public DiagramManager GetDiagramManager() {
		return diagramManager;
	}

	public void Maximize() {
		driver.manage().window().maximize();
	}
}
