import os
import shutil
import json
import argparse

from PIL import Image, ImageEnhance

INPUT_DIR = "input"
OUTPUT_DIR = "output"

def adjust_sharpness(input_params):
    """
    Apply sharpness enhancement to an input image.

    Parameters:
        input_params (obj): 
            imageId (str): Unique image identifier. 
            inputPath (str): Path to the input image.
            outputPath (str): Path to the rotated image.
            sharpness (float): Sharpness factor
                               1.0 - original image
                               > 1 - more sharp
                               < 1 - more blurry
    
    Returns:
        JSON with status report and path to the processed image.
    """


    # Read from input params
    image_id = input_params["imageId"]
    input_image_path = input_params["inputPath"]
    output_image_path = input_params["outputPath"]
    sharpness_param = input_params["sharpness"]


    # Adjust image
    with Image.open(input_image_path) as im:
        enhancer = ImageEnhance.Sharpness(im)
        im_sharpness = enhancer.enhance(sharpness_param)
        im_sharpness.save(output_image_path)

    # Prepare output
    output = {
        "imageId": image_id, 
        "inputPath": input_image_path,
        "outputPath": output_image_path,
        "sharpness": sharpness_param,

        "status": {
            "success": True,
            "action": "SharpnessAdjusment",
            "messageCode": "PROCESSING_SUCCESS",
            "messageText": "Image sharpness changed successfully."
        }
    }

    return json.dumps(output)

if __name__ == "__main__":
    
    parser = argparse.ArgumentParser(description="Script that applies sharpness enhancement to an input image")
    parser.add_argument("image_id",  help="Unique image identifier")
    parser.add_argument("input_image_path",  help="Path to the input image")
    parser.add_argument("sharpness_param", type=float, help="Sharpness factor")
    parser.add_argument("output_image_path", help="Path where the processed image will be saved")

    args = parser.parse_args()

    adjust_sharpness_status = adjust_sharpness({
        "imageId": args.image_id, 
        "inputPath": args.input_image_path, 
        "sharpness": args.sharpness_param,
        "outputPath": args.output_image_path
    })

    print(adjust_sharpness_status)

    # test run:
    # python adjust_sharpness.py "1" "input/zena-i-svet-decembar-1931-15.jpg" 1.7 "output/zena-i-svet-decembar-1931-15-sharpness.jpg"
    