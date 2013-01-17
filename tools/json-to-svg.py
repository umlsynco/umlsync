"""
Custom JSON to SVG converter.
"""
import svgwrite


class CustomJSONtoSVGConverter:
    def __init__(self):
        pass

    def open(self, filename):
        """Read and parse JSON file."""
        pass

    def run(self, parameters=""):
        """Convert."""
        print("Converting...")

    def dump(self, filename):
        """Dump SVG to file."""
        pass


if __name__ == '__main__':
    converter = CustomJSONtoSVGConverter()
    converter.open("test.json")
    converter.run()
    converter.dump("test.svg")