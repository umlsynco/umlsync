package org.umlsync.autotest.components.handlers;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import org.umlsync.autotest.components.elements.Diagram;
import org.umlsync.autotest.selenium.TSeleniumClient;

public class OperationManager extends TSeleniumClient {
	private Diagram parent;
	private List<IOperation> operations = new ArrayList<IOperation>();
	private List<IOperation> reverted = new ArrayList<IOperation>();
	
	private boolean isMultipleOperation = false;
	private TOperationAggregator aggregator = null;

	public OperationManager(Diagram d) {
		parent = d;
		d.addClient(this);
	}
	
	public void StartTransaction() {
		isMultipleOperation = true;
		aggregator = new TOperationAggregator();
	}

	public void StopTransaction() {
		isMultipleOperation = false;
		
		operations.add(aggregator);

		ReduceQueue();
		
		aggregator = null;
	}
	
	private void ReduceQueue() {
		Iterator<IOperation> iter = reverted.iterator();
		while (iter.hasNext()) {
			iter.next().Destructor();
		}
		
		if (operations.size() > 20) {
			operations.remove(0).Destructor();
		}
		reverted.clear();
	}

	public void ReportOperation(IOperation op) {
		if (isMultipleOperation) {
			aggregator.Add(op);
		} else {
		  operations.add(op);
		  ReduceQueue();
		}
	}
	
	public boolean RevertOperation(int stepsCount) {
		while (stepsCount >0) {
			stepsCount--;
			if (operations.size() == 0) {
				return false;
			}

			// Send key sequence
			parent.GetKeyHandler().Revert();
			
			// Check status
			IOperation next = operations.remove(operations.size()-1);
			reverted.add(next);
			if (!next.RevertCheck()) {
				return false;
			}
		}
		return true;
	}
	
	public boolean RepeatOperation(int stepsCount) {
		while (stepsCount >0) {
			stepsCount--;
			if (reverted.size() == 0) {
				return false;
			}

			// Send key
			parent.GetKeyHandler().Repeat();

			// Check status
			IOperation next = reverted.remove(reverted.size()-1);
			operations.add(next);
			if (!next.RepeatCheck()) {
				return false;
			}
		}
		return true;
	}

}
