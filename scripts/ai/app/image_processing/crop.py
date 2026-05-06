import os
import shutil
import json
import argparse

from PIL import Image

INPUT_DIR = "input"
OUTPUT_DIR = "output"

def crop(input_params): 
    """
    Crop an image using top-left and bottom-right coordinates.

    Parameters:
        input_params (obj): 
            imageId (str): Unique image identifier. 
            inputPath (str): Path to the input image.
            outputPath (str): Path to the cropped image.
            top_left_coordinate (tuple(int, int)): (x, y) coordinates - top-left corner
            bootom_right_coordinate (tuple(int, int)): (x, y) coordinates - bottom-right corner
    
    Returns:
        JSON with status report and path to the processed image.
    """
    
    # Read from input params
    image_id = input_params['imageId']
    input_image_path = input_params['inputPath']
    output_image_path = input_params['outputPath']
    
    x1, y1 = input_params['topLeft']['x'], input_params['topLeft']['y']
    x2, y2 = input_params['bottomRight']['x'], input_params['bottomRight']['y']
    
    # Open image
    image = Image.open(input_image_path)

    # Create crop box: a 4-tuple defining the left, upper, right, and lower pixel coordinate
    crop_box = (x1, y1, x2, y2)

    # Crop image
    image_cropped = image.crop(crop_box)
    image_cropped.save(output_image_path)

    # Prepare output
    output = {
        "imageId": image_id, 
        "inputPath": input_image_path,
        "outputPath": output_image_path,

        "status": {
            "success": True,
            "action": "Cropping",
            "messageCode": "PROCESSING_SUCCESS",
            "messageText": "Image successfully cropped"
        }
    }

    return json.dumps(output)


if __name__ == "__main__":
    
    parser = argparse.ArgumentParser(description="Script that crops an input image")
    parser.add_argument("image_id",  help="Unique image identifier")
    parser.add_argument("input_image_path",  help="Path to the input image")
    
    parser.add_argument("x1", type=int, help="Top left x-coordinate")
    parser.add_argument("y1", type=int, help="Top left y-coordinate")

    parser.add_argument("x2", type=int, help="Bottom right x-coordinate")
    parser.add_argument("y2", type=int, help="Bottom right y-coordinate")

    parser.add_argument("output_image_path", help="Path where the processed image will be saved")

    args = parser.parse_args()

    cropping_status = crop({
        "imageId": args.image_id, 
        "inputPath": args.input_image_path, 
        "topLeft": {
            "x": args.x1, 
            "y": args.y1
        },
        "bottomRight": {
            "x": args.x2, 
            "y": args.y2
        },
        "outputPath": args.output_image_path
    })

    print(cropping_status)

    # test run:
    # python crop.py "1" "input/zena-i-svet-decembar-1931-15.jpg" 0 0 400 500 "output/zena-i-svet-decembar-1931-15-cropped.jpg"
    