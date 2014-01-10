package org.umlsync.autotest.selenium;

import org.openqa.selenium.Mouse;
import org.openqa.selenium.interactions.internal.Coordinates;
import org.openqa.selenium.remote.CommandExecutor;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.ExecuteMethod;
import org.openqa.selenium.remote.RemoteWebDriver;

import com.google.common.collect.ImmutableMap;

public class MouseWrapper implements Mouse {
	Mouse my;
	private boolean skipMove = false;
	private ExecuteMethod executor;

	public MouseWrapper(ExecuteMethod ex, Mouse base) {
		my = base;
		executor = ex;
	}
	
	@Override
	public void click(Coordinates where) {
		my.click(where);
	}

	@Override
	public void doubleClick(Coordinates where) {
		my.doubleClick(where);

	}

	@Override
	public void mouseDown(Coordinates where) {
		my.mouseDown(where);

	}

	@Override
	public void mouseUp(Coordinates where) {
		my.mouseUp(where);

	}

	@Override
	public void mouseMove(Coordinates where) {
		if (!skipMove)
		  my.mouseMove(where);
	}

	@Override
	public void mouseMove(Coordinates where, long xOffset, long yOffset) {
		my.mouseMove(where, xOffset, yOffset);

	}

	@Override
	public void contextClick(Coordinates where) {
		executor.execute(DriverCommand.CLICK, ImmutableMap.of("button", 2));
	}

};
