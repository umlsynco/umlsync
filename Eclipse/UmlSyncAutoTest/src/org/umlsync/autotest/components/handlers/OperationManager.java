package org.umlsync.autotest.components.handlers;

import java.util.ArrayList;
import java.util.List;

import org.umlsync.autotest.components.elements.Diagram;
import org.umlsync.autotest.selenium.TSeleniumClient;

public class OperationManager extends TSeleniumClient {
	private Diagram parent;
	private List<IOperation> operations = new ArrayList<IOperation>();
	private List<IOperation> reverted = new ArrayList<IOperation>();

	public OperationManager(Diagram d) {
		parent = d;
		d.addClient(this);
	}
	
	public void ReportOperation(IOperation op) {
		operations.add(op);
		reverted.clear();
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
