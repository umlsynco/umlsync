package org.umlsync.autotest.components.elements;

import org.openqa.selenium.WebDriver;
import org.umlsync.autotest.components.elements.wrappers.ElementWrapper;
import org.umlsync.autotest.selenium.TSeleniumClient;

import com.thoughtworks.selenium.Selenium;

public class Element extends TSeleniumClient {
	private String borderId;
	public String euid;
	public String diagramId;
	private Diagram parent;
	protected ElementWrapper elementWrapper = null;

	public Element(String id, Diagram diagram) {
		borderId = id;
		euid = borderId.substring(0, borderId.indexOf("_Border"));
		diagramId = diagram.GetLocator();
		parent = diagram;

		diagram.addClient(this);
		GetElementWrapper();
	}
	
	public ElementWrapper GetElementWrapper() {
		if (elementWrapper == null)
		  elementWrapper = new ElementWrapper(this);
		return elementWrapper;
	}
	
	

	/*
	 * Get parent diagram which element belong to.
	 * @return parent Diagram class
	 */
	public Diagram getParent() {
		return parent;
	}

	/**
	 * Find and element with id=name and get the text
	 * 
	 * @return element #name field
	 */
	public String GetName() {
		return null;	
	}

	/**
	 * Find and element with id=name and set the text
	 * 
	 * @param text element #name field
	 */
	public void SetName(String text) {

	}

	/**
	 * Each element could be identified by locator
	 * 
	 * @return an element locator
	 */
	public String GetLocator() {
		return borderId;
	}
	
	/**
	 * Each element wraps with border 
	 * 
	 * @return an element's border locator
	 */
	public String GetBorderLocator() {
		return this.borderId;
	}
	
	/**
	 * Each element could be identified by the "ElementUniqueID"
	 * 
	 * @return an element "euid" which is unique for browser session 
	 */
	public String GetEuid() {
		return this.euid;
	}

}
