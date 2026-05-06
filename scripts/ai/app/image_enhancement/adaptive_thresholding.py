
import os
import shutil
import json
import argparse

import cv2
from PIL import Image
import numpy as np

INPUT_DIR = "input"
OUTPUT_DIR = "output"

def adaptive_thresholding(input_params):
    """
    Load an image, convert it to grayscale, apply Otsu's thresholding,
    and save the binarized result to the provided path.

    Parameters:
        input_params (obj): 
            imageId (str): Unique image identifier. 
            inputPath (str): Path to the input image.
            outputPath (str): Path to the enhanced image.
            

    Returns:
        JSON with status report and path to the processed image.
    """

    # Read from input params
    image_id = input_params['imageId']
    input_image_path = input_params['inputPath']
    output_image_path = input_params['outputPath']

    # Load image using PIL and grayscale it
    pil_image = Image.open(input_image_path).convert("L")

    # Convert PIL to NumPy array
    np_image = np.array(pil_image).astype(np.uint8)

    # Adaptive thresholding (Gaussian)
    #   block_size (int): size of pixel neighborhood (must be odd)
    #   C (int): constant subtracted from mean
    block_size = 21 
    C = 10 
    thresh = cv2.adaptiveThreshold(
        np_image,
        maxValue=255,
        adaptiveMethod=cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        thresholdType=cv2.THRESH_BINARY,
        blockSize=block_size,
        C=C
    )

    # Convert back to PIL
    adaptive_pil = Image.fromarray(thresh)

    # Save result
    adaptive_pil.save(output_image_path)

    # Prepare output
    output = {
        "imageId": image_id, 
        "inputPath": input_image_path,
        "outputPath": output_image_path,

        "status": {
            "success": True,
            "action": "AdaptiveThresholding",
            "messageCode": "PROCESSING_SUCCESS",
            "messageText": "Image successfully thresholded."
        }
    }

    return json.dumps(output)

if __name__ == "__main__":
    
    parser = argparse.ArgumentParser(description="Script that performs adaptive thresholding to an input image")
    parser.add_argument("image_id",  help="Unique image identifier")
    parser.add_argument("input_image_path",  help="Path to the input image")
    parser.add_argument("output_image_path", help="Path where the processed image will be saved")


    args = parser.parse_args()

    adaptive_thresholding_status = adaptive_thresholding({
        "imageId": args.image_id, 
        "inputPath": args.input_image_path, 
        "outputPath": args.output_image_path
    })

    print(adaptive_thresholding_status)

    # test run:
    # python adaptive_thresholding.py "1" "input/zena-i-svet-decembar-1931-15.jpg" "output/zena-i-svet-decembar-1931-15-adaptive-thresholding.jpg"
    