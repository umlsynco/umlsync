package org.umlsync.autotest.components.elements.wrappers;

import org.umlsync.autotest.components.elements.Element;

public abstract class IStatus {
	public abstract boolean Check(Element e);
	public IStatus New() {
		return null;
	};
}
