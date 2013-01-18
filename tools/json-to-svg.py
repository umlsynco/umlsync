"""
Custom JSON to SVG converter.
"""
import json
import pprint
import svgwrite as sw


class SVGClass(sw.container.Group):
    """
    Represent Class element grouping several SVG primitives.
    """
    def __init__(self, properties):
        sw.container.Group.__init__(self)
        self.x = properties["pageX"]
        self.y = properties["pageY"]
        self.width = properties["width"]
        self.height = properties["height"]
        body = sw.shapes.Rect(insert=(self.x, self.y),
                              size=(self.width, self.height),
                              fill='white', stroke='black', stroke_width=1)
        caption = sw.shapes.Rect(insert=(self.x, self.y),
                                 size=(self.width, 10),
                                 fill='white', stroke='black', stroke_width=1)
        self.center_x = str(float(self.x) + float(self.width) / 2)
        self.center_y = str(float(self.y) + float(self.height) / 2)
        self.add(body)
        self.add(caption)

    def get_coords(self):
        pass


class SVGConnector(sw.container.Group):
    """Represent connection element."""
    def __init__(self, properties, start, end):
        sw.container.Group.__init__(self)
        self.from_id = properties["fromId"]
        self.to_id = properties["toId"]
        self.epoints = properties["epoints"]
        line = sw.shapes.Line(start=(start.center_x, start.center_y),
                              end=(end.center_x, end.center_y),
                              stroke='black', stroke_width=1)
        self.add(line)


class CustomJSONtoSVGConverter:
    def __init__(self):
        pass

    def load(self, filename):
        """Read and parse JSON file."""
        with open(filename) as f:
            self.json_data = json.load(f)
            #pprint.pprint(self.json_data)

    def dump(self, filename):
        """Convert JSON to SVG."""
        dwg = sw.Drawing(filename=filename, debug=True)
        elements = {}
        for element in self.json_data["elements"]:
            if element["type"] == "class":
                svg_class = SVGClass(element)
                elements[element["id"]] = svg_class
                dwg.add(svg_class)

        for connector in self.json_data["connectors"]:
            start = elements[connector["toId"]]
            end = elements[connector["fromId"]]
            svg_connector = SVGConnector(connector, start, end)
            dwg.add(svg_connector)
        dwg.save()


if __name__ == '__main__':
    converter = CustomJSONtoSVGConverter()
    converter.load("test.json")
    converter.dump("test.svg")
