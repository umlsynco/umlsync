package org.umlsync.autotest.selenium;

import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.remote.ExecuteMethod;

public class FirefoxDriverWrapper extends FirefoxDriver {
	public ExecuteMethod getExecuteMethodPublic() {
		return super.getExecuteMethod();
	}
}
