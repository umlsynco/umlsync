package org.umlsync.autotest.components.elements;

import org.umlsync.autotest.components.elements.wrappers.ClassWrapper;
import org.umlsync.autotest.components.elements.wrappers.ElementWrapper;

public class ClassElement extends Element {

	public ClassElement(String id, Diagram diagram) {
		super(id, diagram);
	}

	public ElementWrapper GetElementWrapper() {
		if (elementWrapper == null)
		  elementWrapper = new ClassWrapper(this);
		return elementWrapper;
	}

}
