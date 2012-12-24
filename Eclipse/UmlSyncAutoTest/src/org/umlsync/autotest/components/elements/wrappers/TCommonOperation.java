package org.umlsync.autotest.components.elements.wrappers;

import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;

import org.umlsync.autotest.components.elements.Element;
import org.umlsync.autotest.components.handlers.IOperation;

public final class TCommonOperation extends IOperation {

	private Element element;
	private IStatus before, after;
	private String name;

	TCommonOperation(String type, Element e) {
		element = e;
		name = type;
		before = element.GetElementWrapper().GetStatus(type);
	}

	@Override
	public boolean RevertCheck() {
		return before.Check(element);
	}

	@Override
	public boolean RepeatCheck() {
		return after.Check(element);
	}

	@Override
	public boolean Complete() {
		after = element.GetElementWrapper().GetStatus(name);
		return true;
	}

	public boolean Init() {
		return false;
	}
};
