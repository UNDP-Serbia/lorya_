import os
import shutil
import json
import argparse

from PIL import Image, ImageEnhance

INPUT_DIR = "input"
OUTPUT_DIR = "output"

def adjust_all(input_params):
    """
    Apply brightness, contrast, and sharpness enhancements to an input image and save result to the provided path.

    Parameters:
        input_params (obj): 
            imageId (str): Unique image identifier. 
            inputPath (str): Path to the input image.
            outputPath (str): Path to the rotated image.
            brightness_param (float): Brightness factor
            contrast_param (float): Contrast factor
            sharpness_param (float): Sharpness factor

    
    Returns:
        JSON with status report and path to the processed image.
    """

    # Read from input params
    image_id = input_params["imageId"]
    input_image_path = input_params["inputPath"]
    output_image_path = input_params["outputPath"]
    brightness_param = input_params["brightness"]
    contrast_param = input_params["contrast"]
    sharpness_param = input_params["sharpness"]

    # Open image
    with Image.open(input_image_path) as im:
        
        # Enhance brightness
        enhancer = ImageEnhance.Brightness(im)
        im_brightness = enhancer.enhance(brightness_param)

        # Enhance contrast 
        enhancer = ImageEnhance.Contrast(im_brightness)
        im_contrast = enhancer.enhance(contrast_param)

        # Enhance sharpness
        enhancer = ImageEnhance.Sharpness(im_contrast)
        im_sharpness = enhancer.enhance(sharpness_param)

        # Save image
        im_sharpness.save(output_image_path)

    
    # Prepare output
    output = {
        "imageId": image_id, 
        "inputPath": input_image_path,
        "outputPath": output_image_path,
        "brightness": brightness_param,
        "contrast": contrast_param,
        "sharpness": sharpness_param,
    
        "status": {
            "success": True,
            "action": "ImageAdjustment",
            "messageCode": "PROCESSING_SUCCESS",
            "messageText": "Image successfully adjusted."
        }
    }

    return json.dumps(output)

if __name__ == "__main__":
    
    parser = argparse.ArgumentParser(description="Script that enhance brightness, contrast and sharpness of the input image")
    parser.add_argument("image_id",  help="Unique image identifier")
    parser.add_argument("input_image_path",  help="Path to the input image")
    parser.add_argument("brightness_param", type=float, help="Brightness factor")
    parser.add_argument("contrast_param", type=float, help="Contrast factor")
    parser.add_argument("sharpness_param", type=float, help="Sharpness factor")
    
    parser.add_argument("output_image_path", help="Path where the processed image will be saved")

    args = parser.parse_args()

    adjust_all_status = adjust_all({
        "imageId": args.image_id, 
        "inputPath": args.input_image_path, 
        "brightness": args.brightness_param, 
        "contrast": args.contrast_param, 
        "sharpness": args.sharpness_param,
        "outputPath": args.output_image_path
    })

    print(adjust_all_status)

    # test run:
    # python adjust_all.py "1" "input/zena-i-svet-decembar-1931-15.jpg" 0.8 0.5 0.5 "output/zena-i-svet-decembar-1931-15-adjusted.jpg"
    