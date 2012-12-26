package org.umlsync.autotest.components.elements.wrappers;

import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;

import org.umlsync.autotest.components.elements.Element;
import org.umlsync.autotest.components.handlers.IOperation;

public class TCreateOperation extends IOperation {

	private Element element;
	private IStatus state;

	TCreateOperation(Element e) {
		element = e;
		state = element.GetElementWrapper().GetStatus("resize");
	}

	@Override
	public boolean RevertCheck() {
		return !element.GetElementWrapper().isDisplayed();
	}

	@Override
	public boolean RepeatCheck() {
		return element.GetElementWrapper().isDisplayed() && state.Check(element);
	}

	@Override
	public boolean Complete() {
		return true;
	}
};
