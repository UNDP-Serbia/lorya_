import json
import xml.etree.ElementTree as ET
from xml.dom import minidom

from read_data_from_db import get_data_from_db

import argparse

def prettify_xml(elem):
    rough = ET.tostring(elem, "utf-8")
    reparsed = minidom.parseString(rough)
    return reparsed.toprettyxml(indent="  ")


def bbox_to_attrs(bbox):
    x1, y1, x2, y2 = bbox
    return {
        "HPOS": str(x1),
        "VPOS": str(y1),
        "WIDTH": str(x2 - x1),
        "HEIGHT": str(y2 - y1)
    }


def create_alto_format(data, page_width=2000, page_height=3000):

    alto = ET.Element("alto")

    layout = ET.SubElement(alto, "Layout")

    page = ET.SubElement(layout, "Page", {
        "WIDTH": str(page_width),
        "HEIGHT": str(page_height),
        "PHYSICAL_IMG_NR": "1"
    })

    printspace = ET.SubElement(page, "PrintSpace", {
        "HPOS": "0",
        "VPOS": "0",
        "WIDTH": str(page_width),
        "HEIGHT": str(page_height)
    })


    for i, block in enumerate(data):

        segment_id = block["segment_id"]
        bbox = block["bbox"]
        lines = block["lines"]
        layout_confidence = block["layout_confidence"]

        block_attrs = bbox_to_attrs(bbox)

        text_block = ET.SubElement(printspace, "TextBlock", {
            "ID": f"block_{i}",
            **block_attrs
        })

        x1, y1, x2, y2 = bbox
        block_width = x2 - x1
        block_height = y2 - y1

        if len(lines) == 0:
            line_height = 0 
        else:
            line_height = block_height / len(lines)

        for j, line_text in enumerate(lines):

            line_y = int(y1 + j * line_height)

            line_attrs = {
                "HPOS": str(x1),
                "VPOS": str(line_y),
                "WIDTH": str(block_width),
                "HEIGHT": str(int(line_height))
            }

            text_line = ET.SubElement(text_block, "TextLine", line_attrs)

            words = line_text.split()
            x_cursor = x1

            for k, word in enumerate(words):

                word_width = max(20, len(word) * 10)

                ET.SubElement(text_line, "String", {
                    "ID": f"b{i}_l{j}_w{k}",
                    "CONTENT": word,
                    "HPOS": str(x_cursor),
                    "VPOS": str(line_y),
                    "WIDTH": str(word_width),
                    "HEIGHT": str(int(line_height)),
                    # "WC": str(confidence)
                })

                x_cursor += word_width + 8

    xml_output = prettify_xml(alto)

    return xml_output


if __name__ == "__main__":

    parser = argparse.ArgumentParser(description="Script that creates ALTO file based on image segmentation and text blocks")
    parser.add_argument("file_data_json",  help="JSON with file id")
    
    args = parser.parse_args()

    file_data = json.loads(args.file_data_json)
    file_id = file_data['fileId']

    data = get_data_from_db(file_id)

    alto_content = create_alto_format(data)

    print(alto_content)

    # test run:
    # python export_to_alto.py '{"fileId": "2680af58-9817-4e54-9a01-f47d6fe02cba"}' 