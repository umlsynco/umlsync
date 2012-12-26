package org.umlsync.autotest.components.handlers;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class TOperationAggregator extends IOperation {
	private List<IOperation> operations = new ArrayList<IOperation>(); 
	
	public void Add(IOperation op) {
		operations.add(op);
	}
	
	@Override
	public boolean Complete() {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public boolean RevertCheck() {
		boolean result = true;
		Iterator<IOperation> iter = operations.iterator();
		while (iter.hasNext()) {
			result &= iter.next().RevertCheck();
		}
		
		return result;
	}

	@Override
	public boolean RepeatCheck() {
		boolean result = true;
		Iterator<IOperation> iter = operations.iterator();
		while (iter.hasNext()) {
			result &= iter.next().RepeatCheck();
		}
		
		return result;
	}

}
