
import os
import shutil
import json
import argparse

from PIL import Image, ImageEnhance

INPUT_DIR = "input"
OUTPUT_DIR = "output"

def adjust_brightness(input_params): 
    """
    Apply brightness enhancement to an input image.

    Parameters:
        input_params (obj): 
            imageId (str): Unique image identifier. 
            inputPath (str): Path to the input image.
            outputPath (str): Path to the rotated image.
            brightness (float): Brightness factor
                                1.0 - original image
                                > 1 - brighter
                                < 1 - darker
    
    Returns:
        JSON with status report and path to the processed image.
    """

    # Read from input params
    image_id = input_params["imageId"]
    input_image_path = input_params["inputPath"]
    output_image_path = input_params["outputPath"]
    brightness_param = input_params["brightness"]


    # Adjust image
    with Image.open(input_image_path) as im:
        enhancer = ImageEnhance.Brightness(im)
        im_brightness = enhancer.enhance(brightness_param)
        im_brightness.save(output_image_path)

    # Prepare output
    output = {
        "imageId": image_id, 
        "inputPath": input_image_path,
        "outputPath": output_image_path,
        "brightness": brightness_param,

        "status": {
            "success": True,
            "action": "BrightnessAdjusment",
            "messageCode": "PROCESSING_SUCCESS",
            "messageText": "Image brightness changed successfully."
        }
    }

    return json.dumps(output)


if __name__ == "__main__":
    
    parser = argparse.ArgumentParser(description="Script that applies brightness enhancement to an input image")
    parser.add_argument("image_id",  help="Unique image identifier")
    parser.add_argument("input_image_path",  help="Path to the input image")
    parser.add_argument("brightness_param", type=float, help="Brightness factor")
    parser.add_argument("output_image_path", help="Path where the processed image will be saved")


    args = parser.parse_args()

    adjust_brightness_status = adjust_brightness({
        "imageId": args.image_id, 
        "inputPath": args.input_image_path, 
        "brightness": args.brightness_param,
        "outputPath": args.output_image_path
    })

    print(adjust_brightness_status)

    # test run:
    # python adjust_brightness.py "1" "input/zena-i-svet-decembar-1931-15.jpg" 0.8 "output/zena-i-svet-decembar-1931-15-brightness.jpg"
    