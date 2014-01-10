package org.umlsync.autotest.selenium;

import org.openqa.selenium.Mouse;
import org.openqa.selenium.interactions.Action;
import org.openqa.selenium.interactions.ContextClickAction;
import org.openqa.selenium.interactions.internal.Coordinates;
import org.openqa.selenium.interactions.internal.MouseAction;
import org.openqa.selenium.internal.Locatable;

public class ContextClickAtAction extends ContextClickAction{
	private long offsetX, offsetY;
	public ContextClickAtAction(Mouse mouse, Locatable where, long x, long y) {
		super(mouse, where);
		offsetX = x;
		offsetY = y;
	}

	/**
	 * Emulates clicking on the mouse button that would bring up contextual menus (usually
	 * right-clicking).
	 */
	public void perform() {
		//moveToLocation();
		mouse.mouseMove(getActionLocation(), offsetX, offsetY);
		mouse.contextClick(getActionLocation());
	}

}