package org.umlsync.autotest.components.handlers;

import java.lang.reflect.Type;
import java.lang.reflect.ParameterizedType;

public abstract class IOperation<T> {
	public abstract boolean Complete();
	public abstract boolean RevertCheck();
	public abstract boolean RepeatCheck();
}
