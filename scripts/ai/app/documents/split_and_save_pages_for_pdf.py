import os
import shutil
import json
import argparse

from pdf2image import convert_from_path


INPUT_DIR = "input"
OUTPUT_DIR = "output"
STATUS_DIR = "status"


def split_and_save_pages_for_pdf(input_dir_path, pdf_file_name, output_dir_path, exit_status_dir_path): 

    # initial exit status
    exit_status = {
        "success": True,
        "message": "Successfully completed pdf splitting."
    }
    exit_status_file = os.path.join(exit_status_dir_path, "exit_status.json")
    
    # get the file name data
    file_name_without_extension = pdf_file_name[0: pdf_file_name.index(".pdf")]
    file_path = os.path.join(input_dir_path, pdf_file_name)

    # split pages
    pages = convert_from_path(file_path)
    number_of_pages = len(pages)

    # prepare folder to save pages
    pages_folder_path = os.path.join(output_dir_path, "pages")
    os.makedirs(pages_folder_path, exist_ok=True)
    for file_name in os.listdir(pages_folder_path):
        file_path = os.path.join(pages_folder_path, file_name)
        try:
            if os.path.isfile(file_path) or os.path.islink(file_path):
                os.unlink(file_path)
        except Exception as e:
            exit_status["success"] = False
            exit_status["message"] = f"Failed to delete {file_path}. Reason: {e}"
            with open(exit_satus_file, "r") as file: 
                json.dump(exit_status, file)
            return

    #save pages
    for i in range(1, number_of_pages): 
        if i<10:
            page_identification = "0" + str(i)
        else:
            page_identification = str(i)

        page_path = os.path.join(pages_folder_path, f"{file_name_without_extension}-{page_identification}.jpg")
        pages[i].save(page_path) 


    # save exit status
    exit_status["number_of_pages"] = number_of_pages
    with open(exit_status_file, "w") as file: 
        json.dump(exit_status, file)


if __name__ == "__main__":
    
    parser = argparse.ArgumentParser(description="Script that splits provided PDF file into set of pages")
    parser.add_argument("input_dir_path",  help="Path to folder that contains PDF file")
    parser.add_argument("pdf_file_name", help="PDF file name")
    parser.add_argument("output_dir_path", help="Path to folder where PDF pages organized into pages folder will be saved")
    parser.add_argument("exit_status_dir_path", help="Path to folder where exit_status.json file with execution info will be saved")


    args = parser.parse_args()

    split_and_save_pages_for_pdf(args.input_dir_path, args.pdf_file_name, args.output_dir_path, args.exit_status_dir_path)

    # test run:
    # python split_and_save_pages_for_pdf.py "input" "zena-i-svet-decembar-1931.pdf" "output" "status"
    