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

    def __init__(self, properties):
        self.style = "font-size:13px; font-family:Verdana,Arial,sans-serif;"
        self.font_height = 13
        self.font_line_space = 2
        self.font_width = 7
        self.text_height = self.font_height + self.font_line_space
        self.caption_height = 20

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
                              fill='#ECF3EC', stroke='black', stroke_width=1)
        caption = sw.shapes.Rect(insert=(self.x, self.y),
                                 size=(self.width, self.caption_height),
                                 fill='#ECF3EC', stroke='black', stroke_width=1)
        fields  = sw.shapes.Rect(insert=(self.x, self.y + self.height_a),
                                 size=(self.width, self.caption_height),
                                 fill='#ECF3EC', stroke='black', stroke_width=1)
        self.center_x = self.x + self.width / 2.0
        self.center_y = self.y + self.height / 2.0
        align_x = len(properties["name"])*self.font_width/2
        title = sw.text.Text(insert=(self.center_x - align_x, self.y+self.caption_height-2*self.font_line_space),
                             text=properties["name"],
                             style=self.style)
        self.add(body)
        self.add(caption)
        self.add(title)
        self.add(fields)
        for i, attribute in enumerate(properties["attributes"]):
            text_start = (self.x + 5, self.y + self.caption_height + self.text_height * i)
            text = sw.text.Text(insert=text_start,
                                text=attribute,
                                style=self.style)
            self.add(text)
        for i, operation in enumerate(properties["operations"]):
            text_start = (self.x + 5, self.y + self.caption_height + self.height_a + self.text_height * (i + 1))
            text = sw.text.Text(insert=text_start,
                                text=operation,
                                style=self.style)
            self.add(text)

    def get_coords(self):
        pass


class SVGConnector(sw.container.Group):
    """Represent connection element."""
    angle = math.pi / 8
    arrow_length = 15

    # The method of connection point detection
    # There is no fixed connection point
    # all points are flexible
    def getRValue(self, x1, x2, w):
      diffx = x2-x1;
      if (diffx>0):
        if diffx > w:
          return x1 + w
        return x2
      return x1

    def __init__(self, properties, start, end):
        sw.container.Group.__init__(self)
        self.style = "font-size:13px; font-family:Verdana,Arial,sans-serif;"
        self.draw_last_line = False
        pprint.pprint(properties["type"])

        if properties["type"] == "dependency" or properties["type"] == "realization" or properties["type"] == "anchor":
            self.dasharray = [7,3]
        else:
            self.dasharray = None

        if properties["type"] == "dependency" or properties["type"] == "anchor" or properties["type"] == "association":
            self.draw_last_line = True

        self.from_id = properties["fromId"]
        self.to_id = properties["toId"]
        self.epoints = properties["epoints"]
        line_cx = (start.center_x + end.center_x) / 2.0
        line_cy = (start.center_y + end.center_y) / 2.0

        points = []
        if len(self.epoints) == 0:
            x1 = self.getRValue(start.x, end.x, start.width)
            y1 = self.getRValue(start.y, end.y, start.height)
            x2 = self.getRValue(end.x, start.x, end.width)
            y2 = self.getRValue(end.y, start.y,  end.height)
            points.append((x1,y1))
            points.append((x2,y2))
        else:
            lln = len(self.epoints)-1
            point = self.epoints[0]
            x1 = self.getRValue(start.x, float(point["0"]), start.width)
            y1 = self.getRValue(start.y, float(point["1"]), start.height)
            point = self.epoints[lln]
            x2 = self.getRValue(end.x, float(point["0"]), end.width)
            y2 = self.getRValue(end.y, float(point["1"]), end.height)

            points.append((x1,y1))
            for epoint in self.epoints:
                points.append((float(epoint["0"]), float(epoint["1"])))
            points.append((x2,y2))

        for i in range(len(points) - 1):
            if i == len(points) - 2:
                self.draw_arrow(properties["type"], points[i], points[i+1])

            if self.draw_last_line or i != len(points) - 2:
                line = sw.shapes.Line(start=points[i],
                                      end=points[i + 1],
                                      stroke='black',
                                      stroke_width=1)
                self.add(line).dasharray(self.dasharray)

        if len(properties["labels"])>0:
          for l in range(len(properties["labels"])):
            self.draw_label(properties["labels"][l])

    def draw_label(self, label):
      title = sw.text.Text(insert=(float(label["x"]), float(label["y"])+20),
                           text=label["name"],
                           style=self.style)

      pprint.pprint(label)

      self.add(title)

    def draw_arrow(self, connector, p1, p2):
        # No arrow figure required
        if connector == "anchor" or connector == "association":
            return
        # simple figure
        if connector == "dependency" or connector == "llsequence" or connector == "llreturn":
            self.draw_simple_arrow(p1,p2)
        if connector == "generalization":
            self.draw_triangle_arrow(p1,p2)
        if connector == "composition":
            self.draw_romb_arrow(p1,p2, "black")
        if connector == "aggregation":
            self.draw_romb_arrow(p1,p2, "white")

    def draw_triangle_arrow(self, p1, p2):
        (x1, y1) = p1
        (x2, y2) = p2
        x = 10
        dx = x2 -x1
        dy = y2 -y1
        gip = math.sqrt(dx*dx + dy*dy)

        if gip<x:
          return

        sina = dy/gip
        cosa = dx/gip
        x3 = x2 - math.sqrt(x*x*3/4)*cosa
        y3 = y2 - math.sqrt(x*x*3/4)*sina
        x6 = x1 - math.sqrt(x*x*3)*cosa
        y6 = y1 - math.sqrt(x*x*3)*sina
        x4 = x3 + x * sina/2
        y4 = y3 - x * cosa/2
        x5 = x3 - x * sina/2
        y5 = y3 + x * cosa/2

        line = sw.shapes.Line(start=p1,
                              end=(x3,y3),
                              stroke='black',
                              stroke_width=1)
        # keep dash style for the line, but not end figure
        self.add(line).dasharray(self.dasharray)

        # Draw the figure !
        poly = sw.shapes.Polyline([(x3,y3),(x4,y4),(x2,y2),(x5,y5),(x3,y3)],
                              stroke='black',
                              fill="white",
                              stroke_width=1)
        self.add(poly)

    def draw_romb_arrow(self, p1, p2, color):
      (x1, y1) = p1
      (x2, y2) = p2
      x = 10
      dx = x2 -x1
      dy = y2 -y1
      gip = math.sqrt(dx*dx + dy*dy)

      if gip<x:
        return

      sina = dy/gip
      cosa = dx/gip
      x3 = x2 - math.sqrt(x*x*3/4)*cosa
      y3 = y2 - math.sqrt(x*x*3/4)*sina
      x6 = x2 - math.sqrt(x*x*3)*cosa
      y6 = y2 - math.sqrt(x*x*3)*sina
      x4 = x3 + x * sina/2
      y4 = y3 - x * cosa/2
      x5 = x3 - x * sina/2
      y5 = y3 + x * cosa/2

      # draw line partially to the up to the figure
      line = sw.shapes.Line(start=p1,
                            end=(x6,y6),
                            stroke='black',
                            stroke_width=1)
      self.add(line)

      # Draw the romb figure
      poly = sw.shapes.Polygon([(x6,y6),(x4,y4),(x2,y2),(x5,y5),(x6,y6)],
                               stroke='black',
                               fill=color,
                               stroke_width=1)
      self.add(poly)

    def draw_nested_arraw(self, p1, p2):
      (x1, y1) = p1
      (x2, y2) = p2
      x = 10
      dx = x2 -x1
      dy = y2 -y1
      gip = math.sqrt(dx*dx + dy*dy)

      if gip<x:
        return

      sina = dy/gip
      cosa = dx/gip
      z = x-3
      x3 = x2 - math.sqrt(x*x*3/4)*cosa
      y3 = y2 - math.sqrt(x*x*3/4)*sina
      x6 = x2 - math.sqrt(x*x*3)*cosa
      y6 = y2 - math.sqrt(x*x*3)*sina
      x4 = x3 + z * sina/2
      y4 = y3 - z * cosa/2
      x5 = x3 - z * sina/2
      y5 = y3 + z * cosa/2
      x31 = x2 - math.sqrt(z*z*3/4)*cosa
      y31 = y2 - math.sqrt(z*z*3/4)*sina
      x61 = x2 - math.sqrt(z*z*3)*cosa
      y61 = y2 - math.sqrt(z*z*3)*sina

      # draw line partially to the up to the figure
      line = sw.shapes.Line(start=p1,
                            end=(x6,y6),
                            stroke='black',
                            stroke_width=1)
      self.add(line)

      circle = sw.shapes.Circle(center=(x3,y3), r=x(0.5))
      self.add(circle)

      line = sw.shapes.Line(start=(x4, y4),
                            end=(x5,y5),
                            stroke='black',
                            stroke_width=1)
      self.add(line)

      line = sw.shapes.Line(start=(x31, y31),
                            end=(x61,y61),
                            stroke='black',
                            stroke_width=1)
      self.add(line)

    def draw_simple_arrow(self, p1, p2):
        # draw an arrow
        (x1, y1) = p1
        (x2, y2) = p2
        length = ((x1 - x2)**2 + (y2 - y1)**2)**0.5
        vec = ((x1 - x2) / length, (y1 - y2) / length)
        arrow = (vec[0] * math.cos(self.angle) +
                vec[1] * math.sin(-self.angle),
                vec[0] * math.sin(self.angle) +
                vec[1] * math.cos(self.angle))
        arrow_dots = (x2 + arrow[0] * self.arrow_length,
                      y2 + arrow[1] * self.arrow_length)
        line = sw.shapes.Line(start=p2,
                              end=arrow_dots,
                              stroke='black', stroke_width=1)
        self.add(line)
        arrow = (vec[0] * math.cos(-self.angle) +
                 vec[1] * math.sin(self.angle),
                 vec[0] * math.sin(-self.angle) +
                vec[1] * math.cos(-self.angle))
        arrow_dots = (x2 + arrow[0] * self.arrow_length,
                      y2 + arrow[1] * self.arrow_length)
        line = sw.shapes.Line(start=p2,
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
            #pprint.pprint(self.json_data)

    def load_data(self, contents):
        self.json_data = json.loads(contents)

    def dump(self, filename):
        """Convert JSON to SVG."""
        dwg = sw.Drawing(filename=filename, debug=True)
        elements = {}

        if self.json_data.get("elements") != None:
          for element in self.json_data["elements"]:
            print element["type"]
            if element["type"] == "class":
                svg_class = SVGClass(element)
                elements[element["id"]] = svg_class
                dwg.add(svg_class)

        if self.json_data.get("connectors"):
          for connector in self.json_data["connectors"]:
            start = elements[connector["fromId"]]
            end = elements[connector["toId"]]
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
    input_file = options.input_file
    output_file = options.output_file
    #input_file = "test.json"
    #output_file = "test.svg"
    converter.load(input_file)
    #contents = r"""{"type":"class","name":"classDiagram"}"""
    #converter.load_data(contents)
    converter.dump(output_file)
