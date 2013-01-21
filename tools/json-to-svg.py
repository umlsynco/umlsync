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
        self.x = float(properties["pageX"])
        self.y = float(properties["pageY"])
        self.width = float(properties["width"])
        self.height = float(properties["height"])
        self.right = self.x + self.width
        self.bottom = self.y + self.height
        body = sw.shapes.Rect(insert=(self.x, self.y),
                              size=(self.width, self.height),
                              fill='white', stroke='black', stroke_width=1)
        caption = sw.shapes.Rect(insert=(self.x, self.y),
                                 size=(self.width, 10),
                                 fill='white', stroke='black', stroke_width=1)
        self.center_x = self.x + self.width / 2.0
        self.center_y = self.y + self.height / 2.0
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
        line_cx = (start.center_x + end.center_x) / 2.0
        line_cy = (start.center_y + end.center_y) / 2.0
        if abs(start.right - line_cx) < abs(start.x - line_cx):
            line_sx = start.right
        else:
            line_sx = start.x
        if abs(end.right - line_cx) < abs(end.x - line_cx):
            line_ex = end.right
        else:
            line_ex = end.x
        if abs(start.bottom - line_cy) < abs(start.y - line_cy):
            line_sy = start.bottom
        else:
            line_sy = start.y
        if abs(end.bottom - line_cy) < abs(end.y - line_cy):
            line_ey = end.bottom
        else:
            line_ey = end.y
        points = []
        points.append((line_sx, line_sy))
        for epoint in self.epoints:
            points.append((float(epoint["0"]), float(epoint["1"])))
        points.append((line_ex, line_ey))
        for i in range(len(points) - 1):
            line = sw.shapes.Line(start=points[i],
                                  end=points[i+1],
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
