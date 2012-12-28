package org.umlsync.autotest.selenium;

import org.openqa.selenium.HasInputDevices;
import org.openqa.selenium.Mouse;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.interactions.ContextClickAction;
import org.openqa.selenium.interactions.internal.Coordinates;
import org.openqa.selenium.internal.Locatable;
import org.openqa.selenium.remote.RemoteWebDriver;


public class ActionsWrapper extends Actions {

	public ActionsWrapper(WebDriver driver, Mouse m) {
		super(( (HasInputDevices) driver).getKeyboard(), m);

	}

	public ActionsWrapper contextClickAt(WebElement onElement, long x, long y) {
		action.addAction(new ContextClickAtAction(mouse, (Locatable) onElement, x, y));
		return this;
	}

}
