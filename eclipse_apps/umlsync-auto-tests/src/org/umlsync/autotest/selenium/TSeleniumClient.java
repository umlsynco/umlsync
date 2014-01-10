package org.umlsync.autotest.selenium;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import org.openqa.selenium.WebDriver;

import com.thoughtworks.selenium.Selenium;

public class TSeleniumClient {
	protected Selenium selenium;
	protected WebDriver driver;
	private boolean isActivated = false;
	
	private List<TSeleniumClient> clients = new ArrayList<TSeleniumClient>();

	public TSeleniumClient() {}
	
	public void addClient(TSeleniumClient client) {
		clients.add(client);
		if (isActivated) {
			client.init(selenium, driver);
		}
	}
	
	public void removeClient(TSeleniumClient client) {
		clients.remove(client);
	}
	
	public void init(Selenium sel, WebDriver drv) {
		if (isActivated) {
			return;
		}

		selenium = sel;
		driver = drv;
		isActivated = true;
		
		Iterator<TSeleniumClient> iter = clients.iterator();
		while (iter.hasNext()) {
			iter.next().init(selenium, driver);
		}
	}	
	
}
