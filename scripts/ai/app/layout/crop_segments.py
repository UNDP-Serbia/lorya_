import os
import json
import argparse
import logging

import cv2


def crop_segments(image_path, segments_info, output_dir):
    
    # Create the output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)

    # Read the image using OpenCV
    image = cv2.imread(image_path)
    image_height, image_width = image.shape[:2]

    # Load segments info
    segments = json.loads(segments_info)    
    number_of_segments = len(segments)

    # Crop segments
    cropped_segments = []
    number_of_cropped_segments = 0

    for segment in segments:
        x1 = int(segment['boundingBox']['x1']) 
        y1 = int(segment['boundingBox']['y1'])
        x2 = int(segment['boundingBox']['x2'])
        y2 = int(segment['boundingBox']['y2'])

        # print(x1, y1, x2, y2)
            
        # Validate bounding box coordinates
        if not (0 <= x1 < x2 <= image_width) or not (0 <= y1 < y2 <= image_height):
            continue

        # Crop the segment using the exact bounding box
        cropped_segment = image[y1:y2, x1:x2]

        # Save the cropped segment to the output directory
        segment_id = segment['id']
        output_path = os.path.join(output_dir, f"cropped_{os.path.splitext(os.path.basename(image_path))[0]}_image_{segment_id}.jpg")
        cropping_segment_status = cv2.imwrite(output_path, cropped_segment)
        
        if cropping_segment_status:
            number_of_cropped_segments = number_of_cropped_segments + 1

            cropped_segment = {
                "id": segment_id, 
                "label": segment['label'],
                "labelType": segment['labelType'],
                "boundingBox": {
                  "x1": x1, 
                  "y1": y1, 
                  "x2": x2,
                  "y2": y2
                },
                "outputPath": output_path
            }
            
            cropped_segments.append(cropped_segment)

    number_of_skipped_segments = number_of_segments - number_of_cropped_segments

    status = {
        "success": True,
        "messageCode": "SUCCESS",
        "messageText": "Segments are successfully cropped.",
        "numberOfCroppedSegments": str(number_of_cropped_segments),
        "numberOfSkippedSegments": str(number_of_skipped_segments),
    }

    result = {
        "status": status,
        "segments": cropped_segments
    }

    return json.dumps(result)


if __name__ == "__main__":
    
    parser = argparse.ArgumentParser(description="Script that crops image segments")
    parser.add_argument("input_image_path",  help="Path to the input image")
    parser.add_argument("segments_info",  help="JSON formatted string with bounding boxes info")
    parser.add_argument("output_dir_path",  help="Path to the output directory with cropped segments")

    args = parser.parse_args()

    results = crop_segments(args.input_image_path, args.segments_info, args.output_dir_path)

    print(results)

    # test run:
    # python crop_segments.py "input/zena-i-svet-decembar-1931-15.jpg" "[{\"id\": \"1\", \"label\": \"Text\", \"labelType\": \"text\", \"boundingBox\": {\"x1\": 146.09, \"y1\": 399.39, \"x2\": 1077.96, \"y2\": 1328.23}}, {\"id\": \"2\", \"label\": \"Picture\", \"labelType\": \"non-text\", \"boundingBox\": {\"x1\": 1172.13, \"y1\": 835.35, \"x2\": 1680.29, \"y2\": 1010.75}}]" "output/segments/zena-i-svet-decembar-1931-15"

