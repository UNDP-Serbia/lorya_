
import os
import shutil
import json
import argparse

from PIL import Image, ImageEnhance

INPUT_DIR = "input"
OUTPUT_DIR = "output"

def adjust_contrast(input_params):
    """
    Apply contrast enhancement to an input image.

    Parameters:
        input_params (obj): 
            imageId (str): Unique image identifier. 
            inputPath (str): Path to the input image.
            outputPath (str): Path to the rotated image.
            contrast (float): Contrast factor
                                1.0 - original image
                                > 1 - higher contrast
                                < 1 - lower contrast
    
    Returns:
        JSON with status report and path to the processed image.
    """


    # Read from input params
    image_id = input_params["imageId"]
    input_image_path = input_params["inputPath"]
    output_image_path = input_params["outputPath"]
    contrast_param = input_params["contrast"]

    # Adjust image
    with Image.open(input_image_path) as im:
        enhancer = ImageEnhance.Contrast(im)
        im_contrast = enhancer.enhance(contrast_param)
        im_contrast.save(output_image_path)

    # Prepare output
    output = {
        "imageId": image_id, 
        "inputPath": input_image_path,
        "outputPath": output_image_path,
        "contrast": contrast_param,

        "status": {
            "success": True,
            "action": "ContrastAdjusment",
            "messageCode": "PROCESSING_SUCCESS",
            "messageText": "Image constrast changed successfully."
        }
    }

    return json.dumps(output)


if __name__ == "__main__":
    
    parser = argparse.ArgumentParser(description="Script that applies contrast enhancement to an input image")
    parser.add_argument("image_id",  help="Unique image identifier")
    parser.add_argument("input_image_path",  help="Path to the input image")
    parser.add_argument("contrast_param", type=float, help="Contrast factor")
    parser.add_argument("output_image_path", help="Path where the processed image will be saved")


    args = parser.parse_args()

    adjust_contrast_status = adjust_contrast({
        "imageId": args.image_id, 
        "inputPath": args.input_image_path, 
        "contrast": args.contrast_param,
        "outputPath": args.output_image_path
    })

    print(adjust_contrast_status)

    # test run:
    # python adjust_contrast.py "1" "input/zena-i-svet-decembar-1931-15.jpg" 1.8 "output/zena-i-svet-decembar-1931-15-contrast.jpg"
    