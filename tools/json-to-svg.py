"""
Custom JSON to SVG converter.
"""
import json
import pprint
import svgwrite as sw


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
        shapes = dwg.add(dwg.g(id='shapes', fill='white'))
        for element in self.json_data["elements"]:
            if element["type"] == "class":
                #pprint.pprint(element)
                rect = dwg.rect(insert=(element["pageX"], element["pageY"]),
                                size=(element["width"], element["height"]),
                                fill='white', stroke='black', stroke_width=1)
                shapes.add(rect)
        dwg.save()


if __name__ == '__main__':
    converter = CustomJSONtoSVGConverter()
    converter.load("test.json")
    converter.dump("test.svg")
