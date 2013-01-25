"""
Custom JSON to SVG converter.
"""
import json
import math
import pprint
from optparse import OptionParser
import svgwrite as sw


class SVGClass(sw.container.Group):
    """
    Represent Class element grouping several SVG primitives.
    """
    text_height = 15

    def __init__(self, properties):
        sw.container.Group.__init__(self)
        self.x = float(properties["pageX"])
        self.y = float(properties["pageY"])
        self.width = float(properties["width"])
        self.height = float(properties["height"])
        self.height_a = float(properties["height_a"])
        self.height_o = float(properties["height_o"])
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
        for i, attribute in enumerate(properties["attributes"]):
            start = (self.x, self.y + 10 + self.height_a * i)
            att = sw.shapes.Rect(insert=start,
                                 size=(self.width, self.height_a),
                                 fill='gray', stroke='black', stroke_width=1)
            text_start = (self.x + 5, self.y + 10 + self.height_a * i +
                          self.text_height)
            text = sw.text.Text(insert=text_start,
                                text=attribute)
            self.add(att)
            self.add(text)
        for i, operation in enumerate(properties["operations"]):
            start = (self.x, self.y + 10 + self.height_o * i +
                     self.height_a * len(properties["attributes"]))
            op = sw.shapes.Rect(insert=start,
                                size=(self.width, self.height_o),
                                fill='whitesmoke', stroke='black',
                                stroke_width=1)
            text_start = (self.x + 5, self.y + 10 + self.height_o * i +
                          self.height_a * len(properties["attributes"]) +
                          self.text_height)
            text = sw.text.Text(insert=text_start,
                                text=operation)
            self.add(op)
            self.add(text)

    def get_coords(self):
        pass


class SVGConnector(sw.container.Group):
    """Represent connection element."""
    angle = math.pi / 8
    arrow_length = 15

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
                                  end=points[i + 1],
                                  stroke='black', stroke_width=1)
            self.add(line)
            if i == len(points) - 2:
                # draw an arrow
                (x1, y1) = points[i]
                (x2, y2) = points[i + 1]
                length = ((x1 - x2)**2 + (y2 - y1)**2)**0.5
                vec = ((x1 - x2) / length, (y1 - y2) / length)
                arrow = (vec[0] * math.cos(self.angle) +
                         vec[1] * math.sin(-self.angle),
                         vec[0] * math.sin(self.angle) +
                         vec[1] * math.cos(self.angle))
                arrow_dots = (x2 + arrow[0] * self.arrow_length,
                              y2 + arrow[1] * self.arrow_length)
                line = sw.shapes.Line(start=points[i + 1],
                                      end=arrow_dots,
                                      stroke='black', stroke_width=1)
                self.add(line)
                arrow = (vec[0] * math.cos(-self.angle) +
                         vec[1] * math.sin(self.angle),
                         vec[0] * math.sin(-self.angle) +
                         vec[1] * math.cos(-self.angle))
                arrow_dots = (x2 + arrow[0] * self.arrow_length,
                              y2 + arrow[1] * self.arrow_length)
                line = sw.shapes.Line(start=points[i + 1],
                                      end=arrow_dots,
                                      stroke='black', stroke_width=1)
                self.add(line)


class CustomJSONtoSVGConverter:
    def __init__(self):
        pass

    def load(self, filename):
        """Read and parse JSON file."""
        with open(filename) as f:
            self.json_data = json.load(f)
            pprint.pprint(self.json_data)

    def load_data(self, contents):
        self.json_data = json.loads(contents)

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
    parser = OptionParser()
    parser.add_option("-f", "--file", dest="input_file",
                      help="name of the input file")
    parser.add_option("-r", "--result", dest="output_file",
                      help="name of the output file")
    (options, args) = parser.parse_args()
    converter = CustomJSONtoSVGConverter()
    #input_file = options.input_file
    #output_file = options.output_file
    input_file = "test.json"
    output_file = "test.svg"
    #converter.load(input_file)
    contents = r"""{"type":"class","name":"classDiagram"}"""
    converter.load_data(contents)
    converter.dump(output_file)
