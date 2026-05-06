import os
import json
import argparse
import logging



from ultralytics import YOLO
from ultralytics.utils.plotting import Annotator, Colors

current_dir = os.path.dirname(os.path.abspath(__file__))
layout_model_path = os.path.join(current_dir, "./models/yolo/yolov8m-doclaynet.pt")
layout_model = YOLO(layout_model_path, verbose=False)

logging.getLogger('ultralytics').setLevel(logging.WARNING)

def get_segments_info(result):

    segments = []
    
    label_names = {
        0: 'Caption',
        1: 'Footnote',
        10: 'Title',
        2: 'Formula',
        3: 'List-item',
        4: 'Page-footer',
        5: 'Page-header',
        6: 'Picture',
        7: 'Section-header',
        8: 'Table',
        9: 'Text'
    }
    
    text_based_labels = [0, 1, 10, 3, 4, 5, 7, 9]

    yolo_segment_id = 1
    for label, box, conf in zip(result.boxes.cls.tolist(), result.boxes.xyxy.tolist(), result.boxes.conf.tolist()):
        segment_id = yolo_segment_id
        
        label = int(label)
        label_name = label_names[label]
        label_type = "text" if label in text_based_labels else "non-text"
        
        x1 = box[0]
        y1 = box[1]
        x2 = box[2]
        y2 = box[3]

        confidence_score = conf

        segment = {
            "id": str(segment_id), 
            "label": label_name,
            "labelType": label_type,
            "confidence": confidence_score,
            "boundingBox": {
                "x1": x1, 
                "y1": y1, 
                "x2": x2,
                "y2": y2
            }
        }
        segments.append(segment)
        yolo_segment_id = yolo_segment_id + 1

    return segments


def process_image(image_id, image_path, layout_model):

    model_output = layout_model(image_path)[0]

    segments_info = get_segments_info(model_output)
    
    status = {
        "success": True,
        "messageCode": "SUCCESS",
        "messageText": "Image is successfully segmented."
    }

    result = {
        "imageId": image_id,
        "status": status,
        "segments": segments_info
    }

    return json.dumps(result)


if __name__ == "__main__":
    
    parser = argparse.ArgumentParser(description="Script that runs YOLOv8 segmentation model over an input image")
    parser.add_argument("image_id",  help="Unique image identifier")
    parser.add_argument("input_image_path",  help="Path to the input image")

    args = parser.parse_args()

    results = process_image(args.image_id, args.input_image_path, layout_model)

    print(results)

    # test run:
    # python run_yolo.py "1" "input/zena-i-svet-decembar-1931-15.jpg"