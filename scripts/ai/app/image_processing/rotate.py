import os
import shutil
import json
import argparse

from PIL import Image

INPUT_DIR = "input"
OUTPUT_DIR = "output"

def rotate(input_params): 
    """
    Rotate an image and save the result to the provided path.

    Parameters:
        input_params (obj): 
            imageId (str): Unique image identifier. 
            inputPath (str): Path to the input image.
            outputPath (str): Path to the rotated image.
            angle (float): Rotation angle in degrees (positive = counterclockwise)
    
    Returns:
        JSON with status report and path to the processed image.
    """

    # Read from input params
    image_id = input_params["imageId"]
    input_image_path = input_params["inputPath"]
    output_image_path = input_params["outputPath"]
    angle = input_params["angle"]

    # Open image
    image = Image.open(input_image_path)

    # Choose correct fillcolor based on image mode
    if image.mode == "L":
        fillcolor = 255
    elif image.mode == "RGB":
        fillcolor = (255, 255, 255)
    else:
        fillcolor = 255

    # Rotate around image center (default behavior in PIL)
    rotated = image.rotate(
        angle,
        resample=Image.BILINEAR,
        expand=True,    # avoid cropping
        fillcolor=fillcolor     # background color
    )

    # Save rotated image
    rotated.save(output_image_path)


    # Prepare output
    output = {
        "imageId": image_id, 
        "inputPath": input_image_path,
        "outputPath": output_image_path,

        "status": {
            "success": True,
            "action": "Rotation",
            "messageCode": "PROCESSING_SUCCESS",
            "messageText": "Image successfully rotated."
        }
    }

    return json.dumps(output)


if __name__ == "__main__":
    
    parser = argparse.ArgumentParser(description="Script that rotates an input image")
    parser.add_argument("image_id",  help="Unique image identifier")
    parser.add_argument("input_image_path",  help="Path to the input image")
    parser.add_argument("angle", type=float, help="Rotation angle in degrees (positive = counterclockwise)")
    parser.add_argument("output_image_path", help="Path where the processed image will be saved")

    args = parser.parse_args()

    rotation_status = rotate({
        "imageId": args.image_id, 
        "inputPath": args.input_image_path, 
        "angle": args.angle,
        "outputPath": args.output_image_path
    })

    print(rotation_status)

    # test run:
    # python rotate.py "1" "input/zena-i-svet-decembar-1931-15.jpg" 30 "output/zena-i-svet-decembar-1931-15-rotated.jpg"
    