import os
import warnings

import numpy as np
import pandas as pd

import json
import argparse

warnings.filterwarnings("ignore")

from PIL import Image

import pytesseract

tesseract_lang = "srp"
tesseract_script = "cyrillic"

def parse_image(input_params): 
    """
    Parse image and extract text from it.

    Parameters:
        input_params (obj): 
            imageId (str): Unique image identifier. 
            inputPath (str): Path to the input image.
    
    Returns:
        JSON with status report including line-segmented text with statistics.
    """

    # Read from input params
    image_id = input_params["imageId"]
    input_image_path = input_params["inputPath"]
    
    # Open image
    image = Image.open(input_image_path)

    # Run tesseract
    ocr_output = pytesseract.image_to_data(image, lang=tesseract_lang, output_type="data.frame")

    # Read OCR data
    ocr_output_parsed = [] 

    line_ids = ocr_output['line_num'].unique()
    if 0 in line_ids: 
        line_ids = line_ids[1:]

    for line_id in line_ids: 
        line = {} 
        line['line_id'] = str(line_id)
        line['words'] = [] 

        word_ids = ocr_output[(ocr_output['line_num']==line_id) & (ocr_output['conf']!=-1)]['word_num'].values
        word_confidences = ocr_output[(ocr_output['line_num']==line_id) & (ocr_output['conf']!=-1)]['conf'].values
        word_texts = ocr_output[(ocr_output['line_num']==line_id) & (ocr_output['conf']!=-1)]['text'].values
        
        for (word_id, word_confidence, word_text) in zip(word_ids, word_confidences, word_texts):
            word = {
                "word_id": str(word_id),
                "word_confidence": word_confidence,
                "word_text": word_text
            }
            line['words'].append(word)

        ocr_output_parsed.append(line)

    # Calculate OCR statistics
    valid_confidences = ocr_output[(ocr_output['conf']!=-1)]['conf'].values
    avg_word_confidence = float(np.average(valid_confidences)) if len(valid_confidences) > 0 else 0.0

    statistics = {
        "avg_word_confidence": avg_word_confidence
    }

    # Prepare output
    output = {
        "imageId": image_id, 
        "inputPath": input_image_path,

        "status": {
            "success": True,
            "messageCode": "PROCESSING_SUCCESS",
            "messageText": "Text is successfully OCRed."
        }, 

        "lang": tesseract_lang,
        "script": tesseract_script,
        "lines": ocr_output_parsed,
        "statistics": statistics
    }

    return json.dumps(output, ensure_ascii=False)


if __name__ == "__main__":
    
    parser = argparse.ArgumentParser(description="Script that runs the Tesseract over the provided image")
    parser.add_argument("image_id",  help="Unique image identifier")
    parser.add_argument("input_image_path",  help="Path to the input image")
    
    args = parser.parse_args()

    ocr_results = parse_image({
        "imageId": args.image_id, 
        "inputPath": args.input_image_path, 
    })

    print(ocr_results)

    # test run:
    # python run_tesseract.py "1" "input/cropped_zena-i-svet-decembar-1931-15_image_16.jpg"
    