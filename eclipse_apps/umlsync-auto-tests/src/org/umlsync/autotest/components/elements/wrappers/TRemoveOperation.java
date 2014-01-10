package org.umlsync.autotest.components.elements.wrappers;

import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;

import org.umlsync.autotest.components.elements.Element;
import org.umlsync.autotest.components.handlers.IOperation;

public class TRemoveOperation extends IOperation {

	private Element element;
	private IStatus state;

	TRemoveOperation(Element e) {
		element = e;
		state = element.GetElementWrapper().GetStatus("resize");
		element.GetDiagram().ElementsListChange(element, true);
	}
	
	public void Destructor() {
	  element.GetDiagram().ElementsListChange(element, true);
	}

	@Override
	public boolean RevertCheck() {
		element.GetDiagram().ElementsListChange(element, false);
		return element.GetElementWrapper().isDisplayed() && state.Check(element);
	}

	@Override
	public boolean RepeatCheck() {
		element.GetDiagram().ElementsListChange(element, true);
		return !element.GetElementWrapper().isDisplayed();
		
	}

	@Override
	public boolean Complete() {
		return true;
	}
};
