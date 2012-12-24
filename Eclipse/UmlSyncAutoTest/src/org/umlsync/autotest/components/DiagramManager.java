package org.umlsync.autotest.components;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.umlsync.autotest.components.elements.Diagram;
import org.umlsync.autotest.selenium.TSeleniumClient;

public class DiagramManager extends TSeleniumClient {
	private EditorFramework framework;
	private List<Diagram> diagrams = new ArrayList<Diagram>();

	public DiagramManager(EditorFramework fw) {
		framework = fw;		
	}
	
	private String GetActiveDiagramHeaderId() {
		WebElement elem = driver.findElement(By.cssSelector("#tabs ul.ui-tabs-nav > li.ui-state-active > a"));
		if (elem != null) {
			String text = elem.getText();
			String id = elem.getAttribute("href");
			String[] sid = id.split("\\#");
			if (sid.length == 2) {
				return sid[1];
			}
		}
		return null;
	}
	
	private String GetEuidByHeaderId(String hid) {
		WebElement elem = driver.findElement(By.id(hid));
		if (elem != null) {
			WebElement e = elem.findElement(By.tagName("DIV"));
			if (e != null) {
				String euid = e.getAttribute("id");
				return euid;
			}
		}
		return null;
	}

	public Diagram CreateDiagram(String type, String name) {
		framework.GetFileMenuHandler().Click("Project|New diagram");
		framework.GetDialogManager().Select("NewDiagram", type);
		framework.GetDialogManager().Input("NewDiagram", name);
		framework.GetDialogManager().Ok("NewDiagram");

		String hid = GetActiveDiagramHeaderId();
		String euid = GetEuidByHeaderId(hid);
		if (euid != null && hid != null) {
		  Diagram d = new Diagram(euid, hid);
		  diagrams.add(d);
		  this.addClient(d);
		  return d;
		}
		return null;
	}

	public Diagram OpenDiagram(String path) {
		return null;
	}

	public void CloseDiagram(Diagram d) {
		if (d != null)  {

		}
	}

	public void ActivateDiagram(Diagram d) {
		List<WebElement> elems = driver.findElements(By.cssSelector("#tabs ul.ui-tabs-nav > li > a"));
		if (!elems.isEmpty()) {
			Iterator<WebElement> i = elems.iterator();
			for (;i.hasNext();) {
				WebElement elem = i.next();
				String text = elem.getText();
				String id = elem.getAttribute("href");
				if (id != null && !id.isEmpty()) {
				  String[] sid = id.split("\\#");
				  if (sid.length == 2 && sid[1].equals(d.headerId)) {
					
					  if (elem.isDisplayed())
						  elem.click();

					break;
				  }
				}
				
			}
		}
	}

	public boolean IsDiagramActive(Diagram d) {
		return (d.headerId.endsWith(GetActiveDiagramHeaderId()));
	}
	
	public List<Diagram> GetAllDiagrams() {
		return diagrams;
	}

	
}
