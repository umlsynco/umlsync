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
        x = properties["pageX"]
        y = properties["pageY"]
        width = properties["width"]
        height = properties["height"]
        body = sw.shapes.Rect(insert=(x, y),
                              size=(width, height),
                              fill='white', stroke='black', stroke_width=1)
        caption = sw.shapes.Rect(insert=(x, y),
                                 size=(width, 10),
                                 fill='white', stroke='black', stroke_width=1)
        self.add(caption)
        self.add(body)


class CustomJSONtoSVGConverter:
    def __init__(self):
        pass

    def load(self, filename):
        """Read and parse JSON file."""
        with open(filename) as f:
            self.json_data = json.load(f)

    def dump(self, filename):
        """Convert JSON to SVG."""
        dwg = sw.Drawing(filename=filename, debug=True)
        for element in self.json_data["elements"]:
            if element["type"] == "class":
                svg_class = SVGClass(element)
                dwg.add(svg_class)
        dwg.save()


if __name__ == '__main__':
    converter = CustomJSONtoSVGConverter()
    converter.load("test.json")
    converter.dump("test.svg")
